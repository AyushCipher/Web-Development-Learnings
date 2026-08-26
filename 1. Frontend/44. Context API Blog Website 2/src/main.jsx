import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BlogProvider } from './context/BlogContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Both providers wrap the app ONCE, at the very top. Every component
// below this point can reach BlogContext / ThemeContext directly via
// useContext, no matter how deeply it is nested — that's the whole
// point of Context API: skip the "pass props down through every
// intermediate component" chain (prop drilling).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BlogProvider>
        <App />
      </BlogProvider>
    </ThemeProvider>
  </StrictMode>,
)
