const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;

// Q. WHY A "TOPIC" EXCHANGE NAMED facebook_events INSTEAD OF SENDING EVENTS
//    DIRECTLY TO EACH SERVICE THAT CARES?
// ANS: A topic exchange lets publishers stay completely unaware of who's
// listening - post-service publishes "post.created"/"post.deleted" without
// knowing search-service or media-service exist. Any service can start
// consuming a routing key later (or stop) with zero changes to the
// publisher. That decoupling is the whole point of using RabbitMQ here
// instead of one service calling another's API directly.
const EXCHANGE_NAME = "facebook_events";

async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to rabbit mq");
    return channel;
  } catch (e) {
    logger.error("Error connecting to rabbit mq", e);
  }
}

// Q. WHY DOES THIS RECONNECT IF `channel` IS NULL INSTEAD OF JUST FAILING?
// ANS: connectToRabbitMQ() is called once at startup, but if that initial
// attempt happened before RabbitMQ was fully ready (a real race in
// docker-compose, where containers start in parallel), `channel` would stay
// null forever without this fallback - the first publish/consume attempt
// gets one more chance to establish the connection instead of silently
// failing for the rest of the process's life. (This service only consumes
// events, so the reconnect guard lives here instead of in publishEvent.)
async function consumeEvent(routingKey, callback) {
  if (!channel) {
    await connectToRabbitMQ();
  }

  // Q. WHY CHECK channel AGAIN HERE, RIGHT AFTER JUST CALLING
  //    connectToRabbitMQ() ABOVE?
  // ANS: connectToRabbitMQ() swallows its own connection errors, so
  // `channel` can still be null right after this call if RabbitMQ
  // genuinely isn't reachable. Without this check, channel.assertQueue()
  // below throws "Cannot read properties of null" - and since
  // consumeEvent() runs during server.js's startup, BEFORE app.listen(),
  // that crash aborts the entire startup sequence rather than failing one
  // request. Confirmed live: media-service's identical pattern crashed
  // before ever binding its port when RabbitMQ was unreachable. Logging
  // and returning early instead lets the server still come up and serve
  // its non-RabbitMQ-dependent routes.
  if (!channel) {
    logger.error(`Could not subscribe to "${routingKey}" - RabbitMQ unavailable`);
    return;
  }

  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      callback(content);
      channel.ack(msg);
    }
  });

  logger.info(`Subscribed to event: ${routingKey}`);
}

function isConnected() {
  return !!channel;
}

module.exports = { connectToRabbitMQ, consumeEvent, isConnected };
