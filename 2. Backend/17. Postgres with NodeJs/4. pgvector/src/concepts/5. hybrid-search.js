const { pool } = require("../db/connection");
const pgvector = require("pgvector/pg");

// Q. WHAT IS HYBRID SEARCH AND WHY IS IT POSTGRESQLS BIGGEST ADVANTAGE?
// ANS:
// - Vector Search (Semantic): Excellent at understanding conceptual meaning and synonyms (e.g. "car" matches "automobile").
//   Weakness: Can fail on exact keywords, part numbers (e.g. "iPhone 15 Pro Max 256GB"), or specific error codes ("ERR_HTTP_INVALID_HEADER").
// - Keyword Search (Full-Text Search via tsvector/BM25): Excellent at exact keyword matching.
//   Weakness: Cannot match synonyms or conceptual intent.
//
// Hybrid Search combines both! In PostgreSQL, you can run Full-Text Search AND pgvector in a single SQL query
// using Reciprocal Rank Fusion (RRF) — no external search engine (like Elasticsearch or Pinecone) required!

async function setupAndRunHybridSearch() {
  const client = await pool.connect();
  try {
    console.log("\n========================================================");
    console.log(" CONCEPT 5: HYBRID SEARCH (FULL-TEXT + PGVECTOR RRF)    ");
    console.log("========================================================");

    // 1. Add full-text search tsvector column to our documents table
    await client.query(`
      ALTER TABLE documents ADD COLUMN IF NOT EXISTS fts_tokens tsvector
      GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED;

      CREATE INDEX IF NOT EXISTS documents_fts_idx ON documents USING gin(fts_tokens);
    `);
    console.log("✓ Full-text search (GIN) index configured on documents.");

    const userQuery = "Postgres microservices architecture";
    const queryVector = [0.12, 0.88, 0.20]; // Backend oriented
    const querySql = pgvector.toSql(queryVector);

    // 2. RECIPROCAL RANK FUSION (RRF) SQL QUERY
    // RRF Score = (1 / (60 + semantic_rank)) + (1 / (60 + keyword_rank))
    const rrfQuery = `
      WITH semantic_search AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> $1) as rank
        FROM documents
        ORDER BY embedding <=> $1
        LIMIT 10
      ),
      keyword_search AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(fts_tokens, plainto_tsquery('english', $2)) DESC) as rank
        FROM documents
        WHERE fts_tokens @@ plainto_tsquery('english', $2)
        LIMIT 10
      )
      SELECT 
        d.id,
        d.title,
        d.content,
        COALESCE(1.0 / (60 + s.rank), 0.0) + COALESCE(1.0 / (60 + k.rank), 0.0) AS rrf_score,
        s.rank as semantic_rank,
        k.rank as keyword_rank
      FROM documents d
      LEFT JOIN semantic_search s ON d.id = s.id
      LEFT JOIN keyword_search k ON d.id = k.id
      WHERE s.id IS NOT NULL OR k.id IS NOT NULL
      ORDER BY rrf_score DESC
      LIMIT 3;
    `;

    const result = await client.query(rrfQuery, [querySql, userQuery]);

    console.log(`\nHybrid Search Results for "${userQuery}":`);
    console.table(
      result.rows.map((row) => ({
        ID: row.id,
        Title: row.title,
        "RRF Score": Number(row.rrf_score).toFixed(5),
        "Semantic Rank": row.semantic_rank || "N/A",
        "Keyword Rank": row.keyword_rank || "N/A",
      }))
    );
  } finally {
    client.release();
  }
}

module.exports = { setupAndRunHybridSearch };
