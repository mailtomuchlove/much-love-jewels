"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-cream px-4 text-center">
      <p className="text-5xl font-bold text-brand-gold mb-4">Oops</p>
      <h1 className="font-poppins text-2xl font-bold text-brand-navy mb-2">
        Something went wrong
      </h1>
      <p className="text-brand-text-muted text-sm mb-8 max-w-sm">
        An unexpected error occurred. Please try again or return home.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-md bg-brand-navy text-white text-sm font-medium hover:bg-brand-navy-light transition-colors"
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-6 py-2.5 rounded-md border border-brand-navy text-brand-navy text-sm font-medium hover:bg-brand-navy hover:text-white transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
