import { useMemo, useRef, useState } from 'react';
import './App.css';

// ============================================================================
// useMemo Hook
//
// useMemo(fn, deps) re-runs `fn` only when something in `deps` changes, and
// reuses the previous result otherwise. It memoizes a COMPUTED VALUE (as
// opposed to useCallback, which memoizes a FUNCTION reference).
//
// The trap: if you don't memoize, an expensive computation placed directly
// in the render body reruns on EVERY render — even ones caused by totally
// unrelated state changes. This demo makes that difference countable, not
// just theoretical: two counters below show exactly how many times the
// expensive work actually executed.
// ============================================================================

// A deliberately naive O(n * sqrt(n)) primality check — "expensive" on purpose,
// so the difference between memoized and non-memoized is easy to notice.
function countPrimesBelow(n) {
  let count = 0;
  for (let num = 2; num < n; num++) {
    let isPrime = true;
    for (let d = 2; d * d <= num; d++) {
      if (num % d === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) count++;
  }
  return count;
}

function App() {
  const [limit, setLimit] = useState(20000); // the ONLY value the expensive work actually depends on
  const [unrelatedCount, setUnrelatedCount] = useState(0); // forces re-renders that should NOT trigger recompute

  const noMemoRuns = useRef(0);
  const memoRuns = useRef(0);

  // --- WITHOUT useMemo: reruns on every single render, no matter the cause ---
  noMemoRuns.current += 1;
  const primesNoMemo = countPrimesBelow(limit);

  // --- WITH useMemo: reruns ONLY when `limit` changes ---
  const primesMemo = useMemo(() => {
    memoRuns.current += 1;
    return countPrimesBelow(limit);
  }, [limit]);

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6 space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">useMemo Hook</h1>
          <p className="text-sm text-slate-500 mt-1">Memoizing an expensive computed value</p>
        </header>

        <div>
          <label className="text-sm text-slate-600">
            Count primes below: <span className="font-mono font-semibold">{limit}</span>
          </label>
          <input
            type="range"
            min={2000}
            max={40000}
            step={2000}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full mt-1"
          />
          <p className="text-xs text-slate-400 mt-1">
            Changing this is the ONLY thing that should trigger recomputation in the memoized version.
          </p>
        </div>

        <button
          onClick={() => setUnrelatedCount((c) => c + 1)}
          className="w-full px-3 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-800"
        >
          Re-render for an unrelated reason ({unrelatedCount})
        </button>
        <p className="text-xs text-slate-400 -mt-3">
          This bumps unrelated state and re-renders the whole component — watch what happens
          to each counter below when you click it repeatedly vs. when you move the slider.
        </p>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-xs text-red-600 mb-1">WITHOUT useMemo</p>
            <p className="text-2xl font-mono font-bold text-red-700">{primesNoMemo}</p>
            <p className="text-xs text-red-500 mt-1">recomputed {noMemoRuns.current}x</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
            <p className="text-xs text-emerald-600 mb-1">WITH useMemo</p>
            <p className="text-2xl font-mono font-bold text-emerald-700">{primesMemo}</p>
            <p className="text-xs text-emerald-500 mt-1">recomputed {memoRuns.current}x</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 border-t pt-3">
          Click "Re-render for an unrelated reason" several times: the left counter keeps
          climbing (it reruns the primality check every render) while the right counter
          stays put — <code>useMemo</code> only reruns it when <code>limit</code> itself changes.
        </p>
      </div>
    </div>
  );
}

export default App;
