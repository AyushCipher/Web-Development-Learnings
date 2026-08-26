# MongoDB Intermediate Concepts Guide

## Overview
This project covers essential MongoDB concepts for developers and technical interviews. It includes practical examples for:
- Indexing & Query Optimization
- Aggregation Pipeline
- Population & References
- Transactions
- Bulk Operations
- Pagination & Sorting
- Text Search
- Middleware Hooks
- Validation
- Performance Optimization

---

## 1. INDEXING (Index Strategy)

### Single Field Index
```javascript
// Creates index on 'name' field for faster queries
ProductSchema.index({ name: 1 }); // 1 = ascending
ProductSchema.index({ rating: 1 }); // ascending order
ProductSchema.index({ createdAt: -1 }); // -1 = descending
```

**Why Indexing?**
- Dramatically faster query execution
- Reduces disk reads
- Makes sorting faster
- Trade-off: slower writes (because index must be updated)

### Compound Index (Multiple Fields)
```javascript
// Index on category AND price - for queries filtering both
ProductSchema.index({ category: 1, price: 1 });
BookSchema.index({ author: 1, publishYear: -1 });
```

**When to use:**
- When you frequently query multiple fields together
- Left-to-right matching: First filter by category, then price

### Text Index (Full-Text Search)
```javascript
ProductSchema.index({ name: "text", description: "text" });
```

**Usage:**
```javascript
// Search across name and description
await Product.find({ $text: { $search: "laptop computer" } })
```

### Sparse Index
```javascript
ProductSchema.index({ rating: 1 }, { sparse: true });
ProductSchema.index({ email: 1 }, { sparse: true });
```

**Purpose:** Only indexes documents that have this field. Allows multiple null/missing values.

### TTL Index (Time-To-Live)
```javascript
ProductSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

**Purpose:** Automatically delete documents after specified time. Great for:
- Session data
- Temporary records
- Cache cleanup

### Unique Index
```javascript
AuthorSchema.index({ email: 1 }, { unique: true, sparse: true });
```

**Purpose:** Ensures no duplicate values in field. `sparse: true` allows multiple null values.

---

## 2. AGGREGATION PIPELINE (Data Processing)

### Basic Pipeline Structure
```javascript
await Product.aggregate([
  { $match: {...} },      // Filter (WHERE clause)
  { $group: {...} },      // Group & aggregate
  { $project: {...} },    // Select/transform fields
  { $sort: {...} },       // Sort results
  { $limit: 10 }          // Limit results
]);
```

### Common Aggregation Stages

#### $match - Filter documents
```javascript
{ $match: { price: { $gte: 100 }, inStock: true } }
```

#### $group - Aggregate by field
```javascript
{
  $group: {
    _id: "$category",           // Group by category
    avgPrice: { $avg: "$price" },
    count: { $sum: 1 },
    totalRevenue: { $sum: "$price" }
  }
}
```

#### $project - Select/transform fields
```javascript
{
  $project: {
    _id: 0,
    productName: "$name",
    priceRange: { $subtract: ["$maxPrice", "$minPrice"] },
    inStock: 1
  }
}
```

#### $sort - Sort results
```javascript
{ $sort: { avgPrice: -1, count: 1 } } // Sort by avgPrice desc, then count asc
```

#### $limit - Limit documents
```javascript
{ $limit: 10 } // Return only 10 documents
```

#### $skip - Skip documents
```javascript
{ $skip: 20 } // Skip first 20, useful for pagination
```

#### $lookup - Join with other collections
```javascript
{
  $lookup: {
    from: "authors",
    localField: "author",
    foreignField: "_id",
    as: "authorDetails"
  }
}
```

---

## 3. POPULATION (References)

### One-to-One Reference
```javascript
const BookSchema = {
  title: String,
  author: { type: ObjectId, ref: "Author" }  // Single reference
};

// Get book with author details
const book = await Book.findById(id).populate("author");
```

### One-to-Many (Implicit in MongoDB)
```javascript
const AuthorSchema = {
  name: String,
  // Books are in separate collection with author reference
};

const BookSchema = {
  author: { type: ObjectId, ref: "Author" }
};

// Get all books by author
const books = await Book.find({ author: authorId });
```

### Multiple Levels of Population
```javascript
// If Author has Publisher reference:
const books = await Book.find()
  .populate({
    path: "author",
    populate: {
      path: "publisher"
    }
  });
```

---

## 4. TRANSACTIONS (ACID Guarantee)

### Why Transactions?
In MongoDB, transactions ensure that multiple operations either ALL succeed or ALL fail (atomicity).

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Multiple operations that must succeed together
  await Book.updateOne({ _id: bookId }, { stock: -1 }, { session });
  await BorrowRecord.create([{ userId, bookId }], { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction(); // Roll back all changes
  throw error;
} finally {
  session.endSession();
}
```

