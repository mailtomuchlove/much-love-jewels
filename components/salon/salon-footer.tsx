"use client";

import Link from "next/link";
import { WA_NUMBER } from "@/lib/salon/constants";

const col2 = ["Bridal Couture", "Party Makeup", "HD & Film", "Hair Artistry", "Airbrush"];
const col3 = ["Our Story", "Portfolio", "Bridal Guide"];
const col4 = [
  { label: "Book Appointment", href: "/salon/book" },
  { label: "WhatsApp", href: `https://wa.me/${WA_NUMBER}` },
  { label: "Instagram", href: "#" },
];

export function SalonFooter() {
  return (
    <footer style={{ background: "#111009", padding: "clamp(48px,8vw,80px)", borderTop: "1px solid rgba(184,151,90,0.1)" }}>
      <style>{`
        @media (max-width: 767px) {
          .salon-footer-grid { grid-template-columns: 1fr 1fr !important; }
          .salon-footer-brand { grid-column: 1 / -1; }
        }
      `}</style>
      <div
        className="salon-footer-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 48,
          marginBottom: 64,
        }}
      >
        {/* Brand */}
        <div className="salon-footer-brand" style={{ maxWidth: 280 }}>
          <div style={{ fontFamily: "var(--font-cormorant)", fontSize: 24, fontWeight: 400, letterSpacing: "0.1em", color: "#FDFCFA", marginBottom: 12 }}>
            Much Love Salon
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#B8975A", marginBottom: 20 }}>
            Bridal Beauty Atelier
          </div>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, fontWeight: 300, lineHeight: 1.8, color: "rgba(255,255,255,0.35)" }}>
            Luxury makeup and hair artistry for brides and every occasion. Because you deserve to feel extraordinary.
          </p>
        </div>

        {/* Services */}
        <FooterCol title="Services" links={col2.map((l) => ({ label: l, href: "#services" }))} />

        {/* Atelier */}
        <FooterCol title="Atelier" links={col3.map((l) => ({ label: l, href: "#story" }))} />

        {/* Connect */}
        <FooterCol title="Connect" links={col4} external />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 32,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
          © 2025 Much Love Salon. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/" style={{ fontFamily: "var(--font-dm-sans)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#D4B47A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}>
            Jewellery Store
          </Link>
          <a href="#" style={{ fontFamily: "var(--font-dm-sans)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#D4B47A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}>
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, external }: { title: string; links: { label: string; href: string }[]; external?: boolean }) {
  return (
    <div>
      <h4 style={{ fontFamily: "var(--font-dm-sans)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 24, fontWeight: 400 }}>
        {title}
      </h4>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {links.map((link) => (
          <li key={link.label}>
            {external || link.href.startsWith("http") || link.href.startsWith("wa.") ? (
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.45)", textDecoration: "none", letterSpacing: "0.04em", transition: "color 0.3s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#D4B47A"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.45)", textDecoration: "none", letterSpacing: "0.04em", transition: "color 0.3s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#D4B47A"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
