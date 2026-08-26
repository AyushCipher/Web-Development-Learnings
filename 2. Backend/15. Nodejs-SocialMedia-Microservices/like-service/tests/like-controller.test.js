jest.mock("../src/models/Like");
jest.mock("../src/utils/rabbitmq");

const Like = require("../src/models/Like");
const { publishEvent } = require("../src/utils/rabbitmq");
const {
  toggleLike,
  getLikeCount,
  getMyLikeStatus,
} = require("../src/controllers/like-controller");

function mockFetchOk(body) {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  });
}

function mockFetchNotFound() {
  return jest.fn().mockResolvedValue({
    ok: false,
    status: 404,
    json: async () => ({ success: false, message: "Post not found" }),
  });
}

describe("like-controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    publishEvent.mockResolvedValue();

    Like.findOne = jest.fn();
    Like.create = jest.fn();
    Like.deleteOne = jest.fn();

    req = {
      user: { userId: "user1" },
      params: {},
      redisClient: {
        incr: jest.fn(),
        decr: jest.fn(),
        get: jest.fn(),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    process.env.POST_SERVICE_URL = "http://post-service:3002";
  });

  describe("toggleLike", () => {
    it("likes a post that exists and isn't yet liked by this user", async () => {
      req.params.postId = "post1";
      global.fetch = mockFetchOk({ _id: "post1", user: "owner1" });
      Like.findOne.mockResolvedValue(null);
      Like.create.mockResolvedValue({ post: "post1", user: "user1" });

      await toggleLike(req, res);

      expect(Like.create).toHaveBeenCalledWith({
        post: "post1",
        user: "user1",
      });
      expect(req.redisClient.incr).toHaveBeenCalledWith("likes:count:post1");
      expect(publishEvent).toHaveBeenCalledWith(
        "post.liked",
        expect.objectContaining({
          postId: "post1",
          actorUserId: "user1",
          postOwnerId: "owner1",
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, liked: true })
      );
    });

    it("liking your own post creates the Like but does not publish an event", async () => {
      req.params.postId = "post1";
      req.user.userId = "owner1";
      global.fetch = mockFetchOk({ _id: "post1", user: "owner1" });
      Like.findOne.mockResolvedValue(null);
      Like.create.mockResolvedValue({ post: "post1", user: "owner1" });

      await toggleLike(req, res);

      expect(Like.create).toHaveBeenCalled();
      expect(req.redisClient.incr).toHaveBeenCalledWith("likes:count:post1");
      expect(publishEvent).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, liked: true })
      );
    });

    it("unliking an already-liked post deletes the Like, decrements Redis, and publishes nothing", async () => {
      req.params.postId = "post1";
      global.fetch = mockFetchOk({ _id: "post1", user: "owner1" });
      Like.findOne.mockResolvedValue({ _id: "like1", post: "post1", user: "user1" });
      Like.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await toggleLike(req, res);

      expect(Like.deleteOne).toHaveBeenCalledWith({ _id: "like1" });
      expect(req.redisClient.decr).toHaveBeenCalledWith("likes:count:post1");
      expect(Like.create).not.toHaveBeenCalled();
      expect(publishEvent).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, liked: false })
      );
    });

    it("returns 404 and creates no Like when the post does not exist in post-service", async () => {
      req.params.postId = "missing";
      global.fetch = mockFetchNotFound();

      await toggleLike(req, res);

      expect(Like.create).not.toHaveBeenCalled();
      expect(req.redisClient.incr).not.toHaveBeenCalled();
      expect(publishEvent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Post not found" })
      );
    });

    it("returns 404 when the post-service call itself fails (network error)", async () => {
      req.params.postId = "post1";
      global.fetch = jest.fn().mockRejectedValue(new Error("ECONNREFUSED"));

      await toggleLike(req, res);

      expect(Like.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getLikeCount", () => {
    it("returns the redis value as a number", async () => {
      req.params.postId = "post1";
      req.redisClient.get.mockResolvedValue("7");

      await getLikeCount(req, res);

      expect(req.redisClient.get).toHaveBeenCalledWith("likes:count:post1");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, count: 7 })
      );
    });

    it("defaults to 0 when the key is missing", async () => {
      req.params.postId = "post1";
      req.redisClient.get.mockResolvedValue(null);

      await getLikeCount(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, count: 0 })
      );
    });
  });

  describe("getMyLikeStatus", () => {
    it("returns liked: true when a Like exists for this user/post", async () => {
      req.params.postId = "post1";
      Like.findOne.mockResolvedValue({ _id: "like1" });

      await getMyLikeStatus(req, res);

      expect(Like.findOne).toHaveBeenCalledWith({
        post: "post1",
        user: "user1",
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, liked: true })
      );
    });

    it("returns liked: false when no Like exists", async () => {
      req.params.postId = "post1";
      Like.findOne.mockResolvedValue(null);

      await getMyLikeStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, liked: false })
      );
    });
  });
});
