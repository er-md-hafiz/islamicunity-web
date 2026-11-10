import { test, expect } from "@playwright/test";
const root = "/islamicunity-web/";
test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (r) => r.abort());
  await page.route("https://fonts.gstatic.com/**", (r) => r.abort());
  await page.addInitScript(() => {
    window.__quranMedia = [];
    window.Audio = function () {
      const audio = new EventTarget();
      Object.assign(audio, {
        src: "",
        preload: "",
        volume: 1,
        muted: false,
        playbackRate: 1,
        currentTime: 0,
        duration: 0,
        readyState: 0,
        paused: true,
      });
      audio.load = () => {};
      audio.removeAttribute = (name) => {
        if (name === "src") audio.src = "";
      };
      audio.pause = () => {
        audio.paused = true;
        audio.dispatchEvent(new Event("pause"));
      };
      audio.play = () => {
        if (window.__mediaFailure)
          return Promise.reject(
            Object.assign(new Error("test"), { name: window.__mediaFailure }),
          );
        if (window.__mediaPending) return new Promise(() => {});
        audio.duration = 180;
        audio.readyState = 3;
        audio.paused = false;
        audio.dispatchEvent(new Event("loadedmetadata"));
        audio.dispatchEvent(new Event("canplay"));
        audio.dispatchEvent(new Event("play"));
        audio.dispatchEvent(new Event("playing"));
        return Promise.resolve();
      };
      window.__quranMedia.push(audio);
      return audio;
    };
  });
});
test("all 114 selections, multilingual search and boundaries work without autoplay", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (r) => {
    if (r.url().endsWith(".mp3")) requests.push(r.url());
  });
  await page.goto(root + "#quran");
  await expect(page.locator(".qa-surahs>li")).toHaveCount(114);
  expect(await page.evaluate(() => window.__quranMedia.length)).toBe(0);
  const search = page.getByRole("searchbox");
  await search.fill("36");
  await expect(page.locator(".qa-surahs>li")).toHaveCount(1);
  await page.locator(".qa-select-surah").click();
  await expect(page.locator(".qa-track-info h3")).toHaveText("Ya-Sin");
  expect(await page.evaluate(() => window.__quranMedia.length)).toBe(0);
  await search.fill("الفاتحة");
  await page.locator(".qa-select-surah").click();
  await expect(
    page.getByRole("button", { name: "Previous Surah", exact: true }),
  ).toBeDisabled();
  await search.fill("114");
  await page.locator(".qa-select-surah").click();
  await expect(
    page.getByRole("button", { name: "Next Surah", exact: true }),
  ).toBeDisabled();
  await search.fill("al-kahf");
  await expect(page.locator(".qa-surahs>li")).toHaveCount(1);
  await search.fill("لايوجداسم");
  await expect(page.locator(".qa-empty")).toBeVisible();
  expect(requests).toEqual([]);
});
test("play/pause, progress, volume, speed and continuous listening follow media state", async ({
  page,
}) => {
  await page.goto(root + "#quran");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".qa-time")).toContainText("3:00");
  await page.getByRole("slider", { name: "Seek recitation" }).fill("60");
  expect(
    await page.evaluate(() => window.__quranMedia.at(-1).currentTime),
  ).toBe(60);
  await page.getByRole("slider", { name: "Volume", exact: true }).fill("0.4");
  await page.getByRole("button", { name: "Mute", exact: true }).click();
  expect(await page.evaluate(() => window.__quranMedia.at(-1).muted)).toBe(
    true,
  );
  await page.getByRole("button", { name: "Unmute", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Playback speed" })
    .selectOption("1.5");
  expect(
    await page.evaluate(() => window.__quranMedia.at(-1).playbackRate),
  ).toBe(1.5);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.locator(".qa-status")).toContainText("Paused");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.evaluate(() =>
    window.__quranMedia.at(-1).dispatchEvent(new Event("ended")),
  );
  await expect(page.locator(".qa-track-number strong")).toHaveText("001");
  await page.getByRole("checkbox", { name: "Auto Play Next Surah" }).check();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.evaluate(() =>
    window.__quranMedia.at(-1).dispatchEvent(new Event("ended")),
  );
  await expect(page.locator(".qa-track-number strong")).toHaveText("002");
  expect(await page.evaluate(() => window.__quranMedia.at(-1).src)).toMatch(
    /002\.mp3$/,
  );
  await page.getByRole("link", { name: "Islamic Unity homepage" }).click();
  expect(
    await page.evaluate(() =>
      window.__quranMedia.every((a) => a.paused && a.src === ""),
    ),
  ).toBe(true);
});
test("errors, retry, timeout and switching while loading recover visibly", async ({
  page,
}) => {
  await page.goto(root + "#quran");
  await page.evaluate(() => (window.__mediaFailure = "NotSupportedError"));
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator(".qa-error")).toBeVisible();
  await page.evaluate(() => (window.__mediaFailure = null));
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".qa-status")).toContainText("Playing");
  await page.context().setOffline(true);
  await expect(page.locator(".qa-error")).toContainText("offline");
  await page.context().setOffline(false);
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".qa-status")).toContainText("Playing");
  await page.evaluate(() => (window.__mediaPending = true));
  await page.getByRole("button", { name: "Next Surah", exact: true }).click();
  await page.clock.install();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.clock.fastForward(21000);
  await expect(page.locator(".qa-error")).toContainText("too long");
  await page.evaluate(() => (window.__mediaPending = false));
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".qa-status")).toContainText("Playing");
});
test("legacy reader keeps Arabic content and list actions while sharing the real player", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(root + "islamicunity.html");
  await expect(page.locator("#quranAudioMount .qa-player")).toBeVisible();
  await expect(page.locator("#surahList .surah-item")).toHaveCount(6);
  await page
    .locator("#surahList .surah-item")
    .nth(1)
    .locator('[data-action="play"]')
    .click();
  await expect(page.locator(".qa-track-number strong")).toHaveText("002");
  expect(await page.evaluate(() => window.__quranMedia.at(-1).src)).toMatch(
    /002\.mp3$/,
  );
  await page.locator("#viewFullQuran").click();
  await expect(page.locator("#quranModal")).toBeVisible();
  await expect(page.locator("#quranModalContent")).toContainText(
    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  );
  await expect(page.locator("#quranModalContent")).toContainText(
    "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
  );
  expect(errors).toEqual([]);
});
test("player remains usable at phone widths in English, Hindi, Urdu and Arabic", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(root + "#quran");
  for (const lang of ["en", "hi", "ur", "ar"]) {
    await page
      .getByRole("combobox", { name: "Language", exact: true })
      .selectOption(lang);
    await expect(page.locator(".qa-player")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
