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
        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-brand-navy transition-colors"
        aria-haspopup="true"
      >
        Bridal
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
      </button>

      {/* Invisible bridge so the dropdown stays open while the mouse travels down */}
      <div className="absolute top-full left-0 h-3 w-full" />

      {/* Dropdown */}
      <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[540px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
        <div className="bg-white border border-brand-border shadow-xl overflow-hidden">
          <div className="grid grid-cols-2">

            {/* ── Left column — Jewellery ── */}
            <div className="p-6 border-r border-brand-border">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold mb-4">
                Jewellery
              </h4>
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
            <div className="p-6">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold mb-4">
                Beauty Studio
              </h4>
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
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
