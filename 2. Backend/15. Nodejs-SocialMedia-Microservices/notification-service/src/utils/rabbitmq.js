const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;

// Q. WHY A "TOPIC" EXCHANGE NAMED facebook_events INSTEAD OF THIS SERVICE
//    POLLING OR BEING CALLED DIRECTLY BY like-service/comment-service?
// ANS: This service is built entirely around REACTING to events it
// subscribes to (post.liked, post.commented) - it never makes an outbound
// HTTP call to anything. like-service/comment-service publish those events
// without knowing this service exists at all; this service could go down
// and come back up later and simply resume consuming from where the
// exchange picks back up, with zero coordination needed with the publishers.
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

// Q. HOW DOES THIS SERVICE KNOW WHICH EVENTS TO PICK UP?
// ANS: consumeEvent subscribes to a specific routing key (post.liked,
// post.commented - see server.js for where these are registered) on the
// same facebook_events exchange every publisher in this system uses. The
// routing key name is the only thing connecting a publisher to this
// consumer - there's no other configuration linking them.
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
