// ROUTE GROUP: a folder named in (parentheses) - here "(marketing)" - is
// completely ignored when Next.js builds the URL. It exists only to organize
// files and to let this subtree share its OWN layout without affecting the path:
//   app/(marketing)/about/page.tsx   -> served at  /about   (NOT /marketing/about)
//   app/(marketing)/contact/page.tsx -> served at  /contact (NOT /marketing/contact)
// This layout therefore wraps only /about and /contact, while the root layout
// (app/layout.tsx) still wraps everything, including this one (layouts nest).
// Common use cases: separate layouts per section (marketing vs dashboard vs auth)
// without an extra URL segment, or grouping routes for readability only.
import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>
        <nav>
          <Link href={"/"}>Home</Link>
          <Link href={"/about"}>About</Link>
          <Link href={"/contact"}>Contact</Link>{" "}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
