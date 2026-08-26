// SERVER-SIDE NAVIGATION FUNCTIONS from "next/navigation" - NOT the same
// module as the client hooks (useRouter/usePathname) used in profile/page.tsx.
// These can be called directly inside a Server Component, Server Action, or
// Route Handler while the page is rendering, before any HTML is sent:
//
// - redirect(path)  -> throws internally to stop rendering and sends the
//   browser a redirect response. Use it for "this URL should now live
//   somewhere else" (e.g. after a successful form submission/login).
// - notFound()      -> throws internally and renders the nearest
//   not-found.tsx (see app/not-found.tsx). Use it for "this specific resource
//   doesn't exist" (e.g. a product id that isn't in the database).
//
// Try:
//   /redirect-example              -> notFound() -> renders app/not-found.tsx
//   /redirect-example?target=old   -> redirect() -> sent straight to /products
//   /redirect-example?target=new   -> renders normally
import { redirect, notFound } from "next/navigation";

export default async function RedirectExample({
  searchParams,
}: {
  searchParams: Promise<{ target?: string }>;
}) {
  const { target } = await searchParams;

  if (target === "old") {
    redirect("/products");
  }

  if (!target) {
    notFound();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Redirect / notFound example</h1>
      <p>target = {target}</p>
    </div>
  );
}
