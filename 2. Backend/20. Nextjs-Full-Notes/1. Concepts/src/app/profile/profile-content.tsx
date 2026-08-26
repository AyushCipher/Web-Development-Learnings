// CLIENT-SIDE NAVIGATION HOOKS (next/navigation, not next/router - that's the
// old Pages Router API). These only work in Client Components:
// - useRouter()      -> imperative navigation: router.push/replace/back/refresh
// - usePathname()    -> the current URL path, e.g. "/profile" (no query string)
// - useSearchParams()-> a read-only URLSearchParams for ?query=string values,
//                       e.g. visiting /profile?name=Ayush&age=20 populates it below
// Server Components read the same info differently: `params`/`searchParams`
// are passed straight in as props (see products/[slug] and metadata-example).
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

function ProfileContent() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  console.log(
    searchParams.getAll("name"),
    searchParams.has("age"),
    searchParams,
    "searchParams"
  );

  const handleNavigate = () => {
    router.push("/");
  };

  return (
    <div>
      <h1>Profile component - client</h1>
      <button onClick={handleNavigate}>Navigate to home page</button>
    </div>
  );
}

export default ProfileContent;
