// DYNAMIC ROUTE HANDLER: exactly like a dynamic page ([id]/page.tsx), a route
// handler folder can use [param] segments. Reachable at GET /api/products/1,
// /api/products/2, etc. Compare the `{ params }` signature to a page's
// props - same idea (a Promise you must await in Next.js 15), just delivered
// as the handler's second argument instead of a component prop.
import { NextRequest, NextResponse } from "next/server";

const dummyProducts = [
  { id: "1", name: "Mobile", price: 500 },
  { id: "2", name: "Laptop", price: 2500 },
  { id: "3", name: "Watch", price: 4999 },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = dummyProducts.find((p) => p.id === id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
