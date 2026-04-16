"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartUI, useGuestCart } from "@/store/cart-store";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  variantId?: string | null;
  stock: number;
  className?: string;
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
}

export function AddToCartButton({
  productId,
  variantId = null,
  stock,
  className,
  size = "default",
  showIcon = true,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const { open } = useCartUI();
  const { addItem } = useGuestCart();

  const isOutOfStock = stock === 0;

  async function handleAddToCart() {
    if (isOutOfStock) return;

    // Optimistic — add to guest cart immediately
    addItem({
      product_id: productId,
      variant_id: variantId,
      quantity: 1,
    });

    setAdded(true);
    toast.success("Added to cart!");
    open();

    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className={cn(
        "bg-brand-navy text-white hover:bg-brand-navy-light transition-colors font-medium",
        isOutOfStock && "opacity-50 cursor-not-allowed",
        className
      )}
      size={size}
    >
      {showIcon && (
        <span className="mr-2">
          {added ? (
            <Check className="h-4 w-4" />
          ) : (
            <ShoppingBag className="h-4 w-4" />
          )}
        </span>
      )}
      {isOutOfStock ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
    </Button>
  );
}
