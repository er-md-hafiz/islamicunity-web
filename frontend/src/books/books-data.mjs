import { loadCommonUrls, loadQuranSources } from "../config/common-urls.mjs";
import { requestJson } from "../../../shared/remote-content.mjs";

export const ARABIC = "quran-uthmani";
// Documented division ranges. Meta supplies their published counts in the UI.
export const divisions = {
  juz: 30,
  page: 604,
  ruku: 556,
  manzil: 7,
  hizbQuarter: 240,
};
const memory = new Map(),
  pending = new Map();
const TTL = 15 * 60 * 1000;
let database;
function db() {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return (database ||= new Promise((resolve) => {
    const request = indexedDB.open("iu-reading", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("responses", { keyPath: "key" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = request.onblocked = () => resolve(null);
  }));
}
async function saved(key, value) {
  try {
    const database = await db();
    if (!database) return null;
    return await new Promise((resolve) => {
      const transaction = database.transaction(
        "responses",
        value ? "readwrite" : "readonly",
      );
      const store = transaction.objectStore("responses");
      const request = value ? store.put({ key, ...value }) : store.get(key);
      request.onsuccess = () => resolve(value || request.result);
      request.onerror = transaction.onabort = () => resolve(null);
      if (value) {
        const all = store.getAll();
        all.onsuccess = () => {
          let bytes = 0;
          all.result
            .sort((a, b) => b.at - a.at)
            .forEach((entry, index) => {
              bytes += JSON.stringify(entry).length * 2;
              if (index >= 64 || bytes > 24 * 1024 * 1024)
                store.delete(entry.key);
            });
        };
      }
    });
  } catch {
    return null;
  } // Private browsing/storage quotas retain network access.
}
export function cachedReading(key, fetcher, { fresh = false } = {}) {
  if (pending.has(key)) return pending.get(key);
  const task = (async () => {
    const previous = memory.get(key) || (await saved(key));
    if (!fresh && previous && Date.now() - previous.at < TTL)
      return {
        data: previous.data,
        offline: typeof navigator !== "undefined" && navigator.onLine === false,
      };
    try {
      const data = await fetcher(),
        entry = { data, at: Date.now() };
      memory.set(key, entry);
      if (memory.size > 64) memory.delete(memory.keys().next().value);
      await saved(key, entry);
      return { data, offline: false };
    } catch (error) {
      if (previous) return { data: previous.data, offline: true };
      throw error;
    }
  })().finally(() => pending.delete(key));
  pending.set(key, task);
  return task;
}
export function loadBooksLibrary(options) {
  return cachedReading(
    "books-library",
    async () => {
      const [sources, common] = await Promise.all([
        loadQuranSources(),
        loadCommonUrls(),
      ]);
      return { ...sources, resources: common.books || {} };
    },
    options,
  );
}
function apiBase(urls) {
  const url = new URL(urls.surahUrl);
  if (url.protocol !== "https:" || !/\/surah\/?$/.test(url.pathname))
    throw new Error("Invalid configured Surah endpoint");
  url.pathname = url.pathname.replace(/surah\/?$/, "");
  url.search = "";
  url.hash = "";
  return url;
}
export function readingUrl(urls, group, number, edition = ARABIC) {
  if (!/^[a-z][a-z0-9.-]{1,63}$/.test(edition))
    throw new Error("Invalid edition");
  if (group === "sajda") {
    const url = new URL(urls.sajdaUrl.replace("{edition}", edition));
    if (url.protocol !== "https:") throw new Error("Invalid Sajda URL");
    return url.href;
  }
  if (group === "edition")
    return new URL("edition?format=text", apiBase(urls)).href;
  if (group === "search") {
    if (typeof number !== "string" || !number.trim() || number.length > 128)
      throw new Error("Invalid search words");
    return new URL(
      `search/${encodeURIComponent(number.trim())}/all/${edition}`,
      apiBase(urls),
    ).href;
  }
  if (group === "ayah") {
    if (!/^(?:[1-9]\d{0,3}|[1-9]\d{0,2}:[1-9]\d{0,2})$/.test(String(number)))
      throw new Error("Invalid Ayah reference");
    const parts = String(number).split(":").map(Number);
    if (parts.length === 1 ? parts[0] > 6236 : parts[0] > 114 || parts[1] > 286)
      throw new Error("Invalid Ayah reference");
  } else if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > (group === "surah" ? 114 : divisions[group] || 0)
  )
    throw new Error("Invalid reading division");
  return new URL(`${group}/${number}/${edition}`, apiBase(urls)).href;
}
async function apiData(url) {
  const response = await requestJson(url);
  if (response.code !== 200 || response.data == null)
    throw new Error("Invalid Quran response");
  return response.data;
}
export function validateVerses(data, surah) {
  const rows = Array.isArray(data?.ayahs)
    ? data.ayahs
    : data?.text
      ? [data]
      : [];
  const seen = new Set();
  if (!rows.length) throw new Error("No verses were returned");
  return rows.map((a) => {
    const chapter =
      a.surah || surah || (data.number && data.name ? data : null);
    if (
      !Number.isInteger(a.number) ||
      a.number < 1 ||
      a.number > 6236 ||
      seen.has(a.number) ||
      typeof a.text !== "string" ||
      !a.text.trim() ||
      !Number.isInteger(a.numberInSurah) ||
      a.numberInSurah < 1 ||
      !Number.isInteger(chapter?.number) ||
      chapter.number < 1 ||
      chapter.number > 114
    )
      throw new Error("Invalid Quran verse");
    seen.add(a.number);
    return {
      ...a,
      surah: {
        number: chapter.number,
        name: chapter.name,
        englishName: chapter.englishName,
      },
    };
  });
}
export async function loadPassage(
  urls,
  group,
  number,
  edition = ARABIC,
  options,
) {
  const url = readingUrl(urls, group, number, edition);
  return cachedReading(
    url,
    async () => validateVerses(await apiData(url)),
    options,
  );
}
function loadCompleteQuran(urls, options) {
  return cachedReading(
    urls.quranViewUrl,
    async () => {
      const data = await apiData(urls.quranViewUrl);
      if (!Array.isArray(data.surahs) || data.surahs.length !== 114)
        throw new Error("Incomplete Quran response");
      // Parse once; never refetch the full Quran for every chapter selection.
      return data.surahs.map((s, index) => {
        if (s.number !== index + 1) throw new Error("Invalid Surah order");
        return { ...s, ayahs: validateVerses(s, s) };
      });
    },
    options,
  );
}
export async function loadCompleteSurah(urls, number, options) {
  if (!Number.isInteger(number) || number < 1 || number > 114)
    throw new Error("Invalid Surah number");
  const response = await loadCompleteQuran(urls, options);
  return {
    ...response,
    data: response.data.find((s) => s.number === number)?.ayahs || [],
  };
}
export function loadEditions(urls, options) {
  const url = readingUrl(urls, "edition");
  return cachedReading(
    url,
    async () => {
      const data = await apiData(url);
      if (!Array.isArray(data) || !data.length)
        throw new Error("No editions available");
      const text = data.filter(
        (e) =>
          e.format === "text" &&
          typeof e.identifier === "string" &&
          /^[a-z][a-z0-9.-]{1,63}$/.test(e.identifier),
      );
      if (!text.length) throw new Error("No text editions available");
      return text;
    },
    options,
  );
}
export function loadMetadata(urls, options) {
  return cachedReading(
    urls.metaUrl,
    async () => {
      const data = await apiData(urls.metaUrl);
      if (data.surahs?.count !== 114 || !Number.isInteger(data.ayahs?.count))
        throw new Error("Invalid Quran metadata");
      return data;
    },
    options,
  );
}
export async function searchVerses(urls, words, edition, page = 0, options) {
  const url = readingUrl(urls, "search", words, edition);
  const response = await cachedReading(
    url,
    async () => {
      const data = await apiData(url);
      if (!Array.isArray(data.matches))
        throw new Error("Invalid search response");
      return data.matches;
    },
    options,
  );
  const matches = response.data.slice(page * 20, (page + 1) * 20);
  if (edition === ARABIC || !matches.length) return {
    data: matches.map(match => validateVerses({ ayahs: [match] })[0]),
    total: response.data.length, offline: response.offline,
  };
  // Some individual Ayah responses omit CORS headers at the provider's edge.
  // One shared, configured Quran response supplies Arabic display text for all
  // result pages. Keyword matching remains entirely on the Search API.
  const arabic = await loadCompleteQuran(urls, options);
  const byNumber = new Map(arabic.data.flatMap(s => s.ayahs).map(a => [a.number, a]));
  const rows = matches.map(match => {
    const verse = byNumber.get(match.number);
    if (!verse || typeof match.text !== "string") throw new Error("Invalid search match");
    return { ...verse, translation: match.text };
  });
  return { data: rows, total: response.data.length, offline: response.offline || arabic.offline };
}
export function safeResourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
