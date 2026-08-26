// `/post/create` is protected by middleware.ts (see the `protectedRoutes`
// list there) - an unauthenticated request never reaches this component at
// all, it gets redirected to /auth first. That's why, unlike profile/page.tsx
// or post/edit/[slug]/page.tsx, this Server Component doesn't re-check the
// session itself; it only renders the shell and hands off to PostForm
// (a "use client" component) which calls the createPost Server Action on
// submit, and that action performs the real (DB-backed) auth check.
import PostForm from "@/components/post/post-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CreatePostPage() {
  return (
    <main className="py-10">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold">
              Create New Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default CreatePostPage;
