"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) || url.includes("/video/upload/");
}

/**
 * HOW TO ADD HERO BANNER MEDIA (image or video)
 * ──────────────────────────────────────────────
 * 1. Upload your banner image to Cloudinary:
 *    Go to Cloudinary Dashboard → Media Library → Upload
 *    Recommended size: 1400×580 px, JPG/WebP, under 500 KB
 *
 * 2. Copy the image URL from Cloudinary (looks like):
 *    https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123456/banner1.jpg
 *
 * 3. Paste it into the `imageSrc` field for the matching slide below.
 *
 * 4. Adjust `overlayOpacity` per slide (0–100) to keep text readable
 *    over your image. Lighter images → higher opacity (e.g. 70).
 *    Darker images → lower opacity (e.g. 40).
 *
 * Leave `imageSrc: null` to keep the plain gradient fallback.
 */
const slides = [
  {
    id: 1,
    headline: "Bridal Sets That\nSteal the Show",
    subline: "Stunning AD & imitation bridal jewellery — from necklace sets to maang tikkas, crafted for your big day.",
    cta: "Shop Bridal",
    ctaHref: "/collections/bridal",
    overlayOpacity: 60,
    imageSrc: "https://res.cloudinary.com/dycznhzeg/image/upload/q_auto/f_auto/v1776432626/samples/ecommerce/analog-classic.jpg",
  },
  {
    id: 2,
    headline: "Sparkling AD\nJewellery",
    subline: "American Diamond jewellery that looks like real — bold, beautiful, and budget-friendly. Free shipping across India.",
    cta: "Explore AD Sets",
    ctaHref: "/collections/ad-jewellery",
    overlayOpacity: 55,
    // imageSrc: null as string | null,
    imageSrc: "https://res.cloudinary.com/dycznhzeg/video/upload/q_auto/f_auto/v1776432632/samples/sea-turtle.mp4",
  },
  {
    id: 3,
    headline: "Gift Someone\nSpecial",
    subline: "Premium imitation jewellery gift sets with personalised notes. Perfect for weddings, festivals & celebrations.",
    cta: "Gift Now",
    ctaHref: "/collections",
    overlayOpacity: 60,
    // imageSrc: null as string | null,
    imageSrc: "https://res.cloudinary.com/dycznhzeg/image/upload/q_auto/f_auto/v1776432632/samples/landscapes/landscape-panorama.jpg",
  },
];

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

export function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % slides.length);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  }, []);

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
      {/* Background media — crossfade via AnimatePresence */}
      <AnimatePresence mode="sync">
        {slide.imageSrc && (
          <motion.div
            key={slide.imageSrc}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
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

      {/* Content — each element gets key={activeIndex} so Framer re-animates on slide change */}
      <div className="container-site relative z-10 flex h-full items-center">
        <div className="max-w-[480px] py-10">
          <AnimatePresence mode="wait">
            <motion.div key={activeIndex}>
              <motion.p
                custom={0}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-brand-gold-light text-xs font-semibold uppercase tracking-[0.2em] mb-4"
              >
                Premium Jewellery
              </motion.p>
              <motion.h1
                custom={0.07}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="font-poppins text-white font-bold leading-tight mb-4"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
              >
                {slide.headline.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </motion.h1>
              <motion.p
                custom={0.15}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-white/80 text-sm md:text-base leading-relaxed mb-8 max-w-[380px]"
              >
                {slide.subline}
              </motion.p>
              <motion.div
                custom={0.22}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex items-center gap-4"
              >
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
              </motion.div>
            </motion.div>
          </AnimatePresence>
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
