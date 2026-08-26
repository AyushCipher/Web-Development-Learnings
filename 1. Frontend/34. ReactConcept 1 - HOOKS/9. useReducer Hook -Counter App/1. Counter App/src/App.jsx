import React, { useReducer } from 'react';

// Step 1: Define initial state
const initialState = { count: 0, history: [] };

// Step 2: Create reducer function.
// The whole idea of useReducer: every possible state transition for this
// component lives in ONE place, as a pure function (same state + action always
// produces the same result, no side effects). Compare this to a useState
// version, where "increment", "decrement" and "reset" would each need their
// own setCount(...) call scattered across separate event handlers — here they
// are all named, visible cases in a single switch, which is what makes this
// approach scale as the number of related state transitions grows.
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1, history: [...state.history, '+1'] };
    case 'decrement':
      return { count: state.count - 1, history: [...state.history, '-1'] };
    case 'reset':
      return initialState;
    default:
      throw new Error('Unknown action type');
  }
}

function Counter() {
  // Step 3: Use useReducer hook.
  // dispatch never changes identity across renders (similar guarantee to what
  // useCallback gives you manually) — you just describe WHAT happened
  // ({ type: 'increment' }) and let the reducer decide HOW state changes.
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div style={{ textAlign: 'center', marginTop: '30px', backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '15px' }}>
      <h2>Counter: {state.count}</h2>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
      <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
        Every dispatched action is just a plain object — {'{ type: "increment" }'} — logged
        below by the SAME reducer that updates count. That single-source-of-truth trail is
        exactly what gets hard to maintain once you have several useState calls instead.
      </p>
      <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#555' }}>
        history: [{state.history.join(', ')}]
      </p>
    </div>
  );
}

export default Counter;

// useReducer Hook:-
// useReducer is a React Hook used for managing state logic in a component.
// It is an alternative to useState, and is especially useful when:
//
// * State depends on previous state.
// * You have multiple related values in a single state object.
// * State transitions involve multiple actions/types.
//
// SYNTAX:
// const [state, dispatch] = useReducer(reducer, initialState);
//
// reducer – a function that takes current state and an action, and returns the new state.
// initialState – the starting value for the state.
// dispatch – a function to trigger the reducer with a specific action.


