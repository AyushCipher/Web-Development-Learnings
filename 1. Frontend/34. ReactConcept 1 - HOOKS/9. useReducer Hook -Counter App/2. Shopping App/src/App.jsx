import React, { useReducer } from 'react';

// ============================================================================
// This is the example that actually justifies useReducer over useState.
// The counter app next door (folder "1. Counter App") is simple enough that
// useState would honestly be fine too. A cart is not: FOUR different actions
// (add/remove/update/clear) all mutate the SAME nested array, and several of
// them depend on the array's current contents (e.g. "is this item already in
// the cart?"). Modeling that as separate useState calls means every handler
// has to read and coordinate multiple pieces of state by hand. Centralizing
// all four transitions in one reducer means there is exactly one function
// that knows how the cart's shape is allowed to change.
// ============================================================================

// 1. Initial cart state
const initialState = {
  cart: [],
};

// 2. Reducer function.
// Every branch returns a brand-new state object/array instead of mutating
// `state` in place (spread operators, .map, .filter all produce new
// references). This immutability isn't a style preference — React compares
// state by reference to decide whether to re-render, so mutating the old
// array in place would leave React thinking nothing changed at all.
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.cart.find((item) => item.id === action.payload.id);
      if (existing) {
        // Item already in cart -> return a NEW array with that one item's
        // quantity bumped (map always returns a new array, even for the
        // untouched items, which is what makes this update immutable).
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      // New item -> append a new array containing everything plus this one.
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      // Quantity can't go below 1 through the +/- buttons — enforced here,
      // in the one place that's allowed to decide what a "valid" cart looks like.
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: Math.max(1, action.payload.quantity) }
              : item
          ),
      };

    case 'CLEAR_CART':
      return initialState;

    default:
      throw new Error('Unknown action type');
  }
}

// A tiny catalog to add from, so the demo has more than one item to juggle.
const catalog = [
  { id: 1, name: 'Laptop', price: 49999 },
  { id: 2, name: 'Wireless Mouse', price: 799 },
  { id: 3, name: 'Mechanical Keyboard', price: 3499 },
];

function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '420px', margin: '0 auto' }}>
      <h2>🛒 Shopping Cart</h2>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {catalog.map((product) => (
          <button key={product.id} onClick={() => dispatch({ type: 'ADD_ITEM', payload: product })}>
            Add {product.name}
          </button>
        ))}
      </div>
      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>Clear Cart</button>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
        {state.cart.length === 0 && <li style={{ color: '#888' }}>Cart is empty</li>}
        {state.cart.map((item) => (
          <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ flex: 1 }}>
              {item.name} — Qty: {item.quantity} (₹{item.price * item.quantity})
            </span>
            <button
              onClick={() =>
                dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })
              }
            >
              ➖
            </button>
            <button
              onClick={() =>
                dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })
              }
            >
              ➕
            </button>
            <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}>❌</button>
          </li>
        ))}
      </ul>

      <p style={{ fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
        Total: ₹{total.toLocaleString()}
      </p>
    </div>
  );
}

export default ShoppingCart;

