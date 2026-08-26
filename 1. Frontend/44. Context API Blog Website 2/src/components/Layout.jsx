import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import Main from './Main.jsx'

// Layout is a pure "shell" component: it only arranges Header,
// Sidebar and Main on the page. It receives no props and forwards
// none - notice it never mentions "posts", "theme", "addPost", etc.
// Without Context, this component would be forced to hold (or at
// least relay) all of that state just so its grandchildren could use
// it. That relaying-without-using is exactly what prop drilling is.
export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-900 dark:text-gray-100">
      <Header />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:flex-row">
        <Sidebar />
        <Main />
      </div>
    </div>
  )
}
