"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { StockIndicator } from "@/components/storefront/stock-indicator";
import { Separator } from "@/components/ui/separator";
import type { LocalCartItem } from "@/types";

type Variant = {
  id: string;
  label: string;
  stock: number;
  price_adjustment: number;
};

interface ProductActionsProps {
  productId: string;
  baseStock: number;
  variants: Variant[];
  product: LocalCartItem["product"];
}

export function ProductActions({
  productId,
  baseStock,
  variants,
  product,
}: ProductActionsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  const effectiveStock = selectedVariant ? selectedVariant.stock : baseStock;

  const cartVariant = selectedVariant
    ? { id: selectedVariant.id, label: selectedVariant.label, price_adjustment: selectedVariant.price_adjustment }
    : undefined;

  function handleVariantClick(variantId: string) {
    setSelectedVariantId((prev) => (prev === variantId ? null : variantId));
  }

  return (
    <>
      <div className="mb-5">
        <StockIndicator stock={effectiveStock} />
      </div>

      <Separator className="mb-5" />

      {variants.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-semibold text-brand-navy mb-2">
            Size / Variant
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleVariantClick(v.id)}
                disabled={v.stock === 0}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                  v.stock === 0
                    ? "opacity-40 cursor-not-allowed border-brand-border text-gray-400"
                    : v.id === selectedVariantId
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <AddToCartButton
          productId={productId}
          variantId={selectedVariantId}
          stock={effectiveStock}
          product={product}
          variant={cartVariant}
          className="flex-1 h-11"
          size="lg"
        />
        <WishlistButton
          productId={productId}
          className="h-11 w-11 flex-shrink-0 border border-brand-border rounded-md"
        />
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-brand-border p-4 md:hidden">
        <AddToCartButton
          productId={productId}
          variantId={selectedVariantId}
          stock={effectiveStock}
          product={product}
          variant={cartVariant}
          className="w-full h-11"
          size="lg"
        />
      </div>
    </>
  );
}
