// Verified case-sensitive pages already published with this repository.
// Working inline features (Calendar, Halal, Quran, video, etc.) retain their routes.
export const resourcePages = Object.freeze({
  hajj: "Hajj.html",
  umrah: "Umrah.html",
  prayer_guide: "PrayerGuide.html",
  games_and_puzzles: "GamesAndPuzzles.html",
});
export function resourceHref(id, base = "/") {
  return resourcePages[id] ? `${base}${resourcePages[id]}` : null;
}
