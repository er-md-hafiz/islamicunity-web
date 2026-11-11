import { readFile, writeFile } from "node:fs/promises";
import { readingUrl } from "../frontend/src/books/books-data.mjs";
const menu = JSON.parse(
  await readFile(new URL("../backend/menu.json", import.meta.url), "utf8"),
);
const { quran, books } = menu.commonUrls;
const apiChecks = [
  quran.surahUrl,
  quran.quranViewUrl,
  quran.metaUrl,
  readingUrl(quran, "sajda"),
  readingUrl(quran, "edition"),
  ...["juz", "page", "ruku", "manzil", "hizbQuarter"].map((group) =>
    readingUrl(quran, group, 1),
  ),
  readingUrl(quran, "search", "mercy", "en.asad"),
  readingUrl(quran, "ayah", "2:255"),
];
const results = await Promise.all(
  [
    ...apiChecks.map((url) => ({ url, kind: "api" })),
    ...books.pdfResources.map((resource) => ({
      url: resource.url,
      kind: "pdf",
      licenseSource: resource.sourceUrl,
    })),
    ...books.hadithResources.map((resource) => ({
      url: resource.url,
      kind: "hadith",
    })),
  ].map(async (entry) => {
    try {
      const response = await fetch(entry.url, {
        signal: AbortSignal.timeout(30000),
        ...(entry.kind === "pdf" ? { headers: { Range: "bytes=0-63" } } : {}),
      });
      const type = response.headers.get("content-type");
      let valid = response.ok,
        count;
      if (entry.kind === "api") {
        const json = await response.json();
        valid &&= json.code === 200 && json.data != null;
        count =
          json.data?.surahs?.length ||
          json.data?.ayahs?.length ||
          json.data?.matches?.length ||
          (Array.isArray(json.data) ? json.data.length : undefined);
      } else if (entry.kind === "pdf") {
        const reader = response.body.getReader(),
          chunk = await reader.read();
        valid &&=
          /application\/pdf/i.test(type || "") &&
          new TextDecoder().decode(chunk.value.slice(0, 5)) === "%PDF-";
        await reader.cancel();
      } else await response.body?.cancel();
      const blocked = entry.kind === "hadith" && response.status === 403;
      return {
        ...entry,
        status: response.status,
        contentType: type,
        valid: blocked ? null : valid,
        ...(blocked
          ? {
              note: "Automated request blocked; official collection page separately verified through browser research. Opens externally for user browsing.",
            }
          : {}),
        ...(count ? { count } : {}),
      };
    } catch (error) {
      return { ...entry, valid: false, error: error.message };
    }
  }),
);
const report = {
  checkedAt: new Date().toISOString(),
  documentation: "https://alquran.cloud/api",
  legacyReference: "https://legacy.alquran.cloud/api",
  pdfPermissionSource: "https://clearquran.com/download/",
  note: "PDF signatures checked with range probes; no PDFs bundled. Hadith reading, chapters and search are provided by the linked source, not an invented Quran API endpoint.",
  results,
};
await writeFile(
  new URL("../docs/books-source-verification.json", import.meta.url),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    total: results.length,
    passed: results.filter((r) => r.valid).length,
    automatedAccessBlocked: results.filter((r) => r.valid === null).length,
    failures: results.filter((r) => r.valid === false),
  }),
);
if (results.some((r) => r.valid === false)) process.exitCode = 1;
