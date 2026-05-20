import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

/**
 * Display serif — Fraunces with optical-size axis enabled, used for
 * headlines and the wordmark wherever text is rendered.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "KAD — Atelier of Interiors",
    template: "%s · KAD",
  },
  description:
    "KAD is a luxury interior design atelier composing architecture, light, and material into rooms that feel inevitable.",
  keywords: [
    "KAD",
    "interior design",
    "luxury interiors",
    "architecture",
    "Cairo",
    "Egypt",
    "Middle East",
    "exterior design",
    "landscape design",
    "interior contracting",
    "interior fit-out",
  ],
  authors: [{ name: "KAD" }],
  creator: "KAD",
  metadataBase: new URL("https://kad.studio"),
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "KAD — Atelier of Interiors",
    description:
      "Luxury interior experiences beyond space — composing architecture, light, and material.",
    siteName: "KAD",
  },
  twitter: {
    card: "summary_large_image",
    title: "KAD — Atelier of Interiors",
    description:
      "Luxury interior experiences beyond space — composing architecture, light, and material.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-[var(--ink)] text-[var(--bone)] antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
