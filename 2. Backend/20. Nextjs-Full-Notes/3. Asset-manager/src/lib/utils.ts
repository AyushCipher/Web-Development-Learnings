import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Standard shadcn/ui helper: merges conditional classNames (clsx) and
// resolves conflicting Tailwind utility classes (twMerge) - generic React
// styling utility, not Next.js-specific.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Prices are stored as integer cents everywhere in the DB
// (src/lib/db/schema.ts: asset.price, purchase.price, payment.amount) to
// avoid floating-point rounding issues with money. This is the shared
// display-formatting counterpart, used across gallery cards, the purchase
// page, dashboard lists, and admin approval cards.
export function formatPriceFromCents(priceInCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
}
