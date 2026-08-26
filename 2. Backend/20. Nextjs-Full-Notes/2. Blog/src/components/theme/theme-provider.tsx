// "use client" is required because next-themes reads/writes to
// localStorage and the `class`/`data-theme` attribute on <html> at
// runtime, and needs to avoid a server/client markup mismatch (the server
// has no way to know the user's stored theme preference during the initial
// render) - this is a well-known pattern for anything depending on
// browser-only storage or media queries. It's imported into the Server
// Component root layout (src/app/layout.tsx) and wraps `children`, which
// is why Header (also client, for its session-dependent UI) lives inside
// it rather than in layout.tsx directly - keeping layout.tsx itself a
// Server Component.
"use client";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import Header from "../layout/header";
import { cn } from "@/lib/utils";

interface ExtendedThemeProviderProps extends ThemeProviderProps {
  containerClassName?: string;
}

export function ThemeProvider({
  children,
  containerClassName,
  ...props
}: ExtendedThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <Header />
      <main className={cn("container mx-auto px-4", containerClassName)}>
        {children}
      </main>
      {/* footer component -> homework */}
    </NextThemesProvider>
  );
}
