import { createContext, useContext, useEffect, useState } from 'react'

// A second, completely independent context. It has nothing to do with
// blog data - it only proves that multiple contexts can live side by
// side, each provided and consumed on its own, without tangling into
// one giant "god context".
const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  // Keep a `dark` class on <html> in sync with theme state, so Tailwind's
  // `dark:` utility classes anywhere in the tree respond automatically.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook so consumers never import ThemeContext or call useContext
// directly - they just call useTheme() from anywhere in the tree.
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
