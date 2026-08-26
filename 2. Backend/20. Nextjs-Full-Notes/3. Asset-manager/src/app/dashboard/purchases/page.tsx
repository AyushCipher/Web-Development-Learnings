import { getUserInvoicesAction } from "@/actions/invoice-actions";
import { getAllUserPurchasedAssetsAction } from "@/actions/payment-actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { formatPriceFromCents } from "@/lib/utils";
import { Download, FileText } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

async function UserPurchasesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session === null) return null;

  if (!session.user) redirect("/login");
  if (session?.user?.role === "admin") redirect("/");

  // Two independent Server Action calls, awaited sequentially here (unlike
  // the Promise.all pattern in dashboard/assets/page.tsx) - both still run
  // entirely on the server before this component's HTML is produced.
  const purchasesResult = await getAllUserPurchasedAssetsAction();
  const invoicesResult = await getUserInvoicesAction();

  const purchases = Array.isArray(purchasesResult) ? purchasesResult : [];
  const invoices =
    invoicesResult.success && invoicesResult.invoices
      ? invoicesResult.invoices
      : [];

  // Purchases and invoices are two separate tables/queries; this map just
  // joins them client-side-of-the-render (still server-rendered) so each
  // purchase row can look up its invoice id in O(1) instead of a nested loop.
  const purchaseToInvoiceMap = new Map();
  invoices.forEach((inv) => purchaseToInvoiceMap.set(inv.purchaseId, inv.id));

  return (
    <div className="page-shell py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Purchases</h1>
        <p className="mt-2 text-muted-foreground">
          Download purchased assets and open invoices whenever you need them.
        </p>
      </div>
      {purchases.length === 0 ? (
        <div className="panel rounded-lg p-10 text-center">
          <h2 className="text-xl font-semibold">No purchases yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Assets you buy from the gallery will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map(({ purchase, asset }) => (
            <div
              key={purchase.id}
              className="panel flex flex-col gap-4 rounded-lg p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center"
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={asset.fileUrl}
                  alt={asset.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="font-medium truncate">{asset?.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Purchased at{" "}
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatPriceFromCents(purchase.price)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Same download Route Handler / entitlement gate as
                    src/app/gallery/[id]/page.tsx - see
                    src/app/api/download/[id]/route.ts. */}
                <Button size="sm" asChild>
                  <a href={`/api/download/${asset.id}`} download>
                    <Download className="mr-2 w-4 h-4" />
                    Download
                  </a>
                </Button>
                {purchaseToInvoiceMap.has(purchase.id) && (
                  // Opens the invoice HTML Route Handler
                  // (src/app/api/invoice/[id]/route.ts) in a new tab - note
                  // the id in the URL is the INVOICE id from the map above,
                  // not the purchase or asset id.
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`/api/invoice/${purchaseToInvoiceMap.get(
                        purchase.id
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="mr-2 w-4 h-4" />
                      Invoice
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPurchasesPage;
