import mongoose from "mongoose"

// Q. WHY IS CONNECTING SEPARATE FROM app.js, INSTEAD OF JUST CALLING
//    mongoose.connect() AT THE TOP OF app.js LIKE MOST PROJECTS IN THIS
//    REPO DO?
// ANS: Integration tests (test/integration/cartApi.integration.test.js)
// need to control the connection lifecycle themselves - connect to a test
// database in beforeAll, disconnect in afterAll - without also starting a
// real HTTP server (they exercise the Express app in-memory via
// supertest, see that file's own Q&A for why). Exporting connect/
// disconnect as functions lets both server.js (real runtime) and the test
// suite (test runtime) drive the same connection logic against different
// database URLs, instead of duplicating it or fighting over a
// module-level side effect.
export async function connectDB(uri) {
  await mongoose.connect(uri)
}

export async function disconnectDB() {
  await mongoose.disconnect()
}
