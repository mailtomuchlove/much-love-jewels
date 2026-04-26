"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SalonHero() {
  const heroRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleLinesRef = useRef<HTMLSpanElement[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: ReturnType<typeof gsap.context> | null = null;
    try {
      ctx = gsap.context(() => {
        // Parallax on hero bg while scrolling — skip if cross-origin frame blocks window.constructor
        if (bgRef.current) {
          gsap.to(bgRef.current, {
            y: "20%",
            ease: "none",
            scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
          });
        }
      }, heroRef);
    } catch {
      // ScrollTrigger iframe detection throws SecurityError in cross-origin frames; skip parallax
    }

    // Entry animations (CSS-driven via loaded class)
    const timer = setTimeout(() => {
      if (!heroRef.current) return;
      if (lineRef.current) lineRef.current.style.height = "220px";
      if (eyebrowRef.current) { eyebrowRef.current.style.opacity = "1"; eyebrowRef.current.style.transform = "translateY(0)"; }
      titleLinesRef.current.forEach((el) => { if (el) el.style.transform = "translateY(0)"; });
      if (subtitleRef.current) { subtitleRef.current.style.opacity = "1"; subtitleRef.current.style.transform = "translateY(0)"; }
      if (ctaRef.current) { ctaRef.current.style.opacity = "1"; ctaRef.current.style.transform = "translateY(0)"; }
      if (scrollHintRef.current) { scrollHintRef.current.style.opacity = "1"; }
    }, 120);

    return () => {
      clearTimeout(timer);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      style={{ position: "relative", height: "100vh", minHeight: 700, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#1C1916" }}
    >
      {/* Background */}
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset: "-20%",
          background: "linear-gradient(160deg, rgba(28,25,22,0.55) 0%, rgba(184,151,90,0.08) 50%, rgba(28,25,22,0.8) 100%), #2A2420",
        }}
      />

      {/* Grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
        }}
      />

      {/* Right image zone */}
      <div
        style={{
          position: "absolute",
          right: 0, top: 0, bottom: 0,
          width: "55%",
          overflow: "hidden",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80"
          alt="Bridal beauty"
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #1C1916 0%, transparent 40%)" }} />
      </div>

      {/* Left decorative line — hidden on mobile */}
      <div
        ref={lineRef}
        className="hidden md:block"
        style={{
          position: "absolute",
          left: 56,
          top: "50%",
          transform: "translateY(-50%)",
          width: 1,
          height: 0,
          background: "linear-gradient(to bottom, transparent, #D4B47A, transparent)",
          transition: "height 1.8s 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 820, padding: "0 32px" }}>
        <p
          ref={eyebrowRef}
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "#D4B47A",
            marginBottom: 28,
            opacity: 0,
            transform: "translateY(12px)",
            transition: "opacity 0.8s 0.2s ease, transform 0.8s 0.2s ease",
          }}
        >
          Mumbai&apos;s Premier Bridal Atelier
        </p>

        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(58px, 8vw, 110px)",
            fontWeight: 300,
            lineHeight: 0.95,
            color: "#FDFCFA",
            letterSpacing: "-0.01em",
            marginBottom: 32,
          }}
        >
          {(["The Art of", "Becoming", "Beautiful"] as const).map((line, i) => (
            <span key={i} style={{ display: "block", overflow: "hidden" }}>
              <span
                ref={(el) => { if (el) titleLinesRef.current[i] = el; }}
                style={{
                  display: "block",
                  transform: "translateY(100%)",
                  transition: `transform 0.9s ${0.1 * i}s cubic-bezier(0.16,1,0.3,1)`,
                  fontStyle: i === 1 ? "italic" : "normal",
                  color: i === 1 ? "#D4B47A" : "#FDFCFA",
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p
          ref={subtitleRef}
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 14,
            fontWeight: 300,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.6)",
            marginBottom: 48,
            opacity: 0,
            transform: "translateY(16px)",
            transition: "opacity 0.8s 0.8s ease, transform 0.8s 0.8s ease",
          }}
        >
          Where every brushstroke is a love letter to the woman you are
        </p>

        <div
          ref={ctaRef}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            opacity: 0,
            transform: "translateY(16px)",
            transition: "opacity 0.8s 1s ease, transform 0.8s 1s ease",
          }}
        >
          <Link
            href="/salon/book"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-dm-sans)",
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#1C1916",
              background: "#D4B47A",
              padding: "16px 40px",
              textDecoration: "none",
              position: "relative",
              overflow: "hidden",
              transition: "color 0.35s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#B8975A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#D4B47A"; }}
          >
            Book Your Appointment
          </Link>
          <button
            onClick={() => document.querySelector("#story")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-dm-sans)",
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
              background: "none",
              border: "none",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#D4B47A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            Our Story
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
              <line x1="2" y1="8" x2="14" y2="8" />
              <polyline points="10,4 14,8 10,12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        ref={scrollHintRef}
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          opacity: 0,
          transition: "opacity 0.8s 1.6s ease",
        }}
      >
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: 48,
            background: "linear-gradient(to bottom, rgba(184,151,90,0.5), transparent)",
            animation: "salonScrollPulse 2s 2s infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes salonScrollPulse {
          0%, 100% { opacity: 0.5; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }
      `}</style>
    </section>
  );
}
