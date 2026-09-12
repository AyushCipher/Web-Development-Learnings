const { pool } = require("../db/connection");

// Q. WHAT IS THE DIFFERENCE BETWEEN EXACT SEARCH (kNN) AND APPROXIMATE NEAREST NEIGHBOR (ANN)?
// ANS:
// - Exact Search (Sequential Scan): Compares the query vector against EVERY single row in the database.
//   100% recall (perfect accuracy), but O(N) complexity — crawls to a halt with millions of vectors.
// - ANN (Indexed Search): Uses specialized data structures (graphs or clusters) to search only a tiny fraction
//   of candidates. Sub-millisecond latency with 95-99% recall.

// Q. HNSW VS IVFFLAT: WHICH INDEX SHOULD YOU USE?
// ANS:
// -----------------------------------------------------------------------------------------------------
// Feature              | HNSW (Hierarchical Navigable Small World) | IVFFlat (Inverted File Flat)
// -----------------------------------------------------------------------------------------------------
// Structure            | Multi-layered graph                       | Inverted list / K-means clusters
// Query Performance    | Ultra-fast (Best-in-class)                | Moderate (Requires scanning `probes` lists)
// Recall / Accuracy    | Excellent (>98%)                          | Good to Moderate (80-95%)
// Build Time & Memory  | Slower to build, higher RAM usage         | Fast to build, smaller RAM usage
// Can build on empty?  | YES (updates dynamically on INSERT)       | NO (needs representative data first)
// Recommendation       | DEFAULT CHOICE for 95% of production AI   | Use when RAM is extremely constrained
// -----------------------------------------------------------------------------------------------------

async function demonstrateVectorIndexing() {
  const client = await pool.connect();
  try {
    console.log("\n========================================================");
    console.log(" CONCEPT 3: PGVECTOR INDEXES (HNSW & IVFFLAT)          ");
    console.log("========================================================");

    // 1. CREATING AN HNSW INDEX
    // Syntax: CREATE INDEX ON table USING hnsw (column vector_distance_ops) WITH (m = 16, ef_construction = 64);
    // Distance ops mappings:
    // - vector_cosine_ops  -> for <=> (Cosine)
    // - vector_l2_ops      -> for <-> (Euclidean L2)
    // - vector_ip_ops      -> for <#> (Inner Product)

    console.log("--> Creating HNSW index with vector_cosine_ops...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_hnsw_idx 
      ON documents 
      USING hnsw (embedding vector_cosine_ops)
      WITH (m = 16, ef_construction = 64);
    `);
    console.log("✓ HNSW Index created.");

    // Tuning runtime search quality (ef_search):
    // Higher ef_search = higher recall, slightly higher latency. (default: 40)
    await client.query("SET hnsw.ef_search = 100;");

    // 2. CREATING AN IVFFLAT INDEX (Alternative)
    // Recommended 'lists' parameter: rows / 1000 for <= 1M rows, sqrt(rows) for > 1M rows.
    console.log("--> Creating IVFFlat index example (showing syntax)...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_ivfflat_idx 
      ON documents 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 10);
    `);
    console.log("✓ IVFFlat Index created.");

    // Tuning IVFFlat probes (number of cluster lists to check at query time, default: 1)
    await client.query("SET ivfflat.probes = 5;");

    // 3. EXPLAIN ANALYZE QUERY TO INSPECT EXECUTION PLAN
    console.log("--> Running EXPLAIN ANALYZE on vector similarity search...");
    const plan = await client.query(
      `
      EXPLAIN ANALYZE
      SELECT id, title, embedding <=> '[0.1, 0.9, 0.2]' AS dist
      FROM documents
      ORDER BY embedding <=> '[0.1, 0.9, 0.2]'
      LIMIT 2;
      `
    );

    console.log("\nExecution Plan output:");
    plan.rows.forEach((r) => console.log(" ", r["QUERY PLAN"]));
  } finally {
    client.release();
  }
}

module.exports = { demonstrateVectorIndexing };
