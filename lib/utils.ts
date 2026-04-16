import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── shadcn utility ──────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Price Formatting ─────────────────────────────────────
const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format paise to ₹ rupees string. e.g. 99900 → "₹999" */
export function formatPrice(paise: number): string {
  return priceFormatter.format(paise / 100);
}

/** Convert paise (integer) to rupees (float). */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** Convert rupees to paise (integer). Always round. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Discount percentage between compare_price and price. */
export function discountPercent(
  price: number,
  comparePrice: number | null
): number | null {
  if (!comparePrice || comparePrice <= price) return null;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

// ─── Slug & ID Helpers ────────────────────────────────────
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, "0");
  return `MLJ-${year}-${rand}`;
}

// ─── Date Formatting ──────────────────────────────────────
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

// ─── String Helpers ───────────────────────────────────────
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "…";
}

export function formatAddress(address: {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
}): string {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);
  return parts.join(", ");
}

// ─── Cloudinary helpers (client-safe — no secrets) ───────
export function cloudinaryThumbUrl(publicId: string, size = 400): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${size},h_${size},c_fill/${publicId}`;
}

export function cloudinaryBlurUrl(publicId: string): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_10,w_20,e_blur:200/${publicId}`;
}
