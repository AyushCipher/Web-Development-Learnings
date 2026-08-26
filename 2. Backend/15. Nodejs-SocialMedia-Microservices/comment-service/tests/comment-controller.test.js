jest.mock("../src/models/Comment");
jest.mock("../src/utils/rabbitmq");

const Comment = require("../src/models/Comment");
const { publishEvent } = require("../src/utils/rabbitmq");
const {
  createComment,
  getComments,
  deleteComment,
} = require("../src/controllers/comment-controller");

describe("comment-controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    publishEvent.mockResolvedValue();

    // Explicitly control the constructor + prototype/static methods so
    // behaviour doesn't depend on automock internals for mongoose models.
    Comment.mockImplementation(function (data) {
      this.post = data.post;
      this.user = data.user;
      this.text = data.text;
      this._id = "comment123";
      this.createdAt = new Date();
    });
    Comment.prototype.save = jest.fn();
    Comment.find = jest.fn();
    Comment.countDocuments = jest.fn();
    Comment.findById = jest.fn();
    Comment.findByIdAndDelete = jest.fn();

    req = {
      user: { userId: "user1" },
      body: {},
      params: {},
      query: {},
      requestId: "req-1",
      redisClient: {
        get: jest.fn(),
        setex: jest.fn(),
        del: jest.fn(),
        keys: jest.fn().mockResolvedValue([]),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  describe("createComment", () => {
    it("creates a comment on a valid post and publishes post.commented when the commenter isn't the owner", async () => {
      req.params.postId = "post1";
      req.body = { text: "Nice post!" };

      global.fetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ _id: "post1", user: "owner1", content: "hi" }),
      });
      Comment.prototype.save.mockResolvedValue();

      await createComment(req, res);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/posts/post1"),
        expect.objectContaining({
          headers: expect.objectContaining({ "x-user-id": "user1" }),
        })
      );
      expect(Comment.prototype.save).toHaveBeenCalled();
      expect(req.redisClient.keys).toHaveBeenCalledWith("comments:post1:*");
      expect(publishEvent).toHaveBeenCalledWith(
        "post.commented",
        expect.objectContaining({
          postId: "post1",
          actorUserId: "user1",
          postOwnerId: "owner1",
          commentText: "Nice post!",
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("creates a comment on your own post but does not publish an event", async () => {
      req.params.postId = "post1";
      req.body = { text: "My own post comment" };

      global.fetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ _id: "post1", user: "user1" }),
      });
      Comment.prototype.save.mockResolvedValue();

      await createComment(req, res);

      expect(Comment.prototype.save).toHaveBeenCalled();
      expect(publishEvent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns 404 and creates no comment when the post doesn't exist", async () => {
      req.params.postId = "missing";
      req.body = { text: "Hello?" };

      global.fetch.mockResolvedValue({
        status: 404,
        ok: false,
      });

      await createComment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(Comment.prototype.save).not.toHaveBeenCalled();
      expect(publishEvent).not.toHaveBeenCalled();
    });

    it("returns 400 for an invalid body and never calls post-service", async () => {
      req.params.postId = "post1";
      req.body = { text: "" };

      await createComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(Comment.prototype.save).not.toHaveBeenCalled();
    });
  });

  describe("getComments", () => {
    it("queries the database and caches the result on a cache miss", async () => {
      req.params.postId = "post1";
      req.query = { page: "1", limit: "10" };
      req.redisClient.get.mockResolvedValue(null);

      const mockComments = [{ _id: "c1" }, { _id: "c2" }];
      const chainable = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockComments),
      };
      Comment.find.mockReturnValue(chainable);
      Comment.countDocuments.mockResolvedValue(2);

      await getComments(req, res);

      expect(Comment.find).toHaveBeenCalledWith({ post: "post1" });
      expect(req.redisClient.setex).toHaveBeenCalledWith(
        "comments:post1:1:10",
        300,
        expect.any(String)
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ comments: mockComments, totalComments: 2 })
      );
    });

    it("returns the cached result on a cache hit without querying the database", async () => {
      req.params.postId = "post1";
      const cached = { comments: [{ _id: "c1" }], totalComments: 1 };
      req.redisClient.get.mockResolvedValue(JSON.stringify(cached));

      await getComments(req, res);

      expect(Comment.find).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(cached);
    });
  });

  describe("deleteComment", () => {
    it("deletes the comment when requested by its author", async () => {
      req.params.commentId = "comment1";
      const mockComment = { _id: "comment1", user: "user1", post: "post1" };
      Comment.findById.mockResolvedValue(mockComment);
      Comment.findByIdAndDelete.mockResolvedValue(mockComment);

      await deleteComment(req, res);

      expect(Comment.findByIdAndDelete).toHaveBeenCalledWith("comment1");
      expect(req.redisClient.keys).toHaveBeenCalledWith("comments:post1:*");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: "Comment deleted" })
      );
    });

    it("returns 403 when a different user tries to delete the comment", async () => {
      req.params.commentId = "comment1";
      req.user.userId = "user2";
      const mockComment = { _id: "comment1", user: "user1", post: "post1" };
      Comment.findById.mockResolvedValue(mockComment);

      await deleteComment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(Comment.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("returns 404 when the comment doesn't exist", async () => {
      req.params.commentId = "missing";
      Comment.findById.mockResolvedValue(null);

      await deleteComment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(Comment.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});
