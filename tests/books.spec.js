import { test, expect } from "@playwright/test";
import { chapters, menu, mockBooks } from "./books-fixtures.mjs";
const root = "/islamicunity-web/Books.html";
test.beforeEach(async ({ page }) => {
  await mockBooks(page);
});

test("Books.html uses the common header/footer, discovers all 114 Surahs and loads full Quran only on demand", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto(root);
  await expect(page).toHaveTitle(
    "Islamic Unity – Islamic Books, Quran & Hadith",
  );
  await expect(page.locator(".topbar")).toHaveCount(1);
  await expect(page.locator(".iu-location-button")).toHaveCount(1);
  await expect(page.locator(".iu-notification-button")).toHaveCount(1);
  await expect(page.locator("iu-site-footer footer")).toHaveCount(1);
  await expect(page.locator(".books-grid > button")).toHaveCount(8);
  expect(
    requests.filter((url) => url.includes("/quran/quran-uthmani")),
  ).toHaveLength(0);
  await page.locator(".books-resource-quran").click();
  await expect(page.locator(".books-surah")).toHaveCount(114);
  await page.locator(".books-surah").first().click();
  await expect(page.locator(".books-verse")).toHaveCount(7);
  await expect(page.locator(".books-arabic").first()).toContainText(
    "بِسْمِ ٱللَّهِ",
  );
  expect(
    requests.filter((url) => url.includes("/quran/quran-uthmani")),
  ).toHaveLength(1);
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page.locator(".books-resource-quran").click();
  await page.locator(".books-surah").nth(1).click();
  await expect(page.locator(".books-verse")).toHaveCount(40);
  await page.getByRole("button", { name: "Read more verses" }).click();
  await expect(page.locator(".books-verse")).toHaveCount(80);
  expect(
    requests.filter((url) => url.includes("/quran/quran-uthmani")),
  ).toHaveLength(1);
});

test("division bounds, Sajda links, metadata and translation editions work", async ({
  page,
}) => {
  for (const [section, count] of [
    ["juz", 30],
    ["page", 604],
    ["ruku", 556],
    ["manzil", 7],
    ["hizbQuarter", 240],
  ]) {
    await page.goto(root + `?section=${section}&number=1`);
    await expect(page.locator(".books-verse")).toHaveCount(3);
    await expect(page.locator(".books-division button").first()).toBeDisabled();
    await page.locator(".books-division input").fill(String(count));
    await page.getByRole("button", { name: "Go", exact: true }).click();
    await expect(page.locator(".books-division button").last()).toBeDisabled();
    await expect(page.locator(".books-verse")).toHaveCount(3);
  }
  await page.goto(root + "?section=sajda");
  await expect(page.locator(".books-verse")).toContainText("7:206");
  await page.getByRole("button", { name: "Open verse" }).click();
  await expect(
    page.locator(`#verse-${chapters[6].ayahs[205].number}`),
  ).toBeFocused();
  await page.goto(root + "?section=surah&number=1");
  await expect(page.locator(".books-controls select option")).toHaveCount(4);
  await page
    .getByLabel("Translation edition", { exact: true })
    .selectOption("hi.hindi");
  await expect(page.locator(".books-translation").first()).toContainText(
    "hi.hindi 1:1",
  );
  await expect(page.locator(".books-arabic").first()).toContainText("بِسْمِ");
  await page.goto(root + "?section=meta");
  await expect(page.locator(".books-meta article")).toHaveCount(8);
  await expect(page.locator(".books-meta")).toContainText("6236");
});

test("keyword, Arabic, Surah and verse-reference searches use configured endpoints and paginated results", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto(root + "?section=search");
  await page.getByRole("textbox", { name: "Search Quran" }).fill("mercy");
  await page.locator(".books-query-form button").click();
  await expect(page.locator(".books-verse")).toHaveCount(20);
  await expect(page.locator(".books-translation").first()).toContainText(
    "Translation of match",
  );
  expect(requests.some((url) => url.includes("search/mercy/all/en.asad"))).toBe(
    true,
  );
  await page
    .locator(".books-pagination")
    .getByRole("button", { name: "Next" })
    .click();
  await expect(page.locator(".books-pagination")).toContainText("21–40 / 45");
  await page.getByRole("textbox", { name: "Search Quran" }).fill("رحمة");
  await page.locator(".books-query-form button").click();
  await expect(page.locator(".books-verse")).toHaveCount(20);
  expect(
    requests.some((url) =>
      decodeURIComponent(url).includes("search/رحمة/all/quran-uthmani"),
    ),
  ).toBe(true);
  await page.goBack();
  await expect(page.getByRole("textbox", { name: "Search Quran" })).toHaveValue("mercy");
  await expect(page.locator(".books-pagination")).toContainText("21–40 / 45");
  for (const [term, expected] of [
    ["114", ".books-surah"],
    ["Al-Fatihah", ".books-surah"],
    ["2:255", "#verse-262"],
    ["#262", "#verse-262"],
  ]) {
    await page.getByRole("textbox", { name: "Search Quran" }).fill(term);
    await page.locator(".books-query-form button").click();
    await expect(page.locator(expected)).toHaveCount(1);
  }
});

