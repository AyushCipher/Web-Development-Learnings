// This module configures the better-auth SERVER instance. It imports the
// DB client (./db) and reads a secret from process.env, so it must only
// ever be imported from server-side code: Server Components, Server
// Actions, Route Handlers, or middleware. Compare with auth-client.ts,
// which is the counterpart safe to import from "use client" components -
// Next.js doesn't stop you from importing this file into a Client
// Component, but doing so would bundle the DB driver and secret-reading
// code for the browser (or crash, since `pg` needs Node APIs the browser
// doesn't have). This mirrors the general Next.js rule: server-only
// modules (DB clients, API secrets) must stay on one side of the
// client/server boundary.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
  appName: "Next.js 15 blog",
  secret: process.env.BETTER_AUTH_SECRET || "BETTER_AUTH_SECRET",
  baseURL: process.env.BASE_URL,
  // drizzleAdapter lets better-auth persist users/sessions/accounts through
  // our own Drizzle schema instead of managing its own tables. better-auth
  // internally expects tables named `user`/`session`/`account`; since this
  // schema names them `users`/`sessions`/`accounts` (see src/lib/db/schema.ts),
  // we remap them here so better-auth's queries hit the right Drizzle
  // table objects.
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // session cookie/record lifetime: 7 days
    updateAge: 60 * 60 * 24, // sliding expiry: refresh once per day of use
    cookieCache: {
      // Caches session data inside the cookie itself for 5 minutes so
      // auth.api.getSession() doesn't have to hit the DB on every single
      // request (Server Components/Actions call it a lot in this app -
      // see profile/page.tsx, post-actions.ts, etc.). This is a
      // performance optimization independent of middleware's cookie-only
      // check.
      enabled: true,
      maxAge: 60 * 5,
    },
    disableSessionRefresh: true,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  },
});
