const db = require("../db/db");

/*
  FILTERING & SORTING - COMPREHENSIVE EXAMPLES (Intermediate)
  
  Demonstrates advanced filtering and sorting techniques:
  - WHERE with multiple conditions (AND, OR, NOT)
  - LIKE pattern matching
  - IN, BETWEEN operators
  - NULL handling
  - Multiple ORDER BY
  - DISTINCT
  - Complex filtering
*/


// BASIC WHERE FILTERING:

// Simple WHERE clause:
async function getUsersByEmail(email) {
  const query = `
    SELECT * FROM users
    WHERE email = $1
  `;

  try {
    const res = await db.query(query, [email]);
    return res.rows;
  } catch (e) {
    console.error("Error in getUsersByEmail:", e);
    throw e;
  }
}

// WHERE with multiple conditions(AND):
async function getUsersByEmailAndUsername(email, username) {
  const query = `
    SELECT * FROM users
    WHERE email = $1 AND username = $2
  `;

  try {
    const res = await db.query(query, [email, username]);
    return res.rows;
  } catch (e) {
    console.error("Error in getUsersByEmailAndUsername:", e);
    throw e;
  }
}


// WHERE with OR condition:
async function getUsersByEmailOrUsername(email, username) {
  const query = `
    SELECT * FROM users
    WHERE email = $1 OR username = $2
    ORDER BY created_at DESC
  `;

  try {
    const res = await db.query(query, [email, username]);
    return res.rows;
  } catch (e) {
    console.error("Error in getUsersByEmailOrUsername:", e);
    throw e;
  }
}



// PATTERN MATCHING (LIKE, ILIKE): 

// LIKE operator (case-sensitive)
async function searchUsersByUsername(searchTerm) {
  const query = `
    SELECT * FROM users
    WHERE username LIKE $1
    ORDER BY username
  `;

  try {
    const res = await db.query(query, [`%${searchTerm}%`]);
    return res.rows;
  } catch (e) {
    console.error("Error in searchUsersByUsername:", e);
    throw e;
  }
}


// Prefix match (e.g. usernames starting with "Z") - kept as its own
// parameterized function rather than accepting a raw SQL fragment, so a
// caller can never inject arbitrary SQL through the "filter" argument.
async function getUsersStartingWith(prefix) {
  const query = `
    SELECT * FROM users
    WHERE username LIKE $1
    ORDER BY username
  `;

  try {
    const res = await db.query(query, [`${prefix}%`]);
    return res.rows;
  } catch (e) {
    console.error("Error in getUsersStartingWith:", e);
    throw e;
  }
}


// ILIKE operator (case-insensitive)
async function searchUsersIgnoreCase(searchTerm) {
  const query = `
    SELECT * FROM users
    WHERE username ILIKE $1 OR email ILIKE $1
    ORDER BY username
  `;

  try {
    const res = await db.query(query, [`%${searchTerm}%`]);
    return res.rows;
  } catch (e) {
    console.error("Error in searchUsersIgnoreCase:", e);
    throw e;
  }
}


// IN, BETWEEN OPERATORS:

// IN operator - Check if value is in list
async function getUsersWithIds(userIds) {
  const query = `
    SELECT * FROM users
    WHERE id = ANY($1)
    ORDER BY id
  `;

  try {
    const res = await db.query(query, [userIds]);
    return res.rows;
  } catch (e) {
    console.error("Error in getUsersWithIds:", e);
    throw e;
  }
}

// BETWEEN operator - Date range:
async function getUsersCreatedBetweenDates(startDate, endDate) {
  const query = `
    SELECT * FROM users
    WHERE created_at BETWEEN $1 AND $2
    ORDER BY created_at
  `;

  try {
    const res = await db.query(query, [startDate, endDate]);
    return res.rows;
  } catch (e) {
    console.error("Error in getUsersCreatedBetweenDates:", e);
    throw e;
  }
}



// NULL HANDLING:

