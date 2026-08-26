// Static list served at /products. Each card links to a DYNAMIC route segment
// (products/[slug]/page.tsx) using the product's id - see that file for how
// Next.js can even pre-render those pages at build time via generateStaticParams.
import Link from "next/link";

function Products() {
  const products = [
    {
      id: "1",
      name: "Mobile",
      price: 500,
    },
    {
      id: "2",
      name: "Laptop",
      price: 2500,
    },
    {
      id: "3",
      name: "Watch",
      price: 4999,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h2>{product.name}</h2>
            <p>${product.price}</p>
            <Link href={`/products/${product.id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
