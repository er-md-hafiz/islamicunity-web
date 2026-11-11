import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { app, bearing, calendar } from "../server.js";
let server, base;
before(async () => {
  process.env.DEMO_MODE = "true";
  server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => new Promise((r) => server.close(r)));
test("menu preserves all original home sections and CORS", async () => {
  const r = await fetch(base + "/menu");
  const data = await r.json();
  assert.equal(data.home.items.length, 21);
  assert.equal(r.headers.get("access-control-allow-origin"), "*");
});
test("prayer schedule clearly identifies sample data and timezone", async () => {
  const data = await (
    await fetch(base + "/prayertimes?date=2026-11-10")
  ).json();
  assert.equal(data.sample, true);
  assert.equal(data.timezone, "Asia/Kolkata");
  assert.equal(Object.keys(data.timings).length, 6);
  assert.match(data.method, /Illustrative/);
});
test("invalid dates and coordinates are rejected", async () => {
  for (const path of [
    "/prayertimes?lat=bad",
    "/qibla?lon=181",
    "/qibla?lat=",
    "/qibla",
    "/qibla?lat=20",
    "/qibla?lat=%20&lon=0",
    "/prayertimes?date=2026-02-30",
    "/calendar?date=invalid",
  ])
    assert.equal((await fetch(base + path)).status, 400, path);
});
test("Qibla bearing from Delhi points west northwest", () => {
  assert.ok(Math.abs(bearing(28.6139, 77.209) - 266.6) < 1);
  assert.ok(bearing(40.7, -74) > 50 && bearing(40.7, -74) < 65);
});
test("calendar returns chronological future holidays across year boundaries", () => {
  for (const date of ["2026-11-10", "2027-06-01"]) {
    const c = calendar(new Date(date + "T12:00:00Z"));
    assert.equal(c.events.length, 4);
    assert.ok(c.events.every((e) => e.date >= date));
    assert.ok(c.events.every((e, i, a) => i === 0 || e.date >= a[i - 1].date));
    assert.ok(c.hijri);
  }
});
test("every home feature has a REST resource and unknown features return 404", async () => {
  const menu = await (await fetch(base + "/menu")).json();
  for (const item of menu.home.items)
    assert.equal(
      (await fetch(base + "/features/" + item.id)).status,
      200,
      item.id,
    );
  assert.equal((await fetch(base + "/features/missing")).status, 404);
  assert.equal((await fetch(base + "/missing")).status, 404);
});
