import { bearing, calendar } from "../../shared/faith.mjs";
import { loadConfiguredContent } from "./config/common-urls.mjs";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const STATIC = import.meta.env.PROD && !API;
const BASE = import.meta.env.BASE_URL;
const cache = new Map();

async function json(url, timeout = 12000) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

// GitHub Pages hosts static assets; no Express server is available at /api.
// An explicitly configured VITE_API_URL always takes precedence over static mode.
export async function api(path) {
  if (path === "features/quiz" || path === "features/dua") return loadConfiguredContent(path.split("/")[1]);
  if (!STATIC) return json(`${API}/api/${path}`);
  const url = new URL(path, "https://local.invalid/");
  const query = url.searchParams;
  const route = url.pathname;
  const lat = Number(query.get("lat") ?? 28.6139);
  const lon = Number(query.get("lon") ?? 77.209);
  const date = query.get("date") || new Date().toISOString().slice(0, 10);

  if (route === "/qibla") {
    if (!query.has("lat") || !query.has("lon") || !query.get("lat").trim() || !query.get("lon").trim())
      throw new Error("Qibla requires your latitude and longitude; no default location is assumed.");
    return {
      kaaba: { lat: 21.4225, lon: 39.8262 },
      bearing: bearing(lat, lon),
      from: { lat, lon },
    };
  }
  if (route === "/calendar") return calendar(new Date(`${date}T12:00:00Z`));
  if (route === "/prayertimes") {
    const key = `${date}:${lat}:${lon}`;
    if (cache.has(key)) return cache.get(key);
    try {
      const { data } = await json(
        `https://api.aladhan.com/v1/timings/${date.split("-").reverse().join("-")}?latitude=${lat}&longitude=${lon}&method=1`,
        6000,
      );
      const timings = Object.fromEntries(
        ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].map((name) => [
          name,
          data.timings[name]?.slice(0, 5),
        ]),
      );
      if (Object.values(timings).some((t) => !/^\d{2}:\d{2}$/.test(t)))
        throw new Error("Invalid prayer timings");
      const result = {
        date,
        timings,
        timezone: data.meta.timezone,
        method: data.meta.method.name,
        source: "Aladhan",
        sample: false,
        coordinates: { lat, lon },
      };
      if (cache.size > 100) cache.clear();
      cache.set(key, result);
      return result;
    } catch {
      return {
        date,
        timings: {
          Fajr: "05:25",
          Sunrise: "06:38",
          Dhuhr: "12:08",
          Asr: "15:15",
          Maghrib: "17:32",
          Isha: "18:51",
        },
        timezone: "Asia/Kolkata",
        source: "Sample schedule · New Delhi",
        sample: true,
        method: "Illustrative timings — do not use for observance",
        coordinates: { lat: 28.6139, lon: 77.209 },
      };
    }
  }
  // Only known resource paths can be fetched; never turn arbitrary paths into URLs.
  if (
    route === "/menu" ||
    route === "/quran" ||
    /^\/features\/[a-z_]+$/.test(route)
  )
    return json(`${BASE}data${route}.json`);
  throw new Error("Resource not found");
}
