require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const chatRoutes = require("./routes/chat-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { requestIdMiddleware } = require("./utils/requestContext");
const { initChatSocket } = require("./socket/chatSocket");

const app = express();
const PORT = process.env.PORT || 3008;

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

// Q. WHY http.createServer(app) INSTEAD OF JUST app.listen(...) LIKE EVERY
//    OTHER SERVICE IN THIS PROJECT?
// Ans - Socket.IO needs to attach itself to the raw http.Server so it can
// intercept the WebSocket upgrade handshake. app.listen() creates that
// server internally with no chance to hand it to Socket.IO first, so we
// create it explicitly here, give it to both Express (as normal) and
// Socket.IO (right below), and call server.listen() at the bottom instead
// of app.listen() - if this used app.listen() instead, the WebSocket
// upgrade would never be intercepted and every socket connection would fail.
const server = http.createServer(app);

// Q. WHY IS CORS WIDE OPEN ("*") HERE WHEN NO OTHER SERVICE NEEDS CORS AT
//    ALL?
// Ans - Every other service in this project is only ever called by the
// gateway, server-to-server - CORS is a browser-enforced rule, so it's
// irrelevant there. chat-service is the one service a browser connects to
// DIRECTLY (see chatSocket.js), from wherever the frontend happens to be
// hosted, so Socket.IO needs an explicit CORS policy or the browser will
// refuse the handshake before our own JWT check ever runs. Kept wide open
// here to keep this project simple; a real deployment would lock this down
// to the frontend's actual origin.
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// middleware
app.use(requestIdMiddleware);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "chat-service" });
});

// Q. WHY TWO SEPARATE HEALTH ENDPOINTS INSTEAD OF ONE?
// ANS: /health answers "is the process running at all" (liveness) - it
// never touches Mongo, so an orchestrator uses it to decide whether to
// restart a hung/crashed container. /health/ready answers "can this
// instance actually do its job right now" (readiness) - it checks the
// dependency this service needs (Mongo; no RabbitMQ or Redis here) and a
// load balancer uses it to decide whether to route traffic to this
// instance. Conflating them would mean a temporary Mongo blip gets treated
// as "kill and restart the process" instead of "just stop sending it
// traffic until it recovers".
app.get("/health/ready", (req, res) => {
  const checks = {
    mongo: mongoose.connection.readyState === 1,
  };
  const healthy = Object.values(checks).every(Boolean);
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? "ok" : "unavailable", checks });
});

// Q. WHY DO THE REST ROUTES BELOW AND THE SOCKET.IO SERVER ABOVE LIVE IN THE
//    SAME PROCESS INSTEAD OF BEING SPLIT INTO TWO SEPARATE SERVICES?
// Ans - The REST endpoints (conversation/message history) are a plain
// request/response concern, reachable through the gateway exactly like every
// other service in this project - there's nothing special about them. The
// live Socket.IO connection is the one exception that needs browsers to
// connect directly (see chatSocket.js for why). Splitting that into a
// second service would mean running two processes, duplicating the Mongo
// connection and the Message model, just to keep one HTTP-shaped concern and
// one WebSocket-shaped concern apart - not worth it for what is otherwise
// one cohesive feature (direct messaging), so both live together here.
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

initChatSocket(io);

server.listen(PORT, () => {
  logger.info(`Chat service running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
