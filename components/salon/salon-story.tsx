"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STICKY_STORY_PANELS, STORY_IMAGE } from "@/lib/salon/constants";

gsap.registerPlugin(ScrollTrigger);

export function SalonStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Parallax on sticky image
      if (imageInnerRef.current) {
        gsap.to(imageInnerRef.current, {
          y: 60,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
      }
    }, section);

    // IntersectionObserver for right panels
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateX(0)";
          }
        });
      },
      { threshold: 0.25 }
    );

    panelRefs.current.forEach((el) => el && io.observe(el));

    return () => {
      ctx.revert();
      io.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="story"
      style={{ background: "#1C1916" }}
    >
      <style>{`
        @media (max-width: 767px) {
          .salon-story-wrap { flex-direction: column !important; }
          .salon-story-left { position: relative !important; width: 100% !important; height: 60vw !important; max-height: 420px !important; padding: 24px !important; }
          .salon-story-right { width: 100% !important; padding: 48px 24px 80px !important; gap: 64px !important; }
        }
      `}</style>
      <div className="salon-story-wrap" style={{ display: "flex", alignItems: "stretch", minHeight: "100vh" }}>
        {/* Left: sticky image */}
        <div
          className="salon-story-left"
          style={{
            position: "sticky",
            top: 0,
            width: "50%",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 60px 80px 80px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", maxHeight: "80vh", overflow: "hidden" }}>
            <div
              ref={imageInnerRef}
              style={{ position: "absolute", inset: "-20%", overflow: "hidden" }}
            >
              <img
                src={STORY_IMAGE}
                alt="Salon artistry"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {/* Decorative frame */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "1px solid rgba(212,180,122,0.12)",
                pointerEvents: "none",
              }}
            >
              {/* Corner brackets via CSS – top left */}
              <div style={{ position: "absolute", top: 12, left: 12, width: 20, height: 20, borderTop: "1px solid #B8975A", borderLeft: "1px solid #B8975A" }} />
              {/* Bottom right */}
              <div style={{ position: "absolute", bottom: 12, right: 12, width: 20, height: 20, borderBottom: "1px solid #B8975A", borderRight: "1px solid #B8975A" }} />
            </div>
          </div>
        </div>

        {/* Right: scrolling panels */}
        <div
          className="salon-story-right"
          style={{
            width: "50%",
            padding: "120px 80px 120px 60px",
            display: "flex",
            flexDirection: "column",
            gap: 100,
          }}
        >
          {STICKY_STORY_PANELS.map((panel, i) => (
            <div
              key={i}
              ref={(el) => { if (el) panelRefs.current[i] = el; }}
              style={{
                opacity: 0,
                transform: "translateX(32px)",
                transition: "opacity 0.9s ease, transform 0.9s ease",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: 10,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "#B8975A",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span style={{ display: "block", width: 32, height: 1, background: "#B8975A", flexShrink: 0 }} />
                {panel.eyebrow}
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(36px, 4vw, 52px)",
                  fontWeight: 300,
                  color: "#FDFCFA",
                  lineHeight: 1.15,
                  marginBottom: 24,
                  letterSpacing: "-0.01em",
                }}
              >
                {panel.heading.map((part, j) =>
                  part === panel.italic ? (
                    <em key={j} style={{ fontStyle: "italic", color: "#D4B47A" }}>{part}</em>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: 14,
                  fontWeight: 300,
                  lineHeight: 1.9,
                  color: "rgba(255,255,255,0.5)",
                  maxWidth: 400,
                }}
              >
                {panel.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
