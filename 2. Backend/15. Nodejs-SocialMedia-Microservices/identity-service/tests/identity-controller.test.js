jest.mock("../src/models/User");
jest.mock("../src/models/RefreshToken");
jest.mock("../src/utils/generateToken");

const User = require("../src/models/User");
const RefreshToken = require("../src/models/RefreshToken");
const generateTokens = require("../src/utils/generateToken");
const {
  registerUser,
  loginUser,
  refreshTokenUser,
  logoutUser,
} = require("../src/controllers/identity-controller");

const buildRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("registerUser", () => {
  it("registers a new user successfully", async () => {
    const req = {
      body: {
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
      },
    };
    const res = buildRes();

    User.findOne.mockResolvedValue(null);
    User.prototype.save = jest.fn().mockResolvedValue(undefined);
    generateTokens.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("returns 400 when the user already exists", async () => {
    const req = {
      body: {
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
      },
    };
    const res = buildRes();

    User.findOne.mockResolvedValue({ _id: "existing-user" });

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

describe("loginUser", () => {
  it("logs in successfully with a valid password", async () => {
    const req = {
      body: { email: "john@example.com", password: "password123" },
    };
    const res = buildRes();

    User.findOne.mockResolvedValue({
      _id: "user-id",
      comparePassword: jest.fn().mockResolvedValue(true),
    });
    generateTokens.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    await loginUser(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      })
    );
    expect(res.status).not.toHaveBeenCalledWith(400);
  });

  it("returns 400 with 'Invalid password' when the password does not match", async () => {
    const req = {
      body: { email: "john@example.com", password: "wrongpassword" },
    };
    const res = buildRes();

    User.findOne.mockResolvedValue({
      _id: "user-id",
      comparePassword: jest.fn().mockResolvedValue(false),
    });

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid password",
      })
    );
  });

  it("returns 400 with 'Invalid credentials' when the user does not exist", async () => {
    const req = {
      body: { email: "nobody@example.com", password: "password123" },
    };
    const res = buildRes();

    User.findOne.mockResolvedValue(null);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid credentials",
      })
    );
  });
});

describe("refreshTokenUser", () => {
  it("issues new tokens for a valid, unexpired refresh token", async () => {
    const req = { body: { refreshToken: "old-refresh-token" } };
    const res = buildRes();

    const futureDate = new Date(Date.now() + 1000 * 60 * 60);

    RefreshToken.findOne.mockResolvedValue({
      _id: "stored-token-id",
      token: "old-refresh-token",
      user: "user-id",
      expiresAt: futureDate,
    });
    User.findById.mockResolvedValue({ _id: "user-id", username: "johndoe" });
    RefreshToken.deleteOne.mockResolvedValue({ deletedCount: 1 });
    generateTokens.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    await refreshTokenUser(req, res);

    expect(RefreshToken.deleteOne).toHaveBeenCalledWith({
      _id: "stored-token-id",
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      })
    );
  });

  it("returns 400 when the refresh token does not exist", async () => {
    const req = { body: { refreshToken: "unknown-token" } };
    const res = buildRes();

    RefreshToken.findOne.mockResolvedValue(null);

    await refreshTokenUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("returns 401 when the refresh token has expired", async () => {
    const req = { body: { refreshToken: "expired-token" } };
    const res = buildRes();

    const pastDate = new Date(Date.now() - 1000 * 60 * 60);

    RefreshToken.findOne.mockResolvedValue({
      _id: "stored-token-id",
      token: "expired-token",
      user: "user-id",
      expiresAt: pastDate,
    });

    await refreshTokenUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

describe("logoutUser", () => {
  it("logs out successfully when the refresh token exists", async () => {
    const req = { body: { refreshToken: "some-refresh-token" } };
    const res = buildRes();

    RefreshToken.findOneAndDelete.mockResolvedValue({
      _id: "stored-token-id",
      token: "some-refresh-token",
    });

    await logoutUser(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("returns 400 when the refresh token does not exist", async () => {
    const req = { body: { refreshToken: "unknown-token" } };
    const res = buildRes();

    RefreshToken.findOneAndDelete.mockResolvedValue(null);

    await logoutUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
