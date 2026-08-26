import { useBlog } from '../context/BlogContext.jsx'
import PostCard from './PostCard.jsx'

export default function PostList() {
  // PostList -> Main -> Layout -> (BlogProvider in main.jsx): four
  // levels deep, and still a one-line hook call reaches the posts.
  // Compare that to prop drilling, where `filteredPosts` would need
  // an explicit prop on Layout AND Main just to reach this component.
  const { filteredPosts } = useBlog()

  if (filteredPosts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
        No posts from this author yet.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {filteredPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </ul>
  )
}
