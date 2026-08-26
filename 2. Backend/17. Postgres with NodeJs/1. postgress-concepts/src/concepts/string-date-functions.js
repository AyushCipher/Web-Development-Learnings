const db = require("../db/db");

// STRING FUNCTIONS:

// CONCAT() - Combine strings
async function getUserFullInfo() {
  const query = `
    SELECT 
      id,
      CONCAT(username, ' (', email, ')') as user_info
    FROM users
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in CONCAT:", error);
  }
}


// String Concatenation with || operator
async function getUserPostSummary() {
  const query = `
    SELECT 
      u.username || ' posted: ' || p.title as post_summary,
      p.created_at
    FROM posts p
    JOIN users u ON p.user_id = u.id
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in || concatenation:", error);
  }
}


// SUBSTRING() - Extract part of string
async function getUserInitials() {
  const query = `
    SELECT 
      username,
      SUBSTRING(username FROM 1 FOR 1) as initial
    FROM users
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in SUBSTRING:", error);
  }
}


// UPPER() / LOWER() - Case conversion
async function getNormalizedUsernames() {
  const query = `
    SELECT 
      username,
      UPPER(username) as uppercase,
      LOWER(username) as lowercase
    FROM users
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in UPPER/LOWER:", error);
  }
}


// LENGTH() - String length
async function getUsernameLength() {
  const query = `
    SELECT 
      username,
      LENGTH(username) as username_length,
      CASE 
        WHEN LENGTH(username) < 5 THEN 'Short'
        WHEN LENGTH(username) BETWEEN 5 AND 10 THEN 'Medium'
        ELSE 'Long'
      END as length_category
    FROM users
    ORDER BY username_length DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in LENGTH:", error);
  }
}


// POSITION() / STRPOS() - Find substring position
async function findEmailDomain() {
  const query = `
    SELECT 
      email,
      SUBSTRING(email FROM POSITION('@' IN email) + 1) as domain,
      POSITION('@' IN email) as at_position
    FROM users
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in POSITION:", error);
  }
}


// REPLACE() - Replace substring
async function replaceProfanity() {
  const query = `
    SELECT 
      id,
      content as original,
      REPLACE(LOWER(content), 'bad', '***') as filtered
    FROM posts
    WHERE content ILIKE '%bad%'
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in REPLACE:", error);
  }
}


// LTRIM() / RTRIM() / TRIM() - Remove spaces
async function trimWhitespace() {
  const query = `
    SELECT 
      title,
      TRIM(title) as trimmed_title,
      LTRIM(title) as left_trimmed,
      RTRIM(title) as right_trimmed,
      LENGTH(title) - LENGTH(TRIM(title)) as spaces_removed
    FROM posts
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in TRIM functions:", error);
  }
}


// REPEAT() - Repeat string
async function generateDashboard() {
  const query = `
    SELECT 
      username,
      COUNT(p.id) as post_count,
      REPEAT('★', COUNT(p.id)) as rating_stars
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.username
    ORDER BY post_count DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in REPEAT:", error);
  }
}


// SPLIT_PART() - Split string by delimiter
async function extractEmailComponents() {
  const query = `
    SELECT 
      email,
      SPLIT_PART(email, '@', 1) as username_part,
      SPLIT_PART(email, '@', 2) as domain_part
    FROM users
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in SPLIT_PART:", error);
  }
}




// DATE/TIME FUNCTIONS:

// NOW() / CURRENT_TIMESTAMP - Current date/time
async function getCurrentTimestamp() {
  const query = `
    SELECT 
      NOW() as current_timestamp,
      CURRENT_DATE as today,
      CURRENT_TIME as time_now
    FROM posts
    LIMIT 1
  `;

  try {
    const result = await db.query(query);
    return result.rows[0];
  } catch (error) {
    console.error("Error in NOW():", error);
  }
}


