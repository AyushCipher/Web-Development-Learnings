// app/loading-example/loading.tsx is another special file: Next.js automatically
// wraps this segment's page.tsx in a <Suspense fallback={<LoadingExampleLoader />}>.
// The route shell (and anything above it, like the root layout/header) is sent
// and shown to the user IMMEDIATELY, while the async page.tsx below is still
// awaiting getData() on the server - this is streaming SSR. Once the data
// resolves, Next.js streams in the real content and swaps it in, no full
// page reload or client-side spinner logic required.
export default function LoadingExampleLoader() {
  return (
    <div className="p-8">
      <div>Loading...</div>
    </div>
  );
}
