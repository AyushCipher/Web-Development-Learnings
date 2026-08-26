// Q. WHAT IS REDIS?
// ANS: Redis (Remote Dictionary Server) is an extremely fast in-memory NoSQL database, cache, and message broker that stores data in RAM instead of hard disk. 
// Because RAM access is much faster than disk access, Redis can perform millions of operations per second with very low latency. Redis stores data using key-value pairs 
// and supports multiple advanced data structures such as strings, lists, sets, sorted sets, hashes, streams, bitmaps, and pub/sub channels. 
// It is commonly used for caching, session storage, real-time analytics, leaderboards, queues, chat systems, pub/sub messaging, rate limiting, and distributed systems.

// Redis is primarily:
// * key-value database
// * NoSQL database
// * in-memory database


// Q. WHY USE REDIS?
// ANS: Redis is used because traditional databases like MongoDB or MySQL are disk-based and slower for extremely frequent read/write operations. 
// Redis provides ultra-fast performance because data is stored in memory. It helps reduce database load, improve API response speed, support real-time systems, and handle high-throughput applications efficiently. 
// Modern applications use Redis for:
// * caching database queries
// * JWT/session storage
// * OTP storage
// * real-time notifications
// * queues
// * pub/sub messaging
// * rate limiting
// * gaming leaderboards
// * distributed locks


// Q. HOW TO USE REDIS IN NODE.JS?
// ANS: Redis works using a client-server architecture. A Node.js application connects to the Redis server using a Redis client library such as node-redis or ioredis.
// The application sends commands like SET, GET, DEL, INCR, LPUSH, HSET, or PUBLISH to the Redis server. Redis processes these commands in memory and instantly returns the result. 
// Since operations happen in RAM instead of disk, execution becomes extremely fast.
// Redis also supports persistence mechanisms to periodically save memory data to disk for recovery after crashes.

// WORKFLOW:
// Client Request
//       ↓
// Check Redis Cache
//       ↓
// Cache Hit?
//    YES → return cached data
//    NO  → query database
//              ↓
//         store result in Redis

const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

// event listener

client.on("error", (error) =>
  console.log("Redis client error occured!", error)
);


async function testRedisConnection() {
  try {
    await client.connect();
    console.log("Connected to redis");

    await client.set("name", "ayush");

    const extractValue = await client.get("name");

    console.log(extractValue);

    const deleteCount = await client.del("name");
    console.log(deleteCount);

    const extractUpdatedValue = await client.get("name");
    console.log(extractUpdatedValue);

    await client.set("count", "100");
    const incrementCount = await client.incr("count");
    console.log(incrementCount);

    const decrementCount = await client.decr("count");
    console.log(decrementCount);
    await client.decr("count");
    await client.decr("count");
    await client.decr("count");
    await client.decr("count");
    await client.decr("count");
    console.log(await client.get("count"));
  } catch (error) {
    console.error(error);
  } finally {
    await client.quit();
  }
}

testRedisConnection();


// Q. HOW DOES REDIS PERSISTANCE WORK?
// ANS: Redis supports persistence mechanisms to save in-memory data to disk.

// Types:
// * RDB snapshots  - RDB creates periodic snapshots of Redis memory data and stores them on disk.
// * AOF (Append Only File) - AOF logs every write operation so Redis can reconstruct data after restart.


// Q. WHAT HAPPENS IF REDIS CRASHES?
// ANS: If Redis crashes, all data stored in memory will be lost. 
// However, if persistence is enabled (RDB or AOF), Redis can recover data from the last snapshot or log file.


// REDIS REPLICATION: Redis supports replication where one Redis server (master) can replicate data to one or more Redis servers (slaves) for high availability, backup and read scalability.

// REDIS SENTINEL: Redis Sentinel monitors Redis servers and automatically performs failover if master server crashes.

// REDIS CLUSTER: Redis Cluster distributes data across multiple Redis nodes for horizontal scalability and fault tolerance.

// REDIS SHARDING: Sharding splits Redis data across multiple servers to distribute load and improve scalability.
