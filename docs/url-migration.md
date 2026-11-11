# Canonical website URL migration

All internal website navigation uses **https://er-md-hafiz.github.io/islamicunity-web/**. The shared footer's 13 internal links resolve to seven existing pages on the canonical website. A subsequent explicit configuration request retains four exact legacy content/page endpoints inside `menu.json` → `commonUrls`. These configuration values are narrowly allowlisted; website navigation and footer links continue to use the canonical repository.

## Destinations and centralized configuration

`shared/site-navigation.mjs` defines `SITE_BASE_URL`, the case-sensitive `SITE_PAGES` mapping and `sitePageHref()`. Footer links, the footer home link, homepage donation CTA, sidebar donation link, shared resource navigation and legacy dashboard feature navigation reuse this configuration. Relative Vite bases still support localhost and repository-subdirectory deployment.

| Footer destination | Existing local page | Result |
| --- | --- | --- |
| Privacy Policy | `PrivacyPolicy.html` | HTTP 200 |
| Terms & Conditions | `terms_and_conditions.html` | HTTP 200 |
| About Us | `SupportOurCommunity.html` | HTTP 200 |
| Hajj Information | `Hajj.html` | HTTP 200 |
| Umrah Information | `Umrah.html` | HTTP 200 |
| Donate & Support | `donate.html` | HTTP 200 |
| Existing articles/calendar/support links | `islamicunity.html` | HTTP 200 |

Original filenames and existing destinations are preserved. The audit confirms all 16 configured HTML paths already exist (the Vite index and 15 standalone pages). No page needed to be created, duplicated, redirected to an unrelated destination, or replaced with an intermediary. These pages already include the shared footer and retain their content and functionality.

External Google Play, Instagram/YouTube/social configuration, Aladhan, Quran streaming, video embeds, CDN assets, map providers, mailto and the optional REST API configuration are unchanged. The existing Google Play query parameters and website hash navigation remain intact. Native JSON menu shape and identifiers are unchanged.

## Verification and regression prevention

`npm run test:urls` recursively audits project text files, generated static JSON and the production build for unapproved retired hostname/path values, including escaped slash variants. Only the four exact requested `commonUrls` fields in the synchronized menu copies are exempt; using those URLs elsewhere or changing their paths still fails. It ignores dependency folders, Git history, local tool scratch files and unrelated build caches, none of which are published. It separately checks that every configured page and all 13 internal footer destinations exist with exact filenames. GitHub Pages runs this check **after the production build**, before publication.

`npm run test:resources` continues verifying imported HTML hashes, binary assets, local references and native menu compatibility. The migration does not change imported page contents.

Final local validation passed all 61 automated tests (25 production browser, 13 app/homepage browser, six API, ten audio lifecycle, four video-data and three deployment-order tests), plus the URL and resource-integrity audits.

The footer/navigation browser suite now additionally opens all seven migrated destinations and refreshes each at 390px and 1440px, checking HTTP status, footer rendering, JavaScript errors, missing local assets and any request to the retired repository. Existing footer, responsive/dark/RTL, direct-resource, games, Quran audio and video coverage is retained. [Current destination checks](./footer-link-verification.json) record successful HTTP probes.

`adb devices -l` reported no connected Android device or emulator. Responsive Chrome testing is completed; real Android WebView validation cannot be claimed without a device. No native code or WebView setting was changed.

## Files changed

- `shared/site-navigation.mjs`, `shared/resource-navigation.mjs`
- `frontend/src/footer/footer-data.mjs`, `register-footer.js`, `legacy-entry.js`
- `frontend/src/LandingPage.jsx`, `frontend/src/main.jsx`
- `scripts/audit-internal-urls.mjs`, `package.json`, `.github/workflows/pages.yml`
- `tests/footer-navigation.spec.js`
- `docs/footer-link-verification.json`, `docs/global-footer-navigation.md`, this report and `README.md`
