"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCROLL_STORY_PANELS } from "@/lib/salon/constants";

gsap.registerPlugin(ScrollTrigger);

export function SalonScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const slider = sliderRef.current;
    if (!container || !slider) return;

    const ctx = gsap.context(() => {
      gsap.to(slider, {
        x: () => -(slider.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 1,
          snap: 1 / (SCROLL_STORY_PANELS.length - 1),
          end: () => `+=${slider.scrollWidth}`,
          invalidateOnRefresh: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ overflow: "hidden", background: "#1C1916" }}
    >
      <div
        ref={sliderRef}
        style={{ display: "flex", width: `${SCROLL_STORY_PANELS.length * 100}vw` }}
      >
        {SCROLL_STORY_PANELS.map((panel, i) => (
          <div
            key={i}
            style={{
              width: "100vw",
              height: "100vh",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <img
              src={panel.image}
              alt={panel.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(28,25,22,0.85) 0%, rgba(28,25,22,0.3) 50%, transparent 100%)",
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 2,
                textAlign: "center",
                padding: "0 48px",
                maxWidth: 640,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "#D4B47A",
                  marginBottom: 16,
                }}
              >
                {String(i + 1).padStart(2, "0")} — {panel.subtitle}
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(36px, 5vw, 64px)",
                  fontWeight: 300,
                  color: "#FDFCFA",
                  lineHeight: 1.1,
                  marginBottom: 20,
                  letterSpacing: "-0.01em",
                }}
              >
                {panel.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: 14,
                  fontWeight: 300,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                {panel.text}
              </p>
            </div>

            {/* Slide indicator */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                right: 48,
                display: "flex",
                gap: 8,
              }}
            >
              {SCROLL_STORY_PANELS.map((_, j) => (
                <div
                  key={j}
                  style={{
                    width: j === i ? 24 : 6,
                    height: 1,
                    background: j === i ? "#D4B47A" : "rgba(255,255,255,0.3)",
                    transition: "width 0.3s",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
