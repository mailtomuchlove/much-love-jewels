"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  /** Direction content slides FROM (default: bottom) */
  from?: "bottom" | "left" | "right" | "none";
  /** Slide distance in px (default: 28) */
  distance?: number;
  /** Seconds before animation starts (default: 0) */
  delay?: number;
  /** Animation duration in seconds (default: 0.55) */
  duration?: number;
  /** Fraction of element visible before trigger (default: 0.12) */
  threshold?: number;
  /** Only animate once — do not replay on re-entry (default: true) */
  once?: boolean;
}

export function FadeIn({
  children,
  className,
  from = "bottom",
  distance = 28,
  delay = 0,
  duration = 0.55,
  threshold = 0.12,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const y = from === "bottom" ? distance : from === "none" ? 0 : 0;
  const x = from === "left" ? -distance : from === "right" ? distance : 0;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, x }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
