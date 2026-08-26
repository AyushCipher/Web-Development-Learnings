import React, { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// PART 1 — function identity
//
// useCallback(fn, deps) returns the SAME function reference across renders
// as long as `deps` hasn't changed, instead of creating a brand-new function
// on every render (which is what a plain arrow function inside a component
// body always does).
//
// This demo proves the reference is actually stable by comparing it against
// itself, render over render, via a ref (refs don't cause re-renders, so
// they're a safe place to remember "the previous value" across renders).
// ============================================================================

const ExpensiveComponent = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const previousFunction = useRef(null);
  const [identityLog, setIdentityLog] = useState([]);

  const expensiveCalculation = useCallback(() => {
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += i;
    }
    return result;
  }, [count]); // only recreated when `count` changes — typing in the input below does NOT recreate it

  useEffect(() => {
    if (previousFunction.current) {
      const sameReference = previousFunction.current === expensiveCalculation;
      setIdentityLog((prev) =>
        [
          sameReference
            ? 'Function reference unchanged (typing text does not recreate it)'
            : 'Function reference changed (count changed -> useCallback recreated it)',
          ...prev,
        ].slice(0, 4)
      );
    }
    previousFunction.current = expensiveCalculation;
  }, [expensiveCalculation]);

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Part 1: Function identity</h2>
      <p className="text-xs text-gray-500 mb-4">
        Type below — it re-renders this component, but does NOT recreate{' '}
        <code>expensiveCalculation</code>, because <code>count</code> (its only dependency)
        hasn't changed.
      </p>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something (re-renders, doesn't recreate the function)"
        className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
      >
        Increment count ({count}) — this DOES recreate it
      </button>

      <div className="mt-4 h-20 overflow-y-auto text-xs font-mono bg-white rounded p-2 border border-gray-200 space-y-0.5">
        {identityLog.length === 0 && <p className="text-gray-400">Interact above to see identity checks...</p>}
        {identityLog.map((entry, i) => (
          <p key={i} className={entry.includes('changed') && !entry.includes('unchanged') ? 'text-amber-600' : 'text-emerald-600'}>
            {entry}
          </p>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Note: calling <code>expensiveCalculation()</code> here would still rerun the loop
        every render — <code>useCallback</code> memoizes the FUNCTION, not its return value.
        Memoizing a computed VALUE is <code>useMemo</code>'s job (see folder 6). The loop
        above only actually matters once you pass this function down to other components —
        which is exactly what Part 2 below demonstrates.
      </p>
    </div>
  );
};

export default ExpensiveComponent;
