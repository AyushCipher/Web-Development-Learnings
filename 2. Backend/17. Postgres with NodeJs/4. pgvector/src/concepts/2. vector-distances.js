const { pool } = require("../db/connection");
const pgvector = require("pgvector/pg");

// Q. WHAT ARE VECTOR DISTANCE METRICS IN PGVECTOR?
// ANS: When finding similar items, pgvector calculates the mathematical distance between two vectors.
// Lower distance = Higher semantic similarity!

// 1. Cosine Distance (`<=>`):
//    - Formula: 1 - CosineSimilarity = 1 - (A . B) / (||A|| * ||B||)
//    - Measures the angle between vectors, ignoring magnitude.
//    - Best for: Natural language, text embeddings (OpenAI, Gemini), RAG systems where document length varies.
//    - Range: 0.0 (identical direction) to 2.0 (opposite direction).

// 2. L2 / Euclidean Distance (`<->`):
//    - Formula: sqrt( sum( (A_i - B_i)^2 ) )
//    - Measures the straight-line distance between points in multi-dimensional space.
//    - Best for: Image features, facial recognition, geospatial embeddings where magnitude represents intensity.

// 3. Inner Product / Negative Dot Product (`<#>`):
//    - Formula: - (A . B)
//    - pgvector returns negative dot product because PostgreSQL indexes sort in ascending order (smallest first).
//    - Best for: Recommendation systems, and normalized vectors (where ||A|| = 1, inner product is identical to cosine distance but 2x faster).

async function demonstrateVectorDistances() {
  const client = await pool.connect();
  try {
    console.log("\n========================================================");
    console.log(" CONCEPT 2: VECTOR DISTANCE OPERATORS & SIMILARITY SEARCH ");
    console.log("========================================================");

    // Query vector: Represents a user searching for "Express & Postgres API" -> [0.15, 0.85, 0.25]
    const queryEmbedding = [0.15, 0.85, 0.25];
    const querySql = pgvector.toSql(queryEmbedding);

    // 1. COSINE DISTANCE (<=>)
    console.log("\n--- 1. COSINE DISTANCE (<=>) ---");
    console.log("Query: 'Looking for backend API & database architecture'");
    const cosineRes = await client.query(
      `
      SELECT 
        id, 
        title, 
        category,
        embedding <=> $1 AS cosine_distance,
        (1 - (embedding <=> $1)) AS cosine_similarity
      FROM documents
      ORDER BY embedding <=> $1 ASC
      LIMIT 3;
      `,
      [querySql]
    );

    console.table(
      cosineRes.rows.map((row) => ({
        ID: row.id,
        Title: row.title,
        Category: row.category,
        "Cosine Distance (<=>)": Number(row.cosine_distance).toFixed(4),
        "Cosine Similarity": Number(row.cosine_similarity).toFixed(4),
      }))
    );

    // 2. L2 EUCLIDEAN DISTANCE (<->)
    console.log("\n--- 2. L2 / EUCLIDEAN DISTANCE (<->) ---");
    const l2Res = await client.query(
      `
      SELECT 
        id, 
        title, 
        embedding <-> $1 AS l2_distance
      FROM documents
      ORDER BY embedding <-> $1 ASC
      LIMIT 3;
      `,
      [querySql]
    );

    console.table(
      l2Res.rows.map((row) => ({
        ID: row.id,
        Title: row.title,
        "L2 Distance (<->)": Number(row.l2_distance).toFixed(4),
      }))
    );

    // 3. INNER PRODUCT (<#>)
    console.log("\n--- 3. INNER PRODUCT (<#>) ---");
    const ipRes = await client.query(
      `
      SELECT 
        id, 
        title, 
        (embedding <#> $1) * -1 AS dot_product
      FROM documents
      ORDER BY embedding <#> $1 ASC
      LIMIT 3;
      `,
      [querySql]
    );

    console.table(
      ipRes.rows.map((row) => ({
        ID: row.id,
        Title: row.title,
        "Dot Product": Number(row.dot_product).toFixed(4),
      }))
    );
  } finally {
    client.release();
  }
}

module.exports = { demonstrateVectorDistances };
