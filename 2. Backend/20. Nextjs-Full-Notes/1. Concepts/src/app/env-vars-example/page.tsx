// ENVIRONMENT VARIABLES - see ../../../.env.local for the two demo values
// this page reads.
// - Server Components/Actions/Route Handlers/Middleware can read ANY
//   variable from process.env directly (no import) - the whole point of
//   .env.local is to keep secrets (API keys, DB URLs) out of source control
//   while still being available on the server.
// - Client Components can only read variables prefixed `NEXT_PUBLIC_` -
//   Next.js's build step literally text-replaces those references with
//   their string value at build time (like a find-and-replace, not a
//   runtime lookup) - see client-env.tsx for what happens to a
//   non-prefixed variable in client code.
// Precedence when multiple files exist: .env.local overrides .env, and
// .env.production/.env.development override both depending on the current
// mode - not demonstrated here since one file is enough to show the split
// that actually matters (server-only vs. NEXT_PUBLIC_).
import ClientEnv from "./client-env";

export default function EnvVarsExample() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Example</h1>

      <h2 className="font-semibold mb-2">Read from a Server Component</h2>
      <p>SECRET_API_KEY: {process.env.SECRET_API_KEY}</p>
      <p>NEXT_PUBLIC_SITE_NAME: {process.env.NEXT_PUBLIC_SITE_NAME}</p>

      <ClientEnv />
    </div>
  );
}
