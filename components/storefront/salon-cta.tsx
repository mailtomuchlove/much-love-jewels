"use client";

import { MapPin } from "lucide-react";
import { SalonNavLink } from "./salon-nav-link";

export function SalonCta() {
  return (
    <div className="hidden md:flex flex-col items-center gap-2 ml-3 border-l border-white/10 pl-3">
      <p className="flex items-center gap-0.5 text-[8px] tracking-[0.12em] uppercase text-white/45 select-none">
        <MapPin className="h-2.5 w-2.5" />
        Chennai bride?
      </p>
      <SalonNavLink className="relative overflow-hidden flex items-center gap-1 border border-brand-gold/60 text-brand-gold text-[9px] font-semibold tracking-[0.15em] uppercase px-3 py-1 transition-colors duration-300 hover:text-brand-navy group/btn">
        <span className="absolute inset-0 bg-brand-gold -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300 ease-out" aria-hidden="true" />
        <span className="relative z-10">Book Salon</span>
        <span className="relative z-10 inline-block transition-transform duration-200 group-hover/btn:translate-x-0.5">→</span>
      </SalonNavLink>
    </div>
  );
}
