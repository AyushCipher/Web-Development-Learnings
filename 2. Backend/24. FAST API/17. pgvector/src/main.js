/**
 * ============================================================================
 *               17. PGVECTOR & POSTGRESQL FOR AI APPLICATIONS
 * ============================================================================
 * 
 * 1. Foundations of AI with Postgres:
 *    - Build cutting-edge AI apps directly on PostgreSQL without specialized teams.
 *    - The rise of the "AI Engineer" integrating foundational models & vector search.
 * 
 * 2. Vector Database Concepts:
 *    - Unstructured data compressed into mathematical vectors.
 *    - Connecting LLMs with proprietary data through RAG.
 * 
 * 3. 4 Major Types of Applications:
 *    - Semantic Search, RAG, AI Agents (Memory & Tools), Text-to-SQL.
 * 
 * 4. The 3 Postgres AI Extensions:
 *    - pgvector (Core vector storage, distances, HNSW/IVFFlat).
 *    - pgvectorscale (StreamingDiskANN, Statistical Binary Quantization, 1B+ scale).
 *    - pgai (In-database LLM queries, automatic embedding triggers).
 * 
 * 5. Vector Search Indexes:
 *    - IVFFlat vs HNSW vs StreamingDiskANN.
 * ============================================================================
 */

const { startDemoApp } = require("./demo/app");

if (require.main === module) {
  startDemoApp();
}

module.exports = { startDemoApp };
