import { SITE_PAGES } from "./site-navigation.mjs";
// Verified case-sensitive pages already published with this repository.
// Working inline features (Calendar, Halal, Quran, video, etc.) retain their routes.
export const resourcePages = Object.freeze({
  hajj: SITE_PAGES.hajj,
  umrah: SITE_PAGES.umrah,
  prayer_guide: SITE_PAGES.prayerGuide,
  games_and_puzzles: SITE_PAGES.games,
});
export function resourceHref(id, base = "/") {
  return resourcePages[id] ? `${base}${resourcePages[id]}` : null;
}
