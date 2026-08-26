// Pure, dependency-free cart math. Deliberately kept separate from
// app.js/models - a function that only takes plain values in and returns a
// plain value out, with no database call, no HTTP, no filesystem, is the
// easiest kind of code to unit test (see test/unit/cart.unit.test.js) and
// the easiest kind to reason about boundary cases for (see
// test/boundary/cart.boundary.test.js).

// Q. WHY THROW ON INVALID INPUT INSTEAD OF RETURNING null/NaN?
// ANS: A silently-wrong number (NaN propagating through a total, or a
// negative price quietly accepted) is far more dangerous in something that
// touches money than a loud, immediate failure - the caller (app.js's
// route handlers) is expected to catch these and turn them into a 400
// response, not let bad input flow through to a "successful" checkout.
export function applyDiscount(price, percent) {
  if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
    throw new RangeError("price must be a non-negative number")
  }
  if (typeof percent !== "number" || Number.isNaN(percent) || percent < 0 || percent > 100) {
    throw new RangeError("percent must be a number between 0 and 100")
  }
  return Number((price - price * (percent / 100)).toFixed(2))
}

export function validateQuantity(quantity) {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 100
}

// Q. WHY DOES calculateTotal TAKE AN ARRAY OF {price, quantity} INSTEAD OF
//    A SINGLE price/quantity PAIR LIKE applyDiscount DOES?
// ANS: This is the function that models the actual use case (a cart has
// multiple line items) - keeping applyDiscount single-item and generic
// means it can be reused here (per-item discount) AND independently
// tested/reasoned about without cart-shaped data getting in the way.
// Composing small single-purpose functions like this is also what makes
// unit testing pleasant: each piece has a small, obvious contract.
export function calculateTotal(items, discountPercent = 0) {
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array")
  }

  const subtotal = items.reduce((sum, item) => {
    if (!validateQuantity(item.quantity)) {
      throw new RangeError(`invalid quantity for item "${item.name}": ${item.quantity}`)
    }
    return sum + item.price * item.quantity
  }, 0)

  return applyDiscount(subtotal, discountPercent)
}
