import { defineConfig } from "vitest/config.js"

// Q. WHY environment: "node" - ISN'T THAT THE DEFAULT?
// ANS: Vitest grew up alongside Vite, whose default test environment is
// "jsdom" (simulating a browser) for frontend projects. Nothing here
// touches a DOM - forcing "node" avoids paying for jsdom's setup cost and
// avoids browser globals shadowing Node ones by surprise.
export default defineConfig({
  test: {
    environment: "node",
    // Integration/E2E tests connect to a real MongoDB and start a real
    // server - both can take longer than Vitest's default 5s timeout,
    // especially on a cold Mongoose connection.
    testTimeout: 15000,
    hookTimeout: 15000,
  },
})
