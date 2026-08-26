# Express MVC - MongoDB Query Methods Guide

## Project Structure

```
express-intermediate/
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── User.js              # User schema with posts reference
│   └── Post.js              # Post schema with user reference
├── controllers/
│   ├── userController.js    # All user queries
│   └── postController.js    # All post queries with .populate() examples
├── routes/
│   ├── userRoutes.js        # User endpoints
│   └── postRoutes.js        # Post endpoints
├── server.js                # Express server setup
├── package.json
└── README.md
```

---

## 🎯 Core MongoDB Queries for Interviews

### 1️⃣ .find() → Get Multiple Documents

**Used when:** Fetching list of data

**Returns:** Array of documents

**Key Points:**
- Can filter data
- Most used in APIs
- Always returns an array (empty if no match)

```javascript
// Example: Get all users over 18
const users = await User.find({ age: { $gt: 18 } });

// Get all users
const allUsers = await User.find();

// Get with condition
const activeUsers = await User.find({ isActive: true });
```

**Interview Tip:** Explain that `.find()` always returns an array, even for single or zero results.

---

### 2️⃣ .findOne() → Get Single Document

**Used when:** Fetch one record

**Returns:** Single object or null (NOT an array)

**Key Points:**
- Returns single object, not array
- Faster than `.find()` when only one needed
- Returns null if not found

```javascript
// Example: Get user by email
const user = await User.findOne({ email: "test@gmail.com" });

// Check if user exists
if (user) {
  console.log(user.name);
} else {
  console.log("User not found");
}
```

**Interview Tip:** `.findOne()` vs `.find().limit(1)` - `.findOne()` is cleaner for single document queries.

---

### 3️⃣ .findById() → Get by ID

**Used when:** Fetch using `_id`

**Returns:** Single document or null

**Key Points:**
- Most efficient for ID-based queries
- Specifically optimized for ObjectId
- Used in `/api/users/:id` routes

```javascript
// Example: Get user by ObjectId
const user = await User.findById(req.params.id);

// With error handling
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}
```

**Interview Tip:** MongoDB automatically indexes `_id`, so `.findById()` is always fast.

---

### 4️⃣ .findOneAndUpdate() ⭐ MOST IMPORTANT FOR INTERVIEWS

**Used when:** Find and update in ONE operation

**Returns:** Updated document (if `new: true`)

**Key Points:**
- Atomic operation (safe for concurrent updates)
- `new: true` returns updated document
- `runValidators: true` validates schema

```javascript
// Example: Update user email
const user = await User.findOneAndUpdate(
  { email: "old@gmail.com" },
  { name: "Updated Name" },
  { 
    new: true,              // ✅ Returns updated doc
    runValidators: true     // ✅ Runs schema validators
  }
);
```

**Why it's important for interviews:**
- Shows understanding of atomic operations
- Demonstrates knowledge of options
- Common real-world scenario

---

### 5️⃣ .findByIdAndUpdate() → Update by ID

**Used when:** Update document by its ID

**Similar to:** `.findOneAndUpdate()` but specifically for `_id`

```javascript
// Example: Update user age
const user = await User.findByIdAndUpdate(
  req.params.id,
  { age: 25 },
  { 
    new: true,
    runValidators: true
  }
);
```

---

### ➕ 8️⃣ .create() → Insert Data

**Used when:** Create new document directly

**Returns:** Created document with `_id`

**Key Points:**
- Direct insertion without instance
- Automatically validates schema
- Faster for single inserts

```javascript
// Example: Create user
const user = await User.create({
  name: "Ayush",
  email: "test@gmail.com",
  age: 20
});

console.log(user._id); // Auto-generated ID
```

**vs .save():**
- `.create()` → Direct, concise
- `.save()` → Instance-based, more control

---

### 💾 9️⃣ .save() → Save Instance

**Used when:** Need to create and modify before saving

**Returns:** Saved document

```javascript
// Example: Create with modifications
const user = new User({
  name: "Ayush",
  email: "test@gmail.com"
});

// Modify before saving
user.age = 20;

// Save to database
await user.save();
```

**When to use `.save()`:**
- Pre-save hooks needed
- Complex validation
- Transaction support

---

### 📊 1️⃣0️⃣ .countDocuments()

**Used when:** Count matching documents

**Returns:** Number

```javascript
// Example: Count users over 18
const count = await User.countDocuments({ age: { $gt: 18 } });

// Count all
const totalUsers = await User.countDocuments();
```

