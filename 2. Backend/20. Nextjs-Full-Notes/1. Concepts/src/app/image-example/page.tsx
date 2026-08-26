// next/image vs a plain <img>:
// - automatically serves resized/modern formats (webp/avif) per device, and
//   lazy-loads images that are off-screen, by default
// - REQUIRES width+height (or `fill`) up front so the browser can reserve
//   the right amount of space before the image loads - this is what prevents
//   layout shift (a Core Web Vital), which plain <img> doesn't give you for free
// - remote images (any domain other than files already inside /public) must
//   be allow-listed in next.config.ts via `images.remotePatterns`, otherwise
//   Next.js refuses to optimize them at request time (a security measure - it
//   stops your server being used to proxy/optimize arbitrary third-party URLs)
import Image from "next/image";

export default function ImageExample() {
  return (
    <div className="p-4 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">next/image Example</h1>

      <div>
        <h2 className="font-semibold mb-2">
          Fixed width/height (local file from /public)
        </h2>
        <Image src="/next.svg" alt="Next.js logo" width={180} height={38} priority />
        {/* `priority` marks this as above-the-fold: Next.js preloads it and skips
            lazy-loading, which you'd want for e.g. a hero image or logo that's
            visible without scrolling. Don't overuse it - only the first
            visible image(s) should have it. */}
      </div>

      <div>
        <h2 className="font-semibold mb-2">
          `fill` - stretches to a positioned parent instead of fixed dimensions
        </h2>
        <div className="relative w-48 h-48 border">
          <Image src="/globe.svg" alt="Globe" fill className="object-contain p-4" />
        </div>
        {/* `fill` requires the parent to be `position: relative` (or absolute/fixed)
            with an explicit size - the image then absolutely fills that box,
            useful for responsive cards/galleries where you don't know the
            exact pixel size ahead of time. */}
      </div>
    </div>
  );
}
