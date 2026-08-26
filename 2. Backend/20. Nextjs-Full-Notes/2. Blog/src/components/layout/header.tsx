// "use client" is required for the useSession() hook (client-side reactive
// auth state via better-auth's React SDK) and useRouter(). This is a
// deliberate contrast with pages like profile/page.tsx that check auth via
// auth.api.getSession() (server-verified, one-time-per-request): the
// Header instead needs to reactively show/hide the login button the
// instant sign-in/sign-out happens client-side, without a full page
// navigation - that's only possible with a client-side session hook, not a
// server check.
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import UserMenu from "../auth/user-menu";
import ThemeToggle from "../theme/theme-toggle";

function Header() {
  // isPending covers the brief window before better-auth has resolved
  // whether a session exists client-side - used below to avoid flashing a
  // "Login" button for an already-authenticated user.
  const { data: session, isPending } = useSession();
  const router = useRouter();

  console.log(session, "session");

  const navItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Create",
      href: "/post/create",
    },
  ];

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            Next.js 15 Blog
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((navItem) => (
              <Link
                key={navItem.href}
                href={navItem.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary"
                )}
              >
                {navItem.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            {/* Keep an placeholder for search */}
          </div>
          {/* placeholder for theme toggle */}
          <ThemeToggle />
          <div className="flex items-center gap-2">
            {isPending ? null : session?.user ? (
              <UserMenu user={session?.user} />
            ) : (
              <Button
                className="cursor-pointer"
                onClick={() => router.push("/auth")}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
