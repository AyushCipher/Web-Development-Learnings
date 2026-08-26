const mongoose = require("mongoose");

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error", error);
    // Fail fast on startup rather than let the server come up and serve
    // requests against a DB connection that doesn't exist.
    process.exit(1);
  }
}

module.exports = connectDb;
