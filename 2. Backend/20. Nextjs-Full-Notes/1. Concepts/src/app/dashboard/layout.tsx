// NESTED LAYOUT: placing a layout.tsx inside app/dashboard/ makes it apply to
// /dashboard AND every route below it (/dashboard/analytics, etc.), while the
// root layout still wraps this one too - layouts compose top-down:
//   RootLayout > CommonAdminDashboardLayout > page.tsx
// Because a layout persists across navigations within its scope, the <aside>
// sidebar below is NOT re-rendered when moving between /dashboard and
// /dashboard/analytics - only {children} swaps out. That's what makes layouts
// cheap for shared UI like sidebars/headers (no remount, no flicker, state like
// scroll position is preserved).

import Link from "next/link";

export default function CommonAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex">
        <aside className="w-64 p-4 border-r">
          <h2>Dashboard</h2>
          <nav>
            <ul>
              <li>
                <Link href={"/dashboard"}>Dashboard Home</Link>
              </li>
              <li>
                <Link href={"/dashboard/analytics"}>Dashboard Analytics</Link>
              </li>
            </ul>
          </nav>
        </aside>
        <div className="flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}
