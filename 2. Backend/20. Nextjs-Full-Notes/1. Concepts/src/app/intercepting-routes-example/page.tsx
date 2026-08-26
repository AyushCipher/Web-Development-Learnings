// This is the `children` slot content for layout.tsx above - the gallery
// "feed" that stays mounted underneath the modal during a soft navigation.
import Link from "next/link";
import { photos } from "./data";

export default function InterceptingRoutesExample() {
  return (
    <div>
      <p className="mb-4 text-sm text-gray-500 max-w-prose">
        Click a photo (client-side navigation via &lt;Link&gt;) - it opens as
        a modal over this gallery, and the URL becomes
        /intercepting-routes-example/photos/[id] without this page unmounting.
        Then copy that same URL into a new tab, or refresh the modal open -
        same URL, but now photos/[id]/page.tsx renders as a full standalone
        page instead, because there's no in-app "previous route" for Next.js
        to intercept from.
      </p>
      <div className="grid grid-cols-3 gap-4 max-w-lg">
        {photos.map((photo) => (
          <Link
            key={photo.id}
            href={`/intercepting-routes-example/photos/${photo.id}`}
            className="aspect-square rounded flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: photo.color }}
          >
            {photo.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
