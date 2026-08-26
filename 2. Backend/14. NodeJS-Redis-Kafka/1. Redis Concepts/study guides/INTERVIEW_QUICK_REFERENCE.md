# Redis Quick Reference Guide - Interview Cheat Sheet

## 🔥 Top 10 Redis Interview Concepts

### 1. Redis Caching
```
Problem: Database queries are slow
Solution: Cache results in Redis
Pattern: Check Redis → if miss → query DB → cache result

Benefits:
- 10-100x faster reads
- Reduces DB load by 80-90%
- Improves user experience
```

### 2. TTL (Time To Live)
```
SET key value EX seconds    // Expires in seconds
SET key value PX milliseconds // Expires in milliseconds
EXPIRE key seconds
PERSIST key                 // Remove expiration
TTL key                     // Get remaining seconds (-1: no expiry, -2: key doesn't exist)

Use Cases:
- Sessions: 30 minutes
- OTP: 5-10 minutes
- Cache: 1-24 hours
```

### 3. Cache-Aside Pattern
```
GET cache
if exists → return
if miss → GET database
SET cache (with TTL)
return
```

### 4. MongoDB + Redis 2-Tier Architecture
```
Read Flow:
  Client → Redis Cache → Hit ✓ return
                     ↓ Miss
                   MongoDB → Cache result → return

Write Flow:
  Client → Update MongoDB → Delete Redis cache → Done

Performance: Read speed increases 100-1000x for cached data
```

### 5. Rate Limiting - 4 Methods

**Fixed Window** (Simplest)
```
INCR counter
EXPIRE counter (if first request)
if counter > limit → BLOCKED
```

**Sliding Window** (Most Accurate)
```
ZREM old requests (outside time window)
ZADD current request (with timestamp)
ZCARD >= limit → BLOCKED
```

**Token Bucket** (Smooth Bursts)
```
Tokens = min(capacity, tokens + rate * time_passed)
if tokens > 0 → Allow, tokens--
else → Block
```

**Tiered Limits** (User-based)
```
free: 100 req/hour
premium: 1000 req/hour
enterprise: 10000 req/hour
```

### 6. Data Structures Comparison

| Structure | Use Case | Operations | Time |
|-----------|----------|-----------|------|
| String | Cache values, counters | GET, SET, INCR | O(1) |
| List | Queue, timeline | LPUSH, RPUSH, LPOP | O(1) |
| Set | Unique items, tags | SADD, SISMEMBER | O(1) |
| Sorted Set | Leaderboard, ranking | ZADD, ZRANGE | O(log N) |
| Hash | Object data | HSET, HGET, HGETALL | O(1) |

### 7. Pipelining (Performance)
```
❌ SLOW: 1000 sequential SET commands = 1000 network roundtrips

✅ FAST: Batch 1000 SET commands in pipeline = 1 roundtrip
Performance: 50-100x faster
```

### 8. Pub/Sub Messaging
```
Publisher → redis.publish("channel", "message")
Subscriber → redis.subscribe("channel", callback)

Use Cases: Real-time notifications, chat, events
```

### 9. Transactions (MULTI/EXEC)
```
client.multi()
  .set("a", 1)
  .set("b", 2)
  .get("a")
  .exec()
// All commands atomic (all-or-nothing)
```

### 10. Key Naming Convention
```
user:123              // User object
product:456           // Product
session:abc123        // Session
cache:query:posts     // Cached query
rate:user:123         // Rate limiter
```

---

## 💾 Most Important Commands

### Strings
```
SET key value [EX seconds] [PX ms]
GET key
INCR key
DECR key
APPEND key value
GETRANGE key 0 4
```

### Lists
```
LPUSH key value
RPUSH key value
LPOP key
RPOP key
LLEN key
LRANGE key 0 -1
```

### Sets
```
SADD key member
SMEMBERS key
SISMEMBER key member
SREM key member
SUNION key1 key2
SINTER key1 key2
```

### Sorted Sets
```
ZADD key score member
ZRANGE key 0 -1
ZREVRANGE key 0 -1
ZSCORE key member
ZRANK key member
ZINCRBY key increment member
```

### Hashes
```
HSET key field value
HGET key field
HGETALL key
HDEL key field
HEXISTS key field
HKEYS key
```

### Expiration
```
EXPIRE key seconds
TTL key
PERSIST key
```

---

