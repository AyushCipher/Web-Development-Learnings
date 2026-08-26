import { useState } from 'react';
import './App.css';

// ============================================================================
// useState Hook — Counter App
//
// The obvious part: useState(initialValue) returns [value, setValue] and
// re-renders the component whenever setValue is called with a new value.
//
// The part that actually trips people up (demonstrated below): setValue is
// NOT immediate, and inside a single event handler it keeps reading the SAME
// "count" value that was captured when that render happened (a "stale
// closure"). Calling setCount(count + 1) three times in a row therefore only
// adds 1, not 3 — because all three calls saw the same starting `count`.
// The fix is the functional updater form: setCount(prev => prev + 1), which
// always receives React's latest pending value instead of the stale one.
// ============================================================================

function App() {
  const [count, setCount] = useState(0);

  // BROKEN: each call closes over the same `count` from this render.
  // React batches these three setCount calls, and all three compute
  // `count + 1` using the SAME starting value -> net result is +1, not +3.
  const addThreeBroken = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  // CORRECT: the functional form receives React's latest queued value
  // (`prev`) at the moment each update is actually applied, so the three
  // calls chain correctly -> net result is +3.
  const addThreeCorrect = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  };

  // Array state: never mutate state directly (e.g. history.push(...)).
  // Always create a NEW array/object so React can detect the change via
  // reference comparison and knows it needs to re-render.
  const [history, setHistory] = useState([]);
  const logAction = (label) => {
    setHistory((prev) => [...prev, label]); // spread = new array, old one untouched
  };

  const reset = () => {
    setCount(0);
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">useState Hook</h1>
          <p className="text-sm text-slate-500 mt-1">Counter: state management basics</p>
        </header>

        <div className="text-center">
          <span className="text-5xl font-mono font-bold text-slate-800">{count}</span>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              setCount((prev) => prev - 1);
              logAction('-1');
            }}
            className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300"
          >
            −1
          </button>
          <button
            onClick={() => {
              setCount((prev) => prev + 1);
              logAction('+1');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            +1
          </button>
          <button onClick={reset} className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200">
            Reset
          </button>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Click "+1" three times using each button below and compare:
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                addThreeBroken();
                logAction('Add 3 (broken: count + 1) -> only +1 actually applied');
              }}
              className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
            >
              Add 3 (broken)
            </button>
            <button
              onClick={() => {
                addThreeCorrect();
                logAction('Add 3 (correct: prev => prev + 1) -> +3 applied');
              }}
              className="flex-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 text-sm"
            >
              Add 3 (correct)
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            "Broken" only moves the count by 1 — all three updates read the same stale
            `count`. "Correct" uses the functional updater and genuinely moves it by 3.
          </p>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-slate-700 mb-2">Action history (array state)</p>
          <div className="h-28 overflow-y-auto text-xs font-mono bg-slate-50 rounded p-2 space-y-0.5">
            {history.length === 0 && <p className="text-slate-400">No actions yet</p>}
            {history.map((entry, i) => (
              <p key={i} className="text-slate-600">
                {i + 1}. {entry}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
