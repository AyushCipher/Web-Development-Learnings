import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { increment, decrement, incrementByAmount, reset } from './counterSlice'

function Counter() {
  // useSelector reads a slice of state from the store and SUBSCRIBES this
  // component to it: whenever state.counter.value changes, Redux re-runs
  // this selector and re-renders the component if the result changed.
  // No prop-drilling needed - any component, anywhere in the tree, could
  // call this same selector and get the same live value.
  const count = useSelector((state) => state.counter.value)

  // dispatch is how a component asks the store to run a reducer. Calling a
  // reducer function directly wouldn't update the store - dispatch(action)
  // sends the action to the store, which runs the matching case reducer
  // and notifies every subscribed component (like the useSelector above).
  const dispatch = useDispatch()

  // Local, component-only UI state (the text in the input box) is still a
  // perfectly good fit for useState - it doesn't need to be shared with the
  // rest of the app, unlike the counter value itself.
  const [amount, setAmount] = useState(2)

  const handleIncrementByAmount = () => {
    const parsed = Number(amount)
    if (Number.isNaN(parsed)) return
    // incrementByAmount() builds { type: 'counter/incrementByAmount', payload: parsed }
    dispatch(incrementByAmount(parsed))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-8 shadow-xl">
        <h1 className="text-center text-lg font-medium text-slate-400">
          Redux Toolkit Counter
        </h1>

        <p className="mt-4 text-center text-6xl font-bold tabular-nums text-white">
          {count}
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(decrement())}
            className="h-12 w-12 rounded-lg bg-slate-700 text-2xl font-semibold text-white transition hover:bg-slate-600 active:scale-95"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => dispatch(reset())}
            className="h-12 rounded-lg bg-slate-700 px-4 text-sm font-semibold text-white transition hover:bg-slate-600 active:scale-95"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => dispatch(increment())}
            className="h-12 w-12 rounded-lg bg-indigo-500 text-2xl font-semibold text-white transition hover:bg-indigo-400 active:scale-95"
          >
            +
          </button>
        </div>

        {/* Exercises incrementByAmount: dispatch with a payload */}
        <div className="mt-6 flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white outline-none focus:border-indigo-400"
            aria-label="Custom amount"
          />
          <button
            type="button"
            onClick={handleIncrementByAmount}
            className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 active:scale-95"
          >
            Add Amount
          </button>
        </div>
      </div>
    </div>
  )
}

export default Counter