// DATE_PART() - Extract date component
async function getPostsByMonth() {
  const query = `
    SELECT 
      DATE_PART('year', created_at) as year,
      DATE_PART('month', created_at) as month,
      COUNT(*) as posts_count
    FROM posts
    GROUP BY DATE_PART('year', created_at), DATE_PART('month', created_at)
    ORDER BY year DESC, month DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in DATE_PART:", error);
  }
}


// EXTRACT() - Similar to DATE_PART
async function getPostsByDayOfWeek() {
  const query = `
    SELECT 
      CASE EXTRACT(DOW FROM created_at)
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
      END as day_of_week,
      COUNT(*) as posts_count
    FROM posts
    GROUP BY EXTRACT(DOW FROM created_at)
    ORDER BY EXTRACT(DOW FROM created_at)
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in EXTRACT:", error);
  }
}


// DATE_TRUNC() - Truncate to specific precision
async function getTrendingPostsByWeek() {
  const query = `
    SELECT 
      DATE_TRUNC('week', created_at) as week_start,
      COUNT(*) as posts_count
    FROM posts
    WHERE created_at > NOW() - INTERVAL '90 days'
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY week_start DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in DATE_TRUNC:", error);
  }
}


// INTERVAL - Date arithmetic
async function getUsersJoinedLastMonth() {
  const query = `
    SELECT 
      username,
      created_at,
      NOW() - created_at as time_since_join
    FROM users
    WHERE created_at > NOW() - INTERVAL '30 days'
    ORDER BY created_at DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in INTERVAL:", error);
  }
}


// AGE() - Calculate age between dates
async function getUserAccountAge() {
  const query = `
    SELECT 
      username,
      created_at,
      AGE(NOW(), created_at) as account_age,
      EXTRACT(DAY FROM AGE(NOW(), created_at)) as days_old
    FROM users
    ORDER BY created_at ASC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in AGE:", error);
  }
}


// TO_CHAR() - Format date
async function getFormattedDates() {
  const query = `
    SELECT 
      username,
      TO_CHAR(created_at, 'DD-MM-YYYY') as date_ddmmyyyy,
      TO_CHAR(created_at, 'Mon DD, YYYY') as date_readable,
      TO_CHAR(created_at, 'HH24:MI:SS') as time_formatted
    FROM users
    LIMIT 10
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in TO_CHAR:", error);
  }
}


// TO_DATE() - Convert string to date
async function convertStringToDate() {
  const query = `
    SELECT 
      TO_DATE('25-12-2024', 'DD-MM-YYYY') as parsed_date,
      TO_TIMESTAMP('2024-12-25 15:30:45', 'YYYY-MM-DD HH24:MI:SS') as parsed_timestamp
  `;

  try {
    const result = await db.query(query);
    return result.rows[0];
  } catch (error) {
    console.error("Error in TO_DATE:", error);
  }
}


// Combined String & Date functions
async function getUserPostStats() {
  const query = `
    SELECT 
      UPPER(u.username) as user,
      COUNT(p.id) as post_count,
      DATE_TRUNC('month', MAX(p.created_at)) as last_activity_month,
      TO_CHAR(MAX(p.created_at), 'DD-MM-YYYY HH24:MI') as last_post_formatted
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.username
    ORDER BY post_count DESC
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in combined functions:", error);
  }
}

module.exports = {
  // String Functions
  getUserFullInfo,
  getUserPostSummary,
  getUserInitials,
  getNormalizedUsernames,
  getUsernameLength,
  findEmailDomain,
  replaceProfanity,
  trimWhitespace,
  generateDashboard,
  extractEmailComponents,
  
  // Date/Time Functions
  getCurrentTimestamp,
  getPostsByMonth,
  getPostsByDayOfWeek,
  getTrendingPostsByWeek,
  getUsersJoinedLastMonth,
  getUserAccountAge,
  getFormattedDates,
  convertStringToDate,
  getUserPostStats
};
