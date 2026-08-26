# 🚀 Multi-User Blog API

A comprehensive, production-ready Blog API built with **TypeScript**, **Node.js**, **Express**, and **MongoDB**. This project demonstrates all essential backend development concepts including authentication, authorization, CRUD operations, pagination, search/filtering, and centralized error handling.

## ✨ Features

- ✅ **User Authentication** - Register/Login with JWT tokens
- ✅ **Role-Based Authorization** - User and Admin roles with permissions
- ✅ **Complete Blog CRUD** - Create, Read, Update, Delete blog posts
- ✅ **Comments System** - Support for nested comments/replies
- ✅ **Pagination** - Efficient data pagination with configurable limits
- ✅ **Search & Filter** - Full-text search and filtering by category, tags, author
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **Centralized Error Handling** - Custom error classes and global error handler
- ✅ **TypeScript Types** - Comprehensive interfaces and types
- ✅ **MongoDB Integration** - Mongoose models with indexing
- ✅ **Security** - Helmet, CORS, password hashing with bcrypt
- ✅ **Input Validation** - Server-side validation for all inputs

## 🏗️ Project Structure

```
src/
├── config/
│   └── env.ts                    # Environment configuration
├── controllers/
│   ├── authController.ts         # Authentication logic
│   ├── blogController.ts         # Blog CRUD operations
│   └── commentController.ts      # Comment management
├── database/
│   └── connection.ts             # MongoDB connection
├── middleware/
│   ├── authMiddleware.ts         # JWT verification
│   ├── errorHandler.ts           # Global error handling
│   └── roleAuth.ts               # Role-based authorization
├── models/
│   ├── User.ts                   # User schema
│   ├── Blog.ts                   # Blog schema
│   └── Comment.ts                # Comment schema
├── routes/
│   ├── authRoutes.ts             # Auth endpoints
│   ├── blogRoutes.ts             # Blog endpoints
│   └── commentRoutes.ts          # Comment endpoints
├── types/
│   └── index.ts                  # TypeScript interfaces
├── utils/
│   ├── errorHandler.ts           # Custom error classes
│   └── logger.ts                 # Logging utility
└── server.ts                     # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- MongoDB (Local or Atlas)
- TypeScript knowledge

### Installation

1. **Clone or navigate to project**
   ```bash
   cd "2. Blog App"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   ```

4. **Configure `.env` file**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/blog-api
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   APP_NAME=Multi-User Blog API
   API_VERSION=v1
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   # On Windows
   mongod
   ```

6. **Run the application**

   **Development mode (with hot-reload)**
   ```bash
   npm run dev
   ```

   **Production mode**
   ```bash
   npm run build
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Health Check
```
GET /health
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/v1/auth/register

Request:
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Login
```http
POST /api/v1/auth/login

Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "User profile retrieved",
  "data": { ... }
}
```

### Update Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer {token}

