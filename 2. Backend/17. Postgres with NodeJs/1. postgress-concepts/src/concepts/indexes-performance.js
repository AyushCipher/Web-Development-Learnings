const db = require("../db/db");

// INDEXES: Improving Query Performance:

// Single Column Index - Fast lookups on frequently searched columns
async function createIndexOnEmail() {
  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `;

  try {
    await db.query(createIndexQuery);
    console.log("Index on email created");
  } catch (error) {
    console.error("Error creating index:", error);
  }
}


// Composite Index - For queries filtering on multiple columns
async function createCompositeIndex() {
  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_posts_user_created 
    ON posts(user_id, created_at DESC);
  `;

  try {
    await db.query(createIndexQuery);
    console.log("Composite index created");
  } catch (error) {
    console.error("Error creating composite index:", error);
  }
}


// Unique Index - Ensures uniqueness and improves lookup speed
async function createUniqueIndex() {
  const createIndexQuery = `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique 
    ON users(LOWER(username));
  `;

  try {
    await db.query(createIndexQuery);
    console.log("Unique index created");
  } catch (error) {
    console.error("Error creating unique index:", error);
  }
}


// Partial Index - Index only rows matching a condition
async function createPartialIndex() {
  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_active_posts 
    ON posts(user_id) WHERE created_at > NOW() - INTERVAL '30 days';
  `;

  try {
    await db.query(createIndexQuery);
    console.log("Partial index on active posts created");
  } catch (error) {
    console.error("Error creating partial index:", error);
  }
}


// Full Text Search Index - For text searching
async function createFullTextSearchIndex() {
  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_posts_content_search 
    ON posts USING GIN(to_tsvector('english', content));
  `;

  try {
    await db.query(createIndexQuery);
    console.log("Full text search index created");
  } catch (error) {
    console.error("Error creating FTS index:", error);
  }
}


// JSONB Index - For efficient JSON queries
async function createJsonbIndex() {
  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_users_metadata 
    ON users USING GIN(metadata);
  `;

  try {
    await db.query(createIndexQuery);
    console.log("JSONB index created");
  } catch (error) {
    console.error("Error creating JSONB index:", error);
  }
}


// Index on Expression - For computed values
async function createExpressionIndex() {
  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_users_lowercase_email 
    ON users(LOWER(email));
  `;

  try {
    await db.query(createIndexQuery);
    console.log("Expression index created");
  } catch (error) {
    console.error("Error creating expression index:", error);
  }
}


// List all indexes on a table
async function listIndexes(tableName) {
  const listIndexesQuery = `
    SELECT 
      indexname,
      indexdef,
      idx_scan,
      idx_tup_read,
      idx_tup_fetch
    FROM pg_stat_user_indexes
    WHERE relname = $1
  `;

  try {
    const result = await db.query(listIndexesQuery, [tableName]);
    return result.rows;
  } catch (error) {
    console.error("Error listing indexes:", error);
  }
}


// Check Index Usage - Identify unused indexes
async function checkIndexUsage() {
  const checkIndexQuery = `
    SELECT 
      schemaname,
      tablename,
      indexname,
      idx_scan,
      idx_tup_read,
      idx_tup_fetch,
      CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_tup_read > idx_tup_fetch * 10 THEN 'INEFFICIENT'
        ELSE 'HEALTHY'
      END as status
    FROM pg_stat_user_indexes
    ORDER BY idx_scan ASC
  `;

  try {
    const result = await db.query(checkIndexQuery);
    return result.rows;
  } catch (error) {
    console.error("Error checking index usage:", error);
  }
}


// Drop Index - Remove unnecessary indexes
async function dropIndex(indexName) {
  const dropIndexQuery = `DROP INDEX IF EXISTS ${indexName}`;

  try {
    await db.query(dropIndexQuery);
    console.log(`Index ${indexName} dropped`);
  } catch (error) {
    console.error("Error dropping index:", error);
  }
}




// PERFORMANCE ANALYSIS: EXPLAIN & ANALYZE:

