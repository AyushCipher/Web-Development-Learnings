// OPTIONAL CATCH-ALL ROUTE: double brackets [[...slug]] behave like [...slug]
// (matches one or more segments) PLUS it also matches the base path with ZERO
// segments:
//   /optional-catch-all-route         -> slug = undefined
//   /optional-catch-all-route/shoes   -> slug = ["shoes"]
// That's why `slug` is typed as optional (string[] | undefined) here, unlike
// the required catch-all example next door.
export default async function OptionalProductFilter({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  console.log(slug);

  return (
    <div>
      <h1>Product Filter</h1>
    </div>
  );
}
