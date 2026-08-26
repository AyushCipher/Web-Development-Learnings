import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { store } from './app/store.js'

// <Provider store={store}> makes the Redux store available to every
// component in the tree below it via React context, so any component can
// use useSelector/useDispatch (like Counter.jsx does) without props being
// passed down manually from here.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
