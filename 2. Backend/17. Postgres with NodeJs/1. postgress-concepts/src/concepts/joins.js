const db = require("../db/db");

/*
  JOINS - COMPREHENSIVE EXAMPLES (Intermediate Level)
  
  
  Demonstrates all join types and advanced join patterns:
  - INNER JOIN
  - LEFT JOIN
  - RIGHT JOIN
  - FULL OUTER JOIN
  - CROSS JOIN
  - Self JOIN
  - Multiple JOINs (3+ tables)
  - JOIN with WHERE, ORDER BY, aggregation
*/

// BASIC JOINS:

// INNER JOIN - Returns only matching records from both tables
async function getUsersWithPosts() {
  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      p.id as post_id,
      p.title,
      p.created_at
    FROM users u
    INNER JOIN posts p ON u.id = p.user_id
    ORDER BY u.id, p.created_at DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getUsersWithPosts:", e);
    throw e;
  }
}


// LEFT JOIN - Returns all from left table + matching from right
async function getAllUsersAndTheirPosts() {
  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      COALESCE(p.title, 'No posts') as post_title,
      p.created_at
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    ORDER BY u.id
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getAllUsersAndTheirPosts:", e);
    throw e;
  }
}


// RIGHT JOIN - Returns all from right table + matching from left
async function getAllPostsAndTheirUsers() {
  const query = `
    SELECT 
      u.username,
      p.id as post_id,
      p.title,
      p.content
    FROM users u
    RIGHT JOIN posts p ON u.id = p.user_id
    ORDER BY p.id
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getAllPostsAndTheirUsers:", e);
    throw e;
  }
}


// FULL OUTER JOIN - Returns all from both tables
async function getAllUsersAndAllPosts() {
  const query = `
    SELECT 
      COALESCE(u.username, 'Unknown') as username,
      COALESCE(p.title, 'No title') as post_title,
      u.created_at as user_created_at,
      p.created_at as post_created_at
    FROM users u
    FULL OUTER JOIN posts p ON u.id = p.user_id
    ORDER BY u.id, p.id
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getAllUsersAndAllPosts:", e);
    throw e;
  }
}




// ADVANCED JOIN PATTERNS

// CROSS JOIN - Cartesian product (all combinations)
async function getUserPostCombinations() {
  const query = `
    SELECT 
      u.username,
      p.title
    FROM users u
    CROSS JOIN posts p
    LIMIT 20
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getUserPostCombinations:", e);
    throw e;
  }
}


// SELF JOIN - Join a table with itself (find users with similar properties)
async function findUsersCreatedSameDay() {
  const query = `
    SELECT DISTINCT
      u1.username as user1,
      u2.username as user2,
      DATE(u1.created_at) as created_date
    FROM users u1
    INNER JOIN users u2 ON DATE(u1.created_at) = DATE(u2.created_at)
    WHERE u1.id < u2.id
    ORDER BY created_date DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in findUsersCreatedSameDay:", e);
    throw e;
  }
}



// MULTIPLE JOINS (3+ Tables)

// Join 3 tables: users, posts, comments
async function getUserPostsAndComments() {
  const query = `
    SELECT 
      u.username,
      p.title,
      c.content as comment_content,
      c.created_at as comment_date
    FROM users u
    INNER JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON p.id = c.post_id
    ORDER BY u.id, p.id, c.id
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getUserPostsAndComments:", e);
    throw e;
  }
}


// Join 4 tables: users, posts, comments, tags
async function getCompletePostDetails() {
  const query = `
    SELECT 
      u.username,
      p.title,
      c.content as comment,
      t.name as tag
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON p.id = c.post_id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE u.id = $1
    ORDER BY p.id, c.id, t.id
  `;

  try {
    const res = await db.query(query, [arguments[0]]);
    return res.rows;
  } catch (e) {
    console.error("Error in getCompletePostDetails:", e);
    throw e;
  }
}


// JOIN WITH AGGREGATION

// Count posts per user with JOIN
async function countPostsPerUserWithJoin() {
  const query = `
    SELECT 
      u.id,
      u.username,
      COUNT(p.id) as total_posts,
      MAX(p.created_at) as last_post_date
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.username
    ORDER BY total_posts DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in countPostsPerUserWithJoin:", e);
    throw e;
  }
}


// Posts with comment count
async function getPostsWithCommentCount() {
  const query = `
    SELECT 
      p.id,
      p.title,
      u.username,
      COUNT(c.id) as comment_count,
      AVG(LENGTH(c.content)) as avg_comment_length
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id, p.title, u.username
    ORDER BY comment_count DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getPostsWithCommentCount:", e);
    throw e;
  }
}



// JOIN WITH WHERE AND FILTERING

// Join with WHERE clause
async function getUserPostsCreatedAfterDate(dateString) {
  const query = `
    SELECT 
      u.username,
      p.title,
      p.created_at
    FROM users u
    INNER JOIN posts p ON u.id = p.user_id
    WHERE p.created_at > $1
    ORDER BY p.created_at DESC
  `;

  try {
    const res = await db.query(query, [dateString]);
    return res.rows;
  } catch (e) {
    console.error("Error in getUserPostsCreatedAfterDate:", e);
    throw e;
  }
}


// Join with HAVING clause
async function getUsersWithMultiplePosts(minPostCount = 2) {
  const query = `
    SELECT 
      u.id,
      u.username,
      COUNT(p.id) as post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.username
    HAVING COUNT(p.id) >= $1
    ORDER BY post_count DESC
  `;

  try {
    const res = await db.query(query, [minPostCount]);
    return res.rows;
  } catch (e) {
    console.error("Error in getUsersWithMultiplePosts:", e);
    throw e;
  }
}


// EXPORTS
module.exports = {
  // Basic joins
  getUsersWithPosts,
  getAllUsersAndTheirPosts,
  getAllPostsAndTheirUsers,
  getAllUsersAndAllPosts,

  // Advanced joins
  getUserPostCombinations,
  findUsersCreatedSameDay,

  // Multiple joins
  getUserPostsAndComments,
  getCompletePostDetails,

  // Join with aggregation
  countPostsPerUserWithJoin,
  getPostsWithCommentCount,

  // Join with filtering
  getUserPostsCreatedAfterDate,
  getUsersWithMultiplePosts,
};