Request:
{
  "firstName": "Jonathan",
  "bio": "Software developer",
  "profileImage": "https://..."
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

### Change Password
```http
POST /api/v1/auth/change-password
Authorization: Bearer {token}

Request:
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 📝 Blog Endpoints

### Create Blog
```http
POST /api/v1/blogs
Authorization: Bearer {token}

Request:
{
  "title": "Introduction to TypeScript",
  "content": "TypeScript is a typed superset of JavaScript...",
  "description": "Learn the basics of TypeScript",
  "category": "Technology",
  "tags": ["typescript", "javascript", "web-dev"],
  "coverImage": "https://...",
  "isPublished": true
}

Response (201):
{
  "success": true,
  "statusCode": 201,
  "message": "Blog created successfully",
  "data": { ... }
}
```

### Get All Blogs (Published)
```http
GET /api/v1/blogs?page=1&limit=10&search=typescript&category=Technology&sortBy=newest

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- search: Full-text search in title, content, description
- category: Filter by category
- tags: Comma-separated tags (e.g., "typescript,nodejs")
- author: Filter by author ID
- sortBy: newest | oldest | popular | trending

Response (200):
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### Get Single Blog
```http
GET /api/v1/blogs/{id-or-slug}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Blog retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to TypeScript",
    "slug": "introduction-to-typescript",
    "content": "...",
    "author": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "category": "Technology",
    "tags": ["typescript", "javascript"],
    "views": 245,
    "readTime": 8,
    "isPublished": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get My Blogs
```http
GET /api/v1/blogs/user/my-blogs?page=1&limit=10
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

### Update Blog
```http
PUT /api/v1/blogs/{id}
Authorization: Bearer {token}

Request:
{
  "title": "Updated Title",
  "content": "Updated content...",
  "isPublished": true
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Blog updated successfully",
  "data": { ... }
}
```

### Delete Blog
```http
DELETE /api/v1/blogs/{id}
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Blog deleted successfully"
}
```

### Publish/Unpublish Blog
```http
PATCH /api/v1/blogs/{id}/publish
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Blog published successfully",
  "data": { ... }
}
```

---

## 💬 Comment Endpoints

### Add Comment
```http
POST /api/v1/comments/blog/{blogId}/comments
Authorization: Bearer {token}

Request:
{
  "content": "Great article! Really helpful.",
  "parentCommentId": "507f1f77bcf86cd799439013"  // Optional, for nested replies
}

Response (201):
{
  "success": true,
  "statusCode": 201,
  "message": "Comment added successfully",
  "data": { ... }
}
```

### Get Blog Comments
```http
GET /api/v1/comments/blog/{blogId}/comments?page=1&limit=10&parentOnly=true

Query Parameters:
- page: Page number
- limit: Items per page
- parentOnly: Get only top-level comments (true/false)

Response (200):
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

### Get Comment Replies
```http
GET /api/v1/comments/{commentId}/replies?page=1&limit=5

Response (200):
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

### Update Comment
```http
PUT /api/v1/comments/{commentId}
Authorization: Bearer {token}

Request:
{
  "content": "Updated comment text"
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Comment updated successfully",
  "data": { ... }
}
```

### Delete Comment
```http
DELETE /api/v1/comments/{commentId}
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Comment deleted successfully"
}
```

### Admin: Get All Comments
```http
GET /api/v1/comments/admin/comments?page=1&limit=20&approved=false
Authorization: Bearer {admin-token}

Response (200):
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

### Admin: Approve/Reject Comment
```http
PATCH /api/v1/comments/admin/{commentId}/approve
Authorization: Bearer {admin-token}

Request:
{
  "approved": true
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Comment approved successfully",
  "data": { ... }
}
```

---

## 🔑 Key TypeScript Concepts Used

### 1. **Interfaces & Types** (`src/types/index.ts`)
- Comprehensive interfaces for all data models
- Request/Response types for type safety
- Pagination and filtering types

### 2. **Custom Error Classes** (`src/utils/errorHandler.ts`)
```typescript
- AppError (base class)
- ValidationError
- AuthenticationError
- AuthorizationError
- NotFoundError
- ConflictError
- ServerError
```

### 3. **Model Schemas with Mongoose**
```typescript
// User Model with password hashing
// Blog Model with full-text search indexing
// Comment Model with nested reply support
```

### 4. **Middleware Functions**
```typescript
- JWT verification middleware
- Role-based authorization middleware
- Async error handling wrapper
- Global error handler
```

### 5. **Controllers with Async/Await**
```typescript
- Type-safe request/response handling
- Input validation with custom errors
- Authorization checks
- Database operations with proper error handling
```

---

## 🧪 Testing with Postman/Thunder Client

### 1. Register & Get Token
```
1. POST /auth/register
2. Copy token from response
3. Use in Authorization header: Bearer {token}
```

### 2. Create & Search Blogs
```
1. POST /blogs (with token)
2. GET /blogs?search=typescript&category=Technology
3. GET /blogs/{id} or /blogs/{slug}
```

### 3. Comments Flow
```
1. POST /comments/blog/{blogId}/comments
2. GET /comments/blog/{blogId}/comments
3. POST /comments/blog/{blogId}/comments (with parentCommentId for reply)
```

---

## 📊 Database Indexes

Optimized MongoDB indexes for better query performance:

```typescript
// User Collection
- email (unique)
- username (unique)
- createdAt

// Blog Collection
- slug (unique)
- author
- category
- tags
- isPublished
- createdAt (descending)
- views (descending)
- Text index (title, content, description, tags)

// Comment Collection
- blog
- author
- parentComment
- createdAt (descending)
- Compound: (blog, parentComment)
```

---

## 🔒 Security Features

1. **Password Hashing** - bcryptjs with salt rounds
2. **JWT Tokens** - Secure token-based authentication
3. **Helmet** - Security headers
4. **CORS** - Cross-origin resource sharing
5. **Input Validation** - Server-side validation
6. **Authorization Checks** - Role-based access control
7. **Error Handling** - No sensitive info in error responses

---

## 🚀 Production Deployment

### Environment Setup
```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blog-api
JWT_SECRET=your-very-long-secret-key-minimum-32-characters
JWT_EXPIRE=7d
```

### Build & Deploy
```bash
# Build TypeScript
npm run build

# Run production server
npm start
```

---

## 📖 Learning Path

**Beginners should study in this order:**

1. `src/types/index.ts` - Understand TypeScript interfaces
2. `src/models/User.ts` - Learn Mongoose schemas
3. `src/middleware/authMiddleware.ts` - JWT concepts
4. `src/utils/errorHandler.ts` - Error handling patterns
5. `src/controllers/authController.ts` - Controller structure
6. `src/routes/authRoutes.ts` - Route organization
7. `src/server.ts` - Application setup

---

## 🐛 Common Issues & Solutions

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running and MONGODB_URI is correct
```

### JWT Token Invalid
```
Solution: Make sure to use Bearer {token} in Authorization header
```

### CORS Error
```
Solution: Check if CLIENT_URL env var matches your frontend URL
```

### Validation Errors
```
Solution: Check request body matches the expected schema
```

---

## 📝 What You Learn

✅ Complete authentication & authorization system
✅ Database modeling with Mongoose
✅ RESTful API design patterns
✅ Error handling best practices
✅ TypeScript interfaces and types
✅ Pagination and filtering
✅ Full-text search implementation
✅ Middleware architecture
✅ Code organization and structure
✅ Security practices
✅ Environment configuration
✅ Async/await patterns
✅ Input validation

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "jsonwebtoken": "^9.1.0",
  "bcryptjs": "^2.4.3",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0"
}
```

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Feel free to fork, modify, and use this project for learning and development.

---

## 📞 Support

For questions and issues, please refer to the code comments and TypeScript types for detailed documentation.

---

**Happy Coding! 🎉**
