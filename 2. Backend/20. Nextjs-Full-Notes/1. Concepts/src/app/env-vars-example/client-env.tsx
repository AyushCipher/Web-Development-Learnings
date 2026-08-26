"use client";

export default function ClientEnv() {
  return (
    <div className="mt-4 border-t pt-4">
      <h2 className="font-semibold mb-2">Read from a Client Component</h2>
      <p>NEXT_PUBLIC_SITE_NAME: {process.env.NEXT_PUBLIC_SITE_NAME}</p>
      <p>
        SECRET_API_KEY: {String(process.env.SECRET_API_KEY)} - this prints
        the literal string &quot;undefined&quot;, not just an empty value.
        Next.js's bundler only text-replaces `process.env.NEXT_PUBLIC_*`
        references with their actual values at build time; any other
        `process.env.X` reference left in client code is never substituted,
        and there's no real `process` object in the browser to fall back to -
        so it evaluates to `undefined` at runtime. The secret was never sent
        here at all, not even in a hidden/inaccessible form.
      </p>
    </div>
  );
}
