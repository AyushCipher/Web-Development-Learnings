const db = require("../db/db");

// DATA TYPES & CONSTRAINTS:

// Create comprehensive table with various data types
async function createDataTypesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS data_types_demo (
      -- Numeric Types
      id SERIAL PRIMARY KEY,
      integer_col INTEGER,
      bigint_col BIGINT,
      decimal_col DECIMAL(10, 2),
      real_col REAL,
      double_col DOUBLE PRECISION,
      
      -- String Types
      varchar_col VARCHAR(100),
      char_col CHAR(10),
      text_col TEXT,
      
      -- Boolean Type
      is_active BOOLEAN DEFAULT true,
      
      -- Date/Time Types
      date_col DATE,
      time_col TIME,
      timestamp_col TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      
      -- Array Types
      tags ARRAY[TEXT] DEFAULT ARRAY[]::TEXT[],
      scores ARRAY[INTEGER],
      
      -- JSON Type
      metadata JSONB,
      
      -- UUID Type
      unique_id UUID DEFAULT gen_random_uuid(),
      
      -- Constraints
      CONSTRAINT email_format CHECK (varchar_col LIKE '%@%'),
      CONSTRAINT price_positive CHECK (decimal_col > 0),
      CONSTRAINT score_range CHECK (real_col BETWEEN 0 AND 100)
    )
  `;

  try {
    await db.query(createTableQuery);
    console.log("Data types table created");
  } catch (error) {
    console.error("Error creating data types table:", error);
  }
}


// Numeric Types Examples
async function insertNumericData() {
  const insertQuery = `
    INSERT INTO data_types_demo (
      integer_col, bigint_col, decimal_col, real_col, double_col
    ) VALUES
      (42, 9223372036854775800, 99.99, 3.14, 2.71828),
      (-100, 0, 0.01, 100.5, 1.41421)
    RETURNING *
  `;

  try {
    const result = await db.query(insertQuery);
    return result.rows;
  } catch (error) {
    console.error("Error inserting numeric data:", error);
  }
}


// String Types Examples
async function insertStringData() {
  const insertQuery = `
    INSERT INTO data_types_demo (varchar_col, char_col, text_col) VALUES
      ('user@example.com', 'FIXED    ', 'This is a long text that can contain multiple lines and paragraphs...'),
      ('admin@test.org', 'SHORT   ', 'Another example')
    RETURNING varchar_col, char_col, text_col
  `;

  try {
    const result = await db.query(insertQuery);
    return result.rows;
  } catch (error) {
    console.error("Error inserting string data:", error);
  }
}


// Boolean Type Examples
async function insertBooleanData() {
  const insertQuery = `
    INSERT INTO data_types_demo (varchar_col, is_active) VALUES
      ('test1@example.com', true),
      ('test2@example.com', false),
      ('test3@example.com', true)
    RETURNING varchar_col, is_active
  `;

  try {
    const result = await db.query(insertQuery);
    return result.rows;
  } catch (error) {
    console.error("Error inserting boolean data:", error);
  }
}


// Array Type Examples
async function insertArrayData() {
  const insertQuery = `
    INSERT INTO data_types_demo (varchar_col, tags, scores) VALUES
      ('user@example.com', ARRAY['nodejs', 'postgres', 'react'], ARRAY[85, 90, 78]),
      ('admin@test.org', ARRAY['python', 'django'], ARRAY[92, 88])
    RETURNING varchar_col, tags, scores
  `;

  try {
    const result = await db.query(insertQuery);
    return result.rows;
  } catch (error) {
    console.error("Error inserting array data:", error);
  }
}


// Query Array Types
async function queryArrayData() {
  const query = `
    SELECT 
      varchar_col,
      tags,
      scores,
      tags[1] as first_tag,
      array_length(tags, 1) as tag_count,
      ARRAY_AGG(score) as aggregated_scores
    FROM (
      SELECT varchar_col, tags, scores, unnest(scores) as score FROM data_types_demo
    ) subq
    GROUP BY varchar_col, tags, scores
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error querying array data:", error);
  }
}


