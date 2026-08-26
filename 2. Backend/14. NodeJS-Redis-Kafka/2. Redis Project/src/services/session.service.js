const redis = require("../config/redis");

// Q. WE ALREADY HAVE A JWT - WHY ALSO STORE A SESSION IN REDIS?
// ANS: A JWT alone can't be revoked - once issued, it stays valid until it
// expires, even if the user logs out. By ALSO storing that same token in
// Redis under the user's id, "logout" becomes a real action: delete the
// Redis key, and the token instantly stops being accepted, even though its
// signature would still verify fine on its own. requireAuth.js checks BOTH
// things: is the JWT signature valid, AND does a matching session still
// exist in Redis.

const SESSION_TTL_SECONDS = 60 * 60; // 1 hour - keep this in sync with the JWT's own expiry

function sessionKey(userId) {
  return `session:${userId}`;
}

async function createSession(userId, token) {
  await redis.set(sessionKey(userId), token, "EX", SESSION_TTL_SECONDS);
}

async function getSession(userId) {
  return redis.get(sessionKey(userId));
}

async function destroySession(userId) {
  await redis.del(sessionKey(userId));
}

module.exports = { createSession, getSession, destroySession, SESSION_TTL_SECONDS };
