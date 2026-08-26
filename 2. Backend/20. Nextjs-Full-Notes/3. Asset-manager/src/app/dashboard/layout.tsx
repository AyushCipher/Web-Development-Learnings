// NESTED LAYOUT for everything under /dashboard/* (assets, purchases, ...).
// A layout.tsx wraps every page in its route segment and persists across
// client-side navigations between sibling pages (only `children` swaps) -
// but as an async Server Component, it still re-runs this session check on
// the server for every request/navigation into the segment, so it can't be
// bypassed by navigating straight to a child route.
//
// This is this app's auth-gating pattern in miniature: there's no
// middleware.ts, so route protection is layered on per-segment via layouts
// like this one (for whole sections) and per-function checks inside Server
// Actions (for individual mutations - see src/actions/admin-actions.ts).
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  // This dashboard is the buyer/creator experience. Admins are redirected
  // to their own separate area instead - the two roles never share this
  // layout's pages.
  if (session && session.user.role === "admin")
    redirect("/admin/asset-approval");

  return <main className="flex-1 p-4 lg:p-6">{children}</main>;
}
