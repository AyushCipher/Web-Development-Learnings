// Next.js special file convention: a `not-found.tsx` at src/app/ is
// automatically rendered whenever `notFound()` is called from anywhere in
// the app (see src/app/post/[slug]/page.tsx), or whenever a URL doesn't
// match any route at all. No manual wiring/import needed - Next.js finds
// it by filename alone. You can also nest a not-found.tsx inside a route
// segment folder to scope it to just that segment's subtree.
import { Button } from "@/components/ui/button";
import Link from "next/link";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found!</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking doesn't exist or has been moved
      </p>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}

export default NotFound;
