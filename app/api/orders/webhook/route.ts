import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // 1. Read raw body (required for HMAC verification)
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  // 2. Verify webhook signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  // Timing-safe comparison prevents signature oracle attacks
  let signatureValid = false;
  try {
    signatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    // Buffer lengths differ — forged or malformed signature
  }

  if (!signatureValid) {
    console.error("[webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Parse payload
  let payload: {
    event: string;
    payload: {
      payment: {
        entity: {
          id: string;
          order_id: string;
          status: string;
        };
      };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Handle payment failure — mark order as failed so it doesn't sit as pending forever
  if (payload.event === "payment.failed") {
    const failedRazorpayOrderId = payload.payload.payment.entity.order_id;
    if (failedRazorpayOrderId) {
      await createServiceClient()
        .from("orders")
        .update({ payment_status: "failed", status: "cancelled" })
        .eq("razorpay_order_id", failedRazorpayOrderId)
        .eq("payment_status", "pending");
      console.log("[webhook] Payment failed, order cancelled:", failedRazorpayOrderId);
    }
    return NextResponse.json({ received: true });
  }

  if (payload.event !== "payment.captured") {
    // Event type we don't handle — acknowledge and move on
    return NextResponse.json({ received: true });
  }

  const { id: paymentId, order_id: razorpayOrderId } = payload.payload.payment.entity;

  // 4. Use service client (bypasses RLS — no user cookie in webhook context)
  const supabase = createServiceClient();

  // 5. Fetch order by Razorpay order ID
  const { data: order } = await supabase
    .from("orders")
    .select("id, payment_status, user_id")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();

  if (!order) {
    console.error("[webhook] Order not found for razorpay_order_id:", razorpayOrderId);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // 6. Idempotency check — already processed by verifyPayment action
  if (order.payment_status === "paid") {
    return NextResponse.json({ received: true, note: "already_processed" });
  }

  // 7. Mark order as paid — only if still pending (atomic guard against duplicate processing)
  // Using .select() so we know whether this call actually owned the update.
  // If verifyPayment already processed this, the update matches 0 rows → data is null.
  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      payment_id: paymentId,
    })
    .eq("id", order.id)
    .eq("payment_status", "pending")
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("[webhook] Failed to update order:", updateError.message);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 8. Decrement stock only if this call owned the update — prevents double decrement with verifyPayment
  if (updatedOrder) {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", order.id);

    if (orderItems) {
      for (const item of orderItems) {
        try {
          await supabase.rpc("decrement_stock", {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });
        } catch (err) {
          // Log but do not fail — payment already captured
          console.error("[webhook] Stock decrement failed:", item.product_id, err);
        }
      }
    }
  }

  // 9. Clear the user's cart
  if (order.user_id) {
    await supabase.from("cart_items").delete().eq("user_id", order.user_id);
  }

  console.log("[webhook] Order processed:", order.id);
  return NextResponse.json({ received: true });
}
