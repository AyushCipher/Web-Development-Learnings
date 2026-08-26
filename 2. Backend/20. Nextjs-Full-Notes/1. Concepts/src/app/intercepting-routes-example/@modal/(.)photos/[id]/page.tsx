// INTERCEPTING ROUTE: the `(.)` marker means "intercept a route matched at
// THIS SAME LEVEL" - this @modal folder sits directly inside
// app/intercepting-routes-example/, the same level as the `photos/` folder,
// so `(.)photos` refers to that sibling `photos/[id]` route.
//
// When a user clicks a <Link> from within layout.tsx's `children` slot (a
// "soft", client-side navigation), Next.js renders THIS file into the
// `modal` slot instead of actually navigating - the gallery underneath
// (children) never unmounts, only the URL and the modal slot update. A hard
// navigation (refresh, typed URL, opening in a new tab) has no client-side
// router history to intercept from, so it falls through to the real,
// non-intercepted route: ../../photos/[id]/page.tsx.
//
// Other markers, for reference (all relative to where the intercepting
// folder itself lives, not the segment it matches):
//   (.)      same level          (..)     one level up
//   (..)(..) two levels up       (...)    from the app/ root, any depth
//
// Client Component pages still receive `params` as a Promise in Next 15 -
// since a Client Component can't be `async`, `use()` (also used in
// data-fetching/use-hook/) is how you unwrap it here instead of `await`.
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { getPhoto } from "../../../data";

export default function InterceptedPhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const photo = getPhoto(id);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      // router.back() closes the modal by returning to the previous
      // history entry (the gallery) - preferred over router.push(gallery)
      // because it doesn't add a new, redundant history entry.
      onClick={() => router.back()}
    >
      <div
        className="rounded-lg p-8 max-w-md w-full aspect-video text-white text-2xl font-bold flex items-center justify-center"
        style={{ backgroundColor: photo.color }}
        onClick={(e) => e.stopPropagation()}
      >
        {photo.title} (modal)
      </div>
    </div>
  );
}