**Real-world example:** Money transfer between accounts
- Debit from Account A AND Credit to Account B must both happen
- If either fails, both revert

---

## 5. PAGINATION & SORTING

### Pagination (Critical for Large Datasets)
```javascript
const page = 2, limit = 10;
const skip = (page - 1) * limit; // Skip first 10 records

const products = await Product.find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });

// Response includes pagination metadata
{
  data: [...],
  pagination: {
    currentPage: 2,
    totalPages: 50,
    totalProducts: 500,
    hasNextPage: true,
    hasPrevPage: true
  }
}
```

### Sorting Options
```javascript
.sort({ price: 1 })          // Ascending
.sort({ price: -1 })         // Descending
.sort({ category: 1, price: -1 }) // Multiple fields
```

---

## 6. TEXT SEARCH (Full-Text Search)

```javascript
// Create text index
ProductSchema.index({ name: "text", description: "text" });

// Search with relevance scoring
const results = await Product.find(
  { $text: { $search: "laptop computer" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } });
```

**Operators:**
- `"laptop computer"` - Search for both words
- `"laptop -computer"` - Search laptop but exclude computer
- `"exact phrase"` - Search exact phrase

---

## 7. MIDDLEWARE HOOKS (Pre & Post Hooks)

### Pre-Save Hook (Before saving)
```javascript
ProductSchema.pre("save", function(next) {
  // Update timestamp before saving
  this.updatedAt = Date.now();
  
  // Auto-calculate fields
  if (this.quantity > 0) {
    this.inStock = true;
  }
  
  next(); // Continue to save
});
```

### Post-Save Hook (After saving)
```javascript
ProductSchema.post("save", function(doc) {
  console.log(`Product saved: ${doc.name}`);
  // Good for: logging, notifications, cache invalidation
});
```

### Pre-Find Hook (Before queries)
```javascript
ProductSchema.pre(/^find/, function(next) {
  // This runs before any find/findById/findByIdAndUpdate etc.
  // Good for: filtering sensitive data
  next();
});
```

---

## 8. VALIDATION (Schema Validation)

```javascript
const ProductSchema = {
  name: {
    type: String,
    required: [true, "Product name is required"],
    minlength: [3, "Name must be at least 3 chars"],
    maxlength: [50, "Name cannot exceed 50 chars"],
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"]
  },
  category: {
    type: String,
    enum: ["Electronics", "Sports", "Books"],
    required: true
  },
  email: {
    type: String,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email regex
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  }
};
```

---

## 9. BULK OPERATIONS (Batch Processing)

### insertMany - Insert Multiple Documents
```javascript
const products = await Product.insertMany([
  { name: "Laptop", price: 999 },
  { name: "Mouse", price: 25 }
]);
```

### bulkWrite - Complex Batch Operations
```javascript
const bulkOps = [
  {
    updateOne: {
      filter: { category: "Electronics" },
      update: { $mul: { price: 1.1 } } // Increase by 10%
    }
  },
  {
    updateMany: {
      filter: { stock: { $lt: 5 } },
      update: { $set: { lowStock: true } }
    }
  },
  {
    deleteMany: {
      filter: { archived: true }
    }
  }
];

const result = await Product.bulkWrite(bulkOps);
```

**Benefits:**
- Much faster than individual operations
- Atomic at operation level
- Reduces network roundtrips

---

## 10. PERFORMANCE OPTIMIZATION

### Lean Queries
```javascript
// Returns plain JavaScript objects (not Mongoose documents)
// Much faster when you only need to read
const products = await Product.find().lean().limit(100);

// Cannot modify and save
// products[0].save() // Error!
```

**When to use:** Reading data, not modifying

### Projections (Select Specific Fields)
```javascript
// Only fetch needed fields
await Product.find()
  .select("name price category") // Include these
  .exclude("description reviews") // Exclude these
```

**Benefits:**
- Reduces data transfer
- Faster queries
- Less memory usage

### Query Explanation (Analyze Performance)
```javascript
const explanation = await Product.find({ category: "Electronics" })
  .explain("executionStats");

console.log({
  docsScanned: explanation.executionStats.totalDocsExamined,
  docsReturned: explanation.executionStats.nReturned,
  indexUsed: explanation.executionStats.executionStages.stage !== "COLLSCAN"
});
```

---

## 11. CUSTOM METHODS (Schema Methods)

### Instance Methods (Called on document)
```javascript
ProductSchema.methods.decreaseStock = function(amount) {
  this.quantity -= amount;
  return this.save();
};

const product = await Product.findById(id);
await product.decreaseStock(5);
```

