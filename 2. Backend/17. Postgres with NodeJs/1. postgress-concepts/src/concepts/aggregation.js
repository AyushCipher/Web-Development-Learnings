const db = require("../db/db");

/*
  AGGREGATION FUNCTIONS - COMPREHENSIVE EXAMPLES (Intermediate)
  
  Demonstrates all aggregation functions and patterns:
  - COUNT, SUM, AVG, MIN, MAX
  - GROUP BY with multiple columns
  - HAVING clause
  - Multiple aggregations
  - Nested aggregations (subqueries)
  - STRING_AGG (concatenation)
  - FILTER clause
  - Variance and standard deviation
*/

// BASIC AGGREGATION:

// COUNT - Total users
async function getTotalUserCount() {
  const query = `
    SELECT COUNT(*) as total_users
    FROM users
  `;

  try {
    const res = await db.query(query);
    return res.rows[0].total_users;
  } catch (e) {
    console.error("Error in getTotalUserCount:", e);
    throw e;
  }
}


// COUNT with GROUP BY
async function countPostsByUser() {
  const query = `
    SELECT 
      u.id,
      u.username,
      COUNT(p.id) as post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.username
    ORDER BY post_count DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in countPostsByUser:", e);
    throw e;
  }
}



// SUM, AVG, MIN, MAX:

// SUM aggregation
async function getSumStatistics() {
  const query = `
    SELECT 
      COUNT(*) as total_posts,
      SUM(CAST(CHAR_LENGTH(content) AS INTEGER)) as total_content_length
    FROM posts
  `;

  try {
    const res = await db.query(query);
    return res.rows[0];
  } catch (e) {
    console.error("Error in getSumStatistics:", e);
    throw e;
  }
}

// AVG aggregation
async function getAveragePostsPerUser() {
  const query = `
    SELECT 
      AVG(post_count) as average_posts_per_user,
      ROUND(AVG(post_count), 2) as avg_rounded
    FROM (
      SELECT COUNT(p.id) as post_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id
    ) as user_post_counts
  `;

  try {
    const res = await db.query(query);
    return res.rows[0];
  } catch (e) {
    console.error("Error in getAveragePostsPerUser:", e);
    throw e;
  }
}

// MIN and MAX
async function getPostsStatistics() {
  const query = `
    SELECT 
      MIN(created_at) as oldest_post,
      MAX(created_at) as newest_post,
      MIN(CHAR_LENGTH(title)) as shortest_title,
      MAX(CHAR_LENGTH(content)) as longest_content
    FROM posts
  `;

  try {
    const res = await db.query(query);
    return res.rows[0];
  } catch (e) {
    console.error("Error in getPostsStatistics:", e);
    throw e;
  }
}



// GROUP BY WITH MULTIPLE COLUMNS:

// GROUP BY single column with aggregates
async function countPostsByUserWithDate() {
  const query = `
    SELECT 
      u.username,
      DATE(p.created_at) as post_date,
      COUNT(p.id) as posts_per_day
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    WHERE p.created_at IS NOT NULL
    GROUP BY u.id, u.username, DATE(p.created_at)
    ORDER BY u.username, post_date DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in countPostsByUserWithDate:", e);
    throw e;
  }
}


// GROUP BY multiple columns
async function getDetailedPostStatistics() {
  const query = `
    SELECT 
      u.username,
      COUNT(p.id) as total_posts,
      COUNT(c.id) as total_comments,
      AVG(CHAR_LENGTH(p.content)) as avg_post_length,
      MAX(p.created_at) as last_post_date
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY u.id, u.username
    ORDER BY total_posts DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getDetailedPostStatistics:", e);
    throw e;
  }
}



// HAVING CLAUSE

// HAVING - Filter aggregated results
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


// HAVING with multiple conditions
async function getActiveUserStats(minPosts = 1, minAvgLength = 10) {
  const query = `
    SELECT 
      u.username,
      COUNT(p.id) as post_count,
      ROUND(AVG(CHAR_LENGTH(p.content)), 2) as avg_content_length,
      MAX(p.created_at) as last_post
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.username
    HAVING 
      COUNT(p.id) >= $1 
      AND AVG(CHAR_LENGTH(p.content)) >= $2
    ORDER BY post_count DESC
  `;

  try {
    const res = await db.query(query, [minPosts, minAvgLength]);
    return res.rows;
  } catch (e) {
    console.error("Error in getActiveUserStats:", e);
    throw e;
  }
}



// STRING AGGREGATION:

// STRING_AGG - Concatenate strings
async function getPostTitlesByUser() {
  const query = `
    SELECT 
      u.username,
      COUNT(p.id) as post_count,
      STRING_AGG(p.title, ', ') as post_titles
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    WHERE p.title IS NOT NULL
    GROUP BY u.id, u.username
    ORDER BY post_count DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getPostTitlesByUser:", e);
    throw e;
  }
}


