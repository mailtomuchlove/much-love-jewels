"use client";

import Link from "next/link";
import { SalonNavLink } from "./salon-nav-link";

export function BridalSplitSection() {
  return (
    <section
      className="relative overflow-hidden flex"
      style={{ height: "clamp(440px, 58vw, 620px)" }}
    >
      {/* Left panel — Jewellery */}
      <div className="absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden bg-brand-navy">
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80"
          alt="Bridal jewellery"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/40 to-brand-navy/10" />
        <p className="absolute bottom-6 left-7 text-[9px] tracking-[0.28em] uppercase text-brand-gold/60">
          Bridal Jewellery
        </p>
      </div>

      {/* Right panel — Beauty Studio */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden bg-brand-navy">
        <img
          src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80"
          alt="Bridal beauty"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-brand-navy/35 to-brand-navy/10" />
        <p className="absolute bottom-6 right-7 text-right text-[9px] tracking-[0.28em] uppercase text-brand-gold/60">
          Beauty Studio
        </p>
      </div>

      {/* Floating center card — outer div handles positioning, inner handles hover scale */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div
          className="group text-center bg-brand-navy/95 border border-brand-gold/20 shadow-[var(--shadow-modal)] backdrop-blur-sm cursor-default transition-all duration-300 ease-out hover:scale-110 hover:border-brand-gold/50 hover:shadow-2xl"
          style={{ width: "clamp(280px, 28vw, 380px)", padding: "clamp(24px, 3vw, 40px)" }}
        >
          {/* Pre-label */}
          <p className="text-[9px] tracking-[0.15em] uppercase text-white/40 mb-1.5">
            Are you a Chennai bride?
          </p>

          {/* Label */}
          <p className="text-[9px] tracking-[0.3em] uppercase text-brand-gold mb-3.5">
            Complete Your Bridal Look
          </p>

          {/* Title */}
          <h2 className="text-2xl leading-snug mb-5 text-brand-cream">
            One Vision.<br />Two Experiences.
          </h2>

          {/* Tags */}
          <div className="flex flex-col items-center gap-1.5 mb-6">
            <span className="text-[10px] tracking-[0.15em] text-brand-gold-light/70">💎 Jewellery</span>
            <div className="w-px h-4 bg-brand-gold/30" />
            <span className="text-[10px] tracking-[0.15em] text-brand-gold-light/70">✦ Beauty Studio</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 justify-center flex-wrap">
            <Link
              href="/collections?tag=bridal"
              className="text-[10px] font-semibold tracking-[0.2em] uppercase bg-brand-gold text-brand-navy px-5 py-2.5 hover:bg-brand-gold-light transition-colors"
            >
              Shop Jewels
            </Link>
            <SalonNavLink className="text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-gold border border-brand-gold/40 px-5 py-2.5 hover:bg-brand-gold/10 hover:border-brand-gold transition-colors">
              Book Salon
            </SalonNavLink>
          </div>
        </div>
      </div>
    </section>
  );
}
