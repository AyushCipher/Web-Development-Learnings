import { useState } from 'react'
import { useBlog } from '../context/BlogContext.jsx'

export default function NewPostForm() {
  // Same story as PostCard: NewPostForm is nested under Main -> Layout,
  // but grabs `addPost` directly from context instead of receiving it
  // as a callback prop threaded through Layout and Main.
  const { addPost } = useBlog()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim() || !author.trim() || !content.trim()) return
    addPost({ title, author, content })
    setTitle('')
    setAuthor('')
    setContent('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        New post
      </h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-600"
      />
      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-600"
      />
      <textarea
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="resize-none rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-600"
      />
      <button
        type="submit"
        className="self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Publish
      </button>
    </form>
  )
}
