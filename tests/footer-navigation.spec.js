import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { footerColumns } from "../frontend/src/footer/footer-data.mjs";
import { resourcePages } from "../shared/resource-navigation.mjs";
const prefix = "/islamicunity-web/";
const manifest = JSON.parse(readFileSync("migration/resource-manifest.json", "utf8"));
test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", r => r.abort());
  await page.route("https://fonts.gstatic.com/**", r => r.abort());
  await page.route("https://api.aladhan.com/**", r => r.abort());
});
test("one shared semantic footer appears on the homepage, every app route and every standalone HTML page", async ({ page }) => {
  test.setTimeout(120000);
  const errors = [], missing = [];
  page.on("pageerror", e => errors.push({ url: page.url(), message: e.message }));
  page.on("response", r => { if (r.url().startsWith("http://127.0.0.1:4174") && r.status() >= 400) missing.push(r.url()); });
  const menu = await (await page.request.get(prefix + "data/menu.json")).json();
  const paths = ["index.html", "index.html#quran", "index.html#reminders", ...menu.home.items.map(item => "index.html#" + item.id),
    ...manifest.files.filter(f => f.path.endsWith(".html")).map(f => f.path)];
  for (const path of paths) {
    await page.goto(prefix + path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("iu-site-footer footer"), path).toHaveCount(1);
    await expect(page.locator("iu-site-footer .footer-grid > *"), path).toHaveCount(4);
    await expect(page.locator("iu-site-footer .back-to-top"), path).toBeAttached();
  }
  expect(errors).toEqual([]); expect(missing).toEqual([]);
});
test("all supplied footer URLs, contact email, real website link and unlinked social icons are correct", async ({ page }) => {
  await page.goto(prefix + "index.html");
  const footer = page.locator("iu-site-footer");
  for (const column of footerColumns) {
    const nav = footer.getByRole("navigation", { name: column.title });
    for (const [label, url] of column.links) {
      const link = nav.getByRole("link", { name: label, exact: true });
      await expect(link).toHaveAttribute("href", url);
      if (url.startsWith("https:")) { await expect(link).toHaveAttribute("target", "_blank"); await expect(link).toHaveAttribute("rel", "noopener noreferrer"); }
    }
  }
  await expect(footer.getByRole("link", { name: "Islamic Unity website", exact: false })).toHaveAttribute("href", prefix + "index.html");
  await expect(footer.locator(".socials a")).toHaveCount(0);
  await expect(footer.locator(".social-unavailable")).toHaveCount(4);
  await expect(footer.locator('.year')).toHaveText(String(new Date().getFullYear()));
  await expect(footer.getByRole("link", { name: "islamic.unity.app@gmail.com" })).toHaveAttribute("href", "mailto:islamic.unity.app@gmail.com");
});
test("footer is four columns on desktop, two on tablet and stacked on phones, including dark/RTL pages", async ({ page }) => {
  await page.goto(prefix + "index.html#quran");
  for (const [width, columns] of [[1600, 4], [800, 2], [360, 1]]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ["en", "ar"]) {
      await page.getByRole("combobox", { name: "Language", exact: true }).selectOption(language);
      await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
      const grid = page.locator("iu-site-footer .footer-grid");
      expect(await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length)).toBe(columns);
      expect(await page.locator("iu-site-footer footer").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
test("Back to top scrolls the current document and preserves its URL, respecting reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["index.html#video", "Hajj.html", "donate.html"]) {
    await page.goto(prefix + path); const url = page.url();
    const button = page.getByRole("button", { name: "Back to top", exact: true });
    await button.scrollIntoViewIfNeeded(); expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await button.click(); await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page).toHaveURL(url);
  }
});
test("known resource links and old hashes open actual full pages with no intermediate resource screen", async ({ page }) => {
  for (const [id, file] of Object.entries(resourcePages)) {
    await page.goto(prefix + "index.html#prayer_times");
    const link = page.locator(`.nav-item[href="${prefix}${file}"]`);
    await expect(link).toBeAttached();
    await page.setViewportSize({ width: 1440, height: 1000 }); await link.click();
    await expect(page).toHaveURL(new RegExp(file + "$"));
    await expect(page.locator("body")).not.toContainText("Open the original Islamic Unity resource.");
    await expect(page.getByRole("link", { name: "Open resource", exact: true })).toHaveCount(0);
    await page.goto(prefix + "index.html#" + id); await expect(page).toHaveURL(new RegExp(file + "$"));
  }
  await page.goto(prefix + "index.html#halal"); await expect(page.locator(".resource-card").first()).toContainText("Read the label");
  await page.goto(prefix + "index.html#calendar"); await expect(page.locator(".expanded.calendar-card")).toBeVisible();
});
test("external resource cards are direct links and legacy feature cards bypass their demo modals", async ({ page }) => {
  await page.goto(prefix + "index.html#books");
  await expect(page.locator('a.resource-card[href="https://quran.com"]')).toContainText("The Noble Quran");
  await expect(page.getByText("Open resource", { exact: true })).toHaveCount(0);
  for (const [id, destination] of [["hajj", "Hajj.html"], ["zakat", "ZakatCalculator.html"], ["charity", "IslamicCharity.html"], ["halal", "index.html#halal"]]) {
    await page.goto(prefix + "islamicunity.html");
    await page.locator(`.feature-item[data-feature="${id}"]`).click();
    await expect(page).toHaveURL(prefix + destination);
  }
});
