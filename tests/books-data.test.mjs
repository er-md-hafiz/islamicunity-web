import test from "node:test";
import assert from "node:assert/strict";
import {
  ARABIC,
  cachedReading,
  divisions,
  readingUrl,
  safeResourceUrl,
  validateVerses,
} from "../frontend/src/books/books-data.mjs";
const urls = {
  surahUrl: "https://configured.example/custom/v1/surah",
  sajdaUrl: "https://configured.example/custom/v1/sajda/{edition}",
};
test("reading operations derive their origin/base from configuration and enforce documented division ranges", () => {
  for (const [group, maximum] of Object.entries({ surah: 114, ...divisions })) {
    for (const number of [1, maximum])
      assert.equal(
        readingUrl(urls, group, number),
        `https://configured.example/custom/v1/${group}/${number}/${ARABIC}`,
      );
    for (const number of [0, maximum + 1, 1.5, "1", NaN])
      assert.throws(() => readingUrl(urls, group, number));
  }
  assert.equal(
    readingUrl(urls, "sajda", 0, "ur.jalandhry"),
    "https://configured.example/custom/v1/sajda/ur.jalandhry",
  );
  assert.equal(
    readingUrl(urls, "edition"),
    "https://configured.example/custom/v1/edition?format=text",
  );
});
test("search text is one encoded path segment and edition/reference injection is rejected", () => {
  assert.equal(
    new URL(readingUrl(urls, "search", "mercy / & hope", "en.asad")).pathname,
    "/custom/v1/search/mercy%20%2F%20%26%20hope/all/en.asad",
  );
  for (const reference of [0, 6237, "115:1", "2:287", "../surah"])
    assert.throws(() => readingUrl(urls, "ayah", reference));
  assert.equal(
    readingUrl(urls, "ayah", "2:255"),
    "https://configured.example/custom/v1/ayah/2:255/quran-uthmani",
  );
  assert.throws(() => readingUrl(urls, "search", "", "en.asad"));
  assert.throws(() => readingUrl(urls, "surah", 1, "../bad"));
});
test("Quran, division, single-Ayah and Sajda shapes retain exact Arabic and validated references", () => {
  const verse = {
    number: 1,
    numberInSurah: 1,
    text: "بِسْمِ ٱللَّهِ",
    surah: { number: 1, name: "الفاتحة", englishName: "Al-Fatihah" },
  };
  assert.equal(
    validateVerses({ ayahs: [verse], surahs: { 1: verse.surah } })[0].text,
    verse.text,
  );
  assert.equal(validateVerses(verse)[0].number, 1);
  assert.equal(
    validateVerses({
      ...verse.surah,
      ayahs: [{ ...verse, surah: undefined }],
    })[0].surah.number,
    1,
  );
  assert.throws(() => validateVerses({ ayahs: [verse, verse] }));
  assert.throws(() => validateVerses({ ayahs: [{ ...verse, number: 6237 }] }));
  assert.throws(() => validateVerses({ ayahs: [] }));
});
test("concurrent loads share requests, cached data reopens offline, and failed uncached requests remain retryable", async () => {
  let calls = 0;
  const fetcher = async () => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return ["saved reading"];
  };
  const key = "test-cache-" + Math.random();
  const [first, second] = await Promise.all([
    cachedReading(key, fetcher),
    cachedReading(key, fetcher),
  ]);
  assert.deepEqual(first, second);
  assert.equal(calls, 1);
  await cachedReading(key, fetcher);
  assert.equal(calls, 1);
  const offline = await cachedReading(
    key,
    async () => {
      throw Error("offline");
    },
    { fresh: true },
  );
  assert.equal(offline.offline, true);
  assert.deepEqual(offline.data, ["saved reading"]);
  const failed = key + "failed";
  await assert.rejects(
    cachedReading(failed, async () => {
      throw Error("fail");
    }),
  );
  assert.deepEqual((await cachedReading(failed, fetcher)).data, [
    "saved reading",
  ]);
});
test("resource links reject executable, relative and credential-bearing URLs", () => {
  for (const url of [
    "javascript:alert(1)",
    "/file.pdf",
    "http://example.test/quran.pdf",
    "https://user:pass@example.test/quran.pdf",
    null,
  ])
    assert.equal(safeResourceUrl(url), null);
  assert.equal(
    safeResourceUrl("https://example.test/quran.pdf"),
    "https://example.test/quran.pdf",
  );
});
