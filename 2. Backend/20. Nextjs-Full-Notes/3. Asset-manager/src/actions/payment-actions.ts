"use server";
// Server Actions powering the PURCHASE flow end to end:
//   1. createPaypalOrderAction - called from the INLINE server action
//      `handlePurchase` defined inside src/app/gallery/[id]/page.tsx. Opens
//      an order with PayPal and returns an approval link to redirect to.
//   2. The buyer approves on PayPal's site; PayPal redirects back to
//      src/app/api/paypal/capture/route.ts, which captures the payment and
//      calls recordPurchaseAction below to persist it (after re-verifying
//      the amount/asset/user).
//   3. recordPurchaseAction also triggers createInvoiceAction
//      (src/actions/invoice-actions.ts) and revalidatePath()s the affected
//      pages.
//   4. hasUserPurchasedAssetAction is the entitlement check reused both by
//      the UI (to decide which button to show) and by
//      src/app/api/download/[id]/route.ts (the actual download gate).
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { asset, payment, purchase } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createInvoiceAction } from "./invoice-actions";

function centsToPaypalValue(priceInCents: number) {
  return (priceInCents / 100).toFixed(2);
}

type PaypalLink = {
  href: string;
  rel: string;
};

// Server Actions/Route Handlers have no `window.location` to read the app's
// own origin from - they only see the incoming request. This rebuilds the
// absolute origin (needed for PayPal's return_url/cancel_url, which must be
// full URLs) from request headers. `x-forwarded-host`/`x-forwarded-proto`
// are checked first because behind a reverse proxy or a platform like
// Vercel, the `host` header can be the internal hostname rather than the
// public one the browser actually used.
function getRequestOrigin(requestHeaders: Headers) {
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");

  if (!host) {
    throw new Error("Unable to determine the application URL");
  }

  return `${protocol}://${host}`;
}

// Invoked from the inline "use server" function defined inside
// src/app/gallery/[id]/page.tsx's GalleryContent component (`handlePurchase`),
// which is itself the `action` of a plain <form>. This is a Server Action
// calling out to a third-party HTTP API (PayPal) - nothing special about
// that from Next's point of view, it's just server-side code.
export async function createPaypalOrderAction(assetId: string) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  // redirect() inside a Server Action works by throwing a special
  // Next.js-internal signal that the framework catches and turns into a
  // navigation - it does not return normally, so no code after this line
  // in this branch would ever run.
  if (!session?.user.id) {
    redirect("/login");
  }

  const [getAsset] = await db.select().from(asset).where(eq(asset.id, assetId));
  if (!getAsset) {
    throw new Error("Asset not found");
  }

  if (getAsset.userId === session.user.id) {
    throw new Error("You cannot purchase your own asset");
  }

  const existingPurchase = await db
    .select()
    .from(purchase)
    .where(
      and(eq(purchase.assetId, assetId), eq(purchase.userId, session.user.id))
    )
    .limit(1);

  if (existingPurchase.length > 0) {
    return {
      alreadyPurchased: true,
    };
  }

  try {
    const appOrigin = getRequestOrigin(requestHeaders);
    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: assetId,
              description: `Purchase of ${getAsset.title}`,
              amount: {
                currency_code: "USD",
                value: centsToPaypalValue(getAsset.price),
              },
              // custom_id round-trips through PayPal untouched and is
              // re-derived and compared in src/app/api/paypal/capture/route.ts
              // to make sure the capture we're about to trust actually
              // belongs to this user + this asset.
              custom_id: `${session.user.id}|${assetId}`,
            },
          ],
          application_context: {
            return_url: `${appOrigin}/api/paypal/capture?assetId=${assetId}`,
            cancel_url: `${appOrigin}/gallery/${assetId}?cancelled=true`,
          },
        }),
      }
    );

    const data = (await response.json()) as {
      id?: string;
      links?: PaypalLink[];
      message?: string;
    };

    if (!response.ok) {
      throw new Error(data.message ?? "PayPal rejected the order");
    }

    const approvalLink = data.links?.find((link) => link.rel === "approve")?.href;

    if (data.id && approvalLink) {
      return {
        orderId: data.id,
        approvalLink,
      };
    } else {
      throw new Error("Failed to create paypal order");
    }
  } catch (e) {
    console.error(e);
    throw new Error("Failed to create paypal order");
  }
}



