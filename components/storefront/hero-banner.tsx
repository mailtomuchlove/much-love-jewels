"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) || url.includes("/video/upload/");
}

type Slide = {
  id: string | number;
  headline: string;
  subline: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string | null;
  overlayOpacity: number;
};

type DbSlide = {
  id: string;
  headline: string;
  subline: string;
  cta_label: string;
  cta_href: string;
  image_src: string | null;
  overlay_opacity: number;
  is_active?: boolean;
  sort_order?: number;
};

const FALLBACK_SLIDES: Slide[] = [
  {
    id: 1,
    headline: "Bridal Sets That\nSteal the Show",
    subline: "Stunning AD & imitation bridal jewellery — from necklace sets to maang tikkas, crafted for your big day.",
    ctaLabel: "Shop Bridal",
    ctaHref: "/collections",
    overlayOpacity: 60,
    imageSrc: "https://res.cloudinary.com/dycznhzeg/image/upload/q_auto/f_auto/v1776432626/samples/ecommerce/analog-classic.jpg",
  },
  {
    id: 2,
    headline: "Sparkling AD\nJewellery",
    subline: "American Diamond jewellery that looks like real — bold, beautiful, and budget-friendly. Free shipping across India.",
    ctaLabel: "Explore AD Sets",
    ctaHref: "/collections",
    overlayOpacity: 55,
    imageSrc: "https://res.cloudinary.com/dycznhzeg/video/upload/q_auto/f_auto/v1776432632/samples/sea-turtle.mp4",
  },
  {
    id: 3,
    headline: "Gift Someone\nSpecial",
    subline: "Premium imitation jewellery gift sets with personalised notes. Perfect for weddings, festivals & celebrations.",
    ctaLabel: "Gift Now",
    ctaHref: "/collections",
    overlayOpacity: 60,
    imageSrc: "https://res.cloudinary.com/dycznhzeg/image/upload/q_auto/f_auto/v1776432632/samples/landscapes/landscape-panorama.jpg",
  },
];

function normalizeSlides(db: DbSlide[]): Slide[] {
  return db.map((s) => ({
    id: s.id,
    headline: s.headline,
    subline: s.subline,
    ctaLabel: s.cta_label,
    ctaHref: s.cta_href,
    imageSrc: s.image_src,
    overlayOpacity: s.overlay_opacity,
  }));
}

const EASE = [0.22, 1, 0.36, 1] as const;

const contentVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: EASE },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export function HeroBanner({ slides: dbSlides }: { slides?: DbSlide[] }) {
  const slides = dbSlides && dbSlides.length > 0 ? normalizeSlides(dbSlides) : FALLBACK_SLIDES;
  const [activeIndex, setActiveIndex] = useState(0);
  const isFirstMount = useRef(true);
  useEffect(() => { isFirstMount.current = false; }, []);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [goNext]);

  const slide = slides[Math.min(activeIndex, slides.length - 1)];

  return (
    <section
      className="relative w-full overflow-hidden bg-brand-navy"
      style={{ minHeight: "320px", height: "clamp(320px, 55vh, 580px)" }}
      aria-label="Hero banner"
    >
      {/* Background media — crossfade via AnimatePresence */}
      <AnimatePresence mode="sync">
        {slide.imageSrc && (
          <motion.div
            key={slide.imageSrc}
            className="absolute inset-0"
            initial={isFirstMount.current && activeIndex === 0 ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {isVideoUrl(slide.imageSrc) ? (
              <video
                src={slide.imageSrc}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            ) : (
              <Image
                src={slide.imageSrc}
                alt={slide.headline.replace("\n", " ")}
                fill
                className="object-cover object-center"
                priority={activeIndex === 0}
                sizes="100vw"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {slide.imageSrc ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, rgba(44,26,14,${slide.overlayOpacity / 100}) 40%, rgba(44,26,14,0.2) 100%)`,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/80 to-brand-navy/40" />
      )}

      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content — keyed by activeIndex so Framer re-animates on slide change */}
      <div className="container-site relative z-10 flex h-full items-center">
        <div className="max-w-[480px] py-10">
          <AnimatePresence mode="wait">
            <motion.div key={activeIndex}>
              <motion.p
                custom={0}
                variants={contentVariants}
                initial={isFirstMount.current ? "visible" : "hidden"}
                animate="visible"
                exit="exit"
                className="text-brand-gold-light text-xs font-semibold uppercase tracking-[0.2em] mb-4"
              >
                Premium Jewellery
              </motion.p>
              <motion.h1
                custom={0.07}
                variants={contentVariants}
                initial={isFirstMount.current ? "visible" : "hidden"}
                animate="visible"
                exit="exit"
                className="font-poppins text-white font-bold leading-tight mb-4"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
              >
                {slide.headline.split("\n").map((line: string, i: number) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </motion.h1>
              <motion.p
                custom={0.15}
                variants={contentVariants}
                initial={isFirstMount.current ? "visible" : "hidden"}
                animate="visible"
                exit="exit"
                className="text-white/80 text-sm md:text-base leading-relaxed mb-8 max-w-[380px]"
              >
                {slide.subline}
              </motion.p>
              <motion.div
                custom={0.22}
                variants={contentVariants}
                initial={isFirstMount.current ? "visible" : "hidden"}
                animate="visible"
                exit="exit"
                className="flex items-center gap-4"
              >
                <Link
                  href={slide.ctaHref}
                  className={cn(buttonVariants({ size: "lg" }), "bg-brand-gold hover:bg-brand-gold-muted text-white font-medium px-6 h-11")}
                >
                  {slide.ctaLabel}
                </Link>
                <Link
                  href="/collections"
                  aria-label="View all collections"
                  className="text-white/80 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
                >
                  View All
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators — button is 40px touch target; inner span is the visual dot */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex">
        {slides.map((_: Slide, i: number) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="flex h-10 w-10 items-center justify-center"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span
              style={{ transform: i === activeIndex ? "scaleX(4)" : "scaleX(1)" }}
              className={cn(
                "block h-2 w-2 rounded-full origin-left transition-transform duration-300",
                i === activeIndex ? "bg-brand-gold" : "bg-white/40"
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
