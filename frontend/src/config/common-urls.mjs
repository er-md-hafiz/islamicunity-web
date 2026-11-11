import { requestJson, normalizeContent } from "../../../shared/remote-content.mjs";
export { localized } from "../../../shared/remote-content.mjs";

// Revalidate on every new page visit/retry, share only concurrent requests.
let pending;
export function loadCommonUrls() {
  if (!pending) pending = (async () => {
    const response = await fetch(`${import.meta.env.BASE_URL}menu.json`, {
      cache: "no-cache", signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`Configuration request failed (${response.status})`);
    const menu = await response.json();
    if (!menu.commonUrls) throw new Error("menu.json is missing commonUrls");
    return menu.commonUrls;
  })().finally(() => { pending = null; });
  return pending;
}
export async function loadConfiguredContent(id) {
  const config = await loadCommonUrls();
  return normalizeContent(id, await requestJson(config.content?.[id === "quiz" ? "quizJsonUrl" : "duasJsonUrl"]));
}
export async function loadQuranSources() {
  const { quran } = await loadCommonUrls();
  if (!quran) throw new Error("Quran URLs are missing from menu.json");
  const response = await requestJson(quran.surahUrl);
  const surahs = response.data;
  if (response.code !== 200 || !Array.isArray(surahs) || surahs.length !== 114 ||
      surahs.some((s, i) => s.number !== i + 1 || !s.name || !s.englishName || !Number.isInteger(s.numberOfAyahs)))
    throw new Error("Invalid Quran Surah list");
  if (typeof quran.audioSurahUrl !== "string" || !quran.audioSurahUrl.includes("{number}"))
    throw new Error("Invalid Quran audio URL template");
  return { urls: quran, surahs: surahs.map(s => ({ ...s, arabicName: s.name, ayahCount: s.numberOfAyahs })) };
}
export async function loadQuranText(urls) {
  const [quran, sajda, meta] = await Promise.all([
    requestJson(urls.quranViewUrl),
    requestJson(urls.sajdaUrl?.replace("{edition}", "quran-uthmani")),
    requestJson(urls.metaUrl),
  ]);
  if ([quran, sajda, meta].some(r => r.code !== 200) || !Array.isArray(quran.data?.surahs) ||
      quran.data.surahs.length !== 114 || !Array.isArray(sajda.data?.ayahs) || !Number.isInteger(meta.data?.ayahs?.count))
    throw new Error("Invalid Quran text or metadata");
  return { surahs: quran.data.surahs, sajdas: new Set(sajda.data.ayahs.map(a => a.number)), meta: meta.data };
}
