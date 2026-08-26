// ROOT LAYOUT - the one required layout.tsx for the whole App Router tree.
// This is the only place allowed to render <html>/<body>; every route in
// src/app renders as `children` inside it, so anything here (Header, theme
// provider, fonts) is present on every page.
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme/theme-provider";

// next/font/google self-hosts these fonts at build time (downloads + serves
// them from our own origin) instead of the browser fetching from
// fonts.googleapis.com at runtime - avoids an extra external request and
// the layout shift that comes with it. The CSS variable names are applied
// to <body>'s className below and referenced from globals.css/Tailwind config.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Next.js Metadata API - a plain exported object here (static metadata).
// Next injects this into the document <head> (title/meta description) at
// build/request time; a dynamic per-page equivalent would be an exported
// `generateMetadata()` function instead.
export const metadata: Metadata = {
  title: "Asset Platform",
  description: "A professional marketplace for uploading and purchasing digital assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is required here specifically because
    // next-themes (inside ThemeProvider) sets the dark/light class on
    // <html> from localStorage/system preference AFTER hydration - the
    // server can't know the user's theme ahead of time, so server and
    // client HTML for this attribute intentionally differ for one render.
    // Without this, React would log a hydration mismatch warning for an
    // expected, harmless difference.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        {/* ThemeProvider ("use client") wraps Header + all page content so
            every descendant - client or server-rendered - sits under the
            same next-themes context. Header itself hides its own markup on
            /login via a client-side pathname check rather than a route
            group, so it stays mounted here for every route. */}
        <ThemeProvider>
          <Header />
          <main className="min-h-[calc(100vh-64px)] pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
