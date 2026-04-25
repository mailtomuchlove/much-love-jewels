"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { BEFORE_AFTER_IMAGE } from "@/lib/salon/constants";

export function SalonBeforeAfter() {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!revealRef.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        revealRef.current!.style.opacity = "1";
        revealRef.current!.style.transform = "scale(1)";
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(revealRef.current);
    return () => io.disconnect();
  }, []);

  const getPercent = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 50;
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition(getPercent(e.clientX));
  };
  const onMouseDown = () => setDragging(true);
  const onMouseUp = () => setDragging(false);
  const onTouchMove = (e: React.TouchEvent) => setPosition(getPercent(e.touches[0].clientX));

  return (
    <section id="showcase" style={{ padding: "clamp(60px,10vw,120px) clamp(20px,6vw,80px)", background: "#F0EBE1" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <span style={{ display: "block", fontFamily: "var(--font-dm-sans)", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B8975A", marginBottom: 20 }}>
          Portfolio
        </span>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(42px, 5vw, 64px)", fontWeight: 300, color: "#1C1916", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          The <em style={{ fontStyle: "italic", color: "#B8975A" }}>transformation</em>
        </h2>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div
          ref={revealRef}
          style={{ opacity: 0, transform: "scale(0.97)", transition: "opacity 0.9s ease, transform 0.9s ease" }}
        >
          <div
            ref={containerRef}
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchMove={onTouchMove}
            onTouchStart={onMouseDown}
            onTouchEnd={onMouseUp}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              overflow: "hidden",
              userSelect: "none",
            }}
          >
            {/* After (behind, full width) */}
            <div style={{ position: "absolute", inset: 0 }}>
              <img
                src={BEFORE_AFTER_IMAGE.after}
                alt="After bridal makeup"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                draggable={false}
              />
              <span style={{ position: "absolute", bottom: 24, right: 24, fontFamily: "var(--font-dm-sans)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", padding: "6px 16px", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.7)" }}>
                After
              </span>
            </div>

            {/* Before (clipped) */}
            <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - position}% 0 0)` }}>
              <img
                src={BEFORE_AFTER_IMAGE.before}
                alt="Before makeup"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                draggable={false}
              />
              <span style={{ position: "absolute", bottom: 24, left: 24, fontFamily: "var(--font-dm-sans)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", padding: "6px 16px", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.7)" }}>
                Before
              </span>
            </div>

            {/* Divider */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${position}%`,
                width: 1,
                background: "rgba(255,255,255,0.7)",
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
            >
              {/* Handle */}
              <div
                onMouseDown={onMouseDown}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 40,
                  height: 40,
                  background: "#D4B47A",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  cursor: "ew-resize",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#1C1916" strokeWidth="1.5">
                  <polyline points="4,2 1,7 4,12" /><polyline points="10,2 13,7 10,12" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <p style={{ fontFamily: "var(--font-cormorant)", fontSize: 16, fontStyle: "italic", color: "#6B6259", letterSpacing: "0.05em" }}>
              &ldquo;I didn&apos;t recognize myself — in the most beautiful way possible.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
