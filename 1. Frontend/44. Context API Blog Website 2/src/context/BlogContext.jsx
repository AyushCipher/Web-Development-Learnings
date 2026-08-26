import { createContext, useContext, useMemo, useState } from 'react'

// BlogContext holds all the blog's shared state: posts, the currently
// selected author filter, and the functions that mutate them. Without
// Context, App would have to own this state and pass `posts`,
// `addPost`, `deletePost`, `selectedAuthor`, `setSelectedAuthor` down
// through Layout -> Sidebar/Main -> PostList -> PostCard as props,
// even though Layout itself never uses them. That's prop drilling.
// With Context, only the Provider sits at the top, and every consumer
// below - no matter how deep - reads exactly what it needs directly.
const BlogContext = createContext(null)

const initialPosts = [
  {
    id: 1,
    title: 'Why React Context Beats Prop Drilling',
    author: 'Ayush Verma',
    date: '2026-08-20',
    content:
      'Passing props through five components just to reach the sixth is a maintenance trap. Context lets any descendant subscribe to shared state directly, keeping intermediate components free of data they never use.',
  },
  {
    id: 2,
    title: 'Splitting State Into Multiple Contexts',
    author: 'Ayush Verma',
    date: '2026-08-22',
    content:
      'One giant context that holds everything forces every consumer to re-render on every change. Separate contexts (like BlogContext and ThemeContext here) let components subscribe only to the slice of state they actually care about.',
  },
  {
    id: 3,
    title: 'useContext in Practice',
    author: 'Jane Doe',
    date: '2026-08-24',
    content:
      'useContext(SomeContext) is just a hook that reads whatever value the nearest matching Provider above it supplied. No prop chain, no "context passing" boilerplate in between - just a direct subscription.',
  },
]

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState(initialPosts)
  const [selectedAuthor, setSelectedAuthor] = useState('All')

  function addPost({ title, author, content }) {
    const newPost = {
      id: Date.now(),
      title,
      author,
      content,
      date: new Date().toISOString().slice(0, 10),
    }
    setPosts((prev) => [newPost, ...prev])
  }

  function deletePost(id) {
    setPosts((prev) => prev.filter((post) => post.id !== id))
  }

  // Derived list: Sidebar sets `selectedAuthor` and PostList reads the
  // resulting `filteredPosts` - both pull straight from this context,
  // with no shared parent component wiring the two together via props.
  const filteredPosts = useMemo(
    () =>
      selectedAuthor === 'All'
        ? posts
        : posts.filter((post) => post.author === selectedAuthor),
    [posts, selectedAuthor],
  )

  const authors = useMemo(
    () => ['All', ...new Set(posts.map((post) => post.author))],
    [posts],
  )

  const value = {
    posts,
    filteredPosts,
    authors,
    selectedAuthor,
    setSelectedAuthor,
    addPost,
    deletePost,
  }

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>
}

// Custom hook wrapping useContext - every component that needs blog
// data calls useBlog() instead of receiving it as props.
export function useBlog() {
  const ctx = useContext(BlogContext)
  if (!ctx) throw new Error('useBlog must be used within a BlogProvider')
  return ctx
}
