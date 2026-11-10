import { mkdir, writeFile } from "node:fs/promises";
import {
  getSurahAudioUrl,
  AUDIO_BASE,
} from "../frontend/src/quran/audio-source.mjs";
const results = new Array(114);
let cursor = 0;
async function inspect(number) {
  const url = getSurahAudioUrl(number);
  try {
    const head = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(15000),
    });
    const type = head.headers.get("content-type");
    const response = await fetch(url, {
      headers: { Range: "bytes=0-1" },
      signal: AbortSignal.timeout(15000),
    });
    const range = response.headers.get("content-range");
    // Cancel after the tiny probe. Never save or consume an entire recitation.
    if (response.body) await response.body.cancel();
    return {
      number,
      url,
      headStatus: head.status,
      contentType: type,
      contentLength: Number(head.headers.get("content-length")),
      rangeStatus: response.status,
      contentRange: range,
      accessible: head.ok && /^audio\//i.test(type || ""),
      rangeSupported:
        response.status === 206 && /^bytes 0-1\/\d+$/.test(range || ""),
    };
  } catch (error) {
    return {
      number,
      url,
      accessible: false,
      rangeSupported: false,
      error: error.message,
    };
  }
}
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < 114) {
      const number = ++cursor;
      let result = await inspect(number);
      if (!result.accessible || !result.rangeSupported)
        result = await inspect(number);
      results[number - 1] = result;
    }
  }),
);
const report = {
  checkedAt: new Date().toISOString(),
  baseUrl: AUDIO_BASE,
  method:
    "HEAD plus GET Range bytes=0-1; response bodies canceled; no MP3 files saved",
  total: 114,
  accessible: results.filter((r) => r.accessible).length,
  rangeSupported: results.filter((r) => r.rangeSupported).length,
  inaccessible: results.filter((r) => !r.accessible).map((r) => r.number),
  results,
};
await mkdir(new URL("../docs/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../docs/quran-audio-verification.json", import.meta.url),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    total: report.total,
    accessible: report.accessible,
    rangeSupported: report.rangeSupported,
    inaccessible: report.inaccessible,
    report: "docs/quran-audio-verification.json",
  }),
);
if (report.accessible !== 114 || report.rangeSupported !== 114)
  process.exitCode = 1;
