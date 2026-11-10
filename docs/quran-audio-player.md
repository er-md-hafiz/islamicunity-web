# Quran audio player delivery

## Integration

- The existing React Quran route, `/#quran`, retains its daily Arabic verse, translations, transliteration, reflection, and Hindi reading aid. The recitation player is added immediately below those existing reading controls.
- The existing `islamicunity.html` WebView/dashboard retains its Quran widget, original six-Surah reading list, bookmarks, reading modal, Arabic text, and translation. Only its simulated playback controls/timer are replaced. Its existing Play buttons now call the same real player through a small event bridge.
- Both views use `QuranAudioPlayer.jsx` and the same HTML5 controller. There is no separate audio page or second implementation. The WebView widget uses an isolated style root and a compiled `assets/quran-audio.js` entry; the normal Vite build publishes the entry and its shared dependencies.
- `menu.json`, fragment destinations, analytics keys, and native Android source are unchanged. The existing sample reading material is preserved; this audio change does not replace it with a new Quran text database.

## Source and metadata

All 114 tracks use exactly:

`https://cdn.mp3quran.net/audio/mishary-alafasy/r1/NNN.mp3`

`getSurahAudioUrl(number)` rejects non-integers and values outside 1–114, and pads filenames to three digits: `001.mp3`, `010.mp3`, `114.mp3`. No fallback reciter, synthetic recitation, or alternative CDN is used.

The local structured metadata contains all 114 Arabic/English names and Ayah counts, obtained from the [Quran.com chapters API](https://api.quran.com/api/v4/chapters?language=en). Chapter numbers are consecutive and the Ayah counts total 6,236. Search supports numbers, Arabic names (including diacritic-insensitive matching), and transliterated English names. Metadata does not require runtime network calls.

The player identifies **Mishary Rashid Alafasy** and links the attribution **Quran audio recitation provided by MP3Quran.net** to the original provider. The provider's [official privacy/usage policy](https://mp3quran.org/eng/privacy), checked on 2026-11-10, permits visitors and developers to use its material or links and identifies the alternate domains it owns. The canonical `www.mp3quran.net/eng/privacy` endpoint returned 403 to the research client, so the provider's accessible official alternate-domain policy was reviewed. Recordings are streamed directly; no audio is rehosted or bundled.

## Behavior

- Native HTML5 Audio handles playback, metadata, time updates, duration, seeking, buffering, play/pause, end, error, volume and rate changes.
- All controls have accessible names, visible focus states, touch targets, and English/Hindi/Urdu/Arabic labels. Arabic names have explicit RTL direction. The UI supports mobile layouts and reduced motion.
- Audio objects and sources are created only after an explicit Play action. `preload="none"` is set before loading. Merely opening the page, searching, or selecting a Surah does not request MP3 data.
- Selecting a Surah, Previous, or Next stops/releases the old source, resets duration/progress, and waits for Play. Previous is disabled at 1 and Next at 114. Explicit row Play buttons select and play in one user action.
- Auto Play Next Surah starts **off**, advances only on a completed recitation when enabled, and stops after An-Nas. No next track is preloaded.
- Supported speeds are 0.75×, 1×, 1.25×, 1.5×, and 2×. Volume, mute, and speed survive track changes within the mounted player.
- Seeking is disabled until finite metadata is available. Values are clamped to the recording duration. Media requests use the original HTTPS server's byte-range support.
- Network/offline errors, unsupported recordings, blocked playback, interruption, and 20-second loading/buffering timeouts produce a visible error and Retry control. Retry reloads only the selected source. Previous pending promises and events cannot revive a released recording.
- Leaving the React Quran page pauses and releases audio. No service worker, background scheduling, microphone, autoplay permission bypass, or Android native change is introduced.

## Verification results

The checked-in [114-track report](./quran-audio-verification.json) records a HEAD request and a tiny `Range: bytes=0-1` probe for **every** track:

- **114/114** returned successful MP3 headers.
- **114/114** returned `206` with the expected byte range.
- **Zero inaccessible URLs** at the recorded check time.
- Probe responses were canceled; no MP3 files were saved or published.

The separate [real-browser report](./quran-browser-playback.json) records actual Chrome MP3 decoding/playback for Surahs **1, 2, 10, 18, 36, 55, 67, 112, 113, and 114**, including finite durations and advancing playback time. It also covers first-track seek/resume and control interactions, plus real Surah 1 playback in a phone-sized Chrome viewport and the legacy WebView widget. This is real CDN playback, distinct from the deterministic media-event tests.

Automated tests additionally cover all metadata/URLs, no initial audio request, search, boundaries, controls, auto-next, stale-promise races, offline/retry, load timeouts, route disposal, legacy reader preservation, mobile layout, and language switching. The existing API, navigation, homepage, and migrated-resource tests are retained.

### Android result and remaining limits

The Android SDK was checked with `adb devices -l`; **no physical device or emulator was connected**. Chrome desktop/mobile-viewport testing is not a real Android WebView test. No Android native code was changed, and no actual configuration limitation was discovered. Real-device QA should tap Play, seek, navigate away/back, and exercise app lifecycle interruption on the supported System WebView version before an Android release. The implementation relies on standard HTML5 MP3 playback and user interaction, with the same ES-module support already needed by the website. Playback still depends on internet connectivity and the external provider; availability reports are point-in-time checks.

## Commands

```sh
npm run test:quran
npm run verify:quran-audio   # HEAD + two-byte Range checks for all 114 URLs
npm run test:resources
npm run build
# For production Pages tests, build with VITE_BASE_PATH=/islamicunity-web/
npm run test:pages
npm run test:ui
```

## New and modified files

| File | Purpose |
| --- | --- |
| `frontend/src/quran/QuranAudioPlayer.jsx` | Shared accessible player and Surah search UI |
| `frontend/src/quran/audio-controller.mjs` | HTML5 playback state, streaming lifecycle, race/error handling |
| `frontend/src/quran/audio-source.mjs` | Strict URL builder and duration formatting |
| `frontend/src/quran/surahs.json` | Complete local metadata for 114 Surahs |
| `frontend/src/quran/player-copy.js` | Four-language player labels and error messages |
| `frontend/src/quran/quran-audio.css` | Scoped emerald/gold responsive player styles |
| `frontend/src/quran/legacy-entry.jsx` | Existing WebView widget integration and event bridge |
| `frontend/src/main.jsx` | Player mounted in the existing Quran route |
| `frontend/public/islamicunity.html` | Real player replaces the simulated native/WebView widget |
| `frontend/vite.config.js` | Shared legacy production entry and development support |
| `migration/resource-manifest.json` | Updated legacy-page hash and declared generated entry |
| `scripts/validate-resources.mjs` | Recognizes the generated legacy asset while retaining resource checks |
| `scripts/verify-quran-audio.mjs` | Development-side availability/Range checker; saves JSON results only |
| `tests/quran-controller.test.mjs` | Metadata and lifecycle regression tests |
| `tests/quran-player.spec.js` | Production UI, legacy reader, errors, controls, and mobile tests |
| `playwright.pages.config.js` | Includes the production Quran-player tests |
| `package.json` | Playback-test and URL-verification commands |
| `.github/workflows/pages.yml` | Runs playback lifecycle checks before deployment |
| `docs/quran-audio-verification.json` | All 114 source URL/header/Range results |
| `docs/quran-browser-playback.json` | Ten real-browser playback results |
| `docs/quran-audio-player.md` | This delivery, source, test, file-list, and limitations record |
| `README.md` | Player usage and documentation link |
