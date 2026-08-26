// BROWSER-SAFE counterpart to src/lib/auth.ts. This file has no server
// secrets or DB access at all - `createAuthClient` just builds a fetch-based
// SDK that talks over HTTP to the catch-all Route Handler at
// src/app/api/auth/[...all]/route.ts (sign-in, sign-out, session reads,
// etc.). This is what "use client" components import - see
// src/components/auth/login-button.tsx (signIn) and
// src/components/layout/header.tsx (useSession, signOut).
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Client-side counterpart to the server's `admin()` plugin in
  // src/lib/auth.ts - keeps the client's typed session shape (session.user.role)
  // in sync with the server plugin, it doesn't grant any extra permissions itself.
  plugins: [adminClient()],
});

export const { signIn, signOut, useSession, getSession } = authClient;
