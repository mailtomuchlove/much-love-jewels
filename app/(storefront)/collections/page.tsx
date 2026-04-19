import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/storefront/product-grid";
import { FilterTopBar } from "@/components/storefront/filter-top-bar";
import { MobileFilterBar } from "@/components/storefront/mobile-filter-bar";
import { Suspense } from "react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Collections",
  description: "Browse our full range of AD & imitation jewellery — rings, necklaces, earrings, bridal sets and more.",
};

interface PageProps {
  searchParams: Promise<{
    sort?: string;
    material?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export default async function CollectionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const sort = params.sort ?? "newest";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = 24;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("products")
    .select("id, name, slug, price, compare_price, images, image_public_ids, stock, material, categories(name, slug)", { count: "exact" })
    .eq("is_active", true);

  if (params.material) query = query.eq("material", params.material);
  if (params.minPrice) query = query.gte("price", parseInt(params.minPrice) * 100);
  if (params.maxPrice) query = query.lte("price", parseInt(params.maxPrice) * 100);

  switch (sort) {
    case "price_asc":  query = query.order("price", { ascending: true });  break;
    case "price_desc": query = query.order("price", { ascending: false }); break;
    case "name_asc":   query = query.order("name",  { ascending: true });  break;
    default:           query = query.order("created_at", { ascending: false });
  }

  const { data: products, count } = await query.range(from, from + pageSize - 1);
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="container-site py-8 md:py-12">
      <div className="mb-8">
        <h1 className="heading-h1">All Collections</h1>
        <p className="text-brand-text-muted mt-2 lg:hidden">
          {count ?? 0} {(count ?? 0) === 1 ? "piece" : "pieces"} found
        </p>
      </div>

      <Suspense fallback={null}>
        <FilterTopBar totalCount={count ?? 0} />
      </Suspense>

      <ProductGrid products={(products ?? []) as never} />

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?${new URLSearchParams({ ...params, page: String(p) })}`}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                p === page
                  ? "bg-brand-navy text-white"
                  : "border border-brand-border text-brand-text hover:bg-brand-cream"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}

      {/* Mobile floating sort/filter pill */}
      <Suspense fallback={null}>
        <MobileFilterBar />
      </Suspense>
    </div>
  );
}
