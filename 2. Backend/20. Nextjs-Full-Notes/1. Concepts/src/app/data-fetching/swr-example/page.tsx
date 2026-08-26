// APPROACH 4 of 5 - SWR ("stale-while-revalidate"), a lightweight client-side
// data-fetching/caching library from Vercel. Always a Client Component (it's
// built on hooks). It handles caching, deduping, revalidation-on-focus, and
// polling for you - compare to the manual isLoading/setState wiring in
// use-effect-example/.
"use client";

import useSWR from "swr";


interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());


function SWRExample() {
  const { data, error, isLoading, mutate } = useSWR(
    "https://dummyjson.com/products", // the cache KEY - same key elsewhere in the app reuses this cached data
    fetcher,
    {
      revalidateOnFocus: true, // refetch automatically when the browser tab regains focus
      refreshInterval: 30000, // poll every 30s
      errorRetryCount: 3,
    }
  );

  // mutate() manually triggers a revalidation (re-fetch), e.g. after a mutation elsewhere
  const handleRefresh = () => {
    mutate();
  };

  if (isLoading) return <h1>Loading...</h1>;

  if (error) return <h1>{error.message}</h1>;

  console.log(data, error, isLoading);

  return (
    <div>
      <h1>SWR Example</h1>
      <button onClick={handleRefresh}>Refresh</button>
      <div className="flex flex-col gap-2">
        {data?.products.map((product: Product) => (
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

export default SWRExample;
