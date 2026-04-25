"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import type { Category } from "@/types";

interface CategoryGridProps {
  categories: Pick<Category, "id" | "name" | "slug" | "image_url">[];
}

const DESKTOP_COLS = 6;

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [page, setPage] = useState(0);

  if (categories.length === 0) return null;

  const totalPages = Math.ceil(categories.length / DESKTOP_COLS);
  const pageItems = categories.slice(page * DESKTOP_COLS, (page + 1) * DESKTOP_COLS);
  const showArrows = totalPages > 1;

  return (
    <section className="section bg-brand-cream">
      <div className="container-site">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <h2 className="heading-h2">Shop by Collection</h2>
            <div className="divider-gold mt-3" />
          </div>

          {showArrows && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-brand-text-muted tabular-nums">
                {page + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Previous"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-brand-navy shadow-sm transition-all hover:bg-brand-navy hover:text-white hover:border-brand-navy disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  aria-label="Next"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-brand-navy shadow-sm transition-all hover:bg-brand-navy hover:text-white hover:border-brand-navy disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile: horizontal scroll (3 visible) ── */}
        <div className="lg:hidden flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {categories.map((cat, i) => (
            <CategoryItem key={cat.id} cat={cat} size={100} index={i} />
          ))}
        </div>

        {/* ── Desktop: 6-column page grid ── */}
        <div className="hidden lg:grid grid-cols-6 gap-6">
          {pageItems.map((cat, i) => (
            <CategoryItem key={cat.id} cat={cat} size={160} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}

function CategoryItem({
  cat,
  size,
  index,
}: {
  cat: Pick<Category, "id" | "name" | "slug" | "image_url">;
  size: number;
  index: number;
}) {
  return (
    <Link
      href={`/collections/${cat.slug}`}
      className="group flex-shrink-0 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDelay: `${index * 50}ms`, animationDuration: "0.4s", width: size }}
    >
      <div
        className="relative overflow-hidden rounded-full border-2 border-transparent bg-white shadow-sm transition-all duration-200 group-hover:border-brand-gold group-hover:shadow-md"
        style={{ width: size, height: size }}
      >
        {cat.image_url ? (
          <SafeImage
            src={cat.image_url}
            alt={cat.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={`${size}px`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-cream to-brand-cream-dark flex items-center justify-center">
            <span className="font-bold text-brand-gold/30" style={{ fontSize: size * 0.28 }}>
              {cat.name[0]}
            </span>
          </div>
        )}
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-center text-brand-navy group-hover:text-brand-gold transition-colors leading-tight w-full">
        {cat.name}
      </span>
    </Link>
  );
}
