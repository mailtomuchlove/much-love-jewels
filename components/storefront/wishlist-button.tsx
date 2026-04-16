"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/store/wishlist-store";
import { toggleWishlist } from "@/app/actions/wishlist";
import { toast } from "sonner";
import { useTransition } from "react";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const { isWishlisted, optimisticAdd, optimisticRemove } = useWishlist();
  const [isPending, startTransition] = useTransition();
  const wishlisted = isWishlisted(productId);

  function handleToggle() {
    // Optimistic update
    if (wishlisted) {
      optimisticRemove(productId);
    } else {
      optimisticAdd(productId);
    }

    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (!result.success) {
        // Revert on error
        if (wishlisted) {
          optimisticAdd(productId);
        } else {
          optimisticRemove(productId);
        }
        if (result.error === "auth_required") {
          toast.error("Sign in to save to wishlist");
        } else {
          toast.error("Something went wrong");
        }
      } else {
        toast.success(
          result.data?.added ? "Added to wishlist" : "Removed from wishlist"
        );
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all duration-200 hover:scale-110",
        isPending && "opacity-60",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          wishlisted
            ? "fill-red-500 text-red-500"
            : "text-gray-400 hover:text-red-400"
        )}
      />
    </button>
  );
}
