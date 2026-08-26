jest.mock("../src/models/Notification");

const Notification = require("../src/models/Notification");
const {
  handlePostLiked,
  handlePostCommented,
} = require("../src/eventHandlers/notification-event-handlers");

describe("notification-event-handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Notification.mockImplementation(function (data) {
      this.recipient = data.recipient;
      this.actor = data.actor;
      this.type = data.type;
      this.post = data.post;
      this.message = data.message;
      this._id = "notif123";
    });
    Notification.prototype.save = jest.fn();
  });

  describe("handlePostLiked", () => {
    it("creates a like notification for the post owner", async () => {
      Notification.prototype.save.mockResolvedValue();

      await handlePostLiked({
        postId: "post1",
        actorUserId: "actor1",
        postOwnerId: "owner1",
      });

      expect(Notification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: "owner1",
          actor: "actor1",
          type: "like",
          post: "post1",
        })
      );
      expect(Notification.prototype.save).toHaveBeenCalled();
    });

    it("does not throw when save rejects", async () => {
      Notification.prototype.save.mockRejectedValue(new Error("db down"));

      await expect(
        handlePostLiked({
          postId: "post1",
          actorUserId: "actor1",
          postOwnerId: "owner1",
        })
      ).resolves.not.toThrow();
    });
  });

  describe("handlePostCommented", () => {
    it("creates a comment notification for the post owner", async () => {
      Notification.prototype.save.mockResolvedValue();

      await handlePostCommented({
        postId: "post1",
        actorUserId: "actor1",
        postOwnerId: "owner1",
        commentText: "nice post!",
      });

      expect(Notification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: "owner1",
          actor: "actor1",
          type: "comment",
          post: "post1",
        })
      );
      expect(Notification.prototype.save).toHaveBeenCalled();
    });

    it("does not throw when save rejects", async () => {
      Notification.prototype.save.mockRejectedValue(new Error("db down"));

      await expect(
        handlePostCommented({
          postId: "post1",
          actorUserId: "actor1",
          postOwnerId: "owner1",
          commentText: "nice post!",
        })
      ).resolves.not.toThrow();
    });
  });
});
