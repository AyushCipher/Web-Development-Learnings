"use client";
// Thin wrapper around the third-party `next-themes` package (unrelated to
// Next.js itself despite the name - it's a community library for
// light/dark/system theme switching). Must be a Client Component because it
// reads/writes `localStorage` and toggles a class on `<html>` - both
// browser-only operations. Mounted once in the root layout
// (src/app/layout.tsx), which is also where `suppressHydrationWarning` is
// set on <html> to tolerate the resulting server/client class mismatch.
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
