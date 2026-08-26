// default.tsx is the fallback Next.js renders for a slot when navigating to a
// sub-URL that this slot has no matching page for (e.g. if @team had a
// /parallel-routes-example/settings sub-route but @analytics didn't - without
// a default.tsx, Next.js would 404 the WHOLE page instead of just leaving this
// slot showing its last known content). Returning null just hides the slot.
export default function AnalyticsDefault() {
  return null;
}
