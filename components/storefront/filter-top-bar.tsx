"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
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

interface FilterTopBarProps {
  totalCount: number;
}

export function FilterTopBar({ totalCount }: FilterTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = (window as unknown as Record<string, unknown>).__lenis as
      | { stop: () => void; start: () => void }
      | undefined;
    if (!lenis) return;
    if (filtersOpen) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [filtersOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    if (sortOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortOpen]);

  const currentSort = searchParams.get("sort") ?? "featured";
  const currentMaterial = searchParams.get("material");
  const currentPriceMin = searchParams.get("minPrice");
  const currentPriceMax = searchParams.get("maxPrice");

  const sortActive = currentSort !== "featured";
  const filtersActive = !!(currentMaterial || currentPriceMin || currentPriceMax);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? "Featured";

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
      {/* Desktop inline top bar */}
      <div className="hidden lg:flex items-center gap-3 py-3 border-b border-brand-border mb-6">
        {/* Filters button */}
        <button
          onClick={() => setFiltersOpen(true)}
          className="relative flex items-center gap-1.5 px-4 py-2 rounded-md border border-brand-border text-sm font-medium text-brand-navy hover:bg-brand-cream transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {filtersActive && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-navy" />
          )}
        </button>

        {/* Product count */}
        <span className="flex-1 text-center text-sm text-brand-text-muted">
          {totalCount} {totalCount === 1 ? "product" : "products"}
        </span>

        {/* Sort dropdown */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
              sortActive
                ? "border-brand-navy text-brand-navy bg-brand-cream"
                : "border-brand-border text-brand-navy hover:bg-brand-cream"
            }`}
          >
            Sort: {currentSortLabel}
            <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
          </button>

          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  disabled={isPending}
                  onClick={() => {
                    setParam("sort", opt.value === "featured" ? null : opt.value);
                    setSortOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                    currentSort === opt.value
                      ? "bg-brand-navy text-white font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

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

          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6" data-lenis-prevent>
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
