import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SHIPPING_FREE_THRESHOLD_PAISE, SHIPPING_CHARGE_PAISE } from "@/utils/constants";
import { CheckoutClient } from "./checkout-client";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  // Fetch addresses, cart, and auth user email in parallel
  const [addressesResult, cartResult, authResult] = await Promise.all([
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", profile.id)
      .order("is_default", { ascending: false }),
    supabase
      .from("cart_items")
      .select(
        "id, quantity, product_id, variant_id, products(id, name, price, images, image_public_ids, stock), product_variants(id, label, price_adjustment)"
      )
      .eq("user_id", profile.id),
    supabase.auth.getUser(),
  ]);

  const addresses = addressesResult.data;
  const cartItems = cartResult.data;
  const userEmail = authResult.data.user?.email ?? "";

  const items = cartItems ?? [];

  // Redirect to home if cart is empty
  if (items.length === 0) redirect("/");

  let subtotal = 0;
  for (const item of items) {
    const product = item.products as { price: number } | null;
    const variant = item.product_variants as { price_adjustment: number } | null;
    subtotal += ((product?.price ?? 0) + (variant?.price_adjustment ?? 0)) * item.quantity;
  }

  const shipping = subtotal > 0 && subtotal < SHIPPING_FREE_THRESHOLD_PAISE ? SHIPPING_CHARGE_PAISE : 0;
  const total = subtotal + shipping;

  return (
    <div className="container-site py-8 md:py-12 max-w-3xl">
      <h1 className="heading-h1 mb-8">Checkout</h1>
      <CheckoutClient
        profile={profile}
        userEmail={userEmail}
        addresses={addresses ?? []}
        cartItems={items as never}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
      />
    </div>
  );
}
