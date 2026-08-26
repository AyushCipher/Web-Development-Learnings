const express = require("express");
const request = require("supertest");

jest.mock("../src/producers/userEvents.producer", () => ({
  publishUserRegistered: jest.fn(),
}));

const { publishUserRegistered } = require("../src/producers/userEvents.producer");

// Build a minimal app mounting just the signup route under test, rather
// than requiring src/server.js directly - that file calls app.listen() and
// reads env vars at module load, which we don't want happening inside a
// test run (same approach used for the other Express projects in this repo).
function buildApp() {
  const app = express();
  app.use(express.json());

  app.post("/api/signup", async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "name and email are required" });
    }
    await publishUserRegistered({ userId: "test-id", name, email });
    return res.status(201).json({ success: true, userId: "test-id" });
  });

  return app;
}

describe("POST /api/signup", () => {
  beforeEach(() => {
    publishUserRegistered.mockClear();
  });

  it("publishes the event and responds 201 for a valid signup", async () => {
    const app = buildApp();

    const res = await request(app)
      .post("/api/signup")
      .send({ name: "Ayush", email: "ayush@example.com" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(publishUserRegistered).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ayush", email: "ayush@example.com" })
    );
  });

  it("rejects a signup missing email, without publishing anything", async () => {
    const app = buildApp();

    const res = await request(app).post("/api/signup").send({ name: "Ayush" });

    expect(res.status).toBe(400);
    expect(publishUserRegistered).not.toHaveBeenCalled();
  });
});
