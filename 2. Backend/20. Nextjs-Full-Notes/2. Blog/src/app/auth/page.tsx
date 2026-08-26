// "/auth" is intentionally a thin Server Component wrapper - all the
// interactive login/register UI lives in the "use client" AuthLayout tree
// underneath. This page also has special handling in middleware.ts: if a
// session cookie already exists when hitting "/auth", middleware redirects
// away to "/" before this component ever renders.
import AuthLayout from "@/components/auth/auth-layout";

function Authpage() {
  return <AuthLayout />;
}

export default Authpage;
