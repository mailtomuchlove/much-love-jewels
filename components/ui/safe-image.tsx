"use client";

import Image, { type ImageProps } from "next/image";
import { isAllowedImageUrl } from "@/lib/image-utils";
import { ImageOff } from "lucide-react";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallbackClassName?: string;
}

/**
 * Drop-in replacement for next/image that:
 * – Uses next/image when the hostname is in the allowed list
 * – Renders a styled placeholder (instead of crashing) for any other URL
 */
export function SafeImage({ src, alt, fallbackClassName, ...props }: SafeImageProps) {
  if (!src || !isAllowedImageUrl(src)) {
    return (
      <div
        className={
          fallbackClassName ??
          "flex h-full w-full items-center justify-center bg-brand-cream text-brand-border"
        }
        aria-label={alt as string}
      >
        <ImageOff className="h-6 w-6 opacity-40" />
      </div>
    );
  }

  return <Image src={src} alt={alt} {...props} />;
}
