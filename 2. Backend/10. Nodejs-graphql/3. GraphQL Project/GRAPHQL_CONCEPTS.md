# GraphQL Concepts Deep Dive 📖

A comprehensive guide to understanding GraphQL concepts through practical examples.

---

## 🎯 What is GraphQL?

GraphQL is a **query language** for APIs that allows clients to request exactly what data they need.

**Key Points:**
- Declarative data fetching
- Strongly typed schema
- Single endpoint
- No over-fetching or under-fetching
- Better for complex data relationships

---

## 1️⃣ Schema & Types

### Basic Types

```graphql
# Scalar types (built-in)
String      # Text
Int         # Integer number
Float       # Decimal number
Boolean     # true/false
ID          # Unique identifier

# Custom object types
type User {
  id: ID!
  name: String!
  age: Int
  email: String!
  isActive: Boolean!
}
```

### Type Modifiers

```graphql
String      # Nullable string (can be null)
String!     # Required string (cannot be null)
[String]    # Array of nullable strings
[String!]   # Array of required strings
[String!]!  # Required array of required strings
```

**Real Example:**
```graphql
type Post {
  id: ID!                    # Required, unique
  title: String!             # Required, text
  views: Int                 # Optional number
  tags: [String!]!           # Required array of required tags
  author: User!              # Required User object
  comments: [Comment!]!      # Required array of Comment objects
}
```

---

## 2️⃣ Queries (Reading Data)

Queries are how you **read/fetch** data from GraphQL.

### Simple Query

```graphql
query {
  user(id: "123") {
    name
    email
  }
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Nested Query (Relationships)

```graphql
query {
  user(id: "123") {
    name
    posts {
      title
      author {
        name
      }
      comments {
        text
      }
    }
  }
}
```

**Advantages:**
✅ Single request
✅ Nested data fetched in one go
✅ No N+1 problem
✅ Bandwidth efficient

### Query with Arguments

```graphql
query {
  posts(published: true, limit: 10, skip: 0) {
    id
    title
    createdAt
  }
}
```

### Query with Alias

Multiple queries of same type with alias:

```graphql
query {
  recentPosts: posts(limit: 5, published: true) {
    title
  }
  
  trendingPosts: posts(published: true) {
    title
    likesCount
  }
}
```

### Query with Variables

Variables prevent query injection and enable reuse:

```graphql
query GetUserPosts($userId: ID!, $limit: Int) {
  posts(authorId: $userId, limit: $limit) {
    id
    title
    createdAt
  }
}
```

**Variables (JSON):**
```json
{
  "userId": "123",
  "limit": 10
}
```

### Query with Fragments

Reuse query structure:

```graphql
fragment UserInfo on User {
  id
  name
  email
  bio
}

query {
  user(id: "123") {
    ...UserInfo
    posts {
      title
    }
  }
}
```

---

## 3️⃣ Mutations (Writing Data)

Mutations are how you **create, update, or delete** data.

### Simple Mutation

```graphql
mutation {
  createUser(input: {
    name: "Jane"
    email: "jane@example.com"
  }) {
    id
    name
    email
    createdAt
  }
}
```

**Response:**
```json
{
  "data": {
    "createUser": {
      "id": "789",
      "name": "Jane",
      "email": "jane@example.com",
      "createdAt": "2024-01-15"
    }
  }
}
```

### Mutation with Input Type

```graphql
mutation CreateNewPost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    author {
      name
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "title": "GraphQL Guide",
    "content": "Complete guide to GraphQL",
    "authorId": "123",
    "tags": ["graphql", "api"]
  }
}
```

### Batch Mutations

Execute multiple mutations:

```graphql
mutation {
  user1: createUser(input: { name: "User1", email: "user1@test.com" }) {
    id
    name
  }
  
  user2: createUser(input: { name: "User2", email: "user2@test.com" }) {
    id
    name
  }
  
  user3: createUser(input: { name: "User3", email: "user3@test.com" }) {
    id
    name
  }
}
```

### Update Mutation

```graphql
mutation UpdateUserBio($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    bio
  }
}
```

### Delete Mutation

```graphql
mutation {
  deletePost(id: "postId")  # Returns Boolean
}

