import { useEffect, useRef, useState } from 'react';
import './App.css';

// ============================================================================
// useRef Hook
//
// A ref is a mutable box — { current: value } — that:
//   1. Survives across re-renders (unlike a plain local variable, which is
//      recreated fresh every render).
//   2. Does NOT trigger a re-render when you mutate .current (unlike useState).
//   3. Is also how you get an imperative handle to a real DOM node.
//
// Three demos below make each of those three facts visible on screen.
// ============================================================================

function App() {
  // --- Demo 1: ref mutation is invisible to React until something else re-renders ---
  const silentClicks = useRef(0); // mutating this never schedules a render
  const [stateClicks, setStateClicks] = useState(0); // this always does
  const [, forceRerender] = useState(0);

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 space-y-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">useRef Hook</h1>
          <p className="text-sm text-slate-500 mt-1">Persist values without re-rendering</p>
        </header>

        {/* DEMO 1 */}
        <section>
          <h2 className="font-semibold text-slate-700 mb-2">1) Ref updates don't repaint the UI</h2>
          <p className="text-xs text-slate-500 mb-3">
            Click "Silent ref++" a bunch of times — the number on screen won't move, even
            though <code>silentClicks.current</code> really is incrementing behind the
            scenes. Then click "Reveal" to force one re-render and watch the true value
            snap into view. Compare with "State++", which repaints immediately every time.
          </p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <p className="text-3xl font-mono font-bold text-amber-700">{silentClicks.current}</p>
              <p className="text-xs text-amber-600 mt-1">ref (silent)</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-3xl font-mono font-bold text-blue-700">{stateClicks}</p>
              <p className="text-xs text-blue-600 mt-1">state (visible)</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={() => (silentClicks.current += 1)}
              className="px-2 py-1.5 bg-amber-200 text-amber-800 rounded text-sm hover:bg-amber-300"
            >
              Silent ref++
            </button>
            <button
              onClick={() => setStateClicks((c) => c + 1)}
              className="px-2 py-1.5 bg-blue-200 text-blue-800 rounded text-sm hover:bg-blue-300"
            >
              State++
            </button>
            <button
              onClick={() => forceRerender((n) => n + 1)}
              className="px-2 py-1.5 bg-slate-700 text-white rounded text-sm hover:bg-slate-800"
            >
              Reveal
            </button>
          </div>
        </section>

        {/* DEMO 2 */}
        <DomAccessDemo />

        {/* DEMO 3 */}
        <StopwatchDemo />
      </div>
    </div>
  );
}

// --- Demo 2: refs also give direct, imperative access to a real DOM node ---
// This bypasses React's usual declarative "state -> render" flow, so it's an
// escape hatch — reach for it only for things state genuinely can't do
// (focus, text selection, scroll position, measuring size, integrating a
// non-React library), not as a shortcut around normal state updates.
function DomAccessDemo() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // runs once on mount, after the <input> exists in the DOM
  }, []);

  return (
    <section className="border-t pt-6">
      <h2 className="font-semibold text-slate-700 mb-2">2) Direct DOM access</h2>
      <p className="text-xs text-slate-500 mb-3">
        This input auto-focuses on mount via <code>inputRef.current.focus()</code>.
      </p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Auto-focused on mount"
          className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => {
            inputRef.current.value = '';
            inputRef.current.focus();
          }}
          className="px-3 py-2 bg-slate-200 rounded text-sm hover:bg-slate-300"
        >
          Clear & refocus
        </button>
      </div>
    </section>
  );
}

// --- Demo 3: a ref is the right home for a setInterval ID ---
// The ID itself is never displayed, so it has no business living in state
// (that would trigger a pointless re-render every time it changes). The
// SECONDS count, which IS displayed, correctly lives in useState instead.
function StopwatchDemo() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = () => {
    if (intervalRef.current) return; // already running
    setRunning(true);
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  };

  const reset = () => {
    stop();
    setSeconds(0);
  };

  // Safety net: clear the interval if this component unmounts while running.
  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <section className="border-t pt-6">
      <h2 className="font-semibold text-slate-700 mb-2">3) Stopwatch — interval ID lives in a ref</h2>
      <p className="text-xs text-slate-500 mb-3">
        <code>intervalRef.current</code> holds the timer ID so start/stop/reset can control
        it, without that ID itself ever needing to trigger a render.
      </p>
      <div className="text-center mb-3">
        <span className="text-4xl font-mono font-bold text-slate-800">{seconds}s</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={start}
          disabled={running}
          className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:opacity-40"
        >
          Start
        </button>
        <button
          onClick={stop}
          disabled={!running}
          className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-40"
        >
          Stop
        </button>
        <button onClick={reset} className="flex-1 px-3 py-2 bg-slate-200 rounded text-sm hover:bg-slate-300">
          Reset
        </button>
      </div>
    </section>
  );
}

export default App;
