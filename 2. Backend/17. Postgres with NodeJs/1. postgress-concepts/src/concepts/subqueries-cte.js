const db = require("../db/db");

// SUBQUERIES:

// Scalar Subquery - Returns single value
async function getUsersWithAboveAveragePostCount() {
  const query = `
    SELECT 
      u.username,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count
    FROM users u
    WHERE (SELECT COUNT(*) FROM posts WHERE user_id = u.id) > (
      SELECT AVG(post_count) FROM (
        SELECT COUNT(*) as post_count FROM posts GROUP BY user_id
      ) subq
    )
    ORDER BY post_count DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in scalar subquery:", error);
  }
}


// IN Subquery - Check membership
async function getPostsFromActiveUsers() {
  const query = `
    SELECT p.id, p.title, u.username
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE u.id IN (
      SELECT user_id FROM posts 
      GROUP BY user_id 
      HAVING COUNT(*) > 5
    )
    ORDER BY p.created_at DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in IN subquery:", error);
  }
}


// NOT IN Subquery - Exclusion
async function getUsersWithoutPosts() {
  const query = `
    SELECT u.id, u.username, u.email
    FROM users u
    WHERE u.id NOT IN (
      SELECT DISTINCT user_id FROM posts
    )
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in NOT IN subquery:", error);
  }
}


// EXISTS Subquery - Check existence
async function getUsersWithRecentPosts() {
  const query = `
    SELECT u.id, u.username
    FROM users u
    WHERE EXISTS (
      SELECT 1 FROM posts 
      WHERE user_id = u.id 
      AND created_at > NOW() - INTERVAL '7 days'
    )
    ORDER BY u.username
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in EXISTS subquery:", error);
  }
}


// Correlated Subquery - References outer query
async function getPostsWithCommentCount() {
  const query = `
    SELECT 
      p.id,
      p.title,
      u.username,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND created_at > NOW() - INTERVAL '30 days') as recent_comments
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY comment_count DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in correlated subquery:", error);
  }
}


// Comparison Subquery with ALL
async function getPostsWithAboveAverageComments() {
  const query = `
    SELECT p.id, p.title, u.username
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE (SELECT COUNT(*) FROM comments WHERE post_id = p.id) >= ALL (
      SELECT AVG(comment_count) FROM (
        SELECT COUNT(*) as comment_count FROM comments GROUP BY post_id
      ) subq
    )
    ORDER BY p.created_at DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in ALL subquery:", error);
  }
}




// COMMON TABLE EXPRESSIONS (CTE):

// Simple CTE - Recursive structure
async function getPostsByActiveUsers() {
  const query = `
    WITH active_users AS (
      SELECT u.id, u.username
      FROM users u
      WHERE u.created_at > NOW() - INTERVAL '30 days'
    )
    SELECT p.id, p.title, au.username, p.created_at
    FROM posts p
    JOIN active_users au ON p.user_id = au.id
    ORDER BY p.created_at DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in simple CTE:", error);
  }
}


// Multiple CTEs
async function getUserEngagementStats() {
  const query = `
    WITH user_posts AS (
      SELECT user_id, COUNT(*) as total_posts
      FROM posts
      GROUP BY user_id
    ),
    user_comments AS (
      SELECT user_id, COUNT(*) as total_comments
      FROM comments
      GROUP BY user_id
    )
    SELECT 
      u.id,
      u.username,
      COALESCE(up.total_posts, 0) as total_posts,
      COALESCE(uc.total_comments, 0) as total_comments,
      COALESCE(up.total_posts, 0) + COALESCE(uc.total_comments, 0) as total_activity
    FROM users u
    LEFT JOIN user_posts up ON u.id = up.user_id
    LEFT JOIN user_comments uc ON u.id = uc.user_id
    ORDER BY total_activity DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in multiple CTEs:", error);
  }
}


// Recursive CTE - Hierarchical data (categories/subcategories)
async function getCategoryHierarchy() {
  const query = `
    WITH RECURSIVE category_tree AS (
      -- Base case: select root categories
      SELECT 
        id,
        name,
        parent_id,
        0 as level,
        CAST(id AS TEXT) as path
      FROM categories
      WHERE parent_id IS NULL
      
      UNION ALL
      
      -- Recursive case: select child categories
      SELECT 
        c.id,
        c.name,
        c.parent_id,
        ct.level + 1,
        ct.path || ',' || CAST(c.id AS TEXT)
      FROM categories c
      JOIN category_tree ct ON c.parent_id = ct.id
      WHERE ct.level < 10
    )
    SELECT 
      id,
      name,
      parent_id,
      level,
      REPEAT('  ', level) || name as indented_name
    FROM category_tree
    ORDER BY path
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in recursive CTE:", error);
  }
}


// Recursive CTE - Generate series
async function generateNumberSeries() {
  const query = `
    WITH RECURSIVE numbers AS (
      SELECT 1 as n
      UNION ALL
      SELECT n + 1 FROM numbers WHERE n < 100
    )
    SELECT * FROM numbers
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in recursive number series:", error);
  }
}


// CTE with filtering and transformation
async function getTopPostersWithStats() {
  const query = `
    WITH user_stats AS (
      SELECT 
        u.id,
        u.username,
        COUNT(DISTINCT p.id) as post_count,
        COUNT(DISTINCT c.id) as comment_count,
        MAX(p.created_at) as last_post_date
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN comments c ON u.id = c.user_id
      GROUP BY u.id, u.username
      HAVING COUNT(DISTINCT p.id) > 0
    )
    SELECT 
      id,
      username,
      post_count,
      comment_count,
      last_post_date,
      ROW_NUMBER() OVER (ORDER BY post_count DESC) as rank
    FROM user_stats
    WHERE post_count >= 5
    ORDER BY post_count DESC
    LIMIT 10
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in CTE with stats:", error);
  }
}


// Create necessary tables for examples
async function createCTEExampleTables() {
  const query = `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      parent_id INTEGER REFERENCES categories(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await db.query(query);
    console.log("Categories table created");
  } catch (error) {
    console.error("Error creating categories table:", error);
  }
}

module.exports = {
  // Subqueries
  getUsersWithAboveAveragePostCount,
  getPostsFromActiveUsers,
  getUsersWithoutPosts,
  getUsersWithRecentPosts,
  getPostsWithCommentCount,
  getPostsWithAboveAverageComments,
  
  // CTEs
  getPostsByActiveUsers,
  getUserEngagementStats,
  getCategoryHierarchy,
  generateNumberSeries,
  getTopPostersWithStats,
  
  // Setup
  createCTEExampleTables
};
