# GraphQL Query Examples 🔍

Ready-to-use GraphQL queries and mutations for the blog project. Test these in GraphQL Playground.

---

## 📚 How to Use This Guide

1. Open GraphQL Playground: `http://localhost:4000/graphql`
2. Copy any query/mutation below
3. Paste into the left panel
4. Click ▶️ to execute
5. See results on the right

---

## 👥 USER QUERIES

### 1. Get Single User

```graphql
query {
  user(id: "USER_ID") {
    id
    name
    email
    bio
    avatar
    createdAt
  }
}
```

### 2. Get User with All Details

```graphql
query {
  user(id: "USER_ID") {
    id
    name
    email
    bio
    avatar
    postsCount
    followersCount
    followingCount
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
    createdAt
  }
}
```

### 3. Get All Users with Pagination

```graphql
query {
  users(skip: 0, limit: 10) {
    id
    name
    email
    postsCount
    followersCount
  }
}
```

### 4. Search Users by Name

```graphql
query {
  searchUsers(query: "John") {
    id
    name
    email
    bio
  }
}
```

### 5. Get User's Followers

```graphql
query {
  followers(userId: "USER_ID") {
    id
    name
    email
    bio
  }
}
```

### 6. Get User Following

```graphql
query {
  following(userId: "USER_ID") {
    id
    name
    email
  }
}
```

---

## 📝 POST QUERIES

### 1. Get Single Post

```graphql
query {
  post(id: "POST_ID") {
    id
    title
    content
    published
    views
    author {
      id
      name
      email
    }
    category {
      id
      name
    }
    tags
    likesCount
    commentsCount
    createdAt
  }
}
```

### 2. Get All Published Posts

```graphql
query {
  posts(
    skip: 0
    limit: 10
    published: true
  ) {
    id
    title
    author {
      name
      avatar
    }
    category {
      name
    }
    likesCount
    commentsCount
    views
    createdAt
  }
}
```

### 3. Get Posts by Specific Author

```graphql
query {
  postsByAuthor(
    authorId: "USER_ID"
    skip: 0
    limit: 5
  ) {
    id
    title
    published
    likesCount
    createdAt
  }
}
```

### 4. Get Posts by Category

```graphql
query {
  postsByCategory(
    categoryId: "CATEGORY_ID"
    skip: 0
    limit: 10
  ) {
    id
    title
    author {
      name
    }
    likesCount
    createdAt
  }
}
```

### 5. Search Posts

```graphql
query {
  searchPosts(query: "GraphQL") {
    id
    title
    content
    author {
      name
    }
    likesCount
  }
}
```

### 6. Get Trending Posts

```graphql
query {
  trendingPosts(limit: 10) {
    id
    title
    author {
      name
      avatar
    }
    likesCount
    views
    createdAt
  }
}
```

### 7. Get Recent Posts

