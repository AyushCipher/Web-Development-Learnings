import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with environment variables
// Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local
// (see SETUP_SUPABASE_BUCKET.md - both come from your Supabase project's
// dashboard under Settings -> API). Typed via vite-env.d.ts's ImportMetaEnv
// augmentation, so no "as string" cast is needed here.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)