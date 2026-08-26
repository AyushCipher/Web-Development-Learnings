# GraphQL Blog Project 📚

A comprehensive GraphQL project that helps you understand GraphQL concepts through a practical blog management system with Mongoose integration.

---

## 🎯 What You'll Learn

This project demonstrates:

✅ **GraphQL Core Concepts:**
- Queries (READ operations)
- Mutations (CREATE, UPDATE, DELETE)
- Types and Input Types
- Relationships and nested data fetching
- Field resolvers
- Error handling

✅ **Real-World Blog Features:**
- User management (follow/unfollow system)
- Blog posts with multiple categories
- Comments with reply functionality
- Like system for posts and comments
- Search and filtering capabilities
- Pagination
- Trending posts

✅ **Database Integration:**
- Mongoose models with relationships
- Document references (populate)
- Atomic operations
- Data validation

---

## 📁 Project Structure

```
graphql-project/
│
├── config/
│   └── db.js                    # MongoDB connection
│
├── models/
│   ├── User.js                  # User schema
│   ├── Post.js                  # Post schema
│   ├── Comment.js               # Comment schema
│   └── Category.js              # Category schema
│
├── schema/
│   └── typeDefs.js              # GraphQL schema definitions
│
├── resolvers/
│   └── resolvers.js             # Query and Mutation resolvers
│
├── server.js                    # Apollo Server setup
├── package.json
├── .env.example
│
├── README.md                    # This file
├── GRAPHQL_CONCEPTS.md         # GraphQL concept guide
├── GRAPHQL_QUERIES.md          # Query examples
└── REST_vs_GRAPHQL.md          # Comparison guide
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Update MONGO_URI if needed
```

### 3. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

Access GraphQL Playground: `http://localhost:4000/graphql`

---

## 🔑 GraphQL vs REST API

### REST API Approach (Multiple Endpoints)

```bash
# Get user - 1 request
GET /api/users/123

# Get user's posts - 2nd request
GET /api/users/123/posts

# Get post comments - 3rd request
GET /api/posts/456/comments

# Get comment authors - 4th request
GET /api/comments/789/author

# Total: 4 requests, over-fetching data
```

### GraphQL Approach (Single Query)

```graphql
query {
  user(id: "123") {
    name
    email
    posts {
      title
      comments {
        text
        author {
          name
        }
      }
    }
  }
}
```

**Benefits:**
✅ Single request
✅ Get exactly what you need
✅ No over-fetching
✅ No under-fetching
✅ Better for mobile (less bandwidth)

---

## 📊 Core Concepts

### 1. Queries (READ Operations)

```graphql
# Get single user
query {
  user(id: "userId") {
    id
    name
    email
    bio
  }
}

# Get multiple posts with pagination
query {
  posts(skip: 0, limit: 10, published: true) {
    id
    title
    author {
      name
    }
    likesCount
    commentsCount
  }
}

# Search functionality
query {
  searchPosts(query: "GraphQL") {
    id
    title
    content
  }
}
```

**Advantages:**
- Declare exactly what fields you need
- Prevent over-fetching
- Prevent under-fetching
- Single round trip to server

### 2. Mutations (WRITE Operations)

```graphql
# Create user
mutation {
  createUser(input: {
    name: "John"
    email: "john@example.com"
    bio: "Developer"
  }) {
    id
    name
    email
  }
}

# Update post
mutation {
  updatePost(id: "postId", input: {
    title: "New Title"
    content: "New Content"
  }) {
    id
    title
    updatedAt
  }
}

# Batch operations
mutation {
  post1: createPost(input: {
    title: "Post 1"
    content: "Content 1"
    authorId: "userId"
  }) {
    id
    title
  }
  
  post2: createPost(input: {
    title: "Post 2"
    content: "Content 2"
    authorId: "userId"
  }) {
    id
    title
  }
}
```

### 3. Types Definition

```graphql
type User {
  id: ID!                    # Required ID
  name: String!              # Required string
  email: String!             # Unique required string
  bio: String                # Optional string
  posts: [Post!]!            # Array of required posts
  followers: [User!]!        # Array of users
  followersCount: Int!       # Computed field
  createdAt: String!
}
```

**Type Modifiers:**
- `!` = Required (not null)
- `[Type]` = Array
- `[Type!]!` = Required array of required items

### 4. Input Types (for Mutations)

```graphql
input CreateUserInput {
  name: String!
  email: String!
  bio: String
  avatar: String
}

# Usage in mutation
mutation {
  createUser(input: {
    name: "Jane"
    email: "jane@example.com"
    bio: "Designer"
  }) {
    id
    name
  }
}
```

### 5. Field Resolvers (Computed Fields)

