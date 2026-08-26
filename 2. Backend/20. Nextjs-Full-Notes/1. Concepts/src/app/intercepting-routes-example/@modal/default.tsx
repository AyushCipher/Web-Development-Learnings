// Required alongside a parallel route slot (see parallel-routes-example/ for
// the same pattern): without it, navigating to any URL that ISN'T
// intercepted by (.)photos/[id] below (e.g. the gallery itself, at
// /intercepting-routes-example) would 404 the whole page, because Next.js
// would have no content to render into the `modal` slot at that URL.
// Returning null just means "no modal right now".
export default function ModalDefault() {
  return null;
}
