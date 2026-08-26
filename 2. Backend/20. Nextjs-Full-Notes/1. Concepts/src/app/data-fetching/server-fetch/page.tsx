// APPROACH 1 of 5 in this data-fetching folder - see the sibling folders for
// use-effect-example (client fetch), use-hook (React 19 use()+Suspense),
// swr-example, and react-query (client cache libraries).
//
// SERVER-SIDE FETCH: calling fetch() inside an async Server Component runs on
// the server during rendering - no client JS, no loading spinner needed
// (loading.tsx handles the "waiting" UI instead, see app/loading-example).
// Next.js patches the global fetch() to add its own caching layer on top of
// the browser Cache API semantics:
// default -> fetch() -> caches responses automatically
// cache -> reload, no-store, force-cache

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
}

async function getProducts(): Promise<ProductsResponse> {
  const response = await fetch("https://dummyjson.com/products", {
    // cache: 'no-store'    // never cache the response - always fetches fresh (like getServerSideProps)
    // cache: 'force-cache' // cache indefinitely and reuse it (like getStaticProps) - this is actually the DEFAULT
    cache: "reload", // ignore any existing cache entry, fetch fresh, then store the new response in the cache
  });

  // vvi -> this all u need based on ur requirement -> u need to apply cache strategy

  if (!response.ok) {
    throw new Error("Failed to fetch products!");
  }

  return response.json();
}


async function ServerSideFetchExample() {
  const products = await getProducts();
  console.log(products);

  return (
    <div>
      <h1>Server side data fetching</h1>
      <h3>{products?.total} no of products</h3>
      <div className="flex flex-col gap-2">
        {products?.products?.map((product) => (
          <div key={product.id}>
            <h3>{product.title}</h3>
            <p>${product.price}</p>
            <p>{product.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServerSideFetchExample;
