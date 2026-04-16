"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartUI, useGuestCart } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, close } = useCartUI();
  const { items, removeItem, updateQuantity, getTotal, itemCount } = useGuestCart();

  const total = getTotal();
  const count = itemCount();

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-[400px]"
      >
        {/* Header */}
        <SheetHeader className="flex h-[60px] flex-row items-center justify-between border-b px-4">
          <SheetTitle className="font-poppins text-base font-semibold text-brand-navy">
            Your Cart ({count})
          </SheetTitle>
          <button
            onClick={close}
            className="rounded-md p-1 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-gray-200" />
              <p className="font-medium text-gray-900">Your cart is empty</p>
              <p className="mt-1 text-sm text-gray-500">
                Add some jewellery to get started!
              </p>
              <Link
                href="/collections"
                onClick={close}
                className={buttonVariants({ variant: "outline" }) + " mt-6"}
              >
                Browse Collections
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const price =
                  (item.product?.price ?? 0) +
                  (item.variant?.price_adjustment ?? 0);
                const imageUrl = item.product?.images?.[0] ?? "";
                const name = item.product?.name ?? "Product";

                return (
                  <li
                    key={`${item.product_id}-${item.variant_id ?? "none"}`}
                    className="flex gap-3 py-4"
                  >
                    {/* Image */}
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm bg-brand-cream">
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium text-brand-text">
                            {name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-brand-text-muted mt-0.5">
                              {item.variant.label}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            removeItem(item.product_id, item.variant_id)
                          }
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Quantity stepper */}
                        <div className="flex items-center gap-1 rounded-md border border-border">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                item.variant_id,
                                item.quantity - 1
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center text-gray-600 hover:text-brand-navy transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                item.variant_id,
                                item.quantity + 1
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center text-gray-600 hover:text-brand-navy transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-brand-navy">
                          {formatPrice(price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-white px-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-base font-semibold text-brand-navy">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Shipping calculated at checkout
            </p>
            <Separator className="mb-4" />
            <Link
              href="/checkout"
              onClick={close}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-brand-navy text-white hover:bg-brand-navy-light font-medium text-sm transition-colors"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={close}
              className="mt-3 w-full text-center text-sm text-gray-500 hover:text-brand-navy transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
