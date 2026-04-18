"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalCartItem } from "@/types";

// UI state (open/close) — no persistence
interface CartUIStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCartUI = create<CartUIStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));

const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Guest cart — persisted in localStorage
// For logged-in users, the source of truth is the DB cart.
// On login, this is merged via mergeCartOnLogin() action then cleared.
interface GuestCartStore {
  items: LocalCartItem[];
  lastUpdated: number;
  addItem: (item: LocalCartItem) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number
  ) => void;
  clearCart: () => void;
  getTotal: () => number;
  itemCount: () => number;
}

export const useGuestCart = create<GuestCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      lastUpdated: Date.now(),

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product_id === newItem.product_id &&
              i.variant_id === newItem.variant_id
          );
          if (existing) {
            return {
              lastUpdated: Date.now(),
              items: state.items.map((i) =>
                i.product_id === newItem.product_id &&
                i.variant_id === newItem.variant_id
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { lastUpdated: Date.now(), items: [...state.items, newItem] };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          lastUpdated: Date.now(),
          items: state.items.filter(
            (i) =>
              !(
                i.product_id === productId && i.variant_id === variantId
              )
          ),
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              lastUpdated: Date.now(),
              items: state.items.filter(
                (i) =>
                  !(
                    i.product_id === productId &&
                    i.variant_id === variantId
                  )
              ),
            };
          }
          return {
            lastUpdated: Date.now(),
            items: state.items.map((i) =>
              i.product_id === productId && i.variant_id === variantId
                ? { ...i, quantity }
                : i
            ),
          };
        }),

      clearCart: () => set({ items: [], lastUpdated: Date.now() }),

      getTotal: () => {
        return get().items.reduce((sum, item) => {
          const base = item.product?.price ?? 0;
          const adj = item.variant?.price_adjustment ?? 0;
          return sum + (base + adj) * item.quantity;
        }, 0);
      },

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "mlj-guest-cart",
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Clear stale carts older than 30 days
        if (state && Date.now() - state.lastUpdated > CART_TTL_MS) {
          state.items = [];
          state.lastUpdated = Date.now();
        }
      },
    }
  )
);
