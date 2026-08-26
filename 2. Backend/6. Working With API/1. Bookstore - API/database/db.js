const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect(
      process.env.DATABASE_URL
    );
    console.log("MongoDB is connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};
// process.env.DATABASE_URL
module.exports = connectToDB;
