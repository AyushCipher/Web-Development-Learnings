// Hand-written prop types for the post components. Note these are NOT
// derived from the Drizzle schema (compare `typeof posts.$inferSelect` in
// schema.ts) - they're a manually kept-in-sync subset shaped to match what
// `with: { author: true }` returns from queries.ts (see
// src/lib/db/queries.ts). If a column were renamed in schema.ts, these
// wouldn't be caught automatically.
export interface PostListProps {
  posts: Array<{
    id: number;
    title: string;
    description: string;
    slug: string;
    createdAt: Date;
    author: {
      name: string;
    };
  }>;
}

export interface PostCardProps {
  post: {
    id: number;
    title: string;
    description: string;
    slug: string;
    createdAt: Date;
    author: {
      name: string;
    };
  };
}

export interface PostContentProps {
  post: {
    id: number;
    title: string;
    description: string;
    content: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      name: string;
    };
  };
  isAuthor: Boolean;
}

export interface DeletePostButtonProps {
  postId: number;
}
