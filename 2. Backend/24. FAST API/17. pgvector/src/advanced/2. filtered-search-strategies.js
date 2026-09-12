const { pool } = require("../db/client");
const pgvector = require("pgvector/pg");

/**
 * ============================================================================
 *   ADVANCED TOPIC 2: FILTERED SEARCH STRATEGIES (WHERE + VECTORS)
 * ============================================================================
 * 
 * THE CHALLENGE WITH FILTERED VECTOR SEARCH:
 * 1. Post-filtering (Default in older vector engines):
 *    - Search graph returns top 100 closest vectors, THEN applies WHERE status = 'active'.
 *    - Problem: If only 2% of rows are active, you might get 0 results returned!
 * 
 * 2. Pre-filtering (PostgreSQL Partial & Composite Indexing):
 *    - Create targeted indexes for high-frequency filter paths.
 *    - Syntax: `CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops) WHERE is_active = true;`
 * 
 * 3. Iterative Index Scans (PostgreSQL 17 & pgvector 0.7+ / pgvectorscale):
 *    - The HNSW index automatically traverses the graph iteratively until K matching filtered rows are found.
 */

async function demonstrateFilteredSearch() {
  const client = await pool.connect();
  try {
    console.log("\n========================================================");
    console.log(" ADVANCED 2: FILTERED VECTOR SEARCH (WHERE CLAUSES)     ");
    console.log("========================================================");

    // 1. Create a partial HNSW index for active tech articles
    console.log("--> Creating Partial HNSW index for category = 'backend'...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS kb_backend_hnsw_idx 
      ON knowledge_base 
      USING hnsw (embedding vector_cosine_ops)
      WHERE category = 'backend';
    `);
    console.log("✓ Partial HNSW index active.");

    const queryVector = [0.15, 0.90, 0.20]; // Backend query
    const querySql = pgvector.toSql(queryVector);

    // 2. Query with relational filtering
    console.log("--> Executing filtered vector search (WHERE category = 'backend')...");
    const result = await client.query(
      `
      SELECT 
        id, 
        topic, 
        category, 
        author, 
        1 - (embedding <=> $1) AS similarity
      FROM knowledge_base
      WHERE category = 'backend' AND author = 'Ayush'
      ORDER BY embedding <=> $1 ASC
      LIMIT 2;
      `,
      [querySql]
    );

    console.table(
      result.rows.map((r) => ({
        ID: r.id,
        Topic: r.topic,
        Category: r.category,
        Author: r.author,
        Similarity: (Number(r.similarity) * 100).toFixed(1) + "%",
      }))
    );
  } finally {
    client.release();
  }
}

module.exports = { demonstrateFilteredSearch };
