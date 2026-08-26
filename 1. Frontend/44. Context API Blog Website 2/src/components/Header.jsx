import ThemeToggle from './ThemeToggle.jsx'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4 transition-colors dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Context API Blog</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            BlogContext + ThemeContext, no prop drilling
          </p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
