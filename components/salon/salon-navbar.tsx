"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Atelier", href: "#story" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#showcase" },
  { label: "Reviews", href: "#testimonials" },
];

export function SalonNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 md:px-14"
        style={{
          padding: scrolled ? "18px clamp(16px,4vw,56px)" : "28px clamp(16px,4vw,56px)",
          background: scrolled ? "rgba(250,248,243,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(184,151,90,0.15)" : "none",
          transition: "background 0.6s ease, padding 0.4s ease, backdrop-filter 0.6s ease, border-bottom 0.4s ease",
        }}
      >
        <Link
          href="/salon"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: "0.12em",
            color: scrolled ? "#1C1916" : "#FDFCFA",
            textDecoration: "none",
            transition: "color 0.4s",
          }}
        >
          Much Love Salon
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-10 list-none">
          {navLinks.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => scrollTo(link.href)}
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: 11,
                  fontWeight: 400,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: scrolled ? "#6B6259" : "rgba(255,255,255,0.75)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  position: "relative",
                  transition: "color 0.3s",
                }}
                className="group"
              >
                {link.label}
                <span
                  className="absolute left-0 bottom-[-3px] h-[1px] w-0 group-hover:w-full transition-all duration-300"
                  style={{ background: "#D4B47A" }}
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <Link
            href="/salon/book"
            className="hidden md:inline-block"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#1C1916",
              background: "#D4B47A",
              padding: "11px 28px",
              textDecoration: "none",
              transition: "background 0.3s, transform 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#B8975A"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#D4B47A"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Book Now
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="md:hidden flex flex-col gap-[5px] p-2"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-6 h-[1px]"
                style={{ background: scrolled ? "#1C1916" : "#FDFCFA" }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ background: "#1C1916" }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            Close
          </button>
          <ul className="list-none flex flex-col items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => scrollTo(link.href)}
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontSize: 36,
                    fontWeight: 300,
                    color: "#FDFCFA",
                    background: "none",
                    border: "none",
                    letterSpacing: "0.06em",
                  }}
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <Link
                href="/salon/book"
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#1C1916",
                  background: "#D4B47A",
                  padding: "14px 36px",
                  textDecoration: "none",
                  display: "inline-block",
                  marginTop: 16,
                }}
              >
                Book Now
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
