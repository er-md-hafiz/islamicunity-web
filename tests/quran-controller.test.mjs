import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { QuranAudioController } from "../frontend/src/quran/audio-controller.mjs";
import {
  getSurahAudioUrl,
  formatAudioTime,
} from "../frontend/src/quran/audio-source.mjs";
const surahs = JSON.parse(
  await readFile(
    new URL("../frontend/src/quran/surahs.json", import.meta.url),
    "utf8",
  ),
);

class Media extends EventTarget {
  constructor() {
    super();
    this.preload = "";
    this.volume = 1;
    this.muted = false;
    this.playbackRate = 1;
    this.currentTime = 0;
    this.duration = 0;
    this.readyState = 0;
    this.paused = true;
    this.src = "";
    this.loads = 0;
  }
  event(name) {
    this.dispatchEvent(new Event(name));
  }
  load() {
    this.loads++;
  }
  removeAttribute(name) {
    if (name === "src") this.src = "";
  }
  play() {
    if (this.pending) return this.pending;
    if (this.rejection) return Promise.reject(this.rejection);
    this.paused = false;
    this.readyState = 3;
    this.event("play");
    this.event("playing");
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
    this.event("pause");
  }
  metadata(duration) {
    this.duration = duration;
    this.readyState = 1;
    this.event("loadedmetadata");
  }
}
function setup(options = {}) {
  const media = [];
  const controller = new QuranAudioController({
    audioFactory: () => {
      const a = new Media();
      media.push(a);
      return a;
    },
    ...options,
  });
  return { controller, media };
}

