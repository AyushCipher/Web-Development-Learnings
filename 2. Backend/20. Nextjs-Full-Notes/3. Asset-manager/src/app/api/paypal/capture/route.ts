// ROUTE HANDLER - the final leg of the PURCHASE flow, and the security-
// critical piece of the whole app.
//
// Full story: src/app/gallery/[id]/page.tsx defines an INLINE Server Action
// (`handlePurchase`) that calls `createPaypalOrderAction`
// (src/actions/payment-actions.ts) to open a PayPal order, then redirects
// the browser to PayPal's hosted checkout. PayPal's `application_context`
// was configured with `return_url: /api/paypal/capture?assetId=...` - so
// once the buyer approves the payment on PayPal's site, PayPal redirects
// the browser BACK here with `token` (the PayPal order id) and `PayerID` as
// query params. This Route Handler is that landing page: it captures
// (actually charges) the order server-to-server against PayPal's API, then
// independently re-verifies the amount/asset/user before trusting it and
// persisting the purchase via `recordPurchaseAction`.
//
// Because anyone could hit this URL with arbitrary/forged query params, we
// never trust the query string alone - the `token` is used to ask PayPal
// directly what was actually captured, and that response is what gets
// validated below.
import { recordPurchaseAction } from "@/actions/payment-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type PaypalCapture = {
  status?: string;
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    payments?: {
      captures?: Array<{
        amount?: {
          currency_code?: string;
          value?: string;
        };
      }>;
    };
  }>;
};


export async function GET(request: NextRequest) {
  // `request.nextUrl` is a Next.js-enhanced URL object (extends the
  // standard `URL`) attached to NextRequest - `.searchParams` reads the
  // query string PayPal appended to our `return_url`, e.g. ?token=...&
  // PayerID=...&assetId=... (assetId was our own addition when we built
  // the return_url in createPaypalOrderAction).
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const assetId = searchParams.get("assetId");
  const payerId = searchParams.get("PayerID");

  // missing -> redirect to gallery page with missing params ? missing-params
  if (!token || !payerId || !assetId) {
    return NextResponse.redirect(
      new URL(`/gallery?error=missing-params`, request.url)
    );
  }

  try {
    // Must still be logged in as the same app user who initiated the
    // checkout - the captured order's `custom_id` (below) is cross-checked
    // against this session's user id, not just whatever the query string says.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Server-to-server call to PayPal to actually CAPTURE (charge) the
    // order. Using Basic auth built from our server-only client id/secret -
    // this can only happen here, never in the browser.
    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${token}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    const data = (await response.json()) as PaypalCapture;

    if (!response.ok) {
      return NextResponse.redirect(
        new URL(`/gallery/${assetId}?error=payment_failed`, request.url)
      );
    }

    const purchaseUnit = data.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const capturedValue = Number(capture?.amount?.value);
    const capturedAmountInCents = Math.round(capturedValue * 100);
    // custom_id was set to `${userId}|${assetId}` when the order was
    // created (see createPaypalOrderAction) specifically so it could be
    // re-derived and compared here - this is what stops one user's approved
    // payment from being recorded against a different user or a different
    // asset than what was actually paid for.
    const expectedCustomId = `${session.user.id}|${assetId}`;

    // Defense-in-depth verification before this payment is trusted: PayPal
    // says it's COMPLETED, the order matches this exact asset + this exact
    // session user (via custom_id), currency is what we expect, and the
    // captured amount is a sane positive number. `recordPurchaseAction`
    // below does one more check (captured amount vs. current asset price)
    // before writing to the DB.
    const isValidCapture =
      data.status === "COMPLETED" &&
      purchaseUnit?.reference_id === assetId &&
      purchaseUnit?.custom_id === expectedCustomId &&
      capture?.amount?.currency_code === "USD" &&
      Number.isFinite(capturedAmountInCents) &&
      capturedAmountInCents > 0;

    if (isValidCapture) {
      // store the purchase info in our DB

      const saveToDB = await recordPurchaseAction(
        assetId,
        token,
        session.user.id,
        capturedAmountInCents
      );

      if (!saveToDB.success) {
        return NextResponse.redirect(
          new URL(`/gallery/${assetId}?error=recording_failed`, request.url)
        );
      }

      // Back to the gallery detail page with ?success=true - read there via
      // `searchParams` in src/app/gallery/[id]/page.tsx to show the
      // "Purchase successful" banner and flip the CTA to a Download button.
      return NextResponse.redirect(
        new URL(`/gallery/${assetId}?success=true`, request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/gallery/${assetId}?error=payment_failed`, request.url)
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(
      new URL(`/gallery/${assetId}?error=server_error`, request.url)
    );
  }
}
