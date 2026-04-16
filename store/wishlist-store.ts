"use client";

import { create } from "zustand";

// Optimistic UI state — synced from server on mount
interface WishlistUIStore {
  productIds: Set<string>;
  setProductIds: (ids: string[]) => void;
  optimisticAdd: (id: string) => void;
  optimisticRemove: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

export const useWishlist = create<WishlistUIStore>((set, get) => ({
  productIds: new Set<string>(),

  setProductIds: (ids) => set({ productIds: new Set(ids) }),

  optimisticAdd: (id) =>
    set((state) => ({
      productIds: new Set([...state.productIds, id]),
    })),

  optimisticRemove: (id) =>
    set((state) => {
      const next = new Set(state.productIds);
      next.delete(id);
      return { productIds: next };
    }),

  isWishlisted: (id) => get().productIds.has(id),
}));
