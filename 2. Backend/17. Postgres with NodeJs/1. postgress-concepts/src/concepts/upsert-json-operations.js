const db = require("../db/db");

// UPSERT OPERATIONS (INSERT ... ON CONFLICT):

// Simple UPSERT - Update if exists, insert if not
async function upsertUser(username, email) {
  const upsertQuery = `
    INSERT INTO users (username, email)
    VALUES ($1, $2)
    ON CONFLICT (username) 
    DO UPDATE SET email = EXCLUDED.email
    RETURNING *
  `;

  try {
    const result = await db.query(upsertQuery, [username, email]);
    return result.rows[0];
  } catch (error) {
    console.error("Error in simple UPSERT:", error);
  }
}


// UPSERT with multiple columns
async function upsertUserProfile(username, email, country, age) {
  const upsertQuery = `
    INSERT INTO users (username, email, country, age)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (username) 
    DO UPDATE SET 
      email = EXCLUDED.email,
      country = EXCLUDED.country,
      age = EXCLUDED.age,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  try {
    const result = await db.query(upsertQuery, [username, email, country, age]);
    return result.rows[0];
  } catch (error) {
    console.error("Error in multi-column UPSERT:", error);
  }
}


// UPSERT on unique constraint
async function upsertByEmail(username, email) {
  const upsertQuery = `
    INSERT INTO users (username, email)
    VALUES ($1, $2)
    ON CONFLICT (email) 
    DO UPDATE SET username = EXCLUDED.username
    RETURNING *
  `;

  try {
    const result = await db.query(upsertQuery, [username, email]);
    return result.rows[0];
  } catch (error) {
    console.error("Error in email UPSERT:", error);
  }
}


// UPSERT with conditional logic
async function upsertUserWithCondition(username, email, status) {
  const upsertQuery = `
    INSERT INTO users (username, email, status)
    VALUES ($1, $2, $3)
    ON CONFLICT (username) 
    DO UPDATE SET 
      email = CASE WHEN EXCLUDED.email IS NOT NULL THEN EXCLUDED.email ELSE users.email END,
      status = CASE WHEN EXCLUDED.status != 'inactive' THEN EXCLUDED.status ELSE users.status END
    RETURNING *
  `;

  try {
    const result = await db.query(upsertQuery, [username, email, status]);
    return result.rows[0];
  } catch (error) {
    console.error("Error in conditional UPSERT:", error);
  }
}


// UPSERT multiple records
async function batchUpsertUsers(users) {
  const values = users.map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`).join(',');
  const params = users.flatMap(u => [u.username, u.email]);

  const upsertQuery = `
    INSERT INTO users (username, email) VALUES ${values}
    ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
    RETURNING *
  `;

  try {
    const result = await db.query(upsertQuery, params);
    return result.rows;
  } catch (error) {
    console.error("Error in batch UPSERT:", error);
  }
}




// JSON OPERATIONS:

// Insert JSON data
async function insertUserWithJsonMetadata(username, email, metadata) {
  const insertQuery = `
    INSERT INTO users (username, email, metadata)
    VALUES ($1, $2, $3::JSONB)
    RETURNING *
  `;

  try {
    const result = await db.query(insertQuery, [username, email, JSON.stringify(metadata)]);
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting JSON:", error);
  }
}

// Query JSON - Extract nested values
async function getUserMetadataFields() {
  const query = `
    SELECT 
      username,
      metadata->>'name' as name,
      (metadata->'age')::INT as age,
      metadata->'preferences'->>'theme' as theme,
      metadata->>'verified' as verified
    FROM users
    WHERE metadata IS NOT NULL
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error querying JSON:", error);
  }
}

// JSON array operations
async function updateUserPreferences(userId, preferences) {
  const updateQuery = `
    UPDATE users
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'::JSONB),
      '{preferences}',
      $2::JSONB
    )
    WHERE id = $1
    RETURNING *
  `;

  try {
    const result = await db.query(updateQuery, [userId, JSON.stringify(preferences)]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating JSON:", error);
  }
}



// JSON array aggregation
async function getUsersWithSkills() {
  const query = `
    SELECT 
      username,
      metadata->'skills' as skills_array,
      jsonb_array_length(metadata->'skills') as skill_count,
      metadata->'skills'->0 as first_skill
    FROM users
    WHERE metadata->'skills' IS NOT NULL
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error getting JSON arrays:", error);
  }
}


// JSONB operations - contains
async function getUsersBySkillContainment(skillsArray) {
  const query = `
    SELECT username, metadata
    FROM users
    WHERE metadata @> $1::JSONB
  `;

  try {
    const result = await db.query(query, [JSON.stringify({ skills: skillsArray })]);
    return result.rows;
  } catch (error) {
    console.error("Error in JSONB containment:", error);
  }
}


// JSONB to table - Convert JSON array to rows
async function expandUserSkills() {
  const query = `
    SELECT 
      u.username,
      jsonb_array_elements(u.metadata->'skills') as skill
    FROM users u
    WHERE u.metadata->'skills' IS NOT NULL
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error expanding JSON:", error);
  }
}


// Complex JSON path operations
async function getNestedJsonData() {
  const query = `
    SELECT 
      username,
      metadata,
      metadata #> '{profile, bio}' as bio,
      metadata #>> '{profile, location}' as location,
      jsonb_object_keys(metadata) as top_level_keys
    FROM users
    WHERE metadata IS NOT NULL
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error in complex JSON paths:", error);
  }
}


// Aggregate JSON results
async function aggregateUserMetadata() {
  const query = `
    SELECT 
      jsonb_object_agg(username, metadata) as all_metadata
    FROM users
    WHERE metadata IS NOT NULL
  `;

  try {
    const result = await db.query(query);
    return result.rows[0];
  } catch (error) {
    console.error("Error aggregating JSON:", error);
  }
}


// Create table with JSON support
async function createUsersTableWithJson() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users_with_json (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      metadata JSONB DEFAULT '{}'::JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await db.query(createTableQuery);
    console.log("Users table with JSON support created");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
}


module.exports = {
  // UPSERT Operations
  upsertUser,
  upsertUserProfile,
  upsertByEmail,
  upsertUserWithCondition,
  batchUpsertUsers,
  
  // JSON Operations
  insertUserWithJsonMetadata,
  getUserMetadataFields,
  updateUserPreferences,
  getUsersWithSkills,
  getUsersBySkillContainment,
  expandUserSkills,
  getNestedJsonData,
  aggregateUserMetadata,
  createUsersTableWithJson
};