**Interview Tip:** Useful for pagination calculations and analytics.

---

### 🔍 1️⃣1️⃣ .select() → Choose Fields

**Used when:** Retrieve only specific fields

**Key Points:**
- Improves query performance
- `.select("name email")` → Include only these
- `.select("-password")` → Exclude password

```javascript
// Include fields
const users = await User.find().select("name email");

// Exclude fields
const users = await User.find().select("-password -age");

// Combine
const users = await User.find().select("name email -_id");
```

**Interview Tip:** Mention security (e.g., never send passwords) and performance.

---

### 📦 1️⃣2️⃣ .limit() & .skip() → Pagination

**Used when:** Implement pagination

**Key Points:**
- `.skip(n)` → Skip first n documents
- `.limit(n)` → Return only n documents
- Always use together for pagination

```javascript
// Example: Get page 2 with 5 items per page
const page = 2;
const pageSize = 5;
const skip = (page - 1) * pageSize;

const users = await User.find()
  .skip(skip)        // Skip: 5
  .limit(pageSize);  // Limit: 5 (returns items 6-10)
```

**Real-world formula:**
```javascript
skip = (pageNumber - 1) * pageSize
```

---

### 🔃 1️⃣3️⃣ .sort() → Sort Results

**Used when:** Sort query results

**Key Points:**
- `1` → Ascending (A-Z, 0-9)
- `-1` → Descending (Z-A, 9-0)

```javascript
// Sort by newest first
const users = await User.find().sort({ createdAt: -1 });

// Sort by age ascending
const users = await User.find().sort({ age: 1 });

// Multiple sort fields
const users = await User.find().sort({ age: 1, name: 1 });
```

---

### 🔗 1️⃣4️⃣ .populate() → Reference Data ⭐ VERY IMPORTANT

**Used when:** Need foreign key relationships (like SQL JOIN)

**Returns:** Referenced documents instead of IDs

**Key Points:**
- Requires schema with `ref` to another collection
- Essential for relationships
- Can select specific fields

```javascript
// Schema definition (User has posts)
const userSchema = new Schema({
  name: String,
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'  // Reference
  }]
});

// Usage: Get user with actual post documents
const user = await User.findById(id).populate('posts');

// Populate specific fields only
const user = await User.findById(id).populate('posts', 'title content');

// Nested populate
const user = await User.findById(id)
  .populate({
    path: 'posts',
    populate: { path: 'comments' }
  });
```

**Interview Tip:** Explain when you'd use populate vs separate queries.

---

### ⚡ 1️⃣5️⃣ .lean() → Performance Optimization

**Used when:** Need speed, don't need instance methods

**Returns:** Plain JavaScript objects (NOT Mongoose documents)

**Key Points:**
- Significantly faster for large datasets
- Cannot use model instance methods
- Good for read-only queries

```javascript
// Lean query (fast)
const users = await User.find().lean();

// vs Normal query
const users = await User.find();

// Can chain with other methods
const users = await User.find()
  .select('name email')
  .sort({ createdAt: -1 })
  .lean();
```

**Performance Impact:**
- Large queries: ~30% faster with `.lean()`
- API responses: Recommended for list endpoints

---

### 🔥 1️⃣6️⃣ .updateOne() / .updateMany()

**Used when:** Update without returning document

**Key Points:**
- `.updateOne()` → Update first matching
- `.updateMany()` → Update all matching
- Faster than `.findAndUpdate` for bulk updates

```javascript
// Update single document
await User.updateOne(
  { email: "test@gmail.com" },
  { age: 30 }
);

// Update multiple documents
await User.updateMany(
  { age: { $lt: 18 } },
  { isActive: false }
);

// Returns: { modifiedCount: n }
const result = await User.updateMany(
  { isActive: false },
  { age: 0 }
);
console.log(result.modifiedCount); // Number of updated docs
```

---

### ❌ 6️⃣ .findOneAndDelete() → Delete Single

**Used when:** Find and delete by condition

**Returns:** Deleted document

```javascript
// Delete by email
const deletedUser = await User.findOneAndDelete({ 
  email: "test@gmail.com" 
});

if (deletedUser) {
  console.log("User deleted:", deletedUser.name);
}
```

---

### 🗑️ 7️⃣ .findByIdAndDelete() → Delete by ID

**Used when:** Delete by ObjectId