```javascript
// In resolvers.js
User: {
  postsCount: (user) => user.posts?.length || 0,
  followersCount: (user) => user.followers?.length || 0,
}
```

```graphql
query {
  user(id: "123") {
    name
    posts {
      title
    }
    postsCount          # Computed at query time
    followersCount      # Computed at query time
  }
}
```

---

## 🔗 Relationships in GraphQL

### One-to-Many: User → Posts

```graphql
type User {
  posts: [Post!]!
}

type Post {
  author: User!
}

# Query nested data
query {
  user(id: "123") {
    name
    posts {
      title
      content
      createdAt
    }
  }
}
```

### Many-to-Many: Posts → Likes

```graphql
type Post {
  likes: [User!]!          # Users who liked this post
  likesCount: Int!         # Computed field
}

# Query with relationships
query {
  post(id: "postId") {
    title
    likes {
      name
      email
    }
    likesCount
  }
}
```

### Comments with Replies

```graphql
type Comment {
  text: String!
  author: User!
  replies: [Comment!]!     # Nested comments
  repliesCount: Int!
}

# Query deeply nested data
query {
  postComments(postId: "123") {
    text
    author {
      name
    }
    replies {
      text
      author {
        name
      }
    }
  }
}
```

---

## 📋 Available Operations

### User Operations

**Queries:**
```graphql
user(id: ID!)                              # Get single user
userByEmail(email: String!)                # Get by email
users(skip: Int, limit: Int)               # Get all with pagination
searchUsers(query: String!)                # Search by name/email
followers(userId: ID!)                     # Get user's followers
following(userId: ID!)                     # Get user's following
```

**Mutations:**
```graphql
createUser(input: CreateUserInput!)        # Create new user
updateUser(id: ID!, input: UpdateUserInput!) # Update user
deleteUser(id: ID!)                        # Delete user
followUser(userId: ID!, followId: ID!)     # Follow a user
unfollowUser(userId: ID!, followId: ID!)   # Unfollow a user
```

### Post Operations

**Queries:**
```graphql
post(id: ID!)                              # Get single post
posts(skip: Int, limit: Int, filters...)   # Get all with filters
postsByAuthor(authorId: ID!, ...)          # Posts by author
postsByCategory(categoryId: ID!, ...)      # Posts by category
searchPosts(query: String!)                # Search posts
trendingPosts(limit: Int)                  # Trending posts
recentPosts(limit: Int)                    # Recent posts
```

**Mutations:**
```graphql
createPost(input: CreatePostInput!)        # Create post
updatePost(id: ID!, input: UpdatePostInput!) # Update post
deletePost(id: ID!)                        # Delete post
publishPost(id: ID!)                       # Publish post
unpublishPost(id: ID!)                     # Unpublish post
likePost(postId: ID!, userId: ID!)         # Like post
unlikePost(postId: ID!, userId: ID!)       # Unlike post
incrementPostViews(postId: ID!)            # Increment views
```

### Comment Operations

**Queries:**
```graphql
postComments(postId: ID!)                  # Get post's comments
comment(id: ID!)                           # Get single comment
```

**Mutations:**
```graphql
createComment(input: CreateCommentInput!)  # Create comment
updateComment(id: ID!, text: String!)      # Update comment
deleteComment(id: ID!)                     # Delete comment
likeComment(commentId: ID!, userId: ID!)   # Like comment
unlikeComment(commentId: ID!, userId: ID!) # Unlike comment
replyComment(input: ReplyCommentInput!)    # Reply to comment
```

### Category Operations

**Queries:**
```graphql
categories                                 # Get all categories
category(id: ID!)                          # Get single category
categoryBySlug(slug: String!)               # Get by slug
```

**Mutations:**
```graphql
createCategory(input: CreateCategoryInput!) # Create category
updateCategory(id: ID!, input: UpdateCategoryInput!) # Update
deleteCategory(id: ID!)                    # Delete category
```

---

## 💡 Key Differences: GraphQL vs REST

| Aspect | REST API | GraphQL |
|--------|----------|---------|
| **Endpoints** | Multiple endpoints | Single endpoint |
| **Data Fetching** | Fixed structure | Flexible, client-defined |
| **Over-fetching** | Common issue | Prevented |
| **Under-fetching** | Requires multiple requests | Single request |
| **Queries** | GET requests | Query operations |
| **Updates** | POST, PUT, DELETE | Mutation operations |
| **Error Handling** | HTTP status codes | GraphQL errors field |
| **Versioning** | API versioning needed | Built-in flexibility |
| **Caching** | HTTP caching | More complex |
| **Learning Curve** | Easier | Moderate |

---

## 🧪 Real-World Example Queries

