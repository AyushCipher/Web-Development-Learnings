import Layout from './components/Layout.jsx'

// App itself never touches BlogContext or ThemeContext - it doesn't
// need to. It just renders Layout, and Layout's descendants pull
// whatever context data they need on their own.
export default function App() {
  return <Layout />
}
