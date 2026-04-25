"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { WA_NUMBER, WA_MESSAGE } from "@/lib/salon/constants";

export function SalonCta() {
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [eyebrowRef, titleRef, subRef, actionsRef];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.2 }
    );
    els.forEach((r, i) => {
      if (r.current) {
        r.current.style.transitionDelay = `${i * 0.1}s`;
        io.observe(r.current);
      }
    });
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="cta"
      style={{
        position: "relative",
        padding: "clamp(80px,12vw,160px) clamp(20px,6vw,80px)",
        background: "#1C1916",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* Glow rings */}
      {[400, 600, 800].map((size, i) => (
        <div
          key={size}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: size, height: size,
            borderRadius: "50%",
            border: "1px solid rgba(184,151,90,0.08)",
            animation: `salonRingExpand 4s ease-in-out ${i}s infinite`,
          }}
        />
      ))}
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,151,90,0.08) 0%, transparent 70%)",
          animation: "salonGlowPulse 4s ease-in-out infinite",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <span
          ref={eyebrowRef}
          style={{
            display: "block",
            fontFamily: "var(--font-dm-sans)",
            fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase",
            color: "#B8975A", marginBottom: 24,
            opacity: 0, transform: "translateY(12px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          Your Day Is Coming
        </span>
        <h2
          ref={titleRef}
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 300,
            color: "#FDFCFA", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.01em",
            opacity: 0, transform: "translateY(24px)",
            transition: "opacity 0.9s ease, transform 0.9s ease",
          }}
        >
          Begin your <em style={{ fontStyle: "italic", color: "#D4B47A" }}>beautiful</em><br />transformation
        </h2>
        <p
          ref={subRef}
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,0.45)",
            marginBottom: 56, letterSpacing: "0.05em",
            opacity: 0, transform: "translateY(16px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          Consultations available by appointment · Chennai &amp; surrounding areas
        </p>
        <div
          ref={actionsRef}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap",
            opacity: 0, transform: "translateY(16px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <Link
            href="/salon/book"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-dm-sans)", fontSize: 11, fontWeight: 400,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#1C1916", background: "#D4B47A",
              padding: "18px 48px", textDecoration: "none",
              position: "relative", overflow: "hidden",
              transition: "background 0.35s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#B8975A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#D4B47A"; }}
          >
            Book Appointment
          </Link>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-dm-sans)", fontSize: 11, fontWeight: 400,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "18px 40px", textDecoration: "none",
              transition: "color 0.3s, border-color 0.3s, background 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#D4B47A";
              e.currentTarget.style.borderColor = "#B8975A";
              e.currentTarget.style.background = "rgba(184,151,90,0.07)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.65)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            WhatsApp Us
          </a>
        </div>
      </div>

      <style>{`
        @keyframes salonGlowPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        }
        @keyframes salonRingExpand {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </section>
  );
}
