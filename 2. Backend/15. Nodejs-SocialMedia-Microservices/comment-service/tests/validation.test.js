const { validateCreateComment } = require("../src/utils/validation");

describe("validateCreateComment", () => {
  it("passes for a valid payload", () => {
    const { error } = validateCreateComment({ text: "Nice post!" });
    expect(error).toBeUndefined();
  });

  it("fails when text is missing", () => {
    const { error } = validateCreateComment({});
    expect(error).toBeDefined();
  });

  it("fails when text is empty", () => {
    const { error } = validateCreateComment({ text: "" });
    expect(error).toBeDefined();
  });

  it("fails when text exceeds 1000 characters", () => {
    const { error } = validateCreateComment({ text: "a".repeat(1001) });
    expect(error).toBeDefined();
  });
});
