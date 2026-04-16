"use client";

import { useState, useCallback } from "react";
import { CldImage } from "next-cloudinary";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
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

  const total = publicIds.length || fallbackImages.length;
  const hasCloudinary = publicIds.length > 0;

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

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
          <Image
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
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-white/90 shadow-md text-brand-navy hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-white/90 shadow-md text-brand-navy hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-white text-xs pointer-events-none md:flex hidden">
          <ZoomIn className="h-3 w-3" />
          <span>Hover to zoom</span>
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
                <Image
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
    </div>
  );
}
