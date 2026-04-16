"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function toggleWishlist(
  productId: string
): Promise<ActionResult<{ added: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "auth_required" };
  }

  // Check if already wishlisted
  const { data: existing } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("id", existing.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/account");
    return { success: true, data: { added: false } };
  } else {
    const { error } = await supabase.from("wishlist").insert({
      user_id: user.id,
      product_id: productId,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/account");
    return { success: true, data: { added: true } };
  }
}

export async function getWishlistIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("wishlist")
    .select("product_id")
    .eq("user_id", user.id);

  return data?.map((w) => w.product_id) ?? [];
}
