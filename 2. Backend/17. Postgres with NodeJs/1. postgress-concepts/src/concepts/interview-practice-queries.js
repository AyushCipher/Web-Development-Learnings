const db = require("../db/db");

// INTERMEDIATE PostgreSQL INTERVIEW PRACTICE QUERIES 
// These queries combine multiple concepts and are commonly asked in interviews

// 1. TOP N Per Group - Get top 3 posts per user
async function getTopPostsPerUser() {
  const query = `
    WITH ranked_posts AS (
      SELECT 
        u.username,
        p.id,
        p.title,
        COUNT(c.id) as comment_count,
        ROW_NUMBER() OVER (PARTITION BY p.user_id ORDER BY COUNT(c.id) DESC) as rank
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY u.username, p.id, p.title
    )
    SELECT * FROM ranked_posts
    WHERE rank <= 3
    ORDER BY username, rank
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 2. Median Calculation - Find median comments per post
async function getMedianCommentsPerPost() {
  const query = `
    SELECT 
      p.user_id,
      u.username,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY comment_count) as median_comments
    FROM (
      SELECT user_id, COUNT(*) as comment_count
      FROM comments
      GROUP BY post_id
    ) subq
    JOIN posts p ON p.id = subq.post_id
    JOIN users u ON p.user_id = u.id
    GROUP BY p.user_id, u.username
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 3. Running Difference - Growth trend analysis
async function getUserPostGrowthTrend() {
  const query = `
    SELECT 
      DATE_TRUNC('day', p.created_at)::DATE as post_date,
      COUNT(*) as posts_today,
      LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', p.created_at)) as posts_yesterday,
      COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', p.created_at)) as daily_growth
    FROM posts p
    WHERE p.created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', p.created_at)
    ORDER BY post_date DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 4. Pivot Table Query - Users by engagement level
async function getUserEngagementPivot() {
  const query = `
    SELECT 
      CASE 
        WHEN post_count >= 20 THEN 'High'
        WHEN post_count >= 10 THEN 'Medium'
        ELSE 'Low'
      END as engagement_level,
      COUNT(*) as user_count,
      ROUND(AVG(post_count), 2) as avg_posts,
      ROUND(AVG(comment_count), 2) as avg_comments
    FROM (
      SELECT 
        u.id,
        COUNT(DISTINCT p.id) as post_count,
        COUNT(DISTINCT c.id) as comment_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN comments c ON u.id = c.user_id
      GROUP BY u.id
    ) user_stats
    GROUP BY engagement_level
    ORDER BY engagement_level
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 5. Gaps and Islands - Find consecutive posting days
async function getUserPostingStreaks() {
  const query = `
    WITH posting_dates AS (
      SELECT 
        p.user_id,
        u.username,
        DATE(p.created_at) as post_date,
        DATE(p.created_at) - ROW_NUMBER() OVER (PARTITION BY p.user_id ORDER BY DATE(p.created_at)) as island
      FROM posts p
      JOIN users u ON p.user_id = u.id
    )
    SELECT 
      user_id,
      username,
      MIN(post_date) as streak_start,
      MAX(post_date) as streak_end,
      COUNT(*) as consecutive_days
    FROM posting_dates
    GROUP BY user_id, username, island
    HAVING COUNT(*) >= 3
    ORDER BY consecutive_days DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 6. Self Join - Find users who commented on same post
async function getUsersCommentingTogether() {
  const query = `
    SELECT DISTINCT
      c1.user_id as user1,
      c2.user_id as user2,
      COUNT(c1.post_id) as shared_posts_commented
    FROM comments c1
    JOIN comments c2 ON c1.post_id = c2.post_id 
      AND c1.user_id < c2.user_id
    GROUP BY c1.user_id, c2.user_id
    HAVING COUNT(c1.post_id) >= 2
    ORDER BY shared_posts_commented DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 7. Deduplication - Find duplicate emails or usernames
async function findDuplicateEmails() {
  const query = `
    SELECT 
      email,
      COUNT(*) as occurrence,
      ARRAY_AGG(id) as user_ids,
      ARRAY_AGG(username) as usernames
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
    ORDER BY occurrence DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 8. Cohort Analysis - User cohorts by signup date
async function getUserSignupCohortRetention() {
  const query = `
    WITH cohorts AS (
      SELECT 
        DATE_TRUNC('month', u.created_at)::DATE as signup_month,
        u.id,
        COUNT(p.id) as posts_after_signup,
        EXTRACT(MONTH FROM AGE(MAX(p.created_at), u.created_at)) as months_active
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id, signup_month
    )
    SELECT 
      signup_month,
      COUNT(*) as cohort_size,
      COUNT(CASE WHEN posts_after_signup > 0 THEN 1 END) as active_users,
      ROUND(COUNT(CASE WHEN posts_after_signup > 0 THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) as retention_rate,
      ROUND(AVG(posts_after_signup), 2) as avg_posts_per_user
    FROM cohorts
    GROUP BY signup_month
    ORDER BY signup_month DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 9. Ranking with Ties Handling - Complex ranking
async function getRankedUsersWithTieHandling() {
  const query = `
    SELECT 
      username,
      total_engagement,
      RANK() OVER (ORDER BY total_engagement DESC) as dense_rank,
      DENSE_RANK() OVER (ORDER BY total_engagement DESC) as proper_rank,
      PERCENT_RANK() OVER (ORDER BY total_engagement DESC) as percent_rank,
      NTILE(4) OVER (ORDER BY total_engagement DESC) as quartile
    FROM (
      SELECT 
        u.username,
        COUNT(DISTINCT p.id) * 2 + COUNT(DISTINCT c.id) as total_engagement
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN comments c ON u.id = c.user_id
      GROUP BY u.id, u.username
    ) engagement_scores
    ORDER BY total_engagement DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 10. Complex Aggregation with Conditions
async function getDetailedUserEngagementMetrics() {
  const query = `
    SELECT 
      u.id,
      u.username,
      COUNT(DISTINCT p.id) as total_posts,
      COUNT(DISTINCT c.id) as total_comments,
      COUNT(DISTINCT CASE WHEN p.created_at > NOW() - INTERVAL '30 days' THEN p.id END) as recent_posts,
      ROUND(AVG(CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END)::NUMERIC, 2) as engagement_score,
      MAX(p.created_at) as last_post_date,
      MAX(c.created_at) as last_comment_date,
      CASE 
        WHEN MAX(p.created_at) > NOW() - INTERVAL '7 days' THEN 'Active'
        WHEN MAX(p.created_at) > NOW() - INTERVAL '30 days' THEN 'Moderate'
        WHEN MAX(p.created_at) > NOW() - INTERVAL '90 days' THEN 'Inactive'
        ELSE 'Dormant'
      END as status
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON u.id = c.user_id
    GROUP BY u.id, u.username
    ORDER BY total_posts DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 11. Recursive Query - Hierarchical data (comment replies chain)
async function getCommentThread(postId) {
  const query = `
    WITH RECURSIVE comment_hierarchy AS (
      SELECT 
        id,
        post_id,
        user_id,
        content,
        parent_comment_id,
        created_at,
        0 as depth,
        CAST(id AS TEXT) as path
      FROM comments
      WHERE post_id = $1 AND parent_comment_id IS NULL
      
      UNION ALL
      
      SELECT 
        c.id,
        c.post_id,
        c.user_id,
        c.content,
        c.parent_comment_id,
        c.created_at,
        ch.depth + 1,
        ch.path || '->' || CAST(c.id AS TEXT)
      FROM comments c
      JOIN comment_hierarchy ch ON c.parent_comment_id = ch.id
      WHERE ch.depth < 10
    )
    SELECT 
      REPEAT('  ', depth) || content as formatted_comment,
      depth,
      created_at
    FROM comment_hierarchy
    ORDER BY path
  `;

  try {
    const result = await db.query(query, [postId]);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 12. Performance Query - Complex aggregation with multiple conditions
async function getAdvancedAnalytics() {
  const query = `
    SELECT 
      DATE_TRUNC('week', p.created_at)::DATE as week_start,
      u.username,
      COUNT(p.id) as posts_this_week,
      SUM(COALESCE(comment_counts.cnt, 0)) as total_comments,
      ROUND(AVG(COALESCE(comment_counts.cnt, 0))::NUMERIC, 2) as avg_comments_per_post,
      MAX(p.created_at) as latest_post
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as cnt FROM comments GROUP BY post_id
    ) comment_counts ON p.id = comment_counts.post_id
    WHERE p.created_at > NOW() - INTERVAL '90 days'
    GROUP BY DATE_TRUNC('week', p.created_at), u.id, u.username
    HAVING COUNT(p.id) > 0
    ORDER BY week_start DESC, posts_this_week DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 13. Handle NULL values strategically
async function getEngagementWithNullHandling() {
  const query = `
    SELECT 
      u.username,
      COALESCE(COUNT(DISTINCT p.id), 0) as post_count,
      COALESCE(COUNT(DISTINCT c.id), 0) as comment_count,
      NULLIF(COALESCE(COUNT(DISTINCT p.id), 0), 0) as non_null_post_count,
      CASE 
        WHEN COUNT(DISTINCT p.id) IS NULL AND COUNT(DISTINCT c.id) IS NULL THEN 'No Activity'
        WHEN COUNT(DISTINCT p.id) > 0 THEN 'Poster'
        WHEN COUNT(DISTINCT c.id) > 0 THEN 'Commenter'
        ELSE 'Unknown'
      END as user_type
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON u.id = c.user_id
    GROUP BY u.id, u.username
    ORDER BY post_count + comment_count DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 14. Query optimization - Using indexes effectively
async function getOptimizedUserPosts() {
  const query = `
    SELECT 
      u.id,
      u.username,
      p.id as post_id,
      p.title,
      EXTRACT(DAY FROM NOW() - p.created_at) as days_ago
    FROM users u
    JOIN posts p ON u.id = p.user_id
    WHERE p.created_at > NOW() - INTERVAL '30 days'
      AND u.created_at > NOW() - INTERVAL '1 year'
    ORDER BY p.created_at DESC
    LIMIT 1000
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 15. Batch operations for efficiency
async function batchInsertCommentsWithValidation(comments) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    let results = [];

    for (const comment of comments) {
      const insertQuery = `
        INSERT INTO comments (content, post_id, user_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [comment.content, comment.post_id, comment.user_id]);
      results.push(result.rows[0]);
    }

    await client.query("COMMIT");

    return { success: true, inserted: results.length, data: results };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Batch insert failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getTopPostsPerUser,
  getMedianCommentsPerPost,
  getUserPostGrowthTrend,
  getUserEngagementPivot,
  getUserPostingStreaks,
  getUsersCommentingTogether,
  findDuplicateEmails,
  getUserSignupCohortRetention,
  getRankedUsersWithTieHandling,
  getDetailedUserEngagementMetrics,
  getCommentThread,
  getAdvancedAnalytics,
  getEngagementWithNullHandling,
  getOptimizedUserPosts,
  batchInsertCommentsWithValidation
};
