import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { seo } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Site-wide metadata defaults only. Per-page title, description, canonical,
 * Open Graph and Twitter are produced by `createMetadata` in each page, so
 * nothing here hardcodes a single page's URL.
 */
export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  // Fallback title for any route that ships without its own metadata. Pages use
  // `createMetadata`, which bakes in the brand suffix, so no `title.template`
  // is set here (that would double the suffix on nested pages).
  title: "AMA Supplies | Wholesale Medical Supplies",
  description: seo.description,
  applicationName: seo.siteName,
  manifest: "/manifest.webmanifest",
  // app/favicon.ico is linked automatically as /favicon.ico.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicon-icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "AMA Supplies",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  category: "shopping",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#0057ff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${inter.className} h-full antialiased`}
    >
      <body className="min-h-full  text-foreground">{children}</body>
    </html>
  );
}
