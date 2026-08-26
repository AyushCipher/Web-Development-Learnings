const mongoose = require("mongoose");

// Plain Mongoose schema - nothing Kafka-specific here; the consumer that
// writes these documents is notification.consumer.js.
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
