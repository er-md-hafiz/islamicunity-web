import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: ["pages.spec.js", "resources.spec.js", "quran-player.spec.js"],
  use: { baseURL: "http://127.0.0.1:4174", channel: "chrome", headless: true },
  webServer: {
    command: "node tests/serve-pages.mjs",
    url: "http://127.0.0.1:4174/islamicunity-web/",
    reuseExistingServer: !process.env.CI,
  },
});
