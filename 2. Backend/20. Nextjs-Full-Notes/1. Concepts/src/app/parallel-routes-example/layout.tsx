// PARALLEL ROUTES: a folder named @slotName (here "@analytics" and "@team")
// defines a named "slot" that this layout receives as a prop, alongside the
// normal `children` slot (which maps to this folder's own page.tsx). All
// slots render simultaneously, side by side, at the SAME URL
// (/parallel-routes-example) - unlike route groups, the @ prefix does not
// create nesting or affect the path either, but unlike a route group it does
// give you an independently-rendered, independently-loading/erroring section
// of the page.
// Real-world use: a dashboard where a slow "activity feed" panel can stream in
// with its own loading.tsx while the rest of the page (and other panels)
// render immediately - each slot can have its own loading.tsx/error.tsx.
export default function ParallelRoutesLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Parallel Routes Example</h1>
      {children}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="border p-4 rounded">{analytics}</div>
        <div className="border p-4 rounded">{team}</div>
      </div>
    </div>
  );
}