// JSON Type Examples
async function insertJsonData() {
  const insertQuery = `
    INSERT INTO data_types_demo (varchar_col, metadata) VALUES
      (
        'user@example.com',
        '{
          "name": "John Doe",
          "age": 30,
          "preferences": {
            "theme": "dark",
            "notifications": true
          },
          "skills": ["JavaScript", "PostgreSQL", "React"]
        }'::JSONB
      ),
      (
        'admin@test.org',
        '{
          "name": "Jane Smith",
          "age": 25,
          "preferences": {
            "theme": "light",
            "notifications": false
          }
        }'::JSONB
      )
    RETURNING varchar_col, metadata
  `;

  try {
    const result = await db.query(insertQuery);
    return result.rows;
  } catch (error) {
    console.error("Error inserting JSON data:", error);
  }
}


// Query JSON Type
async function queryJsonData() {
  const query = `
    SELECT 
      varchar_col,
      metadata->>'name' as name,
      (metadata->'age')::INT as age,
      metadata->'preferences'->>'theme' as theme,
      metadata->'skills'->>'0' as first_skill,
      jsonb_array_length(metadata->'skills') as skill_count
    FROM data_types_demo
    WHERE metadata IS NOT NULL
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error querying JSON data:", error);
  }
}




// CONSTRAINTS:

// PRIMARY KEY - Uniquely identifies rows
async function demonstratePrimaryKey() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      product_id SERIAL PRIMARY KEY,
      product_name VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2)
    )
  `;

  try {
    await db.query(createTableQuery);
    console.log("Products table created with PRIMARY KEY");
  } catch (error) {
    console.error("Error:", error);
  }
}

// UNIQUE - Ensures uniqueness
async function demonstrateUniqueConstraint() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS unique_demo (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE,
      CONSTRAINT unique_combo UNIQUE (username, email)
    )
  `;

  try {
    await db.query(createTableQuery);
    console.log("Unique constraint table created");
  } catch (error) {
    console.error("Error:", error);
  }
}

// CHECK - Validates data
async function demonstrateCheckConstraint() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS employees (
      emp_id SERIAL PRIMARY KEY,
      emp_name VARCHAR(100),
      salary DECIMAL(10, 2),
      age INTEGER,
      CONSTRAINT salary_check CHECK (salary > 0),
      CONSTRAINT age_check CHECK (age >= 18 AND age <= 65),
      CONSTRAINT email_check CHECK (email LIKE '%@%.%')
    )
  `;

  try {
    await db.query(createTableQuery);
    console.log("Check constraint table created");
  } catch (error) {
    console.error("Error:", error);
  }
}

// FOREIGN KEY - References another table
async function demonstrateForeignKey() {
  const query = `
    CREATE TABLE IF NOT EXISTS orders (
      order_id SERIAL PRIMARY KEY,
      product_id INTEGER,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
    )
  `;

  try {
    await db.query(query);
    console.log("Foreign key constraint created");
  } catch (error) {
    console.error("Error:", error);
  }
}

// NOT NULL - Enforces non-null values
async function demonstrateNotNull() {
  const query = `
    CREATE TABLE IF NOT EXISTS contacts (
      contact_id SERIAL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL,
      phone VARCHAR(20)
    )
  `;

  try {
    await db.query(query);
    console.log("NOT NULL constraint table created");
  } catch (error) {
    console.error("Error:", error);
  }
}

// DEFAULT - Sets default value
async function demonstrateDefault() {
  const insertQuery = `
    INSERT INTO employees (emp_name, salary, age) VALUES
      ('Alice', 50000, 28),
      ('Bob', 60000, 35)
    RETURNING *
  `;

  try {
    const result = await db.query(insertQuery);
    return result.rows;
  } catch (error) {
    console.error("Error:", error);
  }
}

// Composite Constraints
async function createTableWithCompositeConstraints() {
  const query = `
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      age INTEGER CHECK (age >= 13),
      country VARCHAR(50) DEFAULT 'USA',
      status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT username_length CHECK (LENGTH(username) >= 3),
      CONSTRAINT email_format CHECK (email LIKE '%@%.%')
    )
  `;

  try {
    await db.query(query);
    console.log("Composite constraints table created");
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = {
  createDataTypesTable,
  insertNumericData,
  insertStringData,
  insertBooleanData,
  insertArrayData,
  queryArrayData,
  insertJsonData,
  queryJsonData,
  demonstratePrimaryKey,
  demonstrateUniqueConstraint,
  demonstrateCheckConstraint,
  demonstrateForeignKey,
  demonstrateNotNull,
  demonstrateDefault,
  createTableWithCompositeConstraints
};
