import { Database } from "bun:sqlite";

async function sqliteDemo() {
  const db = new Database("bundb.sqlite");

  //create a table
  db.run(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `);

  console.log("Table users created successfully!");

  const insertUser = db.prepare(
    `INSERT INTO users (name, email) VALUES (?, ?)`
  ); // SQL Injection
  // insertUser.run("Sangam Mukherjee", "sangam@gmail.com");
  // insertUser.run("John Doe", "johndoe@gmail.com");
  // insertUser.run("James Corden", "james12345@gmail.com");

  // const extractAllUsers = db.query("SELECT * FROM users").all();
  // console.log(extractAllUsers);

  // db.run("UPDATE users SET name = ? WHERE email = ?", [
  //   "Raj Mukherjee",
  //   "sangam@gmail.com",
  // ]);

  // const getUpdatedUserInfo = db
  //   .query("SELECT * FROM users WHERE email = ?")
  //   .get("sangam@gmail.com");
  // console.log(getUpdatedUserInfo);

  db.run("DELETE FROM users WHERE email = ?", ["james12345@gmail.com"]);
  const extractRemainingUsers = db.query("SELECT * FROM users").all();

  console.log("extractRemainingUsers", extractRemainingUsers);
}

sqliteDemo();
