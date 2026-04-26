"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function JewelsTransitionOverlay() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => timers.current.forEach(clearTimeout);

  useEffect(() => {
    const handler = (e: Event) => {
      const href = (e as CustomEvent<{ href: string }>).detail.href;
      clearAll();

      setVisible(true);
      setActive(false);

      const t1 = setTimeout(() => setActive(true), 60);
      const t2 = setTimeout(() => {
        // startTransition is required when calling router.push() outside React's
        // synchronous event handling (e.g. inside setTimeout). Without it, Next.js
        // throws "Router action dispatched before initialization" in dev/Turbopack.
        startTransition(() => {
          router.push(href);
        });
      }, 1600);

      timers.current = [t1, t2];
    };

    window.addEventListener("goto-jewels", handler);
    return () => {
      window.removeEventListener("goto-jewels", handler);
      clearAll();
    };
  }, [router]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes jewelsBarSlide {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes jewelsDotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.7); }
          40%            { opacity: 1;   transform: scale(1.3); }
        }
        @keyframes jewelsSparkle {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 1; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
        style={{
          background: "#00192F",
          opacity: active ? 1 : 0,
          transition: "opacity 0.28s ease",
        }}
      >
        {/* Top progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden" style={{ background: "rgba(212,180,122,0.15)" }}>
          <div
            className="h-full"
            style={{
              background: "#D4B47A",
              transformOrigin: "left center",
              transform: active ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 1.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>

        {/* Sparkle row */}
        <div className="flex gap-3 mb-6">
          {["✦", "💎", "✦"].map((s, i) => (
            <span
              key={i}
              style={{
                fontSize: i === 1 ? 18 : 11,
                color: "#D4B47A",
                animation: active
                  ? `jewelsSparkle 1.8s ${i * 0.3}s ease-in-out infinite`
                  : "none",
                opacity: 0.3,
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Label */}
        <p style={{
          fontSize: 11,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#D4B47A",
          marginBottom: 20,
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}>
          Much Love
        </p>

        {/* Heading */}
        <h2
          className="text-center"
          style={{
            fontFamily: "var(--font-cormorant, Georgia, serif)",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 400,
            color: "#FAF8F3",
            letterSpacing: "0.04em",
            marginBottom: 12,
            lineHeight: 1.25,
          }}
        >
          Entering Jewel Atelier
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "rgba(250,248,243,0.45)",
          marginBottom: 40,
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}>
          One brand &nbsp;·&nbsp; Two experiences
        </p>

        {/* Animated dots */}
        <div className="flex gap-2.5 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#D4B47A",
                animation: active
                  ? `jewelsDotPulse 1.4s ${i * 0.22}s ease-in-out infinite`
                  : "none",
                opacity: 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
