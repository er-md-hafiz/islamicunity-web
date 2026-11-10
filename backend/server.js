import express from "express";
import cors from "cors";
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { verse, content } from "./content.js";
import { bearing, calendar } from "../shared/faith.mjs";
export { bearing, calendar };

const menu = JSON.parse(
  await readFile(new URL("./menu.json", import.meta.url), "utf8"),
);
export const app = express();
app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
      : "*",
  }),
);
app.use(express.json({ limit: "16kb" }));
function coordinates(query) {
  const lat = Number(query.lat ?? 28.6139),
    lon = Number(query.lon ?? 77.209);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180 ||
    query.lat === "" ||
    query.lon === ""
  )
    throw Object.assign(
      new Error("Provide valid latitude (-90–90) and longitude (-180–180)."),
      { status: 400 },
    );
  return { lat, lon };
}
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/menu", (_req, res) => res.json(menu));
const cache = new Map();
app.get("/api/prayertimes", async (req, res) => {
  const { lat, lon } = coordinates(req.query);
  const today = new Date().toISOString().slice(0, 10);
  const date = req.query.date || today;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    return res.status(400).json({ error: "Use a valid YYYY-MM-DD date." });
  const key = `${date}:${lat.toFixed(3)}:${lon.toFixed(3)}`;
  if (cache.has(key)) return res.json(cache.get(key));
  if (process.env.DEMO_MODE !== "true") {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${date.split("-").reverse().join("-")}?latitude=${lat}&longitude=${lon}&method=1`,
        { signal: AbortSignal.timeout(6000) },
      );
      if (!response.ok) throw new Error("Prayer provider unavailable");
      const { data } = await response.json();
      const timings = Object.fromEntries(
        ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].map((name) => [
          name,
          data.timings[name]?.slice(0, 5),
        ]),
      );
      if (Object.values(timings).some((v) => !/^\d{2}:\d{2}$/.test(v)))
        throw new Error("Invalid provider response");
      const result = {
        date,
        timings,
        timezone: data.meta.timezone,
        method: data.meta.method.name,
        source: "Aladhan",
        sample: false,
        coordinates: { lat, lon },
      };
      if (cache.size > 500) cache.clear();
      cache.set(key, result);
      return res.json(result);
    } catch {
      /* Explicit sample response keeps the application usable offline. */
    }
  }
  res.json({
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
  });
});
app.get("/api/qibla", (req, res) => {
  const { lat, lon } = coordinates(req.query);
  res.json({
    kaaba: { lat: 21.422487, lon: 39.826206 },
    bearing: bearing(lat, lon),
    from: { lat, lon },
  });
});
app.get("/api/calendar", (req, res) => {
  const input = req.query.date || new Date().toISOString().slice(0, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input) ||
    Number.isNaN(Date.parse(input)) ||
    new Date(input).toISOString().slice(0, 10) !== input
  )
    return res.status(400).json({ error: "Use a valid YYYY-MM-DD date." });
  res.json(calendar(new Date(input + "T12:00:00Z")));
});
app.get("/api/quran", (_req, res) => res.json(verse));
app.get("/api/reminders", (_req, res) =>
  res.json({
    prayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
    storage: "browser-local",
    requiresOpenTab: true,
  }),
);
app.get("/api/tasbih", (_req, res) =>
  res.json({
    phrases: ["SubhanAllah", "Alhamdulillah", "Allahu Akbar"],
    target: 33,
  }),
);
app.get("/api/features/:id", (req, res) => {
  const item = menu.home.items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Feature not found" });
  res.json({
    id: item.id,
    ...content[item.id],
    title: content[item.id]?.title || item.title,
    description:
      content[item.id]?.description ||
      "Continue your journey with the original Islamic Unity resource.",
    items:
      content[item.id]?.items ||
      (item.url
        ? [
            {
              title: item.title,
              url: item.url,
            },
          ]
        : []),
  });
});
app.use("/api", (_req, res) =>
  res.status(404).json({ error: "Endpoint not found" }),
);
app.use((err, _req, res, _next) =>
  res.status(err.status || 500).json({
    error: err.status ? err.message : "An unexpected error occurred.",
  }),
);
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  app.listen(process.env.PORT || 3001, "0.0.0.0", () =>
    console.log(`Islamic Unity API on port ${process.env.PORT || 3001}`),
  );
