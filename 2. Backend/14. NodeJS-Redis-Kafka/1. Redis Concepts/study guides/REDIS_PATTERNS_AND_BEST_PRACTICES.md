# Redis Real-World Patterns & Best Practices

## 🏗️ Production-Ready Patterns

### Pattern 1: Database Query Caching with TTL

```javascript
// Cache database queries with automatic expiration
async function getUserWithCache(userId) {
  const cacheKey = `user:${userId}`;
  
  // Try cache first
  let user = await redis.get(cacheKey);
  
  if (user) {
    return JSON.parse(user); // Cache hit
  }
  
  // Cache miss - query database
  user = await User.findById(userId);
  
  // Store in cache with 1 hour TTL
  if (user) {
    await redis.set(cacheKey, JSON.stringify(user), { EX: 3600 });
  }
  
  return user;
}
```

### Pattern 2: Session Management

```javascript
async function createSession(userId, sessionData) {
  const sessionId = generateUniqueId();
  const sessionKey = `session:${sessionId}`;
  
  // Store with 30-minute expiration
  await redis.set(
    sessionKey,
    JSON.stringify(sessionData),
    { EX: 1800 } // 30 minutes
  );
  
  return sessionId;
}

async function getSession(sessionId) {
  const session = await redis.get(`session:${sessionId}`);
  return session ? JSON.parse(session) : null;
}

async function deleteSession(sessionId) {
  await redis.del(`session:${sessionId}`);
}
```

### Pattern 3: Cache Warming (Pre-loading)

```javascript
async function warmCache() {
  // Pre-load popular data on server startup
  const popularProducts = await Product.find().limit(100);
  
  for (const product of popularProducts) {
    await redis.set(
      `product:${product._id}`,
      JSON.stringify(product),
      { EX: 86400 } // 24 hours
    );
  }
  
  console.log('Cache warmed with', popularProducts.length, 'products');
}
```

### Pattern 4: Cache Invalidation on Update

```javascript
async function updateProduct(productId, updateData) {
  // Update database
  const updated = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true }
  );
  
  // Invalidate cache
  await redis.del(`product:${productId}`);
  
  return updated;
}
```

### Pattern 5: Distributed Rate Limiting

```javascript
async function checkRateLimit(userId, limit = 100, window = 3600) {
  const key = `rate:${userId}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  if (current > limit) {
    const ttl = await redis.ttl(key);
    throw new Error(`Rate limited. Retry after ${ttl} seconds`);
  }
  
  return { allowed: true, remaining: limit - current };
}
```

### Pattern 6: Sliding Window Rate Limiter

```javascript
async function slidingWindowRateLimit(userId, maxRequests = 10, windowSeconds = 60) {
  const key = `sliding:${userId}`;
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);
  
  // Remove old requests outside window
  await redis.zRemRangeByScore(key, 0, windowStart);
  
  // Count requests in window
  const count = await redis.zCard(key);
  
  if (count >= maxRequests) {
    return { allowed: false, reason: 'Rate limit exceeded' };
  }
  
  // Add current request
  await redis.zAdd(key, {
    score: now,
    member: `${now}-${Math.random()}`
  });
  
  // Cleanup old data
  await redis.expire(key, windowSeconds);
  
  return { allowed: true, remaining: maxRequests - count - 1 };
}
```

---

## ⚡ Performance Optimization Tips

### Tip 1: Use Pipelining for Batch Operations

```javascript
// ❌ SLOW - Sequential
for (let i = 0; i < 1000; i++) {
  await redis.set(`key:${i}`, `value:${i}`);
}

// ✅ FAST - Pipelined
const pipeline = redis.multi();
for (let i = 0; i < 1000; i++) {
  pipeline.set(`key:${i}`, `value:${i}`);
}
await pipeline.exec();
// 50-100x faster!
```

### Tip 2: Use Appropriate Data Structures

```javascript
// ❌ Bad - Storing array as string
await redis.set('users:ids', JSON.stringify([1,2,3,4,5]));

// ✅ Good - Use Set for unique IDs
await redis.sAdd('users:ids', [1,2,3,4,5]);
// Faster operations: SISMEMBER, SCARD, SUNION, SINTER
```

### Tip 3: Key Naming Convention

```javascript
// Good naming patterns:
'user:123'              // User object
'user:123:posts'        // User's posts
'product:456'           // Product object
'cart:user:789'         // Shopping cart
'session:abc123xyz'     // Session
'rate:user:123'         // Rate limiter
'cache:query:posts'     // Query cache

// Benefits: Organized, easy to find, easy to invalidate patterns
```

### Tip 4: Optimize TTL

```javascript
// ❌ Don't use same TTL for everything
await redis.set(key, value, { EX: 3600 }); // Same for all

// ✅ Use appropriate TTL for use case
'session:*'             // 30 minutes (1800s)
'otp:*'                 // 5-10 minutes (300-600s)
'product:*'             // 1-24 hours (3600-86400s)
'user:*'                // 1 hour (3600s)
'api:cache:*'           // 5-15 minutes (300-900s)
```

---

## 🔒 Security Best Practices

### Practice 1: Sensitive Data Handling

```javascript
// ❌ Bad - Storing passwords/tokens in plain text
await redis.set(`user:${id}:password`, password);

