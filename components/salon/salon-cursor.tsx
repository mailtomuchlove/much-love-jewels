"use client";

import { useEffect, useRef } from "react";

export function SalonCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const styleEl = document.createElement("style");
    styleEl.id = "salon-cursor-style";
    styleEl.textContent = "body.salon-active, body.salon-active * { cursor: none !important; }";
    document.head.appendChild(styleEl);
    document.body.classList.add("salon-active");

    let mx = 0, my = 0, rx = 0, ry = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    };

    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    const onEnter = () => {
      dot.style.width = "14px";
      dot.style.height = "14px";
      dot.style.backgroundColor = "#C9A097";
      ring.style.width = "56px";
      ring.style.height = "56px";
      ring.style.opacity = "0.3";
    };
    const onLeave = () => {
      dot.style.width = "8px";
      dot.style.height = "8px";
      dot.style.backgroundColor = "#B8975A";
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.opacity = "0.6";
    };

    const attachObserver = new MutationObserver(() => {
      document.querySelectorAll("a, button").forEach((el) => {
        if (!(el as HTMLElement).dataset.cursorBound) {
          (el as HTMLElement).dataset.cursorBound = "1";
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
        }
      });
    });
    attachObserver.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll("a, button").forEach((el) => {
      (el as HTMLElement).dataset.cursorBound = "1";
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      document.getElementById("salon-cursor-style")?.remove();
      document.body.classList.remove("salon-active");
      attachObserver.disconnect();
      document.querySelectorAll("[data-cursor-bound]").forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        delete (el as HTMLElement).dataset.cursorBound;
      });
    };
  }, []);

  return (
    <div className="hidden md:block">
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 8, height: 8,
          backgroundColor: "#B8975A",
          mixBlendMode: "multiply",
          transition: "width 0.3s, height 0.3s, background-color 0.3s",
        }}
      />
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 36, height: 36,
          border: "1px solid #B8975A",
          opacity: 0.6,
          transition: "width 0.3s, height 0.3s, opacity 0.3s",
        }}
      />
    </div>
  );
}
