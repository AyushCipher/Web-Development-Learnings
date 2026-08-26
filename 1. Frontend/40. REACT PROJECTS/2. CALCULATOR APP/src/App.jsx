import React, { useState } from 'react';

function App() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [result, setResult] = useState(0);

  const parseNumbers = () => {
    return [parseFloat(num1), parseFloat(num2)];
  };

  const add = () => {
    const [a, b] = parseNumbers();
    setResult(a + b);
  };

  const subtract = () => {
    const [a, b] = parseNumbers();
    setResult(a - b);
  };

  const multiply = () => {
    const [a, b] = parseNumbers();
    setResult(a * b);
  };

  const divide = () => {
    const [a, b] = parseNumbers();
    if (b === 0) return setResult('Cannot divide by zero');
    setResult(a / b);
  };

  const power = () => {
    const [a, b] = parseNumbers();
    setResult(Math.pow(a, b));
  };

  const squareRoot = () => {
  const a = parseFloat(num1);
  if (isNaN(a) || a < 0) {
    setResult("Invalid input");
  } 
  else {
    setResult(Math.sqrt(a));
  }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96 text-center border">
        <h2 className="text-2xl font-bold mb-4">Simple Calculator</h2>
        
        <input
          type="number"
          placeholder="Enter first number"
          value={num1}
          onChange={(e) => setNum1(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Enter second number"
          value={num2}
          onChange={(e) => setNum2(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={add} className="bg-green-300 hover:bg-green-400 p-2 rounded h-10 text-sm">Add</button>
          <button onClick={subtract} className="bg-red-300 hover:bg-red-400 p-2 rounded h-10 text-sm">Subtract</button>
          <button onClick={multiply} className="bg-blue-300 hover:bg-blue-400 p-2 rounded h-10 text-sm">Multiply</button>
          <button onClick={divide} className="bg-yellow-100 hover:bg-yellow-200 p-2 rounded h-10 text-sm">Divide</button>
          <button onClick={power} className="bg-orange-300 hover:bg-orange-400 p-2 rounded h-10 text-sm">Power</button>
          <button onClick={squareRoot} className="bg-gray-300 hover:bg-gray-400 p-2 rounded h-10 text-sm">Square Root</button>
        </div>

        <h3 className="text-xl font-bold">Result: {result}</h3>
      </div>
    </div>
  );
}

export default App;
