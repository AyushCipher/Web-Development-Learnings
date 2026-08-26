require("dotenv").config();
const kafka = require("../config/kafka");
const { USER_REGISTERED } = require("../config/topics");

// Q. THE BROKER HAS KAFKA_AUTO_CREATE_TOPICS_ENABLE=true (see
//    docker-compose.yml) - WHY BOTHER WITH THIS SCRIPT AT ALL?
// ANS: Auto-creation is a convenience for not crashing the first time a
// producer/consumer touches a topic that doesn't exist yet - but it always
// creates the topic with just 1 partition. Partition count controls how
// much a topic can be parallelized across consumers within a group and
// can't be safely changed later without breaking the ordering guarantee
// for any key already in use (see userEvents.producer.js for why messages
// are keyed by email). A real deployment creates topics explicitly, with a
// deliberate partition count chosen up front - this script is that step,
// run once via `npm run create-topics` before anything else.

async function run() {
  const admin = kafka.admin();
  await admin.connect();

  console.log(`Creating topic [${USER_REGISTERED}]...`);
  await admin.createTopics({
    topics: [{ topic: USER_REGISTERED, numPartitions: 3 }],
  });
  console.log(`Topic [${USER_REGISTERED}] ready.`);

  await admin.disconnect();
}

run().catch((err) => {
  console.error("Failed to create topics", err);
  process.exit(1);
});
