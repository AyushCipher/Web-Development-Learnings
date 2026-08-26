import React from 'react';
import ChildB from './ChildB';

// This component sits between App (the Provider) and ChildC (the consumer),
// yet accepts zero props and forwards zero props. That's the entire point of
// Context: ChildA doesn't need to know UserContext/ThemeContext exist at all,
// let alone thread them through. Compare this to the commented-out prop-drilling
// example in App.jsx, where every intermediate level is forced to accept and
// re-pass `theme` even though it never uses it.
const ChildA = () => {
  return (
    <div>
      <ChildB />
    </div>
  );
};

export default ChildA;
