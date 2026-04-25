"use client";

import { useEffect, useRef } from "react";
import { SALON_STATS } from "@/lib/salon/constants";

export function SalonStats() {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statsRef.current) return;
    const items = statsRef.current.querySelectorAll<HTMLDivElement>(".salon-stat-item");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = Number(el.dataset.delay ?? 0);
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, delay);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach((el, i) => {
      el.dataset.delay = String(i * 120);
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={statsRef}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        background: "#FDFCFA",
        borderBottom: "1px solid #E8E0D0",
      }}
    >
      {SALON_STATS.map((stat, i) => (
        <div
          key={stat.label}
          className="salon-stat-item"
          style={{
            padding: "40px 48px",
            borderRight: i < SALON_STATS.length - 1 ? "1px solid #E8E0D0" : "none",
            opacity: 0,
            transform: "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 56,
              fontWeight: 300,
              color: "#1C1916",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {stat.num.replace(/[+%]/, "")}
            <em style={{ color: "#B8975A", fontStyle: "normal" }}>
              {stat.num.match(/[+%]/)?.[0] ?? ""}
            </em>
          </div>
          <div
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#6B6259",
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
