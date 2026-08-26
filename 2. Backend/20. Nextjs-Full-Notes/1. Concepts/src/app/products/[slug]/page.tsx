// DYNAMIC ROUTE SEGMENT: the [slug] folder matches exactly ONE path segment,
// e.g. /products/1, /products/2, /products/anything - whatever is typed there
// is passed in as `params.slug`.
//
// GENERATE STATIC PARAMS (Static Site Generation for dynamic routes):
// By default a dynamic route like this renders on-demand for every request
// (SSR). If you export `generateStaticParams`, Next.js instead calls it at
// BUILD TIME, gets back a list of param values, and pre-renders one static
// HTML page per value (like getStaticPaths did in the old Pages Router).
// Any slug NOT in this list still renders on-demand the first time it's
// requested (and can then be cached), unless you opt out via
// `export const dynamicParams = false`.
export async function generateStaticParams() {
  // in a real app this would come from a DB/CMS, e.g. `db.select({ id: products.id })`
  return [{ slug: "1" }, { slug: "2" }, { slug: "3" }];
}

async function ProductDetails({ params,}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  console.log(slug, "slug");

  return <h1>Product Details Page</h1>;
}

export default ProductDetails;
