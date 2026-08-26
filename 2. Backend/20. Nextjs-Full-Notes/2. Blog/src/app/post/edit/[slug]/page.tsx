// `/post/edit/[slug]` is also listed in middleware.ts's protectedRoutes, so
// a logged-out request is already redirected to /auth before this
// component ever runs. Even so, this page does its own defense-in-depth
// checks below (session existence, then post ownership) - middleware only
// checked "is there *a* session cookie", not "does this specific user own
// this specific post", which requires the DB-backed data this page already
// has to load anyway.
import Container from "@/components/layout/container";
import PostForm from "@/components/post/post-form";
import { auth } from "@/lib/auth";
import { getPostBySlug } from "@/lib/db/queries";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    // redirect() (like notFound()) throws internally and immediately stops
    // rendering - it works in Server Components because Next.js can catch
    // it during the server render and respond with an HTTP redirect before
    // any HTML is sent, rather than needing client-side JS to navigate.
    redirect("/");
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Ownership check: only the original author may edit their own post.
  // Anyone else who guesses/visits this URL is bounced to home.
  if (post.authorId !== session.user.id) {
    redirect("/");
  }

  return (
    <Container>
      <h1 className="max-w-2xl font-bold text-4xl mb-6 mt-10">Edit Post</h1>
      <PostForm
        isEditing={true}
        post={{
          id: post.id,
          title: post.title,
          description: post.description,
          content: post.content,
          slug: post.slug,
        }}
      />
    </Container>
  );
}

export default EditPostPage;
