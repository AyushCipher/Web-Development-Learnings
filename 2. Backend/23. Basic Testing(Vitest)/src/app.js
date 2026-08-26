// The Express app itself, WITHOUT calling .listen(). See server.js for why
// that split matters - it's the single thing that makes both integration
// tests (supertest, in-memory) and E2E tests (a real running server) able
// to reuse the exact same route/middleware code.
import express from "express"
import { CartItem } from "./models/CartItem.js"
import { calculateTotal, validateQuantity } from "./cart.js"

export const app = express()
app.use(express.json())

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// POST /api/cart - add an item
app.post("/api/cart", async (req, res) => {
  const { name, price, quantity } = req.body

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" })
  }
  if (typeof price !== "number" || price < 0) {
    return res.status(400).json({ error: "price must be a non-negative number" })
  }
  if (!validateQuantity(quantity)) {
    return res.status(400).json({ error: "quantity must be an integer between 1 and 100" })
  }

  const item = await CartItem.create({ name, price, quantity })
  return res.status(201).json(item)
})

// GET /api/cart - list all items + computed total (optionally discounted
// via ?discount=10)
app.get("/api/cart", async (req, res) => {
  const items = await CartItem.find().lean()
  const discountPercent = req.query.discount ? Number(req.query.discount) : 0

  if (Number.isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    return res.status(400).json({ error: "discount must be a number between 0 and 100" })
  }

  const total = items.length === 0 ? 0 : calculateTotal(items, discountPercent)
  return res.status(200).json({ items, total })
})

// PATCH /api/cart/:id - update an item's quantity
app.patch("/api/cart/:id", async (req, res) => {
  const { quantity } = req.body

  if (!validateQuantity(quantity)) {
    return res.status(400).json({ error: "quantity must be an integer between 1 and 100" })
  }

  const item = await CartItem.findByIdAndUpdate(
    req.params.id,
    { quantity },
    { new: true }
  )

  if (!item) {
    return res.status(404).json({ error: "item not found" })
  }
  return res.status(200).json(item)
})

// DELETE /api/cart/:id - remove an item
app.delete("/api/cart/:id", async (req, res) => {
  const item = await CartItem.findByIdAndDelete(req.params.id)
  if (!item) {
    return res.status(404).json({ error: "item not found" })
  }
  return res.status(200).json({ message: "item removed" })
})
