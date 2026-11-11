import { test, expect } from "@playwright/test";
import { bearing } from "../shared/qibla.mjs";
const base="/islamicunity-web/";
test.beforeEach(async({page})=>{
  await page.route("https://fonts.googleapis.com/**",r=>r.abort());
  await page.route("https://fonts.gstatic.com/**",r=>r.abort());
  await page.route("https://api.aladhan.com/**",r=>r.abort());
  await page.addInitScript(()=>{
    Object.defineProperty(window,"DeviceOrientationEvent",{configurable:true,writable:true,value:function DeviceOrientationEvent(){}});
    window.__geoCalls=[];
    Object.defineProperty(navigator,"geolocation",{value:{getCurrentPosition(success,error,options){window.__geoCalls.push(options);if(window.__geoPending)return;const failure=window.__geoFailure;if(failure){error({code:failure});return;}success({coords:{latitude:28.6139,longitude:77.209,accuracy:12,altitude:200},timestamp:Date.now()});}}});
    window.__emitHeading=fields=>{const e=new Event("deviceorientationabsolute");for(const[k,v]of Object.entries(fields))Object.defineProperty(e,k,{value:v});window.dispatchEvent(e);};
  });
});
const locate=async page=>{await page.locator(".iu-location-button").click();await expect(page.locator(".qf-location")).toContainText("28.6139");};
test("shared header omits the removed branding and widgets keep one title; no location is invented",async({page})=>{
  await page.goto(base);await expect(page.locator(".lp-hero")).toBeVisible();await expect(page.locator(".lp-brand")).toHaveText("");await expect(page.locator("#homepage-title")).toHaveText("Home");
  await page.goto(base+"#prayer_times");await expect(page.locator(".welcome-heading h1,.welcome-heading .small-overline")).toHaveCount(0);await expect(page.locator(".sidebar > .brand")).toHaveText("");
  await page.goto(base+"#qibla");await expect(page.getByRole("heading",{name:"Qibla Finder",exact:true})).toHaveCount(1);
  await expect(page.locator(".qf-needle")).toHaveCount(0);await expect(page.locator(".bearing")).toContainText("—");expect(await page.evaluate(()=>window.__geoCalls.length)).toBe(0);
  await locate(page);await expect(page.locator(".bearing")).toContainText(bearing(28.6139,77.209).toFixed(1));
  expect(await page.evaluate(()=>window.__geoCalls[0])).toEqual({enableHighAccuracy:true,timeout:15000,maximumAge:0});
  await expect(page.locator(".qf-location")).toContainText("±12 m");await expect(page.locator(".qf-dial")).toHaveAttribute("data-mode","manual");
  await page.evaluate(()=>{location.hash="tasbih";});await expect(page.locator(".page-heading h2")).toHaveText("Digital Tasbih");await expect(page.locator(".expanded.tasbih-card .eyebrow")).not.toContainText("Digital Tasbih");
  await expect(page.locator(".iu-location-button")).toContainText("Update location");await expect(page.locator("main .iu-location-button,main .location-button")).toHaveCount(0);expect(await page.evaluate(()=>window.__geoCalls.length)).toBe(1);
  expect(await page.locator(".iu-header-actions").evaluate(el=>[...el.children].slice(0,3).map(n=>n.className))).toEqual(["iu-notification-button","iu-location-button","iu-avatar"]);
  await page.goto(base+"Hajj.html");await expect(page.locator("iu-site-header .iu-location-button")).toContainText("Update location");expect(await page.evaluate(()=>window.__geoCalls.length)).toBe(0);
  await page.locator("iu-site-header .iu-notification-button").click();await expect(page.locator(".reminders-card")).toBeVisible();await expect(page.locator(".iu-location-button")).toContainText("Update location");expect(await page.evaluate(()=>window.__geoCalls.length)).toBe(0);
});
test("denied, unavailable, timeout and hanging location requests recover without a fallback city",async({page})=>{
  await page.goto(base+"#qibla");
  for(const code of [1,2,3]){await page.evaluate(c=>{window.__geoFailure=c;},code);await page.locator(".iu-location-button").click();await expect(page.locator(".qf-warning")).toBeVisible();await expect(page.locator(".qf-needle")).toHaveCount(0);}
  await page.evaluate(()=>{window.__geoFailure=0;});await locate(page);
  await page.clock.install();await page.evaluate(()=>{window.__geoPending=true;});await page.locator(".iu-location-button").click();await expect(page.locator(".iu-location-button")).toBeDisabled();await page.clock.runFor(16001);await expect(page.locator(".qf-warning")).toContainText("timed out");await expect(page.locator(".qf-needle")).toHaveCount(0);
});
test("absolute Android-style readings require confirmed north, rotate the dial/arrow correctly and handle landscape",async({page})=>{
  await page.goto(base+"#qibla");await locate(page);await page.getByRole("button",{name:"Enable device compass",exact:true}).click();
  await page.evaluate(()=>window.__emitHeading({alpha:270,beta:0,gamma:0,absolute:true}));
  await expect(page.locator(".qf-dial")).toHaveAttribute("data-mode","manual");
  await page.getByRole("combobox",{name:"Sensor north reference"}).selectOption("true");
  await expect(page.locator(".qf-dial")).toHaveAttribute("data-mode","live");
  expect(Number(await page.locator(".qf-needle").getAttribute("data-angle"))).toBeCloseTo(bearing(28.6139,77.209)-90,5);
  expect(Number(await page.locator(".qf-north-ring").getAttribute("data-angle"))).toBeCloseTo(-90,5);
  await page.evaluate(()=>{Object.defineProperty(screen.orientation,"angle",{configurable:true,value:90});screen.orientation.dispatchEvent(new Event("change"));window.__emitHeading({alpha:270,beta:0,gamma:0,absolute:true});});
  expect(Number(await page.locator(".qf-needle").getAttribute("data-angle"))).toBeCloseTo(bearing(28.6139,77.209),5);
});
test("WebKit magnetic headings receive WMM correction once, while poor readings stop live direction",async({page})=>{
  await page.goto(base+"#qibla");await locate(page);await page.getByRole("button",{name:"Enable device compass",exact:true}).click();
  await page.evaluate(()=>window.__emitHeading({webkitCompassHeading:90,webkitCompassAccuracy:5,beta:0,gamma:0}));
  await expect(page.locator(".qf-dial")).toHaveAttribute("data-mode","live");await expect(page.locator(".qf-controls")).toContainText("Offline WMM-2025");
  const corrected=Number(await page.locator(".qf-needle").getAttribute("data-angle"));
  await page.getByRole("combobox",{name:"Sensor north reference"}).selectOption("true");const uncorrected=Number(await page.locator(".qf-needle").getAttribute("data-angle"));expect(Math.abs(corrected-uncorrected)).toBeGreaterThan(.1);
  await page.evaluate(()=>window.__emitHeading({webkitCompassHeading:90,webkitCompassAccuracy:50,beta:0,gamma:0}));await expect(page.locator(".qf-dial")).toHaveAttribute("data-mode","manual");await expect(page.locator(".qf-sensor-status")).toContainText("unreliable");
  await page.evaluate(()=>window.__emitHeading({webkitCompassHeading:90,webkitCompassAccuracy:5,beta:90,gamma:0}));await expect(page.locator(".qf-sensor-status")).toContainText("flat");
});
test("iOS permission denial, absent events, relative alpha and stale readings show honest fallback states",async({page})=>{
  await page.clock.install();await page.goto(base+"#qibla");await locate(page);
  await page.evaluate(()=>{DeviceOrientationEvent.requestPermission=async()=>"denied";});await page.getByRole("button",{name:"Enable device compass",exact:true}).click();await expect(page.locator(".qf-sensor-status")).toContainText("permission denied");
  await page.evaluate(()=>{DeviceOrientationEvent.requestPermission=async()=>"granted";});await page.getByRole("button",{name:"Enable device compass",exact:true}).click();await page.evaluate(()=>window.__emitHeading({alpha:0,beta:0,gamma:0,absolute:false}));await page.clock.runFor(5001);await expect(page.locator(".qf-sensor-status")).toContainText("No usable");
  await page.getByRole("button",{name:"Enable device compass",exact:true}).click();await page.evaluate(()=>window.__emitHeading({webkitCompassHeading:0,webkitCompassAccuracy:5,beta:0,gamma:0}));await expect(page.locator(".qf-dial")).toHaveAttribute("data-mode","live");await page.clock.runFor(3501);await expect(page.locator(".qf-sensor-status")).toContainText("stopped");await expect(page.locator(".qf-dial")).toHaveAttribute("data-mode","manual");
  await page.evaluate(()=>{window.DeviceOrientationEvent=undefined;});await page.getByRole("button",{name:"Enable device compass",exact:true}).click();await expect(page.locator(".qf-sensor-status")).toContainText("No usable");
});
test("expired magnetic models retain the true-north fallback without pretending a magnetic heading is corrected",async({page})=>{
  await page.clock.install({time:new Date("2030-02-01T12:00:00Z")});await page.goto(base+"#qibla");await locate(page);
  await page.getByRole("button",{name:"Enable device compass",exact:true}).click();await page.evaluate(()=>window.__emitHeading({webkitCompassHeading:90,webkitCompassAccuracy:5,beta:0,gamma:0}));
  await expect(page.locator(".qf-dial")).toHaveAttribute("data-mode","manual");await expect(page.locator(".qf-warning")).toContainText("Magnetic correction unavailable");
});
test("shared legacy widget removes all random compass behavior and retains the reader and mosque control",async({page})=>{
  const errors=[];page.on("pageerror",e=>errors.push(e.message));await page.goto(base+"islamicunity.html");
  await expect(page.locator("#qiblaMount .qf")).toBeVisible();await expect(page.locator("#qiblaMount .qf-needle")).toHaveCount(0);
  await page.locator("iu-site-header .iu-location-button").click();await expect(page.locator("#qiblaMount .bearing")).toContainText(bearing(28.6139,77.209).toFixed(1));
  await expect(page.locator("#findNearbyMosques")).toBeAttached();await expect(page.locator("#quranAudioMount .qa-player")).toBeAttached();expect(errors).toEqual([]);
});
test("compass fits phone, landscape, tablet, desktop and four language layouts",async({page})=>{
  await page.goto(base+"#qibla");await locate(page);
  for(const [width,height]of [[360,800],[844,390],[768,1024],[1440,1000]]){await page.setViewportSize({width,height});for(const lang of ["en","hi","ur","ar"]){await page.getByRole("combobox",{name:"Language",exact:true}).selectOption(lang);await page.evaluate(l=>{document.documentElement.dataset.theme=l==="ar"?"dark":"light";},lang);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const dial=await page.locator(".qf-dial").boundingBox();expect(Math.abs(dial.width-dial.height)).toBeLessThan(1);expect(await page.locator(".qf-location").evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(13);}}
});
