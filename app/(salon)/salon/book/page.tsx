"use client";

import { useEffect } from "react";
import { WA_NUMBER, WA_MESSAGE } from "@/lib/salon/constants";

export default function BookPage() {
  useEffect(() => {
    window.location.href = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF8F3",
        gap: 16,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 32,
          fontWeight: 300,
          color: "#1C1916",
          letterSpacing: "0.04em",
        }}
      >
        Opening WhatsApp…
      </p>
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 13,
          color: "#6B6259",
          letterSpacing: "0.08em",
        }}
      >
        You&apos;ll be redirected to chat with us in a moment.
      </p>
    </div>
  );
}
