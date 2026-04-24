"use client";

import { useEffect, useState } from "react";

export function HeaderScrollWrapper({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // Run once immediately in case page loaded mid-scroll
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      {/* Composited opacity fade — avoids painting box-shadow/bg-color on every scroll tick */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-white/95 shadow-md [backdrop-filter:blur(8px)] transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />
      {children}
    </div>
  );
}
