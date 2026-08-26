const kafka = require("../config/kafka");
const { USER_REGISTERED } = require("../config/topics");

const producer = kafka.producer();
let isConnected = false;

async function ensureConnected() {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
  }
}

// Q. WHY PASS A "key" INSTEAD OF JUST SENDING THE MESSAGE?
// ANS: A topic with multiple partitions (see createTopics.js - this one
// has 3) spreads its messages across them for throughput, but Kafka only
// guarantees message ORDER within a single partition, not across the whole
// topic. Keying every message for the same user by their email makes
// Kafka route all of that user's events to the same partition every time,
// so anyone consuming this topic sees THAT user's events in the order
// they actually happened - without needing every user's events globally
// ordered against each other, which would mean giving up the whole point
// of having multiple partitions.
async function publishUserRegistered({ userId, name, email }) {
  await ensureConnected();

  await producer.send({
    topic: USER_REGISTERED,
    messages: [
      {
        key: email,
        value: JSON.stringify({ userId, name, email, registeredAt: new Date().toISOString() }),
      },
    ],
  });
}

module.exports = { publishUserRegistered, producer };
