const redis = require("redis");

// REDIS PUB/SUB + TRANSACTIONS + PIPELINING
// Intermediate Level Examples for Interview Preparation


// Q. WHAT IS REDIS PUB/SUB?
// ANS: Pub/Sub (Publish/Subscribe) is a messaging pattern where publishers send messages to channels and subscribers listening to those channels receive the messages in real time.

// Q. HOW TO USE REDIS PUB/SUB IN NODE.JS?
// ANS: Redis Pub/Sub allows applications to send messages to channels and have other applications subscribe to those channels to receive the messages in real-time.

// Q. WHAT ARE THE USE CASES OF REDIS PUB/SUB?
// ANS: Redis Pub/Sub is used for real-time communication between applications, such as:
// * Real-time notifications
// * Live updates in web applications
// * Chat systems
// * Event-driven architectures

// Q. WHAT IS PIPELINING IN REDIS?
// ANS: Pipelining batches multiple Redis commands together in a single network request to reduce network overhead and improve performance.

// Q. WHAT ARE REDIS TRANSACTIONS?
// ANS: Redis transactions allow multiple commands to be executed as a single unit, ensuring atomicity using the MULTI and EXEC commands.
// If any command in the transaction fails, all commands are rolled back.

// Q. DIFFERENCE BETWEEN PUB/SUB AND TRANSACTIONS IN REDIS?
// ANS: Pub/Sub is a messaging pattern for real time communication, while transactions are a way to execute multiple commands atomically. 
// Pub/Sub is used for sending messages between applications, whereas transactions are used to ensure data integrity when performing multiple related operations on Redis data.

// Q. WHAT IS WATCH IN REDIS?
// ANS: WATCH is a Redis command used for optimistic locking in transactions. It allows you to monitor one or more keys for changes. It is used for concurrency control.
// If any of the watched keys are modified by another client before the transaction is executed, the transaction will be aborted.



const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

client.on("error", (error) =>
  console.log("Redis client error occurred!", error)
);



// 1. BASIC PUB/SUB EXAMPLE
async function basicPubSub() {
  console.log("\n 1. BASIC PUB/SUB EXAMPLE");
  console.log("\n");

  try {
    // Create subscriber client (separate connection)
    const subscriber = client.duplicate();
    await subscriber.connect();

    // Subscribe to channel
    console.log("✓ Subscriber listening on 'notifications' channel...\n");
    
    await subscriber.subscribe("notifications", (message, channel) => {
      console.log(`📨 Received: "${message}" on channel "${channel}"`);
    });

    // Publish messages
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for subscription
    
    console.log("Publishing messages...\n");
    await client.publish("notifications", "Welcome to Redis!");
    await client.publish("notifications", "This is message 2");
    await client.publish("notifications", "This is message 3");

    // Wait and cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    await subscriber.unsubscribe("notifications");
    await subscriber.quit();

    console.log("\n Basic PubSub completed \n");
  } catch (e) {
    console.error("Error in basicPubSub:", e);
  }
}




