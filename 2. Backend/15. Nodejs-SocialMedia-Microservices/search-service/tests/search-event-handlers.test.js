jest.mock("../src/models/Search");
jest.mock("../src/utils/redisClient", () => ({
  keys: jest.fn().mockResolvedValue(["search:foo"]),
  del: jest.fn(),
}));

const Search = require("../src/models/Search");
const redisClient = require("../src/utils/redisClient");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("../src/eventHandlers/search-event-handlers");

describe("search-event-handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    redisClient.keys.mockResolvedValue(["search:foo"]);
  });

  it("handlePostCreated saves the post and invalidates the cache", async () => {
    Search.prototype.save = jest.fn().mockResolvedValue({ _id: "abc123" });

    await handlePostCreated({
      postId: "1",
      userId: "u1",
      content: "hello world",
      createdAt: new Date(),
    });

    expect(Search.prototype.save).toHaveBeenCalled();
    expect(redisClient.keys).toHaveBeenCalledWith("search:*");
    expect(redisClient.del).toHaveBeenCalledWith(["search:foo"]);
  });

  it("handlePostDeleted removes the post and invalidates the cache", async () => {
    Search.findOneAndDelete = jest.fn().mockResolvedValue({ postId: "1" });

    await handlePostDeleted({ postId: "1" });

    expect(Search.findOneAndDelete).toHaveBeenCalledWith({ postId: "1" });
    expect(redisClient.keys).toHaveBeenCalledWith("search:*");
    expect(redisClient.del).toHaveBeenCalledWith(["search:foo"]);
  });
});
