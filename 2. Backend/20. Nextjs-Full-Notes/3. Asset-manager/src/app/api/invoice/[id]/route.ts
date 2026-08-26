// ROUTE HANDLER serving a generated invoice as an HTML document.
// Linked from `<a href={`/api/invoice/${invoiceId}`} target="_blank">` in
// src/app/dashboard/purchases/page.tsx. `id` here is the INVOICE id (not the
// asset id), created by createInvoiceAction in src/actions/invoice-actions.ts
// right after a purchase is recorded (see src/actions/payment-actions.ts ->
// recordPurchaseAction).
//
// Unlike the download route (which redirects to a file URL), this one
// returns the invoice's pre-rendered HTML (built once at purchase time by
// src/lib/invoice/invoice-html-generator.ts and stored in the DB) directly
// as the response body with an explicit `Content-Type: text/html`. There is
// no PDF generation involved - opening this URL just renders an HTML
// "document" in the browser, which the invoice template also lets the user
// print via `window.print()`.
import { getInvoiceHtmlAction } from "@/actions/invoice-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // `params` is a Promise in Next.js 15 - must be awaited.
  const { id } = await params;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // getInvoiceHtmlAction (invoice-actions.ts) re-checks that this invoice
    // belongs to the current session user (or that the caller is an admin)
    // before returning the stored HTML - the auth check above only proves
    // *someone* is logged in, not that they own this specific invoice.
    const result = await getInvoiceHtmlAction(id);

    if (!result.success || !result.html) {
      return NextResponse.redirect(
        new URL("/dashboard/purchases", request.url)
      );
    }

    // Returning `new NextResponse(html, { headers })` instead of
    // NextResponse.json(...) - this Route Handler's contract is "an HTML
    // document", not a JSON API response.
    return new NextResponse(result.html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (e) {
    return NextResponse.redirect(new URL("/dashboard/purchases", request.url));
  }
}
