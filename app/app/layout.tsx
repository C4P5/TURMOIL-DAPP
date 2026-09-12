import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/*
  SaucerSwap uses Euclid Triangle, which is licensed from Swiss Typefaces and is
  not ours to use. Space Grotesk is the closest free equivalent in character —
  geometric skeleton, but with enough irregularity that it reads industrial
  rather than corporate. Plex Mono over JetBrains Mono for the data: Plex was
  drawn for technical documents, which is what a weighbridge ticket is.

  next/font self-hosts both at build time, so there is no runtime request to
  Google and no layout shift.
*/
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TURMOIL — provable used cooking oil",
  description:
    "From 2027 Europe requires used cooking oil to carry a documented chain of custody starting at collection. TURMOIL signs every pickup twice, weighs the load at the plant, and audits a random sample against the restaurants themselves.",
};

/*
  Root layout is deliberately bare: html, body, fonts. The header, footer and the
  Privy provider live in (app)/layout.tsx instead, so the landing at / is a fully
  static page with no wallet dependency — it renders identically whether or not
  NEXT_PUBLIC_PRIVY_APP_ID is set, which is exactly what you want on the one URL
  a judge is most likely to open.
*/
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${plexMono.variable}`}>
      <body className="grain min-h-screen">{children}</body>
    </html>
  );
}
