process.env.JWT_SECRET = "test-jwt-secret";

const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const { io: ioClient } = require("socket.io-client");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const { initChatSocket } = require("../src/socket/chatSocket");

jest.setTimeout(30000);

const USER_A = "507f1f77bcf86cd799439011";
const USER_B = "507f1f77bcf86cd799439012";

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

describe("chatSocket", () => {
  let mongod;
  let server;
  let port;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    // Build a minimal real http + socket.io server the same way server.js
    // does, so this test exercises the real handshake auth and real
    // Mongo-backed Message model instead of mocking either.
    const app = express();
    server = http.createServer(app);
    const io = new Server(server, { cors: { origin: "*" } });
    initChatSocket(io);

    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await mongod.stop();
  });

  function connectClient(token) {
    return ioClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ["websocket"],
      forceNew: true,
    });
  }

  it("rejects a handshake without a valid token", (done) => {
    const client = connectClient("not-a-real-token");

    client.on("connect_error", (err) => {
      expect(err.message).toBe("Authentication failed");
      client.close();
      done();
    });

    client.on("connect", () => {
      client.close();
      done(new Error("expected the connection to be rejected"));
    });
  });

  it("delivers a message live from one authenticated user to another", (done) => {
    const clientA = connectClient(signToken(USER_A));
    const clientB = connectClient(signToken(USER_B));

    let aConnected = false;
    let bConnected = false;

    function trySend() {
      if (!aConnected || !bConnected) return;

      clientA.emit(
        "send-message",
        { toUserId: USER_B, text: "hello there" },
        (ack) => {
          expect(ack.success).toBe(true);
          expect(ack.message.text).toBe("hello there");
        }
      );
    }

    clientB.on("new-message", (message) => {
      expect(message.text).toBe("hello there");
      expect(message.sender).toBe(USER_A);
      expect(message.recipient).toBe(USER_B);
      clientA.close();
      clientB.close();
      done();
    });

    clientA.on("connect", () => {
      aConnected = true;
      trySend();
    });

    clientB.on("connect", () => {
      bConnected = true;
      trySend();
    });

    clientA.on("connect_error", (err) => done(err));
    clientB.on("connect_error", (err) => done(err));
  });
});
