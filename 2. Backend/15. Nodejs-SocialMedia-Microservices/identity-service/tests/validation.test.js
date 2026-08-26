const {
  validateRegistration,
  validatelogin,
} = require("../src/utils/validation");

describe("validateRegistration", () => {
  it("returns no error for a valid payload", () => {
    const { error } = validateRegistration({
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
    });
    expect(error).toBeUndefined();
  });

  it("returns an error when username is missing", () => {
    const { error } = validateRegistration({
      email: "john@example.com",
      password: "password123",
    });
    expect(error).toBeDefined();
  });

  it("returns an error when email is missing", () => {
    const { error } = validateRegistration({
      username: "johndoe",
      password: "password123",
    });
    expect(error).toBeDefined();
  });

  it("returns an error when password is missing", () => {
    const { error } = validateRegistration({
      username: "johndoe",
      email: "john@example.com",
    });
    expect(error).toBeDefined();
  });

  it("returns an error for a malformed email", () => {
    const { error } = validateRegistration({
      username: "johndoe",
      email: "not-an-email",
      password: "password123",
    });
    expect(error).toBeDefined();
  });

  it("returns an error when password is under 6 characters", () => {
    const { error } = validateRegistration({
      username: "johndoe",
      email: "john@example.com",
      password: "123",
    });
    expect(error).toBeDefined();
  });
});

describe("validatelogin", () => {
  it("returns no error for a valid payload", () => {
    const { error } = validatelogin({
      email: "john@example.com",
      password: "password123",
    });
    expect(error).toBeUndefined();
  });

  it("returns an error when email is missing", () => {
    const { error } = validatelogin({
      password: "password123",
    });
    expect(error).toBeDefined();
  });

  it("returns an error when password is missing", () => {
    const { error } = validatelogin({
      email: "john@example.com",
    });
    expect(error).toBeDefined();
  });

  it("returns an error for a malformed email", () => {
    const { error } = validatelogin({
      email: "not-an-email",
      password: "password123",
    });
    expect(error).toBeDefined();
  });

  it("returns an error when password is under 6 characters", () => {
    const { error } = validatelogin({
      email: "john@example.com",
      password: "123",
    });
    expect(error).toBeDefined();
  });
});
