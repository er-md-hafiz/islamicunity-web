export const KAABA_LOCATION = Object.freeze({ latitude: 21.4225, longitude: 39.8262 });
export const normalizeAngle = angle => ((angle % 360) + 360) % 360;
export function validateCoordinates(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new RangeError("Invalid latitude or longitude");
}
export function bearing(latitude, longitude) {
  validateCoordinates(latitude, longitude);
  const r = Math.PI / 180, a = latitude * r, b = KAABA_LOCATION.latitude * r;
  const d = (KAABA_LOCATION.longitude - longitude) * r;
  const y = Math.sin(d) * Math.cos(b);
  const x = Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b) * Math.cos(d);
  // No unique initial direction at the destination or its antipode.
  return Math.hypot(x, y) < 1e-12 ? null : normalizeAngle(Math.atan2(y, x) / r);
}
export const angleDelta = (from, to) => normalizeAngle(to - from + 180) - 180;
export const unwrapAngle = (previous, next) => previous == null ? next : previous + angleDelta(previous, next);
export const relativeQibla = (qibla, heading) => normalizeAngle(qibla - heading);

// Project the physical SCREEN TOP through W3C's Rz(alpha) Rx(beta) Ry(gamma).
// Screen angle is counter-clockwise from the natural device orientation.
export function orientationHeading(event, screenAngle = 0) {
  const { alpha, beta, gamma } = event;
  if (Number.isFinite(beta) && Number.isFinite(gamma)
    && Math.cos(beta * Math.PI / 180) * Math.cos(gamma * Math.PI / 180) < .75) return { error: "tilted" };
  if (Number.isFinite(event.webkitCompassHeading) && event.webkitCompassHeading >= 0) {
    const accuracy = event.webkitCompassAccuracy;
    if (Number.isFinite(accuracy) && (accuracy < 0 || accuracy > 25)) return { error: "unreliable" };
    return { heading: normalizeAngle(event.webkitCompassHeading - screenAngle), reference: "magnetic", accuracy: Number.isFinite(accuracy) ? accuracy : null };
  }
  if (event.absolute !== true || ![alpha, beta, gamma].every(Number.isFinite)) return { error: "relative" };
  const r = Math.PI / 180, a = alpha * r, b = beta * r, g = gamma * r;
  const vx = -Math.sin(screenAngle * r), vy = Math.cos(screenAngle * r);
  const east = (Math.cos(a) * Math.cos(g) - Math.sin(a) * Math.sin(b) * Math.sin(g)) * vx - Math.cos(b) * Math.sin(a) * vy;
  const north = (Math.sin(a) * Math.cos(g) + Math.cos(a) * Math.sin(b) * Math.sin(g)) * vx + Math.cos(a) * Math.cos(b) * vy;
  if (Math.hypot(east, north) < .2) return { error: "tilted" };
  // Standard events do not expose whether the UA already corrected declination.
  return { heading: normalizeAngle(Math.atan2(east, north) / r), reference: "unknown", accuracy: null };
}
