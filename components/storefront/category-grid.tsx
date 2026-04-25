"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import type { Category } from "@/types";

interface CategoryGridProps {
  categories: Pick<Category, "id" | "name" | "slug" | "image_url">[];
}

const SCROLL_BY = 3; // items to advance per arrow click

export function CategoryGrid({ categories }: CategoryGridProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    syncArrows();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(syncArrows);
    ro.observe(el);
    return () => ro.disconnect();
  }, [categories, syncArrows]);

  function scroll(dir: "left" | "right") {
    const el = trackRef.current;
    if (!el) return;
    const itemW = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 24
      : 144;
    el.scrollBy({ left: dir === "left" ? -itemW * SCROLL_BY : itemW * SCROLL_BY, behavior: "smooth" });
  }

  if (categories.length === 0) return null;

  return (
    <section className="section bg-brand-cream">
      <div className="container-site">

        {/* Header row with arrows */}
        <div className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <h2 className="heading-h2">Shop by Collection</h2>
            <div className="divider-gold mt-3" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canLeft}
              aria-label="Scroll left"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-brand-navy shadow-sm transition-all hover:bg-brand-navy hover:text-white hover:border-brand-navy disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canRight}
              aria-label="Scroll right"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-brand-navy shadow-sm transition-all hover:bg-brand-navy hover:text-white hover:border-brand-navy disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Single-row scroll track */}
        <div
          ref={trackRef}
          onScroll={syncArrows}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
        >
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/collections/${cat.slug}`}
              className="group flex-shrink-0 flex flex-col items-center gap-3 w-[120px] animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{ animationDelay: `${i * 50}ms`, animationDuration: "0.4s" }}
            >
              <div className="relative w-[120px] h-[120px] overflow-hidden rounded-full border-2 border-transparent bg-white shadow-sm transition-all duration-200 group-hover:border-brand-gold group-hover:shadow-md">
                {cat.image_url ? (
                  <SafeImage
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="120px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-cream to-brand-cream-dark flex items-center justify-center">
                    <span className="text-2xl font-bold text-brand-gold/30">{cat.name[0]}</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-center text-brand-navy group-hover:text-brand-gold transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
