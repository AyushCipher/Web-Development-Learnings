const db = require("../db/db");

// CASE STATEMENTS:

// CASE WHEN - Simple conditional logic
async function getUserPostsWithCategory() {
  const query = `
    SELECT 
      u.username,
      p.title,
      COUNT(c.id) as comment_count,
      CASE 
        WHEN COUNT(c.id) >= 50 THEN 'Viral'
        WHEN COUNT(c.id) >= 20 THEN 'Popular'
        WHEN COUNT(c.id) >= 5 THEN 'Trending'
        ELSE 'New'
      END as post_category
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY u.username, p.id, p.title
    ORDER BY comment_count DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in CASE WHEN:", error);
  }
}


// CASE with multiple conditions:
async function getUserEngagementLevel() {
  const query = `
    SELECT 
      u.username,
      COUNT(DISTINCT p.id) as total_posts,
      COUNT(DISTINCT c.id) as total_comments,
      CASE 
        WHEN COUNT(DISTINCT p.id) >= 20 AND COUNT(DISTINCT c.id) >= 50 THEN 'Super Active'
        WHEN COUNT(DISTINCT p.id) >= 10 AND COUNT(DISTINCT c.id) >= 20 THEN 'Very Active'
        WHEN COUNT(DISTINCT p.id) >= 5 OR COUNT(DISTINCT c.id) >= 10 THEN 'Active'
        WHEN COUNT(DISTINCT p.id) > 0 OR COUNT(DISTINCT c.id) > 0 THEN 'Moderate'
        ELSE 'Inactive'
      END as engagement_level
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON u.id = c.user_id
    GROUP BY u.id, u.username
    ORDER BY engagement_level DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in multi-condition CASE:", error);
  }
}


// CASE with NULL handling and nested CASE:
async function getPostStatusWithNullHandling() {
  const query = `
    SELECT 
      p.id,
      p.title,
      CASE 
        WHEN p.content IS NULL THEN 'No Content'
        WHEN CHAR_LENGTH(p.content) > 1000 THEN 'Long Post'
        WHEN CHAR_LENGTH(p.content) > 500 THEN 'Medium Post'
        ELSE 'Short Post'
      END as post_length,
      COALESCE(COUNT(c.id), 0) as comment_count,
      CASE 
        WHEN COUNT(c.id) IS NULL THEN 'No Comments'
        ELSE 'Has Comments'
      END as comment_status
    FROM posts p
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id, p.title, p.content
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in CASE with NULL:", error);
  }
}


// Nested CASE statements:
async function getUserActivityScore() {
  const query = `
    SELECT 
      u.username,
      COUNT(DISTINCT p.id) as posts,
      COUNT(DISTINCT c.id) as comments,
      CASE 
        WHEN COUNT(DISTINCT p.id) = 0 AND COUNT(DISTINCT c.id) = 0 THEN 'No Activity'
        WHEN COUNT(DISTINCT p.id) > 0 THEN
          CASE 
            WHEN COUNT(DISTINCT p.id) > 20 THEN 'High Posts Activity'
            ELSE 'Low Posts Activity'
          END
        WHEN COUNT(DISTINCT c.id) > 0 THEN
          CASE 
            WHEN COUNT(DISTINCT c.id) > 50 THEN 'High Comments Activity'
            ELSE 'Low Comments Activity'
          END
      END as activity_type
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON u.id = c.user_id
    GROUP BY u.id, u.username
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in nested CASE:", error);
  }
}


// CASE with BETWEEN:
async function getPostsAgeCategory() {
  const query = `
    SELECT 
      p.id,
      p.title,
      EXTRACT(DAY FROM NOW() - p.created_at) as days_old,
      CASE 
        WHEN EXTRACT(DAY FROM NOW() - p.created_at) BETWEEN 0 AND 7 THEN 'This Week'
        WHEN EXTRACT(DAY FROM NOW() - p.created_at) BETWEEN 8 AND 30 THEN 'This Month'
        WHEN EXTRACT(DAY FROM NOW() - p.created_at) BETWEEN 31 AND 365 THEN 'This Year'
        ELSE 'Archive'
      END as time_category
    FROM posts
    ORDER BY p.created_at DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in CASE with BETWEEN:", error);
  }
}




// UNION & SET OPERATIONS:

// UNION - Combines results, removes duplicates
async function getActivePeopleUnion() {
  const query = `
    SELECT username, email, 'User' as type FROM users
    WHERE created_at > NOW() - INTERVAL '30 days'
    
    UNION
    
    SELECT u.username, u.email, 'Posted' as type FROM users u
    WHERE EXISTS (SELECT 1 FROM posts p WHERE p.user_id = u.id AND p.created_at > NOW() - INTERVAL '30 days')
    
    ORDER BY username
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in UNION:", error);
  }
}


// UNION ALL - Combines results, keeps duplicates
async function getUsersAndPostsCountUnionAll() {
  const query = `
    SELECT u.username, COUNT(*) as count FROM users u GROUP BY u.id, u.username
    UNION ALL
    SELECT u.username, COUNT(*) as count FROM users u JOIN posts p ON u.id = p.user_id GROUP BY u.id, u.username
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in UNION ALL:", error);
  }
}


// INTERSECT - Common records
async function getCommonUserEmailDomains() {
  const query = `
    SELECT SPLIT_PART(email, '@', 2) as domain FROM users WHERE created_at > NOW() - INTERVAL '90 days'
    INTERSECT
    SELECT SPLIT_PART(email, '@', 2) as domain FROM users WHERE EXISTS (SELECT 1 FROM posts p WHERE p.user_id = users.id)
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in INTERSECT:", error);
  }
}


// EXCEPT - Records in first but not in second
async function getUsersWithoutActivity() {
  const query = `
    SELECT id, username FROM users
    EXCEPT
    SELECT DISTINCT u.id, u.username FROM users u 
    WHERE EXISTS (SELECT 1 FROM posts WHERE user_id = u.id)
      OR EXISTS (SELECT 1 FROM comments WHERE user_id = u.id)
    ORDER BY username
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in EXCEPT:", error);
  }
}


// Complex UNION with aggregation:
async function getTopContentUnion() {
  const query = `
    SELECT 'Post' as type, title as content, COUNT(c.id) as engagement FROM posts p
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id, p.title
    
    UNION
    
    SELECT 'Comment' as type, SUBSTRING(content, 1, 50) as content, COUNT(*) as engagement FROM comments
    GROUP BY content
    
    ORDER BY engagement DESC
    LIMIT 20
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in complex UNION:", error);
  }
}

module.exports = {
  // CASE Statements
  getUserPostsWithCategory,
  getUserEngagementLevel,
  getPostStatusWithNullHandling,
  getUserActivityScore,
  getPostsAgeCategory,
  
  // Set Operations
  getActivePeopleUnion,
  getUsersAndPostsCountUnionAll,
  getCommonUserEmailDomains,
  getUsersWithoutActivity,
  getTopContentUnion
};
