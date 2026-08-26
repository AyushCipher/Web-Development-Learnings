require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const routes = require("./routes/identity-service");
const errorHandler = require("./middleware/errorHandler");
const { requestIdMiddleware } = require("./utils/requestContext");

const app = express();
const PORT = process.env.PORT || 3001;

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

// middleware
app.use(requestIdMiddleware);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info("Request body", req.body);
  next();
});

// health endpoints
// Q. WHY TWO SEPARATE HEALTH ENDPOINTS INSTEAD OF ONE?
// ANS: /health is a liveness check - it only answers "is the process even
// running?" and never touches Mongo or Redis, so it can't be dragged down by
// a dependency outage. /health/ready is a readiness check - it answers "are
// this service's actual dependencies reachable right now?" An orchestrator
// (or load balancer) uses these differently: a liveness failure means
// "restart me", but a readiness failure means "don't route traffic to me yet,
// don't restart me" - restarting a process whose only problem is a slow
// Mongo/Redis wouldn't fix anything and would just cause needless churn.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "identity-service" });
});

app.get("/health/ready", async (req, res) => {
  const checks = {
    mongo: mongoose.connection.readyState === 1,
    redis: redisClient.status === "ready",
  };
  const healthy = Object.values(checks).every(Boolean);
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? "ok" : "unavailable", checks });
});

// DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

// Ip based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// apply this sensitiveEndpointsLimiter to our routes
app.use("/api/auth/register", sensitiveEndpointsLimiter);

// Routes
app.use("/api/auth", routes);

// error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service running on port ${PORT}`);
});

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
