// INTEGRATION TESTS
//
// Q. WHAT'S ACTUALLY DIFFERENT HERE COMPARED TO THE UNIT TESTS?
// ANS: These tests deliberately do NOT isolate anything. A request here
// goes through the real Express route handler in src/app.js, the real
// input validation, the real Mongoose model, and a REAL MongoDB - the
// exact same code path a production request would take, minus only the
// actual TCP/HTTP layer (see the Q&A on supertest below for why that part
// specifically is skipped here and saved for the E2E tests instead). The
// question these tests answer is "do these pieces work correctly
// TOGETHER", which unit tests - each of which assumes its one function is
// already correct in isolation - cannot answer on their own. Two unit-
// tested pieces can still fail to integrate: e.g. a route that validates
// input correctly but saves the WRONG field name to Mongoose, or a schema
// whose validation is stricter than the route's own checks expect.
//
// Q. WHY A REAL MONGODB CONNECTION INSTEAD OF MOCKING MONGOOSE?
// ANS: Mocking the database is exactly what would turn this back into a
// unit test of the route handler alone - which defeats the point of an
// integration test. A mock only tells you your code calls the mock the
// way you assumed it should; it can't catch a real schema validation
// rejecting data you thought was fine, a real unique-index collision, or
// a real query returning documents in an order your code didn't expect.
// This connects to a SEPARATE database (TEST_MONGODB_URI, not the app's
// normal MONGODB_URI) specifically so these tests can freely wipe data
// between runs without any risk to real data.
//
// Q. WHY supertest INSTEAD OF app.listen() + A REAL fetch() CALL?
// ANS: supertest(app) hands Express requests directly to the app's
// request handler in-process - no real port gets bound, no real TCP
// socket opens. That's faster and avoids "is port 4100 already in use"
// flakiness between test runs, at the cost of not exercising the actual
// network stack - which is precisely the piece the E2E tests (see
// test/e2e/cartFlow.e2e.test.js) add back in.
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import request from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"
import { app } from "../../src/app.js"
import { CartItem } from "../../src/models/CartItem.js"

dotenv.config()

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI)
})

afterEach(async () => {
  // Wipe the collection between tests so each test starts from a known
  // empty state - without this, a test that creates an item would leak
  // into the next test's assertions (e.g. "expect exactly 1 item") and
  // produce failures that depend on test ORDER, one of the most confusing
  // categories of test bug to debug.
  await CartItem.deleteMany({})
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

describe("POST /api/cart", () => {
  it("creates an item and persists it to MongoDB", async () => {
    const response = await request(app)
      .post("/api/cart")
      .send({ name: "Notebook", price: 5, quantity: 2 })

    expect(response.status).toBe(201)
    expect(response.body.name).toBe("Notebook")

    // Checking the database directly (not just the HTTP response) is
    // what actually confirms integration - the route could return a
    // convincing-looking response while having saved nothing, or saved
    // something different, and an assertion on response.body alone
    // wouldn't catch that.
    const saved = await CartItem.findById(response.body._id)
    expect(saved).not.toBeNull()
    expect(saved.quantity).toBe(2)
  })

  it("rejects an invalid quantity before it ever reaches MongoDB", async () => {
    const response = await request(app)
      .post("/api/cart")
      .send({ name: "Bad Item", price: 5, quantity: 0 })

    expect(response.status).toBe(400)

    const count = await CartItem.countDocuments()
    expect(count).toBe(0)
  })
})

describe("GET /api/cart", () => {
  it("returns all items with a computed total", async () => {
    await CartItem.create([
      { name: "Notebook", price: 5, quantity: 2 },
      { name: "Pen", price: 1.5, quantity: 3 },
    ])

    const response = await request(app).get("/api/cart")

    expect(response.status).toBe(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.total).toBe(14.5)
  })

  it("applies a discount query param to the total", async () => {
    await CartItem.create({ name: "Notebook", price: 100, quantity: 1 })

    const response = await request(app).get("/api/cart?discount=20")

    expect(response.body.total).toBe(80)
  })
})

describe("PATCH /api/cart/:id", () => {
  it("updates an existing item's quantity", async () => {
    const item = await CartItem.create({ name: "Notebook", price: 5, quantity: 1 })

    const response = await request(app)
      .patch(`/api/cart/${item._id}`)
      .send({ quantity: 5 })

    expect(response.status).toBe(200)
    expect(response.body.quantity).toBe(5)
  })

  it("returns 404 for an id that doesn't exist", async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app)
      .patch(`/api/cart/${fakeId}`)
      .send({ quantity: 5 })

    expect(response.status).toBe(404)
  })
})

describe("DELETE /api/cart/:id", () => {
  it("removes an item from MongoDB", async () => {
    const item = await CartItem.create({ name: "Notebook", price: 5, quantity: 1 })

    const response = await request(app).delete(`/api/cart/${item._id}`)
    expect(response.status).toBe(200)

    const stillThere = await CartItem.findById(item._id)
    expect(stillThere).toBeNull()
  })
})
