require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const { publishUserRegistered } = require("./producers/userEvents.producer");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Q. WHY DOESN'T THIS ROUTE SAVE THE USER ANYWHERE OR CHECK FOR DUPLICATES?
// ANS: On purpose - this project exists to demonstrate Kafka pub/sub, not
// to be a real signup/auth system (that's what
// `14. NodeJS-Redis-Kafka/2. Redis` and `15. Nodejs-microservices` already
// are, elsewhere in this repo). Keeping this route to "validate input,
// publish an event, respond" keeps the actual point - one event, two
// independent consumers reacting to it - the whole focus, instead of
// getting buried under an unrelated user-management feature.
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "name and email are required" });
    }

    const userId = crypto.randomUUID();

    // Q. WHY PUBLISH THE EVENT BEFORE RESPONDING, INSTEAD OF AFTER?
    // ANS: `publishUserRegistered` only waits for Kafka to ACKNOWLEDGE the
    // message was written to the topic (fast - milliseconds) - it does NOT
    // wait for the email or notification consumers to actually process it
    // (that happens later, independently, in their own processes). So
    // awaiting the publish here is still "respond immediately," not "wait
    // for the slow work" - the slow work (email.consumer.js's simulated
    // 2-second send) never blocks this request at all.
    await publishUserRegistered({ userId, name, email });

    return res.status(201).json({ success: true, userId });
  } catch (error) {
    console.error("Signup error", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Kafka app running on http://localhost:${PORT}`);
  console.log(`Run "npm run consumer:email" and "npm run consumer:notification" in other terminals to see the fan-out.`);
});
