# Quran Surah Video Library

The existing `index.html#video` menu route now renders the dynamic library. Navigation, homepage, footer, Quran reading/audio, native menu JSON, analytics identifiers and Android source remain unchanged.

## Data and updates

`frontend/public/surah_video.json` is the authoritative supplied JSON, published at [surah_video.json](https://er-md-hafiz.github.io/islamicunity-web/surah_video.json) and selected by `commonUrls.quran.surahVideoUrl`. This is the source of Surah video names, order, IDs and links. The component fetches the configured URL at runtime; it does not import the dataset into the JavaScript bundle. Editing this JSON and publishing it updates the library without changes to UI code. The build copies this source to the previous `surah-videos.json` filename for compatibility, preserving edits to the shared URL's file.

The supplied dataset contains 114 Surahs, 66 video entries and 48 Coming Soon entries. Statistics are recalculated from validated records rather than trusting the metadata counters. Records are sorted into Quran order. The complete 114-record structure is required; malformed or incomplete libraries show the retry state. Missing, mismatched or unsafe media fields make that record Coming Soon. No alternate videos or names are substituted.

The fetch has a 12-second timeout, a five-minute in-memory cache, shared concurrent requests and browser HTTP revalidation. Search, filters, player selection and revisiting the route within the cache lifetime do not refetch. Failed requests are not cached; Retry requests fresh data. Route changes ignore obsolete responses.

## Player and usability

- English, Arabic and number search combine with all/available/coming-soon filters; Arabic diacritics and Arabic/Persian digits are normalized.
- Loading skeletons, retry and empty states preserve the surrounding website.
- The modal is created only after a Play Video click. Its responsive 16:9 iframe uses the exact validated `embedUrl`, descriptive title, fullscreen permission and an HTTP referrer. No autoplay parameter or autoplay permission is enabled. Users start playback with YouTube's player controls.
- Only matching HTTPS YouTube embed/watch/shorts/youtu.be URLs are permitted. Credentials, unexpected hosts, autoplay query injection and mismatched IDs are rejected.
- The modal supports in-place Surah selection, Escape/backdrop/close-button dismissal, focus containment/restoration, background inertness and scroll restoration. Closing or navigating away removes the iframe.
- Original YouTube links remain available if embedding is unavailable. Playback restrictions, deleted videos, connectivity and regional/account restrictions are controlled by YouTube.
- Labels support the existing English, Hindi, Urdu and Arabic language selector. Arabic names retain RTL typography. Phone layouts use an edge-to-edge modal to retain usable video dimensions.

YouTube embed behavior follows the [official player documentation](https://developers.google.com/youtube/player_parameters). No new library, backend service or native Android modification is required.

## Verification

- Four data tests cover all 114 records, 66 safe mappings, dynamic counts, order, search/filter combinations and malformed/unsafe data.
- Six production browser tests cover all 66 exact iframe/original-link mappings individually, no initial iframe, direct `index.html#video`, automatic section scrolling, all filters, search/empty states, cache reuse, error/retry recovery, modal switching/focus/disposal and four-language layouts at 360px, 768px and 1440px.
- All 18 production Pages tests pass, including existing audio, navigation and migrated-page regressions. Existing API, audio lifecycle, deployment-order and homepage test suites also pass.
- [YouTube metadata verification](./surah-video-verification.json): **66/66** supplied video entries returned HTTP 200 from YouTube's oEmbed endpoint, with titles recorded. This verifies published metadata, not uninterrupted playback or embedding eligibility in every region.
- A real YouTube embed was loaded in Chrome with the supplied Al-Fatihah ID; its thumbnail and player rendered without JavaScript exceptions. Phone and desktop screenshots were inspected. No iframe is requested before selection.
- Mobile/tablet testing uses Chrome viewport emulation. Physical Android WebView and iOS devices were not tested; no device was available. No changes to native app code or WebView configuration are asserted or required by the observed browser behavior.

```sh
npm run test:video
npm run test:quran
npm run test:resources
npm test
npm run test:ui
# PowerShell production Pages build and UI tests
$env:VITE_BASE_PATH='/islamicunity-web/'
npm run build
npm run test:pages
```

## Files

| File | Change |
| --- | --- |
| `frontend/public/surah-videos.json` | Supplied runtime JSON dataset |
| `frontend/src/video/SurahVideoLibrary.jsx` | Dynamic library, search, filters, modal and accessibility |
| `frontend/src/video/video-data.mjs` | Validation, safe links, counts, normalization and cached fetch |
| `frontend/src/video/video-copy.js` | Four-language labels |
| `frontend/src/video/surah-videos.css` | Scoped responsive emerald/gold styles |
| `frontend/src/main.jsx` | Existing video route integration; skips unused dummy feature fetch |
| `tests/video-data.test.mjs` | Data and security regression coverage |
| `tests/surah-videos.spec.js` | Exhaustive embed mappings and production browser tests |
| `playwright.pages.config.js` | Includes video browser tests |
| `package.json` | Adds `test:video` command |
| `.github/workflows/pages.yml` | Validates video data before deployment |
| `docs/surah-video-verification.json` | All 66 YouTube metadata results |
| `docs/surah-video-library.md` | Integration, verification, update instructions and file list |
| `README.md` | Links to video-library documentation |
