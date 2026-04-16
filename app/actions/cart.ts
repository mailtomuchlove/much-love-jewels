"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResult, CartItemWithProduct, LocalCartItem } from "@/types";

export async function addToCart(
  productId: string,
  variantId: string | null = null,
  quantity = 1
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "auth_required" };
  }

  // Validate product exists and has stock
  const { data: product } = await supabase
    .from("products")
    .select("id, stock, is_active")
    .eq("id", productId)
    .eq("is_active", true)
    .single();

  if (!product) return { success: false, error: "Product not found" };

  const stockToCheck = variantId
    ? (await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", variantId)
        .single()
      ).data?.stock ?? 0
    : product.stock;

  if (stockToCheck < quantity) {
    return { success: false, error: "Insufficient stock" };
  }

  // Upsert cart item
  // Using two separate upserts for the NULL variant constraint
  if (variantId) {
    const { error } = await supabase.rpc("upsert_cart_item_with_variant", {
      p_user_id: user.id,
      p_product_id: productId,
      p_variant_id: variantId,
      p_quantity: quantity,
    }).single();

    if (error) {
      // Fallback: manual upsert
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("variant_id", variantId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          variant_id: variantId,
          quantity,
        });
      }
    }
  } else {
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .is("variant_id", null)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        variant_id: null,
        quantity,
      });
    }
  }

  revalidatePath("/", "layout");
  return { success: true, data: undefined };
}

export async function removeFromCart(
  cartItemId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  return { success: true, data: undefined };
}

export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  return { success: true, data: undefined };
}

/**
 * Merge guest localStorage cart into DB cart on login.
 * Called client-side after auth state change.
 */
export async function mergeCartOnLogin(
  localItems: LocalCartItem[]
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };
  if (localItems.length === 0) return { success: true, data: undefined };

  for (const item of localItems) {
    if (item.variant_id) {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", item.product_id)
        .eq("variant_id", item.variant_id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({
            quantity: Math.max(existing.quantity, item.quantity),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        });
      }
    } else {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", item.product_id)
        .is("variant_id", null)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({
            quantity: Math.max(existing.quantity, item.quantity),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: item.product_id,
          variant_id: null,
          quantity: item.quantity,
        });
      }
    }
  }

  revalidatePath("/", "layout");
  return { success: true, data: undefined };
}

/**
 * Fetch cart for current user (server-side).
 */
export async function getCart(): Promise<CartItemWithProduct[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("cart_items")
    .select(
      "id, quantity, product_id, variant_id, products(id, name, slug, price, images, image_public_ids, stock), product_variants(id, label, price_adjustment, stock)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (data ?? []) as unknown as CartItemWithProduct[];
}
