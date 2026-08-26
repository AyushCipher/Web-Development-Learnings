// One place to name topics, so a typo in a topic string doesn't silently
// create a producer and a consumer that never actually talk to each other
// (Kafka won't error on a topic-name mismatch - the consumer would just
// wait forever for messages that are going to a differently-named topic).
const USER_REGISTERED = "user.registered";

module.exports = { USER_REGISTERED };
