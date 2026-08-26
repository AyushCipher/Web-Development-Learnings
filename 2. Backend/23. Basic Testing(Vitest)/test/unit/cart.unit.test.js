// UNIT TESTS
//
// Q. WHAT MAKES A TEST A "UNIT" TEST SPECIFICALLY?
// ANS: It tests exactly one small piece of code (here, one function at a
// time) in complete isolation - no database, no network, no filesystem,
// no other module's real implementation. Everything the function under
// test depends on is either a plain argument you control directly, or (if
// it were a dependency like a database call) a fake/mock standing in for
// it. That isolation is what makes unit tests fast (milliseconds, not
// seconds) and precise about failure location - if this file fails, the
// bug is in cart.js itself, not in Mongo, Express, or the network.
//
// Compare this file to test/integration/cartApi.integration.test.js,
// which deliberately does NOT isolate anything - it wants to know whether
// the route, the validation, and the real database work correctly
// TOGETHER.
import { describe, it, expect, vi } from "vitest"
import { applyDiscount, calculateTotal, validateQuantity } from "../../src/cart.js"

describe("applyDiscount", () => {
  it("subtracts the given percentage from the price", () => {
    expect(applyDiscount(200, 10)).toBe(180)
  })

  it("returns the original price when discount is 0", () => {
    expect(applyDiscount(50, 0)).toBe(50)
  })

  it("rounds to 2 decimal places", () => {
    // 33.33 * 0.15 = 4.9995 - without rounding this would be an ugly
    // floating-point value like 28.3305, which is exactly the kind of
    // thing a unit test should pin down explicitly.
    expect(applyDiscount(33.33, 15)).toBe(28.33)
  })

  it("throws for a negative price", () => {
    // Q. WHY expect(() => fn()).toThrow() INSTEAD OF CALLING fn() DIRECTLY
    //    INSIDE expect()?
    // ANS: expect(applyDiscount(-10, 5)) would throw IMMEDIATELY when that
    // line evaluates, before expect() ever gets a value to wrap - Vitest
    // would report the test as erroring, not as a passing "yes, it threw"
    // assertion. Wrapping the call in an arrow function defers execution
    // until .toThrow() itself invokes it, inside a try/catch it controls.
    expect(() => applyDiscount(-10, 5)).toThrow(RangeError)
  })
})

describe("validateQuantity", () => {
  it("accepts a normal integer quantity", () => {
    expect(validateQuantity(5)).toBe(true)
  })

  it("rejects a non-integer quantity", () => {
    expect(validateQuantity(2.5)).toBe(false)
  })
})

describe("calculateTotal", () => {
  const items = [
    { name: "Notebook", price: 5, quantity: 2 },
    { name: "Pen", price: 1.5, quantity: 3 },
  ]

  it("sums price * quantity across all items", () => {
    // 5*2 + 1.5*3 = 14.5, no discount
    expect(calculateTotal(items)).toBe(14.5)
  })

  it("applies a discount to the summed subtotal", () => {
    // 14.5 subtotal, 10% off = 13.05
    expect(calculateTotal(items, 10)).toBe(13.05)
  })

  // Q. WHY IS THIS TEST HERE, USING vi.fn(), IN A FILE ABOUT PURE
  //    FUNCTIONS THAT DON'T CALL ANYTHING?
  // ANS: calculateTotal itself is pure, but this demonstrates the
  // technique you'd reach for the moment a unit under test DOES call
  // something external - a logger, a pricing-rules lookup, an email
  // sender. vi.fn() creates a fake function that records how it was
  // called without doing anything real, so you can assert "my code called
  // its dependency correctly" without that dependency's real (possibly
  // slow, possibly side-effect-having) implementation ever running. Here
  // it just stands in for "some callback the caller wants notified with
  // the final total" - a stand-in for the pattern, not a real dependency
  // of calculateTotal.
  it("demonstrates a spy: a callback gets called with the computed total", () => {
    const onTotalComputed = vi.fn()

    const total = calculateTotal(items, 0)
    onTotalComputed(total)

    expect(onTotalComputed).toHaveBeenCalledOnce()
    expect(onTotalComputed).toHaveBeenCalledWith(14.5)
  })
})
