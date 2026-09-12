const { pool } = require("../db/client");
const pgvector = require("pgvector/pg");

/**
 * ============================================================================
 *   ADVANCED TOPIC 4: MULTI-TENANCY FOR RAG APPS (ROW-LEVEL SECURITY)
 * ============================================================================
 * 
 * WHY MULTI-TENANCY MATTERS IN AI:
 * - In Enterprise SaaS, Company A's documents, embeddings, and chat history
 *   must be 100% mathematically and legally isolated from Company B.
 * 
 * POSTGRESQL NATIVE SOLUTION: ROW-LEVEL SECURITY (RLS)
 * - Instead of relying on backend developers to remember `WHERE tenant_id = '...'`
 *   on every single query, PostgreSQL enforces isolation at the database engine level.
 */

async function setupAndTestMultiTenancy() {
  const client = await pool.connect();
  try {
    console.log("\n========================================================");
    console.log(" ADVANCED 4: MULTI-TENANCY & ROW-LEVEL SECURITY (RLS)   ");
    console.log("========================================================");

    // 1. Create multi-tenant document table
    await client.query(`
      DROP TABLE IF EXISTS tenant_documents CASCADE;
      CREATE TABLE tenant_documents (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(3) NOT NULL
      );

      -- Enable Row-Level Security
      ALTER TABLE tenant_documents ENABLE ROW LEVEL SECURITY;

      -- Create RLS Policy based on current session tenant context
      DROP POLICY IF EXISTS tenant_isolation_policy ON tenant_documents;
      CREATE POLICY tenant_isolation_policy ON tenant_documents
      USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));
    `);
    console.log("✓ Created multi-tenant table with Row-Level Security (RLS).");

    // 2. Insert data for two separate tenants
    await client.query(`
      INSERT INTO tenant_documents (tenant_id, title, content, embedding) VALUES
      ('tenant_apple', 'Apple Secret Blueprint', 'Next generation M5 chip architecture', '[0.1, 0.9, 0.2]'),
      ('tenant_google', 'Google AI Strategy', 'Gemini multimodal reasoning and TPU clusters', '[0.12, 0.88, 0.22]');
    `);
    console.log("✓ Seeded documents for 'tenant_apple' and 'tenant_google'.");

    // 3. Query as 'tenant_apple'
    console.log("\n--> Setting session context to 'tenant_apple'...");
    await client.query("SET LOCAL app.current_tenant_id = 'tenant_apple';");
    const appleResults = await client.query(
      "SELECT id, tenant_id, title, content FROM tenant_documents;"
    );

    console.log("Results visible to Tenant Apple:");
    console.table(appleResults.rows);

    // 4. Query as 'tenant_google'
    console.log("--> Setting session context to 'tenant_google'...");
    await client.query("SET LOCAL app.current_tenant_id = 'tenant_google';");
    const googleResults = await client.query(
      "SELECT id, tenant_id, title, content FROM tenant_documents;"
    );

    console.log("Results visible to Tenant Google:");
    console.table(googleResults.rows);
  } finally {
    client.release();
  }
}

module.exports = { setupAndTestMultiTenancy };
