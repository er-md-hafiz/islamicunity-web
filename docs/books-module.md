# Books web page

`Books.html` is a Vite entry into the existing React application. It uses the same header, Home/My Day links, date, language preference, location action, notification action, theme, navigation and footer. The Books sidebar entry and the existing `index.html#books` route open this page. Existing Android menu identifiers, fragment destinations, analytics, visibility and version remain unchanged.

## Implementation

| File | Purpose |
| --- | --- |
| `frontend/Books.html` | Case-sensitive static entry, title, description and canonical URL |
| `frontend/src/books/BooksPage.jsx` | Library, divisions, reader controls, search, bookmarks, resource cards and PDF dialog |
| `frontend/src/books/books-data.mjs` | Validated API parameters, response parsing, concurrent request sharing and bounded reading cache |
| `frontend/src/books/books-copy.js` | English, Hindi, Urdu and Arabic labels |
| `frontend/src/books/books.css` | Responsive emerald/gold design using existing theme variables |
| `frontend/src/quran/VerseList.jsx` | Shared verse renderer used by Books and the pre-existing Quran reader |
| `frontend/src/quran/search.mjs` | Existing audio search normalization extracted for reuse |
| `frontend/src/hooks/useStored.js` | Existing persistence hook extracted unchanged for reuse |

Integration changes are limited to the app route, Vite entry, page-link map, configuration mirrors, tests and resource manifest. No native Android source was edited. Android can keep consuming the same existing `commonUrls.quran` fields.

## API coverage

The implementation follows the [official Al Quran Cloud reference](https://alquran.cloud/api) and its [legacy reference](https://legacy.alquran.cloud/api). All origins come from `menu.json.commonUrls.quran`; no API origin is duplicated in Books components.

| Group | Configured operation |
| --- | --- |
| Surah | `surahUrl`, plus `surah/{number}/{edition}` derived from its configured base |
| Quran | `quranViewUrl`; the full Quran is fetched only when a complete-Quran reader is opened, then reused across Surahs |
| Sajda | `sajdaUrl`, substituting a validated edition identifier |
| Meta | `metaUrl` |
| Edition | `edition?format=text` derived from the configured Surah base |
| Juz, Page, Ruku, Manzil, HizbQuarter | `juz`, `page`, `ruku`, `manzil`, `hizbQuarter` with documented division bounds and edition parameters |
| Search | `search/{encoded-keyword}/all/{edition}`; results show 20 matches per page |
| Ayah | `ayah/{absolute-number-or-surah:ayah}/{edition}` for verse references and Arabic search-result text |

Arabic Uthmani remains visible alongside the chosen translation/text edition. Search recognizes Arabic and English keywords, Surah names and numbers, references such as `2:255`, and absolute Ayah numbers such as `#262`. English keyword search defaults to an available English text edition discovered from the API. No local replacement search engine indexes verse text.

The same renderer supplies adjustable Arabic type, correct RTL text, copy, share, verse bookmarks and deep links. Continue Reading saves the visible verse and reading division. Large passages render 40 verses at a time with an explicit continuation action; direct verse links expose the required chunk before scrolling.

## Cache and offline behavior

Concurrent requests for a URL share one promise. Successful data is cached for 15 minutes in memory and IndexedDB, bounded to 64 entries and approximately 24 MiB. Refresh bypasses freshness checks; failures can display a previously saved response with a visible saved-content notice. Failed uncached requests show Retry and are not cached as content. The complete Quran is not fetched again for every selected Surah.

Bookmarks, font size, edition and position use the existing guarded local-storage hook. No service worker is introduced: saved readings can reopen while the application shell is available; a completely offline first visit or uncached HTML reload still requires connectivity. Browser storage clearing/quota limits can remove saved cache entries.

## PDF and Hadith sources

Two real PDF files are configured under `commonUrls.books.pdfResources`. Both were checked for successful HTTP responses, `application/pdf` and the `%PDF-` signature. The [ClearQuran download page](https://clearquran.com/download/) permits storage and distribution with attribution; cards and previews credit **Translation by Talal Itani, ClearQuran.com**. The original text/files are unchanged and are not bundled in this repository.

PDFs open in the browser's native PDF viewer inside a keyboard-accessible dialog, with external Read Online and publisher links. The publisher does not enable fetch CORS, so the download action deliberately opens the publisher's permitted download page. Browser PDF support varies; the external options remain available if the embed fails or is unsupported. Cross-origin HTTP errors inside a native viewer cannot be reliably inspected by page JavaScript. Invalid/non-HTTPS configuration URLs are rejected.

The six collections link to the official [Sahih al-Bukhari](https://sunnah.com/bukhari), [Sahih Muslim](https://sunnah.com/muslim), [Sunan Abi Dawud](https://sunnah.com/abudawud), [Jamiʿ at-Tirmidhi](https://sunnah.com/tirmidhi), [Sunan an-Nasa’i](https://sunnah.com/nasai), and [Sunan Ibn Majah](https://sunnah.com/ibnmajah) pages. Their chapter navigation, Hadith numbers, Arabic, available translations and search remain on Sunnah.com. No unauthenticated Hadith API or Quran-hosted Hadith endpoint is invented. Collection pages were verified through official-page research; automated Node requests received the provider's 403 bot protection, recorded separately in the report.

An embedded Hadith reader would require an additional verified data feed or authorized API. No private credentials are needed or included for the current external reading integration. Other reading resources link to the [Quran translations encyclopedia](https://quranenc.com/en/home).

All resource URLs and permission flags live in the two matching menu files, not in the UI. [Source verification results](./books-source-verification.json) record the endpoint checks and external-access limitations.

## Validation

```sh
npm run build
node --test tests/books-data.test.mjs
npm run test:pages
npm run test:ui
npm run test:quran
npm run test:resources
npm run test:urls
node scripts/verify-books-sources.mjs

# Safari-engine coverage, in addition to Chrome:
npx playwright install webkit
npx playwright test --config playwright.books.config.js
```

Books browser tests cover all 114 Surahs, full-Quran request reuse, every division, Sajda-to-verse navigation, edition selection, search and pagination, PDF fallback links, all six Hadith sources, offline reads, retry, font settings, bookmarks, copy/share fallback, saved positions and alternate configured API origins. Layout checks cover 360, 768 and 1440 px in all four languages, including RTL and dark mode. Separate real-data Chrome checks exercised Arabic/English reading, every division type, Sajda, keyword search and the native PDF viewer with no script errors or mobile overflow. Physical Android/iPhone devices were not used.
