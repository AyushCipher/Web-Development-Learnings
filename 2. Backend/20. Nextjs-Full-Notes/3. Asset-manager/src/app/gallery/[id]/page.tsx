import { getAssetByIdAction } from "@/actions/dashboard-actions";
import {
  createPaypalOrderAction,
  hasUserPurchasedAssetAction,
} from "@/actions/payment-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatPriceFromCents } from "@/lib/utils";
import {
  CheckCircle,
  Download,
  Info,
  Loader2,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

// DYNAMIC ROUTE `/gallery/[id]` - public asset detail + purchase page, and
// the landing point of the PURCHASE flow's "success" redirect from
// src/app/api/paypal/capture/route.ts (?success=true).
//
// Both `params` and `searchParams` are typed as Promises below - as of
// Next.js 15 these are ALWAYS Promises (previously plain objects pre-15),
// specifically so Next can start streaming a route's static shell before
// dynamic route/query data has resolved. Both must be `await`ed.
interface GalleryDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
    canceled?: string;
    error?: string;
  }>;
}

type GalleryContentProps = {
  id: string;
  searchParams: {
    success?: string;
    canceled?: string;
    error?: string;
  };
};

async function GalleryDetailsPage({
  params,
  searchParams,
}: GalleryDetailsPageProps) {
  // Promise.all here just resolves the two route Promises in parallel
  // instead of two sequential `await`s - both resolve almost instantly
  // (they're not real I/O), so this isn't where the actual latency is.
  const [{ id }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  // The real async work - auth.api.getSession() and the DB query for the
  // asset - happens inside <GalleryContent>, not here. Wrapping it in
  // <Suspense> lets Next.js send the page shell + this loading spinner to
  // the browser immediately, then stream in the real content once those
  // server calls finish, instead of blocking the whole response on them.
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[65vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <GalleryContent id={id} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

export default GalleryDetailsPage;




async function GalleryContent({
  id,
  searchParams,
}: GalleryContentProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Admins don't shop - this whole page (browse/purchase) is a buyer
  // experience. Same inline `auth.api.getSession()` + `redirect()` pattern
  // used everywhere in this app instead of a middleware.ts gate.
  if (session && session?.user?.role === "admin") {
    redirect("/");
  }

  const success = searchParams?.success;

  const result = await getAssetByIdAction(id);

  if (!result) {
    notFound();
  }

  const { asset, categoryName, userName, userId } = result;

  const isAuthor = session?.user.id === userId;
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const hasPurchasedAsset = session?.user?.id
    ? await hasUserPurchasedAssetAction(id)
    : false;


  // INLINE SERVER ACTION defined directly inside this (async, server-only)
  // component function body. This is legal in Next.js and a common
  // pattern: even though GalleryContent is already server-only code, this
  // closure still needs its OWN "use server" directive to be usable as a
  // <form action={...}> target from the JSX below - the directive is what
  // tells Next's compiler to extract it into its own server-callable
  // reference sent down to the client, instead of just running as ordinary
  // server-side JSX-building code.
  //
  // Defining it here (rather than as a top-level export in payment-actions.ts)
  // lets it close over `id` from the surrounding scope for free - no hidden
  // form field or extra argument needed to tell it which asset to buy.
  async function handlePurchase() {
    "use server";

    const result = await createPaypalOrderAction(id);

    if (result.alreadyPurchased) {
      redirect(`/gallery/${id}?success=true`);
    }

    // Redirects the buyer's browser to PayPal's own hosted checkout page
    // (an external domain) to approve the payment. PayPal will eventually
    // redirect back to /api/paypal/capture (configured in
    // createPaypalOrderAction's return_url) to complete the purchase.
    if (result.approvalLink) {
      redirect(result.approvalLink);
    }
  }

  return (
    <div className="min-h-screen pb-12">
      {/* `success` comes from the ?success=true query param set by
          src/app/api/paypal/capture/route.ts after it redirects back here -
          this banner is purely cosmetic, it does not re-verify anything. */}
      {success && (
        <div className="page-shell pt-6">
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p>Purchase successful. You can now download this asset.</p>
          </div>
        </div>
      )}
      <div className="page-shell py-10">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <div className="panel overflow-hidden rounded-lg">
              <div className="relative w-full">
                <Image
                  src={asset.fileUrl}
                  alt={asset.title}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{asset?.title}</h1>
                {categoryName && (
                  <Badge className="mt-2" variant="secondary">
                    <Tag className="mr-1 h-4 w-4" />
                    {categoryName}
                  </Badge>
                )}
                {asset.description && (
                  <p className="mt-4 max-w-2xl text-muted-foreground">
                    {asset.description}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">Creator</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="sticky top-24">
              <Card className="overflow-hidden rounded-lg shadow-lg">
                <div className="bg-foreground p-6 text-background">
                  <h3 className="text-xl font-bold mb-2">Premium Asset</h3>
                  <div>
                    <span className="text-3xl font-bold">
                      {formatPriceFromCents(asset.price)}
                    </span>
                    <span className="ml-2 text-background/70">
                      One Time Purchase
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {session?.user ? (
                      isAuthor ? (
                        <div className="flex items-start gap-3 rounded-lg border bg-secondary p-5 text-secondary-foreground">
                          <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                          <p className="text-sm">
                            This is your own asset. You can't purchase your own
                            asset
                          </p>
                        </div>
                      ) : hasPurchasedAsset ? (
                        // Plain <a href> to the download Route Handler, not
                        // a Next <Link> - this is an actual file download
                        // (browser `download` attribute), not a client-side
                        // navigation to another page. The route handler
                        // itself re-verifies purchase ownership; this button
                        // only rendering when hasPurchasedAsset is true is a
                        // UI nicety, not the security boundary.
                        <Button
                          asChild
                          className="h-12 w-full bg-green-600 text-white hover:bg-green-700"
                        >
                          <a href={`/api/download/${id}`} download>
                            <Download className="mr-2 w-6 h-6" />
                            Download Asset
                          </a>
                        </Button>
                      ) : (
                        // Standard HTML <form> whose `action` is the inline
                        // Server Action above - clicking submit performs a
                        // real (progressively-enhanced) form POST that Next
                        // intercepts and routes to `handlePurchase` on the
                        // server, no client-side fetch/JS required to wire
                        // this up.
                        <form action={handlePurchase}>
                          <Button
                            type="submit"
                            className="h-12 w-full"
                          >
                            <ShoppingCart className="mr-2 w-6 h-6" />
                            Purchase Now
                          </Button>
                        </form>
                      )
                    ) : (
                      <>
                        <Button
                          asChild
                          className="h-12 w-full"
                        >
                          <Link href="/login">Sign In to Purchase</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
