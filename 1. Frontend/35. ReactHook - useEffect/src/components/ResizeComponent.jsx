import React, { useState, useEffect } from 'react';

function ResizeComponent() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    console.log("Event Listener Added");
    window.addEventListener('resize', handleResize);
    
    return () => {      // Runs for cleanup, when the above component is unmounted 
      console.log("Event Listener Removed");
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Runs only on first render

  return (
    <div>
      <h1>Window width: {windowWidth}px</h1>
    </div>
  );
}

export default ResizeComponent;