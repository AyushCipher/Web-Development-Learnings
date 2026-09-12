const { pool } = require("../db/client");
const pgvector = require("pgvector/pg");

/**
 * ============================================================================
 *   TOPIC 5: END-TO-END RAG & TEXT-TO-SQL WORKFLOW DEMO
 * ============================================================================
 */

// Helper to simulate embedding generator
function getQueryEmbedding(query) {
  const q = query.toLowerCase();
  if (q.includes("react") || q.includes("frontend") || q.includes("ui") || q.includes("tailwind")) {
    return [0.89, 0.11, 0.09]; // Frontend vector
  }
  if (q.includes("backend") || q.includes("postgres") || q.includes("microservice") || q.includes("database")) {
    return [0.14, 0.91, 0.20]; // Backend vector
  }
  if (q.includes("k8s") || q.includes("kubernetes") || q.includes("docker") || q.includes("grafana") || q.includes("devops")) {
    return [0.12, 0.65, 0.92]; // DevOps vector
  }
  return [0.33, 0.33, 0.33];
}

/**
 * 1. RAG RETRIEVAL PIPELINE
 */
async function executeRAGPipeline(userQuestion, authorFilter = null) {
  const client = await pool.connect();
  try {
    console.log("\n========================================================");
    console.log(" 5. COMPLETE RAG RETRIEVAL & CONTEXT INJECTION PIPELINE ");
    console.log("========================================================");
    console.log(`User Question: "${userQuestion}"`);

    const queryVector = getQueryEmbedding(userQuestion);
    const querySql = pgvector.toSql(queryVector);

    let query = `
      SELECT 
        id, 
        topic, 
        content, 
        category,
        author,
        1 - (embedding <=> $1) AS relevance_score
      FROM knowledge_base
    `;
    const params = [querySql];

    // Filtered search demonstration (relational + vector search)
    if (authorFilter) {
      query += ` WHERE author = $2`;
      params.push(authorFilter);
    }

    query += ` ORDER BY embedding <=> $1 ASC LIMIT 2;`;

    const result = await client.query(query, params);

    console.log(`\nRetrieved ${result.rows.length} Grounded Context Chunks from PostgreSQL:`);
    result.rows.forEach((row, i) => {
      console.log(`\n[Chunk #${i + 1}] (Relevance: ${(row.relevance_score * 100).toFixed(1)}%)`);
      console.log(` Topic:  ${row.topic}`);
      console.log(` Author: ${row.author} [Category: ${row.category}]`);
      console.log(` Text:   "${row.content}"`);
    });

    const contextPayload = result.rows.map((r) => `[Source: ${r.topic}] ${r.content}`).join("\n\n");

    const completeLLMPrompt = `
----------------------------------------------------------------------
SYSTEM INSTRUCTIONS:
You are an expert AI software architect. Answer the question using
ONLY the grounded facts provided in the context below. Do not guess.

CONTEXT FROM POSTGRESQL DATABASE:
${contextPayload}

USER QUESTION:
${userQuestion}
----------------------------------------------------------------------
`;

    console.log("\nConstructed LLM Prompt (Grounding context prevents AI hallucinations):");
    console.log(completeLLMPrompt);

    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * 2. TEXT-TO-SQL PIPELINE DEMONSTRATION
 */
async function textToSQLDemo(userPrompt) {
  console.log("\n--- TEXT-TO-SQL WITH PGVECTOR METADATA INDEXING ---");
  console.log(`User Natural Language Prompt: "${userPrompt}"`);
  console.log("Step 1: Convert natural language prompt into an embedding.");
  console.log("Step 2: Match embedding against PostgreSQL table definitions & DDL schema vectors.");
  console.log("Step 3: Retrieve matched schema: 'knowledge_base(id, topic, content, category, author, created_at)'");
  console.log("Step 4: LLM generates exact SQL with verified table/column names:");
  console.log(`
    --> Generated SQL:
    SELECT topic, author, created_at 
    FROM knowledge_base 
    WHERE category = 'backend' 
    ORDER BY created_at DESC 
    LIMIT 10;
  `);
}

module.exports = { executeRAGPipeline, textToSQLDemo };
