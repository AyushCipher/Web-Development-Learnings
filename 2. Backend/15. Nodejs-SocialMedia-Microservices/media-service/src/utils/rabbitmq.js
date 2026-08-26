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
// failing for the rest of the process's life.
async function publishEvent(routingKey, message) {
  if (!channel) {
    await connectToRabbitMQ();
  }

  // Q. WHY CHECK channel AGAIN HERE, RIGHT AFTER JUST CALLING
  //    connectToRabbitMQ() ABOVE?
  // ANS: connectToRabbitMQ() swallows its own connection errors (logs them,
  // doesn't rethrow) so a broker outage doesn't crash the whole process -
  // but that also means `channel` can still be null immediately after this
  // call if RabbitMQ genuinely isn't reachable. Without this check,
  // channel.publish() below would throw "Cannot read properties of null",
  // which - since this runs AFTER the caller's database write already
  // succeeded - would turn a working create/update into a reported
  // failure (found live-testing post-service's identical pattern:
  // MongoDB had the new document, but the API said the request failed).
  // Publishing to RabbitMQ is fire-and-forget messaging for OTHER
  // services to react to later - it failing shouldn't undo or hide that
  // the primary write already succeeded.
  if (!channel) {
    logger.error(`Could not publish "${routingKey}" - RabbitMQ unavailable`);
    return;
  }

  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published: ${routingKey}`);
}


// Q. WHY DOES A FAILED consumeEvent() NEED TO BE HANDLED DIFFERENTLY FROM A
//    FAILED publishEvent()?
// ANS: publishEvent() runs mid-request, so a null channel just fails that
// one publish (see the fix above). consumeEvent() runs ONCE, during
// server.js's startServer(), BEFORE app.listen() - a thrown
// "Cannot read properties of null (reading 'assertQueue')" here doesn't
// just fail one thing, it aborts the entire startup sequence. Live-testing
// this confirmed it: with RabbitMQ unreachable, the process logged the
// error and never reached app.listen() at all - the whole service was
// down, not degraded, over what's an intermittent, often-transient broker
// connectivity issue. Logging and returning early here instead lets the
// server still come up and serve every non-RabbitMQ-dependent route
// (uploads, health checks, etc.); the event subscription simply won't be
// active until a future call succeeds.
async function consumeEvent(routingKey, callback) {
  if (!channel) {
    await connectToRabbitMQ();
  }

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

module.exports = { connectToRabbitMQ, publishEvent, consumeEvent, isConnected };
