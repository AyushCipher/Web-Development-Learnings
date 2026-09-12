const { pool } = require("../db/client");
const pgvector = require("pgvector/pg");

/**
 * ============================================================================
 *   TOPIC 2: THE 4 MAJOR AI APPLICATION TYPES & VECTOR DISTANCE OPERATORS
 * ============================================================================
 * 
 * THE 4 KEY AI APPLICATION TYPES POWERED BY POSTGRES:
 * 
 * 1. Semantic Search:
 *    - Search by conceptual meaning (e.g. searching "fast web framework" finds "Hono" or "Express"
 *      even if the word "framework" is never mentioned in the text).
 * 
 * 2. Retrieval-Augmented Generation (RAG):
 *    - Feeding private/real-time database facts to an LLM to prevent hallucinations.
 * 
 * 3. AI Agents (Long-term Memory & Tool Selection):
 *    - Autonomous agents storing past conversations, user preferences, and available tool definitions
 *      in Postgres vectors to retrieve relevant memories dynamically.
 * 
 * 4. Text-to-SQL:
 *    - Translating natural language ("show top 5 selling products last month") into valid SQL by
 *      storing database schemas and table definitions as vectors and retrieving the right tables for LLMs.
 */

async function runDistanceDemonstrations() {
  const client = await pool.connect();
  try {
    console.log("\n========================================================");
    console.log(" 2. VECTOR DISTANCE OPERATORS IN ACTION                ");
    console.log("========================================================");

    // Search query: "How to design a scalable Express and Postgres backend"
    // Concept representation: Highly oriented towards Dim 2 (Backend) -> [0.18, 0.90, 0.20]
    const queryVector = [0.18, 0.90, 0.20];
    const querySql = pgvector.toSql(queryVector);

    console.log(`Query Vector: [${queryVector.join(", ")}] (Searching for backend & database engineering)`);

    // 1. COSINE DISTANCE (<=>): Angle comparison, standard for text
    // Cosine Similarity = 1 - Cosine Distance
    console.log("\n--- A. COSINE DISTANCE (<=>) ---");
    const cosineResult = await client.query(
      `
      SELECT 
        id, 
        topic, 
        category,
        embedding <=> $1 AS cosine_distance,
        (1 - (embedding <=> $1)) AS cosine_similarity
      FROM knowledge_base
      ORDER BY embedding <=> $1 ASC
      LIMIT 3;
      `,
      [querySql]
    );

    console.table(
      cosineResult.rows.map((r) => ({
        ID: r.id,
        Topic: r.topic,
        Category: r.category,
        "Cosine Dist (<=>)": Number(r.cosine_distance).toFixed(4),
        "Similarity (%)": (Number(r.cosine_similarity) * 100).toFixed(1) + "%",
      }))
    );

    // 2. L2 / EUCLIDEAN DISTANCE (<->): Straight line distance
    console.log("\n--- B. L2 / EUCLIDEAN DISTANCE (<->) ---");
    const l2Result = await client.query(
      `
      SELECT 
        id, 
        topic, 
        embedding <-> $1 AS l2_distance
      FROM knowledge_base
      ORDER BY embedding <-> $1 ASC
      LIMIT 3;
      `,
      [querySql]
    );

    console.table(
      l2Result.rows.map((r) => ({
        ID: r.id,
        Topic: r.topic,
        "L2 Distance (<->)": Number(r.l2_distance).toFixed(4),
      }))
    );

    // 3. INNER PRODUCT (<#>): Dot product
    console.log("\n--- C. INNER PRODUCT (<#>) ---");
    const ipResult = await client.query(
      `
      SELECT 
        id, 
        topic, 
        (embedding <#> $1) * -1 AS dot_product
      FROM knowledge_base
      ORDER BY embedding <#> $1 ASC
      LIMIT 3;
      `,
      [querySql]
    );

    console.table(
      ipResult.rows.map((r) => ({
        ID: r.id,
        Topic: r.topic,
        "Dot Product": Number(r.dot_product).toFixed(4),
      }))
    );
  } finally {
    client.release();
  }
}

module.exports = { runDistanceDemonstrations };
