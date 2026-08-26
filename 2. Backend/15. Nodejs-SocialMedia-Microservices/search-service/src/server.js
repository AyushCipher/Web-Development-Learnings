require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const redisClient = require("./utils/redisClient");
const { requestIdMiddleware } = require("./utils/requestContext");
const {
  connectToRabbitMQ,
  consumeEvent,
  isConnected: isRabbitMQConnected,
} = require("./utils/rabbitmq");
const searchRoutes = require("./routes/search-routes");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("./eventHandlers/search-event-handlers");

const app = express();
const PORT = process.env.PORT || 3004;

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

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
  res.json({ status: "ok", service: "search-service" });
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

// Ip based rate limiting for the (expensive, text-search) sensitive endpoint
const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
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

// pass redis client as part of req and apply rate limiting
app.use(
  "/api/search",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  sensitiveEndpointsLimiter,
  searchRoutes
);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    // consume the events / subscribe to the events
    await consumeEvent("post.created", handlePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Search service is running on port: ${PORT}`);
    });
  } catch (e) {
    logger.error(e, "Failed to start search service");
    process.exit(1);
  }
}

startServer();
