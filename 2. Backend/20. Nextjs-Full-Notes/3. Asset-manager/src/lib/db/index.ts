// Server-only DB client. Everything server-side in this app (Server
// Actions, Route Handlers, Server Components, and src/lib/auth.ts's
// Drizzle adapter) imports `db` from here - never import this from a
// "use client" file.
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { getDatabaseUrl } from "./connection-string";

// A module-level `Pool` is created once when this file is first imported
// and then reused across requests for the life of the server process -
// Next.js Server Components/Actions/Route Handlers all run in the same
// long-lived Node process (in `next dev`/most deployment targets), so this
// avoids opening a new Postgres connection per request.
const resolvedUrl = getDatabaseUrl();

// Q. Why decide SSL from the DB host instead of just NODE_ENV === "production"?
// ANS: The two don't actually track each other. A hosted Postgres provider
// (Supabase, Neon, Render, ...) requires SSL and uses certificates outside
// Node's default trust store no matter which environment is talking to it -
// including `next dev` on a laptop pointed at a hosted dev database. Only a
// same-machine Postgres (localhost/127.0.0.1, the target of
// getDatabaseUrl's "postgres" -> "localhost" rewrite) genuinely never needs
// SSL. Gating on NODE_ENV alone would silently pass `ssl: false` to a
// connection that actually requires TLS, which the server responds to by
// resetting the connection (ECONNRESET) rather than a clear auth error.
const isLocalHost = /:\/\/[^@]*@(localhost|127\.0\.0\.1)(?=[:/?]|$)/.test(
  resolvedUrl
);

const pool = new Pool({
  connectionString: resolvedUrl,
  ssl: isLocalHost
    ? false
    : {
        rejectUnauthorized: false,
      },
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  max: 10,
});

export const db = drizzle(pool, { schema });

// Escape hatch for checking out a raw pg client from the pool directly
// (e.g. for manual multi-statement work outside Drizzle's query builder).
// Callers are responsible for releasing it back (`client.release()`).
export async function getClient() {
  const client = await pool.connect();
  return client;
}
