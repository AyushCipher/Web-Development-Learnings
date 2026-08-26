import { createSlice } from '@reduxjs/toolkit'

// A "slice" is one self-contained piece of the app's global Redux state,
// bundling together its initial state + the reducer logic + the actions
// that can change it. A real app has many slices (counterSlice, userSlice,
// cartSlice, ...) that all get combined into a single store (see store.js).
const initialState = {
  value: 0,
}

const counterSlice = createSlice({
  name: 'counter', // used as a prefix for generated action types, e.g. "counter/increment"
  initialState,
  // Each key here is a "case reducer": a small function that describes how
  // state changes for one specific action. Redux Toolkit uses Immer under
  // the hood, so it's safe to write code that looks like it's "mutating"
  // state directly (state.value += 1) - Immer turns that into a proper
  // immutable update behind the scenes without us writing {...state} spreads.
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    // Reducers can accept a payload - extra data sent along with the action.
    // Here `action.payload` is the custom amount the user typed in.
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
    reset: (state) => {
      state.value = initialState.value
    },
  },
})

// createSlice AUTO-GENERATES an action creator for every reducer we defined
// above. We never hand-write `{ type: 'counter/increment' }` action objects -
// calling `increment()` builds that object for us. These are what we pass to
// `dispatch(...)` from a component.
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions

// The reducer function itself is what gets registered with the store
// in store.js (under the `counter` key).
export default counterSlice.reducer
