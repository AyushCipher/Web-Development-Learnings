require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const postRoutes = require("./routes/post-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { requestIdMiddleware } = require("./utils/requestContext");
const {
  connectToRabbitMQ,
  isConnected: isRabbitMQConnected,
} = require("./utils/rabbitmq");

const app = express();
const PORT = process.env.PORT || 3002;

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

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "post-service" });
});

// Q. WHY TWO SEPARATE ENDPOINTS, /health AND /health/ready, INSTEAD OF ONE?
// ANS: They answer different questions and get used differently by a load
// balancer/orchestrator. /health is a liveness check - "is the process even
// running?" - and a failure there means "restart me". /health/ready is a
// readiness check - "are my actual dependencies (mongo, redis, rabbitmq)
// reachable right now?" - and a failure there means "don't route traffic
// here yet, but don't restart me either", since restarting wouldn't fix a
// downstream outage and would just cause unnecessary churn.
app.get("/health/ready", async (req, res) => {
  const checks = {
    mongo: mongoose.connection.readyState === 1,
    redis: redisClient.status === "ready",
    rabbitmq: isRabbitMQConnected(),
  };
  const healthy = Object.values(checks).every(Boolean);
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? "ok" : "unavailable", checks });
});

// Ip based rate limiting for sensitive (write) endpoints
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

// routes -> pass redisclient and the sensitive-endpoint limiter to routes
app.use("/api/posts", (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes(sensitiveEndpointsLimiter)
);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Post service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}

startServer();

//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
