const db = require("../db/db");

/*
  RELATIONSHIPS IN POSTGRESQL - COMPREHENSIVE EXAMPLES
  
  This file demonstrates all three types of relationships:
  1. One-to-Many (1:M) - Users → Posts
  2. One-to-Many (1:M) - Posts → Comments
  3. Many-to-Many (M:M) - Posts ↔ Tags (via junction table)
  
  Plus complex multi-table queries with 3+ tables.
*/



// TABLE CREATION:

// ONE-TO-MANY RELATIONSHIP (Level 1): Users → Posts
async function createPostsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS posts(
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await db.query(createTableQuery);
    console.log("Posts table created successfully!");
  } catch (e) {
    console.error("Error creating posts table:", e);
  }
}


// ONE-TO-MANY RELATIONSHIP (Level 2): Posts → Comments
async function createCommentsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS comments(
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await db.query(createTableQuery);
    console.log("Comments table created successfully!");
  } catch (e) {
    console.error("Error creating comments table:", e);
  }
}


// MANY-TO-MANY RELATIONSHIP: Posts ↔ Tags (via junction table)
async function createTagsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tags(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await db.query(createTableQuery);
    console.log("Tags table created successfully!");
  } catch (e) {
    console.error("Error creating tags table:", e);
  }
}


// JUNCTION TABLE for Many-to-Many relationship
async function createPostTagsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS post_tags(
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, tag_id)
    )
  `;

  try {
    await db.query(createTableQuery);
    console.log("Post_Tags junction table created successfully!");
  } catch (e) {
    console.error("Error creating post_tags table:", e);
  }
}



// ONE-TO-MANY OPERATIONS: Users → Posts

// Insert a new post for a user
async function insertNewPost(title, content, userId) {
  const insertPostQuery = `
    INSERT INTO posts (title, content, user_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  try {
    const result = await db.query(insertPostQuery, [title, content, userId]);
    return result.rows[0];
  } catch (e) {
    console.error("Error inserting new post:", e);
    throw e;
  }
}

// Get all posts for a specific user
async function getPostsByUserId(userId) {
  const getPostsQuery = `
    SELECT 
      p.id,
      p.title,
      p.content,
      p.created_at,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
  `;

  try {
    const result = await db.query(getPostsQuery, [userId]);
    return result.rows;
  } catch (e) {
    console.error("Error fetching posts by user ID:", e);
    throw e;
  }
}




// ONE-TO-MANY OPERATIONS: Posts → Comments:

// Insert a comment on a post
async function insertComment(content, postId, userId) {
  const insertCommentQuery = `
    INSERT INTO comments (content, post_id, user_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  try {
    const result = await db.query(insertCommentQuery, [content, postId, userId]);
    return result.rows[0];
  } catch (e) {
    console.error("Error inserting comment:", e);
    throw e;
  }
}


// Get all comments for a specific post
async function getCommentsByPostId(postId) {
  const getCommentsQuery = `
    SELECT 
      c.id,
      c.content,
      c.created_at,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
  `;

  try {
    const result = await db.query(getCommentsQuery, [postId]);
    return result.rows;
  } catch (e) {
    console.error("Error fetching comments by post ID:", e);
    throw e;
  }
}



// MANY-TO-MANY OPERATIONS: Posts ↔ Tags:

// Create a tag
async function createTag(tagName) {
  const insertTagQuery = `
    INSERT INTO tags (name)
    VALUES ($1)
    ON CONFLICT (name) DO UPDATE SET name = $1
    RETURNING *
  `;

  try {
    const result = await db.query(insertTagQuery, [tagName]);
    return result.rows[0];
  } catch (e) {
    console.error("Error creating tag:", e);
    throw e;
  }
}


// Add tag to a post
async function addTagToPost(postId, tagId) {
  const addTagQuery = `
    INSERT INTO post_tags (post_id, tag_id)
    VALUES ($1, $2)
    ON CONFLICT (post_id, tag_id) DO NOTHING
    RETURNING *
  `;

  try {
    const result = await db.query(addTagQuery, [postId, tagId]);
    return result.rows[0];
  } catch (e) {
    console.error("Error adding tag to post:", e);
    throw e;
  }
}


// Get all posts with their tags
async function getPostsWithTags() {
  const getPostsWithTagsQuery = `
    SELECT 
      p.id,
      p.title,
      p.content,
      u.name as user_name,
      STRING_AGG(t.name, ', ') as tags
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    GROUP BY p.id, p.title, p.content, u.name
    ORDER BY p.id DESC
  `;

  try {
    const result = await db.query(getPostsWithTagsQuery);
    return result.rows;
  } catch (e) {
    console.error("Error fetching posts with tags:", e);
    throw e;
  }
}




// COMPLEX MULTI-TABLE QUERIES (3+ Tables)

// Get full post details with comments and tags (4 tables: users, posts, comments, tags)
async function getFullPostDetails(postId) {
  const getFullDetailsQuery = `
    SELECT 
      p.id,
      p.title,
      p.content,
      p.created_at,
      u.name as author_name,
      u.email as author_email,
      COUNT(DISTINCT c.id) as comment_count,
      ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL) as tags,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'comment_id', c.id,
          'comment_content', c.content,
          'commenter_name', cu.name,
          'created_at', c.created_at
        )
      ) FILTER (WHERE c.id IS NOT NULL) as comments
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    LEFT JOIN users cu ON c.user_id = cu.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = $1
    GROUP BY p.id, p.title, p.content, p.created_at, u.name, u.email
  `;

  try {
    const result = await db.query(getFullDetailsQuery, [postId]);
    return result.rows[0];
  } catch (e) {
    console.error("Error fetching full post details:", e);
    throw e;
  }
}


// Get user activity summary (4 tables: users, posts, comments, tags)
async function getUserActivitySummary(userId) {
  const getUserActivityQuery = `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(DISTINCT p.id) as total_posts,
      COUNT(DISTINCT c.id) as total_comments,
      COUNT(DISTINCT t.id) as total_tags_used,
      MAX(p.created_at) as last_post_date,
      MAX(c.created_at) as last_comment_date
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON u.id = c.user_id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE u.id = $1
    GROUP BY u.id, u.name, u.email
  `;

  try {
    const result = await db.query(getUserActivityQuery, [userId]);
    return result.rows[0];
  } catch (e) {
    console.error("Error fetching user activity summary:", e);
    throw e;
  }
}


// EXPORTS
module.exports = {
  // Table creation
  createPostsTable,
  createCommentsTable,
  createTagsTable,
  createPostTagsTable,
  
  // One-to-Many operations (Users → Posts)
  insertNewPost,
  getPostsByUserId,
  
  // One-to-Many operations (Posts → Comments)
  insertComment,
  getCommentsByPostId,
  
  // Many-to-Many operations (Posts ↔ Tags)
  createTag,
  addTagToPost,
  getPostsWithTags,
  
  // Complex multi-table queries
  getFullPostDetails,
  getUserActivitySummary,
};
