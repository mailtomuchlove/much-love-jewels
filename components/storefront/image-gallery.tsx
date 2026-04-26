"use client";

import { useState, useCallback, useEffect } from "react";
import { CldImage } from "next-cloudinary";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { cloudinaryBlurUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  publicIds: string[];
  fallbackImages?: string[];
  productName: string;
}

export function ImageGallery({
  publicIds,
  fallbackImages = [],
  productName,
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const total = publicIds.length || fallbackImages.length;
  const hasCloudinary = publicIds.length > 0;

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, goNext, goPrev]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  }

  const activePublicId = hasCloudinary ? publicIds[activeIndex] : null;
  const activeFallback = fallbackImages[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-brand-cream cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setLightboxOpen(true)}
      >
        {activePublicId ? (
          <CldImage
            src={activePublicId}
            alt={`${productName} — image ${activeIndex + 1}`}
            width={800}
            height={800}
            crop="fill"
            gravity="center"
            format="auto"
            quality="auto"
            effects={[{ sharpen: "60" }]}
            sizes="(max-width: 768px) 100vw, 600px"
            className={cn(
              "object-cover w-full h-full transition-transform duration-200",
              isZoomed && "scale-150"
            )}
            style={
              isZoomed
                ? {
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  }
                : undefined
            }
            placeholder="blur"
            blurDataURL={cloudinaryBlurUrl(activePublicId)}
            priority={activeIndex === 0}
          />
        ) : activeFallback ? (
          <SafeImage
            src={activeFallback}
            alt={`${productName} — image ${activeIndex + 1}`}
            fill
            className="object-cover"
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : null}

        {/* Navigation arrows */}
        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full bg-white/90 shadow-md text-brand-navy hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full bg-white/90 shadow-md text-brand-navy hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-white text-xs pointer-events-none md:flex hidden">
          <ZoomIn className="h-3 w-3" />
          <span>Click to expand</span>
        </div>
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(hasCloudinary ? publicIds : fallbackImages).map((src, idx) => (
            <button
              key={src}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative flex-shrink-0 h-[72px] w-[72px] overflow-hidden rounded-sm border-2 transition-all duration-150",
                idx === activeIndex
                  ? "border-brand-gold"
                  : "border-transparent hover:border-brand-border"
              )}
              aria-label={`View image ${idx + 1}`}
            >
              {hasCloudinary ? (
                <CldImage
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  width={80}
                  height={80}
                  crop="fill"
                  format="auto"
                  quality="auto"
                  className="object-cover w-full h-full"
                />
              ) : (
                <SafeImage
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — full-screen layout matching reference */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[500] flex bg-black/85"
          onClick={() => setLightboxOpen(false)}
        >
          {/* LEFT STRIP — thumbnails at top, left arrow centered below */}
          <div className="flex-shrink-0 flex flex-col" style={{ width: 80 }}>
            {/* Thumbnails */}
            {total > 1 && (
              <div className="flex flex-col gap-2 p-3 pt-8">
                {(hasCloudinary ? publicIds : fallbackImages).map((src, idx) => (
                  <button
                    key={src}
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                    className={cn(
                      "relative flex-shrink-0 overflow-hidden border-2 transition-all duration-150",
                      idx === activeIndex
                        ? "border-brand-gold"
                        : "border-white/20 hover:border-white/50"
                    )}
                    style={{ width: 54, height: 54 }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    {hasCloudinary ? (
                      <CldImage
                        src={src}
                        alt={`Thumbnail ${idx + 1}`}
                        width={70}
                        height={70}
                        crop="fill"
                        format="auto"
                        quality="auto"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <SafeImage src={src} alt="" fill className="object-cover" sizes="70px" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Left arrow — centered in remaining space */}
            {total > 1 && (
              <div className="flex-1 flex items-center justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="h-11 w-11 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>

          {/* CENTER — large image area, cream background */}
          <div
            className="relative flex-1"
            style={{ background: "#F5F0EB" }}
            onClick={(e) => e.stopPropagation()}
          >
            {activePublicId ? (
              <CldImage
                src={activePublicId}
                alt={`${productName} — image ${activeIndex + 1}`}
                fill
                crop="pad"
                gravity="center"
                format="auto"
                quality="auto"
                sizes="80vw"
                style={{ objectFit: "contain" }}
              />
            ) : activeFallback ? (
              <SafeImage
                src={activeFallback}
                alt={`${productName} — image ${activeIndex + 1}`}
                fill
                style={{ objectFit: "contain" }}
                sizes="80vw"
              />
            ) : null}
          </div>

          {/* RIGHT STRIP — close at top, right arrow centered below */}
          <div className="flex-shrink-0 flex flex-col" style={{ width: 68 }}>
            {/* Close button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Right arrow — centered in remaining space */}
            {total > 1 && (
              <div className="flex-1 flex items-center justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="h-11 w-11 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
