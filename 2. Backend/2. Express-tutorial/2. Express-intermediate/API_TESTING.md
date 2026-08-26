# API Testing Guide - cURL & Postman Examples

## Base URL
```
http://localhost:3000/api
```

---

## 👥 USER ENDPOINTS

### 1. Create User (Using .create())
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ayush",
    "email": "ayush@gmail.com",
    "age": 25,
    "city": "Mumbai"
  }'
```

### 2. Create User (Using .save())
```bash
curl -X POST http://localhost:3000/api/users/create-with-save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@gmail.com",
    "age": 30,
    "city": "Delhi"
  }'
```

### 3. Get All Users (.find)
```bash
curl http://localhost:3000/api/users/all
```

**Response:**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Ayush",
      "email": "ayush@gmail.com",
      "age": 25
    }
  ]
}
```

### 4. Get User by Email (.findOne)
```bash
curl http://localhost:3000/api/users/email/ayush@gmail.com
```

### 5. Get User by ID (.findById)
```bash
curl http://localhost:3000/api/users/507f1f77bcf86cd799439011
```

### 6. Get User with Posts (.populate)
```bash
curl http://localhost:3000/api/users/with-posts/507f1f77bcf86cd799439011
```

**Response:** (Includes populated posts data)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Ayush",
    "posts": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "My First Post",
        "content": "..."
      }
    ]
  }
}
```

### 7. Get Users with Selected Fields (.select)
```bash
curl http://localhost:3000/api/users/selected/fields
```

### 8. Get Fast Users (.lean)
```bash
curl http://localhost:3000/api/users/fast/all
```

### 9. Get Paginated Users (.skip & .limit)
```bash
# Page 1, 5 items per page
curl "http://localhost:3000/api/users/pagination/all?page=1"

# Page 2
curl "http://localhost:3000/api/users/pagination/all?page=2"
```

### 10. Get Sorted Users (.sort)
```bash
curl http://localhost:3000/api/users/sorted/recent
```

### 11. Get Filtered & Paginated (.find + .select + .sort + .skip + .limit)
```bash
curl "http://localhost:3000/api/users/filter/combined?minAge=20&maxAge=30&page=1&limit=5&sortBy=age"
```

### 12. Count Users (.countDocuments)
```bash
curl http://localhost:3000/api/users/count/total
```

**Response:**
```json
{
  "success": true,
  "message": "Users counted",
  "totalCount": 10
}
```

### 13. Update User by Email (.findOneAndUpdate)
```bash
curl -X PUT http://localhost:3000/api/users/update-email/ayush@gmail.com \
  -H "Content-Type: application/json" \
  -d '{
    "age": 26,
    "city": "Bangalore"
  }'
```

### 14. Update User by ID (.findByIdAndUpdate)
```bash
curl -X PUT http://localhost:3000/api/users/update/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ayush Kumar",
    "isActive": true
  }'
```

### 15. Update Multiple Users (.updateMany)
```bash
# Mark all users over 25 as inactive
curl -X PUT http://localhost:3000/api/users/update-many/active-status
```

### 16. Delete User by Email (.findOneAndDelete)
```bash
curl -X DELETE http://localhost:3000/api/users/delete-email/ayush@gmail.com
```

### 17. Delete User by ID (.findByIdAndDelete)
```bash
curl -X DELETE http://localhost:3000/api/users/delete/507f1f77bcf86cd799439011
```

### 18. Delete Multiple Users (.deleteMany)
```bash
# Delete all inactive users
curl -X DELETE http://localhost:3000/api/users/delete-many/inactive
```

---

## 📝 POST ENDPOINTS

### 1. Create Post
```bash
curl -X POST http://localhost:3000/api/posts/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MongoDB Queries",
    "content": "Complete guide to MongoDB queries",
    "author": "507f1f77bcf86cd799439011",
    "tags": ["mongodb", "database"]
  }'
```

### 2. Get All Posts with Authors (.populate)
```bash
curl http://localhost:3000/api/posts/all
```

**Response:** (Author data included)
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "MongoDB Queries",
      "author": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Ayush",
        "email": "ayush@gmail.com"
      }
    }
  ]
}
```

### 3. Get All Posts (Detailed View)
```bash
curl http://localhost:3000/api/posts/detailed/all
```

