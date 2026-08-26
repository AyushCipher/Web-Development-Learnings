"use client";
// "use client" because this needs `usePathname`/`useRouter` (client-only
// navigation hooks, for active-link highlighting and post-logout redirect)
// and `useSession` (a live, reactive read of auth state via
// src/lib/auth-client.ts) rather than the one-shot server-side
// `auth.api.getSession()` used in Server Components/layouts elsewhere in
// this app. Rendered once in the root layout (src/app/layout.tsx) so it's
// present on every route; it hides its own markup on /login via the
// `pathName === "/login"` check below rather than being excluded via a
// Next.js route group.
import { signOut, useSession } from "@/lib/auth-client";
import { GalleryHorizontalEnd, LayoutDashboard, LogOut, Package, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ThemeToggle } from "../theme/theme-toggle";

const linkBase =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";
const linkActive = "bg-secondary text-foreground";

function Header() {
  const pathName = usePathname();
  const router = useRouter();
  const isLoginPage: boolean = pathName === "/login";

  const { data: session, isPending } = useSession();
  const user = session?.user;
  const isAdminUser = user?.role === "admin";

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  if (isLoginPage) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/85 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary shadow-sm">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden font-bold text-lg text-foreground sm:inline">
              Asset Platform
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {!isPending && user && isAdminUser ? null : (
              <Link
                href="/gallery"
                className={`${linkBase} ${
                  pathName.startsWith("/gallery") ? linkActive : ""
                }`}
              >
                <GalleryHorizontalEnd className="h-4 w-4" />
                Gallery
              </Link>
            )}

            {!isPending && user && !isAdminUser && (
              <>
                <Link
                  className={`${linkBase} ${
                    pathName.startsWith("/dashboard/assets") ? linkActive : ""
                  }`}
                  href={"/dashboard/assets"}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Assets
                </Link>
                <Link
                  className={`${linkBase} ${
                    pathName.startsWith("/dashboard/purchases")
                      ? linkActive
                      : ""
                  }`}
                  href={"/dashboard/purchases"}
                >
                  My Purchases
                </Link>
              </>
            )}

            {!isPending && user && isAdminUser && (
              <>
                <Link
                  className={`${linkBase} ${
                    pathName.startsWith("/admin/asset-approval")
                      ? linkActive
                      : ""
                  }`}
                  href={"/admin/asset-approval"}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Asset Approval
                </Link>
                <Link
                  className={`${linkBase} ${
                    pathName.startsWith("/admin/settings") ? linkActive : ""
                  }`}
                  href={"/admin/settings"}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isPending ? null : user ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
