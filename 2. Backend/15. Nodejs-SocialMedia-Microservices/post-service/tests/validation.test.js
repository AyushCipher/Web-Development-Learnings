const { validateCreatePost } = require("../src/utils/validation");

describe("validateCreatePost", () => {
  it("passes for a valid payload", () => {
    const { error } = validateCreatePost({
      content: "This is a valid post content.",
      mediaIds: [],
    });
    expect(error).toBeUndefined();
  });

  it("fails when content is missing", () => {
    const { error } = validateCreatePost({});
    expect(error).toBeDefined();
  });

  it("fails when content is empty", () => {
    const { error } = validateCreatePost({ content: "" });
    expect(error).toBeDefined();
  });

  it("fails when content exceeds 5000 characters", () => {
    const { error } = validateCreatePost({ content: "a".repeat(5001) });
    expect(error).toBeDefined();
  });
});