// EXPLAIN - Shows query execution plan (without running it)
async function explainQuery() {
  const explainQuery = `
    EXPLAIN 
    SELECT u.username, COUNT(p.id) as post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.username
  `;

  try {
    const result = await db.query(explainQuery);
    console.log("Query Plan:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error in EXPLAIN:", error);
  }
}


// EXPLAIN ANALYZE - Shows actual execution stats (runs the query)
async function explainAnalyzeQuery() {
  const explainAnalyzeQuery = `
    EXPLAIN ANALYZE
    SELECT u.username, COUNT(p.id) as post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.username
  `;

  try {
    const result = await db.query(explainAnalyzeQuery);
    console.log("Actual Query Execution Stats:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error in EXPLAIN ANALYZE:", error);
  }
}


// EXPLAIN with JSON format - Better for parsing
async function explainAnalyzeQueryJSON() {
  const explainAnalyzeQuery = `
    EXPLAIN (FORMAT JSON, ANALYZE)
    SELECT u.username, COUNT(p.id) as post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    WHERE u.created_at > NOW() - INTERVAL '30 days'
    GROUP BY u.id, u.username
  `;

  try {
    const result = await db.query(explainAnalyzeQuery);
    return result.rows[0];
  } catch (error) {
    console.error("Error in EXPLAIN ANALYZE JSON:", error);
  }
}


// Slow Query Log - Find expensive queries
async function getSlowQueries() {
  const slowQueryQuery = `
    SELECT 
      query,
      calls,
      total_time,
      mean_time,
      max_time,
      ROUND(mean_time::numeric, 2) as avg_ms
    FROM pg_stat_statements
    WHERE query NOT LIKE 'EXPLAIN%'
    ORDER BY mean_time DESC
    LIMIT 10
  `;

  try {
    const result = await db.query(slowQueryQuery);
    return result.rows;
  } catch (error) {
    console.error("Error fetching slow queries:", error);
  }
}


// Analyze Table - Update statistics for query planner
async function analyzeTable(tableName) {
  const analyzeQuery = `ANALYZE ${tableName}`;

  try {
    await db.query(analyzeQuery);
    console.log(`Table ${tableName} analyzed`);
  } catch (error) {
    console.error("Error analyzing table:", error);
  }
}


// Vacuum Table - Remove dead rows and update statistics
async function vacuumTable(tableName) {
  const vacuumQuery = `VACUUM ANALYZE ${tableName}`;

  try {
    await db.query(vacuumQuery);
    console.log(`Table ${tableName} vacuumed and analyzed`);
  } catch (error) {
    console.error("Error vacuuming table:", error);
  }
}


// Get Table Statistics
async function getTableStats(tableName) {
  const statsQuery = `
    SELECT 
      schemaname,
      tablename,
      seq_scan,
      seq_tup_read,
      idx_scan,
      idx_tup_fetch,
      n_tup_ins,
      n_tup_upd,
      n_tup_del
    FROM pg_stat_user_tables
    WHERE tablename = $1
  `;

  try {
    const result = await db.query(statsQuery, [tableName]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching table stats:", error);
  }
}


// Performance Optimization: Find tables needing indexes
async function identifyMissingIndexes() {
  const missingIndexQuery = `
    SELECT 
      t.tablename,
      a.attname,
      n_distinct,
      correlation
    FROM pg_stat_user_tables t
    JOIN pg_attribute a ON a.attrelid = t.relid
    WHERE n_distinct > 100
      AND correlation < 0.1
      AND attnum > 0
    ORDER BY n_distinct DESC
    LIMIT 10
  `;

  try {
    const result = await db.query(missingIndexQuery);
    return result.rows;
  } catch (error) {
    console.error("Error identifying missing indexes:", error);
  }
}

module.exports = {
  createIndexOnEmail,
  createCompositeIndex,
  createUniqueIndex,
  createPartialIndex,
  createFullTextSearchIndex,
  createJsonbIndex,
  createExpressionIndex,
  listIndexes,
  checkIndexUsage,
  dropIndex,
  explainQuery,
  explainAnalyzeQuery,
  explainAnalyzeQueryJSON,
  getSlowQueries,
  analyzeTable,
  vacuumTable,
  getTableStats,
  identifyMissingIndexes
};
