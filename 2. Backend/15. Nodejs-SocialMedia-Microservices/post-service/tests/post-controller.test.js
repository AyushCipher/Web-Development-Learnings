jest.mock("../src/models/Post");
jest.mock("../src/utils/rabbitmq");

const Post = require("../src/models/Post");
const { publishEvent } = require("../src/utils/rabbitmq");
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
} = require("../src/controllers/post-controller");

describe("post-controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    publishEvent.mockResolvedValue();

    // Explicitly control the constructor + prototype/static methods so
    // behaviour doesn't depend on automock internals for mongoose models.
    Post.mockImplementation(function (data) {
      this.user = data.user;
      this.content = data.content;
      this.mediaIds = data.mediaIds || [];
      this._id = "post123";
      this.createdAt = new Date();
    });
    Post.prototype.save = jest.fn();
    Post.find = jest.fn();
    Post.countDocuments = jest.fn();
    Post.findById = jest.fn();
    Post.findOneAndDelete = jest.fn();

    req = {
      user: { userId: "user1" },
      body: {},
      params: {},
      query: {},
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
  });

  describe("createPost", () => {
    it("creates a post successfully with a valid body", async () => {
      req.body = { content: "This is a valid post content." };
      Post.prototype.save.mockResolvedValue();

      await createPost(req, res);

      expect(Post.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(publishEvent).toHaveBeenCalledWith(
        "post.created",
        expect.objectContaining({ postId: "post123" })
      );
    });

    it("returns 400 for an invalid body and does not save", async () => {
      req.body = { content: "" };

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(Post.prototype.save).not.toHaveBeenCalled();
    });

    it("returns 500 (not an uncaught exception) when save rejects", async () => {
      req.body = { content: "This is a valid post content." };
      Post.prototype.save.mockRejectedValue(new Error("db down"));

      await expect(createPost(req, res)).resolves.not.toThrow();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("getAllPosts", () => {
    it("queries the database and caches the result on a cache miss", async () => {
      req.query = { page: "1", limit: "10" };
      req.redisClient.get.mockResolvedValue(null);

      const mockPosts = [{ _id: "p1" }, { _id: "p2" }];
      const chainable = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockPosts),
      };
      Post.find.mockReturnValue(chainable);
      Post.countDocuments.mockResolvedValue(2);

      await getAllPosts(req, res);

      expect(Post.find).toHaveBeenCalled();
      expect(req.redisClient.setex).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ posts: mockPosts, totalPosts: 2 })
      );
    });

    it("returns the cached result on a cache hit without querying the database", async () => {
      const cached = { posts: [{ _id: "p1" }], totalPosts: 1 };
      req.redisClient.get.mockResolvedValue(JSON.stringify(cached));

      await getAllPosts(req, res);

      expect(Post.find).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(cached);
    });
  });

  describe("getPost", () => {
    it("caches under the cache key (not the null cached value) on a cache miss", async () => {
      req.params.id = "post1";
      req.redisClient.get.mockResolvedValue(null);

      const mockPost = { _id: "post1", content: "hello" };
      Post.findById.mockResolvedValue(mockPost);

      await getPost(req, res);

      expect(req.redisClient.setex).toHaveBeenCalledWith(
        "post:post1",
        3600,
        JSON.stringify(mockPost)
      );
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it("returns 404 when the post is not found", async () => {
      req.params.id = "missing";
      req.redisClient.get.mockResolvedValue(null);
      Post.findById.mockResolvedValue(null);

      await getPost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deletePost", () => {
    it("deletes a post and publishes post.deleted", async () => {
      req.params.id = "post1";
      const mockPost = { _id: "post1", mediaIds: [] };
      Post.findOneAndDelete.mockResolvedValue(mockPost);

      await deletePost(req, res);

      expect(publishEvent).toHaveBeenCalledWith(
        "post.deleted",
        expect.objectContaining({ postId: "post1" })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Post deleted successfully" })
      );
    });

    it("returns 404 when the post to delete is not found", async () => {
      req.params.id = "missing";
      Post.findOneAndDelete.mockResolvedValue(null);

      await deletePost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
