export const AUDIO_BASE = "https://cdn.mp3quran.net/audio/mishary-alafasy/r1/";
export function getSurahAudioUrl(number) {
  if (!Number.isInteger(number) || number < 1 || number > 114)
    throw new Error("Invalid Surah number");
  return `${AUDIO_BASE}${String(number).padStart(3, "0")}.mp3`;
}
export function formatAudioTime(value) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const total = Math.floor(value),
    seconds = String(total % 60).padStart(2, "0");
  return total >= 3600
    ? `${Math.floor(total / 3600)}:${String(Math.floor((total % 3600) / 60)).padStart(2, "0")}:${seconds}`
    : `${Math.floor(total / 60)}:${seconds}`;
}
