import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import LoggerComponent from './components/LoggerComponent'
import DataFetcher from './components/DataFetcher'
import MultiEffectComponent from './components/MultiEffectComponent'
import ResizeComponent from './components/ResizeComponent'
import TimerComponent from './components/TimerComponent'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      {/* <LoggerComponent /> */}
      {/* <TimerComponent /> */}

    {/* use the console to see the functioning of cleaner function */}

      <ResizeComponent />
      {/* <DataFetcher /> */}
      {/* <MultiEffectComponent /> */}
    </div>
  )
}

export default App
