// Server Component - just a grid layout mapping over server-fetched posts
// (passed down from src/app/page.tsx). No client-side interactivity here.
import { PostListProps } from "@/lib/types";
import PostCard from "./post-card";

function PostList({ posts }: PostListProps) {
  return (
    <div className="grid grid-cols-1 mt-10 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default PostList;
