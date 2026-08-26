import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'

// The store is the single source of truth for the app's global state.
// `configureStore` sets it up with good defaults (Redux DevTools support,
// the Immer-powered updates used inside slices, and useful middleware for
// catching accidental mutations/non-serializable values in development).
//
// Every slice reducer gets registered under a key here. That key ("counter")
// becomes the path to its state in the store, e.g. state.counter.value -
// this is how useSelector in Counter.jsx knows where to read from.
export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

// Compare this to useReducer (see "34. ReactConcept 1 - HOOKS/9. useReducer
// Hook -Counter App"): useReducer's [state, dispatch] pair lives inside a
// single component and disappears when that component unmounts - only that
// component (and whatever you manually prop-drill it to) can read or change
// it. This `store`, by contrast, is created once, completely outside the
// React component tree, and is made available to EVERY component in the
// app via the <Provider> in main.jsx. That's the core trade-off: useReducer
// is local component state with reducer-style updates; Redux is shared,
// app-wide state with reducer-style updates.
