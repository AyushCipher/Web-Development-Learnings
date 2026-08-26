const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const User = require("../src/models/User");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("User model pre-save hook", () => {
  it("resolves when saving a user with a plaintext password (regression test)", async () => {
    const user = new User({
      username: "johndoe",
      email: "john@example.com",
      password: "plaintext123",
    });

    await expect(user.save()).resolves.toBeDefined();
  });

  it("hashes the password so it is not stored as plaintext", async () => {
    const user = new User({
      username: "janedoe",
      email: "jane@example.com",
      password: "plaintext123",
    });

    await user.save();

    expect(user.password).not.toBe("plaintext123");
  });

  it("comparePassword resolves true for the correct password", async () => {
    const user = new User({
      username: "alice",
      email: "alice@example.com",
      password: "plaintext123",
    });

    await user.save();

    await expect(user.comparePassword("plaintext123")).resolves.toBe(true);
  });

  it("comparePassword resolves false for an incorrect password", async () => {
    const user = new User({
      username: "bob",
      email: "bob@example.com",
      password: "plaintext123",
    });

    await user.save();

    await expect(user.comparePassword("wrongpassword")).resolves.toBe(false);
  });
});
