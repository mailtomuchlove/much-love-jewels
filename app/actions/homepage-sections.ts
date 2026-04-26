"use server";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type HomepageSection = {
  id: string;
  title: string;
  tag: string;
  subtitle: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

// homepage_sections table isn't in the generated types yet (run SQL migration first)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = { from: (table: string) => any };

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as HomepageSection[];
}

export async function getAllHomepageSections(): Promise<HomepageSection[]> {
  await requireAdmin();
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data } = await supabase
    .from("homepage_sections")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as HomepageSection[];
}

export async function getDistinctProductTags(): Promise<string[]> {
  await requireAdmin();
  const supabase = await createClient();
  // Unnest the tags array across all active products and return distinct values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).rpc("get_distinct_product_tags");
  if (data) return data.map((r: { tag: string }) => r.tag).sort();
  // Fallback: fetch all product tags and flatten client-side
  const { data: products } = await supabase
    .from("products")
    .select("tags")
    .eq("is_active", true);
  const all = (products ?? []).flatMap((p: { tags: string[] | null }) => p.tags ?? []);
  return [...new Set(all)].sort();
}

export async function createHomepageSection(form: {
  title: string;
  tag: string;
  subtitle?: string | null;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
}) {
  await requireAdmin();
  const supabase = (await createClient()) as unknown as AnyClient;
  const { error } = await supabase.from("homepage_sections").insert({
    title: form.title.trim(),
    tag: form.tag.trim().toLowerCase(),
    subtitle: form.subtitle?.trim() || null,
    image_url: form.image_url || null,
    sort_order: form.sort_order,
    is_active: form.is_active,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/sections");
}

export async function updateHomepageSection(
  id: string,
  form: {
    title: string;
    tag: string;
    subtitle?: string | null;
    image_url?: string | null;
    sort_order: number;
    is_active: boolean;
  }
) {
  await requireAdmin();
  const supabase = (await createClient()) as unknown as AnyClient;
  const { error } = await supabase
    .from("homepage_sections")
    .update({
      title: form.title.trim(),
      tag: form.tag.trim().toLowerCase(),
      subtitle: form.subtitle?.trim() || null,
      image_url: form.image_url || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/sections");
}

export async function deleteHomepageSection(id: string) {
  await requireAdmin();
  const supabase = (await createClient()) as unknown as AnyClient;
  const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/sections");
}

