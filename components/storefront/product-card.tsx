"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { motion } from "framer-motion";
import { formatPrice, discountPercent, cloudinaryBlurUrl } from "@/lib/utils";
import { SafeImage } from "@/components/ui/safe-image";
import type { Product, Category } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";
import { STOCK_LOW_THRESHOLD } from "@/utils/constants";

export type ProductCardData = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "price"
  | "compare_price"
  | "images"
  | "image_public_ids"
  | "stock"
  | "material"
> & {
  categories?: Pick<Category, "name" | "slug"> | null;
};

interface ProductCardProps {
  product: ProductCardData;
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    id,
    name,
    slug,
    price,
    compare_price,
    images,
    image_public_ids,
    stock,
    categories,
  } = product;

  const discount = discountPercent(price, compare_price ?? null);
  const isLowStock = stock > 0 && stock <= STOCK_LOW_THRESHOLD;
  const isOutOfStock = stock === 0;

  const publicId = image_public_ids?.[0];
  const fallbackImage = images?.[0];

  return (
    <motion.div
      className="group relative bg-white rounded-md overflow-hidden card-drop-shadow"
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discount && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-gold text-white text-xs font-medium">
            {discount}% off
          </span>
        )}
        {isLowStock && !isOutOfStock && (
          <span className="badge-stock-low">
            Only {stock} left!
          </span>
        )}
        {isOutOfStock && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
            Out of stock
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <div className="absolute top-3 right-3 z-10">
        <WishlistButton productId={id} />
      </div>

      {/* Image */}
      <Link href={`/products/${slug}`} className="block aspect-square overflow-hidden bg-brand-cream">
        {publicId ? (
          <CldImage
            src={publicId}
            alt={name}
            width={400}
            height={400}
            crop="fill"
            gravity="center"
            format="auto"
            quality="auto"
            effects={[{ sharpen: "50" }]}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            placeholder="blur"
            blurDataURL={cloudinaryBlurUrl(publicId)}
          />
        ) : fallbackImage ? (
          <SafeImage
            src={fallbackImage}
            alt={name}
            width={400}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-border">
            <Heart className="h-12 w-12 opacity-30" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {categories && (
          <p className="text-xs text-brand-text-muted mb-1 uppercase tracking-wide">
            {categories.name}
          </p>
        )}
        <Link href={`/products/${slug}`}>
          <h3 className="text-sm font-medium text-brand-text leading-snug mb-2 line-clamp-2 hover:text-brand-navy transition-colors">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-semibold text-brand-navy">
            {formatPrice(price)}
          </span>
          {compare_price && compare_price > price && (
            <span className="text-sm text-brand-text-muted line-through">
              {formatPrice(compare_price)}
            </span>
          )}
        </div>

        <AddToCartButton
          productId={id}
          stock={stock}
          product={{ id, name, slug, images, image_public_ids, price }}
          className="w-full h-9 text-sm"
        />
      </div>
    </motion.div>
  );
}
