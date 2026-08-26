// Q. WHY DOES THIS MODEL EXIST SEPARATELY FROM config/database.js's User
//    MODEL?
// ANS: database.js's User model was already fully built (indexes,
// timestamps, the works) but genuinely unused - example-routes.js's /api/
// items handlers had "// TODO: Save to database" instead of any model at
// all. There was no Item model anywhere to reuse, unlike auth which could
// reuse the existing User model - this file is the missing piece, shaped
// to match utils/validators.js's validateItemCreation schema exactly
// (title, description, category, price, stock) so validated request
// bodies map straight onto it with no field-name mismatches.
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 5, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    category: {
      type: String,
      required: true,
      enum: ["electronics", "clothing", "books", "food", "other"],
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
