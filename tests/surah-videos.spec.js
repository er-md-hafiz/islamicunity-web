import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const fixture = JSON.parse(readFileSync("frontend/public/surah-videos.json", "utf8"));
const prefix = "/islamicunity-web/";
test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", r => r.abort());
  await page.route("https://fonts.gstatic.com/**", r => r.abort());
  // Mapping tests verify every embed without depending on YouTube ads/cookies/network.
  await page.route("https://www.youtube.com/embed/**", r => r.fulfill({ contentType: "text/html", body: "<!doctype html><title>Video fixture</title>" }));
  await page.route("https://api.aladhan.com/**", r => r.abort());
});
test("direct index hash loads 114 ordered records, computed counts and no iframe; filters combine with search", async ({ page }) => {
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto(prefix + "index.html#video");
  await expect(page.locator(".sv-card")).toHaveCount(114);
  await expect(page.locator(".sv-stats strong")).toHaveText(["114", "66", "48"]);
  expect(await page.locator(".sv-card").evaluateAll(cards => cards.map(c => Number(c.dataset.surah)))).toEqual(fixture.surahs.map(s => s.number));
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(await page.locator("#video").evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(100);
  await page.getByRole("button", { name: "Available Videos", exact: true }).click();
  await expect(page.locator(".sv-card")).toHaveCount(66);
  const search = page.getByRole("searchbox", { name: "Search Surahs" });
  for (const query of ["Fatihah", "الفاتحة", "001", "١"]) { await search.fill(query); await expect(page.locator(".sv-card")).toHaveCount(1); await expect(page.locator(".sv-card h3")).toHaveText(fixture.surahs[0].name); }
  await search.fill("Luqman"); await expect(page.getByRole("heading", { name: "No Surahs found" })).toBeVisible();
  await page.getByRole("button", { name: "Coming Soon", exact: true }).click(); await expect(page.locator(".sv-card")).toHaveCount(1);
  await search.fill(""); await expect(page.locator(".sv-card")).toHaveCount(48);
  await search.fill("no-such-surah"); await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(page.locator(".sv-card")).toHaveCount(114); expect(errors).toEqual([]);
});
test("every one of the 66 videos uses its exact JSON embed and original link, closes and restores focus", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto(prefix + "index.html#video"); await expect(page.locator(".sv-card")).toHaveCount(114);
  for (const s of fixture.surahs.filter(s => s.hasVideo)) {
    const button = page.locator(`[data-surah="${s.number}"] .sv-play`); await button.click();
    const dialog = page.getByRole("dialog"); await expect(dialog).toBeVisible();
    await expect(dialog.locator("iframe")).toHaveAttribute("src", s.embedUrl);
    await expect(dialog.getByRole("link", { name: "Open on YouTube" })).toHaveAttribute("href", s.videoUrl);
    await expect(dialog.locator("iframe")).not.toHaveAttribute("allow", /autoplay/);
    await expect(dialog.locator("#sv-player-title")).toHaveText(s.name);
    await page.getByRole("button", { name: "Close video player" }).click(); await expect(page.locator("iframe")).toHaveCount(0);
    await expect(button).toBeFocused();
  }
});
test("player switches in place, traps focus, supports Escape and cleans up on navigation", async ({ page }) => {
  await page.goto(prefix + "index.html#video");
  await page.locator('[data-surah="1"] .sv-play').click();
  const close = page.getByRole("button", { name: "Close video player" }); await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab"); await expect(page.getByRole("link", { name: "Open on YouTube" })).toBeFocused();
  await page.keyboard.press("Tab"); await expect(close).toBeFocused();
  await page.getByRole("combobox", { name: "Choose another Surah" }).selectOption("114");
  await expect(page.locator(".sv-frame iframe")).toHaveAttribute("src", fixture.surahs[113].embedUrl);
  await expect(page).toHaveURL(/index.html#video$/); await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.locator('[data-surah="1"] .sv-play').click(); await page.evaluate(() => { location.hash = "quran"; });
  await expect(page.locator(".qa-player")).toBeVisible(); await expect(page.locator("iframe")).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});
test("API failure, malformed data, loading skeletons and retry recover without breaking the page", async ({ page }) => {
  let requests = 0; let release; const pending = new Promise(resolve => { release = resolve; });
  await page.route("**/surah-videos.json", async route => {
    requests++;
    if (requests === 1) { await pending; await route.fulfill({ status: 503, body: "Unavailable" }); }
    else if (requests === 2) await route.fulfill({ json: { surahs: [] } });
    else await route.fulfill({ json: fixture });
  });
  await page.goto(prefix + "index.html#video"); await expect(page.locator(".sv-skeleton")).toHaveCount(6); release();
  await expect(page.locator(".sv-state[role=alert]")).toBeVisible(); await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".sv-state[role=alert]")).toBeVisible(); await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".sv-card")).toHaveCount(114); expect(requests).toBe(3);
});
test("missing media is safe, counts ignore stale metadata, and route revisits reuse cached JSON", async ({ page }) => {
  const data = structuredClone(fixture); data.availableVideos = 900; data.totalSurahs = 1; data.surahs[0].embedUrl = "https://evil.test/";
  let requests = 0; await page.route("**/surah-videos.json", route => { requests++; return route.fulfill({ json: data }); });
  await page.goto(prefix + "index.html#video"); await expect(page.locator(".sv-stats strong")).toHaveText(["114", "65", "49"]);
  await expect(page.locator('[data-surah="1"] .sv-play')).toHaveCount(0);
  await page.evaluate(() => { location.hash = "tasbih"; }); await expect(page.locator(".tasbih-card")).toBeVisible();
  await page.evaluate(() => { location.hash = "video"; }); await expect(page.locator(".sv-card")).toHaveCount(114);
  await page.getByRole("searchbox").fill("2"); expect(requests).toBe(1);
});
test("library and modal fit phone/tablet/desktop widths and all four existing languages", async ({ page }) => {
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto(prefix + "index.html#video"); await expect(page.locator(".sv-card")).toHaveCount(114);
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ["en", "hi", "ur", "ar"]) {
      await page.getByRole("combobox", { name: "Language", exact: true }).selectOption(language);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('[data-surah="1"] .sv-play').click();
      const frame = await page.locator(".sv-frame").boundingBox(); expect(Math.abs(frame.width / frame.height - 16 / 9)).toBeLessThan(.02);
      expect(await page.locator(".sv-dialog").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await page.locator(".sv-close").click();
    }
  }
  expect(errors).toEqual([]);
});
