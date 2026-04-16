"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MATERIALS } from "@/utils/constants";
import { SlidersHorizontal, X } from "lucide-react";

const PRICE_RANGES = [
  { label: "Under ₹999", min: 0, max: 99900 },
  { label: "₹999 – ₹2,999", min: 99900, max: 299900 },
  { label: "₹2,999 – ₹9,999", min: 299900, max: 999900 },
  { label: "Above ₹9,999", min: 999900, max: 10000000 },
];

interface ProductFiltersProps {
  className?: string;
}

export function ProductFilters({ className }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset page on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function toggleMaterial(material: string) {
    const current = searchParams.get("material");
    setParam("material", current === material ? null : material);
  }

  function clearAll() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  const currentSort = searchParams.get("sort") ?? "featured";
  const currentMaterial = searchParams.get("material");
  const currentPriceMin = searchParams.get("minPrice");
  const currentPriceMax = searchParams.get("maxPrice");
  const hasFilters = currentMaterial || currentPriceMin || currentPriceMax;

  return (
    <aside className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-navy" />
          <h2 className="font-poppins text-sm font-semibold text-brand-navy uppercase tracking-wide">
            Filters
          </h2>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-navy transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="mb-6">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
          Sort By
        </Label>
        <Select
          value={currentSort}
          onValueChange={(val) =>
            setParam("sort", val === "featured" ? null : val)
          }
          disabled={isPending}
        >
          <SelectTrigger className="h-10 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price ranges */}
      <div className="mb-6">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
          Price Range
        </Label>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const isSelected =
              currentPriceMin === String(range.min) &&
              currentPriceMax === String(range.max);
            return (
              <button
                key={range.label}
                onClick={() => {
                  if (isSelected) {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("minPrice");
                    params.delete("maxPrice");
                    params.delete("page");
                    startTransition(() =>
                      router.push(`${pathname}?${params.toString()}`)
                    );
                  } else {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("minPrice", String(range.min));
                    params.set("maxPrice", String(range.max));
                    params.delete("page");
                    startTransition(() =>
                      router.push(`${pathname}?${params.toString()}`)
                    );
                  }
                }}
                className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                  isSelected
                    ? "bg-brand-navy text-white"
                    : "text-gray-700 hover:bg-brand-cream"
                }`}
                disabled={isPending}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Materials */}
      <div className="mb-6">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
          Material
        </Label>
        <div className="space-y-2">
          {MATERIALS.map((material) => (
            <div key={material} className="flex items-center gap-2">
              <Checkbox
                id={`material-${material}`}
                checked={currentMaterial === material}
                onCheckedChange={() => toggleMaterial(material)}
                disabled={isPending}
                className="data-[state=checked]:bg-brand-navy data-[state=checked]:border-brand-navy"
              />
              <label
                htmlFor={`material-${material}`}
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                {material}
              </label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
