import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

// ============================================================================
// useCallback Hook — "Freeze Concept"
//
// This is the single most common real-world bug useCallback's dependency
// array causes when you get it wrong: a STALE CLOSURE.
//
// useCallback(fn, deps) memoizes the FUNCTION ITSELF, and only creates a new
// one when `deps` changes. If `fn` reads a piece of state but you leave that
// state out of `deps`, the memoized function keeps closing over whatever that
// state's value was on the render where it was FIRST created — forever.
//
// Below, two auto-incrementing counters run side by side, driven by an
// identical setInterval. Both tick every second (proven by the shared
// heartbeat). Only one of them actually counts up.
// ============================================================================

function App() {
  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">useCallback: The Freeze Bug</h1>
          <p className="text-sm text-slate-500 mt-1">A stale closure caused by a wrong dependency array</p>
        </header>

        <div className="grid grid-cols-2 gap-4">
          <BrokenCounter />
          <FixedCounter />
        </div>
      </div>
    </div>
  );
}

// --- BROKEN: useCallback with an empty dependency array, but the function
// reads `count` from the render it was created on. That `count` (0) gets
// baked into the closure permanently, so every tick computes 0 + 1 = 1 —
// the display jumps to 1 once and then FREEZES there forever, even though
// the interval keeps firing every second.
function BrokenCounter() {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const heartbeat = useHeartbeat(running);
  const intervalRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tick = useCallback(() => {
    setCount(count + 1); // <- reads the OUTER `count`, captured at creation time
  }, []); // <- BUG: `count` is used inside but missing from deps

  const toggle = () => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(tick, 1000);
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const frozen = running && heartbeat >= 3 && count <= 1;

  return (
    <div className="bg-white rounded-lg shadow p-5 border-t-4 border-red-400">
      <h2 className="font-semibold text-red-700 mb-1">❌ Broken</h2>
      <p className="text-xs text-slate-500 mb-3">
        <code>useCallback(() =&gt; setCount(count + 1), [])</code>
      </p>
      <p className="text-4xl font-mono font-bold text-slate-800 text-center">{count}</p>
      <p className="text-center text-xs text-slate-400 mt-1">
        heartbeat: {heartbeat}s {frozen && <span className="text-red-600 font-semibold">— 🥶 FROZEN (heartbeat is moving, count isn't)</span>}
      </p>
      <button
        onClick={toggle}
        className="mt-3 w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        {running ? 'Stop' : 'Start'} auto-increment
      </button>
    </div>
  );
}

// --- FIXED: use the functional updater form, setCount(prev => prev + 1).
// It never reads the outer `count` at all, so it doesn't matter that `count`
// is missing from the dependency array — there's nothing stale to capture.
// This is the standard fix for stale closures in intervals/callbacks.
function FixedCounter() {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const heartbeat = useHeartbeat(running);
  const intervalRef = useRef(null);

  const tick = useCallback(() => {
    setCount((prev) => prev + 1); // <- always reads React's latest value, never stale
  }, []); // safe to keep empty — nothing external is captured

  const toggle = () => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(tick, 1000);
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="bg-white rounded-lg shadow p-5 border-t-4 border-emerald-400">
      <h2 className="font-semibold text-emerald-700 mb-1">✅ Fixed</h2>
      <p className="text-xs text-slate-500 mb-3">
        <code>useCallback(() =&gt; setCount(prev =&gt; prev + 1), [])</code>
      </p>
      <p className="text-4xl font-mono font-bold text-slate-800 text-center">{count}</p>
      <p className="text-center text-xs text-slate-400 mt-1">heartbeat: {heartbeat}s</p>
      <button
        onClick={toggle}
        className="mt-3 w-full px-3 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
      >
        {running ? 'Stop' : 'Start'} auto-increment
      </button>
    </div>
  );
}

// A simple shared "proof of life" ticker — proves the interval really is
// firing every second, so when the broken counter stalls, you know it's a
// stale-closure bug and not just "the timer stopped".
function useHeartbeat(running) {
  const [beats, setBeats] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setBeats((b) => b + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (!running) setBeats(0);
  }, [running]);
  return beats;
}

export default App;
