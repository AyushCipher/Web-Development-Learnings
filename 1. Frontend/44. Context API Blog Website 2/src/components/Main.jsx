import NewPostForm from './NewPostForm.jsx'
import PostList from './PostList.jsx'

// Like Layout, Main is just a composer - it renders NewPostForm and
// PostList without passing them any data. Each of those two figures
// out what it needs by calling useBlog() itself.
export default function Main() {
  return (
    <main className="flex flex-1 flex-col gap-6">
      <NewPostForm />
      <PostList />
    </main>
  )
}
