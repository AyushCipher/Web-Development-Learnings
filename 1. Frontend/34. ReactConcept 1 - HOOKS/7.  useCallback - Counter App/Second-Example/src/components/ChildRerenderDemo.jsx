import React, { useCallback, useState } from 'react';
import MemoChild from './MemoChild';

// ============================================================================
// PART 2 — the REAL reason useCallback exists
//
// useCallback is rarely useful in isolation. It earns its keep when a
// function is passed as a prop to a React.memo-wrapped child: only then does
// "same reference" translate into "child skips re-rendering".
//
// This is proven with two structurally identical children — the only
// difference is whether the callback they receive is memoized.
// ============================================================================

function ChildRerenderDemo() {
  const [unrelated, setUnrelated] = useState(0);
  const [clicks, setClicks] = useState({ bad: 0, good: 0 });

  // BAD: a brand-new function is created on every render of this parent.
  // Even though MemoChild is wrapped in React.memo, "new function reference"
  // looks like "changed props" to React's shallow comparison -> it re-renders.
  const badHandleClick = () => {
    setClicks((c) => ({ ...c, bad: c.bad + 1 }));
  };

  // GOOD: memoized once, empty deps (it doesn't close over anything that
  // changes). The reference never changes across renders, so React.memo can
  // correctly bail out of re-rendering this child when unrelated state changes.
  const goodHandleClick = useCallback(() => {
    setClicks((c) => ({ ...c, good: c.good + 1 }));
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Part 2: Preventing child re-renders</h2>
      <p className="text-xs text-gray-500 mb-4">
        Click "Re-render parent" a few times — it changes state that neither child actually
        needs. Watch the render counters below.
      </p>

      <button
        onClick={() => setUnrelated((u) => u + 1)}
        className="w-full mb-4 px-3 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-800"
      >
        Re-render parent, unrelated state ({unrelated})
      </button>

      <div className="grid grid-cols-2 gap-3">
        <MemoChild label="Without useCallback" tone="bad" onClick={badHandleClick} />
        <MemoChild label="With useCallback" tone="good" onClick={goodHandleClick} />
      </div>

      <p className="text-xs text-gray-500 mt-4">
        The left counter climbs every time you click "Re-render parent" — a fresh function
        prop each time defeats <code>React.memo</code>. The right counter only climbs when
        you click its own "Click me" button — <code>useCallback</code> keeps its prop
        reference stable, so <code>React.memo</code> can actually skip the re-render.
      </p>
    </div>
  );
}

export default ChildRerenderDemo;
