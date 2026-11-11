const TTL = 5 * 60 * 1000;
let cached;
let inFlight;

function youtubeUrl(value, id, embed = false) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return null;
    if (embed) {
      return url.hostname === "www.youtube.com" && url.pathname === `/embed/${id}` && !url.search
        ? url.href : null;
    }
    const valid = (url.hostname === "youtu.be" && url.pathname === `/${id}` && !url.search)
      || (["www.youtube.com", "youtube.com"].includes(url.hostname)
        && ((url.pathname === "/watch" && url.searchParams.get("v") === id
          && [...url.searchParams.keys()].every(key => key === "v"))
          || (url.pathname === `/shorts/${id}` && !url.search)));
    return valid ? url.href : null;
  } catch { return null; }
}

// No names or video IDs live in application code. Unsafe media becomes Coming Soon.
export function validateVideoLibrary(data) {
  if (!data || typeof data.title !== "string" || !data.title.trim()
    || typeof data.version !== "string" || !Array.isArray(data.surahs)
    || data.surahs.length !== 114) throw new Error("Invalid video library data");
  const numbers = new Set();
  const surahs = data.surahs.map(item => {
    if (!item || !Number.isInteger(item.number) || item.number < 1 || item.number > 114
      || numbers.has(item.number) || typeof item.name !== "string" || !item.name.trim()
      || typeof item.arabicName !== "string" || !item.arabicName.trim()) {
      throw new Error("Invalid Surah record");
    }
    numbers.add(item.number);
    const id = typeof item.videoId === "string" && /^[A-Za-z0-9_-]{11}$/.test(item.videoId) ? item.videoId : null;
    const embedUrl = id && youtubeUrl(item.embedUrl, id, true);
    const videoUrl = id && youtubeUrl(item.videoUrl, id);
    const hasVideo = item.hasVideo === true && !!(id && embedUrl && videoUrl);
    return { number: item.number, name: item.name.trim(), arabicName: item.arabicName.trim(),
      hasVideo, videoId: hasVideo ? id : null, embedUrl: hasVideo ? embedUrl : null,
      videoUrl: hasVideo ? videoUrl : null };
  }).sort((a, b) => a.number - b.number);
  const availableVideos = surahs.filter(item => item.hasVideo).length;
  return { version: data.version, title: data.title.trim(), surahs, totalSurahs: surahs.length,
    availableVideos, comingSoon: surahs.length - availableVideos };
}

export function normalizeSearch(value) {
  return String(value).normalize("NFKD").replace(/[\u064b-\u065f\u0670\u0640]/g, "")
    .replace(/[إأآٱ]/g, "ا").replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 0x6f0)).toLowerCase().trim();
}

export function filterSurahs(surahs, search, filter) {
  const query = normalizeSearch(search);
  return surahs.filter(s => (filter === "all" || (filter === "available" ? s.hasVideo : !s.hasVideo))
    && (!query || normalizeSearch(s.name).includes(query) || normalizeSearch(s.arabicName).includes(query)
      || String(s.number) === query.replace(/^0+(?=\d)/, "")));
}

// Read the shared URL at runtime, including when a fresh request is requested.
// Five-minute in-memory cache also shares concurrent requests; failures are never cached.
export function loadVideoLibrary({ fresh = false } = {}) {
  if (!fresh && cached && Date.now() - cached.at < TTL) return Promise.resolve(cached.data);
  if (inFlight) return inFlight;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  inFlight = (async () => {
    const { loadCommonUrls } = await import("../config/common-urls.mjs");
    const config = await loadCommonUrls();
    const url = config.quran?.surahVideoUrl;
    if (typeof url !== "string" || !/^https:\/\//.test(url)) throw new Error("Missing shared video URL");
    const response = await fetch(url, {
      signal: controller.signal, cache: "no-cache", headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Video request failed (${response.status})`);
    const data = validateVideoLibrary(await response.json());
    cached = { data, at: Date.now() };
    return data;
  })().finally(() => { clearTimeout(timeout); inFlight = null; });
  return inFlight;
}
