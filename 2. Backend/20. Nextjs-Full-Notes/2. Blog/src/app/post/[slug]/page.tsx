// This is the dynamic route `/post/[slug]` - the `[slug]` folder name means
// Next.js matches any single path segment here (e.g. /post/my-first-post)
// and exposes it as `params.slug`. As an async Server Component (no
// "use client"), this file runs entirely on the server: it can call the DB
// (getPostBySlug) and better-auth directly, and only the rendered HTML/RSC
// payload is sent to the browser - the DB query code itself never ships.
import PostContent from "@/components/post/post-content";
import { auth } from "@/lib/auth";
import { getPostBySlug } from "@/lib/db/queries";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

async function PostDetailsPage({
  params,
}: {
  // In Next.js 15, `params` (and `searchParams`) on page/layout/route
  // components became a Promise rather than a plain object. This is a
  // breaking change from Next 14 and enables Next.js to start rendering
  // the parts of the page that don't depend on params before the params
  // are fully resolved. It must always be awaited before use.
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!post) {
    // notFound() throws a special Next.js error internally that tells the
    // framework "render the nearest not-found.tsx boundary instead of this
    // component". Execution stops here - code after this call in a branch
    // where post is null would never run (TypeScript still needs the
    // `post` null-check further below because it can't see notFound()'s
    // control-flow effect across the if block by itself).
    notFound();
  }

  // get author info
  // Compare the *viewer's* session user id against the post's authorId to
  // decide whether to show Edit/Delete controls. This is purely a UI
  // decision made here; the actual authorization re-check happens again
  // inside updatePost/deletePost server actions, since a client could
  // otherwise fabricate a request to those actions directly.
  const isAuthor = session?.user?.id === post.authorId;

  return (
    <main className="py-10">
      <div className="max-w-4xl mx-auto">
        <PostContent post={post} isAuthor={isAuthor} />
      </div>
    </main>
  );
}

export default PostDetailsPage;