### Static Methods (Called on Model)
```javascript
ProductSchema.statics.findByCategory = function(category) {
  return this.find({ category });
};

const products = await Product.findByCategory("Electronics");
```

---

## 12. QUERY OPERATORS

### Comparison Operators
```javascript
{ price: { $eq: 100 } }      // Equal
{ price: { $ne: 100 } }      // Not equal
{ price: { $gt: 100 } }      // Greater than
{ price: { $gte: 100 } }     // Greater than or equal
{ price: { $lt: 100 } }      // Less than
{ price: { $lte: 100 } }     // Less than or equal
```

### Logical Operators
```javascript
{ $and: [{ price: { $gt: 100 } }, { inStock: true }] }
{ $or: [{ category: "Books" }, { category: "Electronics" }] }
{ $not: { price: { $gt: 100 } } }
```

### Array Operators
```javascript
{ tags: { $in: ["tech", "gadgets"] } }      // Tag is in array
{ tags: { $nin: ["clearance", "refund"] } } // Tag is not in array
{ tags: { $all: ["tech", "gadgets"] } }     // Has all tags
{ $push: { tags: "new-tag" } }              // Add to array
{ $pull: { tags: "old-tag" } }              // Remove from array
```

---

## 13. UPSERT (Update or Insert)

```javascript
const result = await Product.findOneAndUpdate(
  { name: "Laptop" },                    // Filter
  { $set: { price: 999, category: "Electronics" } },
  {
    upsert: true,      // Create if not found
    new: true,         // Return updated document
    runValidators: true // Run schema validation
  }
);
```

**Use cases:**
- Sync operations
- Idempotent updates
- Handling duplicates

---

## 14. DISTINCT (Get Unique Values)

```javascript
const categories = await Product.distinct("category");
// Returns: ["Electronics", "Sports", "Books"]

const priceRanges = await Product.distinct("price", { inStock: true });
```

---

## API ENDPOINTS GUIDE

### Products
- `POST /products/add` - Insert sample products
- `GET /products/stats` - Get product statistics
- `GET /products/analysis` - Complex analysis
- `GET /products/paginated?page=1&limit=10` - Pagination
- `GET /products/search?q=laptop` - Text search
- `GET /products/filter?minPrice=100&category=Electronics` - Filtering
- `GET /products/fast` - Optimized query
- `POST /products/bulk-update` - Bulk operations
- `POST /products/upsert` - Upsert operation
- `GET /products/categories/distinct` - Distinct categories

### Books
- `POST /reference/author` - Create author
- `POST /reference/book` - Create book
- `GET /reference/book/:id` - Get book with author (populate)
- `POST /reference/borrow` - Borrow book (transaction)
- `POST /reference/return` - Return book (transaction)
- `GET /reference/stats/author-books` - Author stats (aggregation)
- `GET /reference/search?q=title` - Search books
- `GET /reference/paginated` - Pagination
- `POST /reference/bulk-update` - Bulk operations

---

## INTERVIEW TIPS

### Common Questions & Answers

**Q1: What's the difference between embedding and referencing?**
- **Embedding:** Include related data inside the document (good for small, frequently accessed data)
- **Referencing:** Store ID of related document (good for large, independent documents)

**Q2: When should I use transactions?**
- When multiple operations must succeed or fail together
- Example: Money transfer, inventory updates across orders

**Q3: How to improve query performance?**
- Create indexes on frequently queried fields
- Use projections to select only needed fields
- Use lean() for read-only operations
- Avoid N+1 queries, use populate()

**Q4: What's the difference between $push and $addToSet?**
- `$push`: Adds element even if duplicate exists
- `$addToSet`: Adds only if element doesn't exist

**Q5: Explain aggregation pipeline stages:**
- $match: Filter documents
- $group: Group and aggregate
- $project: Reshape documents
- $sort: Sort results
- $limit: Limit results
- $lookup: Join collections

**Q6: What's the purpose of middleware hooks?**
- Pre hooks: Validate/transform data before saving
- Post hooks: Execute code after operation (logging, notifications)

---

## BEST PRACTICES

1. **Always index frequently queried fields**
2. **Use pagination for large datasets**
3. **Use lean() for read-only queries**
4. **Use transactions for multi-document operations**
5. **Validate data at schema level**
6. **Use meaningful error messages**
7. **Handle errors properly in async operations**
8. **Use bulk operations for batch processing**
9. **Monitor query performance with explain()**
10. **Keep documents reasonably sized** (avoid massive documents)

---

## RESOURCES

- MongoDB Documentation: https://docs.mongodb.com
- Mongoose Documentation: https://mongoosejs.com
- MongoDB University: https://university.mongodb.com
