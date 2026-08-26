// App.jsx
import React, { useState } from 'react';
import ProgressBar from './ProgressBar';

const App = () => {
  const [progress, setProgress] = useState(0);

  const increase = () => setProgress(prev => Math.min(prev + 10, 100));
  const decrease = () => setProgress(prev => Math.max(prev - 10, 0));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 space-y-6">
      <h2 className="text-xl font-bold">Progress: {progress}%</h2>

      <div className="w-full max-w-md">
        <ProgressBar progress={progress} />
      </div>

      <div className="space-x-4">
        <button
          onClick={decrease}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Decrease
        </button>
        <button
          onClick={increase}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Increase
        </button>
      </div>
    </div>
  );
};

export default App;
