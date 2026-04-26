"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// useLayoutEffect fires synchronously before the browser paints — no frame flash.
// Fall back to useEffect on the server (where window doesn't exist).
const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function JewelsArrivalOverlay() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const handled = useRef(false);

  useSafeLayoutEffect(() => {
    // handled ref guards against React Strict Mode double-invoke
    if (handled.current) return;
    const flag = sessionStorage.getItem("arriving-from-salon");
    if (!flag) return;

    handled.current = true;
    sessionStorage.removeItem("arriving-from-salon");

    // setVisible(true) here triggers a synchronous re-render before the
    // browser's first paint, so the overlay covers the page from frame 0.
    setVisible(true);

    // No cleanup return — timers must fire even across Strict Mode re-runs
    setTimeout(() => setFading(true), 600);
    setTimeout(() => setVisible(false), 1050);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-brand-navy pointer-events-none"
      style={{ opacity: fading ? 0 : 1, transition: "opacity 0.45s ease" }}
    />
  );
}
