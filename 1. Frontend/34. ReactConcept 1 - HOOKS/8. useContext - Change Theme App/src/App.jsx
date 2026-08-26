import React, { createContext, useState } from 'react';
import './App.css';
import ChildA from './components/ChildA';

// PROP DRILLING: Prop drilling happens when props are passed down through multiple layers of components even if intermediate components don’t use them, 
// just to reach a deeply nested component.

// function App() {
//   const [theme, setTheme] = useState("dark");
//   return <LevelOne theme={theme} />;
// }

// function LevelOne({ theme }) {
//   return <LevelTwo theme={theme} />;
// }

// function LevelTwo({ theme }) {
//   return <LevelThree theme={theme} />;
// }

// function LevelThree({ theme }) {
//   return <p>Theme is: {theme}</p>;
// }



// Step 1: Create Multiple Contexts
export const UserContext = createContext();
export const ThemeContext = createContext();

function App() {
  const [user, setUser] = useState({ name: "Ayush Verma" });
  const [theme, setTheme] = useState("light");

  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <div id="container" className={theme === "light" ? "light-theme" : "dark-theme"}>
          <ChildA />
        </div>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
