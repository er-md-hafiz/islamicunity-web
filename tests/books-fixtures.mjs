import { menu, mockSharedData, surahs } from "./remote-fixtures.mjs";
export { menu };
let absolute = 0;
export const chapters = surahs.map((s) => ({
  ...s,
  revelationType: s.number === 2 ? "Medinan" : "Meccan",
  ayahs: Array.from({ length: s.numberOfAyahs }, (_, index) => ({
    number: ++absolute,
    numberInSurah: index + 1,
    text:
      s.number === 1 && index === 0
        ? "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
        : `آية الاختبار ${s.number}:${index + 1}`,
    surah: { number: s.number, name: s.name, englishName: s.englishName },
  })),
}));
export const editions = [
  {
    identifier: "quran-uthmani",
    language: "ar",
    type: "quran",
    format: "text",
    name: "العثماني",
    englishName: "Uthmani",
  },
  {
    identifier: "en.asad",
    language: "en",
    type: "translation",
    format: "text",
    name: "Muhammad Asad",
    englishName: "Muhammad Asad",
  },
  {
    identifier: "hi.hindi",
    language: "hi",
    type: "translation",
    format: "text",
    name: "हिन्दी",
    englishName: "Hindi",
  },
  {
    identifier: "ur.jalandhry",
    language: "ur",
    type: "translation",
    format: "text",
    name: "اردو",
    englishName: "Urdu",
  },
];
export const meta = Object.fromEntries(
  Object.entries({
    surahs: 114,
    ayahs: 6236,
    juzs: 30,
    pages: 604,
    rukus: 556,
    manzils: 7,
    hizbQuarters: 240,
    sajdas: 15,
  }).map(([key, count]) => [key, { count }]),
);
export async function mockBooks(page, config = menu) {
  await mockSharedData(page);
  await page.route("https://fonts.googleapis.com/**", (r) => r.abort());
  await page.route("https://fonts.gstatic.com/**", (r) => r.abort());
  await page.route("https://api.aladhan.com/**", (r) => r.abort());
  await page.route("**/menu.json", (r) => r.fulfill({ json: config }));
  const q = config.commonUrls.quran,
    base = new URL(q.surahUrl),
    prefix = base.pathname.replace(/surah\/?$/, "");
  await page.route(base.origin + "/**", async (route) => {
    const url = new URL(route.request().url()),
      parts = url.pathname
        .slice(prefix.length)
        .split("/")
        .map(decodeURIComponent);
    const [group, number, edition] = parts;
    let data;
    const translate = (rows) =>
      rows.map((a) => ({
        ...a,
        text:
          edition && edition !== "quran-uthmani"
            ? `Translation ${edition} ${a.surah.number}:${a.numberInSurah}`
            : a.text,
      }));
    if (url.href === q.quranViewUrl) data = { surahs: chapters };
    else if (url.href === q.surahUrl)
      data = chapters.map(({ ayahs, ...s }) => s);
    else if (group === "edition") data = editions;
    else if (group === "meta") data = meta;
    else if (group === "search")
      data = {
        count: 45,
        matches: chapters
          .flatMap((s) => s.ayahs)
          .slice(0, 45)
          .map((a) => ({
            ...a,
            text:
              parts[3] === "quran-uthmani"
                ? a.text
                : `Translation of match ${a.number}`,
          })),
      };
    else if (group === "ayah") {
      const row = number.includes(":")
        ? chapters[Number(number.split(":")[0]) - 1]?.ayahs[
            Number(number.split(":")[1]) - 1
          ]
        : chapters
            .flatMap((s) => s.ayahs)
            .find((a) => a.number === Number(number));
      data = row && translate([row])[0];
    } else if (group === "surah")
      data = {
        ...chapters[Number(number) - 1],
        ayahs: translate(chapters[Number(number) - 1]?.ayahs || []),
      };
    else if (group === "sajda")
      data = {
        ayahs: translate([
          { ...chapters[6].ayahs[205], sajda: { recommended: true } },
        ]),
      };
    else if (["juz", "page", "ruku", "manzil", "hizbQuarter"].includes(group))
      data = {
        number: Number(number),
        ayahs: translate(chapters[1].ayahs.slice(0, 3)),
        surahs: { 2: chapters[1] },
      };
    else return route.fallback();
    return route.fulfill({
      json: data ? { code: 200, data } : { code: 404, data: null },
      status: data ? 200 : 404,
    });
  });
}
