# 📖 File-by-File Guide

This document explains what each file does and why it's important.

---

## 🎯 Start Here (Setup Files)

### `package.json`
**Purpose**: Define project metadata, dependencies, and scripts
**Key Content**:
- Project name and version
- Dependencies (express, mongoose, jwt, bcryptjs, etc.)
- Dev dependencies (typescript, ts-node, @types/*)
- Scripts: dev, build, start, test, lint, format

**When to modify**: Add new dependencies or npm scripts

---

### `tsconfig.json`
**Purpose**: Configure TypeScript compiler behavior
**Key Content**:
- Compile target: ES2020
- Strict type checking enabled
- Output directory: dist
- Path aliases for imports (@/*)

**When to modify**: Change TypeScript compilation options

---

### `.env` & `.env.example`
**Purpose**: Store configuration and secrets
**Key Content**:
- `PORT`: Server port
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: Secret key for tokens
- `NODE_ENV`: development/production

**When to modify**: Set up local or production configuration

**⚠️ Important**: Never commit `.env` to git (use `.env.example` as template)

---

## 📚 Documentation Files

### `README.md`
**Purpose**: Complete API documentation
**Contains**:
- Feature list
- Installation instructions
- Complete API endpoint documentation with examples
- Query parameters and response formats
- Deployment guide

**How to use**: Reference for all API endpoints

---

### `QUICKSTART.md`
**Purpose**: Quick setup and basic usage
**Contains**:
- Installation steps
- Quick API examples with curl
- Project structure overview
- Common issues and solutions

**How to use**: Get started quickly in 5 minutes

---

### `API_EXAMPLES.ts`
**Purpose**: JavaScript/TypeScript examples for testing
**Contains**:
- Fetch API examples for each endpoint
- Curl commands
- Complete test flow

**How to use**: Copy-paste to test in browser console

---

### `TYPESCRIPT_NODEJS_CONCEPTS.md`
**Purpose**: Educational guide for learning concepts used
**Contains**:
- TypeScript fundamentals (interfaces, types, generics, etc.)
- Express.js concepts (middleware, routing, etc.)
- MongoDB & Mongoose patterns
- Authentication & security
- Error handling patterns
- Advanced design patterns

**How to use**: Learn by reading and understanding examples

---

### `PROJECT_ARCHITECTURE.md`
**Purpose**: Deep dive into project structure and design
**Contains**:
- Complete file structure explanation
- Data flow diagrams
- Authentication flow
- Database schema relationships
- Security architecture
- Performance optimization
- Deployment checklist
- Common errors & solutions

**How to use**: Understand how everything connects

---

## 💻 Source Code Files

### Configuration

#### `src/config/env.ts`
**Purpose**: Load and validate environment variables
**Exports**:
- `config` object with all settings
- `validateConfig()` function to validate required vars

**Usage**: `import config from '@/config/env'`

---

### Types & Interfaces

#### `src/types/index.ts`
**Purpose**: Central location for all TypeScript types
**Defines**:
- `IUser` - User data structure
- `IBlog` - Blog post data structure
- `IComment` - Comment data structure
- `IPaginationQuery` - Pagination parameters
- `IApiResponse<T>` - Standard API response format
- `IErrorResponse` - Error response format
- 20+ other interfaces

**Usage**: `import { IUser, IBlog } from '@/types'`

**Why Important**: Ensures type safety across entire application

---

### Database Models

#### `src/models/User.ts`
**Purpose**: Define User data model and schema
**Contains**:
- Email, username validation
- Password hashing middleware
- `comparePassword()` method
- Indexes for query optimization
- Role-based access (user/admin)

**Key Features**:
```typescript
- Unique email and username
- Automatic password hashing on save
- Pre-save hooks
- Instance methods
```

---

#### `src/models/Blog.ts`
**Purpose**: Define Blog post data model
**Contains**:
- Title, content, description fields
- Auto-generated slug from title
- Category and tags system
- View counter
- Author reference to User
- Full-text search indexes

**Key Features**:
```typescript
- Automatic slug generation
- Read time calculation
- Text indexes for search
- Query helpers (.published(), .byAuthor())
```

---

#### `src/models/Comment.ts`
**Purpose**: Define Comment data model with nested reply support
**Contains**:
- Content validation
- Author and blog references
- Parent comment support (for nested replies)
- Approval status for moderation

**Key Features**:
```typescript
- Nested comment/reply support
- Top-level comment queries
- Compound indexes
```

---

### Controllers (Business Logic)

#### `src/controllers/authController.ts`
**Purpose**: Handle user authentication and profile operations
**Exports Functions**:
- `register()` - Create new user account
- `login()` - User login
- `getCurrentUser()` - Get logged-in user profile
- `updateProfile()` - Update user information
- `changePassword()` - Change password

**Concepts**:
- Input validation
- Password hashing with bcryptjs
- JWT token generation
- Custom error handling

**Example**:
```typescript
POST /api/v1/auth/register
Request: { username, email, password, firstName, lastName }
Response: { token, user }
```

---

#### `src/controllers/blogController.ts`
**Purpose**: Handle blog CRUD operations, search, and filtering
**Exports Functions**:
- `createBlog()` - Create new blog post
- `getAllBlogs()` - Get blogs with search/filter/pagination
- `getBlog()` - Get single blog by ID or slug
- `updateBlog()` - Update blog post
- `deleteBlog()` - Delete blog post
- `getMyBlogs()` - Get user's own blogs
- `togglePublish()` - Publish/unpublish blog

**Advanced Features**:
- Full-text search
- Category and tag filtering
- Pagination (10-100 items per page)
- Sorting (newest, oldest, popular, trending)
- View counter increment
- Authorization checks

**Example**:
```typescript
GET /api/v1/blogs?search=typescript&category=Technology&sortBy=popular&page=1&limit=10
```

---

#### `src/controllers/commentController.ts`
**Purpose**: Handle comment management and nested replies
**Exports Functions**:
- `addComment()` - Add comment to blog
- `getComments()` - Get blog comments with pagination
- `getCommentReplies()` - Get replies to specific comment
- `updateComment()` - Update comment
- `deleteComment()` - Delete comment
- `getAllComments()` - Admin: Get all comments
- `approveComment()` - Admin: Approve/reject comments

**Advanced Features**:
- Nested reply support
- Comment moderation
- Pagination for large comment threads
- Cascading delete (delete comment = delete all replies)

**Example**:
```typescript
POST /api/v1/comments/blog/{blogId}/comments
Request: { content, parentCommentId (optional) }
Response: { comment }
```

---

### Middleware

#### `src/middleware/authMiddleware.ts`
**Purpose**: JWT token verification and generation
**Exports Functions**:
- `verifyToken()` - Middleware to verify JWT
- `verifyTokenOptional()` - Optional verification
- `extractToken()` - Extract token from request
- `generateToken()` - Create JWT token

**How It Works**:
1. Extract token from Authorization header
2. Verify signature with JWT_SECRET
3. Decode to get userId, email, role
4. Attach user to request object
5. Continue to next middleware

**Usage**:
```typescript
router.get('/protected', verifyToken, handler);
```

---

#### `src/middleware/errorHandler.ts`
**Purpose**: Handle errors globally and wrap async functions
**Exports Functions**:
- `errorHandler()` - Global error catching middleware
- `notFound()` - Handle 404 errors
- `asyncHandler()` - Wrap async route handlers

**How It Works**:
1. Catch all errors (thrown or from promises)
2. Convert to AppError if needed
3. Log error details
4. Send formatted error response
5. Never expose sensitive info in production

**Usage**:
```typescript
// Auto-catch errors
router.get('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);  // If error, caught automatically
}));
```

---

#### `src/middleware/roleAuth.ts`
**Purpose**: Role-based authorization checks
**Exports Functions**:
- `isAuthenticated()` - Check user is logged in
- `hasRole(...roles)` - Check user has specific role
- `isAdmin()` - Check user is admin
- `isUser()` - Check user is user or admin
- `isOwnerOrAdmin()` - Check user owns resource or is admin

**Usage Examples**:
```typescript
router.delete('/admin/users/:id', verifyToken, isAdmin, deleteUser);
router.put('/blogs/:id', verifyToken, isOwnerOrAdmin, updateBlog);
router.patch('/moderate', verifyToken, hasRole('admin', 'moderator'), moderate);
```

---

### Routes

#### `src/routes/authRoutes.ts`
**Purpose**: Define authentication endpoints
**Routes**:
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user
- `PUT /profile` - Update profile
- `POST /change-password` - Change password

**Protection**: Some routes require token (verifyToken middleware)

---

#### `src/routes/blogRoutes.ts`
**Purpose**: Define blog endpoints
**Routes**:
- `GET /` - Get all blogs (public)
- `GET /:id` - Get single blog (public)
- `POST /` - Create blog (protected)
- `PUT /:id` - Update blog (protected)
- `DELETE /:id` - Delete blog (protected)
- `GET /user/my-blogs` - Get user's blogs (protected)
- `PATCH /:id/publish` - Publish/unpublish (protected)

**Protection**: Create/Update/Delete routes require authentication

---

#### `src/routes/commentRoutes.ts`
**Purpose**: Define comment endpoints
**Routes**:
- `GET /blog/:blogId/comments` - Get blog comments
- `GET /:commentId/replies` - Get comment replies
- `POST /blog/:blogId/comments` - Add comment (protected)
- `PUT /:commentId` - Update comment (protected)
- `DELETE /:commentId` - Delete comment (protected)
- `GET /admin/comments` - Admin: Get all comments
- `PATCH /admin/:commentId/approve` - Admin: Approve comment

---

### Utilities

#### `src/utils/errorHandler.ts`
**Purpose**: Custom error classes for consistent error handling
**Exports Classes**:
- `AppError` - Base error class
- `ValidationError` - 400 Bad Request
- `AuthenticationError` - 401 Unauthorized
- `AuthorizationError` - 403 Forbidden
- `NotFoundError` - 404 Not Found
- `ConflictError` - 409 Conflict
- `ServerError` - 500 Internal Error

**Usage**:
```typescript
throw new ValidationError('Email format invalid', { email: 'Invalid' });
throw new NotFoundError('User');
throw new AuthenticationError('Invalid credentials');
```

---

#### `src/utils/logger.ts`
**Purpose**: Consistent logging throughout application
**Exports Functions**:
- `logger.error()` - Log errors
- `logger.warn()` - Log warnings
- `logger.info()` - Log info
- `logger.debug()` - Log debug (development only)

**Usage**:
```typescript
logger.info('User registered', { userId, email });
logger.error('Database connection failed', error);
```

---

### Database Connection

#### `src/database/connection.ts`
**Purpose**: Manage MongoDB connection
**Exports Functions**:
- `connectDatabase()` - Connect to MongoDB
- `disconnectDatabase()` - Disconnect from MongoDB
- `getDatabase()` - Get current connection

**Usage**:
```typescript
// In server startup
await connectDatabase();
```

---

### Main Application

#### `src/server.ts`
**Purpose**: Express application setup and configuration
**Contains**:
- Express app initialization
- Middleware registration (helmet, cors, body-parser)
- Route mounting
- Error handling setup
- Server startup logic
- Graceful shutdown handlers

**Startup Flow**:
1. Load environment variables
2. Validate configuration
3. Connect to database
4. Start Express server
5. Handle shutdown signals (SIGTERM, SIGINT)

**Key Features**:
- Health check endpoint
- API info endpoint
- Centralized error handling
- Security headers (helmet)
- CORS configuration
- Request logging

---

## 🔄 How Files Work Together

### Example: Creating a Blog Post

1. **Client** sends POST request with blog data
2. **Routes** (blogRoutes.ts) matches `/api/v1/blogs`
3. **Middleware**:
   - `verifyToken` checks JWT
   - `isAuthenticated` ensures user logged in
4. **Controller** (blogController.ts):
   - Validates input
   - Checks authorization
   - Calls Model
5. **Model** (Blog.ts):
   - Validates data against schema
   - Generates slug
   - Saves to MongoDB
6. **Response**: Formatted blog data

---

### Example: Search & Pagination

1. **Client** sends `GET /blogs?search=typescript&page=1&limit=10`
2. **Routes** matches request
3. **Middleware**: Optional token verification
4. **Controller** (blogController.ts):
   - Parses query parameters
   - Validates pagination values
   - Builds MongoDB query
   - Applies text search index
   - Applies filters and sorting
5. **Model** executes optimized query
6. **Response**: Paginated results with metadata

---

## 📝 Typical Workflow

1. **Learn**: Read QUICKSTART.md
2. **Setup**: `npm install`, configure .env
3. **Run**: `npm run dev`
4. **Test**: Use curl or API_EXAMPLES.ts
5. **Study**: Read TYPESCRIPT_NODEJS_CONCEPTS.md
6. **Explore**: Open each file and understand code
7. **Modify**: Try adding new features
8. **Deploy**: Follow PROJECT_ARCHITECTURE.md deployment checklist

---

## 🎓 Best Practices

- ✅ Always use types from `src/types/index.ts`
- ✅ Throw custom errors from `src/utils/errorHandler.ts`
- ✅ Use `logger` for logging instead of console.log
- ✅ Check authorization in controllers
- ✅ Validate input in controllers
- ✅ Use `asyncHandler` wrapper for async routes
- ✅ Keep business logic in controllers
- ✅ Keep database queries in models
- ✅ Add indexes for frequently queried fields

---

**Happy coding! Remember, read the code! 📖💻**
