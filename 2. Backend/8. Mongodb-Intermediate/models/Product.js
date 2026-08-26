const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    minlength: [3, "Product name must be at least 3 characters"],
    maxlength: [50, "Product name cannot exceed 50 characters"],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Electronics", "Sports", "Books", "Clothing"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  tags: [String],
  description: String,
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviews: [
    {
      user: String,
      comment: String,
      rating: Number,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  quantity: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
});

// INDEXING:

// Think of a MongoDB collection like a huge book.
// * Without index → MongoDB scans every page (slow ❌)
// * With index → MongoDB uses a table of contents (fast ✅)

// So, index = speed optimization for queries

// Single field index for faster queries
ProductSchema.index({ name: 1 });         // name: 1 → Sort all product names alphabetically and build an index on it
ProductSchema.index({ category: 1 });

// Compound index: Index on both fields together and faster than using two separate indexes
ProductSchema.index({ category: 1, price: 1 });       

// Text index for full-text search: Search like Google and finds words inside text fields
ProductSchema.index({ name: "text", description: "text" });       

// Sparse index: Only indexes documents that have this(rating) field which saves space and avoids indexing null/undefined values
ProductSchema.index({ rating: 1 }, { sparse: true });

// TTL index: Auto-delete documents after 30 days if expiresAt is set for temporary products, offers, or sessions
ProductSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


// Q. Why should querying (filtering/searching) be done in the database instead of handling it in Express? Explain with an example.
// Ans - In a backend system, querying operations like filtering, searching, and sorting should be handled by the database (e.g., MongoDB) rather than in Express because 
// databases are optimized for efficient data retrieval using indexing and query engines.

// Explanation: Consider an e-commerce platform like Amazon, which stores millions of products.



// ❌ Approach 1: Filtering in Express (Inefficient)

// const products = await Product.find();         // fetch all products

// const filtered = products.filter(p => 
//   p.category === "Electronics" && p.price < 50000
// );


// Problems:
// * Fetches all records from the database
// * High memory usage in server
// * Slower performance (O(n))
// * Not scalable for large datasets

// 👉 This is like checking every product in a warehouse manually.



// ✅ Approach 2: Querying in MongoDB (Efficient):

// Product.find({
//   category: "Electronics",
//   price: { $lt: 50000 }
// });


// Advantages:
// * Uses indexes (e.g., compound index { category: 1, price: 1 })
// * Faster search (O(log n))
// * Only required data is returned
// * Less memory usage in Express
// * Scalable for millions of records

// 👉 This is like directly going to the correct section in a warehouse.







// MIDDLEWARE HOOKS (PRE & POST):

// Pre-save hook for validation and transformation: Used before Saving, Fetching, Updating, Deleting data
ProductSchema.pre("save", function (next) {
  // Update the updatedAt timestamp before saving
  this.updatedAt = Date.now();
  
  // Auto-calculate inStock based on quantity
  if (this.quantity > 0) {
    this.inStock = true;
  } else {
    this.inStock = false;
  }

  next();
});

// Q. Why use pre-hook?
// Ans - pre - run this BEFORE something happens

// Without pre hook: ❌
// Your saved data becomes:

// {
//   name: "iPhone",
//   quantity: 5
// }

// 👉 Problems:

// * No inStock → frontend doesn’t know if available
// * No updatedAt → no tracking
// * You must manually write logic everywhere 😓


// With pre hook✅:

// ProductSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   this.inStock = this.quantity > 0;
//   next();
// });

// Now SAME CODE:
// await product.save();

// 👉 Automatically becomes:

// {
//   name: "iPhone",
//   quantity: 5,
//   inStock: true,
//   updatedAt: 1713340000000
// }

// ADVANTAGES:
// * Centralized logic (DRY code)
// * Data consistency (always correct)
// * Cleaner Code:

// Instead of this everywhere:

// product.inStock = product.quantity > 0;
// product.updatedAt = Date.now();

// 👉 You just write:
// await product.save();



// Post-save hook for logging
ProductSchema.post("save", function (doc) {
  console.log(`✅ Product saved: ${doc.name}`);
});


// Pre-find hook to exclude certain fields
ProductSchema.pre(/^find/, function (next) {
  // This runs before any find query
  // Example: you could exclude sensitive fields
  next();
});



// CUSTOM/INSTANCE METHODS: 
ProductSchema.methods.decreaseStock = function (amount) {
  this.quantity -= amount;
  return this.save();
};

ProductSchema.methods.increaseStock = function (amount) {
  this.quantity += amount;
  return this.save();
};

// EXAMPLE:
// User buys 2 iPhones.

// Without method:
// product.quantity -= 2;
// await product.save();

// ✅ With method:
// await product.decreaseStock(2);

// ADVANTAGES:
// * Cleaner code
// * Centralized logic



// STATIC METHODS:
ProductSchema.statics.findByCategory = function (category) {
  return this.find({ category });
};

ProductSchema.statics.findInStock = function () {
  return this.find({ inStock: true });
};

ProductSchema.statics.findExpensive = function (minPrice) {
  return this.find({ price: { $gte: minPrice } });
};

// EXAMPLE:
// Without static ❌
// Product.find({ category: "Electronics" });

// With static ✅
// Product.findByCategory("Electronics");

// ADVANTAGES:
// * Readable, Reusable in homepage, filters, APIs

module.exports = mongoose.model("Product", ProductSchema);
