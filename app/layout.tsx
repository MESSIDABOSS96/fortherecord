import type { Metadata } from "next";
import { Caveat, Inter, Merriweather } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ["300", "400", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://fortherecord.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "For the Record",
  description: "Anonymous collection of songs, lyrics, and reflections",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${caveat.variable} ${inter.variable} ${merriweather.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
