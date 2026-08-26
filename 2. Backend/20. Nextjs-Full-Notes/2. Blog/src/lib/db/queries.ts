// Data-access layer called directly from Server Components (src/app/page.tsx,
// src/app/post/[slug]/page.tsx). There's no API layer in between - these
// functions run server-side as part of rendering, query Postgres, and
// return plain data straight into JSX. This is one of the App Router's
// core patterns: Server Components can `await` a DB call like this instead
// of fetching a REST/GraphQL endpoint that itself queries the DB.
import { desc, eq } from "drizzle-orm";
import { db } from ".";
import { posts } from "./schema";

// get all posts
export async function getAllPosts() {
  try {
    // `with: { author: true }` uses the relational query API enabled by
    // postsRelations in schema.ts - it runs a join under the hood and
    // returns each post with a nested `author` object, which is exactly
    // the shape PostCard/PostList expect (see src/lib/types/index.ts).
    const allPosts = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      with: {
        author: true,
      },
    });

    return allPosts;
  } catch (e) {
    // Errors are swallowed and turned into an empty array/null rather than
    // thrown. This keeps the calling Server Component simple (no
    // try/catch or error boundary needed for a failed query) at the cost
    // of a DB outage looking identical to "no posts exist" / "post not
    // found" to the end user - worth knowing since it can mask real
    // failures during development.
    console.log(e);
    return [];
  }
}

// get a post by using the slug
export async function getPostBySlug(slug: string) {
  try {
    const post = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      with: {
        author: true,
      },
    });

    return post;
  } catch (e) {
    console.log(e);
    return null;
  }
}
