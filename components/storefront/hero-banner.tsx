"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    headline: "Bridal Sets That\nSteal the Show",
    subline: "Stunning AD & imitation bridal jewellery — from necklace sets to maang tikkas, crafted for your big day.",
    cta: "Shop Bridal",
    ctaHref: "/collections/bridal",
    bgColor: "from-brand-navy/80 to-brand-navy/40",
    imageSrc: null,
  },
  {
    id: 2,
    headline: "Sparkling AD\nJewellery",
    subline: "American Diamond jewellery that looks like real — bold, beautiful, and budget-friendly. Free shipping across India.",
    cta: "Explore AD Sets",
    ctaHref: "/collections/ad-jewellery",
    bgColor: "from-brand-navy/70 to-transparent",
    imageSrc: null,
  },
  {
    id: 3,
    headline: "Gift Someone\nSpecial",
    subline: "Premium imitation jewellery gift sets with personalised notes. Perfect for weddings, festivals & celebrations.",
    cta: "Gift Now",
    ctaHref: "/collections",
    bgColor: "from-black/60 to-transparent",
    imageSrc: null,
  },
];

export function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating]);

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % slides.length);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + slides.length) % slides.length);
  }, [activeIndex, goTo]);

  useEffect(() => {
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [goNext]);

  const slide = slides[activeIndex];

  return (
    <section
      className="relative w-full overflow-hidden bg-brand-navy"
      style={{ minHeight: "320px", height: "clamp(320px, 55vh, 580px)" }}
      aria-label="Hero banner"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/80 to-brand-navy/40" />

      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="container-site relative z-10 flex h-full items-center">
        <div
          className={cn(
            "max-w-[480px] py-10 transition-all duration-400",
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}
        >
          <p className="text-brand-gold-light text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Premium Jewellery
          </p>
          <h1
            className="font-poppins text-white font-bold leading-tight mb-4"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            {slide.headline.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-8 max-w-[380px]">
            {slide.subline}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={slide.ctaHref}
              className={cn(buttonVariants({ size: "lg" }), "bg-brand-gold hover:bg-brand-gold-muted text-white font-medium px-6 h-11")}
            >
              {slide.cta}
            </Link>
            <Link
              href="/collections"
              className="text-white/80 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              i === activeIndex
                ? "w-8 h-2 bg-brand-gold"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
