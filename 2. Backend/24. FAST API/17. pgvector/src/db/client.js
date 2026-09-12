const { Pool } = require("pg");
const pgvector = require("pgvector/pg");
require("dotenv").config();

/**
 * PostgreSQL Connection Pool with pgvector support
 * 
 * Q. WHY DO WE REGISTER THE PGVECTOR PLUGIN?
 * ANS: The native 'pg' library reads custom vector columns as strings like "[0.12, 0.45, -0.32]".
 * When we register the pgvector type (`pgvector.registerType(client)`), it enables:
 * 1. Automatic serialization of JS Float Arrays -> PostgreSQL vector literals.
 * 2. Automatic parsing of database vector columns -> JS Float Arrays.
 */

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/pgvector_demo_db",
});

pool.on("connect", async (client) => {
  try {
    await pgvector.registerType(client);
  } catch (err) {
    // If extension is not created yet, will register after CREATE EXTENSION
  }
});

module.exports = { pool };
