import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://localhost:5173", channel: "chrome", headless: true },
  webServer: [
    {
      command: "node backend/server.js",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: true,
    },
    {
      command:
        "node node_modules/vite/bin/vite.js --host 127.0.0.1 --config frontend/vite.config.js frontend",
      url: "http://localhost:5173",
      reuseExistingServer: true,
    },
  ],
});
