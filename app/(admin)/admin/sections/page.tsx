import type { Metadata } from "next";
import {
  getAllHomepageSections,
  getDistinctProductTags,
  type HomepageSection,
} from "@/app/actions/homepage-sections";
import { SectionsClient } from "./sections-client";

export const metadata: Metadata = { title: "Homepage Sections — Admin" };

export default async function SectionsAdminPage() {
  let sections: HomepageSection[] = [];
  let availableTags: string[] = [];
  let tableReady = true;

  try {
    [sections, availableTags] = await Promise.all([
      getAllHomepageSections(),
      getDistinctProductTags(),
    ]);
  } catch {
    tableReady = false;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
        <p className="text-sm text-gray-500 mt-1">
          Curated product sections shown on the homepage, driven by product tags.
        </p>
      </div>

      {!tableReady && (
        <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm font-semibold text-blue-800">First-time setup</p>
          <p className="text-xs text-blue-700 mt-1 mb-3">
            Run this SQL once in your Supabase SQL editor to create the homepage_sections table:
          </p>
          <pre className="text-[11px] bg-blue-100 rounded p-3 overflow-x-auto text-blue-900 leading-relaxed whitespace-pre-wrap">{`create table if not exists homepage_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tag text not null,
  sort_order int4 not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table homepage_sections enable row level security;

create policy "Public can read active sections"
  on homepage_sections for select
  using (is_active = true);

create policy "Admins can manage sections"
  on homepage_sections for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );`}</pre>
          <p className="text-xs text-blue-600 mt-2">
            After running the SQL, refresh this page to start adding sections.
          </p>
        </div>
      )}

      {tableReady && (
        <SectionsClient sections={sections} availableTags={availableTags} />
      )}
    </div>
  );
}
