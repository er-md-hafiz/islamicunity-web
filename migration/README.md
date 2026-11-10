# Android web-resource migration

The source static-resource repository was copied from commit `49cbd41f6fc3acc5f9cc001daa833c029ee3de5c`. The source repository has not been edited, removed, or redirected. The published root is:

**https://er-md-hafiz.github.io/islamicunity-web/**

## Published resources

Vite copies everything in `frontend/public/` to the root of `frontend/dist/`. This preserves the Android app's exact URL paths while keeping the React homepage at `/index.html`. There was no source `index.html`; the existing React homepage is retained.

- 15 HTML files: `CurrencyGuide.html`, `GamesAndPuzzles.html`, `Hajj.html`, `IslamicCharity.html`, `PrayerGuide.html`, `PrivacyPolicy.html`, `SupportOurCommunity.html`, `Umrah.html`, `ZakatCalculator.html`, `donate.html`, `download-app-qr.html`, `islamicunity.html`, `iu_ads.html`, `quiz.html`, `terms_and_conditions.html`.
- Three JSON files: `menu.json`, `quiz.json` (100 questions), and `duas.json` (130 entries).
- 22 original icons under `menu_icons/`, plus `calender.png`, an identical compatibility alias for `calendar.png` matching the menu's existing spelling.
- Five additional assets: `ic_icon.svg`, `iu.svg`, `iu_logo.svg`, `qr_code.jpeg`, and `qr_code.png`.

`resource-manifest.json` records every source and migrated hash, byte count, the source commit, and a fingerprint of the menu with only URL/icon fields removed. PNG/JPEG bytes are preserved. HTML changes replace previous owned origins and make owned `href`/`src` references relative. One additional compatibility fix constrains the donation dialog to the viewport and allows scrolling, so its close button remains reachable on smaller screens. External service URLs and existing donation account details are retained. Existing third-party CDN libraries, fonts, flag images, and APIs still require internet access.

The root Android menu, `backend/menu.json`, the REST `/api/menu` response, and the generated `/data/menu.json` have identical configuration. Version 2, item IDs, fragment destinations, analytics keys, actions, spans, enablement, visibility, and the external currency API remain unchanged. Do not increment the schema version merely to invalidate a cache without checking the Android parser.

## Validation

Migrated HTML, JSON, and SVG text uses LF line endings. `.gitattributes` preserves those endings so the recorded hashes remain identical on Windows and on GitHub's Linux build runners. Image bytes are unchanged.

```sh
npm run test:resources
# Build with VITE_BASE_PATH=/islamicunity-web/ for the following production checks:
npm run build
npm run test:pages
```

The resource validator checks exact case-sensitive paths, hashes, JSON parsing, every owned menu URL/icon, HTML-owned links and image references, absence of previous owned origins, and native menu compatibility. The build refuses mismatched Android/REST menus. CI runs this validator before deployment. Browser tests check all published resource responses, all 15 HTML pages, guide language controls, the Zakat calculator, quiz navigation, a game tab, the donation QR, and the amount-selection modal. They do not trigger a payment or a share action.

## Android configuration and QA

The app's menu/config endpoint must be:

`https://er-md-hafiz.github.io/islamicunity-web/menu.json`

If the Android app obtains that address from a remote configuration, change that configuration. If the address is compiled into the APK, an Android source change and app release are needed. This repository contains the web application and the original Kotlin web prototype, not the Android app's source or a release APK, so its compiled URL has not been changed here.

The Android SDK is available, but no device or emulator was connected during migration. Mobile Chromium checks are not a substitute for a native WebView/device test. On a fresh Android install (and separately after clearing stale configuration), verify menu loading, all fragment destinations, all WebView pages, the icon alias, Rate/Share native actions, and failure behavior without internet. Keep the source repository live until cached/older clients have transitioned.

The root JSON endpoint is a real JSON document, not an HTML redirect. A cached or hardcoded old menu address will not automatically move simply because the new files exist.
