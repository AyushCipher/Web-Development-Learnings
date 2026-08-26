import './App.css';
import ExpensiveComponent from './components/ExpensiveComponent';
import ChildRerenderDemo from './components/ChildRerenderDemo';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">useCallback Hook</h1>
        <p className="text-sm text-slate-500 mt-1">
          Memoizing a function reference — and why that reference actually matters
        </p>
      </header>

      <ExpensiveComponent />
      <ChildRerenderDemo />

      <div className="max-w-md mx-auto overflow-x-auto">
        <table className="w-full text-xs bg-white rounded-lg shadow border-collapse">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="p-2 text-left">Feature</th>
              <th className="p-2 text-left">useMemo</th>
              <th className="p-2 text-left">useRef</th>
              <th className="p-2 text-left">useCallback</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            <tr className="border-b">
              <td className="p-2 font-semibold">Purpose</td>
              <td className="p-2">Memoize a computed value</td>
              <td className="p-2">Persist a mutable value, no re-render</td>
              <td className="p-2">Memoize a function reference</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">Returns</td>
              <td className="p-2">The memoized value</td>
              <td className="p-2">{'{ current: value }'}</td>
              <td className="p-2">The memoized function</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">Recalculated</td>
              <td className="p-2">When deps change</td>
              <td className="p-2">Never automatically</td>
              <td className="p-2">When deps change</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold">Typical use</td>
              <td className="p-2">Skip expensive recomputation</td>
              <td className="p-2">Timers, DOM nodes, prev values</td>
              <td className="p-2">Stable callback for React.memo children</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
