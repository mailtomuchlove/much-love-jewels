"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export function useRazorpay() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.Razorpay) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
    return () => {
      // Don't remove — it may be needed again
    };
  }, []);

  function openRazorpay(options: Record<string, unknown>) {
    if (!window.Razorpay) throw new Error("Razorpay not loaded");
    const rzp = new window.Razorpay(options);
    rzp.open();
    return rzp;
  }

  return { loaded, openRazorpay };
}
