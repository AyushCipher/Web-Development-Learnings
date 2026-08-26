# Express MVC - MongoDB Core Queries 📚

A comprehensive learning project showcasing **all 17 essential MongoDB queries** you must know for projects and interviews.

---

## 🎯 What You'll Learn

This project demonstrates:

✅ **17 Core MongoDB Queries:**
- `.find()` - Get multiple documents
- `.findOne()` - Get single document
- `.findById()` - Get by ID
- `.findOneAndUpdate()` ⭐ Most important
- `.findByIdAndUpdate()` - Update by ID
- `.findOneAndDelete()` - Delete by condition
- `.findByIdAndDelete()` - Delete by ID
- `.create()` - Insert document
- `.save()` - Save instance
- `.countDocuments()` - Count matching
- `.select()` - Choose fields
- `.limit()` `.skip()` - Pagination
- `.sort()` - Sort results
- `.populate()` ⭐ Very important
- `.lean()` - Performance optimization
- `.updateOne()` `.updateMany()` - Bulk update
- `.deleteOne()` `.deleteMany()` - Bulk delete

✅ **MVC Architecture:**
- Models (User & Post with relationships)
- Controllers (Business logic)
- Routes (API endpoints)
- Config (Database connection)

✅ **Real-World Patterns:**
- Relationships & foreign keys
- Pagination
- Filtering & sorting
- Performance optimization
- Error handling

---

## 📁 Project Structure

```
express-intermediate/
│
├── config/
│   └── db.js                    # MongoDB connection setup
│
├── models/
│   ├── User.js                  # User schema with posts reference
│   └── Post.js                  # Post schema with user reference
│
├── controllers/
│   ├── userController.js        # All user queries (1-17)
│   └── postController.js        # Post queries with .populate()
│
├── routes/
│   ├── userRoutes.js            # User API endpoints
│   └── postRoutes.js            # Post API endpoints
│
├── server.js                    # Express server setup
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
│
├── QUERIES_GUIDE.md             # 📖 Detailed query guide
├── API_TESTING.md               # 🧪 cURL & Postman examples
└── README.md                    # This file
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Create .env file
cp .env.example .env

# Update MONGO_URI in .env (use local or MongoDB Atlas)
```

### 3. Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

---

## 📚 Query Quick Reference

### Read Operations
| Query | Purpose | Returns |
|-------|---------|---------|
| `.find()` | Get multiple docs | Array |
| `.findOne()` | Get single doc | Object or null |
| `.findById()` | Get by ID | Object or null |

### Write Operations
| Query | Purpose | Returns |
|-------|---------|---------|
| `.create()` | Insert doc | Created doc |
| `.save()` | Save instance | Saved doc |

### Update Operations
| Query | Purpose | Returns |
|-------|---------|---------|
| `.findOneAndUpdate()` | Update & get doc | Updated doc |
| `.findByIdAndUpdate()` | Update by ID & get | Updated doc |
| `.updateOne()` | Update first match | { modifiedCount } |
| `.updateMany()` | Update all matches | { modifiedCount } |

### Delete Operations
| Query | Purpose | Returns |
|-------|---------|---------|
| `.findOneAndDelete()` | Delete & get doc | Deleted doc |
| `.findByIdAndDelete()` | Delete by ID & get | Deleted doc |
| `.deleteOne()` | Delete first | { deletedCount } |
| `.deleteMany()` | Delete all | { deletedCount } |

### Utility Operations
| Query | Purpose | Returns |
|-------|---------|---------|
| `.countDocuments()` | Count matching | Number |
| `.select()` | Choose fields | Query |
| `.limit()` `.skip()` | Pagination | Query |
| `.sort()` | Sort results | Query |
| `.populate()` | Reference docs | Query with populated data |
| `.lean()` | Performance | Plain objects |

---

## 🔗 API Endpoints

### User Endpoints

**CREATE:**
- `POST /api/users/create` - Create user (.create)
- `POST /api/users/create-with-save` - Create user (.save)

**READ:**
- `GET /api/users/all` - All users (.find)
- `GET /api/users/email/:email` - By email (.findOne)
- `GET /api/users/:id` - By ID (.findById)
- `GET /api/users/with-posts/:id` - With posts (.populate)
- `GET /api/users/selected/fields` - Selected fields (.select)
- `GET /api/users/fast/all` - Fast query (.lean)
- `GET /api/users/pagination/all?page=1` - Paginated (.skip, .limit)
- `GET /api/users/sorted/recent` - Sorted (.sort)
- `GET /api/users/filter/combined` - Combined filters
- `GET /api/users/count/total` - Count (.countDocuments)

**UPDATE:**
- `PUT /api/users/update-email/:email` - Update by email (.findOneAndUpdate)
- `PUT /api/users/update/:id` - Update by ID (.findByIdAndUpdate)
- `PUT /api/users/update-many/active-status` - Update multiple (.updateMany)

**DELETE:**
- `DELETE /api/users/delete-email/:email` - Delete by email (.findOneAndDelete)
- `DELETE /api/users/delete/:id` - Delete by ID (.findByIdAndDelete)
- `DELETE /api/users/delete-many/inactive` - Delete multiple (.deleteMany)

### Post Endpoints

**CREATE:**
- `POST /api/posts/create` - Create post

**READ:**
- `GET /api/posts/all` - All posts (.populate)
- `GET /api/posts/detailed/all` - Detailed view
- `GET /api/posts/:id` - By ID
- `GET /api/posts/paginated/all` - Paginated

**UPDATE:**
- `PUT /api/posts/update/:id` - Update post
- `PUT /api/posts/publish/by-author/:authorId` - Publish multiple

