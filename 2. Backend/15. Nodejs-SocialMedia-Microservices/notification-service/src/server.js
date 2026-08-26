require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { requestIdMiddleware } = require("./utils/requestContext");
const {
  connectToRabbitMQ,
  consumeEvent,
  isConnected: isRabbitMQConnected,
} = require("./utils/rabbitmq");
const notificationRoutes = require("./routes/notification-routes");
const {
  handlePostLiked,
  handlePostCommented,
} = require("./eventHandlers/notification-event-handlers");

const app = express();
const PORT = process.env.PORT || 3007;

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
  res.json({ status: "ok", service: "notification-service" });
});

// Q. WHY TWO SEPARATE HEALTH ENDPOINTS INSTEAD OF ONE?
// ANS: /health answers "is the process running at all" (liveness) - it
// never touches Mongo or RabbitMQ, so an orchestrator uses it to decide
// whether to restart a hung/crashed container. /health/ready answers "can
// this instance actually do its job right now" (readiness) - it checks the
// dependencies this service needs (Mongo, RabbitMQ; no Redis here) and a
// load balancer uses it to decide whether to route traffic to this
// instance. Conflating them would mean a temporary Mongo blip gets treated
// as "kill and restart the process" instead of "just stop sending it
// traffic until it recovers".
app.get("/health/ready", async (req, res) => {
  const checks = {
    mongo: mongoose.connection.readyState === 1,
    rabbitmq: isRabbitMQConnected(),
  };
  const healthy = Object.values(checks).every(Boolean);
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? "ok" : "unavailable", checks });
});

app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    // consume the events / subscribe to the events
    await consumeEvent("post.liked", handlePostLiked);
    await consumeEvent("post.commented", handlePostCommented);

    app.listen(PORT, () => {
      logger.info(`Notification service is running on port: ${PORT}`);
    });
  } catch (e) {
    logger.error(e, "Failed to start notification service");
    process.exit(1);
  }
}

startServer();
