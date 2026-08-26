require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const commentRoutes = require("./routes/comment-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { requestIdMiddleware } = require("./utils/requestContext");
const {
  connectToRabbitMQ,
  isConnected: isRabbitMQConnected,
} = require("./utils/rabbitmq");

const app = express();
const PORT = process.env.PORT || 3006;

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
  res.json({ status: "ok", service: "comment-service" });
});

// Q. WHY TWO SEPARATE HEALTH ENDPOINTS INSTEAD OF ONE?
// ANS: /health is a liveness check - it only answers "is the process even
// running", so it stays cheap and dependency-free. /health/ready is a
// readiness check - it answers "are this service's actual dependencies
// (mongo, redis, rabbitmq) reachable right now". An orchestrator/load
// balancer treats these very differently: a liveness failure means "this
// process is stuck, restart it", while a readiness failure means "leave the
// process alone, just stop routing traffic to it until its dependencies
// come back". Collapsing both into one endpoint would make a temporary
// mongo/redis/rabbitmq outage trigger pointless restarts of an otherwise
// healthy process.
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

// routes -> pass redisclient to routes
app.use(
  "/api/comments",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  commentRoutes()
);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Comment service running on port ${PORT}`);
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
