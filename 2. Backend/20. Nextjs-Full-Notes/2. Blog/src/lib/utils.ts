// Framework-agnostic helpers shared across both server and client code
// (has no "use client"/"use server" directive, and no side effects at
// import time, so it's safe to import from either side of the boundary).
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn/ui helper: clsx merges conditional className objects,
// twMerge then resolves conflicting Tailwind classes (e.g. two different
// `p-*` values) by keeping the last one instead of leaving both in the
// DOM.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Used server-side by post-actions.ts to derive a URL-safe slug from a
// post title, which then becomes the dynamic segment matched by
// src/app/post/[slug]/page.tsx (e.g. "My First Post!" -> "my-first-post").
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/ +/g, "-");
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
