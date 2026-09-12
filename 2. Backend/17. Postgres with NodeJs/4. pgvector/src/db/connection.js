const { Pool } = require("pg");
const pgvector = require("pgvector/pg");
require("dotenv").config();

// Q. HOW DOES NODE-PG INTEGRATE WITH PGVECTOR?
// ANS: The standard 'pg' driver reads vector types as raw strings (e.g. "[0.1,0.2,0.3]").
// By registering the pgvector plugin (`pgvector.registerType(client)`), 'pg' automatically
// serializes JavaScript arrays into PostgreSQL vector format and parses database vector columns
// back into native JavaScript float arrays.

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/pgvector_learning_db",
});

pool.on("connect", async (client) => {
  try {
    await pgvector.registerType(client);
  } catch (err) {
    // If extension is not yet created in the DB, it will register once created.
  }
});

module.exports = { pool };
