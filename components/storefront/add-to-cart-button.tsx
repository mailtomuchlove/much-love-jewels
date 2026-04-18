"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartUI, useGuestCart } from "@/store/cart-store";
import { addToCart } from "@/app/actions/cart";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { LocalCartItem } from "@/types";

interface AddToCartButtonProps {
  productId: string;
  variantId?: string | null;
  stock: number;
  /** Enriched product data — populates cart drawer display immediately */
  product?: LocalCartItem["product"];
  /** Enriched variant data — shows label & price adjustment in cart */
  variant?: LocalCartItem["variant"];
  className?: string;
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
}

export function AddToCartButton({
  productId,
  variantId = null,
  stock,
  product,
  variant,
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

    addItem({
      product_id: productId,
      variant_id: variantId,
      quantity: 1,
      product,
      variant,
    });

    setAdded(true);
    toast.success("Added to cart!");
    open();
    setTimeout(() => setAdded(false), 2000);

    // Background DB sync for logged-in users
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      addToCart(productId, variantId ?? null, 1).catch((err: unknown) => {
        console.error("[cart] DB sync failed:", err);
      });
    }
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
        <span className="mr-2 relative h-4 w-4 flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute"
              >
                <Check className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span
                key="bag"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute"
              >
                <ShoppingBag className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      )}
      {isOutOfStock ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
    </Button>
  );
}
