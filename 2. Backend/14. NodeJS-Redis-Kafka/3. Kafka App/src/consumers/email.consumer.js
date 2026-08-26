require("dotenv").config();
const kafka = require("../config/kafka");
const { USER_REGISTERED } = require("../config/topics");

// Q. THIS AND notification.consumer.js BOTH SUBSCRIBE TO THE SAME TOPIC -
//    WON'T THEY STEAL EACH OTHER'S MESSAGES, LIKE TWO BullMQ WORKERS WOULD?
// ANS: No - and this is the actual point of this project. Each consumer
// below has its OWN, DIFFERENT `groupId` ("email-service" here,
// "notification-service" in the other file). Kafka's rule is: within one
// consumer group, a message goes to only ONE member (that's how you'd
// scale a single consumer horizontally). ACROSS different groups, every
// group gets its own independent copy of every message. So both of these
// processes receive every single signup - this is the same "many
// independent things react to one event" behavior Pub/Sub gives you, but
// with messages persisted on disk (a Kafka topic is a durable log), so a
// consumer that was offline when the message was published still gets it
// once it reconnects - a real difference from a live-only Pub/Sub sub.

const consumer = kafka.consumer({ groupId: "email-service" });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: USER_REGISTERED, fromBeginning: true });

  console.log("Email consumer waiting for user.registered events...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      await sendWelcomeEmail(event);
    },
  });
}

// Same honest simplification as `2. Redis`'s src/utils/sendEmail.js - a
// delay plus a log line, not a real email provider.
async function sendWelcomeEmail({ name, email }) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`[EMAIL] Welcome email sent to ${email} (${name})`);
}

run().catch((err) => {
  console.error("Email consumer crashed", err);
  process.exit(1);
});