**DELETE:**
- `DELETE /api/posts/delete/:id` - Delete post
- `DELETE /api/posts/delete-old/unpublished` - Delete old unpublished

---

## 💻 Usage Examples

### Create User
```javascript
// Controller
const user = await User.create({
  name: "Ayush",
  email: "ayush@gmail.com",
  age: 25
});

// API
POST /api/users/create
{
  "name": "Ayush",
  "email": "ayush@gmail.com",
  "age": 25
}
```

### Get Users with Pagination
```javascript
// Controller
const page = 2;
const users = await User.find()
  .skip((page - 1) * 5)
  .limit(5)
  .sort({ createdAt: -1 });

// API
GET /api/users/pagination/all?page=2
```

### Update User
```javascript
// Controller - .findByIdAndUpdate
const user = await User.findByIdAndUpdate(
  userId,
  { age: 26 },
  { new: true, runValidators: true }
);

// API
PUT /api/users/update/userId
{ "age": 26 }
```

### Get Posts with Authors
```javascript
// Controller - .populate()
const posts = await Post.find()
  .populate('author', 'name email')
  .sort({ createdAt: -1 });

// API
GET /api/posts/all
```

---

## 📖 Documentation Files

1. **QUERIES_GUIDE.md** - 📚 Comprehensive guide to all 17 queries
   - Detailed explanations
   - When to use each query
   - Code examples
   - Interview tips

2. **API_TESTING.md** - 🧪 Testing guide
   - cURL examples
   - Postman collection
   - Testing sequence
   - Troubleshooting

---

## 🎯 Interview Preparation

### Common Interview Questions

**Q1: What's the difference between `.find()` and `.findOne()`?**
```
A: .find() returns an array (even if empty)
   .findOne() returns a single object or null
```

**Q2: Explain `.findOneAndUpdate()` and why it's important**
```
A: Atomic operation - finds and updates in one step
   No race conditions
   new: true returns updated document
   runValidators: true validates schema
```

**Q3: When would you use `.lean()`?**
```
A: For large read-only queries
   Returns plain JS objects (faster)
   Cannot use model instance methods
   ~30% faster for large datasets
```

**Q4: How do you implement pagination?**
```
A: skip = (pageNumber - 1) * pageSize
   .find().skip(skip).limit(pageSize)
```

**Q5: Explain `.populate()`**
```
A: Used for foreign key relationships (like SQL JOIN)
   Replaces reference IDs with actual documents
   Requires ref in schema
```

---

## 🧪 Testing the Project

### Using cURL

```bash
# Create user
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","age":25}'

# Get all users
curl http://localhost:3000/api/users/all

# Get paginated
curl "http://localhost:3000/api/users/pagination/all?page=1"

# Update user
curl -X PUT http://localhost:3000/api/users/update/USER_ID \
  -H "Content-Type: application/json" \
  -d '{"age":26}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/delete/USER_ID
```

### Using Postman

1. Import collection from API_TESTING.md
2. Set base URL: `http://localhost:3000/api`
3. Create test users
4. Test each endpoint
5. Check response times with/without `.lean()`

---

## 📊 Schema Relationships

### User Schema
```javascript
{
  name: String,              // Required
  email: String,             // Required, Unique
  age: Number,               // Default: 0
  city: String,              // Default: Unknown
  isActive: Boolean,         // Default: true
  posts: [ObjectId]          // Reference to Post
}
```

### Post Schema
```javascript
{
  title: String,             // Required
  content: String,           // Required
  author: ObjectId,          // Reference to User
  likes: Number,             // Default: 0
  tags: [String],           // Array of strings
  published: Boolean         // Default: false
}
```

---

## 🔐 Security Considerations

1. **Use `.select("-password")`** - Never expose passwords
2. **Validate input** - Check req.body before operations
3. **Use `.lean()`** - Return plain objects for APIs
4. **Implement auth** - Use JWT/sessions
5. **Rate limit** - Prevent brute force attacks

---

## ⚡ Performance Tips

1. **Use `.lean()`** for read-only queries
2. **Use `.select()`** to fetch only needed fields
3. **Index frequently queried fields** - Add to schema
4. **Use `.populate()` selectively** - Can be expensive
5. **Paginate large result sets** - Use `.skip()` and `.limit()`
6. **Use `.countDocuments()` carefully** - Can be slow on large collections

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection refused | Check MongoDB is running |
| `_id` not found | Use actual `_id` from response |
| Email already exists | Change email, check unique index |
| Population returns null | Ensure reference `_id` is valid |
| Validation error | Check required fields |
| No documents | Check filter conditions |

---

## 📚 Resources

- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Express.js Guide](https://expressjs.com)

---

## 🎓 What's Next?

After mastering this project:

1. Add authentication (JWT)
2. Add input validation (joi/yup)
3. Add error handling middleware
4. Add logging (morgan/winston)
5. Add API documentation (Swagger)
6. Deploy to cloud (Heroku/Vercel/AWS)

---

## 📝 Notes

- This is an educational project for learning MongoDB queries
- All queries are documented with real-world use cases
- Each endpoint demonstrates a specific query method
- Comments in code explain each query step-by-step

---

## ✅ Checklist for Interview

Before your interview, make sure you can:

- [ ] Explain all 17 query methods
- [ ] Explain when to use each method
- [ ] Implement CRUD operations
- [ ] Handle pagination correctly
- [ ] Explain `.populate()` and relationships
- [ ] Optimize queries with `.lean()` and `.select()`
- [ ] Explain atomic operations
- [ ] Write complex queries combining multiple methods

---

**Happy Learning! 🚀**

Made with ❤️ for developers preparing for interviews.

