// END-TO-END (E2E) TESTS
//
// Q. HOW IS THIS ACTUALLY DIFFERENT FROM THE INTEGRATION TESTS, WHICH ALSO
//    HIT REAL ROUTES AND A REAL DATABASE?
// ANS: Two things integration tests skip on purpose, this file adds back:
// 1. A REAL SERVER, REAL PORT, REAL HTTP. beforeAll below calls
//    app.listen() itself and every request uses fetch() against
//    http://localhost:<port>/... - actual TCP sockets, actual HTTP
//    parsing, the same as a real client hitting a real deployment (see
//    22. Deployment's own README for exactly this kind of "hit it from
//    outside" verification, just automated here instead of done by hand
//    with curl).
// 2. A COMPLETE USER JOURNEY ACROSS MULTIPLE REQUESTS, not one request
//    per test. Integration tests each check one route in isolation (does
//    POST work, does GET work); this file chains requests the way a real
//    client actually would - add an item, then another, then check the
//    total reflects both, then remove one, then confirm the total updated
//    - because bugs can hide specifically in the SEQUENCE of operations
//    even when each individual endpoint is independently correct.
//
// Q. WHY IS THIS THE SLOWEST, LEAST-USED TEST TYPE OF THE FOUR IN THIS
//    FOLDER?
// ANS: Real network calls and real process startup cost real time (this
// single file takes noticeably longer to run than all the unit + boundary
// tests combined), and a failure here is the hardest to localize - "the
// full journey broke somewhere" tells you less than a failing unit test
// naming the exact function. The common real-world practice this
// reflects: many fast, precise unit/boundary tests; fewer, broader
// integration tests; a SMALL number of E2E tests covering only the
// most critical user journeys - not everything, since E2E coverage is
// the most expensive to write and maintain.
//
// Q. WHY E2E_MONGODB_URI HERE INSTEAD OF THE SAME TEST_MONGODB_URI THE
//    INTEGRATION TESTS USE?
// ANS: Found by actually running this suite, not by inspection - Vitest
// runs different test FILES in parallel by default. With both files
// pointed at one shared database, this file's multi-step journey (add,
// add, check, update, remove) could have its data wiped mid-test by the
// integration file's own deleteMany/dropDatabase cleanup running at the
// same time, or vice versa - producing exactly the kind of flaky,
// order-dependent failure ("expected 2 items, got 1") that's genuinely
// confusing to debug because the test's OWN logic is correct. A separate
// database per test file is what actually fixes the shared-state problem,
// rather than papering over it by forcing tests to run one at a time.
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import mongoose from "mongoose"
import dotenv from "dotenv"
import { app } from "../../src/app.js"
import { CartItem } from "../../src/models/CartItem.js"

dotenv.config()

const port = 4101 // separate from PORT in .env, so this can run alongside `npm run dev` without a port clash
const baseUrl = `http://localhost:${port}`
let server

beforeAll(async () => {
  await mongoose.connect(process.env.E2E_MONGODB_URI)
  await CartItem.deleteMany({})

  // Q. WHY app.listen() DIRECTLY HERE INSTEAD OF IMPORTING/RUNNING
  //    src/server.js?
  // ANS: server.js calls dotenv.config() and connects to Mongo itself too
  // - running it as-is from a test would mean two separate, redundant
  // Mongo connections and no clean way for this file to control exactly
  // when the server starts and stops. Reusing the same `app` export
  // directly and managing its lifecycle here keeps this test in charge of
  // setup/teardown, matching the beforeAll/afterAll pattern the rest of
  // this suite uses.
  await new Promise((resolve) => {
    server = app.listen(port, resolve)
  })
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
  await new Promise((resolve) => server.close(resolve))
})

describe("full cart journey over real HTTP", () => {
  it("walks through add -> add another -> check total -> update -> remove -> confirm empty", async () => {
    // 1. Add the first item.
    const addNotebook = await fetch(`${baseUrl}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Notebook", price: 5, quantity: 2 }),
    })
    expect(addNotebook.status).toBe(201)
    const notebook = await addNotebook.json()

    // 2. Add a second item.
    const addPen = await fetch(`${baseUrl}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Pen", price: 1.5, quantity: 3 }),
    })
    expect(addPen.status).toBe(201)

    // 3. The cart total should reflect BOTH items - this is the kind of
    // check that specifically requires the earlier requests to have
    // actually persisted, which is exactly what makes this a multi-step
    // journey rather than two unrelated single-request tests.
    const cartAfterAdds = await fetch(`${baseUrl}/api/cart`).then((r) => r.json())
    expect(cartAfterAdds.items).toHaveLength(2)
    expect(cartAfterAdds.total).toBe(14.5) // 5*2 + 1.5*3

    // 4. Update the notebook's quantity.
    const update = await fetch(`${baseUrl}/api/cart/${notebook._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 1 }),
    })
    expect(update.status).toBe(200)

    const cartAfterUpdate = await fetch(`${baseUrl}/api/cart`).then((r) => r.json())
    expect(cartAfterUpdate.total).toBe(9.5) // 5*1 + 1.5*3

    // 5. Remove the notebook entirely.
    const remove = await fetch(`${baseUrl}/api/cart/${notebook._id}`, { method: "DELETE" })
    expect(remove.status).toBe(200)

    // 6. Only the pen should remain.
    const cartFinal = await fetch(`${baseUrl}/api/cart`).then((r) => r.json())
    expect(cartFinal.items).toHaveLength(1)
    expect(cartFinal.items[0].name).toBe("Pen")
    expect(cartFinal.total).toBe(4.5)
  })

  it("confirms the server is reachable at all via /health, before trusting any of the above", async () => {
    // Not strictly needed given the journey test above already proves
    // the server works, but this is the same "sanity check the thing is
    // even up" pattern used for real deployments (see 22. Deployment's
    // /health route) - worth having as its own fast, obvious-failure
    // test rather than only ever discovering "the server didn't start"
    // via a confusing failure three steps into the journey test.
    const response = await fetch(`${baseUrl}/health`)
    expect(response.status).toBe(200)
  })
})
