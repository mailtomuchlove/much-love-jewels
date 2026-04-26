import type { Metadata } from "next";
import { cormorant } from "@/lib/salon/fonts";
import { LenisProvider } from "@/components/salon/lenis-provider";
import { SalonNavbar } from "@/components/salon/salon-navbar";
import { SalonFooter } from "@/components/salon/salon-footer";
import { SalonCursor } from "@/components/salon/salon-cursor";
import { JewelsTransitionOverlay } from "@/components/salon/jewels-transition-overlay";

export const metadata: Metadata = {
  title: {
    template: "%s | Much Love Salon",
    default: "Much Love Salon — Bridal Beauty Atelier",
  },
  description: "Mumbai's premier bridal beauty studio. Bespoke makeup and hair artistry for brides, parties, and every occasion.",
};

export default function SalonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cormorant.variable}
      style={{ background: "#FAF8F3", minHeight: "100vh", overflowX: "hidden" }}
    >
      <LenisProvider>
        <SalonCursor />
        <SalonNavbar />
        {children}
        <SalonFooter />
        <JewelsTransitionOverlay />
      </LenisProvider>
    </div>
  );
}
