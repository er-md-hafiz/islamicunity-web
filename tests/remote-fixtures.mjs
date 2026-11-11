import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(path, "utf8"));
export const menu = read("backend/menu.json");
export const quiz = read("frontend/public/quiz.json");
export const duas = read("frontend/public/duas.json");
export const surahs = read("frontend/src/quran/surahs.json").map(s => ({ number: s.number, name: s.arabicName, englishName: s.englishName, numberOfAyahs: s.ayahCount }));
export const videos = read("frontend/public/surah-videos.json");
export async function mockSharedData(page) {
  const c = menu.commonUrls;
  for (const [url, json] of [
    [c.content.quizJsonUrl, quiz], [c.content.duasJsonUrl, duas],
    [c.quran.surahUrl, { code: 200, data: surahs }],
    [c.quran.quranViewUrl, { code: 200, data: { surahs: surahs.map(s => ({ ...s, ayahs: [{ number: s.number, numberInSurah: 1, text: `آية ${s.number}` }] })) } }],
    [c.quran.sajdaUrl.replace("{edition}", "quran-uthmani"), { code: 200, data: { ayahs: [{ number: 32 }] } }],
    [c.quran.metaUrl, { code: 200, data: { surahs: { count: 114 }, ayahs: { count: 6236 } } }],
    [c.quran.surahVideoUrl, videos],
  ]) await page.route(url, route => route.fulfill({ json }));
}
