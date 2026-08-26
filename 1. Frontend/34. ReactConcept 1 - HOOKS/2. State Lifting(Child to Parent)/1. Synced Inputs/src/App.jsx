import React, { useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');

  const handleChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="container ml-6">
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="First Input"
        className="input"
      />

      <div className="middle">Synced</div>

      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Second Input"
        className="input"
      />
    </div>
  );
}

export default App;


// STATE LIFTING CONCEPT:

// * A pattern used when two or more components need to share state.
// * State is moved to the closest common parent, and then passed down via props to children.
// * Children can read or update this state via props.

// USECASE:

// * When multiple child components need access to the same state.
// * Useful when one component modifies and another reads the same state.