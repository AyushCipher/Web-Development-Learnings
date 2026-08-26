import mongoose from "mongoose"

const cartItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 100 },
  },
  { timestamps: true }
)

export const CartItem = mongoose.model("CartItem", cartItemSchema)
