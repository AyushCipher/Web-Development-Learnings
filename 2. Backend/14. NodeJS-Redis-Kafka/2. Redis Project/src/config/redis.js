const Redis = require("ioredis");

// Q. WHY ONE SHARED REDIS CLIENT INSTEAD OF CREATING A NEW ONE EVERYWHERE?
// ANS: A Redis connection is a persistent TCP connection - creating a new
// one per request would be slow and would quickly exhaust connections.
// Every part of this app (product caching, OTP storage, sessions, rate
// limiting) imports this exact same client instead of making its own.

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error", err));

module.exports = redis;
