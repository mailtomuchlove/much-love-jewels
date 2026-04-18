import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/app/actions/orders";
import { getAddresses } from "@/app/actions/addresses";
import { AccountClient } from "./account-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const [orders, addresses, wishlistRows] = await Promise.all([
    getUserOrders(),
    getAddresses(),
    supabase.from("wishlist").select("product_id").eq("user_id", profile.id),
  ]);

  // Fetch product details separately to avoid fragile PostgREST FK joins
  const wishlistProductIds = (wishlistRows.data ?? []).map((w) => w.product_id);
  const { data: wishlistProducts } = wishlistProductIds.length
    ? await supabase
        .from("products")
        .select("id, name, slug, price, compare_price, images, image_public_ids, stock")
        .in("id", wishlistProductIds)
    : { data: [] };

  const wishlistItems = wishlistProductIds.map((pid) => ({
    product_id: pid,
    product: (wishlistProducts ?? []).find((p) => p.id === pid) ?? null,
  }));

  return (
    <div className="container-site py-8 md:py-12 max-w-5xl">
      <h1 className="heading-h1 mb-8">My Account</h1>
      <AccountClient
        profile={profile}
        orders={orders}
        addresses={addresses}
        wishlistItems={wishlistItems}
      />
    </div>
  );
}
