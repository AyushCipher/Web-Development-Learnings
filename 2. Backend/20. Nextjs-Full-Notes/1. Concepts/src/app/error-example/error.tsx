// app/error-example/error.tsx is a special file: Next.js automatically wraps
// the segment's page.tsx (and its nested children) in a React Error Boundary
// using this component as the fallback UI. If getProducts() in page.tsx
// throws, this renders instead - the rest of the app (header, sibling routes)
// stays interactive.
// Scope note: an error.tsx only catches errors thrown BELOW it in the tree.
// It can't catch an error thrown in its own segment's layout.tsx, and it can't
// catch errors in the ROOT layout - that needs a top-level app/global-error.tsx
// (which must also render its own <html>/<body> since it replaces the root layout).
"use client"; // error.tsx MUST be a Client Component - error boundaries rely on React lifecycle features only available on the client

import { useEffect } from "react";

export default function ErrorExampleFallbackUI({
  error,
  reset, // calling reset() attempts to re-render the segment, e.g. to retry a failed fetch
}: {
  error: Error & { digest?: string }; // `digest` is a hash Next.js attaches so you can correlate the client error with the server log
  reset: () => void;
}) {
  useEffect(() => {
    // typically report `error` to Sentry/Datadog/etc. here
    //sent a report to your error logging service
  }, [error]);

  return (
    <div>
      <p className="text-red-600">{error?.message || "An error occured"}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
