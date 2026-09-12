const { pool } = require("../db/connection");
const pgvector = require("pgvector/pg");

// Q. WHAT IS THE PGVECTOR EXTENSION?
// ANS: pgvector is an open-source extension for PostgreSQL that adds native support for
// vector storage, multi-dimensional geometric distance operators (Cosine, L2 Euclidean, Inner Product),
// and fast Approximate Nearest Neighbor (ANN) index types (HNSW and IVFFlat).
// It transforms standard PostgreSQL into a high-performance Vector Database.

// Q. WHY STORE VECTORS IN POSTGRES INSTEAD OF A STANDALONE VECTOR DB (Pinecone, Qdrant, Chroma)?
// ANS:
// 1. Single Source of Truth: Store relational data (users, jobs, orders, permissions) alongside their vector embeddings in the same table.
// 2. ACID Transactions: Vector updates are atomic with your relational updates. No out-of-sync vector state.
// 3. Hybrid Filtering in ONE query: Filter by tenant_id, price > 50, category = 'electronics' AND semantic similarity without syncing two databases.
// 4. Operational Simplicity: No extra distributed database infrastructure to maintain, backup, secure, or pay for.

async function setupPgvectorExtension() {
  const client = await pool.connect();
  try {
    // 1. Enable the vector extension in the database
    console.log("--> Enabling pgvector extension...");
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
    await pgvector.registerType(client);

    // 2. Create a sample table with vector columns
    // We use vector(3) here for easy mathematical visualization in logs.
    // In production: OpenAI embeddings = vector(1536), Gemini = vector(768), Cohere = vector(1024).
    console.log("--> Creating documents table with VECTOR(3) column...");
    await client.query(`
      DROP TABLE IF EXISTS documents CASCADE;
      CREATE TABLE documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        embedding vector(3),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Inserting rows with vector embeddings
    console.log("--> Inserting documents with vector embeddings...");
    const sampleDocs = [
      {
        title: "Frontend Engineering",
        content: "React, Next.js, Tailwind CSS and modern UI components",
        category: "tech",
        embedding: [0.9, 0.1, 0.1], // Heavily oriented towards Dim 1 (Frontend)
      },
      {
        title: "Backend Engineering",
        content: "Node.js, Express, Microservices, PostgreSQL, Kafka and Redis",
        category: "tech",
        embedding: [0.1, 0.9, 0.2], // Heavily oriented towards Dim 2 (Backend)
      },
      {
        title: "DevOps & Cloud",
        content: "Docker, Kubernetes, CI/CD pipelines, Prometheus and Grafana",
        category: "devops",
        embedding: [0.2, 0.8, 0.9], // Oriented towards Dim 2 & 3 (Infra/DevOps)
      },
      {
        title: "Italian Cooking",
        content: "Authentic Neapolitan pizza and homemade pasta recipes",
        category: "lifestyle",
        embedding: [0.05, 0.05, 0.05], // Completely unrelated in tech dimensions
      },
    ];

    for (const doc of sampleDocs) {
      await client.query(
        `INSERT INTO documents (title, content, category, embedding)
         VALUES ($1, $2, $3, $4)`,
        [doc.title, doc.content, doc.category, pgvector.toSql(doc.embedding)]
      );
    }

    console.log("✓ Documents and embeddings inserted successfully.");
  } finally {
    client.release();
  }
}

module.exports = { setupPgvectorExtension };
