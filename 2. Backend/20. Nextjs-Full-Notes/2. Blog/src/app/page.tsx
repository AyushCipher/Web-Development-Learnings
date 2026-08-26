// `src/app/page.tsx` is the special filename that maps to the "/" route
// (the file's location in the app/ tree IS its URL, folders only add
// segments - `page.tsx` itself never appears in the URL).
import PostList from "@/components/post/post-list";
import { getAllPosts } from "@/lib/db/queries";
import { Metadata } from "next";

// Page-level metadata export overrides the root layout's metadata for just
// this route (see the note in src/app/layout.tsx about how this feeds
// <head>).
export const metadata: Metadata = {
  title: "Next.js 15 Blog - DevInsights",
  description: "Explore insightful articles on web development, React, Next.js, TypeScript, backend engineering, AI, and modern software development. Stay updated with the latest trends, tutorials, and best practices.",
};

// This is a Server Component (default for everything under app/ unless
// marked "use client"), and it's declared `async` - Next.js lets page
// components be async functions so they can `await` data directly in the
// component body, no useEffect/loading-state dance needed. The DB query
// runs on the server during rendering; the browser only ever receives the
// resulting HTML/RSC payload, never the query itself.
export default async function Home() {
  const posts = await getAllPosts();

  return (
    <main className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2">Welcome to the Blog</h1>
        {posts.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-medium">No posts yet</h2>
          </div>
        ) : (
          <PostList posts={posts} />
        )}
      </div>
    </main>
  );
}
