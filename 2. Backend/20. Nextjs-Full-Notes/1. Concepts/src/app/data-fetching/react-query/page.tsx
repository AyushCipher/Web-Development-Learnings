// APPROACH 5 of 5 - TanStack React Query, a more feature-rich alternative to
// SWR (also client-side; also requires "use client"). It needs a
// <QueryClientProvider> somewhere above it in the tree - see
// src/providers/query-client-provider.tsx, which is mounted in the root layout.
// Prefer React Query/SWR over raw useEffect (use-effect-example/) whenever you
// need caching, deduping identical requests, background refetching, or
// optimistic updates on the client.
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Post {
  id: number;
  title: string;
  body: string;
}

interface PostsResponse {
  posts: Post[];
  total: number;
}

function ReacQueryExample() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<PostsResponse>({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("https://dummyjson.com/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts!");
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error...</h1>;

  return (
    <div>
      <h1>React Query Example</h1>
      <div className="flex flex-col gap-2">
        {data?.posts.map((post) => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReacQueryExample;