### 4. Get Single Post by ID (.findById)
```bash
curl http://localhost:3000/api/posts/507f1f77bcf86cd799439012
```

### 5. Get Paginated Posts (.skip + .limit + .populate + .sort)
```bash
curl "http://localhost:3000/api/posts/paginated/all?page=1&limit=5"
```

### 6. Update Post by ID (.findByIdAndUpdate)
```bash
curl -X PUT http://localhost:3000/api/posts/update/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "likes": 50,
    "published": true
  }'
```

### 7. Publish Multiple Posts by Author (.updateMany)
```bash
curl -X PUT http://localhost:3000/api/posts/publish/by-author/507f1f77bcf86cd799439011
```

### 8. Delete Post (.findByIdAndDelete)
```bash
curl -X DELETE http://localhost:3000/api/posts/delete/507f1f77bcf86cd799439012
```

### 9. Delete Old Unpublished Posts (.deleteMany)
```bash
curl -X DELETE http://localhost:3000/api/posts/delete-old/unpublished
```

---

## 📌 Postman Collection Format

### For Postman:
Create a new collection with these requests:

**Collection: MongoDB Queries**

#### Folder: Users
- POST /api/users/create
- POST /api/users/create-with-save
- GET /api/users/all
- GET /api/users/email/:email
- GET /api/users/:id
- GET /api/users/with-posts/:id
- GET /api/users/selected/fields
- GET /api/users/fast/all
- GET /api/users/pagination/all?page=1
- GET /api/users/sorted/recent
- GET /api/users/filter/combined
- GET /api/users/count/total
- PUT /api/users/update-email/:email
- PUT /api/users/update/:id
- PUT /api/users/update-many/active-status
- DELETE /api/users/delete-email/:email
- DELETE /api/users/delete/:id
- DELETE /api/users/delete-many/inactive

#### Folder: Posts
- POST /api/posts/create
- GET /api/posts/all
- GET /api/posts/detailed/all
- GET /api/posts/:id
- GET /api/posts/paginated/all?page=1&limit=5
- PUT /api/posts/update/:id
- PUT /api/posts/publish/by-author/:authorId
- DELETE /api/posts/delete/:id
- DELETE /api/posts/delete-old/unpublished

---

## 🧪 Testing Sequence

### Step 1: Create Users
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"name":"User1","email":"user1@test.com","age":25}'
```

Save the returned `_id`

### Step 2: Create More Users
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"name":"User2","email":"user2@test.com","age":30}'
```

### Step 3: Test Read Operations
```bash
# Test .find()
curl http://localhost:3000/api/users/all

# Test .findOne()
curl http://localhost:3000/api/users/email/user1@test.com

# Test .findById()
curl http://localhost:3000/api/users/{SAVED_ID}

# Test pagination
curl "http://localhost:3000/api/users/pagination/all?page=1"
```

### Step 4: Create Posts
```bash
curl -X POST http://localhost:3000/api/posts/create \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Post1",
    "content":"Content",
    "author":"{USER_ID}",
    "tags":["test"]
  }'
```

### Step 5: Test .populate()
```bash
curl http://localhost:3000/api/users/with-posts/{USER_ID}
curl http://localhost:3000/api/posts/all
```

### Step 6: Test Updates
```bash
curl -X PUT http://localhost:3000/api/users/update/{USER_ID} \
  -H "Content-Type: application/json" \
  -d '{"age":31}'
```

### Step 7: Test Deletes
```bash
curl -X DELETE http://localhost:3000/api/users/delete/{USER_ID}
```

---

## 💡 Tips

1. **Save IDs:** When creating records, save the `_id` for testing other operations
2. **Test Pagination:** Create 10+ users to test pagination properly
3. **Test Relationships:** Create users first, then posts for that user
4. **Use Lean:** Compare response times with and without `.lean()`
5. **Check Validation:** Try creating documents with missing required fields

---

## 🔍 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `_id not found` | Make sure to use the actual returned `_id` from create |
| `Email already exists` | Change email, ensure unique constraint |
| `Population not working` | Ensure `author` field has valid user `_id` |
| `No documents returned` | Check filter conditions and data in database |
| `Validation error` | Check required fields in models |

