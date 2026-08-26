// Served at /dashboard/analytics - still wrapped by dashboard/layout.tsx,
// so the sidebar in that layout persists (doesn't remount) when you navigate
// here from /dashboard.
function AdminDashboardAnalytics() {
  return <h1>AdminDashboardAnalytics</h1>;
}

export default AdminDashboardAnalytics;
