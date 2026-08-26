require("dotenv").config();
const kafka = require("../config/kafka");
const connectDb = require("../config/db");
const { USER_REGISTERED } = require("../config/topics");
const Notification = require("../models/Notification");

// See the Q&A in email.consumer.js for why this having its own, different
// groupId ("notification-service") is what makes it receive every event
// independently of that consumer, instead of the two splitting the work.
const consumer = kafka.consumer({ groupId: "notification-service" });

async function run() {
  await connectDb();
  await consumer.connect();
  await consumer.subscribe({ topic: USER_REGISTERED, fromBeginning: true });

  console.log("Notification consumer waiting for user.registered events...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      await createWelcomeNotification(event);
    },
  });
}

async function createWelcomeNotification({ userId, name }) {
  await Notification.create({
    userId,
    message: `Welcome, ${name}! Your account is ready.`,
  });
  console.log(`[NOTIFICATION] Created welcome notification for ${userId}`);
}

run().catch((err) => {
  console.error("Notification consumer crashed", err);
  process.exit(1);
});
