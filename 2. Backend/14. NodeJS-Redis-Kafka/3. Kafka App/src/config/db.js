const mongoose = require("mongoose");

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error", error);
    // Fail fast on startup rather than let a consumer run with no DB to
    // write to - it would just crash later, less clearly, on the first
    // event it tries to persist.
    process.exit(1);
  }
}

module.exports = connectDb;
