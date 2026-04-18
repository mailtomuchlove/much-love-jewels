import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient, createStaticClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ProductFilters } from "@/components/storefront/product-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    material?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("categories")
    .select("slug")
    .eq("is_active", true);
  return data?.map((c) => ({ slug: c.slug })) ?? [];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!category) return { title: "Collection Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return {
    title: `${category.name} Collection`,
    description:
      category.description ??
      `Shop our ${category.name} collection. Premium handcrafted jewellery.`,
    alternates: {
      canonical: `${siteUrl}/collections/${slug}`,
    },
  };
}

const PAGE_SIZE = 12;

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const supabase = await createClient();

  // Fetch category
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  // Build product query
  const page = Number(sp.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("products")
    .select(
      "id, name, slug, price, compare_price, images, image_public_ids, stock, material, categories(name, slug)",
      { count: "exact" }
    )
    .eq("category_id", category.id)
    .eq("is_active", true)
    .range(offset, offset + PAGE_SIZE - 1);

  if (sp.material) query = query.eq("material", sp.material);
  const minPrice = Number(sp.minPrice);
  const maxPrice = Number(sp.maxPrice);
  if (sp.minPrice && !Number.isNaN(minPrice)) query = query.gte("price", minPrice);
  if (sp.maxPrice && !Number.isNaN(maxPrice)) query = query.lte("price", maxPrice);

  switch (sp.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="container-site py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-brand-text-muted mb-6" aria-label="Breadcrumb">
        <span>Home</span> / <span className="text-brand-navy font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-h1">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-brand-text-muted mt-2 max-w-xl">
            {category.description}
          </p>
        )}
        <div className="divider-gold mt-4" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters sidebar — desktop */}
        <Suspense
          fallback={
            <div className="hidden lg:block w-56 flex-shrink-0 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          }
        >
          <ProductFilters className="hidden lg:block w-56 flex-shrink-0" />
        </Suspense>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {/* Mobile filters */}
          <div className="mb-4 lg:hidden">
            <Suspense fallback={<Skeleton className="h-10 w-full rounded-md" />}>
              <ProductFilters />
            </Suspense>
          </div>

          {/* Count */}
          {count !== null && (
            <p className="text-sm text-brand-text-muted mb-5">
              {count} product{count !== 1 ? "s" : ""}
            </p>
          )}

          <ProductGrid
            products={(products ?? []) as never}
            emptyMessage={`No products found in ${category.name}.`}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...sp, page: String(p) }).toString()}`}
                  className={`h-9 w-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
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
        </div>
      </div>
    </div>
  );
}
