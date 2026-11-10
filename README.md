# Islamic Unity

A responsive React + Express Islamic companion with menu-driven navigation, live prayer times, a Qibla compass, prayer reminders, a Hijri calendar, daily Quran inspiration, and a persistent dhikr counter. English, Hindi, Urdu, and Arabic navigation are included, with RTL layouts for Urdu and Arabic.

The pre-existing Kotlin/Gradle prototype remains in `backend/src/main/kotlin`, `frontend/src/jsMain`, and `shared`. The Node/React application is independent of Gradle. The original `islamicunity.html` is preserved.

## Public homepage

The root URL now presents the emerald-and-gold homepage based on the supplied design research. It includes an original SVG/CSS app illustration, six linked feature cards, a community mission section, Android download links, a support section, contact links, FAQ, and website privacy details. The illustration is labelled as a web-app preview with sample timings; it is not presented as an Android screenshot. The title, description, canonical URL, and social metadata are included in `frontend/index.html`; `frontend/public/social-preview.png` is a 1200 × 630 capture of the implemented homepage.

Use **Open web app**, a feature card, or a direct route such as `#prayer_times`, `#qibla`, `#quran`, or `#tasbih` to reach the interactive tools. `#home`, `#features`, `#about`, `#download`, `#donate`, `#contact`, and `#privacy` are homepage sections. The dashboard includes a link back to the homepage. The homepage and tools share the same persisted language selection, with full English, Hindi, Urdu, and Arabic homepage text and RTL layouts.