### Blog Homepage - Fetch All Data in One Query

**REST Approach (4-5 requests):**
```bash
GET /api/posts?published=true&limit=10
GET /api/users/[authorId] (repeated)
GET /api/posts/[postId]/comments (repeated)
GET /api/users/[commentAuthorId] (repeated)
```

**GraphQL Approach (1 request):**
```graphql
query GetBlogHomepage {
  recentPosts(limit: 10) {
    id
    title
    content
    author {
      name
      avatar
    }
    comments(limit: 3) {
      text
      author {
        name
      }
    }
    likesCount
    createdAt
  }
}
```

### User Profile - All User Info

**REST Approach (3-4 requests):**
```bash
GET /api/users/123
GET /api/users/123/posts
GET /api/users/123/followers
GET /api/users/123/following
```

**GraphQL Approach (1 request):**
```graphql
query GetUserProfile($id: ID!) {
  user(id: $id) {
    name
    email
    bio
    avatar
    posts {
      id
      title
      likesCount
    }
    followers {
      id
      name
    }
    following {
      id
      name
    }
    postsCount
    followersCount
    followingCount
  }
}
```

### Mobile App - Minimal Data

**REST Approach (Still 4-5 requests, full data):**
```bash
GET /api/posts?published=true&limit=10
# Returns full post data with all fields
```

**GraphQL Approach (1 request, optimized data):**
```graphql
query GetPostsForMobile {
  posts(limit: 10, published: true) {
    id
    title
    author {
      name
    }
    likesCount
  }
}
```

---

## 🎓 Interview Questions

**Q1: What are the main advantages of GraphQL over REST?**

A:
- Single request for multiple resources
- Client specifies exact fields needed (no over-fetching)
- No under-fetching issues
- Better for mobile/slow networks
- Built-in introspection for API documentation

**Q2: What's the difference between a Query and a Mutation in GraphQL?**

A:
- **Query**: For reading data (like GET in REST)
- **Mutation**: For writing data (like POST, PUT, DELETE in REST)
- Convention: use Mutations for operations that change state

**Q3: Explain the `!` and `[]` in GraphQL types?**

A:
- `String!` = Required string (not null)
- `[String]` = Array of optional strings
- `[String!]!` = Required array of required strings

**Q4: How is GraphQL better than REST for related data?**

A:
- REST requires multiple requests
- GraphQL gets all related data in one request
- Prevents over-fetching and under-fetching
- Reduces bandwidth usage

**Q5: How do you handle errors in GraphQL?**

A:
- GraphQL returns 200 OK with errors in response
- Errors array contains details
- Client can check both data and errors

```javascript
{
  "data": { "user": null },
  "errors": [{
    "message": "User not found",
    "path": ["user"]
  }]
}
```

---

## 🔐 Best Practices

1. **Use Input Types** - Group mutation parameters
2. **Batch Operations** - Use query aliases for multiple similar operations
3. **Pagination** - Always paginate large result sets
4. **Error Handling** - Throw descriptive errors
5. **Field Resolvers** - Use for computed fields
6. **Populate Data** - Use Mongoose populate for relationships
7. **Validation** - Validate input in resolvers
8. **Authorization** - Add auth context in future updates

---

## 📚 Documentation Files

1. **GRAPHQL_CONCEPTS.md** - Deep dive into GraphQL concepts
2. **GRAPHQL_QUERIES.md** - Ready-to-use query examples
3. **REST_vs_GRAPHQL.md** - Detailed comparison with examples

---

## ✅ Checklist

- [x] GraphQL schema with multiple types
- [x] Relationships between types
- [x] Queries for reading data
- [x] Mutations for writing data
- [x] Field resolvers for computed values
- [x] Mongoose integration
- [x] Error handling
- [x] Pagination support
- [x] Search functionality
- [x] Filtering capabilities

---

## 🚀 What's Next?

After understanding basics:

1. **Add Authentication** - JWT tokens, context-based auth
2. **Add Subscriptions** - Real-time data updates
3. **Add Caching** - Redis for performance
4. **Add Rate Limiting** - Prevent abuse
5. **Add File Uploads** - Avatar and featured images
6. **Add Pagination Cursor** - More efficient pagination
7. **Optimize Queries** - Data loader for N+1 problem
8. **Deploy** - AWS, Heroku, or Vercel

---

## 📝 Notes

- This is an educational project for learning GraphQL
- Compare queries with REST to understand benefits
- Experiment with different query patterns
- Check GraphQL playground for auto-complete
- Understand relationships and how GraphQL handles them

---

**Happy Learning! 🎉**

GraphQL is powerful once you understand the concepts. Use this project to explore and experiment!