// 2. PATTERN-BASED SUBSCRIPTIONS
async function patternSubscriptions() {
  console.log("\n 2. PATTERN-BASED SUBSCRIPTIONS");

  try {
    const subscriber = client.duplicate();
    await subscriber.connect();

    // Subscribe to pattern (wildcards)
    console.log("Subscriber listening on 'user:*' pattern...\n");
    
    await subscriber.pSubscribe("user:*", (message, channel, pattern) => {
      console.log(`Pattern "${pattern}" matched channel "${channel}": "${message}"`);
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    console.log("Publishing to different user channels...\n");
    await client.publish("user:1", "User 1 logged in");
    await client.publish("user:2", "User 2 updated profile");
    await client.publish("user:admin", "Admin performed action");
    await client.publish("product:1", "This won't match pattern");

    await new Promise(resolve => setTimeout(resolve, 1000));
    await subscriber.pUnsubscribe("user:*");
    await subscriber.quit();

    console.log("\n Pattern subscriptions completed\n");
  } catch (e) {
    console.error("Error in patternSubscriptions:", e);
  }
}




// 3. MULTIPLE CHANNELS SUBSCRIPTION
async function multipleChannelSubscription() {
  console.log("\n 3. MULTIPLE CHANNELS SUBSCRIPTION");
  console.log("\n");

  try {
    const subscriber = client.duplicate();
    await subscriber.connect();

    // Subscribe to multiple channels
    console.log(" Subscribing to multiple channels...\n");
    
    await subscriber.subscribe(
      ["orders", "payments", "notifications"],
      (message, channel) => {
        const emoji = 
          channel === "orders" ? "🛍️" :
          channel === "payments" ? "💳" :
          channel === "notifications" ? "🔔" : "📬";
        
        console.log(`${emoji} [${channel}]: ${message}`);
      }
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    console.log("Publishing to multiple channels...\n");
    await client.publish("orders", "Order #123 received");
    await client.publish("payments", "Payment processed");
    await client.publish("notifications", "System maintenance scheduled");
    await client.publish("orders", "Order #124 shipped");

    await new Promise(resolve => setTimeout(resolve, 1000));
    await subscriber.quit();

    console.log("\n Multiple channel subscription completed\n");
  } catch (e) {
    console.error("Error in multipleChannelSubscription:", e);
  }
}




// 4. TRANSACTIONS (MULTI/EXEC)
async function transactionsExample() {
  console.log("\n 4. TRANSACTIONS (MULTI/EXEC)");
  console.log("\n");

  try {
    // Example 1: Simple Transaction
    console.log("Example 1: Simple Transaction");
    console.log("-----------------------------");
    
    const transaction1 = client.multi();
    transaction1.set("account:1", "1000");
    transaction1.set("account:2", "500");
    transaction1.get("account:1");
    transaction1.get("account:2");
    
    const results1 = await transaction1.exec();
    console.log("Transaction results:", results1);

    // Example 2: Money Transfer Transaction
    console.log("\nExample 2: Money Transfer (Atomic Operation)");
    console.log("---------------------------------------------");
    
    // Set initial balances
    await client.set("balance:user_a", "1000");
    await client.set("balance:user_b", "500");
    
    console.log("Initial: User A = 1000, User B = 500");
    
    // Transfer 200 from A to B atomically
    const transfer = client.multi();
    transfer.decrBy("balance:user_a", 200);  // Deduct from A
    transfer.incrBy("balance:user_b", 200);  // Add to B
    
    const transferResults = await transfer.exec();
    
    const balanceA = await client.get("balance:user_a");
    const balanceB = await client.get("balance:user_b");
    console.log("After transfer: User A =", balanceA, ", User B =", balanceB);

    // Example 3: Shopping Cart Transaction
    console.log("\nExample 3: Shopping Cart Update");
    console.log("--------------------------------");
    
    const cartTransaction = client.multi();
    cartTransaction.hSet("cart:user123", "item1", "MacBook");
    cartTransaction.hSet("cart:user123", "item2", "iPhone");
    cartTransaction.hIncrBy("cart:user123", "total_items", 2);
    cartTransaction.hIncrByFloat("cart:user123", "total_price", 2999.99);
    
    const cartResults = await cartTransaction.exec();
    console.log("Cart updated successfully");
    
    const cartData = await client.hGetAll("cart:user123");
    console.log("Cart contents:", cartData);

    // Cleanup
    await client.del("account:1", "account:2", "balance:user_a", "balance:user_b", "cart:user123");

    console.log("\n✓ Transactions completed\n");
  } catch (e) {
    console.error("Error in transactionsExample:", e);
  }
}




// 5. PIPELINING - PERFORMANCE OPTIMIZATION
async function pipeliningExample() {
  console.log("\n 5. PIPELINING - PERFORMANCE OPTIMIZATION");
  console.log("\n");

  try {
    // Example 1: Without Pipelining (Sequential)
    console.log("Example 1: Sequential Operations (Slow)");
    console.log("---------------------------------------");
    
    console.time("Sequential Operations");
    
    for (let i = 0; i < 100; i++) {
      await client.set(`sequential:user${i}`, `value${i}`);
    }
    
    console.timeEnd("Sequential Operations");

    // Example 2: With Pipelining (Batch)
    console.log("\nExample 2: Pipelined Operations (Fast)");
    console.log("--------------------------------------");
    
    console.time("Pipelined Operations");
    
    const pipeline = client.multi();
    for (let i = 0; i < 100; i++) {
      pipeline.set(`pipeline:user${i}`, `value${i}`);
    }
    
    await pipeline.exec();
    
    console.timeEnd("Pipelined Operations");

    // Example 3: Mixed Pipelining Operations
    console.log("\n Example 3: Mixed Pipelining (SET + GET + INCR)");
    console.log("----------------------------------------------");
    
    const mixedPipeline = client.multi();
    
    // Set multiple keys
    mixedPipeline.set("key1", "value1");
    mixedPipeline.set("key2", "value2");
    mixedPipeline.set("counter", "0");
    
    // Get values
    mixedPipeline.get("key1");
    mixedPipeline.get("key2");
    
    // Increment counter multiple times
    for (let i = 0; i < 5; i++) {
      mixedPipeline.incr("counter");
    }
    
    const mixedResults = await mixedPipeline.exec();
    console.log("Mixed pipeline results:", mixedResults);

    // Example 4: Real-world - Batch User Registration
    console.log("\nExample 4: Batch User Registration");
    console.log("-----------------------------------");
    
    const userRegistrationPipeline = client.multi();
    
    const users = [
      { id: 101, name: "Alice", email: "alice@example.com" },
      { id: 102, name: "Bob", email: "bob@example.com" },
      { id: 103, name: "Charlie", email: "charlie@example.com" }
    ];
    
    console.log("Registering", users.length, "users...");
    
    for (const user of users) {
      userRegistrationPipeline.hSet(`user:${user.id}`, {
        name: user.name,
        email: user.email,
        registeredAt: new Date().toISOString(),
      });
    }
    
    await userRegistrationPipeline.exec();
    console.log("✓ All users registered successfully");

    // Cleanup
    for (let i = 0; i < 100; i++) {
      await client.del(`sequential:user${i}`, `pipeline:user${i}`);
    }
    await client.del("key1", "key2", "counter");
    for (const user of users) {
      await client.del(`user:${user.id}`);
    }

    console.log("\n✓ Pipelining examples completed\n");
  } catch (e) {
    console.error("Error in pipeliningExample:", e);
  }
}




// 6. WATCH - OPTIMISTIC LOCKING
async function watchExample() {
  console.log("\n👀 6. WATCH - OPTIMISTIC LOCKING");
  console.log("\n");

  try {
    // Initialize value
    await client.set("inventory:item1", "100");
    
    console.log("Initial inventory: 100");
    console.log("Attempting to update with WATCH...\n");

    // Watch the key
    await client.watch("inventory:item1");
    
    // Get current value
    const currentStock = await client.get("inventory:item1");
    console.log("Current stock:", currentStock);

    // Create transaction
    const transaction = client.multi();
    transaction.decrBy("inventory:item1", 10);
    
    const result = await transaction.exec();
    
    if (result) {
      console.log("✓ Transaction successful!");
      const newStock = await client.get("inventory:item1");
      console.log("Updated stock:", newStock);
    } else {
      console.log("❌ Transaction failed (key was modified)");
    }

    // Cleanup
    await client.del("inventory:item1");

    console.log("\n✓ WATCH example completed\n");
  } catch (e) {
    console.error("Error in watchExample:", e);
  }
}





// 7. REAL-WORLD USE CASES
async function realWorldUseCases() {
  console.log("\n🌍 7. REAL-WORLD USE CASES");
  console.log("\n");

  try {
    // Use Case 1: Real-time Notifications System
    console.log("Use Case 1: Real-time Notifications System");
    console.log("------------------------------------------");
    
    // Simulate publisher
    const notificationPublisher = client.duplicate();
    await notificationPublisher.connect();

    // Simulate subscriber
    const notificationSubscriber = client.duplicate();
    await notificationSubscriber.connect();

    let notificationCount = 0;
    
    await notificationSubscriber.subscribe("user:notifications", (message) => {
      notificationCount++;
      console.log(`  📬 Notification ${notificationCount}: ${message}`);
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    // Publish notifications
    await notificationPublisher.publish("user:notifications", "New comment on your post");
    await notificationPublisher.publish("user:notifications", "Someone liked your photo");
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await notificationSubscriber.unsubscribe();

    // Use Case 2: Rate Limiting with Transactions
    console.log("\nUse Case 2: API Rate Limiting");
    console.log("-----------------------------");
    
    const userId = "user:rate_limit:123";
    const rateLimit = 5; // 5 requests allowed
    
    console.log(`Rate limit: ${rateLimit} requests\n`);
    
    for (let i = 1; i <= 7; i++) {
      const requestCount = await client.incr(userId);
      
      if (requestCount === 1) {
        await client.expire(userId, 60); // Reset counter every 60 seconds
      }
      
      if (requestCount <= rateLimit) {
        console.log(`Request ${i}: ✓ Allowed (${requestCount}/${rateLimit})`);
      } else {
        console.log(`Request ${i}: ❌ Rate limited (${requestCount}/${rateLimit})`);
      }
    }

    // Use Case 3: Distributed Counter with Pipelining
    console.log("\nUse Case 3: Distributed Counter");
    console.log("--------------------------------");
    
    const counterPipeline = client.multi();
    
    console.log("Incrementing page views counter 1000 times...");
    for (let i = 0; i < 1000; i++) {
      counterPipeline.incr("page:views:total");
    }
    
    await counterPipeline.exec();
    
    const pageViews = await client.get("page:views:total");
    console.log("✓ Total page views:", pageViews);

    // Cleanup
    await client.del(userId, "page:views:total");
    await notificationPublisher.quit();
    await notificationSubscriber.quit();

    console.log("\n✓ Real-world use cases completed\n");
  } catch (e) {
    console.error("Error in realWorldUseCases:", e);
  }
}





// 8. ERROR HANDLING IN TRANSACTIONS
async function transactionErrorHandling() {
  console.log("\n 8. ERROR HANDLING IN TRANSACTIONS");
  console.log("\n");

  try {
    // Example: Safe transaction with error handling
    console.log("Example: Safe Money Transfer");
    console.log("----------------------------\n");
    
    // Initialize accounts
    await client.set("account:source", "1000");
    await client.set("account:destination", "500");
    
    console.log("Before transfer: Source = 1000, Destination = 500");
    
    try {
      // Check balance before transaction
      const sourceBalance = parseInt(await client.get("account:source"));
      const transferAmount = 200;
      
      if (sourceBalance < transferAmount) {
        throw new Error("Insufficient balance");
      }
      
      // Execute transaction
      const txn = client.multi();
      txn.decrBy("account:source", transferAmount);
      txn.incrBy("account:destination", transferAmount);
      
      const results = await txn.exec();
      
      if (results) {
        console.log("✓ Transfer successful!");
        const newSource = await client.get("account:source");
        const newDestination = await client.get("account:destination");
        console.log("After transfer: Source =", newSource, ", Destination =", newDestination);
      }
    } catch (error) {
      console.log("❌ Transfer failed:", error.message);
    }

    // Cleanup
    await client.del("account:source", "account:destination");

    console.log("\n✓ Error handling example completed\n");
  } catch (e) {
    console.error("Error in transactionErrorHandling:", e);
  }
}



// MAIN EXECUTION
async function runAllExamples() {
  try {
    await client.connect();

    console.log("\n");
    console.log("╔═══════════════════════════════════════════════════════╗");
    console.log("║  REDIS PUB/SUB + TRANSACTIONS + PIPELINING EXAMPLES  ║");
    console.log("║           Interview Preparation Guide                ║");
    console.log("╚═══════════════════════════════════════════════════════╝");

    // Uncomment the examples you want to run:
    
    await basicPubSub();
    await patternSubscriptions();
    await multipleChannelSubscription();
    await transactionsExample();
    await pipeliningExample();
    await watchExample();
    await realWorldUseCases();
    await transactionErrorHandling();

    console.log("\n");
    console.log("╔═══════════════════════════════════════════════════════╗");
    console.log("║          ✓ ALL EXAMPLES COMPLETED SUCCESSFULLY        ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");

  } catch (e) {
    console.error("Fatal error:", e);
  } finally {
    await client.quit();
  }
}

// Execute
runAllExamples();
