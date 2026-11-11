// Shared schema adapters for the web client and Express API. No content copies.
export function localized(value, language = "en") {
  if (typeof value === "string") return value;
  return value?.[language] ?? value?.en ?? Object.values(value || {}).find(v => typeof v === "string") ?? "";
}
export function normalizeContent(id, data) {
  if (id === "quiz") {
    if (!Array.isArray(data?.questions) || !data.questions.length) throw new Error("Quiz contains no questions");
    const questions = data.questions.map(q => {
      const answer = q.correctAnswerIndex ?? q.answer ?? q.correct;
      const options = Array.isArray(q.options) ? q.options : q.options?.en;
      if (!localized(q.question) || !Array.isArray(options) || options.length < 2 || options.some(v => typeof v !== "string") ||
          !Number.isInteger(answer) || answer < 0 || answer >= options.length ||
          (q.options && !Array.isArray(q.options) && Object.values(q.options).some(v => !Array.isArray(v) || v.length !== options.length || v.some(o => typeof o !== "string"))))
        throw new Error("Invalid quiz question");
      return { ...q, answer };
    });
    return { id, title: data.metadata?.title || "Quiz", questions };
  }
  const entries = Array.isArray(data) ? data : data?.duas;
  if (!Array.isArray(entries) || !entries.length || entries.some(d => !localized(d.title) || typeof d.arabic !== "string"))
    throw new Error("Invalid Duas data");
  return { id: "dua", title: "Duas", items: entries.map(d => ({ ...d, body: d.translation, speech: d.arabic })) };
}
export async function requestJson(url) {
  if (typeof url !== "string" || !/^https:\/\//.test(url)) throw new Error("Missing or invalid shared URL in menu.json");
  const response = await fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(20000), headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Content request failed (${response.status})`);
  return response.json();
}
