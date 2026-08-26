// The client-safe counterpart to src/lib/auth.ts. `better-auth/react`
// exposes a lightweight fetch-based SDK (plus the `useSession` React hook)
// that talks to the /api/auth/* Route Handler over HTTP - it holds no
// secrets and does no direct DB access, so it's safe to import from
// "use client" components (see login-form.tsx, register-form.tsx,
// user-menu.tsx, header.tsx). Never import "@/lib/auth" (the server
// instance) from a client component; always go through this file instead.
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // process.env.BASE_URL is read at build time here since this module can
  // end up in the client bundle - Next.js only inlines env vars prefixed
  // with NEXT_PUBLIC_ into client code by default, but createAuthClient is
  // typically called during the server-rendered pass too, so this works
  // for both; if BASE_URL isn't set, this falls back to localhost.
  baseURL: process.env.BASE_URL || "http://localhost:3000",
});

// Re-exported individually so components can `import { signIn } from
// "@/lib/auth-client"` instead of `authClient.signIn`.
export const { signUp, signIn, signOut, useSession } = authClient;
