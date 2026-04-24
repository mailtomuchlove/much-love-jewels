import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // JSON-LD dangerouslySetInnerHTML + Razorpay SDK require unsafe-inline.
      // Dev mode: React HMR/error overlays require unsafe-eval (never used in production).
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // behold.pictures has no subdomain — must list bare domain alongside wildcard
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.cdninstagram.com https://*.fbcdn.net https://behold.pictures https://*.behold.pictures",
      // media-src must be explicit — videos fall back to default-src 'self' otherwise
      "media-src https://res.cloudinary.com",
      // Sentry replay creates a Web Worker from a blob URL
      "worker-src blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com",
      "frame-src https://api.razorpay.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Long-lived cache for public static assets (og image, SVGs, fonts)
        // Not immutable — filenames don't include a content hash
        source: "/:file+\\.(jpg|jpeg|png|webp|avif|svg|ico|woff2|ttf|eot)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.behold.pictures" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload wider set of client files for better source map coverage
  widenClientFileUpload: true,

  // Proxy Sentry requests through your domain (avoids ad blockers)
  tunnelRoute: "/monitoring",

  // Suppress Sentry CLI output during local builds
  silent: !process.env.CI,
});
