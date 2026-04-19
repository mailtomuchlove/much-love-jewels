import type { Metadata } from "next";
import { getAllHeroBanners, type HeroSlide } from "@/app/actions/hero-banners";
import { HeroClient } from "./hero-client";

export const metadata: Metadata = { title: "Hero Banners — Admin" };

export default async function HeroAdminPage() {
  let banners: HeroSlide[] = [];
  let tableReady = true;
  try {
    banners = await getAllHeroBanners();
  } catch {
    tableReady = false;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hero Banners</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the rotating banner slides shown at the top of the storefront homepage.
        </p>
      </div>

      {!tableReady && (
        <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm font-semibold text-blue-800">First-time setup</p>
          <p className="text-xs text-blue-700 mt-1 mb-3">
            Run this SQL once in your Supabase SQL editor to create the hero_banners table:
          </p>
          <pre className="text-[11px] bg-blue-100 rounded p-3 overflow-x-auto text-blue-900 leading-relaxed whitespace-pre-wrap">{`create table if not exists hero_banners (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  subline text not null default '',
  cta_label text not null default 'Shop Now',
  cta_href text not null default '/collections',
  image_src text,
  overlay_opacity int4 not null default 60 check (overlay_opacity between 0 and 100),
  sort_order int4 not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table hero_banners enable row level security;

create policy "Public can read active banners"
  on hero_banners for select
  using (is_active = true);

create policy "Admins can manage banners"
  on hero_banners for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );`}</pre>
          <p className="text-xs text-blue-600 mt-2">
            After running the SQL, refresh this page and add your first slide.
          </p>
        </div>
      )}

      <HeroClient banners={banners} />
    </div>
  );
}
