// INCREMENTAL STATIC REGENERATION (ISR) via ROUTE SEGMENT CONFIG.
// Exporting `revalidate` from a page/layout tells Next.js to treat this route
// like a static page that's allowed to go stale for N seconds. The FIRST
// request after that window serves the (now-stale) cached HTML immediately,
// but ALSO triggers a re-render in the background; once that finishes, the
// cache is updated for the next visitor. No visitor ever waits on a rebuild.
//
// This is time-based revalidation - compare it to the ON-DEMAND revalidation
// used in server-actions-example/actions.ts, where `revalidatePath()` busts
// the cache immediately, right when a mutation happens, instead of waiting
// for a timer. Use `revalidate` for content that changes on a schedule you
// can predict (a homepage of articles); use `revalidatePath`/`revalidateTag`
// for content that changes because of a specific user action (a new post).
export const revalidate = 10; // seconds

async function getTimestamp() {
  // no real fetch here - the point is to observe how long this exact
  // timestamp stays the same across repeated page loads (~10s at a time)
  return new Date().toISOString();
}

export default async function IsrExample() {
  const timestamp = await getTimestamp();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">ISR Example</h1>
      <p>Rendered at: {timestamp}</p>
      <p className="text-sm text-gray-500">
        Refresh repeatedly - this value only changes about once every 10
        seconds, no matter how many times you reload.
      </p>
    </div>
  );
}
