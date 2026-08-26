// apollo-server-express is deprecated (Apollo Server 4+ dropped it for
// @apollo/server) and its `gql` re-export went with it - graphql-tag is the
// standalone package that always provided the real implementation.
const { gql } = require('graphql-tag');

// GraphQL Schema Definition
const typeDefs = gql`
  # ====== TYPES ======

  # User Type
  type User {
    id: ID!
    name: String!
    email: String!
    bio: String
    avatar: String
    posts: [Post!]!
    followers: [User!]!
    following: [User!]!
    postsCount: Int!
    followersCount: Int!
    followingCount: Int!
    createdAt: String!
  }

  # Post Type
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    category: Category
    tags: [String!]!
    published: Boolean!
    views: Int!
    likes: [User!]!
    likesCount: Int!
    comments: [Comment!]!
    commentsCount: Int!
    featuredImage: String
    createdAt: String!
    updatedAt: String!
  }

  # Comment Type
  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
    likes: [User!]!
    likesCount: Int!
    replies: [Comment!]!
    repliesCount: Int!
    createdAt: String!
  }

  # Category Type
  type Category {
    id: ID!
    name: String!
    description: String
    slug: String
    posts: [Post!]!
    postsCount: Int!
    createdAt: String!
  }

  # ====== QUERIES ======
  
  type Query {
    # ===== USER QUERIES =====
    
    # Get single user by ID
    user(id: ID!): User
    
    # Get user by email
    userByEmail(email: String!): User
    
    # Get all users with pagination
    users(skip: Int = 0, limit: Int = 10): [User!]!
    
    # Search users by name
    searchUsers(query: String!): [User!]!
    
    # Get user followers
    followers(userId: ID!): [User!]!
    
    # Get user following
    following(userId: ID!): [User!]!

    # ===== POST QUERIES =====
    
    # Get single post by ID
    post(id: ID!): Post
    
    # Get all posts with pagination and filters
    posts(
      skip: Int = 0
      limit: Int = 10
      published: Boolean
      authorId: ID
      categoryId: ID
    ): [Post!]!
    
    # Get posts by author
    postsByAuthor(authorId: ID!, skip: Int = 0, limit: Int = 10): [Post!]!
    
    # Get posts by category
    postsByCategory(categoryId: ID!, skip: Int = 0, limit: Int = 10): [Post!]!
    
    # Search posts by title or content
    searchPosts(query: String!): [Post!]!
    
    # Get trending posts (by likes and views)
    trendingPosts(limit: Int = 10): [Post!]!
    
    # Get recent posts
    recentPosts(limit: Int = 10): [Post!]!

    # ===== COMMENT QUERIES =====
    
    # Get comments for a post
    postComments(postId: ID!): [Comment!]!
    
    # Get single comment
    comment(id: ID!): Comment

    # ===== CATEGORY QUERIES =====
    
    # Get all categories
    categories: [Category!]!
    
    # Get single category
    category(id: ID!): Category
    
    # Get category by slug
    categoryBySlug(slug: String!): Category
  }

  # ====== MUTATIONS ======
  
  type Mutation {
    # ===== USER MUTATIONS =====
    
    # Create new user
    createUser(input: CreateUserInput!): User!
    
    # Update user profile
    updateUser(id: ID!, input: UpdateUserInput!): User!
    
    # Delete user
    deleteUser(id: ID!): Boolean!
    
    # Follow a user
    followUser(userId: ID!, followId: ID!): User!
    
    # Unfollow a user
    unfollowUser(userId: ID!, followId: ID!): User!

    # ===== POST MUTATIONS =====
    
    # Create new post
    createPost(input: CreatePostInput!): Post!
    
    # Update post
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    
    # Delete post
    deletePost(id: ID!): Boolean!
    
    # Publish post
    publishPost(id: ID!): Post!
    
    # Unpublish post
    unpublishPost(id: ID!): Post!
    
    # Like post
    likePost(postId: ID!, userId: ID!): Post!
    
    # Unlike post
    unlikePost(postId: ID!, userId: ID!): Post!
    
    # Increment post views
    incrementPostViews(postId: ID!): Post!

    # ===== COMMENT MUTATIONS =====
    
    # Create comment
    createComment(input: CreateCommentInput!): Comment!
    
    # Update comment
    updateComment(id: ID!, text: String!): Comment!
    
    # Delete comment
    deleteComment(id: ID!): Boolean!
    
    # Like comment
    likeComment(commentId: ID!, userId: ID!): Comment!
    
    # Unlike comment
    unlikeComment(commentId: ID!, userId: ID!): Comment!
    
    # Reply to comment
    replyComment(input: ReplyCommentInput!): Comment!

    # ===== CATEGORY MUTATIONS =====
    
    # Create category
    createCategory(input: CreateCategoryInput!): Category!
    
    # Update category
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    
    # Delete category
    deleteCategory(id: ID!): Boolean!
  }

  # ====== INPUT TYPES ======
  
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

  input CreatePostInput {
    title: String!
    content: String!
    authorId: ID!
    categoryId: ID
    tags: [String!]
    featuredImage: String
  }

  input UpdatePostInput {
    title: String
    content: String
    categoryId: ID
    tags: [String!]
    featuredImage: String
  }

  input CreateCommentInput {
    text: String!
    authorId: ID!
    postId: ID!
  }

  input ReplyCommentInput {
    text: String!
    authorId: ID!
    parentCommentId: ID!
    postId: ID!
  }

  input CreateCategoryInput {
    name: String!
    description: String
    slug: String
  }

  input UpdateCategoryInput {
    name: String
    description: String
    slug: String
  }
`;

module.exports = typeDefs;
