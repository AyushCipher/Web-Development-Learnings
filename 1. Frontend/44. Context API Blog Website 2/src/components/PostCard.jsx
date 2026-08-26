import { useBlog } from '../context/BlogContext.jsx'

// `post` is a plain prop here - that's normal React (PostList maps
// over an array and hands each item to its own card), not prop
// drilling. `deletePost`, on the other hand, comes straight from
// BlogContext even though this is the deepest component in the tree
// (main.jsx -> Layout -> Main -> PostList -> PostCard). No component
// in that chain had to know a delete button exists.
export default function PostCard({ post }) {
  const { deletePost } = useBlog()

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {post.author} &middot; {post.date}
          </p>
        </div>
        <button
          type="button"
          onClick={() => deletePost(post.id)}
          className="shrink-0 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          Delete
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
        {post.content}
      </p>
    </li>
  )
}
