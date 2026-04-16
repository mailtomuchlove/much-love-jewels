import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_FREE_THRESHOLD_PAISE, SHIPPING_CHARGE_PAISE } from "@/utils/constants";
import { CheckoutClient } from "./checkout-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  // Fetch addresses
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", profile.id)
    .order("is_default", { ascending: false });

  // Fetch DB cart
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(
      "id, quantity, product_id, variant_id, products(id, name, price, images, image_public_ids, stock), product_variants(id, label, price_adjustment)"
    )
    .eq("user_id", profile.id);

  const items = cartItems ?? [];

  let subtotal = 0;
  for (const item of items) {
    const product = item.products as { price: number } | null;
    const variant = item.product_variants as { price_adjustment: number } | null;
    subtotal += ((product?.price ?? 0) + (variant?.price_adjustment ?? 0)) * item.quantity;
  }

  const shipping = subtotal >= SHIPPING_FREE_THRESHOLD_PAISE ? 0 : SHIPPING_CHARGE_PAISE;
  const total = subtotal + shipping;

  return (
    <div className="container-site py-8 md:py-12 max-w-3xl">
      <h1 className="heading-h1 mb-8">Checkout</h1>
      <CheckoutClient
        profile={profile}
        addresses={addresses ?? []}
        cartItems={items as never}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
      />
    </div>
  );
}
