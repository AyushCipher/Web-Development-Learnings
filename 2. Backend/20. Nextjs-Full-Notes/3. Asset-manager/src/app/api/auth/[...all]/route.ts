// ROUTE HANDLER + CATCH-ALL DYNAMIC SEGMENT
// The folder name "[...all]" is a "catch-all" dynamic segment: it matches
// every sub-path under /api/auth/*  (e.g. /api/auth/sign-in, /api/auth/sign-out,
// /api/auth/callback/google, /api/auth/session, ...). Any request Better Auth
// needs to handle - and it has many internal endpoints - lands here in one file
// instead of us hand-writing a route per auth operation.
//
// `toNextJsHandler` is a Better Auth adapter that wraps its generic
// (Request) => Response handler so it matches the shape Next.js Route
// Handlers expect: named exports called GET/POST. Whatever HTTP verb Better
// Auth needs is delegated straight through to `auth.handler` from
// src/lib/auth.ts (server-only config: DB adapter, Google OAuth, admin
// plugin, cookie handling).
//
// AUTH GATING NOTE: this project has no middleware.ts. Instead of a single
// global gatekeeper, every Server Component / Server Action / other Route
// Handler that needs to know "who is logged in" calls
// `auth.api.getSession({ headers: await headers() })` itself (see
// dashboard/layout.tsx, the actions/*.ts files, etc.). This file is purely
// the wire-protocol endpoint Better Auth talks to (cookies, OAuth redirects,
// CSRF, etc.) - it does not perform any page-level authorization.
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
