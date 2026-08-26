import React from 'react';
import ChildC from './ChildC';

// Same story as ChildA: no props in, no props out. ChildB is two levels deep
// (App -> ChildA -> ChildB -> ChildC) and still doesn't touch UserContext or
// ThemeContext. Only ChildC, the component that actually NEEDS the data,
// reaches for it directly via useContext.
const ChildB = () => {
  return (
    <div>
      <ChildC />
    </div>
  );
};

export default ChildB;
