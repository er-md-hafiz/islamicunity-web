import { defineConfig } from "@playwright/test";
import pages from "./playwright.pages.config.js";
export default defineConfig({
  ...pages,
  testMatch: "books.spec.js",
  workers: 1,
  use: { ...pages.use, channel: undefined, browserName: "webkit" },
});
