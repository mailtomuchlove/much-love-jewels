"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartUI, useGuestCart } from "@/store/cart-store";

interface CartButtonProps {
  serverCount: number;
}

export function CartButton({ serverCount }: CartButtonProps) {
  const { toggle } = useCartUI();
  const { itemCount } = useGuestCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Before mount: use serverCount so SSR and initial client HTML match (no hydration error).
  // After mount: use the live Zustand count only — it matches exactly what the drawer shows.
  const count = mounted ? itemCount() : serverCount;

  return (
    <button
      onClick={toggle}
      aria-label={`Open cart (${count} items)`}
      className="relative h-10 w-10 flex items-center justify-center rounded-md text-white/75 hover:text-white hover:bg-white/10 transition-colors"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
