import test from "node:test";
import assert from "node:assert/strict";
import { normalizeContent, localized } from "../shared/remote-content.mjs";
import { getSurahAudioUrl } from "../frontend/src/quran/audio-source.mjs";
test("quiz retains remote translations and answers, rejecting broken answer mappings", () => {
  const data = { questions: [{ question: { en: "Remote", hi: "नया" }, options: { en: ["A", "B"], hi: ["अ", "ब"] }, correctAnswerIndex: 1 }] };
  const result = normalizeContent("quiz", data);
  assert.equal(localized(result.questions[0].question, "hi"), "नया");
  assert.equal(result.questions[0].answer, 1);
  assert.throws(() => normalizeContent("quiz", { questions: [{ ...data.questions[0], correctAnswerIndex: 9 }] }));
  assert.throws(() => normalizeContent("quiz", { questions: [] }));
});
test("Duas use remote titles, Arabic and translation with a safe language fallback", () => {
  const result = normalizeContent("dua", [{ title: "Changed title", arabic: "دعاء", translation: { en: "Changed text" } }]);
  assert.equal(result.items[0].speech, "دعاء");
  assert.equal(localized(result.items[0].body, "hi"), "Changed text");
  assert.throws(() => normalizeContent("dua", [{ title: "Broken" }]));
});
test("audio follows an injected URL template without padding or a hidden provider fallback", () => {
  assert.equal(getSurahAudioUrl(36, "https://example.test/recitation/{number}.mp3"), "https://example.test/recitation/36.mp3");
  assert.throws(() => getSurahAudioUrl(1));
  assert.throws(() => getSurahAudioUrl(1, "http://example.test/{number}"));
});
