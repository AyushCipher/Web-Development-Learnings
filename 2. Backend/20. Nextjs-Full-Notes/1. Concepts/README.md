# Next.js Concepts (App Router, Next.js 15 + React 19)

A single project where every route is a self-contained, commented demo of one
Next.js App Router concept. Run `npm run dev` and open
[http://localhost:3000](http://localhost:3000) - the homepage (`src/app/page.tsx`)
is a clickable index of everything below. Each route's `page.tsx`/`layout.tsx`
has comments explaining *what* it demonstrates and *why* it's written that way -
read the file, don't just click the link.

## Routing

| Concept | File(s) |
| --- | --- |
| Server Components (default) & their limits | `src/app/page.tsx` |
| Root layout, fonts, default metadata | `src/app/layout.tsx` |
| Route groups `(folder)` - shared layout without a URL segment | `src/app/(marketing)/` |
| Nested layouts | `src/app/dashboard/` |
| Dynamic segment `[slug]` | `src/app/products/[slug]/` |
| Static generation for dynamic routes (`generateStaticParams`) | `src/app/products/[slug]/page.tsx` |
| Catch-all segment `[...slug]` | `src/app/catch-all-routes/` |
| Optional catch-all segment `[[...slug]]` | `src/app/optional-catch-all-route/` |
| Parallel routes `@slot` + `default.tsx` | `src/app/parallel-routes-example/` |
| Intercepting routes `(.)folder` (modal-over-a-route pattern, combined with parallel routes) | `src/app/intercepting-routes-example/` |
| `next.config.ts` `redirects()` / `rewrites()` (static, config-level routing) | `next.config.ts` (`/old-products`, `/hello-rewrite`) |
| `not-found.tsx` | `src/app/not-found.tsx`, triggered from `src/app/redirect-example/` |
| `error.tsx` (error boundaries) | `src/app/error-example/` |
| `loading.tsx` (automatic Suspense boundary, streaming) | `src/app/loading-example/` |
| Middleware (edge request interception, redirects) | `src/middleware.ts`, `src/app/middleware-example/` |
| `redirect()` / `notFound()` (server-side navigation) | `src/app/redirect-example/` |
| Client-side nav hooks: `useRouter`/`usePathname`/`useSearchParams` | `src/app/profile/` |

## Data & mutations

| Concept | File(s) |
| --- | --- |
| Server-side `fetch()` + cache strategies (`no-store`/`force-cache`/`reload`) | `src/app/data-fetching/server-fetch/` |
| Client fetch with `useEffect` (the manual/old-school way) | `src/app/data-fetching/use-effect-example/` |
| React 19 `use()` hook + `<Suspense>` streaming | `src/app/data-fetching/use-hook/` |
| SWR | `src/app/data-fetching/swr-example/` |
| TanStack React Query + provider setup | `src/app/data-fetching/react-query/`, `src/providers/query-client-provider.tsx` |
| Route Handlers (API routes, incl. dynamic `[id]`) | `src/app/api/hello/`, `src/app/api/products/[id]/` |
| Server Actions (`"use server"`, `<form action={...}>`, `useFormStatus`) | `src/app/server-actions-example/` |
| On-demand cache invalidation (`revalidatePath`) | `src/app/server-actions-example/actions.ts` |
| Time-based cache invalidation / ISR (`export const revalidate`) | `src/app/isr-example/` |

## SEO & assets

| Concept | File(s) |
| --- | --- |
| Static `metadata` export | `src/app/metadata-example/page.tsx` |
| Dynamic `generateMetadata()` | `src/app/metadata-example/[slug]/page.tsx` |
| `next/image` optimization (`priority`, `fill`, remote patterns) | `src/app/image-example/`, `next.config.ts` |
| `next/font` self-hosted Google Fonts | `src/app/layout.tsx` |

## Config & environment

| Concept | File(s) |
| --- | --- |
| Environment variables - server-only vs. `NEXT_PUBLIC_`-prefixed (client-exposed) | `.env.local`, `src/app/env-vars-example/` |

## Not covered here (see the applied projects instead)

This project sticks to framework primitives in isolation. For how they combine
into a real, working app - real auth, a real database, file uploads, payments -
see the other two projects in this repo, which build on these same primitives
with Drizzle ORM + better-auth:

- `../2. Blog` - a full CRUD blog (Server Actions, middleware-gated routes, a
  real Postgres schema).
- `../3. Asset-manager` - a digital-asset marketplace (Cloudinary uploads,
  PayPal checkout, invoice generation, admin approval flows).

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - start from the homepage index.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
to self-host the Geist font family.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
