import { test, expect } from "@playwright/test";
const prefix = "/islamicunity-web/";
test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (r) => r.abort());
  await page.route("https://fonts.gstatic.com/**", (r) => r.abort());
  await page.route("https://api.aladhan.com/**", (r) =>
    r.fulfill({
      json: {
        data: {
          timings: {
            Fajr: "05:25",
            Sunrise: "06:38",
            Dhuhr: "12:08",
            Asr: "15:15",
            Maghrib: "17:32",
            Isha: "18:51",
          },
          meta: {
            timezone: "Asia/Kolkata",
            method: { name: "University of Islamic Sciences, Karachi" },
          },
        },
      },
    }),
  );
});
test("production index, assets and every menu page work under the repository path without Express", async ({
  page,
}) => {
  const errors = [],
    failed = [],
    apiCalls = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.url().startsWith("http://127.0.0.1:4174") && r.status() >= 400)
      failed.push(r.url());
  });
  page.on("request", (r) => {
    if (
      r.url().startsWith("http://127.0.0.1:4174") &&
      r.url().includes("/api/")
    )
      apiCalls.push(r.url());
  });
  await page.goto(prefix + "index.html");
  await expect(page).toHaveTitle(
    "Islamic Unity — Your Complete Islamic Companion",
  );
  await expect(page.locator("#homepage-title")).toBeVisible();
  await page.locator(".lp-purpose-strip a").click();
  await expect(page.locator(".prayer-grid")).toBeVisible();
  await expect(page.locator(".schedule-note")).toContainText(
    "Timings by Aladhan",
  );
  const menu = await (await page.request.get(prefix + "data/menu.json")).json();
  for (const item of menu.home.items) {
    await page.goto(prefix + "#" + item.id);
    if (item.id === "donate") {
      await expect(page.locator(".lp-donate")).toBeVisible();
      continue;
    }
    await expect(page.locator(".page-content")).not.toBeEmpty();
    await expect(page.locator(".page-content .loading")).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
  }
  expect(apiCalls).toEqual([]);
  expect(failed).toEqual([]);
  expect(errors).toEqual([]);
});
test("static mode calculates Qibla and future calendar dates", async ({
  page,
}) => {
  await page.goto(prefix + "#qibla");
  await expect(page.locator(".bearing")).toContainText("267");
  await page.goto(prefix + "#calendar");
  await expect(page.locator(".expanded.calendar-card .event")).toHaveCount(4);
  await expect(page.locator(".expanded.calendar-card h2")).not.toBeEmpty();
});
test("provider failure shows a labelled sample schedule", async ({ page }) => {
  await page.route("https://api.aladhan.com/**", (r) => r.abort());
  await page.goto(prefix + "#prayer_times");
  await expect(page.locator(".schedule-note")).toContainText("Demo timings");
});
