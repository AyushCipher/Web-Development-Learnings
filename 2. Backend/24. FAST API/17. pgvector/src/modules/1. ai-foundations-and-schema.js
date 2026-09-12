const { pool } = require("../db/client");
const pgvector = require("pgvector/pg");

/**
 * ============================================================================
 *   TOPIC 1: FOUNDATIONS OF AI WITH POSTGRES & VECTOR DATABASE CONCEPTS
 * ============================================================================
 * 
 * 1. THE FOUNDATIONS OF AI WITH POSTGRES:
 *    - In the past, building AI systems required training custom models from scratch,
 *      managing complex ML infrastructure, and hiring specialized ML research teams.
 *    - Today, developers can build production-grade AI applications using PostgreSQL
 *      and off-the-shelf Foundation Models (OpenAI, Gemini, Claude, Ollama, Cohere).
 * 
 * 2. THE RISE OF THE "AI ENGINEER":
 *    - An "AI Engineer" is an application/backend developer who leverages pre-trained AI
 *      APIs and embeddings to solve real-world problems (Search, RAG, Agents, Recommendations)
 *      without having to build or train new models from scratch.
 * 
 * 3. WHAT IS VECTOR DATA?
 *    - Unstructured data (text, PDF documents, images, audio) cannot be searched with
 *      standard SQL `WHERE column = '...'` or simple regex.
 *    - An embedding model compresses the *semantic meaning* of that data into a fixed-length
 *      list of numbers (a vector) in multi-dimensional space (e.g. 768 or 1536 dimensions).
 *    - Similar concepts are mathematically placed closer together in that space.
 */

async function initSchemaAndData() {
  const client = await pool.connect();
  try {
    console.log("\n========================================================");
    console.log(" 1. ENABLING PGVECTOR EXTENSION & INITIALIZING SCHEMA   ");
    console.log("========================================================");

    // 1. Enable pgvector in PostgreSQL
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
    await pgvector.registerType(client);
    console.log("✓ pgvector extension is active in PostgreSQL.");

    // 2. Create Knowledge Base table with vector column
    // For this educational demo, we use vector(3) for easy console visual output.
    // In production: OpenAI text-embedding-3-small = vector(1536), Gemini = vector(768).
    await client.query(`
      DROP TABLE IF EXISTS knowledge_base CASCADE;
      CREATE TABLE knowledge_base (
        id SERIAL PRIMARY KEY,
        topic VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        author VARCHAR(50) DEFAULT 'System',
        embedding vector(3) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ Created 'knowledge_base' table with 'vector(3)' column.");

    // 3. Seed Knowledge Base with semantic vector embeddings
    // Vector dimensions representation:
    // [Dimension 1: Frontend/UI, Dimension 2: Backend/Database, Dimension 3: Cloud/DevOps]
    const knowledgeItems = [
      {
        topic: "React & Next.js UI Engineering",
        content: "Building responsive web user interfaces with React 19, Server Components, and Tailwind CSS.",
        category: "frontend",
        author: "Sarah",
        embedding: [0.92, 0.12, 0.08], // Heavy Dim 1 (Frontend)
      },
      {
        topic: "PostgreSQL & Microservices Architecture",
        content: "Designing distributed backend systems, API gateways, database transactions, and message queues.",
        category: "backend",
        author: "Ayush",
        embedding: [0.15, 0.94, 0.22], // Heavy Dim 2 (Backend)
      },
      {
        topic: "Kubernetes & Observability",
        content: "Deploying microservices with Docker, Prometheus scraping, Grafana dashboards, and CI/CD pipelines.",
        category: "devops",
        author: "DevOps Team",
        embedding: [0.10, 0.70, 0.95], // Heavy Dim 3 (DevOps/Cloud)
      },
      {
        topic: "Italian Culinary Art",
        content: "Traditional sourdough Neapolitan pizza and fresh pasta crafting techniques.",
        category: "lifestyle",
        author: "Chef Luigi",
        embedding: [0.02, 0.04, 0.01], // Completely unrelated to tech
      },
    ];

    for (const item of knowledgeItems) {
      await client.query(
        `INSERT INTO knowledge_base (topic, content, category, author, embedding)
         VALUES ($1, $2, $3, $4, $5)`,
        [item.topic, item.content, item.category, item.author, pgvector.toSql(item.embedding)]
      );
    }

    console.log(`✓ Seeded ${knowledgeItems.length} knowledge base records with vector embeddings.`);
  } finally {
    client.release();
  }
}

module.exports = { initSchemaAndData };
