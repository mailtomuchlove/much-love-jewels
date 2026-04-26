"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SalonNavLink } from "./salon-nav-link";

const jewelleryLinks = [
  { label: "Bridal Sets",       href: "/collections/bridal-sets" },
  { label: "Engagement Rings",  href: "/collections/rings" },
  { label: "Wedding Bands",     href: "/collections/wedding-bands" },
  { label: "Mangalsutra",       href: "/collections/mangalsutra" },
];

const beautyLinks = [
  "Bridal Makeup",
  "Hair Styling",
  "Pre-Bridal Packages",
  "Mehndi Services",
];

export function MegaMenuBridal() {
  return (
    <div className="relative group">
      {/* Trigger */}
      <button
        className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase border border-brand-gold/60 text-brand-gold px-3.5 py-1.5 transition-all duration-200 hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold group-hover:bg-brand-gold group-hover:text-brand-navy group-hover:border-brand-gold"
        aria-haspopup="true"
      >
        <span>✦</span>
        Salon
        <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
      </button>

      {/* Invisible bridge so the dropdown stays open while the mouse travels down */}
      <div className="absolute top-full right-0 h-3 w-[540px]" />

      {/* Dropdown — right-aligned so it doesn't overflow the viewport */}
      <div className="absolute top-[calc(100%+8px)] right-0 w-[540px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
        <div className="bg-white border border-brand-border shadow-xl overflow-hidden">
          <div className="grid grid-cols-2">

            {/* ── Left column — Jewellery ── */}
            <div className="p-6 border-r border-brand-border">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold">
                  Jewellery
                </h4>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold inline-block" />
                  You&apos;re here
                </span>
              </div>
              <ul className="space-y-2.5 mb-5">
                {jewelleryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-brand-navy hover:translate-x-1 transition-all duration-150 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Jewellery thumbnail */}
              <div className="relative h-[100px] overflow-hidden bg-brand-cream">
                <img
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=540&q=75"
                  alt="Bridal jewellery"
                  className="w-full h-full object-cover opacity-80 hover:scale-[1.04] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 to-transparent" />
              </div>
            </div>

            {/* ── Right column — Beauty Studio ── */}
            <div className="p-6 bg-brand-navy/[0.03]">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold mb-1">
                Beauty Studio
              </h4>
              <p className="text-[9px] italic tracking-[0.08em] text-brand-gold/55 mb-4">
                Chennai&apos;s most-loved bridal studio ✦
              </p>
              <ul className="space-y-2.5 mb-5">
                {beautyLinks.map((label) => (
                  <li key={label}>
                    <SalonNavLink className="text-sm text-gray-600 hover:text-brand-navy hover:translate-x-1 transition-all duration-150 inline-block">
                      {label}
                    </SalonNavLink>
                  </li>
                ))}
              </ul>

              {/* Salon thumbnail */}
              <div className="relative h-[100px] overflow-hidden bg-brand-navy">
                <img
                  src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=540&q=75"
                  alt="Beauty studio"
                  className="w-full h-full object-cover opacity-60 hover:scale-[1.04] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 to-transparent" />
              </div>

              {/* Switch CTA */}
              <SalonNavLink className="mt-3 w-full flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase bg-brand-navy text-brand-gold border border-brand-navy px-4 py-2 hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold transition-all duration-200">
                Switch to Salon
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <line x1="2" y1="6" x2="10" y2="6" /><polyline points="7,3 10,6 7,9" />
                </svg>
              </SalonNavLink>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
