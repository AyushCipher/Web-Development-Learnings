process.env.JWT_SECRET = "test-secret";

const jwt = require("jsonwebtoken");
const { validateToken } = require("../src/middleware/authMiddleware");

describe("validateToken middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("responds 401 when no authorization header is present", () => {
    validateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next() and attaches req.user for a valid token", async () => {
    const token = jwt.sign(
      { userId: "u1", username: "test" },
      "test-secret"
    );
    req.headers.authorization = `Bearer ${token}`;

    await new Promise((resolve) => {
      next.mockImplementation(resolve);
      validateToken(req, res, next);
    });

    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe("u1");
  });

  test("responds 401 (not 429) for an invalid/malformed token", async () => {
    req.headers.authorization = "Bearer not-a-real-token";

    await new Promise((resolve) => {
      res.json.mockImplementation((...args) => {
        resolve(args);
      });
      validateToken(req, res, next);
    });

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status).not.toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
  });
});
