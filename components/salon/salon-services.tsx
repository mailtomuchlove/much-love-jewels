"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SALON_SERVICES } from "@/lib/salon/constants";

gsap.registerPlugin(ScrollTrigger);

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  bridal: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#B8975A" strokeWidth="1">
      <circle cx="22" cy="22" r="18" /><circle cx="22" cy="22" r="10" />
      <line x1="22" y1="4" x2="22" y2="8" /><line x1="22" y1="36" x2="22" y2="40" />
      <line x1="4" y1="22" x2="8" y2="22" /><line x1="36" y1="22" x2="40" y2="22" />
    </svg>
  ),
  party: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#B8975A" strokeWidth="1">
      <path d="M10 34 Q22 16 34 34" /><circle cx="22" cy="14" r="5" />
      <line x1="14" y1="28" x2="30" y2="28" />
    </svg>
  ),
  hd: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#B8975A" strokeWidth="1">
      <rect x="10" y="10" width="24" height="24" rx="1" /><circle cx="22" cy="22" r="6" />
      <line x1="22" y1="4" x2="22" y2="10" /><line x1="22" y1="34" x2="22" y2="40" />
      <line x1="4" y1="22" x2="10" y2="22" /><line x1="34" y1="22" x2="40" y2="22" />
    </svg>
  ),
  hair: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#B8975A" strokeWidth="1">
      <path d="M16 8 C16 8 12 18 18 26 C24 34 28 36 22 40" />
      <path d="M22 8 C22 8 18 20 24 28 C28 34 32 38 26 40" />
      <path d="M28 10 C28 10 32 20 30 30" />
    </svg>
  ),
};

export function SalonServices() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        grid.querySelectorAll<HTMLElement>(".s-card"),
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: grid, start: "top 75%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      style={{ padding: "clamp(60px,10vw,120px) clamp(20px,6vw,80px)", background: "#FAF8F3" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <SectionEyebrow>Our Expertise</SectionEyebrow>
        <SectionTitle>Every <em style={{ fontStyle: "italic", color: "#B8975A" }}>occasion</em>, reimagined</SectionTitle>
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
          background: "#E8E0D0",
        }}
      >
        {SALON_SERVICES.map((service) => (
          <ServiceCard key={service.num} service={service} />
        ))}
      </div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { ref.current!.style.opacity = "1"; ref.current!.style.transform = "translateY(0)"; io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} style={{ display: "block", fontFamily: "var(--font-dm-sans)", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B8975A", marginBottom: 20, opacity: 0, transform: "translateY(12px)", transition: "opacity 0.6s, transform 0.6s" }}>
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { ref.current!.style.opacity = "1"; ref.current!.style.transform = "translateY(0)"; io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <h2 ref={ref} style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(42px, 5vw, 64px)", fontWeight: 300, color: "#1C1916", lineHeight: 1.1, letterSpacing: "-0.01em", opacity: 0, transform: "translateY(20px)", transition: "opacity 0.8s 0.1s, transform 0.8s 0.1s" }}>
      {children}
    </h2>
  );
}

function ServiceCard({ service }: { service: typeof SALON_SERVICES[number] }) {
  const ref = useRef<HTMLDivElement>(null);

  const onEnter = () => {
    if (!ref.current) return;
    const overlay = ref.current.querySelector<HTMLElement>(".s-overlay");
    const name = ref.current.querySelector<HTMLElement>(".s-name");
    const desc = ref.current.querySelector<HTMLElement>(".s-desc");
    const price = ref.current.querySelector<HTMLElement>(".s-price");
    const num = ref.current.querySelector<HTMLElement>(".s-num");
    const arrow = ref.current.querySelector<HTMLElement>(".s-arrow");
    const icon = ref.current.querySelector<HTMLElement>(".s-icon svg");
    if (overlay) overlay.style.transform = "scaleY(1)";
    if (name) name.style.color = "#FDFCFA";
    if (desc) desc.style.color = "rgba(255,255,255,0.5)";
    if (price) price.style.color = "#D4B47A";
    if (num) num.style.color = "#D4B47A";
    if (arrow) { arrow.style.borderColor = "rgba(255,255,255,0.2)"; arrow.style.transform = "rotate(45deg)"; }
    if (icon) icon.setAttribute("stroke", "#D4B47A");
  };

  const onLeave = () => {
    if (!ref.current) return;
    const overlay = ref.current.querySelector<HTMLElement>(".s-overlay");
    const name = ref.current.querySelector<HTMLElement>(".s-name");
    const desc = ref.current.querySelector<HTMLElement>(".s-desc");
    const price = ref.current.querySelector<HTMLElement>(".s-price");
    const num = ref.current.querySelector<HTMLElement>(".s-num");
    const arrow = ref.current.querySelector<HTMLElement>(".s-arrow");
    const icon = ref.current.querySelector<HTMLElement>(".s-icon svg");
    if (overlay) overlay.style.transform = "scaleY(0)";
    if (name) name.style.color = "#1C1916";
    if (desc) desc.style.color = "#6B6259";
    if (price) price.style.color = "#1C1916";
    if (num) num.style.color = "#B8975A";
    if (arrow) { arrow.style.borderColor = "#E8E0D0"; arrow.style.transform = "rotate(0deg)"; }
    if (icon) icon.setAttribute("stroke", "#B8975A");
  };

  return (
    <div
      ref={ref}
      className="s-card"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        background: "#FDFCFA",
        padding: "48px 36px 44px",
        position: "relative",
        overflow: "hidden",
        opacity: 0,
      }}
    >
      {/* Hover overlay */}
      <div
        className="s-overlay"
        style={{
          position: "absolute",
          inset: 0,
          background: "#1C1916",
          transform: "scaleY(0)",
          transformOrigin: "bottom",
          transition: "transform 0.5s cubic-bezier(0.76,0,0.24,1)",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="s-icon" style={{ width: 44, height: 44, marginBottom: 32 }}>
          {SERVICE_ICONS[service.icon]}
        </div>
        <div className="s-num" style={{ fontFamily: "var(--font-cormorant)", fontSize: 11, letterSpacing: "0.25em", color: "#B8975A", marginBottom: 16, transition: "color 0.4s" }}>
          {service.num} —
        </div>
        <h3 className="s-name" style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, fontWeight: 400, color: "#1C1916", lineHeight: 1.2, marginBottom: 16, transition: "color 0.4s" }}>
          {service.name}
        </h3>
        <p className="s-desc" style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, fontWeight: 300, lineHeight: 1.8, color: "#6B6259", marginBottom: 32, transition: "color 0.4s" }}>
          {service.desc}
        </p>
        <div className="s-price" style={{ fontFamily: "var(--font-cormorant)", fontSize: 20, fontWeight: 300, color: "#1C1916", transition: "color 0.4s" }}>
          {service.price} <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.1em", color: "#6B6259" }}>{service.unit}</span>
        </div>
        <div
          className="s-arrow"
          style={{
            position: "absolute",
            bottom: 36,
            right: 36,
            width: 32,
            height: 32,
            border: "1px solid #E8E0D0",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.4s, transform 0.3s",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6B6259" strokeWidth="1">
            <line x1="2" y1="6" x2="10" y2="6" /><polyline points="7,3 10,6 7,9" />
          </svg>
        </div>
      </div>
    </div>
  );
}
