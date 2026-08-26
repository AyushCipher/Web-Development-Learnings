const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
require("dotenv").config();

const schema = require("./schema");

// A Pool (not a single Client) so concurrent requests share a small set of
// reused connections instead of opening one per query - same reasoning as
// "1. postgress-concepts"/src/db/db.js, just wrapped by Drizzle here so
// services can use the query builder instead of writing raw SQL strings.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Passing `schema` (all tables + all relations()) is what enables the
// relational query API used throughout src/services/*.js:
// db.query.books.findMany({ with: { author: true, genres: true } })
// Without it, only the lower-level query builder (db.select()...from()...)
// would be available.
const db = drizzle(pool, { schema });

module.exports = { db, pool };
