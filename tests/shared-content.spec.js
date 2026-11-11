import { test, expect } from "@playwright/test";
import { mockSharedData, menu, surahs, videos } from "./remote-fixtures.mjs";
const root = "/islamicunity-web/";
test.beforeEach(async ({ page }) => {
  await mockSharedData(page);
  await page.route("https://fonts.googleapis.com/**", r => r.abort());
  await page.route("https://fonts.gstatic.com/**", r => r.abort());
});
async function configure(page) {
  const config = structuredClone(menu);
  for (const group of ["content", "quran"]) for (const key of Object.keys(config.commonUrls[group]))
    config.commonUrls[group][key] = `https://shared.test/${key}/${key === "audioSurahUrl" ? "{number}.mp3" : key === "sajdaUrl" ? "{edition}" : "data.json"}`;
  await page.route("**/menu.json", r => r.fulfill({ json: config }));
  return config.commonUrls;
}
test("changed shared URLs and refreshed JSON reach React and standalone quiz without a rebuild", async ({ page }) => {
  const c = await configure(page);
  let revision = "First";
  await page.route(c.content.quizJsonUrl, r => r.fulfill({ json: { questions: [{ question: { en: revision + " remote question", hi: "नया प्रश्न" }, options: { en: ["Yes", "No"], hi: ["हाँ", "नहीं"] }, correctAnswerIndex: 0 }] } }));
  await page.goto(root + "#quiz");
  await expect(page.locator(".tool-card h2")).toHaveText("First remote question");
  revision = "Updated";
  await page.getByRole("button", { name: "Refresh shared data" }).click();
  await expect(page.locator(".tool-card h2")).toHaveText("Updated remote question");
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correct!");
  await page.goto(root + "quiz.html");
  await expect(page.locator(".question-text")).toHaveText("Updated remote question");
  await page.locator("#languageSelect").selectOption("hi");
  await expect(page.locator(".question-text")).toHaveText("नया प्रश्न");
});
test("Duas show shared Arabic and translations, and failures offer retry without sample content", async ({ page }) => {
  const c = await configure(page);
  let failed = true;
  await page.route(c.content.duasJsonUrl, r => failed ? r.fulfill({ status: 503, body: "Unavailable" }) : r.fulfill({ json: [{ id: 1, title: "New shared Dua", arabic: "دعاء", translation: "Updated remotely", category: "Morning" }] }));
  await page.goto(root + "#dua");
  await expect(page.getByText("Content request failed (503)", { exact: false })).toBeVisible();
  failed = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".resource-card h2")).toHaveText("New shared Dua");
  await expect(page.locator(".resource-card [lang=ar]")).toHaveText("دعاء");
  await page.goto(root + "islamicunity.html");
  await expect(page.locator("#duaList")).toContainText("Updated remotely");
});
test("all Quran text, metadata, Sajda, audio and video requests follow the configured URLs", async ({ page }) => {
  const c = await configure(page), requests = new Set();
  page.on("request", r => requests.add(r.url()));
  for (const [url, data] of [
    [c.quran.surahUrl, surahs],
    [c.quran.quranViewUrl, { surahs: surahs.map(s => ({ ...s, ayahs: [{ number: s.number, numberInSurah: 1, text: `نص ${s.number}` }] })) }],
    [c.quran.sajdaUrl.replace("{edition}", "quran-uthmani"), { ayahs: [{ number: 1 }] }],
    [c.quran.metaUrl, { surahs: { count: 114 }, ayahs: { count: 6236 } }],
  ]) await page.route(url, r => r.fulfill({ json: { code: 200, data } }));
  await page.addInitScript(() => {
    window.Audio = function() {
      const a = new EventTarget();
      a.load = () => {}; a.pause = () => {}; a.removeAttribute = () => {};
      a.play = () => { window.__source = a.src; return Promise.resolve(); };
      return a;
    };
  });
  await page.goto(root + "#quran");
  await expect(page.locator(".quran-ayahs")).toContainText("نص 1");
  await expect(page.locator(".quran-ayahs [aria-label=Sajda]")).toBeVisible();
  await page.locator(".quran-reader select").selectOption("114");
  await expect(page.locator(".quran-ayahs")).toContainText("نص 114");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  expect(await page.evaluate(() => window.__source)).toBe(c.quran.audioSurahUrl.replace("{number}", "1"));
  for (const key of ["surahUrl", "quranViewUrl", "sajdaUrl", "metaUrl"])
    expect(requests.has(c.quran[key].replace("{edition}", "quran-uthmani"))).toBe(true);
  let title = videos.title;
  await page.route(c.quran.surahVideoUrl, r => r.fulfill({ json: { ...videos, title } }));
  await page.goto(root + "#video");
  await expect(page.locator(".sv-card")).toHaveCount(114);
  expect(requests.has(c.quran.surahVideoUrl)).toBe(true);
  title = "Updated shared video library";
  await page.getByRole("button", { name: "Refresh shared data" }).click();
  await expect(page.locator("#sv-title")).toHaveText(title);
});
