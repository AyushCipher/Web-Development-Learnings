import { useState } from 'react';
import { foods, filterItems } from './data.js';
import './App.css';


// App.jsx: This is our main React component.
// It holds all other components inside it, and returns the layout of our app using JSX (JavaScript + HTML syntax).


// TECHNICALLY: State Lifting refers to moving state to a common parent so multiple components (siblings) can access or update it.

// The parent owns the search input state:
export default function FilterableList() {
  const [query, setQuery] = useState('');
  const results = filterItems(foods, query);

  function handleChange(e) {
    setQuery(e.target.value);
  }

  return (
    <div>

      {/* It passes that state (and the handler to update it) down to SearchBar: */}
      <SearchBar
        query={query}
        onChange={handleChange}
      />
      <hr />
      <List items={results} />
    </div>
  );
}

function SearchBar({ query, onChange }) {
  return (
    <label>
      Search:
      <input
        value={query}         // Represents the current value of the input field dynamically
        onChange={onChange}
        placeholder="Type food name..."
      />
    </label>
  );
}

function List({ items }) {
  return (
    <table>
      <tbody> 
        {items.map(food => (
          <tr key={food.id}>
            <td><strong>{food.name}</strong></td>
            <td>{food.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}



// # STATE LIFTING IN ACTION (Step-by-step):

// Here’s how the data flow works and where state lifting happens:

// 1. FilterableList holds the state:

// const [query, setQuery] = useState('');





// 2. It passes that state (and the handler to update it) down to SearchBar:

// <SearchBar query={query} onChange={handleChange} />

// Now, SearchBar can read and modify the state even though it doesn't own it.




// 3. SearchBar uses the props:

// <input value={query} onChange={onChange} />

// This means:
// * query controls the input value
// * onChange calls handleChange in the parent to update the query state




// 4. Back in FilterableList, the updated query filters the foods list:

// const results = filterItems(foods, query);

// And it passes those results to the List component:

// <List items={results} />

