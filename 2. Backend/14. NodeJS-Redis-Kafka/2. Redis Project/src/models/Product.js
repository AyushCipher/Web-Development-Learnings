const mongoose = require("mongoose");

// Plain Mongoose schema - nothing Redis-specific here; caching of these
// documents happens in the controller (cache-aside), not the model.
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
