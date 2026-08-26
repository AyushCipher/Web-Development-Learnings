import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle() {
  // Reads straight from ThemeContext, several components below the
  // provider (main.jsx). No component between the Provider and here
  // (App, Layout, Header) had to know this button exists.
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
    >
      {theme === 'light' ? 'Dark mode' : 'Light mode'}
    </button>
  )
}
