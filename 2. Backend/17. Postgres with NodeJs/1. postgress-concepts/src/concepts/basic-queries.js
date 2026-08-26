const db = require("../db/db");

/*
  BASIC QUERIES (CRUD) - COMPREHENSIVE EXAMPLES (Intermediate)
  
  Demonstrates all CRUD operations with intermediate patterns:
  - CREATE TABLE
  - INSERT (single, bulk, conditional)
  - SELECT (all, specific columns, with WHERE)
  - UPDATE (single, multiple, conditional)
  - DELETE (single, conditional, bulk)
  - RETURNING clause
  - Batch operations
  - Insert from SELECT
*/



// TABLE CREATION:
async function createUsersTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      age INTEGER,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await db.query(createTableQuery);
    console.log("Users table created successfully");
    return true;
  } catch (error) {
    console.error("Error while creating users table", error);
    throw error;
  }
}




// CREATE (INSERT) OPERATIONS:

// Insert single user
async function insertUser(username, email, age = null) {
  const insertUserQuery = `
    INSERT INTO users (username, email, age)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  try {
    const res = await db.query(insertUserQuery, [username, email, age]);
    console.log("User inserted successfully:", res.rows[0]);
    return res.rows[0];
  } catch (error) {
    console.error("Error while inserting user:", error);
    throw error;
  }
}

// Insert multiple users (bulk insert)
async function insertMultipleUsers(usersData) {
  const query = `
    INSERT INTO users (username, email, age)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  try {
    const results = [];
    for (const user of usersData) {
      const res = await db.query(query, [user.username, user.email, user.age]);
      results.push(res.rows[0]);
    }
    console.log(`${results.length} users inserted successfully`);
    return results;
  } catch (error) {
    console.error("Error while inserting multiple users:", error);
    throw error;
  }
}

// Insert with default values (conditional insert)
async function insertUserWithDefaults(username, email) {
  const query = `
    INSERT INTO users (username, email, status)
    VALUES ($1, $2, 'active')
    RETURNING id, username, email, status, created_at
  `;

  try {
    const res = await db.query(query, [username, email]);
    return res.rows[0];
  } catch (error) {
    console.error("Error inserting user with defaults:", error);
    throw error;
  }
}

// Insert from SELECT (copy data from another table)
async function insertUsersFromArchive() {
  const query = `
    INSERT INTO users (username, email, age)
    SELECT username, email, age FROM users_archive
    WHERE archived_at IS NOT NULL
    RETURNING *
  `;

  try {
    const res = await db.query(query);
    console.log(`${res.rows.length} users inserted from archive`);
    return res.rows;
  } catch (error) {
    console.error("Error inserting from archive:", error);
    throw error;
  }
}




// READ (SELECT) OPERATIONS:

// Fetch all users
async function fetchAllUsers() {
  const query = "SELECT * FROM users ORDER BY created_at DESC";

  try {
    const res = await db.query(query);
    console.log(`Fetched ${res.rows.length} users`);
    return res.rows;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Fetch specific columns
async function fetchUsersBasicInfo() {
  const query = `
    SELECT id, username, email, created_at
    FROM users
    ORDER BY username
  `;

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (error) {
    console.error("Error fetching basic user info:", error);
    throw error;
  }
}

// Fetch by ID
async function fetchUserById(userId) {
  const query = `
    SELECT * FROM users
    WHERE id = $1
  `;

  try {
    const res = await db.query(query, [userId]);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
}

// Fetch with conditions
async function fetchUsersByStatus(status) {
  const query = `
    SELECT * FROM users
    WHERE status = $1
    ORDER BY username
  `;

  try {
    const res = await db.query(query, [status]);
    return res.rows;
  } catch (error) {
    console.error("Error fetching users by status:", error);
    throw error;
  }
}



// UPDATE OPERATIONS:

// Update single user
async function updateUserInfo(userId, newEmail) {
  const query = `
    UPDATE users
    SET email = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  try {
    const res = await db.query(query, [userId, newEmail]);
    if (res.rows.length > 0) {
      console.log("User updated successfully:", res.rows[0]);
      return res.rows[0];
    } else {
      console.log("No user found with ID:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Update multiple columns
async function updateUserComplete(userId, email, age, status) {
  const query = `
    UPDATE users
    SET 
      email = $2,
      age = $3,
      status = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  try {
    const res = await db.query(query, [userId, email, age, status]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Update conditional (update by username)
async function updateUserByUsername(username, newEmail) {
  const query = `
    UPDATE users
    SET email = $2, updated_at = CURRENT_TIMESTAMP
    WHERE username = $1
    RETURNING *
  `;

  try {
    const res = await db.query(query, [username, newEmail]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error updating user by username:", error);
    throw error;
  }
}

// Update multiple records
async function activateAllInactiveUsers() {
  const query = `
    UPDATE users
    SET status = 'active', updated_at = CURRENT_TIMESTAMP
    WHERE status != 'active'
    RETURNING id, username, status
  `;

  try {
    const res = await db.query(query);
    console.log(`${res.rows.length} users activated`);
    return res.rows;
  } catch (error) {
    console.error("Error activating users:", error);
    throw error;
  }
}

// Increment/Decrement (like view count)
async function incrementUserAge(userId) {
  const query = `
    UPDATE users
    SET age = COALESCE(age, 0) + 1
    WHERE id = $1
    RETURNING *
  `;

  try {
    const res = await db.query(query, [userId]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error incrementing age:", error);
    throw error;
  }
}



// DELETE OPERATIONS:

// Delete single user
async function deleteUserById(userId) {
  const query = `
    DELETE FROM users
    WHERE id = $1
    RETURNING *
  `;

  try {
    const res = await db.query(query, [userId]);
    if (res.rows.length > 0) {
      console.log("User deleted successfully:", res.rows[0]);
      return res.rows[0];
    } else {
      console.log("No user found with ID:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Delete by username
async function deleteUserByUsername(username) {
  const query = `
    DELETE FROM users
    WHERE username = $1
    RETURNING *
  `;

  try {
    const res = await db.query(query, [username]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error deleting user by username:", error);
    throw error;
  }
}

// Delete multiple records (delete inactive users)
async function deleteInactiveUsers() {
  const query = `
    DELETE FROM users
    WHERE status = 'inactive'
    AND updated_at < CURRENT_DATE - INTERVAL '90 days'
    RETURNING id, username
  `;

  try {
    const res = await db.query(query);
    console.log(`${res.rows.length} inactive users deleted`);
    return res.rows;
  } catch (error) {
    console.error("Error deleting inactive users:", error);
    throw error;
  }
}



// BATCH OPERATIONS:

// Batch insert with transaction
async function batchInsertUsers(usersData) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const query = `
      INSERT INTO users (username, email, age, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const results = [];
    for (const user of usersData) {
      const res = await client.query(query, [
        user.username,
        user.email,
        user.age,
        user.status || "active"
      ]);
      results.push(res.rows[0]);
    }

    await client.query("COMMIT");
    console.log(`Batch insert successful: ${results.length} users`);
    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Batch insert failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

// EXPORTS
module.exports = {
  // Create
  createUsersTable,

  // Insert operations
  insertUser,
  insertMultipleUsers,
  insertUserWithDefaults,
  insertUsersFromArchive,

  // Select operations
  fetchAllUsers,
  fetchUsersBasicInfo,
  fetchUserById,
  fetchUsersByStatus,

  // Update operations
  updateUserInfo,
  updateUserComplete,
  updateUserByUsername,
  activateAllInactiveUsers,
  incrementUserAge,

  // Delete operations
  deleteUserById,
  deleteUserByUsername,
  deleteInactiveUsers,

  // Batch operations
  batchInsertUsers,
};
