"use client";
// "use client" because this needs a real click handler. Imports from
// src/lib/auth-client.ts (the browser-safe Better Auth SDK), never from
// src/lib/auth.ts (server-only, has secrets).
import { signIn } from "@/lib/auth-client";
import { Chrome } from "lucide-react";
import { Button } from "../ui/button";

function LoginButton() {
  const handleLogin = async () => {
    // Kicks off Better Auth's OAuth redirect flow: the browser navigates to
    // Google, the user approves, Google redirects back through
    // src/app/api/auth/[...all]/route.ts (which exchanges the OAuth code
    // and sets the session cookie server-side), and finally the browser
    // lands on `callbackURL`.
    await signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <Button
      onClick={handleLogin}
      className="w-full py-6 text-base font-medium"
    >
      <Chrome className="mr-2 h-5 w-5" />
      <span>Sign in with Google</span>
    </Button>
  );
}

export default LoginButton;
