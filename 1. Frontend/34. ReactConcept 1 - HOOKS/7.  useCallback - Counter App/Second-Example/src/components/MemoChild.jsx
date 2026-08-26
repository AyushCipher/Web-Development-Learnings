import React, { useRef } from 'react';

// React.memo skips re-rendering this component if its props are shallow-equal
// to last time. A function prop is only "equal" if it's the SAME reference —
// so a new inline arrow function passed on every parent render defeats
// React.memo completely, even though the child is wrapped in it.
const MemoChild = React.memo(function MemoChild({ label, tone, onClick }) {
  const renderCount = useRef(0);
  renderCount.current += 1; // safe here: mutated during render, not inside an effect

  return (
    <div className={`rounded-lg p-4 border ${tone === 'good' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
      <p className={`text-sm font-semibold ${tone === 'good' ? 'text-emerald-700' : 'text-red-700'}`}>{label}</p>
      <p className="text-3xl font-mono font-bold text-slate-800 my-2">{renderCount.current}</p>
      <p className="text-xs text-slate-500 mb-3">times this child has rendered</p>
      <button
        onClick={onClick}
        className="w-full px-3 py-1.5 bg-slate-700 text-white rounded text-sm hover:bg-slate-800"
      >
        Click me
      </button>
    </div>
  );
});

export default MemoChild;