// IS NULL:
async function getPostsWithoutUser() {
  const query = `
    SELECT * FROM posts
    WHERE user_id IS NULL
    ORDER BY created_at DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getPostsWithoutUser:", e);
    throw e;
  }
}


// IS NOT NULL:
async function getPostsWithUser() {
  const query = `
    SELECT * FROM posts
    WHERE user_id IS NOT NULL
    ORDER BY created_at DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getPostsWithUser:", e);
    throw e;
  }
}



// SORTING (ORDER BY):

// Single column sort:
async function getSortedUsers(column = "created_at", order = "ASC") {
  const validColumns = ["id", "username", "email", "created_at"];
  if (!validColumns.includes(column)) {
    throw new Error("Invalid column name");
  }

  const query = `
    SELECT * FROM users
    ORDER BY ${column} ${order}
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (e) {
    console.error("Error in getSortedUsers:", e);
    throw e;
  }
}


// Multiple ORDER BY:
async function getSortedUsersMultiple() {
  const query = `
    SELECT * FROM users
    ORDER BY username ASC, created_at DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getSortedUsersMultiple:", e);
    throw e;
  }
}


// Sort with NULLS FIRST/LAST:
async function getPostsSortedWithNulls() {
  const query = `
    SELECT * FROM posts
    ORDER BY user_id ASC NULLS LAST, created_at DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getPostsSortedWithNulls:", e);
    throw e;
  }
}




// PAGINATION

// Pagination with LIMIT and OFFSET:
async function getPaginatedUsers(limit = 10, offset = 0) {
  const query = `
    SELECT * FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  try {
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  } catch (e) {
    console.error("Error in getPaginatedUsers:", e);
    throw e;
  }
}


// Pagination with total count:
async function getPaginatedUsersWithCount(limit = 10, page = 1) {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT * FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `
    SELECT COUNT(*) as total FROM users
  `;

  try {
    const [result, countResult] = await Promise.all([
      db.query(query, [limit, offset]),
      db.query(countQuery)
    ]);

    return {
      data: result.rows,
      total: countResult.rows[0].total,
      page,
      limit,
      pages: Math.ceil(countResult.rows[0].total / limit)
    };
  } catch (e) {
    console.error("Error in getPaginatedUsersWithCount:", e);
    throw e;
  }
}



// DISTINCT:

// DISTINCT values
async function getDistinctEmailDomains() {
  const query = `
    SELECT DISTINCT 
      SUBSTRING(email FROM '@' FOR 100) as domain
    FROM users
    WHERE email LIKE '%@%'
    ORDER BY domain
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getDistinctEmailDomains:", e);
    throw e;
  }
}




// COMPLEX FILTERING:

// Complex conditions with AND/OR/NOT:
async function getActiveUsersWithRecentPosts() {
  const query = `
    SELECT DISTINCT u.* FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    WHERE 
      (u.email LIKE '%@gmail.com' OR u.email LIKE '%@yahoo.com')
      AND p.created_at > CURRENT_DATE - INTERVAL '30 days'
      AND u.created_at IS NOT NULL
    ORDER BY u.created_at DESC
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getActiveUsersWithRecentPosts:", e);
    throw e;
  }
}


// NOT operator
async function getUsersNotFromGmail() {
  const query = `
    SELECT * FROM users
    WHERE NOT email LIKE '%@gmail.com'
    ORDER BY username
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error in getUsersNotFromGmail:", e);
    throw e;
  }
}


// EXPORTS
module.exports = {
  // Basic filtering
  getUsersByEmail,
  getUsersByEmailAndUsername,
  getUsersByEmailOrUsername,

  // Pattern matching
  getUsersStartingWith,
  searchUsersByUsername,
  searchUsersIgnoreCase,

  // IN, BETWEEN
  getUsersWithIds,
  getUsersCreatedBetweenDates,

  // NULL handling
  getPostsWithoutUser,
  getPostsWithUser,

  // Sorting
  getSortedUsers,
  getSortedUsersMultiple,
  getPostsSortedWithNulls,

  // Pagination
  getPaginatedUsers,
  getPaginatedUsersWithCount,

  // Distinct
  getDistinctEmailDomains,

  // Complex filtering
  getActiveUsersWithRecentPosts,
  getUsersNotFromGmail,
};
