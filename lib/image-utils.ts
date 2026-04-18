/** Hostnames that are configured in next.config.ts remotePatterns */
export const ALLOWED_IMAGE_HOSTS = ["res.cloudinary.com"] as const;

/** Returns true if the URL can safely be used with next/image */
export function isAllowedImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  // blob / data URLs are local — next/image handles them as-is
  if (url.startsWith("blob:") || url.startsWith("data:")) return true;
  // Relative paths are always fine
  if (url.startsWith("/")) return true;
  try {
    const { hostname } = new URL(url);
    return ALLOWED_IMAGE_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}
