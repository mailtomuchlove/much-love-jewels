import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";

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
      .select("product_id, variant_id, quantity, product_name, products(stock), product_variants(stock)")
      .eq("order_id", order.id);

    if (orderItems) {
      const oversold: string[] = [];

      for (const item of orderItems) {
        const product = item.products as unknown as { stock: number } | null;
        const variant = item.product_variants as unknown as { stock: number } | null;
        const available = variant ? variant.stock : (product?.stock ?? 0);

        if (available < item.quantity) {
          oversold.push(item.product_name);
          console.error(`[webhook][OVERSELL] order=${order.id} product=${item.product_id} available=${available} needed=${item.quantity}`);
          continue;
        }

        try {
          await supabase.rpc("decrement_stock", {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
            p_variant_id: item.variant_id ?? null,
          });
        } catch (err) {
          oversold.push(item.product_name);
          console.error("[webhook] Stock decrement failed:", item.product_id, err);
        }
      }

      if (oversold.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("orders")
          .update({ admin_notes: `⚠️ Oversold items (needs manual fulfillment): ${oversold.join(", ")}` })
          .eq("id", order.id);
      }
    }
  }

  // 9. Send confirmation emails (best-effort, non-blocking)
  if (updatedOrder && order.user_id) {
    const [{ data: { user } }, { data: orderData }] = await Promise.all([
      supabase.auth.admin.getUserById(order.user_id),
      supabase
        .from("orders")
        .select("order_number, subtotal_paise, shipping_paise, total_paise, shipping_address, order_items(product_name, variant_label, quantity, price_paise)")
        .eq("id", order.id)
        .maybeSingle(),
    ]);

    if (user?.email && orderData) {
      const addr = orderData.shipping_address as Record<string, string>;
      const emailData = {
        orderNumber: orderData.order_number,
        customerName: addr.name ?? "Customer",
        items: (orderData.order_items as { product_name: string; variant_label: string | null; quantity: number; price_paise: number }[]).map((i) => ({
          name: i.product_name,
          variant: i.variant_label,
          quantity: i.quantity,
          pricePaise: i.price_paise,
        })),
        subtotalPaise: orderData.subtotal_paise,
        shippingPaise: orderData.shipping_paise,
        totalPaise: orderData.total_paise,
        shippingAddress: {
          name: addr.name,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          phone: addr.phone,
        },
      };
      await Promise.allSettled([
        sendOrderConfirmationEmail(user.email, emailData),
        sendAdminOrderNotification(emailData),
      ]);
    }
  }

  // 10. Clear the user's cart
  if (order.user_id) {
    await supabase.from("cart_items").delete().eq("user_id", order.user_id);
  }

  console.log("[webhook] Order processed:", order.id);
  return NextResponse.json({ received: true });
}