// Called only from src/app/api/paypal/capture/route.ts, and only after that
// route has already independently validated the PayPal capture response
// (status, reference_id, custom_id, currency). This function does one more
// check of its own below (captured amount vs. the asset's CURRENT price) -
// belt-and-suspenders in case the price changed between order creation and
// capture, or the earlier checks were ever bypassed.
export async function recordPurchaseAction(
  assetId: string,
  paypalOrderId: string,
  userId: string,
  capturedAmountInCents: number
) {
  try {
    const [getAsset] = await db.select().from(asset).where(eq(asset.id, assetId));

    if (!getAsset) {
      return {
        success: false,
        error: "Asset not found",
      };
    }

    if (getAsset.price !== capturedAmountInCents) {
      return {
        success: false,
        error: "Captured amount does not match the asset price",
      };
    }

    const existingPurchase = await db
      .select()
      .from(purchase)
      .where(and(eq(purchase.assetId, assetId), eq(purchase.userId, userId)))
      .limit(1);

    if (existingPurchase.length > 0) {
      return {
        success: true,
        alreadyExists: true,
      };
    }

    const paymentUuid = uuidv4();
    const purchaseUuid = uuidv4();

    // Not Next.js-specific, but worth noting: both inserts happen inside a
    // single Drizzle db.transaction so we never end up with a `payment` row
    // and no matching `purchase` row (or vice versa) if something fails
    // partway through.
    await db.transaction(async (transaction) => {
      await transaction.insert(payment).values({
        id: paymentUuid,
        amount: capturedAmountInCents,
        currency: "USD",
        status: "completed",
        provider: "paypal",
        providerId: paypalOrderId,
        userId,
        createdAt: new Date(),
      });

      await transaction.insert(purchase).values({
        id: purchaseUuid,
        assetId,
        userId,
        paymentId: paymentUuid,
        price: capturedAmountInCents,
        createdAt: new Date(),
      });
    });

    // create invoice later
    // Doesn't block the purchase itself if this fails (the purchase/payment
    // rows are already committed above) - invoice generation is treated as
    // best-effort, just logged on failure rather than rolled back.
    const invoiceResult = await createInvoiceAction(purchaseUuid);

    if (!invoiceResult.success) {
      console.error("Failed to create invoice");
    }

    // The gallery detail page and the purchases dashboard both rendered
    // (potentially cached) data that just changed - invalidate both so the
    // next visit reflects the new purchase / unlocked download button.
    revalidatePath(`/gallery/${assetId}`);
    revalidatePath(`/dashboard/purchases`);
    return {
      success: true,
      purchaseId: purchaseUuid,
    };
  } catch (e) {
    return {
      success: false,
      error: "Failed to save purchase and payment info",
    };
  }
}


export async function hasUserPurchasedAssetAction(assetId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return false;
  }

  try {
    const existingPurchase = await db
      .select()
      .from(purchase)
      .where(
        and(eq(purchase.assetId, assetId), eq(purchase.userId, session.user.id))
      )
      .limit(1);

    return existingPurchase.length > 0;
  } catch (e) {
    return false;
  }
}



export async function getAllUserPurchasedAssetsAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) redirect("/login");
  try {
    const userPurchases = await db
      .select({
        purchase: purchase,
        asset: asset,
      })
      .from(purchase)
      .innerJoin(asset, eq(purchase.assetId, asset.id))
      .where(eq(purchase.userId, session.user.id))
      .orderBy(purchase.createdAt);

    return userPurchases;
    
  } catch (e) {
    console.log(e);
    return [];
  }
}
