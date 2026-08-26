require("dotenv").config();
const express = require("express");
const logger = require("./config/logger");
const { connectDatabase } = require("./config/database.js");
const { setupHelmet } = require("./middleware/security");
const { configureCors } = require("./config/corsConfig.js");
const {
  requestLogger,
  addTimeStamp,
} = require("./middleware/customMiddleware.js");
const { globalErrorhandler } = require("./middleware/errorHandler.js");
const { urlVersioning } = require("./middleware/apiVersioning.js");
const { setupDDoSProtection } = require("./middleware/ddosProtection.js");
const itemRoutes = require("./routes/item-routes.js");
// Q. WHY WAS THIS FILE NEVER IMPORTED BEFORE?
// ANS: It wasn't a stylistic choice - example-routes.js's auth/items
// routes (with real Joi validation, rate limiting, and now a real
// database) were simply never mounted, so none of /auth/register,
// /auth/login, or its /api/items routes were ever reachable; only
// item-routes.js's separate in-memory demo was live. See this file's own
// Q&A comments for the TODOs that were left unfilled as a result.
const exampleRoutes = require("./routes/example-routes.js");

const app = express();
const PORT = process.env.PORT || 3000;


// SECURITY CONFIGURATION: Order of middleware is important for security and performance. Always start with security headers and DDoS protection before logging and body parsing.

// 1. HELMET SECURITY HEADERS (Must be first): Protects against DDoS, XSS, clickjacking, and other vulnerabilities
setupHelmet(app);


// 2. DDoS PROTECTION LAYERS: Global rate limiting, request size limits, slow request detection
setupDDoSProtection(app);


// 3. REQUEST LOGGING: Log all incoming requests with timestamps and metadata
app.use(requestLogger);
app.use(addTimeStamp);
app.use(logger.httpLogger);


// 4. CORS CONFIGURATION: Control which origins can access this API
app.use(configureCors());


// 5. BODY PARSING: Parse JSON request bodies
app.use(express.json());


// 6. HEALTH CHECK ENDPOINT: A simple endpoint to check if the server is running and healthy
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    server_id: process.env.SERVER_ID || "Unknown",
    port: PORT,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});


// 7. API VERSIONING: Handle API versioning
app.use(urlVersioning("v1"));


// 8. Application Routes: Define application-specific routes
app.use("/api/v1", itemRoutes);
// Q. WHY MOUNT exampleRoutes AT "/api/v1" TOO, RATHER THAN "/" WHERE ITS
//    ROUTE PATHS (/auth/register, /products, ...) WERE ORIGINALLY WRITTEN
//    AGAINST?
// ANS: The urlVersioning("v1") middleware right above only lets requests
// through whose path starts with "/api/v1" - mounted at "/", every one of
// this router's routes would 404 through that gate before ever reaching
// its own handler (which is exactly what happened live: POST /auth/
// register returned "API version v1 is not supported"). Mounting here
// instead makes the routes reachable at /api/v1/auth/register,
// /api/v1/products, etc. - satisfying the version check without touching
// urlVersioning.js itself. (Its item routes were also renamed from
// /api/items to /products - kept as their own path, distinct from
// item-routes.js's separate in-memory /api/v1/items demo mounted just
// above, so the two don't collide on the same route.)
app.use("/api/v1", exampleRoutes);


// 404 HANDLER: Catch-all for undefined routes (must be after all other routes)
app.use((req, res) => {
  logger.warn("404 Not Found", {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
  });
});


// Global Error Handler (must be last middleware)
app.use(globalErrorhandler);


// Start Server
// Q. WHY AWAIT connectDatabase() BEFORE app.listen() INSTEAD OF LETTING
//    THEM RUN CONCURRENTLY?
// ANS: example-routes.js's handlers call User.find()/Item.create() etc.
// directly with no "is Mongo ready?" guard - if the server started
// accepting requests before the connection resolved, the very first
// request could crash on a not-yet-connected mongoose call. Waiting here
// means the server only starts listening once it can actually serve
// every route correctly.
// Q. WHY DECLARE `server` UP HERE INSTEAD OF AS A const INSIDE
//    startServer()?
// ANS: The shutdown handlers below (unhandledRejection, uncaughtException,
// SIGTERM) all call server.close() - they need to reach the same
// variable startServer() assigns to. Declaring it at module scope with
// `let`, then assigning it once app.listen() actually resolves inside
// startServer(), is what makes both sides refer to the same server
// instance instead of startServer() shadowing it in a scope those
// handlers can't see.
let server;

async function startServer() {
  await connectDatabase();

  server = app.listen(PORT, () => {
    logger.info(`Express Server started`, {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
      serverId: process.env.SERVER_ID || "Unknown",
    });
  });
}

startServer();



// GRACEFUL SHUTDOWN & UNHANDLED ERROR HANDLING: Handle uncaught exceptions and clean shutdown
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", {
    promise,
    reason: reason.message || reason,
  });

  // Graceful shutdown
  server.close(() => {
    process.exit(1);
  });
});


// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", {
    error: error.message,
    stack: error.stack,
  });

  // Graceful shutdown
  server.close(() => {
    process.exit(1);
  });
});


// Handle SIGTERM for graceful shutdown (e.g., when using process managers or container orchestration)
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Starting graceful shutdown...");
  
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
});
