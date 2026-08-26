const mockSend = jest.fn().mockResolvedValue();
const mockConnect = jest.fn().mockResolvedValue();

jest.mock("kafkajs", () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    producer: () => ({ connect: mockConnect, send: mockSend }),
  })),
}));

describe("publishUserRegistered", () => {
  beforeEach(() => {
    jest.resetModules();
    mockSend.mockClear();
    mockConnect.mockClear();
  });

  it("connects once and sends to the user.registered topic, keyed by email", async () => {
    const { publishUserRegistered } = require("../src/producers/userEvents.producer");

    await publishUserRegistered({ userId: "u1", name: "Ayush", email: "ayush@example.com" });

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      topic: "user.registered",
      messages: [
        expect.objectContaining({
          key: "ayush@example.com",
          value: expect.stringContaining('"userId":"u1"'),
        }),
      ],
    });
  });

  it("does not reconnect on a second publish from the same process", async () => {
    const { publishUserRegistered } = require("../src/producers/userEvents.producer");

    await publishUserRegistered({ userId: "u2", name: "Someone", email: "someone@example.com" });
    await publishUserRegistered({ userId: "u3", name: "Someone Else", email: "else@example.com" });

    expect(mockConnect).toHaveBeenCalledTimes(1); // only on the first of the two publishes
    expect(mockSend).toHaveBeenCalledTimes(2);
  });
});
