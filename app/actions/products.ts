"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { rupeesToPaise, generateSlug } from "@/lib/utils";
import { isAllowedImageUrl } from "@/lib/image-utils";
import type { ActionResult, Database } from "@/types";

function validateImageUrls(urls: string[]): string | null {
  const bad = urls.filter((u) => !isAllowedImageUrl(u));
  if (bad.length)
    return `Invalid image URL(s) — must be from Cloudinary: ${bad.join(", ")}`;
  return null;
}

type ProductFormData = {
  name: string;
  description?: string;
  price: number; // in rupees from form
  compare_price?: number | null;
  category_id: string;
  stock: number;
  material?: string;
  weight_grams?: number | null;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  image_public_ids: string[];
  meta_title?: string;
  meta_description?: string;
};

// ── Product code generation ───────────────────────────────────────────────────

async function generateProductCode(
  categoryId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<string> {
  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  const prefix = (category?.name ?? "XX").slice(0, 2).toUpperCase();

  // Find the highest existing sequence for this prefix
  const { data: rows } = await supabase
    .from("products")
    .select("product_code")
    .like("product_code", `${prefix}%`)
    .order("product_code", { ascending: false })
    .limit(1);

  const lastCode: string | null = rows?.[0]?.product_code ?? null;
  const lastSeq = lastCode ? parseInt(lastCode.slice(prefix.length), 10) : 0;
  const nextSeq = (isNaN(lastSeq) ? 0 : lastSeq) + 1;

  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

// ── Rename uploaded images to product_code folder ────────────────────────────

async function relocateImages(
  publicIds: string[],
  categorySlug: string,
  productCode: string
): Promise<{ images: string[]; image_public_ids: string[] }> {
  const { renameCloudinaryAsset } = await import("@/lib/cloudinary");

  const results = await Promise.allSettled(
    publicIds.map(async (oldId) => {
      const filename = oldId.split("/").pop()!;
      const newId = `muchlovejewels/products/${categorySlug}/${productCode}/${filename}`;
      // Detect resource type from public_id path (videos have resource_type stored separately — default image)
      try {
        return await renameCloudinaryAsset(oldId, newId, "image");
      } catch {
        // Try as video if image rename fails
        return await renameCloudinaryAsset(oldId, newId, "video");
      }
    })
  );

  const images: string[] = [];
  const image_public_ids: string[] = [];

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      images.push(r.value.secure_url);
      image_public_ids.push(r.value.public_id);
    } else {
      // Keep original if rename failed
      images.push("");
      image_public_ids.push(publicIds[i]);
    }
  });

  return { images, image_public_ids };
}

export async function createProduct(
  data: ProductFormData
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();

  const imgErr = validateImageUrls(data.images);
  if (imgErr) return { success: false, error: imgErr };

  const supabase = await createClient();
  const slug = generateSlug(data.name);

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .single();

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  // Generate product code + fetch category slug for folder path
  const [productCode, categoryRow] = await Promise.all([
    generateProductCode(data.category_id, supabase),
    supabase.from("categories").select("slug").eq("id", data.category_id).single(),
  ]);
  const categorySlug = categoryRow.data?.slug ?? "uncategorised";

  // Relocate images to product_code subfolder
  const { images, image_public_ids } = data.image_public_ids.length
    ? await relocateImages(data.image_public_ids, categorySlug, productCode)
    : { images: data.images, image_public_ids: data.image_public_ids };

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: data.name,
      slug: finalSlug,
      description: data.description ?? null,
      price: rupeesToPaise(data.price),
      compare_price: data.compare_price ? rupeesToPaise(data.compare_price) : null,
      category_id: data.category_id,
      stock: data.stock,
      material: data.material ?? null,
      weight_grams: data.weight_grams ?? null,
      is_active: data.is_active,
      is_featured: data.is_featured,
      images,
      image_public_ids,
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
      product_code: productCode,
    })
    .select("id, slug")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true, data: { id: product.id, slug: product.slug } };
}

export async function updateProduct(
  productId: string,
  data: Partial<ProductFormData>
): Promise<ActionResult<void>> {
  await requireAdmin();

  if (data.images) {
    const imgErr = validateImageUrls(data.images);
    if (imgErr) return { success: false, error: imgErr };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = rupeesToPaise(data.price);
  if (data.compare_price !== undefined)
    updateData.compare_price = data.compare_price ? rupeesToPaise(data.compare_price) : null;
  if (data.category_id !== undefined) updateData.category_id = data.category_id;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.material !== undefined) updateData.material = data.material;
  if (data.weight_grams !== undefined) updateData.weight_grams = data.weight_grams;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;
  if (data.is_featured !== undefined) updateData.is_featured = data.is_featured;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.image_public_ids !== undefined) updateData.image_public_ids = data.image_public_ids;
  if (data.meta_title !== undefined) updateData.meta_title = data.meta_title;
  if (data.meta_description !== undefined) updateData.meta_description = data.meta_description;

  const { error } = await supabase
    .from("products")
    .update(updateData as Database["public"]["Tables"]["products"]["Update"])
    .eq("id", productId);

  if (error) return { success: false, error: error.message };

  // Get slug for revalidation
  const { data: product } = await supabase
    .from("products")
    .select("slug, categories(slug)")
    .eq("id", productId)
    .single();

  revalidatePath("/admin/products");
  revalidatePath(`/products/${product?.slug}`);
  revalidatePath("/");

  return { success: true, data: undefined };
}

export async function deleteProduct(productId: string): Promise<ActionResult<void>> {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch image public IDs before deletion so we can clean up Cloudinary
  const { data: product } = await supabase
    .from("products")
    .select("image_public_ids, slug")
    .eq("id", productId)
    .single();

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { success: false, error: error.message };

  // Clean up Cloudinary images after DB row is gone
  if (product?.image_public_ids?.length) {
    const { deleteFromCloudinary } = await import("@/lib/cloudinary");
    await Promise.allSettled(
      product.image_public_ids.map((id: string) => deleteFromCloudinary(id))
    );
  }

  revalidatePath("/admin/products");
  if (product?.slug) revalidatePath(`/products/${product.slug}`);
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function toggleProductStatus(
  productId: string,
  is_active: boolean
): Promise<ActionResult<void>> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active })
    .eq("id", productId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/products");
  return { success: true, data: undefined };
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<ActionResult<void>> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true, data: undefined };
}
