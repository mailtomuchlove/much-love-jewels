"use server";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type HeroSlide = {
  id: string;
  headline: string;
  subline: string;
  cta_label: string;
  cta_href: string;
  image_src: string | null;
  overlay_opacity: number;
  sort_order: number;
  is_active: boolean;
};

// hero_banners table isn't in the generated types yet (run SQL migration first)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = { from: (table: string) => any };

export async function getHeroBanners(): Promise<HeroSlide[]> {
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as HeroSlide[];
}

export async function getAllHeroBanners(): Promise<HeroSlide[]> {
  await requireAdmin();
  const supabase = (await createClient()) as unknown as AnyClient;
  const { data } = await supabase
    .from("hero_banners")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as HeroSlide[];
}

export async function createHeroBanner(form: {
  headline: string;
  subline: string;
  cta_label: string;
  cta_href: string;
  image_src: string;
  overlay_opacity: number;
  sort_order: number;
  is_active: boolean;
}) {
  await requireAdmin();
  const supabase = (await createClient()) as unknown as AnyClient;
  const { error } = await supabase.from("hero_banners").insert({
    headline: form.headline.trim(),
    subline: form.subline.trim(),
    cta_label: form.cta_label.trim(),
    cta_href: form.cta_href.trim(),
    image_src: form.image_src.trim() || null,
    overlay_opacity: form.overlay_opacity,
    sort_order: form.sort_order,
    is_active: form.is_active,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function updateHeroBanner(
  id: string,
  form: {
    headline: string;
    subline: string;
    cta_label: string;
    cta_href: string;
    image_src: string;
    overlay_opacity: number;
    sort_order: number;
    is_active: boolean;
  }
) {
  await requireAdmin();
  const supabase = (await createClient()) as unknown as AnyClient;
  const { error } = await supabase
    .from("hero_banners")
    .update({
      headline: form.headline.trim(),
      subline: form.subline.trim(),
      cta_label: form.cta_label.trim(),
      cta_href: form.cta_href.trim(),
      image_src: form.image_src.trim() || null,
      overlay_opacity: form.overlay_opacity,
      sort_order: form.sort_order,
      is_active: form.is_active,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function deleteHeroBanner(id: string) {
  await requireAdmin();
  const supabase = (await createClient()) as unknown as AnyClient;

  // Fetch image_src before deleting so we can archive it
  const { data: banner } = await supabase
    .from("hero_banners")
    .select("image_src")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("hero_banners").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // Best-effort: move banner image to hero-banners/archived/
  if (banner?.image_src) {
    try {
      const { extractPublicId, renameCloudinaryAsset } = await import("@/lib/cloudinary");
      const publicId = extractPublicId(banner.image_src);
      if (publicId) {
        const filename = publicId.split("/").pop()!;
        const newId = `muchlovejewels/hero-banners/archived/${filename}`;
        const resourceType = banner.image_src.includes("/video/") ? "video" : "image";
        await renameCloudinaryAsset(publicId, newId, resourceType);
      }
    } catch { /* ignore — delete already succeeded */ }
  }

  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function reorderHeroBanners(ids: string[]) {
  await requireAdmin();
  const supabase = (await createClient()) as unknown as AnyClient;
  await Promise.all(
    ids.map((id, i) =>
      supabase
        .from("hero_banners")
        .update({ sort_order: i })
        .eq("id", id)
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/hero");
}
