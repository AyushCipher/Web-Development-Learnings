import React, { useContext } from 'react';
import { ThemeContext, UserContext } from '../App';

const ChildC = () => {
  // ChildC reaches straight up to the Provider in App.jsx, two levels above
  // its own parent — no prop was passed to get here. This is what "avoids
  // prop drilling" actually looks like in running code, not just in theory.
  const user = useContext(UserContext);
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div>
      <button onClick={toggleTheme} style={{ marginRight: '10px' }}>
        Change Theme
      </button>
      <br></br>
      <br></br>
      data: <strong>{user.name}</strong>
    </div>
  );
};

export default ChildC;