Download buttons use the verified [Google Play listing](https://play.google.com/store/apps/details?id=com.islamicunity.android). Contact links open email drafts to `m3hmedia@gmail.com`. Contribution buttons now open the migrated `donate.html`, preserving the existing QR image, bank details, and UPI options from the source resource repository. No new payment recipient or checkout service was introduced. The app privacy policy and terms are also linked from the footer. No analytics, custom-domain purchase, or third-party subscription has been added.

## Run locally

Install Node.js 22.12+ and run from the project root:

```sh
npm install
npm run dev
```

Open http://localhost:5173. Express runs on port 3001; Vite proxies `/api` to it. No environment file is required locally.

On Windows, `./run-web.ps1` starts the new app (`./run-web.ps1 build` builds it). The original `run.ps1` still launches the Kotlin prototype.

```sh
npm test              # API integration tests and calculation checks
npm run test:ui       # Browser tests (requires installed Google Chrome)
npm run test:pages    # Test a Pages build without any Express API (Chrome required)
npm run test:resources # Validate migrated assets, local links, and Android menu compatibility
npm run build         # Production frontend in frontend/dist
npm run preview       # Local preview; keep the API running separately
npm start             # Express API only
```

For separate terminals, use `npm run dev -w backend` and `npm run dev -w frontend`.

## Configuration

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env` as needed. Environment files are ignored by Git.

| Variable | Component | Purpose |
| --- | --- | --- |
| `PORT` | API | Server port; defaults to 3001 |
| `CORS_ORIGIN` | API | Comma-separated permitted frontend origins; unset allows all origins |
| `DEMO_MODE` | API | `true` forces clearly labelled sample prayer timings |
| `VITE_API_URL` | Frontend | API origin, e.g. `https://your-api.onrender.com`; omit locally |
| `VITE_BASE_PATH` | Frontend | `/` normally, or `/repository-name/` for GitHub Pages |

Vite variables are embedded at build time. Rebuild after changing them. Start the API using the workspace command so `backend/.env` is loaded from its working directory.

## REST API

| Endpoint | Response |
| --- | --- |
| `GET /api/health` | Health status |
| `GET /api/menu` | Original version-2 menu snapshot, including settings metadata |
| `GET /api/prayertimes?lat=28.6139&lon=77.209&date=2026-11-10` | Six timings, IANA timezone, method, source, sample flag |
| `GET /api/qibla?lat=28.6139&lon=77.209` | Great-circle bearing from true north and Kaaba coordinates |
| `GET /api/calendar?date=2026-11-10` | Gregorian/Hijri dates and upcoming observances |
| `GET /api/quran` | Curated Quran 94:5, translations, transliteration |
| `GET /api/reminders` | Supported prayers and browser-local storage policy |
| `GET /api/tasbih` | Dhikr phrases and target |
| `GET /api/features/:id` | Resource data for every original home-menu item |

Dates and coordinates are validated; unknown endpoints return JSON 404s. Prayer timings use Aladhan method 1 (University of Islamic Sciences, Karachi), with standard Asr. Successful responses are cached by day and rounded location. Aladhan has a six-second timeout. Unavailable or invalid provider responses return an explicit **New Delhi sample schedule**; reminders are paused for sample data. Confirm live timings with your local mosque. Date rollover and countdown use the timing provider's timezone.

The original [menu JSON](https://er-md-hafiz.github.io/islamicunity-web/menu.json) is saved as `backend/menu.json`. The app fetches it from the API at startup. All 21 enabled home entries receive navigation and resources; Quran and reminders are added as first-class sections. Edit the snapshot to change navigation. Hajj, Umrah, prayer guidance, donations, and games link to the original resources. Books, media, photos, and mosque discovery use labelled external resources. News is a sample noticeboard, the names section is a selection, and currency conversion uses illustrative rates. Zakat is a basic estimate and does not determine nisab eligibility.

## Browser features and limitations

- Location is requested only after pressing the location control. HTTPS or localhost is required. New Delhi is the initial location. Coordinates and preferences stay in localStorage; coordinates are sent to this API and Aladhan for prayer calculations.
- Qibla shows the true-north bearing. Align N with true north manually, or enable supported device orientation sensors. Accuracy depends on calibration and magnetic interference.
- Reminders persist on this device. Browser permission is requested when enabling a reminder. Denied or unsupported notifications fall back to an in-app message. **Keep the tab open**; browsers may delay checks while a tab is suspended. This is not a reliable background alarm and has no push server.
- Hindi speech selects known female Hindi voice names where available. Settings includes a voice chooser and preview. Browsers expose device voices, not guaranteed gender or naturalness; install a Hindi system voice if needed. Spoken verse transliteration is a reading aid, not tajweed recitation.
- Calendar uses the runtime's Umm al-Qura calendar. Observances are estimates; local moon sighting may differ. Month navigation highlights today and upcoming dates from the API.
- Core navigation, prayer names, principal controls, dates, and the daily verse support four languages. Supplemental resource descriptions and some advanced settings/help text remain in English.
- Local storage keeps language, location, reminders, counter, goal, and theme. There is no account, database, or cross-device sync.
- Keyboard focus, labelled toggles, RTL styling, and reduced-motion support are included.

## Deploy the API on Render or Heroku

Push the project to your repository. On Render, create a Node web service from the repository root or use `render.yaml`. Use build command `npm ci`, start command `npm start`, and health check `/api/health`. Set `CORS_ORIGIN` to the frontend origin without a trailing slash, e.g. `https://your-site.vercel.app`. Render supplies `PORT`.

For Heroku, the root `Procfile` starts the API. Set `CORS_ORIGIN` and provision the app. Verify your deployed `/api/health` endpoint. Deployment has not been performed automatically.

## Deploy the frontend on Vercel

Import the repository with the project root as the root directory. Select Vite, install command `npm ci`, build command `npm run build`, and output directory `frontend/dist`. Set `VITE_API_URL` to your API origin and keep `VITE_BASE_PATH=/`. Hash-based navigation needs no route rewrites.

## Deploy the frontend on GitHub Pages

The included `.github/workflows/pages.yml` builds and publishes `frontend/dist` on every push to `main`. It sets the Vite base to `/islamicunity-web/` (derived from the repository name), runs the API tests, uploads the production artifact, and deploys it with GitHub Pages.

If GitHub still launches its implicit branch/Jekyll publisher, the workflow waits for that publication to finish before deploying the app. This prevents two simultaneous publishers from replacing the React build with a page generated from README.md. Selecting **GitHub Actions** as the Pages source remains the recommended configuration.

One-time repository setting: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Then push to `main`, or select **Actions → Deploy Islamic Unity to GitHub Pages → Run workflow**. The live app is at https://er-md-hafiz.github.io/islamicunity-web/ and https://er-md-hafiz.github.io/islamicunity-web/index.html. Uploading React source alone does not publish a site; GitHub Pages must be enabled and the build must finish successfully.

Pages cannot run Node/Express. When building for production without `VITE_API_URL`, the app uses static-hosting mode: it fetches the menu, verse, and all 21 section resources from generated `data/*.json` files; calculates Qibla and the current Hijri calendar in the browser using the same shared functions as Express; and fetches live timings directly from Aladhan. Provider failures still display a labelled New Delhi sample schedule with reminders paused. This mode needs no separately hosted API.

To use the full REST backend instead, deploy it on Render and create a repository Actions variable `VITE_API_URL` with its origin. Allow the Pages origin in `CORS_ORIGIN`. The workflow passes this variable into the frontend build. Never place secrets in `VITE_` variables.

To check the static build locally, build with `VITE_BASE_PATH=/islamicunity-web/`, then run `npm run test:pages`. These tests serve only the built files beneath the repository subdirectory, with no `/api` proxy, and check every menu page, prayer data, calendar, Qibla, and provider fallback. Generated `frontend/public/data/` files are ignored and regenerated before every build.

## References

- [Aladhan prayer API](https://aladhan.com/prayer-times-api)
- [Vite static deployment](https://vite.dev/guide/static-deploy.html)
- [Browser speech voices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)

The M3H Media call-to-action opens a labelled YouTube search because an official channel URL was not supplied. No messages, subscriptions, or payments are sent by the app.
