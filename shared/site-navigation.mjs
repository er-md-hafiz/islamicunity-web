export const SITE_BASE_URL = "https://er-md-hafiz.github.io/islamicunity-web/";

// Actual case-sensitive files in frontend/public, plus Vite's index entry.
export const SITE_PAGES = Object.freeze({
  home: "index.html",
  privacy: "PrivacyPolicy.html",
  terms: "terms_and_conditions.html",
  about: "SupportOurCommunity.html",
  hajj: "Hajj.html",
  umrah: "Umrah.html",
  donate: "donate.html",
  library: "islamicunity.html",
  prayerGuide: "PrayerGuide.html",
  games: "GamesAndPuzzles.html",
  zakat: "ZakatCalculator.html",
  charity: "IslamicCharity.html",
  currency: "CurrencyGuide.html",
  quiz: "quiz.html",
  downloadQr: "download-app-qr.html",
  promotion: "iu_ads.html",
});

// The optional base keeps development and repository-subdirectory links portable.
export function sitePageHref(page, base = SITE_BASE_URL) {
  if (!Object.hasOwn(SITE_PAGES, page)) throw new Error(`Unknown website page: ${page}`);
  return `${base.replace(/\/?$/, "/")}${SITE_PAGES[page]}`;
}
