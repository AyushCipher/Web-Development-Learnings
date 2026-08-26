import LoginButton from "@/components/auth/login-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Package } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

// Server Component that only decides WHETHER to show the login screen
// (redirecting away if already authenticated); the actual interactive
// sign-in click handler lives in the "use client" LoginButton component -
// a typical split where the Server Component owns data/redirect logic and
// a small Client Component owns the one bit of real interactivity.
async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/");

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-primary">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome Back
          </CardTitle>
          <CardDescription>Sign in to continue managing assets</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginButton />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;
