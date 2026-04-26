"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function HeaderScrollWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const showBg = !isHome || scrolled;

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 [backdrop-filter:blur(12px)] border-b border-white/10 transition-opacity duration-500 ${
          showBg ? "opacity-100 bg-brand-navy/90" : "opacity-0"
        }`}
      />
      {children}
    </div>
  );
}
