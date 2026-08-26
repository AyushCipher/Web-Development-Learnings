/// <reference types="vite/client" />

// Vite only exposes env vars prefixed with VITE_ to client code (anything
// else stays server/build-time only, so secrets in a plain .env don't leak
// into the browser bundle by accident). Declaring them here gives
// import.meta.env.VITE_SUPABASE_URL etc. real types/autocomplete instead of
// falling back to `any`, and is why supabase-client.ts doesn't need its own
// "as string" casts checked against nothing.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
