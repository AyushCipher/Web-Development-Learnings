// ROUTE SEGMENT CONFIG: `next build` tries to STATICALLY prerender every page
// it can, once, at build time. This page's data-fetch is intentionally random,
// so if the build happened to hit the error branch, the whole `next build`
// would fail (a build-time crash, not a graceful error.tsx render). Forcing
// this segment to render dynamically (per-request, like traditional SSR) means
// Next.js never prerenders it, so a thrown error here is only ever caught at
// request time by error.tsx, exactly as intended by this demo. Compare to
// `export const revalidate = 10` in app/isr-example/page.tsx, which opts a
// route INTO static caching instead of out of it.
export const dynamic = "force-dynamic";

async function getProducts() {
  //simulate a dummy error here
  const shouldError = Math.random() > 0.5;

  // Throwing inside an async Server Component is caught by the nearest
  // error.tsx boundary above it in the tree (see ./error.tsx). Refresh this
  // page a few times - about half the loads will render the error UI instead.
  if (shouldError) {
    throw new Error("Failed to fetch products");
  }

  return [
    {
      id: 1,
      name: "One",
    },
    {
      id: 2,
      name: "Two",
    },
    {
      id: 3,
      name: "Three",
    },
  ];
}

export default async function ErrorExample() {
  const products = await getProducts();

  return (
    <div className="p-4">
      <h1>Products List</h1>
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id}>
            <p>{product.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
