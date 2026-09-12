const { pool } = require("../db/connection");
const pgvector = require("pgvector/pg");

// Q. WHAT IS RETRIEVAL-AUGMENTED GENERATION (RAG) WITH PGVECTOR?
// ANS: RAG is a pattern where an LLM is given external proprietary data to answer questions accurately.
// 1. Ingestion: Split documents into chunks -> Generate vector embeddings with an AI model -> Store in PostgreSQL using pgvector.
// 2. Retrieval: When a user asks a question, convert the question into a vector -> Query pgvector for Top-K most similar chunks (using <=>).
// 3. Generation: Inject the retrieved chunks into the LLM system prompt as verified context -> LLM generates grounded answer without hallucinations.

// Simple embedding helper function (simulating an embedding model API call)
function generateMockEmbedding(query) {
  const q = query.toLowerCase();
  if (q.includes("react") || q.includes("frontend") || q.includes("ui") || q.includes("next")) {
    return [0.88, 0.12, 0.10];
  }
  if (q.includes("backend") || q.includes("node") || q.includes("database") || q.includes("api")) {
    return [0.12, 0.88, 0.20];
  }
  if (q.includes("docker") || q.includes("devops") || q.includes("deploy") || q.includes("kubernetes")) {
    return [0.18, 0.75, 0.85];
  }
  return [0.33, 0.33, 0.33];
}

async function semanticSearchWithRAG(userQuery, filterCategory = null) {
  const client = await pool.connect();
  try {
    console.log("\n========================================================");
    console.log(" CONCEPT 4: SEMANTIC SEARCH & RAG RETRIEVAL PIPELINE    ");
    console.log("========================================================");
    console.log(`User Question: "${userQuery}"`);

    // 1. Generate query embedding
    const queryVector = generateMockEmbedding(userQuery);
    const querySql = pgvector.toSql(queryVector);

    // 2. Retrieve Top-2 relevant chunks with optional relational filtering
    let sqlQuery = `
      SELECT 
        id, 
        title, 
        content, 
        category,
        1 - (embedding <=> $1) AS similarity_score
      FROM documents
    `;
    const params = [querySql];

    if (filterCategory) {
      sqlQuery += ` WHERE category = $2`;
      params.push(filterCategory);
    }

    sqlQuery += `
      ORDER BY embedding <=> $1 ASC
      LIMIT 2;
    `;

    const result = await client.query(sqlQuery, params);

    console.log(`\nRetrieved Top-${result.rows.length} Context Chunks:`);
    result.rows.forEach((row, i) => {
      console.log(`\n[Chunk ${i + 1}] (Similarity: ${(row.similarity_score * 100).toFixed(1)}%)`);
      console.log(` Title: ${row.title} [${row.category}]`);
      console.log(` Content: "${row.content}"`);
    });

    // 3. Construct Augmented LLM Prompt
    const contextText = result.rows.map((r) => `- ${r.title}: ${r.content}`).join("\n");
    const augmentedPrompt = `
SYSTEM PROMPT: Answer the user's question using ONLY the provided context below.

CONTEXT:
${contextText}

USER QUESTION:
${userQuery}

ANSWER:
`;
    console.log("\n--- Final Constructed RAG Prompt sent to LLM ---");
    console.log(augmentedPrompt);

    return result.rows;
  } finally {
    client.release();
  }
}

module.exports = { semanticSearchWithRAG };
