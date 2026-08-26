// ROUTE HANDLERS (app/api/.../route.ts)
// A `route.ts` file inside app/ turns that segment into an API endpoint instead
// of a page - it's the App Router replacement for pages/api/* in the old Pages
// Router. This one lives at app/api/hello/route.ts, so it's reachable at
// GET/POST http://localhost:3000/api/hello.
//
// You export one async function per HTTP method you want to support: GET,
// POST, PUT, PATCH, DELETE, HEAD, OPTIONS. Any method NOT exported returns a
// 405 automatically. These run only on the server (like Server Components) so
// it's safe to use secrets/DB clients here - see the Blog/Asset-manager
// projects' `api/auth/[...all]/route.ts` for a real-world example (better-auth
// mounts its whole API through a single catch-all route handler).
import { NextRequest, NextResponse } from "next/server";

// GET /api/hello
export async function GET(request: NextRequest) {
  // NextRequest extends the standard Request with convenience helpers, e.g.
  // `request.nextUrl.searchParams` to read ?query=params without parsing the URL yourself.
  const name = request.nextUrl.searchParams.get("name") ?? "world";

  return NextResponse.json({ message: `Hello, ${name}!` });
}

// POST /api/hello
export async function POST(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json(
    { message: `Received: ${JSON.stringify(body)}` },
    { status: 201 }
  );
}
