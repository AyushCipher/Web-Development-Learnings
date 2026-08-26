const { Queue } = require("bullmq");
const Redis = require("ioredis");

// Q. WHY NOT JUST CALL sendWelcomeEmail() DIRECTLY INSIDE THE SIGNUP ROUTE?
// ANS: Sending an email can take a second or more (a network call to an
// email provider). If POST /signup awaited that directly, the user would
// sit there waiting for an email to send before they even see "signup
// successful". Instead we push a small JOB describing what needs to happen
// ("send-welcome-email" for this address) onto a Redis-backed queue and
// respond immediately. A separate WORKER process (src/worker.js) picks up
// jobs from that same queue and does the actual (slow) sending in the
// background - this producer/consumer split is the same idea as Redis
// Pub/Sub, with the added guarantee that jobs aren't lost if no worker
// happens to be running at that exact moment (BullMQ persists them in
// Redis until a worker takes them, unlike plain Pub/Sub which only
// delivers to subscribers who are listening right now).

// BullMQ requires this exact option on its Redis connection - without it,
// BullMQ throws on startup. Worth calling out since it's an easy gotcha.
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const emailQueue = new Queue("email-queue", { connection });

module.exports = { emailQueue, connection };
