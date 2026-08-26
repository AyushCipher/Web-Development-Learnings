import React, { useState, useEffect } from 'react';

function TimerComponent() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("setInterval() executed.");
      setSeconds(prevSeconds => prevSeconds + 1);
    }, 1000);
    
    return () => {
      console.log("Time to stop.");
      clearInterval(intervalId);
    };
  }, []);
  
  return (
    <div>
      <h1>Seconds: {seconds}</h1>
    </div>
  );
}

export default TimerComponent;