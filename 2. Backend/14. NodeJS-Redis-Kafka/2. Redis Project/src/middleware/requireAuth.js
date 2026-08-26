const jwt = require("jsonwebtoken");
const { getSession } = require("../services/session.service");

// Protects routes that need a logged-in user. Reads the JWT from the
// httpOnly cookie set in auth.controller.js's verifyOtp, then checks it two
// ways - see the "why also Redis" comment in session.service.js.
async function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  const sessionToken = await getSession(payload.userId);
  if (sessionToken !== token) {
    return res.status(401).json({ success: false, message: "Session expired, please log in again" });
  }

  req.user = { id: payload.userId, email: payload.email };
  next();
}

module.exports = requireAuth;
