const { Pool } = require("pg");
require("dotenv").config();

// create a new pool instance to manage database connections
// -> postgre -> :// -> [user] -> [password] -> @ -> host:port -> [database]

// pool(manage static connections) vs client connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function query(text, params) {
  const start = Date.now();

  try {
    const result = await pool.query(text, params);

    // execute the time ->
    const duration = Date.now() - start;

    console.log(
      `Executed query: , ${{ text, duration, rows: result.rowCount }}`
    );

    return result;
  } catch (e) {
    console.error(e);

    throw e;
  }
}

module.exports = { query };
