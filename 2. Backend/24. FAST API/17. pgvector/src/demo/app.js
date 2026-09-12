const { initSchemaAndData } = require("../modules/1. ai-foundations-and-schema");
const { runDistanceDemonstrations } = require("../modules/2. vector-search-and-distances");
const { setupAndExplainIndexes } = require("../modules/3. indexes-hnsw-ivfflat-diskann");
const { explainPgaiAndVectorscale } = require("../modules/4. pgai-and-pgvectorscale");
const { executeRAGPipeline, textToSQLDemo } = require("../modules/5. rag-and-agent-workflow");

// Advanced Topics Modules
const { evaluateRetrievalPipeline } = require("../advanced/1. evaluation-driven-dev");
const { demonstrateFilteredSearch } = require("../advanced/2. filtered-search-strategies");
const { setupAndTestMultiTenancy } = require("../advanced/3. multi-tenancy-rls");
const { agentToolRouter, registeredTools } = require("../advanced/4. agents-tools-text-to-sql");

const { pool } = require("../db/client");

async function startDemoApp() {
  console.log("╔═════════════════════════════════════════════════════════════════════════╗");
  console.log("║     🚀 POSTGRESQL AI & PGVECTOR COMPREHENSIVE MASTERCLASS APPLICATION   ║");
  console.log("╚═════════════════════════════════════════════════════════════════════════╝");

  try {
    // 1. Foundations & Schemas
    await initSchemaAndData();

    // 2. Vector Distance Operators (<=>, <->, <#>)
    await runDistanceDemonstrations();

    // 3. Indexing: IVFFlat vs HNSW vs StreamingDiskANN
    await setupAndExplainIndexes();

    // 4. PostgreSQL AI Extensions Trifecta (pgvector, pgvectorscale, pgai)
    await explainPgaiAndVectorscale();

    // 5. Basic RAG Pipeline
    await executeRAGPipeline("How do I build a production microservices backend with PostgreSQL?");

    // =========================================================================
    // ADVANCED TOPICS SECTION (FROM ADVANCED AI WITH POSTGRES SLIDE)
    // =========================================================================
    console.log("\n╔═════════════════════════════════════════════════════════════════════════╗");
    console.log("║           🔥 ADVANCED TOPICS FOR BUILDING AI APPS WITH POSTGRES         ║");
    console.log("╚═════════════════════════════════════════════════════════════════════════╝");

    // Advanced 1: Evaluation-Driven Development (EDD)
    const testCases = [
      { query: "How to build UI with React and Tailwind?", expectedDocId: 1 },
      { query: "PostgreSQL transactions and microservices", expectedDocId: 2 },
      { query: "Kubernetes Docker container deployment", expectedDocId: 3 },
    ];
    evaluateRetrievalPipeline(testCases, (q) => {
      if (q.includes("React")) return [{ id: 1 }, { id: 2 }];
      if (q.includes("Postgres")) return [{ id: 2 }, { id: 3 }];
      return [{ id: 3 }, { id: 2 }];
    });

    // Advanced 2: Filtered Search Strategies
    await demonstrateFilteredSearch();

    // Advanced 3: Multi-Tenancy with Row-Level Security (RLS)
    await setupAndTestMultiTenancy();

    // Advanced 4: AI Agents & Tool Calling
    await agentToolRouter("How many backend articles do we have stored in PostgreSQL?");
    await agentToolRouter("Find knowledge docs about React 19 and Tailwind CSS");

    // Advanced 5: Text-to-SQL
    await textToSQLDemo("Show all backend articles written by Ayush");

    console.log("\n=========================================================================");
    console.log(" 🎉 ALL FOUNDATIONAL & ADVANCED PGVECTOR CONCEPTS DEMONSTRATED!");
    console.log("=========================================================================\n");
  } catch (err) {
    console.error("\n❌ Database Execution Note:", err.message);
    console.log("\n💡 Tip: Run PostgreSQL with pgvector via Docker:");
    console.log("   docker run --name pgvector-app -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pgvector_demo_db -p 5432:5432 -d pgvector/pgvector:pg16\n");
  } finally {
    await pool.end();
  }
}

module.exports = { startDemoApp };
