"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import { SHIPPING_FREE_THRESHOLD_PAISE, SHIPPING_CHARGE_PAISE } from "@/utils/constants";
import { checkOrderRateLimit } from "@/lib/ratelimit";
import { revalidatePath } from "next/cache";
import type { ActionResult, Json } from "@/types";

type CreateOrderResult = {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  orderNumber: string;
};

export async function createOrder(
  addressId: string
): Promise<ActionResult<CreateOrderResult>> {
  const profile = await requireAuth();

  // Rate limit: max 10 order creations per hour per user
  const { allowed } = await checkOrderRateLimit(profile.id);
  if (!allowed) {
    return { success: false, error: "Too many orders. Please wait before placing another." };
  }

  const supabase = await createClient();

  // 1. Fetch shipping address
  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", profile.id)
    .single();

  if (!address) return { success: false, error: "Address not found" };

  // 2. Fetch cart items with product prices (server-side — never trust client)
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(
      "id, quantity, product_id, variant_id, products(id, name, price, stock, is_active), product_variants(id, label, price_adjustment, stock)"
    )
    .eq("user_id", profile.id);

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Your cart is empty" };
  }

  // 3. Validate stock and calculate total
  let subtotalPaise = 0;
  const orderItemsData: {
    product_id: string;
    variant_id: string | null;
    product_name: string;
    variant_label: string | null;
    quantity: number;
    price_paise: number;
  }[] = [];

  for (const item of cartItems) {
    const product = item.products as {
      id: string;
      name: string;
      price: number;
      stock: number;
      is_active: boolean;
    } | null;
    const variant = item.product_variants as {
      id: string;
      label: string;
      price_adjustment: number;
      stock: number;
    } | null;

    if (!product || !product.is_active) {
      return {
        success: false,
        error: `Product "${product?.name ?? item.product_id}" is no longer available`,
      };
    }

    const stockAvailable = variant ? variant.stock : product.stock;
    if (stockAvailable < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for "${product.name}"`,
      };
    }

    const unitPricePaise = product.price + (variant?.price_adjustment ?? 0);
    subtotalPaise += unitPricePaise * item.quantity;

    orderItemsData.push({
      product_id: product.id,
      variant_id: variant?.id ?? null,
      product_name: product.name,
      variant_label: variant?.label ?? null,
      quantity: item.quantity,
      price_paise: unitPricePaise,
    });
  }

  const shippingPaise =
    subtotalPaise >= SHIPPING_FREE_THRESHOLD_PAISE ? 0 : SHIPPING_CHARGE_PAISE;
  const totalPaise = subtotalPaise + shippingPaise;
  const orderNumber = generateOrderNumber();

  // 4. Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: profile.id,
      subtotal_paise: subtotalPaise,
      shipping_paise: shippingPaise,
      total_paise: totalPaise,
      shipping_address: address as unknown as Json,
    })
    .select()
    .single();

  if (orderError || !order) {
    return { success: false, error: orderError?.message ?? "Failed to create order" };
  }

  // 5. Insert order items
  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItemsData.map((item) => ({ ...item, order_id: order.id }))
  );

  if (itemsError) {
    // Clean up order
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: itemsError.message };
  }

  // 6. Create Razorpay order (skip if not configured)
  const razorpayConfigured = process.env.RAZORPAY_KEY_ID &&
    !process.env.RAZORPAY_KEY_ID.includes("xxxx");

  if (!razorpayConfigured) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: "Payment gateway not configured yet." };
  }

  let rzpOrder: { id: string };
  try {
    rzpOrder = await createRazorpayOrder(totalPaise, "INR", orderNumber);
  } catch (err) {
    await supabase.from("orders").delete().eq("id", order.id);
    return {
      success: false,
      error: (err as Error).message ?? "Payment initialization failed",
    };
  }

  // 7. Update order with Razorpay order ID
  await supabase
    .from("orders")
    .update({ razorpay_order_id: rzpOrder.id })
    .eq("id", order.id);

  return {
    success: true,
    data: {
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: totalPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      orderNumber,
    },
  };
}

type VerifyPaymentInput = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export async function verifyPayment(
  input: VerifyPaymentInput
): Promise<ActionResult<{ orderId: string }>> {
  const profile = await requireAuth();
  const supabase = await createClient();

  // 1. Verify HMAC signature
  const isValid = verifyRazorpaySignature(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature
  );

  if (!isValid) {
    return { success: false, error: "Invalid payment signature" };
  }

  // 2. Fetch order (idempotency check)
  const { data: order } = await supabase
    .from("orders")
    .select("id, payment_status, user_id")
    .eq("id", input.orderId)
    .eq("user_id", profile.id)
    .single();

  if (!order) return { success: false, error: "Order not found" };

  // Already processed — idempotent
  if (order.payment_status === "paid") {
    return { success: true, data: { orderId: input.orderId } };
  }

  // 3. Update order status — only if still pending (atomic guard against duplicate processing)
  // Using .select() so we know whether this call actually owned the update.
  // If the webhook already processed this payment the update matches 0 rows → data is null.
  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      payment_id: input.razorpayPaymentId,
    })
    .eq("id", input.orderId)
    .eq("payment_status", "pending")
    .select("id")
    .maybeSingle();

  if (updateError) return { success: false, error: updateError.message };

  // 4. Decrement stock only if this call owned the update — prevents double decrement with webhook
  if (updatedOrder) {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, variant_id, quantity, product_name, products(stock), product_variants(stock)")
      .eq("order_id", input.orderId);

    if (orderItems) {
      const oversold: string[] = [];

      for (const item of orderItems) {
        const product = item.products as { stock: number } | null;
        const variant = item.product_variants as { stock: number } | null;
        const available = variant ? variant.stock : (product?.stock ?? 0);

        if (available < item.quantity) {
          // Payment captured but stock is gone — flag for admin, skip decrement
          oversold.push(item.product_name);
          console.error(`[OVERSELL] order=${input.orderId} product=${item.product_id} available=${available} needed=${item.quantity}`);
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
          console.error("Stock decrement failed:", item.product_id, err);
        }
      }

      if (oversold.length > 0) {
        await supabase
          .from("orders")
          .update({ admin_notes: `⚠️ Oversold items (needs manual fulfillment): ${oversold.join(", ")}` })
          .eq("id", input.orderId);
      }
    }
  }

  // 5. Clear user's cart
  await supabase.from("cart_items").delete().eq("user_id", profile.id);

  revalidatePath("/account");
  revalidatePath("/", "layout");

  return { success: true, data: { orderId: input.orderId } };
}

export async function getUserOrders() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, total_paise, created_at, order_items(id, product_name, quantity, price_paise, products(images, image_public_ids))"
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getOrderById(orderId: string) {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(
      "*, order_items(*, products(id, name, images, image_public_ids))"
    )
    .eq("id", orderId)
    .eq("user_id", profile.id)
    .single();

  return data;
}
