require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const mediaRoutes = require("./routes/media-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const {
  connectToRabbitMQ,
  consumeEvent,
  isConnected: isRabbitMQConnected,
} = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./eventHandlers/media-event-handlers");
const { requestIdMiddleware } = require("./utils/requestContext");

const app = express();
const PORT = process.env.PORT || 3003;

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

app.use(requestIdMiddleware);
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info("Request body", req.body);
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "media-service" });
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

// Ip based rate limiting for uploads: max 5 uploads per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many uploads, please try again later",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use("/api/media", mediaRoutes(uploadLimiter));

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    // consume all the events
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Media service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}

startServer();

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
