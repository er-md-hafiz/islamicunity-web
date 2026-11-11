import { validateCoordinates } from "../../../shared/qibla.mjs";
const KEY = "iu-session-location";
function restore() {
  try {
    const position = JSON.parse(sessionStorage.getItem(KEY));
    validateCoordinates(position.lat, position.lon);
    const age = Date.now() - position.timestamp;
    if (Number.isFinite(position.timestamp) && Number.isFinite(age) && age >= 0 && age < 300000 && position.source === "geolocation") return position;
  } catch {}
  return null;
}
const position = restore();
let snapshot = { position, status: position ? "ready" : "initial", error: null };
let sequence = 0, timer;
const listeners = new Set();
const update = next => { snapshot = next; listeners.forEach(listener => listener()); };
export const locationStore = {
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  getSnapshot() { return snapshot; },
  request() {
    if (snapshot.status === "loading") return;
    const id = ++sequence; clearTimeout(timer);
    const fail = error => {
      if (id !== sequence) return;
      sequence++; clearTimeout(timer);
      try { sessionStorage.removeItem(KEY); } catch {}
      update({ position: null, status: "error", error });
    };
    if (!window.isSecureContext || !navigator.geolocation) { fail("unsupported"); return; }
    update({ position: null, status: "loading", error: null });
    timer = setTimeout(() => fail("timeout"), 16000);
    try {
      navigator.geolocation.getCurrentPosition(p => {
        if (id !== sequence) return;
        try { validateCoordinates(p.coords.latitude, p.coords.longitude); } catch { fail("invalid"); return; }
        sequence++; clearTimeout(timer);
        const position = { lat: p.coords.latitude, lon: p.coords.longitude,
          accuracy: Number.isFinite(p.coords.accuracy) && p.coords.accuracy >= 0 ? p.coords.accuracy : null,
          altitude: Number.isFinite(p.coords.altitude) ? p.coords.altitude : null,
          timestamp: Number.isFinite(p.timestamp) ? p.timestamp : Date.now(), source: "geolocation" };
        try { sessionStorage.setItem(KEY, JSON.stringify(position)); } catch {}
        update({ position, status: "ready", error: null });
      }, error => fail(({ 1: "denied", 2: "unavailable", 3: "timeout" })[error.code] || "unavailable"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    } catch { fail("unavailable"); }
  },
};
