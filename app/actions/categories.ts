"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils";
import type { ActionResult } from "@/types";

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

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/categories");
  return { success: true, data: undefined };
}
