import { useEffect, useState } from 'react';

// This component only exists to be mounted/unmounted by its parent (see App.js).
// The point: useEffect's cleanup function is what makes unmounting safe.
function Stopwatch({ onLog }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    onLog('Stopwatch mounted -> setInterval started');

    const intervalId = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Cleanup runs when the component unmounts (or before the effect re-runs).
    // Without this, the interval would keep firing forever after the component
    // is removed from the DOM, calling setSeconds on a component that no longer
    // exists -> a classic React memory leak / "state update on unmounted component" bug.
    return () => {
      clearInterval(intervalId);
      onLog('Stopwatch UNmounted -> clearInterval ran (no leaked timer)');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800">
      Elapsed: <span className="font-mono font-semibold">{seconds}s</span>
    </div>
  );
}

export default Stopwatch;