// ✅ Good - Only cache non-sensitive data
await redis.set(`user:${id}`, JSON.stringify({
  name: user.name,
  email: user.email
  // Never cache: password, creditCard, apiKey, JWT
}));

// For tokens: Short TTL + hash verification
await redis.set(`auth:token:${token}`, userId, { EX: 3600 });
```

### Practice 2: Prevent Cache Poisoning

```javascript
async function getDataSafely(id) {
  const key = `data:${id}`;
  const cached = await redis.get(key);
  
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // Invalid JSON - delete corrupted cache
      await redis.del(key);
      // Fetch fresh from database
    }
  }
  
  const fresh = await Database.get(id);
  await redis.set(key, JSON.stringify(fresh), { EX: 3600 });
  return fresh;
}
```

---

## 📊 Monitoring & Debugging

### Debug 1: Check Cache Hit Ratio

```javascript
async function getCacheStats() {
  const info = await redis.info('stats');
  const lines = info.split('\r\n');
  
  const stats = {};
  lines.forEach(line => {
    const [key, value] = line.split(':');
    stats[key] = value;
  });
  
  const hitRatio = stats.keyspace_hits / 
    (stats.keyspace_hits + stats.keyspace_misses);
  
  console.log(`Cache hit ratio: ${(hitRatio * 100).toFixed(2)}%`);
  return stats;
}
```

### Debug 2: Monitor Key Expiration

```javascript
async function checkKeyExpiration(pattern) {
  const keys = await redis.keys(pattern);
  
  for (const key of keys) {
    const ttl = await redis.ttl(key);
    console.log(`${key}: TTL = ${ttl}s`);
  }
}

// Usage: checkKeyExpiration('user:*')
```

### Debug 3: Memory Usage

```javascript
async function checkMemoryUsage() {
  const info = await redis.info('memory');
  const lines = info.split('\r\n');
  
  lines.forEach(line => {
    if (line.includes('used_memory')) {
      console.log(line);
    }
  });
}
```

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Missing Cache Invalidation

```javascript
// ❌ Bad - Cache not invalidated on update
async function updateUser(id, data) {
  return await User.findByIdAndUpdate(id, data);
  // User cache is still old!
}

// ✅ Good
async function updateUser(id, data) {
  const updated = await User.findByIdAndUpdate(id, data);
  await redis.del(`user:${id}`); // Invalidate cache
  return updated;
}
```

### Mistake 2: No TTL on Temporary Data

```javascript
// ❌ Bad - OTP never expires
await redis.set(`otp:${userId}`, otp);

// ✅ Good
await redis.set(`otp:${userId}`, otp, { EX: 600 }); // 10 minutes
```

### Mistake 3: Storing Large Objects

```javascript
// ❌ Bad - Storing entire database object
await redis.set(`user:${id}`, JSON.stringify(complexUserObject));

// ✅ Good - Store only necessary fields
await redis.set(`user:${id}`, JSON.stringify({
  id: user.id,
  name: user.name,
  email: user.email
}));
```

### Mistake 4: No Error Handling

```javascript
// ❌ Bad
const data = await redis.get(key);

// ✅ Good
try {
  const data = await redis.get(key);
  // Process data
} catch (error) {
  console.error('Redis error:', error);
  // Fall back to database
}
```

---

## 🎯 Interview Checklist

Before your Redis interview, ensure you can explain:

- [ ] What is Redis and why it's used
- [ ] All 5 data structures with examples
- [ ] Pub/Sub pattern and use cases
- [ ] Transactions and WATCH
- [ ] Pipelining and performance benefits
- [ ] TTL and expiration strategies
- [ ] Cache-Aside pattern with MongoDB
- [ ] 4 types of rate limiting algorithms
- [ ] Cache invalidation strategies
- [ ] Real-world architecture (Redis + MongoDB)
- [ ] Security best practices
- [ ] Common mistakes and how to avoid them
- [ ] Performance optimization tips
- [ ] Production monitoring and debugging

---

## 🚀 Real Interview Questions You Might Get

### Q1: Design a caching layer for e-commerce
**Answer**: Use Redis with:
- Product cache (24h TTL)
- Cart cache (1h TTL)
- Session cache (30min TTL)
- Invalidate on product update
- Use hash for product details
- Use sorted set for leaderboard

### Q2: How to handle cache stampede?
**Answer**: 
- Use locking (SETNX)
- Extend TTL on access
- Use probabilistic early expiration

### Q3: Rate limiting for API?
**Answer**: Sliding window + Redis ZSET:
- Store request timestamps in sorted set
- Remove old entries outside window
- O(1) lookup and increment

### Q4: MongoDB + Redis architecture?
**Answer**:
- Read: Redis → MongoDB → Cache result
- Write: Update MongoDB → Delete from Redis
- Use TTL for cache freshness

---

## 📚 Summary: You Now Know

✅ Redis fundamentals and use cases
✅ 5 data structures with 50+ operations
✅ Pub/Sub messaging and transactions
✅ Complete TTL implementation
✅ Caching patterns and strategies
✅ MongoDB + Redis integration
✅ 4 rate limiting algorithms
✅ Production best practices
✅ Security considerations
✅ Performance optimization
✅ Common mistakes and solutions

**You are now Redis-expert ready!** 🎉

