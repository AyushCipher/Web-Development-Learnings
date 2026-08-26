// The Root Layout: every App Router project needs exactly one of these at
// src/app/layout.tsx. It wraps EVERY page in the app and, unlike a page, it
// must render the <html> and <body> tags itself - Next.js doesn't add them
// for you. It's a Server Component by default (no "use client"), which is
// why the font loading below can happen at the module/server level.
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// next/font/google downloads and self-hosts these fonts at build time
// (no runtime request to Google Fonts, no layout shift from a late-loading
// external stylesheet). Each call returns a CSS variable name; that
// variable is applied to <body> below and referenced from globals.css /
// Tailwind config rather than the font being loaded via a <link> tag.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Exporting a `metadata` object from a layout or page is Next.js's
// built-in way to populate <head> (title, description, OG tags, etc.) -
// there's no separate <Head> component like in the old Pages Router.
// Metadata exported here applies to every page since this is the root
// layout; a page can export its own `metadata` to override it for just
// that route (see src/app/page.tsx).
export const metadata: Metadata = {
  title: "Next JS 15 Blog",
  description: "Next JS 15 Blog using zustand, drizzle and postgres",
};

export default function RootLayout({
  children,
}: Readonly<{
  // `children` here is how Next.js injects whatever page/nested-layout
  // matched the current URL - this component doesn't know or care what
  // it's rendering, only where it goes.
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ThemeProvider is a "use client" component (see
            src/components/theme/theme-provider.tsx) - it also happens to
            render the site Header inside it. Crossing from this Server
            Component into a Client Component is fine; `children` (still
            server-rendered content) is passed through as a prop, which
            keeps the pages themselves from having to be client components
            just because an ancestor needs client-side interactivity. */}
        <ThemeProvider
          attribute={"class"}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {/* Toaster (sonner) renders a portal for toast notifications;
            mounted once here so any page/component can trigger a toast
            via the shared `toast()` call without re-mounting the portal. */}
        <Toaster />
      </body>
    </html>
  );
}
