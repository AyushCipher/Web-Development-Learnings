// This is a Next.js Route Handler (App Router's replacement for the old
// pages/api/* API routes). A file named `route.ts` inside `src/app/**`
// exports HTTP-method-named functions (GET, POST, etc.) that handle
// requests to that URL directly - no React rendering involved.
//
// The folder is named `[...all]`, a "catch-all" dynamic segment. The `...`
// means it captures ANY number of path segments after /api/auth/ into one
// param. So this single file handles /api/auth/sign-in, /api/auth/sign-out,
// /api/auth/session, /api/auth/sign-up/email, etc. - every endpoint
// better-auth needs - without us writing a route file per endpoint. (Using
// `[all]` instead of `[...all]` would only match exactly one segment, e.g.
// /api/auth/sign-in but not /api/auth/sign-up/email.)
//
// better-auth ships its own internal router (`auth.handler`, a standard
// Fetch API `Request -> Response` handler). `toNextJsHandler` is a thin
// adapter that wraps it into the { GET, POST } shape Next.js Route Handlers
// expect, so all the sign-in/sign-up/session/sign-out logic lives inside
// the better-auth library (configured in src/lib/auth.ts) instead of being
// reimplemented here.
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
