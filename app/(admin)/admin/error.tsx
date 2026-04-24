"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function AdminError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-bold text-red-400 mb-4">!</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin error</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        Something went wrong in the admin panel. The error has been reported.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-md bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Try Again
        </button>
        <a
          href="/admin"
          className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Admin Home
        </a>
      </div>
    </div>
  );
}
