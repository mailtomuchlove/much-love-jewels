"use client";

import { useState, useEffect, useRef } from "react";
import { SALON_TESTIMONIALS } from "@/lib/salon/constants";

export function SalonTestimonials() {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const CARD_WIDTH = 380;
  const GAP = 24;

  useEffect(() => {
    if (!trackRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.15 }
    );
    trackRef.current.querySelectorAll<HTMLElement>(".t-card").forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.08}s`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(SALON_TESTIMONIALS.length - 1, i + 1));

  return (
    <section id="testimonials" style={{ padding: "120px 0", background: "#FDFCFA", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "0 80px", marginBottom: 72 }}>
        <span style={{ display: "block", fontFamily: "var(--font-dm-sans)", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B8975A", marginBottom: 20 }}>
          Words of Love
        </span>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(42px, 5vw, 64px)", fontWeight: 300, color: "#1C1916", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          Stories from our <em style={{ fontStyle: "italic", color: "#B8975A" }}>brides</em>
        </h2>
      </div>

      {/* Track wrapper with fade edges */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: 120, zIndex: 2,
            background: "linear-gradient(to right, #FDFCFA, transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 120, zIndex: 2,
            background: "linear-gradient(to left, #FDFCFA, transparent)",
            pointerEvents: "none",
          }}
        />

        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: GAP,
            padding: "0 80px 20px",
            transform: `translateX(-${idx * (CARD_WIDTH + GAP)}px)`,
            transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {SALON_TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="t-card"
              style={{
                flexShrink: 0,
                width: CARD_WIDTH,
                background: "#FAF8F3",
                padding: "40px 40px 36px",
                position: "relative",
                border: "1px solid #E8E0D0",
                opacity: 0,
                transform: "translateY(20px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
              }}
            >
              {/* Gold top bar */}
              <div style={{ position: "absolute", top: 0, left: 40, width: 32, height: 2, background: "#B8975A" }} />

              {/* Stars */}
              <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    style={{
                      width: 12, height: 12,
                      background: "#B8975A",
                      clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                    }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p style={{ fontFamily: "var(--font-cormorant)", fontSize: 18, fontWeight: 300, fontStyle: "italic", lineHeight: 1.7, color: "#1C1916", marginBottom: 28 }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: "50%", background: "#E8E0D0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-cormorant)", fontSize: 16, color: "#6B6259",
                    flexShrink: 0,
                  }}
                >
                  {t.initial}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, fontWeight: 500, color: "#1C1916", letterSpacing: "0.05em" }}>{t.name}</div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "#6B6259", letterSpacing: "0.08em" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 48 }}>
        <NavBtn onClick={prev} disabled={idx === 0} dir="prev" />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {SALON_TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background: i === idx ? "#B8975A" : "#E8E0D0",
                border: "none",
                padding: 0,
                transition: "width 0.3s, background 0.3s",
              }}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        <NavBtn onClick={next} disabled={idx === SALON_TESTIMONIALS.length - 1} dir="next" />
      </div>
    </section>
  );
}

function NavBtn({ onClick, disabled, dir }: { onClick: () => void; disabled: boolean; dir: "prev" | "next" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={dir === "prev" ? "Previous" : "Next"}
      style={{
        width: 48, height: 48,
        border: `1px solid ${hovered && !disabled ? "#1C1916" : "#E8E0D0"}`,
        background: hovered && !disabled ? "#1C1916" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.35 : 1,
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={hovered && !disabled ? "#FDFCFA" : "#6B6259"} strokeWidth="1.5">
        {dir === "prev"
          ? <polyline points="9,2 4,7 9,12" />
          : <polyline points="5,2 10,7 5,12" />
        }
      </svg>
    </button>
  );
}
