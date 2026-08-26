// Wraps the app so any Client Component (e.g. data-fetching/react-query/page.tsx)
// can call useQuery/useMutation. This itself must be "use client" because
// QueryClientProvider is built on React Context, which needs the client runtime.
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create the QueryClient with useState(() => ...) rather than a plain
  // `new QueryClient()` module-level constant. In the App Router, the same
  // component module can run on the server to render multiple different
  // requests - a module-level singleton would leak cached data between
  // different users. useState guarantees each browser session gets its own
  // instance, created exactly once (the initializer function only runs on
  // first render).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // cache the data 5 mins by default
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 100,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
