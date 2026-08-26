// Next.js Middleware: this file (must live at the project root, next to
// src/app, and must be named exactly `middleware.ts`) runs on the Edge
// Runtime, BEFORE a matched request reaches any route/page/layout. That's
// what makes it useful for auth gating: we can redirect away from a
// protected page before React ever starts rendering it, instead of
// rendering the page and then bouncing the user client-side.
//
// Route protection here is "presence of a session cookie", not a verified
// session. See the getSessionCookie note below for why that's a deliberate
// tradeoff, not a bug.
//
// define protected routes -> /profile, post/create, /post/edit/1

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/profile", "/post/create", "/post/edit"];

export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;

  // getSessionCookie() only checks whether a (correctly named/shaped)
  // session cookie exists - it does NOT hit the database or verify the
  // session is still valid server-side. That's intentional: middleware runs
  // on the Edge Runtime for every matched request, so it avoids a DB round
  // trip here for performance. This means middleware can be "fooled" by a
  // stale/tampered cookie into letting a request through; the real
  // authorization check (auth.api.getSession, which DOES verify against the
  // DB) still happens in each protected page/action. Treat this as a fast
  // UX-level gate, not the security boundary.
  const session = getSessionCookie(request);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathName.startsWith(route)
  );


  if (isProtectedRoute && !session) {
    // redirect the user to the auth page because user is not logged in
    // NextResponse.redirect short-circuits the request here - the
    // page/layout for pathName is never rendered at all.
    return NextResponse.redirect(new URL("/auth", request.url));
  }


  // if user is already logged in and user is accessing /auth route
  // they will automatically be redirected to the homepage
  if (pathName === "/auth" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  // NextResponse.next() means "continue the request as normal" - render
  // whatever route matched. Every code path through middleware must
  // return a NextResponse; forgetting this branch would hang the request.
  return NextResponse.next();
}


// `matcher` tells Next.js which request paths should even invoke this
// middleware function - it's a build-time optimization/filter, not a
// runtime check. Without a matcher, middleware would run on EVERY request
// (including static assets, _next internals, etc.), which is wasteful.
// `:path*` is a Next.js matcher wildcard meaning "this segment plus any
// number of nested segments" (e.g. "/profile/:path*" matches "/profile",
// "/profile/settings", "/profile/a/b/c").
export const config = {
  matcher: ["/profile/:path*", "/post/create", "/post/edit/:path*", "/auth"],
};
