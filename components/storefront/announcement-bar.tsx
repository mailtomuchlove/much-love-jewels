"use client";

import { SalonNavLink } from "./salon-nav-link";

export function AnnouncementBar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-brand-navy border-b border-white/10 flex items-center justify-end py-2"
      style={{ paddingLeft: "clamp(16px, 4vw, 56px)", paddingRight: "clamp(16px, 4vw, 56px)" }}
    >
      {/* Top-right — text + button stacked */}
      <div className="flex flex-col items-end gap-1">
        <p className="text-[9px] tracking-[0.15em] uppercase text-white/50">
          Are you a Chennai bride?
        </p>
        <SalonNavLink className="flex items-center gap-1.5 bg-brand-gold text-brand-navy text-[10px] font-semibold tracking-[0.18em] uppercase px-3.5 py-1 hover:bg-brand-gold-light transition-colors duration-200 group">
          Complete your look with us.
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </SalonNavLink>
      </div>
    </div>
  );
}
