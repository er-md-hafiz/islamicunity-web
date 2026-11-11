# Branding and Qibla Finder delivery

The homepage hero and the prayer dashboard now lead with **A little closer to your faith, every day.** The Islamic Unity logo, official app name, metadata and footer are retained. The Qibla page has one title and subtitle instead of repeating the parent page title inside the card. The expanded Tasbih card also avoids repeating its parent title. Other page content is retained.

## Audit findings and fixes

- The old bearing formula was mathematically equivalent for normal coordinates, but had no shared coordinate validation and used slightly different Kaaba constants. The reusable calculation now explicitly uses **21.4225° N, 39.8262° E**, validates numeric latitude/longitude, normalizes to [0, 360), and returns no direction at coincident/antipodal singularities.
- The previous React widget displayed the prayer feature's initial New Delhi location without requesting actual Qibla coordinates. Qibla now starts without a location, heading or needle. Existing stored/prayer defaults never become Qibla coordinates. The top-level prayer-location control is omitted on the Qibla page to avoid suggesting that its default city is the user's detected position.
- `getCurrentPosition` runs only after a user action, with high accuracy, 15-second timeout and no cached position. It validates coordinates, displays reported uncertainty and capture time, distinguishes denied/unavailable/timeout/unsupported/invalid states, and allows retries. Sequence guards ignore obsolete callbacks; a watchdog prevents indefinitely pending loading. Refresh updates the bearing and magnetic model for the new position. A location older than five minutes disables live assistance; users should refresh sooner if they have moved.
- The old compass rotated only the needle against fixed cardinal labels. The new dial rotates north relative to the device, while the gold Qibla arrow uses `(bearing - trueHeading + 360) % 360`. Heading extraction projects the physical screen-top vector through the W3C rotation matrix and accounts for the screen orientation angle. Excessive tilt and relative-only alpha values are rejected. Circular smoothing, unwrapped display angles and throttling avoid the 359°→0° full-turn problem.
- The legacy `islamicunity.html` widget contained a hardcoded angle, random movement and simulated calibration success. Those were removed. The same React calculation, GPS, sensor and magnetic logic now mounts in its existing grid position. Its nearby-mosques control, reader, Quran audio, other widgets and native menu identifiers remain intact.

## True north, magnetic north and model limits

The single new dependency, **geomagnetism 0.2.0** (Apache-2.0), supplies offline WMM2025 coefficients and spherical-harmonic evaluation. It has no runtime service or API-key dependency. User coordinates, date and available ellipsoidal altitude determine the declination. If altitude is absent, the UI identifies the sea-level estimate. East-positive declination is **added** to a magnetic heading exactly once.

WebKit compass readings use their magnetic-heading field and reported heading uncertainty. Negative or worse-than-25° uncertainty disables live assistance. Standard absolute orientation events do not reliably expose whether a browser/vendor already corrected its north reference. They therefore remain in manual mode until the user confirms **magnetic** or **already-corrected true** north against their device/browser documentation. No automatic user-agent guess or double correction is made. If the reference cannot be established, the manual true-north bearing is the supported fallback.

The wrapper rejects dates before 2025 or at/after 2030, non-WMM2025 models, invalid/out-of-range altitudes and weak horizontal magnetic fields below 6000 nT. The installed library's stricter metadata ends **2029-11-13**; after that, correction fails closed until the model/dependency is updated. The UI explains when magnetic correction is unavailable and disables magnetic live guidance. It never treats unavailable declination as zero. These checks do not detect every local magnetic disturbance; the UI retains a sensor-accuracy limitation and calibration guidance.

Permission denial, absent readings, tilt, poor reported uncertainty, stale events, screen changes and hidden-page suspension produce explicit statuses. Listeners and timers are cleaned up on unmount; resuming a hidden page requires enabling the compass again. The recalibration action restarts readings after physical figure-eight/magnet/metal guidance; it does not claim to calibrate hardware.

