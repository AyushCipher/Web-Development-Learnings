// Try visiting:
//   /middleware-example                       -> middleware redirects you to ?blocked=true
//   /middleware-example?blocked=true           -> renders the "blocked" message below
//   /middleware-example?access=granted         -> middleware lets it through, renders normally
// See ../../middleware.ts for the logic that intercepts this route.
export default async function MiddlewareExample({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string }>;
}) {
  const { blocked } = await searchParams;

  if (blocked) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Blocked by middleware</h1>
        <p>
          Middleware redirected you here because the URL was missing{" "}
          <code>?access=granted</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Access granted</h1>
      <p>Middleware let this request through.</p>
    </div>
  );
}
