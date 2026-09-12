const { initSchemaAndData } = require("../modules/1. ai-foundations-and-schema");
const { runDistanceDemonstrations } = require("../modules/2. vector-search-and-distances");
const { setupAndExplainIndexes } = require("../modules/3. indexes-hnsw-ivfflat-diskann");
const { explainPgaiAndVectorscale } = require("../modules/4. pgai-and-pgvectorscale");
const { executeRAGPipeline, textToSQLDemo } = require("../modules/5. rag-and-agent-workflow");
const { pool } = require("../db/client");

async function startDemoApp() {
  console.log("╔═════════════════════════════════════════════════════════════════════════╗");
  console.log("║     🚀 POSTGRESQL AI & PGVECTOR COMPREHENSIVE DEMO APPLICATION          ║");
  console.log("╚═════════════════════════════════════════════════════════════════════════╝");

  try {
    // 1. Foundations, Schema & Embeddings
    await initSchemaAndData();

    // 2. Vector Distance Metrics (<=>, <->, <#>)
    await runDistanceDemonstrations();

    // 3. Indexing: IVFFlat vs HNSW vs StreamingDiskANN
    await setupAndExplainIndexes();

    // 4. Extensions Trifecta: pgvector, pgvectorscale, pgai
    await explainPgaiAndVectorscale();

    // 5. RAG Pipeline & Text-to-SQL Workflow
    await executeRAGPipeline("How do I build a production microservices backend with PostgreSQL?");
    await textToSQLDemo("Show me all backend articles written recently");

    console.log("\n=========================================================================");
    console.log(" 🎉 DEMO COMPLETED: You now have a working mental model of pgvector!");
    console.log("=========================================================================\n");
  } catch (err) {
    console.error("\n❌ Database Execution Note:", err.message);
    console.log("\n💡 Quick Tip: To run against a live local instance with pgvector:");
    console.log("   docker run --name pgvector-app -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pgvector_demo_db -p 5432:5432 -d pgvector/pgvector:pg16\n");
  } finally {
    await pool.end();
  }
}

module.exports = { startDemoApp };
