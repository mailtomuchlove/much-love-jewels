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
    <div
      data-scrolled={scrolled}
      className="transition-[box-shadow,background-color] duration-300 data-[scrolled=true]:shadow-md data-[scrolled=true]:bg-white/95 data-[scrolled=true]:[backdrop-filter:blur(8px)]"
    >
      {children}
    </div>
  );
}
