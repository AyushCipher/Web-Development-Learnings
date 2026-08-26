jest.mock("../src/models/Message");

const Message = require("../src/models/Message");
const {
  listConversations,
  getMessages,
} = require("../src/controllers/chat-controller");

// Valid-looking Mongo ObjectId hex strings so `new mongoose.Types.ObjectId(...)`
// inside the controller doesn't throw on a fake test id.
const USER_A = "507f1f77bcf86cd799439011";
const USER_B = "507f1f77bcf86cd799439012";

describe("chat-controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    Message.aggregate = jest.fn();
    Message.find = jest.fn();
    Message.countDocuments = jest.fn();

    req = {
      user: { userId: USER_A },
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getMessages", () => {
    it("returns paginated messages for the conversation, oldest first", async () => {
      req.params.otherUserId = USER_B;
      req.query = { page: "1", limit: "20" };

      const mockMessages = [
        { _id: "m1", text: "hi", createdAt: new Date() },
        { _id: "m2", text: "hello", createdAt: new Date() },
      ];
      const chainable = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockMessages),
      };
      Message.find.mockReturnValue(chainable);
      Message.countDocuments.mockResolvedValue(2);

      await getMessages(req, res);

      expect(Message.find).toHaveBeenCalledWith({
        conversationId: [USER_A, USER_B].sort().join(":"),
      });
      expect(chainable.sort).toHaveBeenCalledWith({ createdAt: 1 });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          messages: mockMessages,
          totalMessages: 2,
        })
      );
    });

    it("returns 500 (not an uncaught exception) when the query rejects", async () => {
      req.params.otherUserId = USER_B;
      Message.find.mockImplementation(() => {
        throw new Error("db down");
      });

      await expect(getMessages(req, res)).resolves.not.toThrow();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("listConversations", () => {
    it("returns the most recent message per conversation", async () => {
      const lastMessage = {
        sender: { toString: () => USER_A },
        recipient: USER_B,
        text: "see you then",
        createdAt: new Date(),
      };
      Message.aggregate.mockResolvedValue([
        {
          _id: [USER_A, USER_B].sort().join(":"),
          lastMessage,
        },
      ]);

      await listConversations(req, res);

      expect(Message.aggregate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          conversations: [
            expect.objectContaining({
              conversationId: [USER_A, USER_B].sort().join(":"),
              otherUserId: USER_B,
            }),
          ],
        })
      );
    });

    it("returns 500 (not an uncaught exception) when the aggregation rejects", async () => {
      Message.aggregate.mockRejectedValue(new Error("db down"));

      await expect(listConversations(req, res)).resolves.not.toThrow();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });
});