# Response
{
  "data": {
    "deletePost": true
  }
}
```

---

## 4️⃣ Resolvers

Resolvers are **functions** that return data for each field.

### Query Resolver

```javascript
const resolvers = {
  Query: {
    user: async (_, { id }) => {
      // _ = parent (not used in root Query)
      // { id } = arguments from GraphQL query
      return await User.findById(id);
    }
  }
};
```

### Nested Field Resolver

```javascript
const resolvers = {
  Post: {
    author: async (post) => {
      // post = parent object from query
      // Fetch author from post.author ID
      return await User.findById(post.author);
    },
    
    commentsCount: (post) => {
      // Computed field from array length
      return post.comments?.length || 0;
    }
  }
};
```

### How It Works

```graphql
query {
  post(id: "123") {        # Calls Query.post resolver
    title                   # Returns post.title
    author {                # Calls Post.author resolver
      name                  # Returns author.name
    }
    commentsCount           # Calls Post.commentsCount resolver
  }
}
```

**Resolver Execution Order:**
1. `Query.post` resolver - fetches post
2. `Post.author` resolver - fetches author
3. `Post.commentsCount` resolver - calculates count

---

## 5️⃣ Input Types

Input types are used for **mutation arguments**.

```graphql
input CreateUserInput {
  name: String!
  email: String!
  bio: String
  avatar: String
}

input UpdateUserInput {
  name: String
  bio: String
  avatar: String
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
}
```

**Usage:**
```graphql
mutation {
  createUser(input: {
    name: "John"
    email: "john@example.com"
    bio: "Developer"
  }) {
    id
    name
  }
}
```

---

## 6️⃣ Relationships & Associations

### One-to-Many: User has many Posts

```graphql
type User {
  id: ID!
  name: String!
  posts: [Post!]!        # User has multiple posts
}

type Post {
  id: ID!
  title: String!
  author: User!          # Post has one author
}
```

**Query Both Directions:**
```graphql
# Get user with posts
query {
  user(id: "123") {
    name
    posts {
      title
    }
  }
}

# Get post with author
query {
  post(id: "456") {
    title
    author {
      name
    }
  }
}
```

### Many-to-Many: Users can like Posts

```graphql
type Post {
  id: ID!
  title: String!
  likes: [User!]!        # Multiple users can like
  likesCount: Int!       # Computed field
}

type User {
  id: ID!
  name: String!
  likedPosts: [Post!]!   # User can like multiple posts
}
```

**Mutations:**
```graphql
mutation {
  likePost(postId: "456", userId: "123") {
    id
    title
    likes {
      name
    }
    likesCount
  }
}
```

### Self-Referencing: Comments with Replies

```graphql
type Comment {
  id: ID!
  text: String!
  author: User!
  replies: [Comment!]!   # Comments can reply to each other
  parent: Comment        # Parent comment (if reply)
}
```

**Query Nested Comments:**
```graphql
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
      replies {        # Nested replies
        text
      }
    }
  }
}
```

---

## 7️⃣ Validation & Error Handling

### Schema-Level Validation

```graphql
input CreatePostInput {
  title: String!         # Required
  content: String!       # Required
  authorId: ID!          # Required
}