## 🎯 Interview Answer Templates

### Q: Design caching layer?
**Answer**: 
"I would use Redis as L1 cache with:
- 5 min TTL for frequently updated data
- 24 hour TTL for static data
- Cache-Aside pattern (check Redis → miss → query DB)
- Invalidate on write (delete key on DB update)
- Use pipelining for bulk cache warming
- Monitor hit ratio to optimize TTL"

### Q: Implement rate limiting?
**Answer**:
"Depends on requirements:
- **Simple API**: Fixed window with INCR and EXPIRE
- **Accurate**: Sliding window with sorted sets
- **Production**: Token bucket for smooth rate
- **Enterprise**: Tiered limits by user plan"

### Q: MongoDB + Redis?
**Answer**:
"Redis caches MongoDB queries:
- Read: Check Redis → miss → query MongoDB → cache
- Write: Update MongoDB → delete Redis key
- Use appropriate TTLs (products: 24h, posts: 1h)
- Performance: 100-1000x faster for cached reads
- Reduces DB load by 80-90%"

### Q: Why Redis over direct DB?
**Answer**:
"Redis is 100-1000x faster:
- Disk I/O is bottleneck in traditional DBs
- Redis uses RAM (in-memory)
- 2-tier architecture: Redis cache + MongoDB storage
- Reduces database load significantly
- Improves API response times"

### Q: Cache invalidation strategy?
**Answer**:
"Three strategies:
1. Time-based: Set TTL (automatic expiration)
2. Event-based: Delete on update/delete
3. Pattern-based: Clear cache on major changes (DEL product:*)"

---

## ⚡ Performance Metrics

```
Operation                 Speed           Improvement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Direct MongoDB           800ms           1x (baseline)
MongoDB + Redis cache    2ms             400x faster
Sequential SET (1000)    2000ms          -
Pipelined SET (1000)     40ms            50x faster
Rate limit check         1ms             -
```

---

## 🔒 Security Checklist

- [ ] Never store passwords in Redis
- [ ] Use short TTLs for sensitive data
- [ ] Validate JSON before parsing (catch corruption)
- [ ] Use TLS for Redis communication
- [ ] Set Redis password
- [ ] Only expose to internal network
- [ ] Monitor for unauthorized access
- [ ] Implement rate limiting on critical endpoints

---

## 🐛 Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| High memory usage | Reduce TTL, limit key count |
| Cache not updating | Check invalidation logic |
| Rate limit too strict | Adjust window or limit |
| Slow performance | Use pipelining, optimize TTL |
| Thundering herd | Randomize TTL slightly |
| Cache poisoning | Validate JSON, TTL validation |

---

## 📊 Redis vs Competitors

| Feature | Redis | Memcached | Database |
|---------|-------|-----------|----------|
| Data types | 5+ | Key-value only | Many |
| Persistence | Yes | No | Yes |
| Speed | Very fast | Fast | Slow |
| Memory | Optimized | Optimized | N/A |
| Transactions | Yes | No | Yes |
| Pub/Sub | Yes | No | No |
| TTL | Yes | Yes | No |
| Perfect for | Caching, Sessions, Rate limit | Simple cache | Storage |

---

## 🎓 Key Takeaways

1. **Redis = Speed**: 10-100x faster than databases
2. **TTL = Auto cleanup**: Prevents memory overflow
3. **Patterns Matter**: Cache-Aside is most common
4. **2-Tier**: Redis + MongoDB = Scalable
5. **Rate Limiting**: Protects API from abuse
6. **Pipelining**: 50-100x faster for bulk ops
7. **Invalidation**: Time-based or event-based
8. **Security**: No sensitive data
9. **Monitoring**: Track hit ratio and memory
10. **Best Practice**: Use appropriate data structure

---

## ✅ Before Interview, Ensure You Can:

- [ ] Draw 2-tier architecture (Redis + MongoDB)
- [ ] Explain cache-aside pattern in 30 seconds
- [ ] List 4 rate limiting algorithms
- [ ] Describe when to use each data structure
- [ ] Explain TTL and why it matters
- [ ] Discuss security considerations
- [ ] Answer: "Why is Redis 100x faster?"
- [ ] List 5 real-world Redis use cases
- [ ] Explain pipelining benefits
- [ ] Design a caching layer

---

**Last Updated**: May 25, 2026
**Interview Confidence**: High ✅
