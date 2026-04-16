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

  const [orders, addresses, wishlistResult] = await Promise.all([
    getUserOrders(),
    getAddresses(),
    supabase
      .from("wishlist")
      .select("product_id, products(id, name, slug, price, compare_price, images, image_public_ids, stock)")
      .eq("user_id", profile.id),
  ]);

  const wishlistItems = (wishlistResult.data ?? []).map((w) => ({
    product_id: w.product_id,
    product: w.products as {
      id: string;
      name: string;
      slug: string;
      price: number;
      compare_price: number | null;
      images: string[];
      image_public_ids: string[];
      stock: number;
    } | null,
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
