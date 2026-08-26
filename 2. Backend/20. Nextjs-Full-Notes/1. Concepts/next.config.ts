import type { NextConfig } from "next";

// ROUTE-LEVEL CONFIG: `redirects()`/`rewrites()` here are evaluated by
// Next.js's router BEFORE any component code runs - no page, layout, or
// Server Action involved. Compare to the other two ways this project
// demonstrates changing where a request ends up:
// - `redirect()` from next/navigation (src/app/redirect-example) - called
//   from inside a Server Component/Action, so it can depend on data/logic.
// - Middleware (src/middleware.ts) - runs per-request with full access to
//   cookies/headers, for conditional logic (e.g. auth gating).
// Use config-level redirects/rewrites instead when the rule is static and
// unconditional (URL cleanup, aliasing) - it's the cheapest option since
// nothing needs to execute per-request.
const nextConfig: NextConfig = {
  /* config options here */
  // Example: allow next/image to optimize images served from an external
  // host (see src/app/image-example/page.tsx). Without an entry here,
  // <Image src="https://dummyjson.com/..."> would throw at request time.
  // images: {
  //   remotePatterns: [{ protocol: "https", hostname: "dummyjson.com" }],
  // },

  async redirects() {
    return [
      // permanent: true -> a 308 (search engines/browsers are told to
      // update their own records, e.g. bookmarks/cached links) as opposed
      // to a temporary 307 for redirects that might change later.
      // Try it: visit /old-products, you'll land on /products.
      {
        source: "/old-products",
        destination: "/products",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      // A REWRITE serves different content while keeping the ORIGINAL URL
      // in the browser's address bar - unlike a redirect, the browser never
      // knows /hello-rewrite and /api/hello are different routes. Common
      // uses: proxying to a different backend/microservice under your own
      // domain, or giving an API route a friendlier public path.
      // Try it: visit /hello-rewrite - the URL stays /hello-rewrite, but
      // the response is whatever src/app/api/hello/route.ts returns.
      {
        source: "/hello-rewrite",
        destination: "/api/hello",
      },
    ];
  },
};

export default nextConfig;
