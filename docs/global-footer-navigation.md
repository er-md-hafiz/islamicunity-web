# Global footer and direct resource navigation

## Integration

The homepage, every React tool section (including Quran and the video library), and all 15 standalone HTML pages now mount the same `iu-site-footer` component. The React wrapper and the small legacy entry share one implementation, link configuration and stylesheet. An open shadow root prevents legacy page styles from changing the footer, and prevents footer styles from changing the page. No dependency was added.

The footer follows the supplied emerald/gold design with four desktop columns, two tablet columns, and a stacked phone layout. It contains the exact supplied Quick Links, Islamic Resources and Contact URLs, the supplied email, a dynamic copyright year, and a current-document Back to top button. Reduced-motion preferences suppress smooth scrolling. Focus styling, labelled navigation, readable contrast and 44px link/icon targets are included. English supplied copy has its own language/direction so it stays readable on Arabic/Urdu pages and in dark themes.

No official social profile URLs were configured in this project. The user confirmed: **use the Islamic Unity website link and leave unverified social profiles unlinked**. Facebook, Instagram, X and YouTube therefore appear as accessible, unlinked icons. `footer-data.mjs` can receive verified profiles later; configured social links open in a new tab with `noopener noreferrer`. No social handles, demo profiles or `href="#"` links were invented. The existing website privacy destination remains available alongside the new app-policy link.

The duplicate dashboard footer was replaced. Other legacy legal/contact/charity/calculator notes are preserved as styled content sections before the global footer. Donation and QR body layouts now stack vertically so their existing content stays above the footer; payment recipients, amounts, QR code and payment behavior are unchanged. Imported resource hashes were refreshed in the migration manifest, while native menu IDs, fragments, analytics, visibility and binary resources remain unchanged.

## Direct destinations

| Resource | Destination | Behavior |
| --- | --- | --- |
| Hajj | `Hajj.html` | Direct sidebar link; old `#hajj` links replace the current entry with the full page |
| Umrah | `Umrah.html` | Direct sidebar link; old `#umrah` compatibility |
| Prayer Guide | `PrayerGuide.html` | Direct sidebar link; old `#prayer_guide` compatibility |
| Games & Puzzles | `GamesAndPuzzles.html` | Direct sidebar link; old `#games_and_puzzles` compatibility |
| Sidebar Donate | `donate.html` | Direct full resource; homepage `#donate` section remains intact |
| Halal | `index.html#halal` | Existing actual learning content retained; no standalone Halal filename was guessed |
| Calendar | `index.html#calendar` | Existing working Islamic calendar retained |
| Books/photo/map resource cards | Their existing configured URLs | The entire card is now a direct link, without an extra Open resource button |
| Legacy dashboard Hajj/Zakat/Charity | Existing `Hajj.html`, `ZakatCalculator.html`, `IslamicCharity.html` | Bypasses the simulated feature-details modal |
| Legacy dashboard Halal | `index.html#halal` | Opens existing content directly |

Working inline tools such as Zakat, currency, quiz, Quran and video remain available. Features without an actual verified destination keep their existing fallback. No duplicate resource page, redirect HTML file, unrelated destination or Android native change was introduced. The old fallback resource wording was removed from the REST/static export responses as well as the active UI.

The footer uses the explicitly supplied `islamicunity-api` URLs. Those are separate external pages; this repository's shared footer is installed on the local published resource copies, not on another repository's source. The existing public API URLs were checked rather than replaced with guessed paths.

## Verification

- All **eight unique external URLs** in the supplied footer return HTTP 200: see [link report](./footer-link-verification.json). Mailto is checked as an exact attribute without sending email.
- Six new browser tests verify footer coverage across every menu route and all 15 HTML pages, every supplied link, social configuration, dynamic year, desktop/tablet/phone layout, dark/RTL layout, Back to top, direct resource clicks, old hashes, whole-card links and legacy feature navigation.
- Existing resource integrity tests continue checking all 45 files, the compatibility alias and native menu identifiers. Calculator, quiz, games, guide language switching, donation controls, Quran text/audio and video regression tests remain passing.
- Desktop and mobile footer screenshots were inspected. The donation page was checked at 390px with no horizontal overflow. No payment, email, subscription or social action was initiated.
- The build and all 60 automated tests passed: 24 production browser tests, 13 original app/homepage browser tests, 10 Quran lifecycle tests, four video-data tests, six API tests and three deployment-order tests. Resource-integrity validation passes separately.
- Physical Android/iOS devices were not available; phone/tablet checks use Chrome viewport emulation.

## Changed files

- Shared footer: `frontend/src/footer/SiteFooter.jsx`, `register-footer.js`, `footer-data.mjs`, `site-footer.css`, `legacy-entry.js`.
- Routing/UI: `shared/resource-navigation.mjs`, `frontend/src/main.jsx`, `frontend/src/LandingPage.jsx`, `frontend/vite.config.js`.
- Standalone footer mounts: `frontend/public/CurrencyGuide.html`, `donate.html`, `download-app-qr.html`, `GamesAndPuzzles.html`, `Hajj.html`, `IslamicCharity.html`, `islamicunity.html`, `iu_ads.html`, `PrayerGuide.html`, `PrivacyPolicy.html`, `quiz.html`, `SupportOurCommunity.html`, `terms_and_conditions.html`, `Umrah.html`, `ZakatCalculator.html`.
- Resource exports/integrity: `backend/server.js`, `frontend/scripts/export-static.mjs`, `migration/resource-manifest.json`.
- Tests: `tests/footer-navigation.spec.js`, `tests/app.spec.js`, `tests/homepage.spec.js`, `tests/pages.spec.js`, `playwright.pages.config.js`.
- Documentation: this file, `docs/footer-link-verification.json`, `README.md`.
