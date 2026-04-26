"use client";

import { SalonNavLink } from "./salon-nav-link";

export function BrandSwitcher() {
  return (
    <div className="hidden md:flex flex-col items-end ml-2">
      {/* Segmented pill */}
      <div className="flex border border-brand-gold/40 overflow-hidden">
        {/* Left — Jewels (current, active) */}
        <div className="flex items-center gap-1.5 bg-brand-gold px-3.5 py-1.5 select-none cursor-default">
          <span className="text-[11px]">💎</span>
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-navy">
            Jewels
          </span>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-brand-gold/40" />

        {/* Right — Salon (switch) */}
        <SalonNavLink className="flex items-center gap-1.5 px-3.5 py-1.5 text-brand-gold hover:bg-brand-gold/15 transition-colors duration-200">
          <span className="text-[11px]">✦</span>
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase">
            Salon
          </span>
        </SalonNavLink>
      </div>

      {/* Chennai tagline */}
      <p className="text-[8px] italic tracking-[0.08em] text-brand-gold/60 mt-0.5 pr-0.5">
        Chennai&apos;s bridal studio
      </p>
    </div>
  );
}
