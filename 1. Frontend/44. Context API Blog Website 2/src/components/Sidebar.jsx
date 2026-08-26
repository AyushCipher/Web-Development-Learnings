import { useBlog } from '../context/BlogContext.jsx'

export default function Sidebar() {
  // Sidebar is a sibling of Main, three levels below the BlogProvider
  // (main.jsx -> Layout -> Sidebar). It reads `authors`/`selectedAuthor`
  // and calls `setSelectedAuthor` directly from context. PostList (a
  // completely different branch of the tree, under Main) reacts to
  // that same state - the two never talk to each other or to a shared
  // parent's props, only to the context they both subscribe to.
  const { authors, selectedAuthor, setSelectedAuthor, posts } = useBlog()

  return (
    <aside className="w-full shrink-0 rounded-lg border border-gray-200 bg-white p-4 transition-colors md:w-56 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Filter by author
      </h2>
      <ul className="flex flex-col gap-1">
        {authors.map((author) => (
          <li key={author}>
            <button
              type="button"
              onClick={() => setSelectedAuthor(author)}
              className={`w-full rounded-md px-3 py-1.5 text-left text-sm ${
                selectedAuthor === author
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {author}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        {posts.length} total post{posts.length === 1 ? '' : 's'}
      </p>
    </aside>
  )
}