```graphql
query {
  recentPosts(limit: 5) {
    id
    title
    author {
      name
    }
    comments {
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

### 8. Get Post with Full Details

```graphql
query {
  post(id: "POST_ID") {
    id
    title
    content
    author {
      id
      name
      email
      avatar
    }
    category {
      id
      name
      slug
    }
    tags
    published
    views
    likes {
      id
      name
    }
    likesCount
    comments {
      id
      text
      author {
        name
        avatar
      }
      likesCount
      createdAt
    }
    commentsCount
    featuredImage
    createdAt
    updatedAt
  }
}
```

---

## 💬 COMMENT QUERIES

### 1. Get All Comments for a Post

```graphql
query {
  postComments(postId: "POST_ID") {
    id
    text
    author {
      id
      name
      avatar
    }
    likes {
      name
    }
    likesCount
    replies {
      id
      text
      author {
        name
      }
      likesCount
    }
    repliesCount
    createdAt
  }
}
```

### 2. Get Single Comment

```graphql
query {
  comment(id: "COMMENT_ID") {
    id
    text
    author {
      name
      email
    }
    post {
      id
      title
    }
    likes {
      name
    }
    likesCount
    replies {
      text
      author {
        name
      }
    }
    createdAt
  }
}
```

### 3. Get Comment Replies (Nested)

```graphql
query {
  comment(id: "COMMENT_ID") {
    text
    author {
      name
    }
    replies {
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
}
```

---

## 📂 CATEGORY QUERIES

### 1. Get All Categories

```graphql
query {
  categories {
    id
    name
    slug
    description
    postsCount
  }
}
```

### 2. Get Single Category

```graphql
query {
  category(id: "CATEGORY_ID") {
    id
    name
    slug
    description
    posts {
      id
      title
      author {
        name
      }
      likesCount
    }
    postsCount
  }
}
```

### 3. Get Category by Slug

```graphql
query {
  categoryBySlug(slug: "technology") {
    id
    name
    posts {
      title
      author {
        name
      }
    }
  }
}
```

---

## ✏️ USER MUTATIONS

### 1. Create User

```graphql
mutation {
  createUser(input: {
    name: "John Doe"
    email: "john@example.com"
    bio: "Full Stack Developer"
    avatar: "https://example.com/avatar.jpg"
  }) {
    id
    name
    email
    createdAt
  }
}
```

### 2. Update User

```graphql
mutation {
  updateUser(id: "USER_ID", input: {
    bio: "Updated bio"
    avatar: "https://example.com/new-avatar.jpg"
  }) {
    id
    name
    bio
    avatar
  }
}
```

### 3. Delete User

```graphql
mutation {
  deleteUser(id: "USER_ID")
}
```

### 4. Follow a User

```graphql
mutation {
  followUser(userId: "FOLLOWER_ID", followId: "USER_TO_FOLLOW_ID") {
    id
    name
    followingCount
    following {
      name
    }
  }
}
```

### 5. Unfollow a User

```graphql
mutation {
  unfollowUser(userId: "FOLLOWER_ID", followId: "USER_TO_UNFOLLOW_ID") {
    id
    name
    followingCount
  }
}
```

---

## 📖 POST MUTATIONS

### 1. Create Post

```graphql
mutation {
  createPost(input: {
    title: "Getting Started with GraphQL"
    content: "A comprehensive guide to learning GraphQL..."
    authorId: "USER_ID"
    categoryId: "CATEGORY_ID"
    tags: ["graphql", "api", "tutorial"]
    featuredImage: "https://example.com/image.jpg"
  }) {
    id
    title
    author {
      name
    }
    category {
      name
    }
    tags
    createdAt
  }
}
```

### 2. Update Post

```graphql
mutation {
  updatePost(id: "POST_ID", input: {
    title: "Updated Title"
    content: "Updated content"
    tags: ["graphql", "api"]
  }) {
    id
    title
    content
    updatedAt
  }
}
```

### 3. Delete Post

```graphql
mutation {
  deletePost(id: "POST_ID")
}
```

### 4. Publish Post

```graphql
mutation {
  publishPost(id: "POST_ID") {
    id
    title
    published
  }
}
```

### 5. Unpublish Post

```graphql
mutation {
  unpublishPost(id: "POST_ID") {
    id
    published
  }
}
```

### 6. Like Post

```graphql
mutation {
  likePost(postId: "POST_ID", userId: "USER_ID") {
    id
    title
    likesCount
    likes {
      name
    }
  }
}
```

### 7. Unlike Post

```graphql
mutation {
  unlikePost(postId: "POST_ID", userId: "USER_ID") {
    id
    likesCount
  }
}
```

### 8. Increment Post Views

```graphql
mutation {
  incrementPostViews(postId: "POST_ID") {
    id
    views
  }
}
```

---

## 💭 COMMENT MUTATIONS

### 1. Create Comment

```graphql
mutation {
  createComment(input: {
    text: "Great post! Very helpful."
    authorId: "USER_ID"
    postId: "POST_ID"
  }) {
    id
    text
    author {
      name
    }
    createdAt
  }
}
```

### 2. Update Comment

```graphql
mutation {
  updateComment(
    id: "COMMENT_ID"
    text: "Updated comment text"
  ) {
    id
    text
    updatedAt: createdAt
  }
}
```

### 3. Delete Comment

```graphql
mutation {
  deleteComment(id: "COMMENT_ID")
}
```

### 4. Like Comment

```graphql
mutation {
  likeComment(commentId: "COMMENT_ID", userId: "USER_ID") {
    id
    text
    likesCount
  }
}
```

### 5. Unlike Comment

```graphql
mutation {
  unlikeComment(commentId: "COMMENT_ID", userId: "USER_ID") {
    id
    likesCount
  }
}
```

### 6. Reply to Comment

```graphql
mutation {
  replyComment(input: {
    text: "I agree with you"
    authorId: "USER_ID"
    postId: "POST_ID"
    parentCommentId: "PARENT_COMMENT_ID"
  }) {
    id
    text
    author {
      name
    }
    createdAt
  }
}
```

---

## 📂 CATEGORY MUTATIONS

### 1. Create Category

```graphql
mutation {
  createCategory(input: {
    name: "Technology"
    slug: "technology"
    description: "Posts about technology and programming"
  }) {
    id
    name
    slug
  }
}
```

### 2. Update Category

```graphql
mutation {
  updateCategory(id: "CATEGORY_ID", input: {
    description: "Updated description"
  }) {
    id
    name
    description
  }
}
```

### 3. Delete Category

```graphql
mutation {
  deleteCategory(id: "CATEGORY_ID")
}
```

---

## 🔄 Complex Real-World Queries

### 1. Blog Homepage - Get Everything Needed

```graphql
query GetBlogHomepage {
  recentPosts: posts(limit: 10, published: true) {
    id
    title
    content
    featuredImage
    author {
      id
      name
      avatar
    }
    category {
      name
      slug
    }
    tags
    likesCount
    commentsCount
    views
    comments(limit: 3) {
      text
      author {
        name
      }
    }
    createdAt
  }
  
  trendingPosts: trendingPosts(limit: 5) {
    id
    title
    author {
      name
    }
    likesCount
  }
  
  categories {
    id
    name
    slug
  }
}
```

### 2. User Profile Page - All User Info

```graphql
query GetUserProfile($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    bio
    avatar
    postsCount
    followersCount
    followingCount
    
    posts(limit: 5) {
      id
      title
      published
      likesCount
      createdAt
    }
    
    followers(limit: 10) {
      id
      name
      avatar
    }
    
    following(limit: 10) {
      id
      name
    }
  }
}
```

**Variables:**
```json
{
  "userId": "123"
}
```

### 3. Post Detail Page with Comments

```graphql
query GetPostDetail($postId: ID!) {
  post(id: $postId) {
    id
    title
    content
    author {
      id
      name
      email
      avatar
      followersCount
    }
    category {
      name
    }
    tags
    featuredImage
    published
    views
    likesCount
    commentsCount
    
    comments {
      id
      text
      author {
        id
        name
        avatar
      }
      likesCount
      replies {
        id
        text
        author {
          name
        }
        likesCount
      }
      createdAt
    }
    
    createdAt
  }
}
```

**Variables:**
```json
{
  "postId": "456"
}
```

### 4. Batch Create Multiple Posts

```graphql
mutation CreateMultiplePosts {
  post1: createPost(input: {
    title: "Post 1"
    content: "Content 1"
    authorId: "USER_ID"
    tags: ["tag1"]
  }) {
    id
    title
  }
  
  post2: createPost(input: {
    title: "Post 2"
    content: "Content 2"
    authorId: "USER_ID"
    tags: ["tag2"]
  }) {
    id
    title
  }
  
  post3: createPost(input: {
    title: "Post 3"
    content: "Content 3"
    authorId: "USER_ID"
    tags: ["tag3"]
  }) {
    id
    title
  }
}
```

### 5. User Interaction Flow

```graphql
mutation UserInteraction {
  # Create a comment
  comment: createComment(input: {
    text: "Great post!"
    authorId: "USER_ID"
    postId: "POST_ID"
  }) {
    id
  }
  
  # Like the post
  like: likePost(postId: "POST_ID", userId: "USER_ID") {
    likesCount
  }
  
  # Follow the author
  follow: followUser(userId: "FOLLOWER_ID", followId: "AUTHOR_ID") {
    followingCount
  }
}
```

---

## 🧪 Testing Sequence

### Step 1: Create Users
```graphql
mutation {
  createUser(input: {
    name: "Alice"
    email: "alice@test.com"
    bio: "Blogger"
  }) {
    id
  }
}
```
Save the returned ID.

### Step 2: Create Category
```graphql
mutation {
  createCategory(input: {
    name: "Technology"
    slug: "tech"
  }) {
    id
  }
}
```

### Step 3: Create Post
```graphql
mutation {
  createPost(input: {
    title: "My First Post"
    content: "This is my first GraphQL post"
    authorId: "SAVED_USER_ID"
    categoryId: "SAVED_CATEGORY_ID"
  }) {
    id
  }
}
```

### Step 4: Query Post
```graphql
query {
  post(id: "SAVED_POST_ID") {
    title
    author {
      name
    }
    category {
      name
    }
  }
}
```

### Step 5: Add Comment
```graphql
mutation {
  createComment(input: {
    text: "Nice post!"
    authorId: "ANOTHER_USER_ID"
    postId: "SAVED_POST_ID"
  }) {
    id
  }
}
```

### Step 6: Like Post
```graphql
mutation {
  likePost(postId: "SAVED_POST_ID", userId: "ANOTHER_USER_ID") {
    likesCount
  }
}
```

---

## 📝 Tips

1. **Copy & Paste IDs** - Replace `USER_ID`, `POST_ID` with actual IDs from responses
2. **Use Variables** - Better practice: use `$variable` instead of hardcoding
3. **Incremental Testing** - Start simple, build up complexity
4. **Check Results** - Look at response structure carefully
5. **Export Results** - GraphQL Playground has export functionality

---

**Happy Testing! 🚀**

