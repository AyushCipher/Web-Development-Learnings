// app/not-found.tsx is a special file Next.js automatically renders when:
// 1) a URL doesn't match any route in the app, OR
// 2) the `notFound()` function (from next/navigation) is called inside a
//    Server Component/action anywhere in the tree - see redirect-example/page.tsx.
// It's nested like a layout: you can also add a not-found.tsx inside a specific
// route folder to override this one for just that segment.
"use client";

// "use client" is required here only because this file uses the useRouter HOOK
// to navigate on a button click. If you just needed a <Link>, this could stay
// a Server Component.
import { useRouter } from "next/navigation";

function NotFoundPage() {
  const router = useRouter();
  return (
    <div>
      <h1>The page you are looking for does not exists</h1>
      <button
        onClick={() => router.push("/")}
        className="bg-black p-5 text-white"
      >
        Go to Homepage
      </button>
    </div>
  );
}

export default NotFoundPage;
