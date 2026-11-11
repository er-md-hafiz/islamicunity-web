import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { bearing, KAABA_LOCATION, normalizeAngle, orientationHeading, unwrapAngle, relativeQibla } from "../shared/qibla.mjs";
import { magneticCorrection, magneticToTrue } from "../frontend/src/qibla/magnetic-model.mjs";

test("great-circle bearing agrees with independent 3D tangent-plane projection worldwide", () => {
  const r = Math.PI / 180;
  const b = KAABA_LOCATION.latitude * r, l = KAABA_LOCATION.longitude * r;
  const target = [Math.cos(b) * Math.cos(l), Math.cos(b) * Math.sin(l), Math.sin(b)];
  const cities = [[28.6139,77.209],[19.076,72.8777],[51.5074,-.1278],[40.7128,-74.006],[-33.8688,151.2093],[-6.2088,106.8456],[0,0],[89,170],[-45,-160]];
  for (const [lat, lon] of cities) {
    const a = lat*r, o = lon*r;
    const north = [-Math.sin(a)*Math.cos(o), -Math.sin(a)*Math.sin(o), Math.cos(a)];
    const east = [-Math.sin(o), Math.cos(o), 0];
    const dot = v => v.reduce((sum, x, i) => sum+x*target[i], 0);
    const independent = normalizeAngle(Math.atan2(dot(east), dot(north))/r);
    assert.ok(Math.abs(bearing(lat,lon)-independent)<1e-9);
    assert.ok(bearing(lat,lon)>=0&&bearing(lat,lon)<360);
  }
  assert.notEqual(bearing(...cities[0]),bearing(...cities[1]));
});
test("invalid coordinates fail and degenerate destinations never invent north", () => {
  for(const p of [[NaN,0],[0,Infinity],[91,0],[0,181],["0",0],[null,0]]) assert.throws(()=>bearing(...p),RangeError);
  assert.equal(bearing(KAABA_LOCATION.latitude,KAABA_LOCATION.longitude),null);
  assert.equal(bearing(-KAABA_LOCATION.latitude,KAABA_LOCATION.longitude-180),null);
});
test("physical screen top converts correctly in portrait and both landscape directions", () => {
  const event = {absolute:true,alpha:270,beta:0,gamma:0};
  assert.equal(orientationHeading(event,0).heading,90);
  assert.equal(orientationHeading(event,90).heading,0);
  assert.ok(Math.abs(orientationHeading(event,270).heading-180)<1e-9);
  assert.equal(orientationHeading({...event,alpha:0},180).heading,180);
  assert.equal(orientationHeading(event).reference,"unknown");
  const tilted = orientationHeading({...event,beta:20,gamma:10},90);
  assert.ok(Number.isFinite(tilted.heading));
});
test("relative alpha, tilted devices and unreliable WebKit data cannot masquerade as true headings", () => {
  assert.equal(orientationHeading({alpha:90,beta:0,gamma:0,absolute:false}).error,"relative");
  assert.equal(orientationHeading({alpha:0,beta:null,gamma:0,absolute:true}).error,"relative");
  assert.equal(orientationHeading({alpha:0,beta:90,gamma:0,absolute:true}).error,"tilted");
  assert.equal(orientationHeading({webkitCompassHeading:90,webkitCompassAccuracy:-1}).error,"unreliable");
  assert.equal(orientationHeading({webkitCompassHeading:90,webkitCompassAccuracy:50}).error,"unreliable");
  assert.deepEqual(orientationHeading({webkitCompassHeading:90,webkitCompassAccuracy:5},90),{heading:0,reference:"magnetic",accuracy:5});
});
test("WMM2025 declination matches published test points to 0.01 degrees", () => {
  const reference=JSON.parse(readFileSync(new URL("./fixtures/wmm2025-reference.json",import.meta.url)));
  for(const {year,lat,lon,altitudeKm,declination} of reference.points) {
    const date=new Date(Date.UTC(Math.floor(year),0,1)+(year%1)*365*86400000);
    const result=magneticCorrection({lat,lon,altitude:altitudeKm*1000},date);
    assert.equal(result.available,true);assert.ok(Math.abs(result.declination-declination)<.01);
  }
  assert.equal(magneticToTrue(350,15),5);assert.equal(magneticToTrue(10,-15),355);
});
test("expired models, invalid input and weak magnetic zones explicitly disable correction", () => {
  for(const d of ["2024-01-01","2030-01-01","invalid"]) assert.equal(magneticCorrection({lat:20,lon:30},new Date(d)).available,false);
  assert.equal(magneticCorrection({lat:NaN,lon:30}).available,false);
  assert.equal(magneticCorrection({lat:89,lon:-121},new Date("2025-01-01")).available,false);
});
test("wrap-around smoothing takes the short path and Qibla rotates opposite a clockwise turn", () => {
  assert.equal(unwrapAngle(359,1),361);assert.equal(unwrapAngle(1,359),-1);
  assert.equal(relativeQibla(270,0),270);assert.equal(relativeQibla(270,90),180);
});
