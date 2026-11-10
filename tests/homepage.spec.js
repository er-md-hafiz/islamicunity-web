import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (r) => r.abort());
  await page.route("https://fonts.gstatic.com/**", (r) => r.abort());
  await page.route("**/api/prayertimes?*", (r) =>
    r.fulfill({
      json: {
        date: "2026-11-10",
        timings: {
          Fajr: "05:25",
          Sunrise: "06:38",
          Dhuhr: "12:08",
          Asr: "15:15",
          Maghrib: "17:32",
          Isha: "18:51",
        },
        timezone: "Asia/Kolkata",
        sample: true,
      },
    }),
  );
});
test("homepage presents verified download links and preserves tool navigation", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#homepage-title")).toContainText(
    "Islamic companion",
  );
  await expect(page.locator(".lp-features-grid > a")).toHaveCount(6);
  await expect(page.locator(".lp-hero-ctas a").first()).toHaveAttribute(
    "href",
    "https://play.google.com/store/apps/details?id=com.islamicunity.android",
  );
  await page.locator('.lp-feature[href="#tasbih"]').click();
  await expect(
    page.getByRole("button", { name: /Tap to count,/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Islamic Unity homepage" }).click();
  await expect(page.locator("#homepage-title")).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile menu opens, navigates and closes with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open menu", exact: true });
  await menu.click();
  await expect(
    page.getByRole("button", { name: "Close menu", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.locator('.lp-navigation a[href="#donate"]').click();
  await expect(page.locator(".lp-menu-toggle")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(page.locator("#donate-title")).toBeInViewport();
  await page.locator(".lp-menu-toggle").click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".lp-menu-toggle")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
test("four language layouts fit mobile, tablet and desktop", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ["en", "hi", "ur", "ar"]) {
      await page
        .getByRole("combobox", { name: "Language", exact: true })
        .selectOption(language);
      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        ["ur", "ar"].includes(language) ? "rtl" : "ltr",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#homepage-title")).toBeVisible();
  expect(
    await page
      .locator("#homepage-title")
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
  ).toBeGreaterThanOrEqual(40);
});
test("support opens the migrated donation page and privacy details remain accessible", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/")) requests.push(r.url());
  });
  await page.goto("/#donate");
  await expect(page.locator(".lp-donate .lp-button")).toHaveAttribute(
    "href",
    "/donate.html",
  );
  await expect(page.locator(".lp-support-note")).toContainText(
    "Opens our donation page",
  );
  await page.locator('.lp-footer-links a[href="#privacy"]').click();
  await expect(page.locator("#privacy")).toHaveAttribute("open", "");
  await expect(page.locator("#privacy p")).toContainText(
    "stored in your browser",
  );
  await expect(page.locator(".lp-email-link")).toHaveAttribute(
    "href",
    "mailto:m3hmedia@gmail.com",
  );
  expect(requests).toEqual([]);
});
