"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils";
import { isAllowedImageUrl } from "@/lib/image-utils";
import type { ActionResult } from "@/types";

function validateImageUrl(url: string | null | undefined): string | null {
  if (!url) return null; // blank is fine
  if (!isAllowedImageUrl(url))
    return "Image URL must be from res.cloudinary.com. Upload the image to Cloudinary first.";
  return null;
}

type CategoryFormData = {
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
};

export async function createCategory(
  data: CategoryFormData
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const imgErr = validateImageUrl(data.image_url);
  if (imgErr) return { success: false, error: imgErr };

  const supabase = await createClient();
  const slug = generateSlug(data.name);

  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      name: data.name,
      slug,
      description: data.description ?? null,
      image_url: data.image_url ?? null,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true, data: { id: category.id } };
}

export async function updateCategory(
  categoryId: string,
  data: Partial<CategoryFormData>
): Promise<ActionResult<void>> {
  await requireAdmin();

  const imgErr = validateImageUrl(data.image_url);
  if (imgErr) return { success: false, error: imgErr };

  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", categoryId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult<void>> {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch category slug + all product images before deleting
  const [{ data: category }, { data: products }] = await Promise.all([
    supabase.from("categories").select("slug").eq("id", categoryId).single(),
    supabase.from("products").select("id, image_public_ids").eq("category_id", categoryId),
  ]);

  // Detach products from this category before deleting (avoids FK constraint error)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("products").update({ category_id: null }).eq("category_id", categoryId);

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { success: false, error: error.message };

  // Best-effort: move product images to backup/{category-slug}/ in Cloudinary
  if (category?.slug && products?.length) {
    const { renameCloudinaryAsset } = await import("@/lib/cloudinary");
    const backupPrefix = `muchlovejewels/backup/${category.slug}`;

    await Promise.allSettled(
      products.flatMap((p) =>
        (p.image_public_ids ?? []).map(async (oldId: string) => {
          const filename = oldId.split("/").pop()!;
          const newId = `${backupPrefix}/${filename}`;
          try {
            const result = await renameCloudinaryAsset(oldId, newId, "image");
            // Update product row with new URL
            await supabase
              .from("products")
              .update({
                images: (await supabase.from("products").select("images").eq("id", p.id).single())
                  .data?.images?.map((url: string) =>
                    url.includes(filename) ? result.secure_url : url
                  ) ?? [],
                image_public_ids: (await supabase.from("products").select("image_public_ids").eq("id", p.id).single())
                  .data?.image_public_ids?.map((id: string) =>
                    id === oldId ? result.public_id : id
                  ) ?? [],
              })
              .eq("id", p.id);
          } catch {
            try { await renameCloudinaryAsset(oldId, `${backupPrefix}/${filename}`, "video"); } catch { /* ignore */ }
          }
        })
      )
    );
  }

  revalidatePath("/admin/categories");
  return { success: true, data: undefined };
}
