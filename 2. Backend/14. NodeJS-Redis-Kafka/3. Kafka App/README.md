# Kafka Pub/Sub via a Signup Event

One signup, two independent reactions: an email consumer and a notification
consumer, neither aware the other exists. This is what makes Kafka
different from a job queue like `BullMQ` (used in the sibling
`14. NodeJS-Redis-Kafka/2. Redis` project) - see the "Q. ... ANS: ..."
comment at the top of `src/consumers/email.consumer.js` for the actual
mechanics of why both consumers get their own full copy of every event
instead of splitting the work between them.

## Run it

```bash
docker compose up -d      # starts Kafka (KRaft, single-node) + MongoDB
cp .env.example .env
npm install
npm run create-topics      # creates the user.registered topic (3 partitions)
npm start                  # API on :4000
```

In two **more** terminals, start both consumers - they're independent
processes on purpose:

```bash
npm run consumer:email
npm run consumer:notification
```

## Try it

```bash
curl -X POST localhost:4000/api/signup -H "Content-Type: application/json" \
  -d '{"name":"Ayush","email":"ayush@example.com"}'
```

Watch both consumer terminals - the SAME signup produces a log line in
`consumer:email` (~2 seconds later, simulating a slow send) and a
persisted `Notification` document logged by `consumer:notification`,
independently of each other.

## Deliberate simplifications

- **No real email provider.** `sendWelcomeEmail` is a delay plus a
  `console.log`, same honest approach as `2. Redis`'s `sendEmail.js`.
- **No user persistence or auth.** `POST /api/signup` only validates input
  and publishes an event - the point of this project is the Kafka fan-out,
  not a real signup/auth system (that already exists elsewhere in this
  repo, in `2. Redis` and `15. Nodejs-microservices`).
