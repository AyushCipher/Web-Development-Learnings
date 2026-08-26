// MIDDLEWARE (src/middleware.ts - must be at the project root of src/, or the
// project root if there's no src/ folder; there can only be ONE middleware
// file per app). It runs on the EDGE, before a request is matched to a route,
// for every request that matches `config.matcher` below. Typical uses: auth
// gating, redirects, rewriting URLs, setting/reading cookies, A/B test
// bucketing, geolocation-based routing.
// The Blog project (2. Blog/src/middleware.ts) has a real-world version of
// this exact pattern - redirecting unauthenticated users away from protected
// pages using better-auth's session cookie.
//
// Keep the matcher as narrow as possible: middleware runs on EVERY matching
// request, so a broad matcher = extra latency on every navigation. Here it's
// scoped to just /middleware-example so it doesn't affect the rest of this
// demo app.
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hasAccess = request.nextUrl.searchParams.get("access") === "granted";
  const alreadyBlocked = request.nextUrl.searchParams.has("blocked");

  // Guard against a redirect loop: without `alreadyBlocked`, redirecting to
  // "add ?blocked=true" would itself be missing `access=granted` and get
  // redirected again forever. Always check "have I already handled this"
  // before redirecting in middleware.
  if (!hasAccess && !alreadyBlocked) {
    // Redirect to the same page with a query param explaining why, instead of
    // letting the page render. Compare this SERVER-side redirect (happens
    // before any HTML is sent) to `router.push` in not-found.tsx, which only
    // runs after the page has already loaded in the browser.
    const url = request.nextUrl.clone();
    url.searchParams.set("blocked", "true");
    return NextResponse.redirect(url);
  }

  // NextResponse.next() continues the request to the actual page, optionally
  // with extra headers attached - useful for passing data (like a decoded
  // user id) from middleware down to a Server Component via request headers.
  const response = NextResponse.next();
  response.headers.set("x-middleware-demo", "true");
  return response;
}

export const config = {
  // Only run this middleware for requests to /middleware-example - everything
  // else in the app bypasses it entirely.
  matcher: ["/middleware-example"],
};
