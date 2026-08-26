// NOTE: this app's client state is Zustand (see package.json - "zustand" is
// the actual dependency), not nanostores.
//
// This module is entirely client-side: "use client" is needed because
// zustand's `persist` middleware reads/writes localStorage, which doesn't
// exist during server rendering. This store is NOT the source of truth for
// the actual theme (next-themes/ThemeProvider owns that, via the
// `class`/localStorage mechanism next-themes manages itself) - it's a
// separate piece of app state that theme-toggle.tsx keeps in sync with
// next-themes via a useEffect, seemingly just to expose `isDarkMode` as a
// convenient boolean elsewhere. Worth noticing as an example of two
// overlapping sources of truth for the same concept (dark mode) rather
// than a single one - something to watch for once you're designing your
// own state.
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      // persist middleware's storage key (localStorage key name). Typo'd
      // ("stroage") but functionally harmless since it's just a string key.
      name: "theme-stroage",
    }
  )
);
