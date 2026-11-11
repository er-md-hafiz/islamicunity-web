import { test, expect } from "@playwright/test";
import { resourcePages } from "../shared/resource-navigation.mjs";
const timings = {
  Fajr: "05:25",
  Sunrise: "06:38",
  Dhuhr: "12:08",
  Asr: "15:15",
  Maghrib: "17:32",
  Isha: "18:51",
};
test("next prayer after Isha uses tomorrow’s Fajr schedule", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-10T15:00:00Z") });
  await page.route("**/api/prayertimes?*", (route) => {
    const date = new URL(route.request().url()).searchParams.get("date");
    return route.fulfill({
      json: {
        date,
        timings: {
          ...timings,
          Fajr: date === "2026-11-11" ? "05:27" : "05:25",
        },
        timezone: "Asia/Kolkata",
        sample: false,
      },
    });
  });
  await page.goto("/#prayer_times");
  await expect(page.locator(".next-prayer")).toContainText("5:27 AM");
  await expect(page.locator(".next-label")).toContainText("Tomorrow");
});
test("enabled prayer reminder appears at the scheduled time", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-10T06:37:40Z") });
  await page.clock.pauseAt(new Date("2026-11-10T06:37:50Z"));
  await page.addInitScript(() => {
    localStorage.setItem("iu-reminders", JSON.stringify({ Dhuhr: true }));
  });
  await page.goto("/#prayer_times");
  await expect(page.locator(".prayer-grid")).toBeVisible();
  await page.clock.runFor(11000);
  await expect(page.getByRole("status")).toContainText("Dhuhr");
});
test("geolocation updates prayer and Qibla coordinates", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 19.076, longitude: 72.8777 });
  await page.goto("/#qibla");
  await page.locator(".qf-bearing button").click();
  await expect(page.locator(".qf-location")).toContainText(
    "Current location",
  );
  await expect(
    page.locator(".expanded.qibla-card .helper").first(),
  ).toContainText("19.0760");
});
test.beforeEach(async ({ page }) => {
  await page.route("**/api/prayertimes?*", (route) =>
    route.fulfill({
      json: {
        date: "2026-11-10",
        timings,
        timezone: "Asia/Kolkata",
        source: "Test fixture",
        sample: false,
        method: "Test",
      },
    }),
  );
});
test("menu routes render and counter persists after reload", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#prayer_times");
  await page
    .getByRole("button", { name: "Digital Tasbih", exact: false })
    .first()
    .click();
  const counter = page.getByRole("button", { name: /Tap to count,/ });
  await counter.click();
  await counter.click();
  await expect(counter).toHaveAttribute("aria-label", "Tap to count, 2");
  await page.reload();
  await expect(counter).toHaveAttribute("aria-label", "Tap to count, 2");
  const menu = await (await page.request.get("/api/menu")).json();
  for (const item of menu.home.items) {
    await page.goto("/#" + item.id);
    if (resourcePages[item.id]) {
      await expect(page).toHaveURL(new RegExp(resourcePages[item.id] + "$"));
      await expect(page.locator("iu-site-footer footer")).toBeAttached();
      continue;
    }
    if (item.id === "donate") {
      await expect(page.locator(".lp-donate")).toBeVisible();
      continue;
    }
    await expect(page.locator(".page-content")).not.toBeEmpty();
    await expect(page.locator(".page-content .loading")).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
test("calendar navigation remains selected while clock updates", async ({
  page,
}) => {
  await page.goto("/#calendar");
  await page.getByRole("button", { name: "Next month" }).click();
  const text = await page.locator(".month-nav strong").textContent();
  await page.waitForTimeout(1200);
  await expect(page.locator(".month-nav strong")).toHaveText(text);
});
test("Hindi and Urdu navigation, mobile layout and accessible drawer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#prayer_times");
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("hi");
  await expect(
    page.getByRole("heading", { name: "आज की नमाज़ के समय" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("ur");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("en");
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Quran & Inspiration", exact: false })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Quran & Inspiration", exact: true }),
  ).toBeVisible();
});
test("quiz provides correct answer feedback", async ({ page }) => {
  await page.goto("/#quiz");
  await page.getByRole("button", { name: "114", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correct!");
});
test("Hindi speech prefers a female Hindi device voice", async ({ page }) => {
  await page.addInitScript(() => {
    const voices = [
      { name: "English", lang: "en-US" },
      { name: "Microsoft Swara", lang: "hi-IN" },
    ];
    window.speechSynthesis.getVoices = () => voices;
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.speak = (u) => {
      window.__speech = { text: u.text, lang: u.lang, voice: u.voice?.name };
    };
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
  });
  await page.goto("/#prayer_times");
  await page.getByRole("button", { name: "Speak times" }).click();
  const speech = await page.evaluate(() => window.__speech);
  expect(speech.lang).toBe("hi-IN");
  expect(speech.voice).toBe("Microsoft Swara");
  expect(speech.text).toContain("फ़ज्र");
});
test("sample fallback is labelled and API errors offer retry", async ({
  page,
}) => {
  await page.route("**/api/prayertimes?*", (route) =>
    route.fulfill({
      json: {
        date: "2026-11-10",
        timings,
        timezone: "Asia/Kolkata",
        sample: true,
      },
    }),
  );
  await page.goto("/#prayer_times");
  await expect(page.locator(".schedule-note")).toContainText("Demo timings");
  await page.unroute("**/api/prayertimes?*");
  await page.route("**/api/prayertimes?*", (route) =>
    route.fulfill({ status: 503, json: { error: "Unavailable" } }),
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
});
