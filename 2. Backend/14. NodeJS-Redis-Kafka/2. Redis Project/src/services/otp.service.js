const redis = require("../config/redis");

// Q. WHY STORE THE OTP IN REDIS INSTEAD OF THE MAIN DATABASE?
// ANS: An OTP is only useful for a few minutes - it should disappear on its
// own once it expires, without us ever writing cleanup code. Redis's EX
// option does exactly that: `SET key value EX seconds` makes Redis delete
// the key automatically once the time is up. Storing short-lived,
// throwaway data like this in Mongo would mean writing our own job to
// delete expired rows - Redis gives us that for free.

const OTP_TTL_SECONDS = 5 * 60; // 5 minutes

function otpKey(email) {
  return `otp:${email}`;
}

async function generateAndStoreOtp(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(otpKey(email), otp, "EX", OTP_TTL_SECONDS);
  return otp;
}

async function verifyOtp(email, candidate) {
  const stored = await redis.get(otpKey(email));

  if (!stored) {
    return { valid: false, reason: "OTP expired or was never requested" };
  }

  if (stored !== candidate) {
    return { valid: false, reason: "Incorrect OTP" };
  }

  // Correct OTP is single-use - delete it immediately so it can't be replayed.
  await redis.del(otpKey(email));
  return { valid: true };
}

module.exports = { generateAndStoreOtp, verifyOtp, OTP_TTL_SECONDS };
