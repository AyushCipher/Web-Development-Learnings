// This module is imported only from server-side code (Server Components,
// Server Actions, Route Handlers - see src/lib/db/queries.ts and
// src/actions/post-actions.ts). The `pool` and `db` client below are
// created once at MODULE scope, not inside a request handler/function.
// Node.js caches imported modules, so within a single server process this
// file's top-level code runs exactly once no matter how many requests
// import { db } from "@/lib/db" - every request reuses the same
// connection pool instead of opening a fresh Postgres connection per
// request. (In serverless environments each cold-started instance gets its
// own pool, but within one warm instance this reuse still holds.)
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
  max: 10, // cap concurrent connections held by this pool
});

// Passing `schema` here is what enables Drizzle's relational query API
// (db.query.posts.findMany({ with: { author: true } }), used throughout
// src/lib/db/queries.ts) - without it you'd only have the lower-level
// query builder (db.select()/db.insert()/...).
export const db = drizzle(pool, { schema });

// Escape hatch for code that needs a raw `pg` client (e.g. to run a
// multi-statement transaction manually) instead of going through Drizzle's
// query builder. Not currently used elsewhere in this app.
export async function getClient() {
  const client = await pool.connect();
  return client;
}
