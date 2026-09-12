const { pool } = require("../db/client");

/**
 * ============================================================================
 *   TOPIC 3: VECTOR SEARCH INDEXES (IVFFLAT, HNSW, STREAMINGDISKANN)
 * ============================================================================
 * 
 * WHY ARE INDEXES NEEDED?
 * - Without an index, PostgreSQL runs an Exact Nearest Neighbor scan (checks every row).
 * - When your dataset reaches 100k+ or millions of rows, exact search takes seconds.
 * - Approximate Nearest Neighbor (ANN) indexes allow sub-5ms search with 95-99% accuracy.
 * 
 * ========================================================================================================
 * VECTOR SEARCH INDEX COMPARISON MATRIX (Based on PostgreSQL & pgvectorscale Ecosystem)
 * ========================================================================================================
 * 
 * 1. IVFFLAT (Inverted File Flat):
 *    - Best for: Medium workloads (100k - 1M vectors) with constrained RAM.
 *    - Pros:
 *      * Low memory usage
 *      * Faster than linear scan
 *    - Cons:
 *      * Updates require rebuilding the index every time (inserts degrade quality)
 *      * Lower accuracy vs HNSW and StreamingDiskANN
 * 
 * 2. HNSW (Hierarchical Navigable Small World):
 *    - Best for: Real-time search on medium workloads (100k - 1M vectors).
 *    - Pros:
 *      * Excellent balance between speed and accuracy (>98% recall)
 *      * Handles updates/inserts without rebuilding
 *      * Supports vector quantization (halfvec, PQ, BQ)
 *      * Fast (parallel) index build
 *    - Cons:
 *      * Problems with filtered search accuracy (graph connectivity issues when filtering)
 *      * High memory usage (must fit in RAM)
 *      * Cost scales with RAM
 *      * Scale limitations on a single server
 * 
 * 3. StreamingDiskANN (from pgvectorscale):
 *    - Best for: Real-time search, Filtered search use cases, Large scale workloads (10M+ to 1B+ vectors).
 *    - Pros:
 *      * High accuracy filtered search (solves HNSW filtering problem)
 *      * Scales to 1B+ vectors on NVMe SSD
 *      * Statistical Binary Quantization (SBQ) enabled by default (compresses vectors 32x)
 *      * Cost scales with NVMe SSD Disk + RAM (up to 75% cheaper than pure RAM HNSW)
 *      * Handles real-time updates without rebuilding
 *    - Cons:
 *      * Longer build times than pure HNSW
 */

async function setupAndExplainIndexes() {
  const client = await pool.connect();
  try {
    console.log("\n========================================================");
    console.log(" 3. CREATING & BENCHMARKING VECTOR INDEXES             ");
    console.log("========================================================");

    // 1. CREATING HNSW INDEX (The most widely used pgvector index)
    console.log("--> Creating HNSW index on 'knowledge_base' (vector_cosine_ops)...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS kb_embedding_hnsw_idx 
      ON knowledge_base 
      USING hnsw (embedding vector_cosine_ops)
      WITH (m = 16, ef_construction = 64);
    `);
    console.log("✓ HNSW index created successfully.");

    // Tuning runtime search quality for HNSW (default is 40):
    await client.query("SET hnsw.ef_search = 100;");
    console.log("✓ Set 'hnsw.ef_search = 100' for higher recall accuracy.");

    // 2. CREATING IVFFLAT INDEX (Syntax example)
    // Rule of thumb for IVFFlat lists:
    // - Up to 1M rows: lists = rows / 1000
    // - Over 1M rows: lists = sqrt(rows)
    console.log("--> Creating IVFFlat index example...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS kb_embedding_ivfflat_idx 
      ON knowledge_base 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 10);
    `);
    console.log("✓ IVFFlat index created.");

    // Tuning IVFFlat probes (default is 1):
    await client.query("SET ivfflat.probes = 5;");
    console.log("✓ Set 'ivfflat.probes = 5' for cluster search breadth.");

    // 3. STREAMINGDISKANN (pgvectorscale syntax)
    console.log("\n--- StreamingDiskANN (pgvectorscale) Overview ---");
    console.log("Syntax when pgvectorscale extension is loaded:");
    console.log(`
      CREATE INDEX kb_diskann_idx ON knowledge_base 
      USING diskann (embedding) 
      WITH (
        num_neighbors = 50,
        search_list_size = 100,
        max_alpha = 1.2,
        storage_layout = 'memory_optimized'
      );
    `);

    // 4. EXPLAIN ANALYZE QUERY INSPECTION
    console.log("--> Running EXPLAIN ANALYZE to inspect execution plan...");
    const plan = await client.query(`
      EXPLAIN ANALYZE
      SELECT id, topic, embedding <=> '[0.15, 0.94, 0.22]' as dist
      FROM knowledge_base
      ORDER BY embedding <=> '[0.15, 0.94, 0.22]'
      LIMIT 2;
    `);

    console.log("\nPostgreSQL Query Execution Plan:");
    plan.rows.forEach((r) => console.log("  " + r["QUERY PLAN"]));
  } finally {
    client.release();
  }
}

module.exports = { setupAndExplainIndexes };
