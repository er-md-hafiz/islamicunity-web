import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const prefix = "/islamicunity-web/";
const manifest = JSON.parse(readFileSync('migration/resource-manifest.json','utf8'));

test("all Android resources are published at their exact case-sensitive paths", async ({
  request,
}) => {
  for (const file of [...manifest.files, ...manifest.aliases]) {
    const response = await request.get(prefix + file.path);
    expect(response.status(), file.path).toBe(200);
    const bytes = await response.body();
    expect(createHash("sha256").update(bytes).digest("hex"), file.path).toBe(
      file.sha256,
    );
    if (file.path.endsWith(".json")) {
      expect(response.headers()["content-type"]).toContain("application/json");
      JSON.parse(bytes.toString());
    }
  }
  const menu = await (await request.get(prefix + "menu.json")).json();
  expect(menu.version).toBe(2);
  expect(menu.home.items).toHaveLength(21);
  const questions = await (await request.get(prefix + "quiz.json")).json();
  expect(questions.questions).toHaveLength(100);
  const duas = await (await request.get(prefix + "duas.json")).json();
  expect(duas).toHaveLength(130);
  const videoAlias = await request.get(prefix + "surah_video.json");
  expect(videoAlias.status()).toBe(200);
  expect(await videoAlias.json()).toEqual(await (await request.get(prefix + "surah-videos.json")).json());
});

test("every migrated HTML page renders on a phone without local 404s or script errors", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("https://fonts.googleapis.com/**", (r) => r.abort());
  await page.route("https://fonts.gstatic.com/**", (r) => r.abort());
  const errors = [],
    failures = [];
  page.on("pageerror", (e) =>
    errors.push({ url: page.url(), error: e.message }),
  );
  page.on("response", (r) => {
    if (r.url().startsWith("http://127.0.0.1:4174") && r.status() >= 400)
      failures.push(r.url());
  });
  for (const file of manifest.files.filter((f) => f.path.endsWith(".html"))) {
    const response = await page.goto(prefix + file.path, {
      waitUntil: "domcontentloaded",
    });
    expect(response.status(), file.path).toBe(200);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("iu-site-header .iu-location-button")).toHaveCount(1);
    await expect(page.locator("iu-site-header .iu-notification-button")).toHaveCount(1);
    await expect(page.locator("iu-site-header .iu-avatar")).toHaveText("IU");
    for (const header of await page.locator("header,.navbar,.app-header,.app-name-big").all())
      await expect(header).not.toContainText(/Islamic\s*Unity|YOUR SPACE FOR FAITH & PEACE|A little closer to your faith, every day\./i);
    expect(await page.title(), file.path).not.toBe("");
  }
  expect(failures).toEqual([]);
  expect(errors).toEqual([]);
});

test("migrated Zakat, quiz and games controls retain their behavior", async ({
  page,
}) => {
  await page.goto(prefix + "ZakatCalculator.html");
  await page.locator("#cash").fill("100000");
  await page.locator("#calculateBtn").click();
  await expect(page.locator("#zakatAmount")).toContainText("2,500");
  await page.goto(prefix + "quiz.html");
  await page.locator(".option-btn").first().click();
  await expect(page.locator("#nextBtn")).toBeEnabled();
  await page.locator("#nextBtn").click();
  await expect(page.locator("#currentQNum")).toHaveText("2");
  await page.goto(prefix + "GamesAndPuzzles.html");
  await page.locator('[data-game="scramble"]').click();
  await expect(page.locator("#scrambleInput")).toBeVisible();
});

test("guides switch language and the donation QR and amount modal work without initiating payment", async ({
  page,
}) => {
  await page.setViewportSize({width:390,height:844});
  for (const file of ["Hajj.html", "Umrah.html", "PrayerGuide.html"]) {
    await page.goto(prefix + file);
    await page.locator("#languageSwitcher").selectOption("hi");
    await expect(page.locator("#languageSwitcher")).toHaveValue("hi");
  }
  await page.goto(prefix + "donate.html");
  const qr = page.locator("#qr-code img");
  await expect(qr).toBeVisible();
  await expect
    .poll(() => qr.evaluate((e) => e.complete && e.naturalWidth > 0))
    .toBe(true);
  await page.locator('.amount-btn[data-amount="100"]').click();
  await page.locator("#pay-btn").click();
  await expect(page.locator("#upi-modal")).toHaveClass(/active/);
  await expect(page.locator("#modal-amount")).toHaveText("₹100.00");
  await page.locator("#close-modal").click();
  await expect(page.locator("#upi-modal")).not.toHaveClass(/active/);
});
