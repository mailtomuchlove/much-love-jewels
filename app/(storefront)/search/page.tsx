import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SearchBar } from "@/components/storefront/search-bar";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Results for "${q}"` : "Search",
    description: q ? `Shop Much Love Jewels for "${q}"` : "Search our jewellery collection",
  };
}

const PAGE_SIZE = 24;

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let products: unknown[] = [];
  let count = 0;
  let searched = false;

  if (query.length >= 1) {
    searched = true;
    const supabase = await createClient();

    let dbQuery = supabase
      .from("products")
      .select(
        "id, name, slug, price, compare_price, images, image_public_ids, stock, material, categories(name, slug)",
        { count: "exact" }
      )
      .eq("is_active", true);

    // "Under ₹X" price filter
    const priceMatch = query.match(/under\s*[₹]?\s*(\d+)/i);
    if (priceMatch) {
      const maxPaise = parseInt(priceMatch[1]) * 100;
      dbQuery = dbQuery.lte("price", maxPaise);
    } else {
      dbQuery = dbQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,material.ilike.%${query}%`
      );
    }

    const result = await dbQuery
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    products = result.data ?? [];
    count = result.count ?? 0;
  }

  return (
    <div className="container-site py-8 md:py-12">
      {/* Search bar — refine query */}
      <div className="mb-8 max-w-lg">
        <SearchBar initialQuery={query} autoFocus={!query} />
      </div>

      {searched ? (
        <>
          <p className="text-sm text-brand-text-muted mb-6">
            <span className="font-medium text-brand-navy">{count}</span>{" "}
            result{count !== 1 ? "s" : ""} for&nbsp;
            <span className="font-medium text-brand-navy">"{query}"</span>
          </p>

          <ProductGrid
            products={products as never}
            emptyMessage={`No products found for "${query}". Try a different search term.`}
          />
        </>
      ) : (
        <p className="py-16 text-center text-sm text-brand-text-muted">
          Type a product name, material, or price range to search.
        </p>
      )}
    </div>
  );
}
