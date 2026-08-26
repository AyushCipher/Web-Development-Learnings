// Not Next.js-specific code, but genuinely non-obvious - documented in
// detail because src/lib/db/index.ts depends on it and a wrong DB URL here
// breaks every Server Action/Route Handler in the app.
//
// This function takes the raw DATABASE_URL from the environment and fixes
// up two real-world problems before handing it to `pg`/Drizzle:
//
// 1. PERCENT-ENCODING A LITERAL "@" IN THE PASSWORD.
//    A Postgres URL looks like `postgres://user:password@host:port/db`.
//    The authority section (`user:password@host:port`) is split from the
//    host by the LAST "@" - but if the password itself contains an
//    unescaped "@" character, naive parsing (or `new URL(...)`) would
//    split at the wrong "@" and mangle the host. This code finds the final
//    "@" (correctly treating everything before it, including any earlier
//    "@"s, as credentials) and percent-encodes ("%40") any "@" that
//    appears within the credentials portion only - producing a URL that
//    parses unambiguously.
// 2. REWRITING THE "postgres" HOSTNAME TO "localhost" OUTSIDE PRODUCTION.
//    In a docker-compose setup, the Postgres container is typically
//    reachable at the hostname `postgres` from OTHER containers on the
//    compose network. But when running `next dev` directly on the host
//    machine (not itself inside that network), `postgres` doesn't resolve -
//    only `localhost` (via the container's published port) does. Rather
//    than maintaining two different DATABASE_URL values for "inside
//    compose" vs. "on the host", this rewrites the hostname for any
//    non-production run so the same env var works for local dev against a
//    dockerized DB. In production this rewrite is skipped, since there the
//    `postgres` hostname (or whatever the real prod host is) should be used
//    as-is.
export function getDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL?.trim();

  if (!rawUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const schemeEnd = rawUrl.indexOf("://");
  if (schemeEnd === -1) {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL");
  }

  // The "authority" is everything between "://" and the next "/" (start of
  // the path/db-name) - i.e. `user:password@host:port`.
  const authorityStart = schemeEnd + 3;
  const pathStart = rawUrl.indexOf("/", authorityStart);
  const authorityEnd = pathStart === -1 ? rawUrl.length : pathStart;
  const authority = rawUrl.slice(authorityStart, authorityEnd);
  // Searching from the end (not the first "@") is what correctly handles a
  // password containing "@" - the credentials/host boundary in a URL is
  // always the LAST "@" in the authority.
  const finalAt = authority.lastIndexOf("@");

  const normalizedAuthority =
    finalAt === -1
      ? authority
      : `${authority
          .slice(0, finalAt)
          .replaceAll("@", "%40")}@${authority.slice(finalAt + 1)}`;

  let normalizedUrl = `${rawUrl.slice(
    0,
    authorityStart
  )}${normalizedAuthority}${rawUrl.slice(authorityEnd)}`;

  if (process.env.NODE_ENV !== "production") {
    normalizedUrl = normalizedUrl.replace(
      /@postgres(?=[:/?]|$)/,
      "@localhost"
    );
  }

  // Q. Why append sslmode=no-verify here instead of leaving SSL to whoever
  // consumes this URL?
  // ANS: This same string is handed to two different things - the app's own
  // `pg` Pool (src/lib/db/index.ts, which sets its own explicit
  // `{ rejectUnauthorized: false }` ssl option that takes precedence over
  // anything here) and drizzle-kit's migration runner (drizzle.config.ts),
  // which has no equivalent override and just uses whatever this URL says.
  // Any host that isn't the local rewrite target above is a hosted Postgres
  // provider (Supabase, Neon, ...) that requires TLS. `no-verify` (rather
  // than `require`) matters specifically because some networks/VPNs do TLS
  // interception - presenting their own certificate instead of the
  // provider's - which a strict `sslmode=require` chain validation rejects
  // outright; matching index.ts's `rejectUnauthorized: false` here keeps
  // both consumers tolerant of that the same way.
  const isLocalHost = /@(localhost|127\.0\.0\.1)(?=[:/?]|$)/.test(
    normalizedUrl
  );
  if (!isLocalHost && !normalizedUrl.includes("sslmode=")) {
    normalizedUrl += normalizedUrl.includes("?")
      ? "&sslmode=no-verify"
      : "?sslmode=no-verify";
  }

  return normalizedUrl;
}
