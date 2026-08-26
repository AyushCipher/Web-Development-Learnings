const { Kafka } = require("kafkajs");

// Q. WHAT'S THE DIFFERENCE BETWEEN THIS AND A REDIS/RABBITMQ CONNECTION
//    (LIKE THE ONES ELSEWHERE IN THIS REPO)?
// ANS: This object doesn't open a connection by itself - `new Kafka(...)`
// just holds the broker address and client id. Producers and consumers
// each open their OWN connection from this shared config when you call
// `.producer()` / `.consumer()` on it (see producers/userEvents.producer.js
// and consumers/*.consumer.js) - that's why every file below imports this
// same `kafka` object instead of each hardcoding the broker address.

// Local dev via docker-compose needs no auth, but a managed cloud broker
// (e.g. Redpanda Cloud/Confluent Cloud) requires SASL over TLS. Only add
// those options when SASL credentials are actually present, so this still
// connects to a plain local broker with zero extra config.
const kafka = new Kafka({
  clientId: "kafka-app",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  ...(process.env.KAFKA_USERNAME && {
    ssl: true,
    sasl: {
      mechanism: process.env.KAFKA_SASL_MECHANISM || "scram-sha-256",
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
  }),
});

module.exports = kafka;
