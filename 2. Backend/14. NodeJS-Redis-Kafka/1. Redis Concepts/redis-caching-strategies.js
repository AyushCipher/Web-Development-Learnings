const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

client.on("error", (error) =>
  console.log("Redis client error occurred!", error)
);




// CONCEPT 1: BASIC REDIS CACHING
async function basicRedisCache() {
  console.log("\n 1. BASIC REDIS CACHING");
  console.log("\n");

  try {
    // Simulate a slow database query
    async function fetchUserFromDatabase(userId) {
      console.log(` Querying database for user ${userId}...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate 1 second delay
      return { id: userId, name: "John Doe", email: "john@example.com" };
    }

    // Caching wrapper function
    async function getUser(userId) {
      // Step 1: Check Redis cache first
      const cachedUser = await client.get(`user:${userId}`);
      
      if (cachedUser) {
        console.log(` ✓ Cache HIT! Retrieved from Redis`);
        return JSON.parse(cachedUser);
      }

      // Step 2: Cache miss - query database
      console.log(`  ❌ Cache MISS! Querying database...`);
      const user = await fetchUserFromDatabase(userId);

      // Step 3: Store in cache for future requests
      await client.set(`user:${userId}`, JSON.stringify(user));
      console.log(` ✓ Stored in cache`);
      
      return user;
    }

    console.log("First call (database query):");
    console.time("First call");
    const user1 = await getUser(1);
    console.timeEnd("First call");
    console.log("Result:", user1);

    console.log("\nSecond call (cached):");
    console.time("Second call");
    const user2 = await getUser(1);
    console.timeEnd("Second call");
    console.log("Result:", user2);

    await client.del("user:1");
  } catch (e) {
    console.error("Error:", e);
  }
}





// CONCEPT 2: TTL (TIME TO LIVE) - CACHE EXPIRATION
async function ttlConcept() {
  console.log("\n 2. TTL (TIME TO LIVE) - CACHE EXPIRATION");
  console.log("\n");

  try {
    console.log("Example 1: SET with EX (expiration in seconds)");
    console.log("---------------------------------------------");
    
    // Set key with 5 second expiration
    await client.set("otp:user123", "123456", { EX: 5 });
    console.log("✓ OTP stored with 5 second expiration");
    
    let ttl = await client.ttl("otp:user123");
    console.log("TTL remaining:", ttl, "seconds");
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    ttl = await client.ttl("otp:user123");
    console.log("TTL after 2 seconds:", ttl, "seconds");

    // Wait another 4 seconds (total 6 seconds)
    await new Promise(resolve => setTimeout(resolve, 4000));
    const expiredOtp = await client.get("otp:user123");
    console.log("OTP after expiration:", expiredOtp, "(null = expired)");

    console.log("\nExample 2: SET with PX (expiration in milliseconds)");
    console.log("---------------------------------------------------");
    
    await client.set("session:token123", "abc123xyz", { PX: 3000 }); // 3 seconds
    console.log("✓ Session token stored with 3 second expiration");
    
    ttl = await client.pTTL("session:token123"); // pTTL (all-caps TTL), not pTtl - Get TTL in milliseconds
    console.log("TTL remaining:", ttl, "milliseconds");

    console.log("\n Example 3: EXPIRE - Set expiration on existing key");
    console.log("--------------------------------------------------");
    
    await client.set("api:key", "sk_live_123456");
    console.log("✓ API key stored");
    
    // Set expiration to 60 seconds
    await client.expire("api:key", 60);
    ttl = await client.ttl("api:key");
    console.log("TTL set to:", ttl, "seconds");

    console.log("\nExample 4: PEXPIRE - Millisecond expiration");
    console.log("--------------------------------------------");
    
    await client.set("temp:data", "temporary");
    await client.pExpire("temp:data", 2000); // 2 seconds in milliseconds
    console.log("✓ Temp data with 2000ms expiration");

    console.log("\n Example 5: PERSIST - Remove expiration");
    console.log("--------------------------------------");
    
    await client.set("persistent:key", "value", { EX: 60 });
    console.log("✓ Key with 60 second TTL created");
    
    ttl = await client.ttl("persistent:key");
    console.log("TTL before PERSIST:", ttl, "seconds");
    
    await client.persist("persistent:key");
    ttl = await client.ttl("persistent:key");
    console.log("TTL after PERSIST:", ttl, "(−1 = no expiration)");

    console.log("\n Example 6: Real-world - Session management");
    console.log("------------------------------------------");
    
    const sessionId = "sess_user_789";
    const sessionData = { userId: 789, role: "user", lastActivity: new Date() };
    
    // Session expires in 30 minutes (1800 seconds)
    await client.set(`session:${sessionId}`, JSON.stringify(sessionData), { EX: 1800 });
    console.log("✓ Session stored with 30 minute expiration");
    
    ttl = await client.ttl(`session:${sessionId}`);
    console.log("Session TTL:", ttl, "seconds (~30 minutes)");

    // Cleanup
    await client.del("api:key", "temp:data", "persistent:key", `session:${sessionId}`);
  } catch (e) {
    console.error("Error:", e);
  }
}





// CONCEPT 3: REDIS + MONGODB CACHING (Cache-Aside Pattern)
async function mongodbRedisCache() {
  console.log("\n 3. REDIS + MONGODB CACHING (Cache-Aside Pattern)");
  console.log("\n");

  try {
    // Simulate MongoDB database
    const mockDatabase = {
      products: [
        { _id: 1, name: "Laptop", price: 1299, stock: 50 },
        { _id: 2, name: "Mouse", price: 25, stock: 200 },
        { _id: 3, name: "Keyboard", price: 75, stock: 150 },
      ]
    };

    // Simulate slow database query
    async function getProductFromMongoDB(productId) {
      console.log(`    🔄 Querying MongoDB for product ${productId}...`);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate DB latency
      const product = mockDatabase.products.find(p => p._id === productId);
      return product;
    }

    // Cache-Aside Pattern Implementation
    async function getProduct(productId, ttlSeconds = 300) {
      const cacheKey = `product:${productId}`;
      
      // Step 1: Try to get from cache
      const cachedProduct = await client.get(cacheKey);
      
      if (cachedProduct) {
        console.log(`  ✓ Cache HIT - Retrieved from Redis`);
        return JSON.parse(cachedProduct);
      }

      // Step 2: Cache miss - query MongoDB
      console.log(`  ❌ Cache MISS - Querying MongoDB...`);
      const product = await getProductFromMongoDB(productId);
      
      if (product) {
        // Step 3: Store in Redis with TTL
        await client.set(cacheKey, JSON.stringify(product), { EX: ttlSeconds });
        console.log(`  ✓ Stored in Redis with ${ttlSeconds}s TTL`);
      }
      
      return product;
    }

    console.log("Request 1 (Database query + Cache):");
    console.time("Request 1");
    const product1 = await getProduct(1, 300); // Cache for 5 minutes
    console.timeEnd("Request 1");
    console.log("Product:", product1);

    console.log("\nRequest 2 (Cached):");
    console.time("Request 2");
    const product2 = await getProduct(1, 300);
    console.timeEnd("Request 2");
    console.log("Product:", product2);

    console.log("\nRequest 3 (Different product - cache miss):");
    console.time("Request 3");
    const product3 = await getProduct(2, 300);
    console.timeEnd("Request 3");
    console.log("Product:", product3);

    // Cache Invalidation Example
    console.log("\nCache Invalidation Example:");
    console.log("---------------------------");
    
    console.log("Simulating product price update in MongoDB...");
    mockDatabase.products[0].price = 999; // Update in DB
    
    console.log("Deleting cache...");
    await client.del("product:1");
    console.log("✓ Cache cleared");
    
    console.log("\nFetch again (new data from DB):");
    const updatedProduct = await getProduct(1, 300);
    console.log("Updated product:", updatedProduct);

    // Cleanup
    await client.del("product:1", "product:2");
  } catch (e) {
    console.error("Error:", e);
  }
}





// CONCEPT 4: REDIS RATE LIMITING
async function redisRateLimiting() {
  console.log("\n 4. REDIS RATE LIMITING");
  console.log("\n");

  try {
    // Rate Limiter Implementation
    async function checkRateLimit(userId, maxRequests, windowSeconds) {
      const key = `rate_limit:${userId}`;
      
      // Get current request count
      const currentCount = await client.incr(key);
      
      // If first request in window, set expiration
      if (currentCount === 1) {
        await client.expire(key, windowSeconds);
      }
      
      // Check if limit exceeded
      if (currentCount > maxRequests) {
        const ttl = await client.ttl(key);
        return { allowed: false, remaining: 0, retryAfter: ttl };
      }
      
      return { 
        allowed: true, 
        remaining: maxRequests - currentCount,
        retryAfter: null 
      };
    }

    console.log("\n Example 1: API Rate Limiting (5 requests per 10 seconds)");
    console.log("-----------------------------------------------------");
    
    const userId = "user:123";
    const maxRequests = 5;
    const windowSeconds = 10;
    
    console.log(`Rate limit: ${maxRequests} requests per ${windowSeconds} seconds\n`);
    
    for (let i = 1; i <= 7; i++) {
      const result = await checkRateLimit(userId, maxRequests, windowSeconds);
      
      if (result.allowed) {
        console.log(`Request ${i}: ✓ ALLOWED | Remaining: ${result.remaining}`);
      } else {
        console.log(`Request ${i}: ❌ BLOCKED | Retry after: ${result.retryAfter}s`);
      }
    }

    console.log("\n Example 2: Different rate limits for different tiers");
    console.log("---------------------------------------------------");
    
    async function advancedRateLimit(userId, userTier) {
      const limits = {
        free: { requests: 10, window: 3600 },      // 10 requests/hour
        premium: { requests: 100, window: 3600 },  // 100 requests/hour
        enterprise: { requests: 1000, window: 3600 } // 1000 requests/hour
      };
      
      const limit = limits[userTier];
      const result = await checkRateLimit(userId, limit.requests, limit.window);
      
      return { tier: userTier, ...result };
    }

    // Test different tiers
    const freeResult = await advancedRateLimit("free_user", "free");
    const premiumResult = await advancedRateLimit("premium_user", "premium");
    const enterpriseResult = await advancedRateLimit("enterprise_user", "enterprise");
    
    console.log("Free tier:", freeResult);
    console.log("Premium tier:", premiumResult);
    console.log("Enterprise tier:", enterpriseResult);

    console.log("\n Example 3: Sliding Window Rate Limiter");
    console.log("--------------------------------------");
    
    async function slidingWindowRateLimit(userId, maxRequests, windowSeconds) {
      const key = `sliding:${userId}`;
      const now = Date.now();
      const windowStart = now - (windowSeconds * 1000);
      
      // Remove old requests outside window
      await client.zRemRangeByScore(key, 0, windowStart);
      
      // Get request count in window
      const requestCount = await client.zCard(key);
      
      if (requestCount >= maxRequests) {
        return { allowed: false, reason: "Rate limit exceeded" };
      }
      
      // Add current request with timestamp. The member/element field on a
      // sorted-set entry is named `value` in this client's API (matching
      // the { score, value } shape used by zAdd elsewhere in this file) -
      // `member` isn't a recognized key, which is why the encoder rejected
      // this whole options object as "Invalid argument type".
      await client.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
      
      // Set expiration
      await client.expire(key, windowSeconds);
      
      return { allowed: true, requestsUsed: requestCount + 1, requestsLimit: maxRequests };
    }

    console.log("Sliding window: 3 requests per 5 seconds\n");
    
    for (let i = 1; i <= 5; i++) {
      const result = await slidingWindowRateLimit("sliding_user", 3, 5);
      console.log(`Request ${i}:`, result);
    }

    console.log("\n Example 4: Token Bucket Rate Limiter");
    console.log("------------------------------------");
    
    async function tokenBucketRateLimit(userId, capacity, refillRate, refillSeconds) {
      const key = `token_bucket:${userId}`;
      
      // Initialize bucket
      const bucket = await client.hGetAll(key);
      
      if (!bucket.tokens) {
        // First request - create bucket
        await client.hSet(key, {
          tokens: capacity,
          lastRefill: Date.now()
        });
        await client.expire(key, refillSeconds * 10);
        return { allowed: true, tokensRemaining: capacity - 1 };
      }
      
      // Calculate refilled tokens
      const now = Date.now();
      const timePassed = (now - parseInt(bucket.lastRefill)) / 1000;
      const refilled = Math.floor(timePassed * refillRate);
      let tokens = Math.min(capacity, parseInt(bucket.tokens) + refilled);
      
      if (tokens > 0) {
        tokens--;
        await client.hSet(key, {
          tokens: tokens,
          lastRefill: now
        });
        return { allowed: true, tokensRemaining: tokens };
      }
      
      return { allowed: false, reason: "No tokens available" };
    }

    console.log("Token bucket: 5 tokens/second, capacity 10\n");
    
    for (let i = 1; i <= 8; i++) {
      const result = await tokenBucketRateLimit("token_user", 10, 5, 10);
      console.log(`Request ${i}:`, result);
    }

    // Cleanup
    await client.del("rate_limit:user:123", "sliding:sliding_user", "token_bucket:token_user");
  } catch (e) {
    console.error("Error:", e);
  }
}




// BONUS: CACHE WARMING & INVALIDATION STRATEGIES
async function cacheStrategies() {
  console.log("\n 5. CACHE WARMING & INVALIDATION STRATEGIES");
  console.log("\n");

  try {
    console.log("Cache Warming Example:");
    console.log("---------------------");
    
    async function warmCache() {
      const popularProducts = [
        { id: 1, name: "Laptop", price: 1299 },
        { id: 2, name: "Mouse", price: 25 },
        { id: 3, name: "Keyboard", price: 75 }
      ];
      
      console.log("Loading popular products into cache...");
      
      for (const product of popularProducts) {
        await client.set(
          `product:${product.id}`,
          JSON.stringify(product),
          { EX: 3600 } // 1 hour TTL
        );
      }
      
      console.log(`✓ ${popularProducts.length} products warmed in cache`);
    }

    await warmCache();

    console.log("\nCache Invalidation Strategies:");
    console.log("-----------------------------");
    
    console.log("1. Time-based (TTL expiration) - Already covered above");
    
    console.log("\n2. Event-based (Manual invalidation):");
    const productId = 1;
    console.log(`   - User updates product ${productId}`);
    await client.del(`product:${productId}`);
    console.log(`   ✓ Cache for product ${productId} invalidated`);
    
    console.log("\n3. Pattern-based invalidation:");
    console.log("   - Setting all keys matching pattern");
    await client.set("product:1", JSON.stringify({ id: 1 }));
    await client.set("product:2", JSON.stringify({ id: 2 }));
    await client.set("product:3", JSON.stringify({ id: 3 }));
    
    // Get all keys matching pattern
    const keys = await client.keys("product:*");
    console.log(`   Found ${keys.length} cache entries`);
    
    // Delete all matching pattern
    for (const key of keys) {
      await client.del(key);
    }
    console.log("   ✓ All product cache entries cleared");

  } catch (e) {
    console.error("Error:", e);
  }
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================
async function runAllConcepts() {
  try {
    await client.connect();

    console.log("\n");
    console.log("╔══════════════════════════════════════════════════════╗");
    console.log("║   REDIS CACHING & TTL & RATE LIMITING               ║");
    console.log("║   Complete Interview Preparation Guide              ║");
    console.log("╚══════════════════════════════════════════════════════╝");

    await basicRedisCache();
    await ttlConcept();
    await mongodbRedisCache();
    await redisRateLimiting();
    await cacheStrategies();

    console.log("\n");
    console.log("╔══════════════════════════════════════════════════════╗");
    console.log("║        ✓ ALL CONCEPTS COMPLETED SUCCESSFULLY         ║");
    console.log("╚══════════════════════════════════════════════════════╝\n");

  } catch (e) {
    console.error("Fatal error:", e);
  } finally {
    await client.quit();
  }
}

runAllConcepts();
