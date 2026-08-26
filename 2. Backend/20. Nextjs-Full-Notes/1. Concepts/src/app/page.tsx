// app/page.tsx maps to the "/" route (the root URL) - `page.tsx` is the file
// Next.js looks for to make a route segment PUBLICLY reachable.
//
// Server Component (the default for every component under app/, unless the file
// or a parent starts with "use client"):
// - can be `async` and fetch data directly inside the component (no useEffect/loading state)
// - can access backend-only resources directly (DB clients, fs, private env vars, secrets)
// - none of its code/imports are sent to the browser, so sensitive logic and API
//   keys never leak to the client bundle
//
// Trade-off - a Server Component CANNOT:
// - use React hooks (useState, useEffect, useContext, ...)
// - attach browser event handlers (onClick, onChange, ...)
// - use browser-only APIs (window, localStorage, ...)
// For any of that, mark the file/component "use client" (see profile/page.tsx or
// not-found.tsx for examples).
import Link from "next/link";

// One entry per concept demo in this project - see README.md for the same
// list with a longer explanation of each. This page exists purely as a study
// index, so every route in src/app/ is one click away from "/".
const concepts: { href: string; label: string }[] = [
  { href: "/products", label: "Dynamic routes + generateStaticParams (SSG)" },
  { href: "/catch-all-routes/shoes/nike", label: "Catch-all routes [...slug]" },
  { href: "/optional-catch-all-route", label: "Optional catch-all [[...slug]]" },
  { href: "/about", label: "Route groups - app/(marketing)/about" },
  { href: "/dashboard", label: "Nested layouts" },
  { href: "/error-example", label: "error.tsx (error boundaries)" },
  { href: "/loading-example", label: "loading.tsx (streaming + Suspense)" },
  { href: "/this-route-does-not-exist", label: "not-found.tsx (unmatched URL)" },
  { href: "/metadata-example", label: "Static & dynamic metadata / SEO" },
  { href: "/profile?name=Ayush&age=20", label: "Client nav hooks (useRouter/useSearchParams)" },
  { href: "/data-fetching/server-fetch", label: "Data fetching: server fetch() + cache" },
  { href: "/data-fetching/use-effect-example", label: "Data fetching: useEffect (client)" },
  { href: "/data-fetching/use-hook", label: "Data fetching: use() + Suspense" },
  { href: "/data-fetching/swr-example", label: "Data fetching: SWR" },
  { href: "/data-fetching/react-query", label: "Data fetching: React Query" },
  { href: "/api/hello?name=Ayush", label: "Route Handlers (API routes)" },
  { href: "/server-actions-example", label: "Server Actions + revalidatePath" },
  { href: "/middleware-example", label: "Middleware" },
  { href: "/redirect-example", label: "redirect() / notFound()" },
  { href: "/image-example", label: "next/image optimization" },
  { href: "/isr-example", label: "ISR (route segment `revalidate`)" },
  { href: "/parallel-routes-example", label: "Parallel routes (@slot)" },
  { href: "/intercepting-routes-example", label: "Intercepting routes ((.)folder) - modal pattern" },
  { href: "/env-vars-example", label: "Environment variables (server-only vs NEXT_PUBLIC_)" },
  { href: "/old-products", label: "next.config.ts redirects()" },
  { href: "/hello-rewrite", label: "next.config.ts rewrites()" },
];

export default function Home() {
  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold mb-2">Next.js Concepts - Study Index</h1>
      <p className="mb-6 text-sm text-gray-500">
        Every route below is a self-contained demo of one Next.js concept.
        Open the file for the route to read the comments explaining what it
        shows and why.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2 max-w-3xl">
        {concepts.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="underline hover:no-underline">
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

