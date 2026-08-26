const db = require("../db/db");

// TRANSACTIONS: ACID Properties:
// Transaction = Multiple SQL operations treated as a single unit
// ACID: Atomicity, Consistency, Isolation, Durability


// Simple Transaction: Transfer money between accounts
async function transferMoney(fromUserId, toUserId, amount) {
  const client = await db.connect();

  try {
    // BEGIN transaction
    await client.query("BEGIN");

    // Step 1: Deduct from sender's account
    const deductQuery = `
      UPDATE user_accounts 
      SET balance = balance - $1 
      WHERE user_id = $2
      RETURNING *
    `;
    const deductResult = await client.query(deductQuery, [amount, fromUserId]);

    // Validation: Check if balance went negative
    if (deductResult.rows[0].balance < 0) {
      throw new Error("Insufficient funds");
    }

    // Step 2: Add to receiver's account
    const addQuery = `
      UPDATE user_accounts 
      SET balance = balance + $1 
      WHERE user_id = $2
      RETURNING *
    `;
    const addResult = await client.query(addQuery, [amount, toUserId]);

    // Step 3: Log the transaction
    const logQuery = `
      INSERT INTO transaction_logs (from_user_id, to_user_id, amount, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const logResult = await client.query(logQuery, [fromUserId, toUserId, amount, "SUCCESS"]);

    // COMMIT transaction - all or nothing
    await client.query("COMMIT");

    return {
      success: true,
      from_balance: deductResult.rows[0].balance,
      to_balance: addResult.rows[0].balance,
      transaction: logResult.rows[0]
    };
  } catch (error) {
    // ROLLBACK on error - undo all changes
    await client.query("ROLLBACK");
    
    // Log failed transaction
    const failedLogQuery = `
      INSERT INTO transaction_logs (from_user_id, to_user_id, amount, status, error)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    await client.query(failedLogQuery, [fromUserId, toUserId, amount, "FAILED", error.message]);

    console.error("Transaction failed, rolled back:", error.message);
    throw error;
  } finally {
    client.release();
  }
}


// Savepoints: Nested transactions for complex operations
async function complexDataOperation() {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Main operation
    await client.query(`
      INSERT INTO users (username, email) VALUES ($1, $2)
    `, ["alice", "alice@example.com"]);

    // Create savepoint A
    await client.query("SAVEPOINT sp_before_posts");

    try {
      // Attempt to create posts
      await client.query(`
        INSERT INTO posts (title, content, user_id) 
        VALUES ($1, $2, $3)
      `, ["Post 1", "Content 1", 1]);

      // If this fails, we'll rollback to savepoint
      // Validate post count
      const countResult = await client.query(`
        SELECT COUNT(*) FROM posts WHERE user_id = 1
      `);

      if (countResult.rows[0].count > 5) {
        throw new Error("Post limit exceeded");
      }
    } catch (error) {
      // Rollback only to this savepoint, not entire transaction
      await client.query("ROLLBACK TO SAVEPOINT sp_before_posts");
      console.log("Rolled back to savepoint, user still created");
    }

    await client.query("COMMIT");
    return { success: true, message: "Complex operation completed" };

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Complex operation failed:", error.message);
    throw error;
  } finally {
    client.release();
  }
}


// Isolation Levels: Control how concurrent transactions interact
async function demonstrateIsolationLevels() {
  const client = await db.connect();

  try {
    // Transaction 1: READ UNCOMMITTED (Dirty Reads possible)
    await client.query("BEGIN ISOLATION LEVEL READ UNCOMMITTED");
    const result1 = await client.query(`
      SELECT * FROM user_accounts WHERE user_id = 1
    `);
    // This might read uncommitted data from other transactions
    await client.query("COMMIT");

    // Transaction 2: READ COMMITTED (No Dirty Reads)
    await client.query("BEGIN ISOLATION LEVEL READ COMMITTED");
    const result2 = await client.query(`
      SELECT * FROM user_accounts WHERE user_id = 1
    `);
    // Only reads committed data
    await client.query("COMMIT");

    // Transaction 3: REPEATABLE READ (No Dirty, Non-repeatable Reads)
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
    const result3_1 = await client.query(`
      SELECT * FROM user_accounts WHERE user_id = 1
    `);
    // If we read the same row again, we get the same data
    const result3_2 = await client.query(`
      SELECT * FROM user_accounts WHERE user_id = 1
    `);
    // result3_1 === result3_2
    await client.query("COMMIT");

    // Transaction 4: SERIALIZABLE (Highest isolation level)
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    const result4 = await client.query(`
      SELECT * FROM user_accounts WHERE user_id = 1
    `);
    // Complete isolation from other transactions
    await client.query("COMMIT");

    return {
      isolation_levels: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"]
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Isolation level test failed:", error.message);
    throw error;
  } finally {
    client.release();
  }
}


// Batch Update with Transaction
async function batchUpdateUserAccounts(updates) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    let results = [];

    for (const update of updates) {
      const result = await client.query(`
        UPDATE user_accounts 
        SET balance = balance + $1
        WHERE user_id = $2
        RETURNING *
      `, [update.amount, update.userId]);

      results.push(result.rows[0]);
    }

    await client.query("COMMIT");

    return {
      success: true,
      updates_count: results.length,
      updated_records: results
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Batch update failed:", error.message);
    throw error;
  } finally {
    client.release();
  }
}


// Create necessary tables for transaction examples
async function createTransactionTables() {
  const queries = [
    `
    CREATE TABLE IF NOT EXISTS user_accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      balance DECIMAL(12, 2) DEFAULT 0,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS transaction_logs (
      id SERIAL PRIMARY KEY,
      from_user_id INTEGER,
      to_user_id INTEGER,
      amount DECIMAL(12, 2),
      status VARCHAR(20),
      error TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
    `
  ];

  try {
    for (const query of queries) {
      await db.query(query);
    }
    console.log("Transaction tables created successfully!");
  } catch (error) {
    console.error("Error creating transaction tables:", error);
  }
}

module.exports = {
  transferMoney,
  complexDataOperation,
  demonstrateIsolationLevels,
  batchUpdateUserAccounts,
  createTransactionTables
};
