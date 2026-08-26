import {
  getCategoriesAction,
  getUserAssetsAction,
} from "@/actions/dashboard-actions";
import AssetGrid from "@/components/dashboard/asset-grid";
import UploadAsset from "@/components/dashboard/upload-asset";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Server Component - fetches data directly with `await` during render (no
// useEffect/loading state needed on the client for this initial data).
// The parent layout (src/app/dashboard/layout.tsx) already redirects
// unauthenticated/admin users away, so the `session === null` check below
// is just a defensive type-narrowing guard for TypeScript, not the real gate.
async function UserdAssetsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session === null) return null;

  // Promise.all fires both server-side data fetches concurrently instead of
  // sequentially (avoiding an await-then-await "waterfall") - they don't
  // depend on each other's result, only on `session.user.id` which is
  // already known.
  const [categories, assets] = await Promise.all([
    getCategoriesAction(),
    getUserAssetsAction(session?.user?.id),
  ]);

  return (
    <div className="page-shell py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">My Assets</h1>
          <p className="mt-2 text-muted-foreground">
            Track uploads, approval status, and buyer-facing prices.
          </p>
        </div>
        {/* "use client" component - see src/components/dashboard/upload-asset.tsx
            for the direct-to-Cloudinary upload flow (step 1 of the UPLOAD
            story, alongside src/app/api/cloudinary/signature/route.ts). */}
        <UploadAsset categories={categories || []} />
      </div>
      {assets.length === 0 ? (
        <div className="panel rounded-lg p-10 text-center">
          <h2 className="text-xl font-semibold">No uploads yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your uploaded assets will appear here after you add them.
          </p>
        </div>
      ) : (
        <AssetGrid assets={assets} />
      )}
    </div>
  );
}

export default UserdAssetsPage;
