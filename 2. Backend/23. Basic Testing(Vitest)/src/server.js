// Q. WHY IS THIS FILE SEPARATE FROM app.js AT ALL?
// ANS: app.js exports the Express app but never calls .listen() or
// connects to Mongo - this file is the only place that does both, and
// it's the file E2E tests actually start (see test/e2e/cartFlow.e2e.test.js).
// Integration tests import app.js directly and never run this file at all
// - they don't need a real port bound, since supertest talks to the
// Express app object in-memory. That split (routes/logic vs. "actually
// run it") is what lets the exact same route code be exercised two
// different ways for two different kinds of test.
import dotenv from "dotenv"
import { app } from "./app.js"
import { connectDB } from "./db.js"

dotenv.config()

const port = process.env.PORT || 4100

async function start() {
  await connectDB(process.env.MONGODB_URI)
  app.listen(port, () => {
    console.log(`server started on port ${port}`)
  })
}

start()
