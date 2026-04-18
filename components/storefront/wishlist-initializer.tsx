"use client";

import { useEffect } from "react";
import { useWishlist } from "@/store/wishlist-store";

export function WishlistInitializer({ productIds }: { productIds: string[] }) {
  const { setProductIds } = useWishlist();
  useEffect(() => {
    setProductIds(productIds);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
