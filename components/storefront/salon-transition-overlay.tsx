"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function SalonTransitionOverlay() {
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
        router.push(href);
        setTimeout(() => { setVisible(false); setActive(false); }, 500);
      }, 1600);

      timers.current = [t1, t2];
    };

    window.addEventListener("goto-salon", handler);
    return () => {
      window.removeEventListener("goto-salon", handler);
      clearAll();
    };
  }, [router]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes overlayBarSlide {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes overlayDotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.7); }
          40%            { opacity: 1;   transform: scale(1.3); }
        }
      `}</style>

      {/* Overlay — bg-brand-navy matches our dark brand colour */}
      <div
        className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-brand-navy"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.28s ease" }}
      >
        {/* Top progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-gold/15 overflow-hidden">
          <div
            className="h-full bg-brand-gold"
            style={{
              transformOrigin: "left center",
              transform: active ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 1.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>

        {/* "Much Love" — body font (DM Sans) inherited from global */}
        <p className="text-[11px] tracking-[0.35em] uppercase text-brand-gold mb-6">
          Much Love
        </p>

        {/* Heading — h2 inherits Playfair Display + weight 600 from global base styles */}
        <h2
          className="text-brand-cream text-center mb-3.5"
          style={{ fontSize: "clamp(24px, 3.5vw, 36px)" }}
        >
          Entering Beauty Studio
        </h2>

        {/* Subtitle */}
        <p className="text-[11px] tracking-[0.18em] text-brand-text-light mb-10">
          One brand &nbsp;·&nbsp; Two experiences
        </p>

        {/* Animated dots */}
        <div className="flex gap-2.5 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand-gold"
              style={{
                animation: active
                  ? `overlayDotPulse 1.4s ${i * 0.22}s ease-in-out infinite`
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
