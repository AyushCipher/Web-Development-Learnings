import { createContext, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
});

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();

  return(
    <Context.Provider value={{isAuthenticated, setIsAuthenticated, user, setUser}}>
      <App/>
    </Context.Provider>
  )
}

createRoot(document.getElementById('root')).render(
  <AppWrapper />
)
