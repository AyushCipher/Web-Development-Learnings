const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Q. WHY STORE REFRESH TOKENS IN MONGODB WITH A TTL INDEX INSTEAD OF REDIS?
// ANS: Redis suits short-lived, hot-path data - an OTP or a rate-limit
// counter (see 14. NodeJS-Redis-Kafka/2. Redis Project) - where losing a
// value on restart or eviction is cheap to recover from. A refresh token has
// to durably survive a Redis restart/eviction, since losing it would force
// every logged-in user to log in again. So it lives in the durable primary
// database instead, and this TTL index (expireAfterSeconds: 0, keyed off the
// expiresAt Date) lets Mongo auto-delete expired tokens the same way Redis
// would with a key TTL, without needing a separate cleanup job.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
module.exports = RefreshToken;
