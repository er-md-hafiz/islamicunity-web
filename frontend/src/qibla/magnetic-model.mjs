import geomagnetism from "geomagnetism";
import { validateCoordinates, normalizeAngle } from "../../../shared/qibla.mjs";
export function magneticCorrection(position, date = new Date()) {
  try {
    validateCoordinates(position.lat, position.lon);
    if (!Number.isFinite(date.getTime()) || date < new Date("2025-01-01T00:00:00Z") || date >= new Date("2030-01-01T00:00:00Z")) return { available: false, reason: "expired" };
    const altitude = Number.isFinite(position.altitude) ? position.altitude / 1000 : 0;
    if (altitude < -1 || altitude > 850) return { available: false, reason: "altitude" };
    const model = geomagnetism.model(date);
    if (model.name !== "WMM-2025") return { available: false, reason: "expired" };
    const field = model.point([position.lat, position.lon, altitude]);
    if (!Number.isFinite(field.decl) || field.h < 6000) return { available: false, reason: "weak-field" };
    return { available: true, declination: field.decl, model: model.name, date: date.toISOString().slice(0, 10), seaLevel: !Number.isFinite(position.altitude) };
  } catch { return { available: false, reason: "unavailable" }; }
}
// East-positive declination is ADDED to magnetic heading, exactly once.
export const magneticToTrue = (heading, declination) => normalizeAngle(heading + declination);
