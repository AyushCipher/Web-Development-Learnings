// The FULL, standalone version of a photo - what renders on a hard load
// (refresh, typed URL, external link, or `next build` prerendering) at
// /intercepting-routes-example/photos/[id], as opposed to the intercepted
// modal at ../../@modal/(.)photos/[id]/page.tsx, which only renders on a
// soft (in-app) navigation from the gallery.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhoto } from "../../data";

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = getPhoto(id);

  if (!photo) {
    notFound();
  }

  return (
    <div>
      <Link href="/intercepting-routes-example" className="underline">
        &larr; Back to gallery
      </Link>
      <div
        className="mt-4 aspect-video max-w-lg rounded flex items-center justify-center text-white text-2xl font-bold"
        style={{ backgroundColor: photo.color }}
      >
        {photo.title} (full page)
      </div>
      <p className="mt-2 text-sm text-gray-500">
        You're seeing the full page, not the modal - this route was reached
        without an intercepted client-side navigation.
      </p>
    </div>
  );
}