The UI supports English/Hindi/Urdu/Arabic primary labels, RTL layout, light/dark theme variables, touch-sized controls and reduced-motion preferences. Supplemental technical guidance is in English, consistent with the existing app's advanced help. Manual mode explicitly tells users to align N with independently established **true** north; a numerical bearing is not represented as a live compass.

## Verification

- Seven unit tests compare nine geographic bearings against an independent 3D tangent-plane calculation, reject invalid/singular coordinates, verify screen rotation and heading rejection, test circular wrap-around and correction sign, and compare all **12 official NOAA WMM2025 test values** (including secular variation and altitude) within **0.01°**.
- Eight browser tests cover the tagline/title hierarchy, no assumed location, GPS options and failures, retry/watchdog, standard absolute and WebKit event conversions, unknown-reference gating, landscape changes, permission denial, unsupported APIs, stale readings, expired-model fallback, legacy integration and four-language layouts at 360px, 844px landscape, 768px and 1440px.
- The separate [Chrome report](./qibla-browser-verification.json) uses the actual browser Geolocation API with controlled Mumbai coordinates and 15m reported uncertainty. Its calculated bearing is **280.1°**, with manual mode correctly identified and no JavaScript errors. Screenshots of the homepage and phone/desktop Qibla views were inspected.
- All 76 automated tests pass: 33 production browser tests, 13 original app/homepage tests, seven Qibla math/model tests, six API tests, ten audio lifecycle tests, four video-data tests and three deployment-order tests. Resource-integrity and URL audits also pass.
- Existing API, native-resource/menu compatibility, website URL migration, games, footer, Quran text/audio and video tests are retained. `/api/qibla` now requires both coordinates instead of silently applying a default city; the static API helper follows the same rule.

## Android and iOS verification limits

No native Android WebView host, manifest, JavaScript bridge or permission callback implementation is present in this repository; the available Kotlin code is a backend/JS prototype. `adb devices -l` reports no connected device or emulator. **Physical Android Chrome, Android WebView and iOS Safari have not been tested.** Sensor-event and permission tests are deterministic browser simulations, not hardware accuracy measurements. No native code or permission settings were changed.

For the Android host, verify JavaScript and geolocation settings, secure HTTPS, runtime coarse/fine location permission, `WebChromeClient.onGeolocationPermissionsShowPrompt`, and actual orientation-event availability. On supported iOS Safari, permission is requested from the Enable button. Browser geolocation permission alone cannot guarantee native WebView or compass access. Real-device QA should separately cover portrait/landscape, calibration, magnetic interference, background/resume and back navigation before declaring device-specific accuracy.

## Sources

- [W3C Device Orientation and Motion](https://www.w3.org/TR/orientation-event/) — device coordinate frame and Euler rotation matrix.
- [W3C Screen Orientation](https://www.w3.org/TR/screen-orientation/) — screen angle relative to natural orientation.
- [Apple WebKit compass reference](https://developer.apple.com/documentation/webkitjs/deviceorientationevent) — magnetic-heading and uncertainty fields.
- [NOAA World Magnetic Model](https://www.ncei.noaa.gov/products/world-magnetic-model) and [official WMM2025 reference values](https://www.ncei.noaa.gov/sites/default/files/2025-02/WMM2025_TEST_VALUES.txt).
- [geomagnetism source and license](https://github.com/naturalatlas/geomagnetism).

The package license is also distributed at `licenses/geomagnetism-LICENSE.txt` in the published site.

## Main changed files

`shared/qibla.mjs`, `shared/faith.mjs`; `frontend/src/qibla/` (shared widget, location/sensor hooks, model wrapper, translations, styles and legacy entry); `frontend/src/main.jsx`, `LandingPage.jsx`, `landing-copy.js`, `api.js`; `frontend/public/islamicunity.html`; backend route/tests; Vite config and migration manifest; dependency manifests/lockfile; Qibla test suites and NOAA fixture; Pages test config/workflow and documentation.
