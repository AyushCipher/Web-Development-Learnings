import React, { useState, useEffect } from 'react';

function MultiEffectComponent() {
  const [count, setCount] = useState(0); // ✅ ADD THIS
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("SetInterval Started");
      setSeconds(prevSeconds => prevSeconds + 1);
    }, 1000);

    return () => {
      console.log("Time to Stop");
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
      <h1>Seconds: {seconds}</h1>
    </div>
  );
}

export default MultiEffectComponent;