test("font size, bookmarks, copy/share fallback and last position persist across reopen", async ({
  page,
  context,
  browserName,
}) => {
  if (browserName === "webkit")
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async (text) => {
            window.__clipboard = text;
          },
          readText: async () => window.__clipboard,
        },
      }),
    );
  // WebKit automation does not expose clipboard permission grants.
  else await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "share", { value: undefined }),
  );
  await page.goto(root + "?section=surah&number=2&verse=60");
  await expect(page.locator("#verse-60")).toBeFocused();
  await page.getByLabel("Arabic font size").fill("36");
  await expect(page.locator("#verse-60 .books-arabic")).toHaveCSS(
    "font-size",
    "36px",
  );
  await page
    .locator("#verse-60")
    .getByRole("button", { name: "Bookmark verse" })
    .click();
  await page
    .locator("#verse-60")
    .getByRole("button", { name: "Copy verse" })
    .click();
  await expect(page.locator(".books-action-notice")).toHaveText("Verse copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "آية الاختبار",
  );
  await page
    .locator("#verse-60")
    .getByRole("button", { name: "Share verse" })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Books.html?section=surah",
  );
  await page.goto(root);
  await page.locator(".books-bookmarks-link").click();
  await expect(page.locator(".books-bookmarks button")).toHaveCount(1);
  await page.locator(".books-bookmarks button").click();
  await expect(page.locator("#verse-60")).toBeFocused();
  await page.goto(root);
  await page.locator(".books-continue").click();
  await expect(page.locator(".books-verse").first()).toBeAttached();
  await expect(page).toHaveURL(/section=surah&number=2&verse=/);
});

test("publisher PDFs and all six Hadith collections have accessible verified source links", async ({
  page,
}) => {
  await page.route("https://d.clearquran.com/**", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<title>PDF preview fixture</title>",
    }),
  );
  await page.goto(root + "?section=pdf");
  await expect(page.locator(".books-resources article")).toHaveCount(2);
  await page
    .locator(".books-resources")
    .getByRole("button", { name: "Read online" })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("dialog iframe")).toHaveAttribute(
    "src",
    menu.commonUrls.books.pdfResources[0].url,
  );
  await expect(
    page.getByRole("link", { name: "Download from publisher" }),
  ).toHaveAttribute("href", "https://clearquran.com/download/");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto(root + "?section=hadith");
  await expect(page.locator(".books-resources article")).toHaveCount(6);
  for (const link of await page.locator(".books-resources .button").all()) {
    await expect(link).toHaveAttribute("href", /^https:\/\/sunnah.com\//);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  await expect(page.locator(".books-query-form")).toHaveAttribute(
    "action",
    "https://sunnah.com/search",
  );
});

test("API failure is retryable and previously opened reading remains available offline", async ({
  page,
  context,
}) => {
  let failed = true;
  await page.route("**/juz/1/quran-uthmani", async (route) =>
    failed ? route.fulfill({ status: 503, json: {} }) : route.fallback(),
  );
  await page.goto(root + "?section=juz&number=1");
  await expect(page.locator(".books-state[role=alert]")).toBeVisible();
  failed = false;
  await page
    .locator(".books-state")
    .getByRole("button", { name: "Try again" })
    .click();
  await expect(page.locator(".books-verse")).toHaveCount(3);
  await context.setOffline(true);
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page.locator(".books-resource-juz").click();
  await expect(page.locator(".books-verse")).toHaveCount(3);
  await expect(page.locator(".books-cache")).toBeVisible();
});

test("Books layout fits four languages and multiple sizes, including dark theme and the reader", async ({
  page,
}) => {
  await page.goto(root);
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ["en", "hi", "ur", "ar"]) {
      await page
        .getByRole("combobox", { name: "Language", exact: true })
        .selectOption(language);
      await expect(page.locator("#books-title")).toBeVisible();
      await page.evaluate(
        (l) =>
          (document.documentElement.dataset.theme =
            l === "ar" ? "dark" : "light"),
        language,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.goto(root + "?section=surah&number=1");
  await expect(page.locator(".books-arabic").first()).toHaveAttribute(
    "dir",
    "rtl",
  );
  await page.setViewportSize({ width: 360, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("configuration changes select a different API origin without hardcoded URL fallbacks", async ({
  page,
}) => {
  const config = structuredClone(menu),
    q = config.commonUrls.quran;
  for (const key of ["surahUrl", "quranViewUrl", "sajdaUrl", "metaUrl"])
    q[key] = q[key].replace(
      "https://api.alquran.cloud/v1/",
      "https://configured.test/custom/v1/",
    );
  await mockBooks(page, config);
  const requested = [];
  page.on("request", (r) => requested.push(r.url()));
  await page.goto(root + "?section=page&number=604");
  await expect(page.locator(".books-verse")).toHaveCount(3);
  expect(requested).toContain(
    "https://configured.test/custom/v1/page/604/quran-uthmani",
  );
  expect(
    requested.filter((url) => url.startsWith("https://api.alquran.cloud/")),
  ).toEqual([]);
});
