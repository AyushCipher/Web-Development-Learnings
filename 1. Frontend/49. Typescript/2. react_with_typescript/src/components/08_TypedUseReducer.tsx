import { useReducer, type Dispatch } from "react";

type CounterState = {
  count: number;
  step: number;
};

type Action =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "RESET"; to?: number };

function init(initialCount: number): CounterState {
  return { count: initialCount, step: 1 };
}

function CounterReducer(state: CounterState, action: Action): CounterState {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + state.step };
    case "DECREMENT":
      return { ...state, count: state.count - state.step };
    case "RESET":
      return { ...state, count: action.to ?? 0 };

    default:
      return state;
  }
}

export function TypedReducer({ initial = 0 }: { initial?: number }) {
  const [state, dispatch] = useReducer(CounterReducer, initial, init);

  return (
    <div>
      {state.count}
      <button onClick={() => dispatch({ type: "INCREMENT" })}>Increment</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>Decrement</button>

      <button onClick={() => dispatch({ type: "RESET", to: 2 })}>Reset</button>
      <SmallChild dispatch={dispatch} />
    </div>
  );
}

type CounterDispatch = Dispatch<Action>;

function SmallChild({ dispatch }: { dispatch: CounterDispatch }) {
  return (
    <div>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>
        Click from child component
      </button>
    </div>
  );
}
