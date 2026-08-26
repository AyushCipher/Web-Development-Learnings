// ROUTE HANDLER used as an AUTHORIZATION GATE, not a JSON API.
// Linked from `<a href={`/api/download/${id}`} download>` in
// src/app/gallery/[id]/page.tsx and src/app/dashboard/purchases/page.tsx.
// This route never streams the file bytes itself - it does the real
// entitlement check server-side (session + purchase record) and then issues
// an HTTP redirect straight to the asset's stored fileUrl (Cloudinary).
// The `hasPurchasedAsset` flag used to conditionally render the download
// button in the gallery page is only a UI convenience - THIS route is what
// actually enforces "did this user pay for this asset", because a user
// could otherwise guess/type the download URL directly regardless of what
// the page rendered.
import { getAssetByIdAction } from "@/actions/dashboard-actions";
import { hasUserPurchasedAssetAction } from "@/actions/payment-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // In Next.js 15, `params` is a Promise (was a plain object pre-15) so
  // Next can start rendering/streaming before dynamic route params are
  // fully resolved. It must be awaited before use.
  const { id } = await params;

  try {
    // Step 1: must be authenticated at all.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Step 2: must actually own a purchase record for this asset. This is
    // the real gate - see hasUserPurchasedAssetAction in
    // src/actions/payment-actions.ts, populated by the PayPal capture flow.
    const hasPurchased = await hasUserPurchasedAssetAction(id);

    if (!hasPurchased) {
      return NextResponse.redirect(new URL(`/gallery/${id}`, request.url));
    }

    const result = await getAssetByIdAction(id);

    if (!result) {
      return NextResponse.redirect(new URL(`/gallery`, request.url));
    }

    // Redirect the browser directly to the file's real URL instead of
    // proxying/streaming the bytes through our server. Cheaper for us, but
    // note the real Cloudinary URL becomes briefly visible to the client
    // via the redirect's Location header/final request.
    return NextResponse.redirect(result?.asset.fileUrl);
  } catch (e) {
    return NextResponse.redirect(new URL(`/gallery`, request.url));
  }
}
