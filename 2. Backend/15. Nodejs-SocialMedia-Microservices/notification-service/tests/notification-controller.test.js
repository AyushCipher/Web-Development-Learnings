jest.mock("../src/models/Notification");

const Notification = require("../src/models/Notification");
const {
  listNotifications,
  markAsRead,
} = require("../src/controllers/notification-controller");

describe("notification-controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    Notification.find = jest.fn();
    Notification.countDocuments = jest.fn();
    Notification.findById = jest.fn();

    req = {
      user: { userId: "user1" },
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("listNotifications", () => {
    it("returns paginated notifications for the requesting user", async () => {
      req.query = { page: "1", limit: "10" };

      const mockNotifications = [{ _id: "n1" }, { _id: "n2" }];
      const chainable = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockNotifications),
      };
      Notification.find.mockReturnValue(chainable);
      Notification.countDocuments.mockResolvedValue(2);

      await listNotifications(req, res);

      expect(Notification.find).toHaveBeenCalledWith({ recipient: "user1" });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          notifications: mockNotifications,
          currentPage: 1,
          totalPages: 1,
          totalNotifications: 2,
        })
      );
    });

    it("returns 500 (not an uncaught exception) when the query rejects", async () => {
      Notification.find.mockImplementation(() => {
        throw new Error("db down");
      });

      await expect(listNotifications(req, res)).resolves.not.toThrow();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("markAsRead", () => {
    it("marks the notification as read when it belongs to the requester", async () => {
      req.params.id = "notif1";
      const mockNotification = {
        _id: "notif1",
        recipient: { toString: () => "user1" },
        read: false,
        save: jest.fn().mockResolvedValue(),
      };
      Notification.findById.mockResolvedValue(mockNotification);

      await markAsRead(req, res);

      expect(mockNotification.read).toBe(true);
      expect(mockNotification.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, notification: mockNotification })
      );
    });

    it("returns 404 when the notification does not exist", async () => {
      req.params.id = "missing";
      Notification.findById.mockResolvedValue(null);

      await markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 404 (not 403) when the notification belongs to a different user", async () => {
      req.params.id = "notif1";
      const mockNotification = {
        _id: "notif1",
        recipient: { toString: () => "someoneElse" },
        read: false,
        save: jest.fn(),
      };
      Notification.findById.mockResolvedValue(mockNotification);

      await markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(mockNotification.save).not.toHaveBeenCalled();
    });
  });
});
