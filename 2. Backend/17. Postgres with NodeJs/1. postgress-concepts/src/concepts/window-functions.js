const db = require("../db/db");

// WINDOW FUNCTIONS: Advanced Analytics:
// Window Functions perform calculations across rows without collapsing results


// ROW_NUMBER() - Assigns unique number to each row
async function getPostsWithRowNumbers() {
  const query = `
    SELECT 
      ROW_NUMBER() OVER (ORDER BY created_at DESC) as post_number,
      p.id,
      p.title,
      u.username,
      p.created_at
    FROM posts p
    JOIN users u ON p.user_id = u.id
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in ROW_NUMBER:", error);
  }
}


// PARTITION BY - Apply window function within groups
async function getUserPostRanking() {
  const query = `
    SELECT 
      u.username,
      p.title,
      ROW_NUMBER() OVER (PARTITION BY p.user_id ORDER BY p.created_at DESC) as user_post_number
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY u.username, user_post_number
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in PARTITION BY:", error);
  }
}


// RANK() - With ties, rank stays the same
async function getUserPostRank() {
  const query = `
    SELECT 
      u.username,
      p.title,
      COUNT(c.id) as comment_count,
      RANK() OVER (PARTITION BY p.user_id ORDER BY COUNT(c.id) DESC) as rank
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY u.username, p.title
    ORDER BY u.username, rank
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in RANK:", error);
  }
}


// DENSE_RANK() - No gaps in rank numbers
async function getDenseRankPosts() {
  const query = `
    SELECT 
      u.username,
      p.title,
      COUNT(c.id) as comment_count,
      DENSE_RANK() OVER (PARTITION BY p.user_id ORDER BY COUNT(c.id) DESC) as dense_rank
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY u.username, p.title
    ORDER BY u.username, dense_rank
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in DENSE_RANK:", error);
  }
}


// LAG() - Access previous row's data
async function getUserPostTimeline() {
  const query = `
    SELECT 
      u.username,
      p.id,
      p.title,
      p.created_at,
      LAG(p.created_at) OVER (PARTITION BY p.user_id ORDER BY p.created_at) as previous_post_date,
      EXTRACT(DAY FROM p.created_at - LAG(p.created_at) OVER (PARTITION BY p.user_id ORDER BY p.created_at)) as days_since_last_post
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY u.username, p.created_at
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in LAG:", error);
  }
}


// LEAD() - Access next row's data
async function getCommentingPattern() {
  const query = `
    SELECT 
      u.username,
      c.id,
      c.created_at,
      LEAD(c.created_at) OVER (PARTITION BY c.user_id ORDER BY c.created_at) as next_comment_date,
      EXTRACT(HOUR FROM LEAD(c.created_at) OVER (PARTITION BY c.user_id ORDER BY c.created_at) - c.created_at) as hours_until_next_comment
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.created_at > NOW() - INTERVAL '30 days'
    ORDER BY u.username, c.created_at
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in LEAD:", error);
  }
}


// SUM() OVER - Running total
async function getUserPostCount() {
  const query = `
    SELECT 
      u.username,
      p.created_at,
      SUM(1) OVER (PARTITION BY p.user_id ORDER BY p.created_at) as cumulative_posts,
      COUNT(1) OVER (PARTITION BY p.user_id) as total_posts
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY u.username, p.created_at
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in SUM() OVER:", error);
  }
}


// AVG() OVER - Moving average
async function getPostCommentMovingAverage() {
  const query = `
    SELECT 
      u.username,
      p.id,
      p.title,
      COUNT(c.id) as comment_count,
      ROUND(AVG(COUNT(c.id)) OVER (
        PARTITION BY p.user_id 
        ORDER BY p.created_at 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
      )::numeric, 2) as moving_avg_comments
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY u.username, p.id, p.title
    ORDER BY u.username, p.created_at
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in moving average:", error);
  }
}


// FIRST_VALUE() - Get first value in window
async function getFirstPostPerUser() {
  const query = `
    SELECT 
      DISTINCT
      u.username,
      FIRST_VALUE(p.title) OVER (PARTITION BY p.user_id ORDER BY p.created_at) as first_post,
      FIRST_VALUE(p.created_at) OVER (PARTITION BY p.user_id ORDER BY p.created_at) as first_post_date
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY u.username
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in FIRST_VALUE:", error);
  }
}


// LAST_VALUE() - Get last value in window
async function getLatestPostPerUser() {
  const query = `
    SELECT 
      DISTINCT
      u.username,
      LAST_VALUE(p.title) OVER (
        PARTITION BY p.user_id 
        ORDER BY p.created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
      ) as latest_post,
      LAST_VALUE(p.created_at) OVER (
        PARTITION BY p.user_id 
        ORDER BY p.created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
      ) as latest_post_date
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY u.username
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in LAST_VALUE:", error);
  }
}


// PERCENT_RANK() - Relative rank as percentage
async function getPostPercentRank() {
  const query = `
    SELECT 
      u.username,
      p.title,
      COUNT(c.id) as comment_count,
      ROUND(PERCENT_RANK() OVER (ORDER BY COUNT(c.id) DESC)::numeric * 100, 2) as percentile_rank
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY u.username, p.title
    ORDER BY percentile_rank DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in PERCENT_RANK:", error);
  }
}


// NTILE() - Divide into buckets
async function getPostBuckets() {
  const query = `
    SELECT 
      u.username,
      p.title,
      COUNT(c.id) as comment_count,
      NTILE(4) OVER (ORDER BY COUNT(c.id) DESC) as quartile
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY u.username, p.title
    ORDER BY quartile, comment_count DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in NTILE:", error);
  }
}


// Complex Window Function - Multiple windows
async function getComplexUserAnalytics() {
  const query = `
    SELECT 
      u.username,
      p.title,
      p.created_at,
      COUNT(c.id) as comment_count,
      ROW_NUMBER() OVER (PARTITION BY p.user_id ORDER BY p.created_at DESC) as post_rank,
      RANK() OVER (ORDER BY COUNT(c.id) DESC) as comment_rank_global,
      ROUND(SUM(COUNT(c.id)) OVER (
        PARTITION BY p.user_id 
        ORDER BY p.created_at
      )::numeric, 2) as cumulative_comments,
      ROUND(AVG(COUNT(c.id)) OVER (PARTITION BY p.user_id)::numeric, 2) as avg_comments_per_post
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY u.username, p.id, p.title, p.created_at
    ORDER BY u.username, p.created_at DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in complex window function:", error);
  }
}

module.exports = {
  getPostsWithRowNumbers,
  getUserPostRanking,
  getUserPostRank,
  getDenseRankPosts,
  getUserPostTimeline,
  getCommentingPattern,
  getUserPostCount,
  getPostCommentMovingAverage,
  getFirstPostPerUser,
  getLatestPostPerUser,
  getPostPercentRank,
  getPostBuckets,
  getComplexUserAnalytics
};
