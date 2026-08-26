// SERVER-ONLY auth config. This file imports `db` (a live Postgres pool)
// and reads secret env vars (GOOGLE_CLIENT_SECRET) - it must never be
// imported from a "use client" component, or those secrets/connections
// would end up pulled into the client bundle. Everything that needs auth
// info on the server imports `auth` from here and calls
// `auth.api.getSession({ headers: await headers() })`. The browser-safe
// counterpart client components use instead is src/lib/auth-client.ts.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

const adminRole = "admin";
const userRole = "user";

export const auth = betterAuth({
  // Tells Better Auth to persist users/sessions/accounts through our own
  // Drizzle schema/Postgres connection (src/lib/db/schema.ts) instead of
  // managing its own database.
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: userRole, // any user logged in they will be normal user by default
        };
      },
    },
  },
  plugins: [
    // Adds role-based helpers (session.user.role, admin-only API surface)
    // used throughout src/actions/admin-actions.ts and this app's inline
    // `session.user.role !== "admin"` checks. Only entries in `adminRoles`
    // count as admin; everyone else gets `defaultRole` ("user").
    admin({
      adminRoles: [adminRole],
      defaultRole: userRole,
    }),
    // Lets Better Auth set/refresh the session cookie using Next's own
    // `cookies()` API when its methods are called from Server Actions /
    // Route Handlers (e.g. inside src/app/api/auth/[...all]/route.ts) -
    // without this plugin, Better Auth wouldn't know how to write cookies
    // through Next's server-side cookie APIs.
    nextCookies(),
  ],
});
