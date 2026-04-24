"use client";

import { useState, useEffect } from "react";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MATERIALS } from "@/utils/constants";

const PRICE_RANGES = [
  { label: "Under ₹999", min: 0, max: 99900 },
  { label: "₹999 – ₹2,999", min: 99900, max: 299900 },
  { label: "₹2,999 – ₹9,999", min: 299900, max: 999900 },
  { label: "Above ₹9,999", min: 999900, max: 10000000 },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

export function MobileFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    if (sortOpen || filtersOpen) lockScroll();
    return () => unlockScroll();
  }, [sortOpen, filtersOpen]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const currentSort = searchParams.get("sort") ?? "featured";
  const currentMaterial = searchParams.get("material");
  const currentPriceMin = searchParams.get("minPrice");
  const currentPriceMax = searchParams.get("maxPrice");

  const sortActive = currentSort !== "featured";
  const filtersActive = !!(currentMaterial || currentPriceMin || currentPriceMax);

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function toggleMaterial(material: string) {
    setParam("material", currentMaterial === material ? null : material);
  }

  function setPriceRange(min: number, max: number) {
    const isSelected = currentPriceMin === String(min) && currentPriceMax === String(max);
    const params = new URLSearchParams(searchParams.toString());
    if (isSelected) {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.set("minPrice", String(min));
      params.set("maxPrice", String(max));
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function clearAll() {
    startTransition(() => router.push(pathname));
  }

  return (
    <>
      {/* Floating pill */}
      <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-stretch bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden transition-opacity duration-200 ${footerVisible ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {/* Sort button */}
        <button
          onClick={() => setSortOpen(true)}
          className="relative flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowUpDown className="h-4 w-4" />
          Sort
          {sortActive && (
            <span className="absolute top-2 right-3 h-1.5 w-1.5 rounded-full bg-brand-navy" />
          )}
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-200 self-stretch" />

        {/* Filters button */}
        <button
          onClick={() => setFiltersOpen(true)}
          className="relative flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {filtersActive && (
            <span className="absolute top-2 right-3 h-1.5 w-1.5 rounded-full bg-brand-navy" />
          )}
        </button>
      </div>

      {/* Sort bottom sheet (mobile) */}
      <Sheet open={sortOpen} onOpenChange={setSortOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl px-0 pb-safe max-h-[60vh]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-poppins text-base font-semibold text-brand-navy">Sort By</h2>
            <button onClick={() => setSortOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Done</button>
          </div>
          <div className="py-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                disabled={isPending}
                onClick={() => {
                  setParam("sort", opt.value === "featured" ? null : opt.value);
                  setSortOpen(false);
                }}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-colors ${
                  currentSort === opt.value
                    ? "text-brand-navy font-semibold bg-brand-cream"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.label}
                {currentSort === opt.value && (
                  <span className="h-2 w-2 rounded-full bg-brand-navy" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Filters left sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-72 px-0 flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="font-poppins text-base font-semibold text-brand-navy">Filters</h2>
            {filtersActive && (
              <button
                onClick={() => { clearAll(); setFiltersOpen(false); }}
                className="text-xs text-gray-400 hover:text-brand-navy transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
            {/* Price Range */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Price Range</p>
              <div className="grid grid-cols-2 gap-2">
                {PRICE_RANGES.map((range) => {
                  const isSelected = currentPriceMin === String(range.min) && currentPriceMax === String(range.max);
                  return (
                    <button
                      key={range.label}
                      disabled={isPending}
                      onClick={() => setPriceRange(range.min, range.max)}
                      className={`rounded-lg px-3 py-2.5 text-sm text-left transition-colors border ${
                        isSelected
                          ? "bg-brand-navy text-white border-brand-navy"
                          : "text-gray-700 border-gray-200 hover:border-brand-navy"
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Material */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Material</p>
              <div className="flex flex-wrap gap-2">
                {MATERIALS.map((material) => {
                  const isSelected = currentMaterial === material;
                  return (
                    <button
                      key={material}
                      disabled={isPending}
                      onClick={() => toggleMaterial(material)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors border ${
                        isSelected
                          ? "bg-brand-navy text-white border-brand-navy"
                          : "text-gray-700 border-gray-200 hover:border-brand-navy"
                      }`}
                    >
                      {material}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Show Results */}
          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full h-12 rounded-full bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy-light transition-colors"
            >
              Show Results
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
