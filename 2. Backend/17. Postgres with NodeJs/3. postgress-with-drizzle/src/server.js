require("dotenv").config();
const express = require("express");
const authorRoutes = require("./routes/authorRoutes");
const bookRoutes = require("./routes/bookRoutes");
const publisherRoutes = require("./routes/publisherRoutes");
const genreRoutes = require("./routes/genreRoutes");
const libraryMemberRoutes = require("./routes/libraryMemberRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const borrowRecordRoutes = require("./routes/borrowRecordRoutes");
const promClient = require("prom-client");

const app = express();
app.use(express.json());

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Create a custom counter metric for tracking API requests
const httpRequestsCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

register.registerMetric(httpRequestsCounter);

// Middleware to track API requests
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestsCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });

  next();
});

// Expose the /metrics endpoint for prometheus
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/authors", authorRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/members", libraryMemberRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/borrow-records", borrowRecordRoutes);

// Welcome route
app.get("/api", (req, res) => {
  res.json({
    message: "Library Management System API (Drizzle ORM edition)",
    version: "2.0",
    endpoints: {
      authors: "/api/authors",
      books: "/api/books",
      publishers: "/api/publishers",
      genres: "/api/genres",
      members: "/api/members",
      reviews: "/api/reviews",
      borrowRecords: "/api/borrow-records",
      health: "/health",
      metrics: "/metrics",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Library Management System API (Drizzle) running at http://localhost:${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});
