// BOUNDARY TESTS
//
// Q. IS BOUNDARY TESTING A SEPARATE "LEVEL" LIKE UNIT/INTEGRATION/E2E ARE?
// ANS: Not really - it's a TECHNIQUE for choosing which inputs to test,
// not a place in the test pyramid. It can be applied at any level (there
// are boundary-flavored assertions in the integration tests too, for
// instance). It gets its own file here because it deserves deliberate
// attention: most bugs in real code live at the EDGES of valid input, not
// in the comfortable middle. If you only ever test with "normal" values
// like quantity=5 or price=20, code can look perfectly correct while
// being broken at quantity=0, quantity=101, or a completely empty cart.
//
// Q. WHAT COUNTS AS "A BOUNDARY" HERE?
// ANS: For any input with a valid range (quantity: 1 to 100, discount: 0
// to 100), the boundary is the exact edge of that range and the values
// just past it on either side. The systematic way to cover a range is to
// test: the minimum, the minimum minus one (should fail), the maximum,
// the maximum plus one (should fail), and often zero/empty/negative
// specifically since those tend to be handled by different code paths
// than "a slightly too-large number" would be.
import { describe, it, expect } from "vitest"
import { applyDiscount, calculateTotal, validateQuantity } from "../../src/cart.js"

describe("validateQuantity - boundaries", () => {
  it("rejects zero (below the minimum of 1)", () => {
    expect(validateQuantity(0)).toBe(false)
  })

  it("accepts exactly the minimum (1)", () => {
    expect(validateQuantity(1)).toBe(true)
  })

  it("accepts exactly the maximum (100)", () => {
    expect(validateQuantity(100)).toBe(true)
  })

  it("rejects one past the maximum (101)", () => {
    expect(validateQuantity(101)).toBe(false)
  })

  it("rejects a negative quantity", () => {
    expect(validateQuantity(-1)).toBe(false)
  })
})

describe("applyDiscount - boundaries", () => {
  it("accepts exactly 0% discount (price unchanged)", () => {
    expect(applyDiscount(100, 0)).toBe(100)
  })

  it("accepts exactly 100% discount (price becomes free)", () => {
    expect(applyDiscount(100, 100)).toBe(0)
  })

  it("rejects a discount just past 100%", () => {
    expect(() => applyDiscount(100, 100.01)).toThrow(RangeError)
  })

  it("accepts a price of exactly 0 (a free item)", () => {
    expect(applyDiscount(0, 50)).toBe(0)
  })

  it("rejects a negative discount percent", () => {
    expect(() => applyDiscount(100, -1)).toThrow(RangeError)
  })
})

describe("calculateTotal - boundaries", () => {
  it("returns 0 for a completely empty cart", () => {
    // An empty array is a boundary in its own right - reduce()'s initial
    // value (0) is what makes this work, but it's exactly the kind of
    // case that's easy to forget to test since it involves no items to
    // reason about at all.
    expect(calculateTotal([])).toBe(0)
  })

  it("handles a single-item cart (the smallest non-empty case)", () => {
    expect(calculateTotal([{ name: "Pen", price: 1, quantity: 1 }])).toBe(1)
  })

  it("rejects an item at the quantity boundary (101) even among otherwise-valid items", () => {
    const items = [
      { name: "Valid", price: 10, quantity: 1 },
      { name: "Invalid", price: 10, quantity: 101 },
    ]
    expect(() => calculateTotal(items)).toThrow(RangeError)
  })
})
