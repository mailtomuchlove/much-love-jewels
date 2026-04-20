import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient, createStaticClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/storefront/product-grid";
import { FilterTopBar } from "@/components/storefront/filter-top-bar";
import { MobileFilterBar } from "@/components/storefront/mobile-filter-bar";
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://muchlovejewels.com";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: category.name, item: `${siteUrl}/collections/${slug}` },
    ],
  };

  return (
    <div className="container-site py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="text-xs text-brand-text-muted mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
        {" / "}
        <span className="text-brand-navy font-medium">{category.name}</span>
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

      <Suspense fallback={null}>
        <FilterTopBar totalCount={count ?? 0} />
      </Suspense>

      <ProductGrid
        products={(products ?? []) as never}
        emptyMessage={`No products found in ${category.name}.`}
      />

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

      {/* Mobile floating sort/filter pill */}
      <Suspense fallback={null}>
        <MobileFilterBar />
      </Suspense>
    </div>
  );
}