test("metadata covers all 114 chapters, including standard names and all 6236 ayahs", () => {
  assert.equal(surahs.length, 114);
  assert.deepEqual(
    surahs.map((s) => s.number),
    Array.from({ length: 114 }, (_, i) => i + 1),
  );
  assert.equal(
    surahs.reduce((sum, s) => sum + s.ayahCount, 0),
    6236,
  );
  for (const s of surahs) {
    assert.ok(s.englishName && s.arabicName);
    assert.ok(Number.isInteger(s.ayahCount) && s.ayahCount > 0);
  }
  assert.equal(surahs[0].englishName, "Al-Fatihah");
  assert.equal(surahs[1].ayahCount, 286);
  assert.equal(surahs[113].englishName, "An-Nas");
});
test("deterministic audio URLs and validation cover every chapter and requested examples", () => {
  for (let n = 1; n <= 114; n++)
    assert.equal(
      getSurahAudioUrl(n),
      `https://cdn.mp3quran.net/audio/mishary-alafasy/r1/${String(n).padStart(3, "0")}.mp3`,
    );
  for (const value of [0, 115, -1, 1.5, NaN, "10", null])
    assert.throws(() => getSurahAudioUrl(value), /Invalid/);
  assert.equal(formatAudioTime(3671), "1:01:11");
  assert.equal(formatAudioTime(Infinity), "0:00");
  assert.equal(formatAudioTime(59.9), "0:59");
});
test("no media is created or loaded until explicit Play; chapter selection alone stays silent", async () => {
  const { controller: c, media } = setup();
  assert.equal(media.length, 0);
  assert.equal(c.state.autoNext, false);
  c.select(55);
  assert.equal(media.length, 0);
  await c.play();
  assert.equal(media.length, 1);
  assert.equal(media[0].preload, "none");
  assert.equal(media[0].src, getSurahAudioUrl(55));
  assert.equal(c.state.playing, true);
  c.dispose();
});
test("metadata, progress, pause, resume and guarded seeking update from actual media events", async () => {
  const { controller: c, media } = setup();
  assert.equal(c.seek(10), false);
  await c.play();
  const a = media[0];
  a.metadata(100);
  assert.equal(c.state.duration, 100);
  assert.equal(c.seek(150), true);
  assert.equal(a.currentTime, 100);
  assert.equal(c.seek(-5), true);
  assert.equal(a.currentTime, 0);
  a.currentTime = 21;
  a.event("timeupdate");
  assert.equal(c.state.currentTime, 21);
  c.pause();
  assert.equal(c.state.status, "paused");
  await c.play();
  assert.equal(media.length, 1);
  assert.equal(c.state.playing, true);
  c.dispose();
});
test("switching releases old sources and rejects stale playback/errors without affecting the new chapter", async () => {
  const { controller: c, media } = setup();
  let reject;
  const pending = new Promise((_r, j) => {
    reject = j;
  });
  const originalFactory = c.audioFactory;
  c.audioFactory = () => {
    const a = originalFactory();
    if (media.length === 1) a.pending = pending;
    return a;
  };
  const first = c.play();
  c.select(2);
  assert.equal(media[0].src, "");
  assert.equal(media[0].paused, true);
  assert.equal(c.state.duration, 0);
  await c.play();
  reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
  await first;
  media[0].error = { code: 4 };
  media[0].event("error");
  assert.equal(c.state.number, 2);
  assert.equal(c.state.status, "playing");
  assert.equal(media[1].src, getSurahAudioUrl(2));
  c.dispose();
});
test("previous/next respect boundaries and volume, mute and rate survive track changes", async () => {
  const { controller: c, media } = setup();
  c.previous();
  assert.equal(c.state.number, 1);
  c.setVolume(0.4);
  c.toggleMute();
  c.setRate(1.5);
  await c.play();
  assert.equal(media[0].muted, true);
  assert.equal(media[0].volume, 0.4);
  assert.equal(media[0].playbackRate, 1.5);
  c.next();
  assert.equal(c.state.number, 2);
  await c.play();
  assert.equal(media[1].playbackRate, 1.5);
  c.setVolume(0);
  c.toggleMute();
  assert.equal(c.state.volume, 0.4);
  assert.equal(c.state.muted, false);
  c.select(114);
  c.next();
  assert.equal(c.state.number, 114);
  c.dispose();
});
test("continuous play is opt-in, advances on ended, and stops at An-Nas", async () => {
  const { controller: c, media } = setup();
  await c.play();
  media[0].event("ended");
  assert.equal(c.state.number, 1);
  assert.equal(c.state.status, "ended");
  c.setAutoNext(true);
  await c.play();
  media[0].event("ended");
  assert.equal(c.state.number, 2);
  assert.equal(media.length, 2);
  assert.equal(c.state.playing, true);
  c.select(114);
  await c.play();
  media[2].event("ended");
  assert.equal(c.state.number, 114);
  assert.equal(c.state.playing, false);
  assert.equal(media.length, 3);
  c.dispose();
});
test("offline, browser blocking, unsupported media, and retry recover without stuck loading", async () => {
  let online = false;
  const { controller: c, media } = setup({ isOnline: () => online });
  await c.play();
  assert.equal(c.state.error, "offline");
  assert.equal(media.length, 0);
  online = true;
  await c.retry();
  assert.equal(c.state.status, "playing");
  media[0].error = { code: 4 };
  media[0].event("error");
  assert.equal(c.state.error, "unsupported");
  assert.equal(media[0].src, "");
  await c.retry();
  assert.equal(c.state.status, "playing");
  c.dispose();
  const { controller: blocked } = setup({
    audioFactory: () => {
      const a = new Media();
      a.rejection = Object.assign(new Error("blocked"), {
        name: "NotAllowedError",
      });
      return a;
    },
  });
  await blocked.play();
  assert.equal(blocked.state.error, "blocked");
  blocked.dispose();
});
test("loading and buffering time out, release resources, and never remain indefinitely loading", async () => {
  const { controller: c, media } = setup({
    timeout: 10,
    audioFactory: () => {
      const a = new Media();
      a.pending = new Promise(() => {});
      media.push(a);
      return a;
    },
  });
  void c.play();
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(c.state.status, "error");
  assert.equal(c.state.error, "timeout");
  assert.equal(media[0].src, "");
  c.dispose();
  const x = setup({ timeout: 10 });
  await x.controller.play();
  x.media[0].event("waiting");
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(x.controller.state.error, "timeout");
  x.controller.dispose();
});
test("disposal releases the selected stream and old events cannot revive the player", async () => {
  const { controller: c, media } = setup();
  await c.play();
  c.dispose();
  assert.equal(media[0].src, "");
  assert.equal(media[0].paused, true);
  media[0].event("playing");
  await c.play();
  assert.equal(media.length, 1);
});
