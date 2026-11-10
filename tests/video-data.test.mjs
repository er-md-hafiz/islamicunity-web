import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateVideoLibrary, filterSurahs } from "../frontend/src/video/video-data.mjs";
const fixture = JSON.parse(readFileSync(new URL("../frontend/public/surah-videos.json", import.meta.url), "utf8"));

test("supplied dataset has all 114 chapters and 66 safe video mappings, independently of metadata", () => {
  const result = validateVideoLibrary({ ...fixture, totalSurahs: 500, availableVideos: 0, surahs: [...fixture.surahs].reverse() });
  assert.equal(result.totalSurahs, 114);
  assert.equal(result.availableVideos, 66);
  assert.equal(result.comingSoon, 48);
  assert.deepEqual(result.surahs.map(s => s.number), Array.from({ length: 114 }, (_, n) => n + 1));
  for (const s of result.surahs.filter(s => s.hasVideo)) {
    assert.equal(s.embedUrl, fixture.surahs[s.number - 1].embedUrl);
    assert.equal(s.videoUrl, fixture.surahs[s.number - 1].videoUrl);
  }
});
test("search and availability combine, including Arabic diacritics, digits and zero-padded numbers", () => {
  const { surahs } = validateVideoLibrary(fixture);
  for (const query of ["fatihah", "الْفَاتِحَة", "001", "١", "۱"]) assert.deepEqual(filterSurahs(surahs, query, "available").map(s => s.number), [1]);
  assert.equal(filterSurahs(surahs, "Luqman", "available").length, 0);
  assert.deepEqual(filterSurahs(surahs, "Luqman", "soon").map(s => s.number), [31]);
  assert.equal(filterSurahs(surahs, "", "soon").length, 48);
});
test("incomplete, duplicate, invalid and malformed records fail cleanly", () => {
  const changed = edit => { const data = structuredClone(fixture); edit(data); return data; };
  for (const data of [null, {}, changed(d => d.surahs.pop()), changed(d => d.surahs[1].number = 1), changed(d => d.surahs[0].name = null)]) {
    assert.throws(() => validateVideoLibrary(data));
  }
});
test("missing or unsafe media cannot create an iframe or external link", () => {
  const id = fixture.surahs[0].videoId;
  for (const fields of [
    { videoId: null }, { videoUrl: null }, { embedUrl: null }, { videoId: "bad" },
    { embedUrl: `https://evil.test/embed/${id}` }, { embedUrl: `https://www.youtube.com.evil.test/embed/${id}` },
    { embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1` },
    { embedUrl: `http://www.youtube.com/embed/${id}` }, { videoUrl: "javascript:alert(1)" },
    { videoUrl: `https://youtu.be/wrong_id123` }, { embedUrl: `https://user@www.youtube.com/embed/${id}` },
  ]) {
    const data = structuredClone(fixture); Object.assign(data.surahs[0], fields);
    const result = validateVideoLibrary(data);
    assert.equal(result.surahs[0].hasVideo, false);
    assert.equal(result.surahs[0].embedUrl, null);
    assert.equal(result.surahs[0].videoUrl, null);
    assert.equal(result.availableVideos, 65);
  }
});
