import { useEffect, useRef, useState } from 'react';
import './App.css';
import Stopwatch from './components/Stopwatch';

// ============================================================================
// useEffect Hook — visual, on-screen demo of the 4 dependency-array variations.
// Everything below is logged to a visible panel instead of console.log, so the
// behaviour is obvious just from reading the screen once.
// ============================================================================

function App() {
  // Shared activity log for sections 2, 3 and 4 (kept in App so all sections
  // can append to one visible timeline).
  const [log, setLog] = useState([]);
  const addLog = (msg) =>
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);

  // ---- SECTION 1: effect with NO dependency array -> runs after every render ----
  // Why not just setState inside this effect to "prove" it runs every render?
  // Because setState -> re-render -> effect (no deps) fires again -> setState
  // again -> infinite loop. That's a real, common beginner bug, not a hypothetical.
  // Instead we use a ref: refs persist across renders WITHOUT causing a re-render
  // when mutated, so incrementing one inside the effect is safe.
  const everyRenderCount = useRef(0);
  const [bump, setBump] = useState(0); // unrelated state, only used to force a re-render

  useEffect(() => {
    everyRenderCount.current += 1;
  }); // <- no dependency array at all

  // ---- SECTION 2: effect with EMPTY [] -> runs exactly once, on mount ----
  useEffect(() => {
    addLog('[] effect: component mounted (this line prints exactly once, ever)');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- SECTION 3: effect with [text] -> runs on mount AND whenever text changes ----
  const [text, setText] = useState('');
  useEffect(() => {
    addLog(`[text] effect: subscribed to text = "${text}"`);
    // Cleanup fires right before the NEXT run of this same effect (and on unmount).
    // Here that means: every time you type a new character, React tears down the
    // "old" subscription before setting up the new one for the latest text value.
    return () => {
      addLog(`[text] effect: cleaned up subscription for "${text}"`);
    };
  }, [text]);

  // ---- SECTION 4: mount/unmount + cleanup, demonstrated with a real child ----
  const [showStopwatch, setShowStopwatch] = useState(true);

  return (
    <div className="App min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">useEffect Hook</h1>
          <p className="text-slate-500 text-sm mt-1">
            Side effects = code that reaches outside of rendering (timers, subscriptions,
            logging, DOM APIs, network calls). The dependency array controls WHEN it reruns.
          </p>
        </header>

        {/* SECTION 1 */}
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-slate-700">
            1) No dependency array — <code>useEffect(() =&gt; {'{...}'})</code>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Runs after <strong>every</strong> render. Click below to force a re-render and
            watch the counter track it — but notice it always shows one render <em>behind</em>,
            because the effect fires after the browser paints, not during render.
          </p>
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => setBump((b) => b + 1)}
              className="px-3 py-1.5 bg-slate-700 text-white text-sm rounded hover:bg-slate-800"
            >
              Force re-render ({bump})
            </button>
            <span className="text-sm text-slate-600">
              Effect has run <span className="font-mono font-semibold">{everyRenderCount.current}</span> time(s)
            </span>
          </div>
        </section>

        {/* SECTION 2 & 3 share the log panel below */}
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-slate-700">
            2) Empty array — <code>useEffect(() =&gt; {'{...}'}, [])</code>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Runs exactly once, right after the first render (component "mount"). Check the
            log below — this line only ever appears once, no matter how much you interact
            with the rest of the page.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-slate-700">
            3) With a dependency — <code>useEffect(() =&gt; {'{...}'}, [text])</code>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Runs on mount, then again every time <code>text</code> changes. Type below and
            watch the log: each keystroke first logs a cleanup for the *old* value, then a
            fresh run for the *new* value.
          </p>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type here..."
            className="mt-3 w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </section>

        {/* SECTION 4 */}
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-slate-700">4) Cleanup on unmount</h2>
          <p className="text-sm text-slate-500 mt-1">
            The Stopwatch below starts a <code>setInterval</code> when it mounts. Unmount it
            and the cleanup function calls <code>clearInterval</code> — watch the log to
            confirm the timer is actually torn down, not just hidden.
          </p>
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => setShowStopwatch((v) => !v)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              {showStopwatch ? 'Unmount Stopwatch' : 'Mount Stopwatch'}
            </button>
            {showStopwatch && <Stopwatch onLog={addLog} />}
          </div>
        </section>

        {/* SHARED ACTIVITY LOG */}
        <section className="bg-slate-900 rounded-lg shadow p-5">
          <h2 className="font-semibold text-slate-200 mb-2">Activity log</h2>
          <div className="h-48 overflow-y-auto text-xs font-mono text-emerald-300 space-y-1">
            {log.length === 0 && <p className="text-slate-500">Waiting for effects to fire...</p>}
            {log.map((entry, i) => (
              <p key={i}>{entry}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
