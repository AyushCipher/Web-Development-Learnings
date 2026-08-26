require("dotenv").config();
const { Worker } = require("bullmq");
const { connection } = require("./queues/email.queue");
const sendWelcomeEmail = require("./utils/sendEmail");

// Run this as its OWN process, separate from server.js:
//   npm run worker
// This is deliberate - in a real deployment the API server and the job
// worker scale independently (you might run 5 API servers but only 1
// worker, or the other way around for a very email-heavy app).

// Q. HOW DOES THE WORKER KNOW WHICH JOBS TO PICK UP?
// ANS: A Worker attaches to the exact same queue NAME ("email-queue") that
// the Queue producer in queues/email.queue.js pushes onto - that shared
// name plus the shared Redis instance is the only thing connecting them.

const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log(`Processing job ${job.id} (${job.name})`);
    const { email, name } = job.data;
    await sendWelcomeEmail(email, name);
  },
  { connection }
);

worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`Job ${job && job.id} failed:`, err.message));

console.log("Email worker started, waiting for jobs...");