// STRING_AGG with ORDER BY
async function getRecentPostTitlesByUser() {
  const query = `
    SELECT 
      u.username,
      STRING_AGG(p.title, ' | ' ORDER BY p.created_at DESC) as recent_posts
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    WHERE p.title IS NOT NULL
    GROUP BY u.id, u.username
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getRecentPostTitlesByUser:", e);
    throw e;
  }
}



// FILTER CLAUSE (with aggregates):

// FILTER - Conditional aggregation
async function getConditionalPostStats() {
  const query = `
    SELECT 
      u.username,
      COUNT(p.id) as total_posts,
      COUNT(p.id) FILTER (WHERE CHAR_LENGTH(p.content) > 100) as long_posts,
      COUNT(p.id) FILTER (WHERE CHAR_LENGTH(p.content) <= 100) as short_posts,
      AVG(CHAR_LENGTH(p.content)) as avg_length
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.username
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getConditionalPostStats:", e);
    throw e;
  }
}




// VARIANCE AND STANDARD DEVIATION:

// Variance and StdDev
async function getPostLengthVariance() {
  const query = `
    SELECT 
      VAR_POP(CHAR_LENGTH(content)) as population_variance,
      VAR_SAMP(CHAR_LENGTH(content)) as sample_variance,
      STDDEV_POP(CHAR_LENGTH(content)) as population_stddev,
      STDDEV_SAMP(CHAR_LENGTH(content)) as sample_stddev
    FROM posts
  `;

  try {
    const res = await db.query(query);
    return res.rows[0];
  } catch (e) {
    console.error("Error in getPostLengthVariance:", e);
    throw e;
  }
}




// NESTED AGGREGATION:

// Aggregation on aggregated results
async function getAggregatedUserStats() {
  const query = `
    SELECT 
      MIN(post_count) as min_posts_per_user,
      MAX(post_count) as max_posts_per_user,
      ROUND(AVG(post_count), 2) as avg_posts_per_user,
      COUNT(*) as total_users_with_posts
    FROM (
      SELECT COUNT(p.id) as post_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id
    ) as user_stats
  `;

  try {
    const res = await db.query(query);
    return res.rows[0];
  } catch (e) {
    console.error("Error in getAggregatedUserStats:", e);
    throw e;
  }
}



// DISTINCT WITH AGGREGATION:

// Count distinct values
async function getDistinctEmailDomainCounts() {
  const query = `
    SELECT 
      COUNT(DISTINCT SUBSTRING(email FROM '@' FOR 100)) as distinct_domains,
      COUNT(*) as total_users
    FROM users
  `;

  try {
    const res = await db.query(query);
    return res.rows[0];
  } catch (e) {
    console.error("Error in getDistinctEmailDomainCounts:", e);
    throw e;
  }
}

// EXPORTS
module.exports = {
  // Basic aggregation
  getTotalUserCount,
  countPostsByUser,

  // SUM, AVG, MIN, MAX
  getSumStatistics,
  getAveragePostsPerUser,
  getPostsStatistics,

  // GROUP BY
  countPostsByUserWithDate,
  getDetailedPostStatistics,

  // HAVING clause
  getUsersWithMultiplePosts,
  getActiveUserStats,

  // String aggregation
  getPostTitlesByUser,
  getRecentPostTitlesByUser,

  // FILTER clause
  getConditionalPostStats,

  // Variance & StdDev
  getPostLengthVariance,

  // Nested aggregation
  getAggregatedUserStats,

  // Distinct
  getDistinctEmailDomainCounts,
};