# GraphQL automatically validates:
# - Required fields are present
# - Types are correct
# - IDs are valid format
```

### Resolver-Level Validation

```javascript
createPost: async (_, { input }) => {
  // Validate input
  if (input.title.length < 5) {
    throw new Error('Title must be at least 5 characters');
  }
  
  if (!input.authorId) {
    throw new Error('Author ID is required');
  }
  
  // Create post
  const post = new Post(input);
  return await post.save();
}
```

### Error Response

```json
{
  "data": null,
  "errors": [{
    "message": "Title must be at least 5 characters",
    "path": ["createPost"],
    "extensions": {
      "code": "VALIDATION_ERROR"
    }
  }]
}
```

---

## 8️⃣ Pagination

### Offset-Based Pagination

```graphql
query {
  posts(skip: 10, limit: 5) {
    id
    title
  }
}
```

**Resolver:**
```javascript
posts: async (_, { skip = 0, limit = 10 }) => {
  return await Post.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
}
```

**Usage:**
- Page 1: skip=0, limit=10
- Page 2: skip=10, limit=10
- Page 3: skip=20, limit=10

### Cursor-Based Pagination (Better for Real-Time)

```graphql
query {
  posts(after: "cursor123", first: 10) {
    edges {
      node {
        id
        title
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
```

---

## 9️⃣ Field Selection & Efficiency

GraphQL's core benefit - select only needed fields:

```graphql
# REST returns full user object
GET /api/users/123
# Response: { id, name, email, bio, avatar, createdAt, ... }

# GraphQL: Select only what you need
query {
  user(id: "123") {
    name
    email
  }
}
# Response: { name, email } - No extra data!
```

**Mobile Optimization:**
```graphql
# Desktop: Full data
query {
  post(id: "123") {
    id
    title
    content
    author { name, avatar }
    likes { id, name }
    comments { text, author }
  }
}

# Mobile: Minimal data
query {
  post(id: "123") {
    title
    author { name }
    likesCount
  }
}
```

---

## 🔟 Introspection & Documentation

GraphQL provides built-in API documentation.

**Introspection Query:**
```graphql
query {
  __type(name: "Post") {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "__type": {
      "name": "Post",
      "fields": [
        {
          "name": "id",
          "type": {
            "name": "ID",
            "kind": "SCALAR"
          }
        },
        {
          "name": "title",
          "type": {
            "name": "String",
            "kind": "SCALAR"
          }
        }
      ]
    }
  }
}
```

---

## 1️⃣1️⃣ Common Patterns

### Pattern 1: Get Related Data (No Extra Requests)

**Problem:** Need user AND their posts

**GraphQL Solution:**
```graphql
query {
  user(id: "123") {
    name
    posts {
      title
      likesCount
    }
  }
}
```

### Pattern 2: Computed Fields

**Problem:** Need post likes count

**GraphQL Solution:**
```graphql
type Post {
  # Field resolver automatically computes this
  likesCount: Int!
}

query {
  posts {
    title
    likesCount  # No separate query needed
  }
}
```

### Pattern 3: Batch Operations

**Problem:** Create multiple items at once

**GraphQL Solution:**
```graphql
mutation {
  comment1: createComment(input: {...}) { id }
  comment2: createComment(input: {...}) { id }
  comment3: createComment(input: {...}) { id }
}
```

### Pattern 4: Conditional Fields

**Problem:** Only fetch certain fields based on condition

**GraphQL Solution:**
```graphql
query GetUser($includeEmail: Boolean!) {
  user(id: "123") {
    name
    email @include(if: $includeEmail)
    bio @skip(if: $hidePrivateInfo)
  }
}
```

---

## 1️⃣2️⃣ Best Practices

### ✅ DO:

1. **Use Input Types** for mutations
   ```graphql
   input CreatePostInput { ... }
   createPost(input: CreatePostInput!): Post!
   ```

2. **Return modified object** from mutations
   ```graphql
   createUser(input: ...): User!  # Return created user
   ```

3. **Use meaningful names**
   ```graphql
   user(id: ID!)              # Clear
   get_user_from_database()   # Avoid
   ```

4. **Implement pagination** for large datasets
   ```graphql
   posts(skip: Int, limit: Int): [Post!]!
   ```

5. **Add field descriptions**
   ```graphql
   """
   Get user by their unique ID
   """
   user(id: ID!): User
   ```

### ❌ DON'T:

1. **Return data not requested**
   ```graphql
   # Bad: Always return all fields
   # Good: Only return requested fields
   ```

2. **N+1 queries** in resolvers
   ```javascript
   // Bad: Query in loop
   users.map(user => User.findById(user.id))
   
   // Good: Use DataLoader or batch query
   ```

3. **Fetch unnecessary related data**
   ```graphql
   # Bad: Always populate comments
   posts { ... comments { ... } }
   
   # Good: Let client request
   posts { ... comments @include(if: $includeComments) }
   ```

---

## 🎓 Understanding Flow

### How GraphQL Processes a Query

1. **Parse** - Check syntax
2. **Validate** - Check against schema
3. **Execute** - Call resolvers
4. **Resolve Fields** - Get data
5. **Format** - Return JSON

**Example:**
```graphql
query {
  user(id: "123") {
    name
    posts {
      title
    }
  }
}
```

**Execution:**
```
1. Query.user resolver called with id="123"
   ↓ Returns User object
2. User.posts resolver called for each user
   ↓ Returns [Post]
3. Post.title resolver called for each post
   ↓ Returns title string
4. Format and return all data
```

---

## 📊 Comparison Table

| Aspect | Query | Mutation |
|--------|-------|----------|
| **Purpose** | Read data | Write data |
| **Side Effects** | None | Can have side effects |
| **Multiple Calls** | Parallel execution | Sequential execution |
| **Error Handling** | Partial data possible | Transaction-like |
| **Caching** | Can be cached | Not cached |
| **REST Equivalent** | GET | POST, PUT, DELETE |

---

**Master these concepts and you'll understand GraphQL deeply! 🚀**

