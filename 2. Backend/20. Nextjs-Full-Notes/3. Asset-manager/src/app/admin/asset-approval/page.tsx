import {
  approveAssetAction,
  getPendingAssetsAction,
  rejectAssetAction,
} from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPriceFromCents } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { BadgeDollarSign, User } from "lucide-react";
import Image from "next/image";

// Admin-only page - protection comes from admin-actions.ts checking
// `session.user.role !== "admin"` inside getPendingAssetsAction itself
// (throws if not an admin), not from a check in this component. There's no
// middleware.ts route-level guard for /admin/* either; every admin Server
// Action re-asserts the role check on its own (see the top-of-file comment
// in src/actions/admin-actions.ts for why).
// NOTE: because getPendingAssetsAction throws (rather than redirecting)
// when the caller isn't an admin, a non-admin who navigates straight to
// this URL will hit Next's error boundary (nearest error.tsx, or the
// default error page) instead of being redirected to /login like
// src/app/dashboard/layout.tsx does. Different auth-gating pages in this
// app fail in different ways - worth knowing when debugging "why did I get
// an error screen instead of a redirect".
async function AssetApprovalPage() {
  const pendingAssets = await getPendingAssetsAction();

  return (
    <div className="page-shell py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Asset Approval</h1>
        <p className="mt-2 text-muted-foreground">
          Review marketplace submissions before they go live.
        </p>
      </div>
      {pendingAssets.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <p className="text-center text-muted-foreground text-lg">
              All assets have been reviewed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pendingAssets.map(({ asset, userName }) => (
            <div
              key={asset.id}
              className="panel overflow-hidden rounded-lg transition-shadow hover:shadow-md"
            >
              <div className="h-48 bg-muted relative">
                <Image
                  src={asset.fileUrl}
                  alt={asset.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold truncate">{asset.title}</h3>
                  <span className="inline-flex items-center rounded-md bg-accent px-2 py-1 text-sm font-semibold text-accent-foreground">
                    <BadgeDollarSign className="mr-1 h-4 w-4" />
                    {formatPriceFromCents(asset.price)}
                  </span>
                </div>
                {asset.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {asset.description}
                  </p>
                )}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(asset.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="mr-2 w-4 h-4" />
                    {userName}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t p-4">
                {/* Anonymous INLINE Server Actions - one closure per row of
                    the .map() above, each capturing that row's `asset.id`.
                    Each still needs its own "use server" directive even
                    though it's defined inline with no name. This is the
                    same inline-server-action pattern used for
                    `handlePurchase` in src/app/gallery/[id]/page.tsx, just
                    anonymous instead of named. */}
                <form
                  action={async () => {
                    "use server";
                    await approveAssetAction(asset.id);
                  }}
                >
                  <Button>Approve</Button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await rejectAssetAction(asset.id);
                  }}
                >
                  <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Reject
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssetApprovalPage;
