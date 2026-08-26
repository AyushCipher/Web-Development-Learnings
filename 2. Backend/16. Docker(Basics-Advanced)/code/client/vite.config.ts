import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Q. App.tsx calls axios with baseURL "/api" - how does that ever reach the
// Express backend on port 5000?
// ANS: Two different things resolve that relative path depending on how
// the app is running. In the Docker/Compose build (see client/Dockerfile +
// nginx/default.conf), nginx serves the built static files and proxies
// `/api/` to the `server` container - no proxy config here is involved at
// all. In local dev (`npm run dev`, as README.md documents), there's no
// nginx in front of anything - the request is same-origin against the Vite
// dev server itself (localhost:5173) unless Vite's own dev-server proxy
// forwards it, which is what this config does.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