```javascript
// Delete by ID
const deletedUser = await User.findByIdAndDelete(req.params.id);

if (!deletedUser) {
  return res.status(404).json({ error: 'User not found' });
}
```

---

### 💥 1️⃣7️⃣ .deleteOne() / .deleteMany()

**Used when:** Delete without returning document

**Key Points:**
- `.deleteOne()` → Delete first matching
- `.deleteMany()` → Delete all matching
- Faster for bulk deletions

```javascript
// Delete single
await User.deleteOne({ email: "test@gmail.com" });

// Delete multiple (all users under 18)
const result = await User.deleteMany({ age: { $lt: 18 } });
console.log(result.deletedCount); // Number of deleted docs
```

---

## 🎯 Query Chaining Pattern

All query methods can be chained:

```javascript
const users = await User.find({ age: { $gt: 18 } })
  .select('name email age')      // Select fields
  .sort({ createdAt: -1 })       // Sort
  .skip(10)                       // Pagination
  .limit(5)                       // Pagination
  .populate('posts')              // Reference data
  .lean();                        // Performance
```

---

## 📋 Common API Patterns

### Get All with Pagination & Filter
```javascript
const { page = 1, limit = 5, minAge, maxAge } = req.query;
const skip = (page - 1) * limit;

let filter = {};
if (minAge) filter.age.$gte = minAge;
if (maxAge) filter.age.$lte = maxAge;

const users = await User.find(filter)
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 })
  .lean();
```

### Get by ID with Related Data
```javascript
const user = await User.findById(req.params.id)
  .populate('posts')
  .select('-password');
```

### Update with Validation
```javascript
const user = await User.findByIdAndUpdate(
  req.params.id,
  req.body,
  { 
    new: true,
    runValidators: true
  }
);
```

---

## ✅ Interview Preparation

**Questions You Might Get:**

1. **What's the difference between `.find()` and `.findOne()`?**
   - `.find()` returns array, `.findOne()` returns object or null

2. **When would you use `.lean()`?**
   - For large read-only queries where performance matters

3. **Explain `.populate()`?**
   - Used to replace reference IDs with actual documents (like SQL JOIN)

4. **Why use `.findByIdAndUpdate()` instead of `.findOneAndUpdate()`?**
   - More semantic and slightly optimized for ID-based queries

5. **What's atomic in `.findByIdAndUpdate()`?**
   - Operation is atomic - no race conditions between find and update

6. **Pagination formula?**
   - skip = (pageNumber - 1) * pageSize

7. **Sort order: 1 vs -1?**
   - 1 = ascending, -1 = descending

---

## 🔗 Relationships Example

**User.js:**
```javascript
const userSchema = new Schema({
  name: String,
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
});
```

**Post.js:**
```javascript
const postSchema = new Schema({
  title: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' }
});
```

**Usage:**
```javascript
// Get user with all posts
const user = await User.findById(id).populate('posts');

// Get post with author details
const post = await Post.findById(id).populate('author');
```

---

## 📚 All 17 Queries At a Glance

| # | Query | Returns | Use Case |
|---|-------|---------|----------|
| 1 | `.find()` | Array | Get multiple docs |
| 2 | `.findOne()` | Object | Get single doc |
| 3 | `.findById()` | Object | Get by ID |
| 4 | `.findOneAndUpdate()` | Updated Doc | Find & update |
| 5 | `.findByIdAndUpdate()` | Updated Doc | Update by ID |
| 6 | `.findOneAndDelete()` | Deleted Doc | Delete by condition |
| 7 | `.findByIdAndDelete()` | Deleted Doc | Delete by ID |
| 8 | `.create()` | Created Doc | Insert document |
| 9 | `.save()` | Saved Doc | Save instance |
| 10 | `.countDocuments()` | Number | Count matching |
| 11 | `.select()` | Filtered Results | Choose fields |
| 12 | `.limit()` `.skip()` | Paginated Results | Pagination |
| 13 | `.sort()` | Sorted Results | Sort results |
| 14 | `.populate()` | Joined Data | Reference documents |
| 15 | `.lean()` | Plain Objects | Performance |
| 16 | `.updateOne()` `.updateMany()` | Count | Update multiple |
| 17 | `.deleteOne()` `.deleteMany()` | Count | Delete multiple |

---

## 🚀 Run This Project

```bash
# Install dependencies
npm install

# Start server
npm start

# For development (auto-reload)
npm run dev
```

Visit `http://localhost:3000/api/users` to test endpoints!

---

**Good luck with your interviews! 🎉**
