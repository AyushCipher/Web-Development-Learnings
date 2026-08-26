// Why this page is split into page.tsx + profile-content.tsx:
// useSearchParams() opts a component out of static rendering, because its
// value can only be known once the browser's actual URL is available - Next.js
// requires it to be wrapped in <Suspense> so that during static generation
// (or the initial server render) the rest of the page/shell can still be
// produced without blocking on it. Skipping the Suspense boundary is a build
// error: "useSearchParams() should be wrapped in a suspense boundary" - this
// project failed `next build` on this exact route before the fix.
// The fallback below renders briefly (usually invisible) until the client
// hydrates and reads the real search params.
import { Suspense } from "react";
import ProfileContent from "./profile-content";

export default function Profile() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
