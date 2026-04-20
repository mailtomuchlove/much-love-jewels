import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/providers/motion-provider";

/* Warm serif display — headings, luxury feel for South Indian bridal */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

/* Modern geometric sans — body, UI, buttons */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Much Love Jewels",
    default: "Much Love Jewels — AD & Imitation Bridal Jewellery",
  },
  description:
    "Shop AD & imitation jewellery online — bridal sets, necklace sets, earrings, bangles and more. Bold designs at honest prices.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    siteName: "Much Love Jewels",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@muchlovejewels",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL ?? "https://muchlovejewels.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
