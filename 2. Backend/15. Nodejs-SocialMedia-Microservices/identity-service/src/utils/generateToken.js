const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");

const generateTokens = async (user) => {
  // Q. Why two tokens (a short-lived access token + a longer-lived refresh token) instead of one
  // long-lived token?
  // ANS: The access token is what gets checked on every request, so it's kept short-lived (60m)
  // to keep the blast-radius window small if it's ever stolen. The refresh token exists purely to
  // mint new access tokens without forcing a full re-login, and its own compromise is mitigated by
  // it being revocable — it's stored server-side (see RefreshToken.js) and can simply be deleted,
  // which a bare JWT can never be.
  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "60m" }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // refresh token expires in 7 days

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
