// "use server" at the top of a file marks EVERY exported function here as
// a Server Action. Next.js compiles each one into its own callable RPC
// endpoint: when a Client Component calls createPost(formData), the
// function body never ships to the browser - instead the browser sends a
// POST request carrying the serialized arguments, this code runs on the
// server, and the return value is serialized back. This is how a
// "use client" form (see post-form.tsx) can talk directly to the database
// without a hand-written API route.
//
// Because these run on the server, it's safe to import server-only modules
// like the DB client and better-auth's server instance directly - none of
// this code or its imports (connection strings, secrets) is bundled for
// the browser.
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function createPost(formData: FormData) {
  try {
    // get the current user
    // headers() reads the *incoming* request's headers (Server Actions run
    // in a request context just like Route Handlers do). We need it here
    // because a Server Action has no access to the browser's cookies
    // object directly - forwarding the raw headers lets better-auth pull
    // the session cookie out and verify it against the database. This is
    // the "real" auth check that middleware.ts intentionally skips.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session?.user) {
      return {
        success: false,
        message: "You must be logged in to create a post",
      };
    }


    // Server Actions receive a real FormData object (not a plain JS
    // object) when called with `formData.get()` here - FormData.get()
    // always returns `string | File | null`, hence the `as string` casts.
    // In this app the caller (post-form.tsx) actually builds this FormData
    // manually from already-validated (zod) values before invoking the
    // action, rather than passing a <form action={createPost}> directly -
    // but the action still has to defend its own inputs since it's a
    // public server endpoint that could be called from anywhere.
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;

    // homework -> implement a extra validation check

    // create the slug from post title
    const slug = slugify(title);

    // check if the slug already exists
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    });

    if (existingPost) {
      return {
        success: false,
        message:
          "A post with the same title already exists! Please try with a diff one",
      };
    }

    const [newPost] = await db
      .insert(posts)
      .values({
        title,
        description,
        content,
        slug,
        authorId: session.user.id,
      })
      .returning();

    // revalidate the homepage to get the latest posts
    // revalidatePath() purges the Next.js cache for these specific paths so
    // the *next* request to them re-runs the Server Component data fetch
    // (getAllPosts / getPostBySlug) instead of serving stale cached HTML.
    // Without this, the newly created post wouldn't show up on "/" or
    // "/profile" until the cache expired on its own. We revalidate every
    // path whose rendered output could now be stale: "/" (post list),
    // "/post/<slug>" (the post's own detail page, which didn't exist
    // before this request), and "/profile" (the author's own post list).
    revalidatePath("/");
    revalidatePath(`/post/${slug}`);
    revalidatePath("/profile");

    return {
      success: true,
      message: "Post created successfully",
      slug,
    };
  } catch (e) {
    console.log(e, "failed to add");

    return {
      success: false,
      message: "Failed to create new post",
    };
  }
}



// Note: because this Server Action is compiled into a public POST endpoint,
// arguments like `postId` here are not implicitly trustworthy just because
// they came from "our" client code - that's why the ownership check below
// (post?.authorId !== session.user.id) re-verifies against the database on
// every call rather than trusting the UI to only ever show the edit button
// to the right user.
export async function updatePost(postId: number, formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        message: "You must logged in to edit a post!",
      };
    }

    // get form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;

    // homework -> implement a extra validation check

    const slug = slugify(title);
    const existingPost = await db.query.posts.findFirst({
      where: and(eq(posts.slug, slug), ne(posts.id, postId)),
    });

    if (existingPost) {
      return {
        success: false,
        message: "A post with this title already exists",
      };
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (post?.authorId !== session.user.id) {
      return {
        success: false,
        message: "You can only edit your own posts!",
      };
    }

    await db
      .update(posts)
      .set({
        title,
        description,
        content,
        slug,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    // Same reasoning as createPost: bust the cache for every path whose
    // content just changed. Note the slug can change here (it's derived
    // from the title), so we revalidate the *new* slug's path - the old
    // slug's cached page is simply left to expire/404 naturally since
    // nothing links to it anymore.
    revalidatePath("/");
    revalidatePath(`/post/${slug}`);
    revalidatePath("/profile");

    return {
      success: true,
      message: "Post edited succesfully",
      slug,
    };
  } catch (e) {
    console.log(e, "failed to edit");

    return {
      success: false,
      message: "Failed to create new post",
    };
  }
}



export async function deletePost(postId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        message: "You must logged in to delete post",
      };
    }

    const postToDelete = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!postToDelete) {
      return {
        success: false,
        message: "Post not found",
      };
    }
    if (postToDelete?.authorId !== session.user.id) {
      return {
        success: false,
        message: "You can only delete your own posts!",
      };
    }

    await db.delete(posts).where(eq(posts.id, postId));

    // No revalidatePath for `/post/[slug]` here - the post is gone, so its
    // detail page will now correctly 404 (via notFound() in that page)
    // on the next visit without needing an explicit cache bust; we only
    // need to refresh the listing pages that show/hide it.
    revalidatePath("/");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (e) {
    console.log(e, "failed to edit");

    return {
      success: false,
      message: "Failed to create new post",
    };
  }
}
