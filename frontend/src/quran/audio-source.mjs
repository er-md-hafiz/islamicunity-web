export function getSurahAudioUrl(number, template) {
  if (!Number.isInteger(number) || number < 1 || number > 114)
    throw new Error("Invalid Surah number");
  if (typeof template !== "string" || !template.startsWith("https://") || !template.includes("{number}"))
    throw new Error("Missing configured audio URL template");
  return template.replaceAll("{number}", String(number));
}
export function formatAudioTime(value) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const total = Math.floor(value),
    seconds = String(total % 60).padStart(2, "0");
  return total >= 3600
    ? `${Math.floor(total / 3600)}:${String(Math.floor((total % 3600) / 60)).padStart(2, "0")}:${seconds}`
    : `${Math.floor(total / 60)}:${seconds}`;
}
