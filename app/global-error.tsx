"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fdf8f2",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div>
          <p style={{ fontSize: "3rem", fontWeight: 700, color: "#c9a84c", margin: "0 0 1rem" }}>
            Oops
          </p>
          <h1 style={{ fontSize: "1.5rem", color: "#00192F", margin: "0 0 0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 2rem" }}>
            An unexpected error occurred. Please try again.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.625rem 1.5rem",
                borderRadius: "0.375rem",
                backgroundColor: "#00192F",
                color: "#fff",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: "0.625rem 1.5rem",
                borderRadius: "0.375rem",
                border: "1px solid #00192F",
                color: "#00192F",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
