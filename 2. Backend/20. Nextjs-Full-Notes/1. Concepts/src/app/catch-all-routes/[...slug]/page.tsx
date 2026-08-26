// CATCH-ALL ROUTE: a folder named [...slug] matches ONE OR MORE path segments
// after /catch-all-routes/, collecting them into an array. E.g.:
//   /catch-all-routes/shoes            -> slug = ["shoes"]
//   /catch-all-routes/shoes/nike/air   -> slug = ["shoes", "nike", "air"]
// It does NOT match /catch-all-routes itself with zero segments - for that you
// need the OPTIONAL version, [[...slug]] (see optional-catch-all-route/).
// In Next.js 15, `params` is a Promise and must be awaited (this changed from
// Next 14, where params was a plain object) - it's async so Next can defer
// resolving route params until they're actually needed, enabling faster
// static rendering of the parts of the page that don't depend on them.
export default async function ProductFilter({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  console.log(slug);

  return (
    <div>
      <h1>Product Filter</h1>
    </div>
  );
}
