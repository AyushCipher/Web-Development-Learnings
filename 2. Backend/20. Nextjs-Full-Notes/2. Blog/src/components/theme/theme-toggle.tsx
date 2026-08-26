// Client Component: uses hooks (useTheme, useThemeStore, useEffect) and an
// onClick handler, none of which can run in a Server Component.
"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useThemeStore } from "@/store/theme-store";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  // `theme` from next-themes is the actual applied theme (drives the
  // `class` attribute on <html>, and thus which Tailwind `dark:` styles
  // apply); `useThemeStore`'s `isDarkMode` is the separate Zustand copy
  // described in theme-store.ts. This effect exists solely to reconcile
  // the two whenever next-themes' value changes elsewhere.
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme === "dark" && !isDarkMode) {
      useThemeStore.setState({ isDarkMode: true });
    } else if (theme === "light" && isDarkMode) {
      useThemeStore.setState({ isDarkMode: false });
    }
  }, [theme, isDarkMode]);

  const handleToggleTheme = () => {
    toggleTheme();
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <Button variant={"ghost"} size={"icon"} onClick={handleToggleTheme}>
      {/* Both icons render always; the `dark:` Tailwind variants (driven by
          the `class="dark"` attribute next-themes toggles on <html>, set
          via `attribute="class"` in layout.tsx) animate one in and the
          other out - no conditional rendering / no hydration flicker. */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}


