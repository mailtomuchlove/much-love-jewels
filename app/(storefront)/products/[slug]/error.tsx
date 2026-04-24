"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-brand-cream px-4 text-center">
      <p className="text-5xl font-bold text-brand-gold mb-4">Oops</p>
      <h1 className="text-2xl font-bold text-brand-navy mb-2">
        Product unavailable
      </h1>
      <p className="text-brand-text-muted text-sm mb-8 max-w-sm">
        We couldn&apos;t load this product. Please try again or browse our collection.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-md bg-brand-navy text-white text-sm font-medium hover:bg-brand-navy-light transition-colors"
        >
          Try Again
        </button>
        <a
          href="/collections"
          className="px-6 py-2.5 rounded-md border border-brand-navy text-brand-navy text-sm font-medium hover:bg-brand-navy hover:text-white transition-colors"
        >
          Browse Collection
        </a>
      </div>
    </div>
  );
}
