import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Clock3,
  Compass,
  BookOpen,
  Bell,
  CircleDot,
  CalendarDays,
  Headphones,
  LibraryBig,
  Sparkles,
  Heart,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Volume2,
  Menu,
  X,
  Globe2,
  Settings2,
  RotateCcw,
  Check,
  LocateFixed,
  Play,
  CheckCircle2,
  Search,
  Landmark,
  HandHeart,
  Calculator,
  HelpCircle,
  Images,
  Video,
  Coffee,
  Newspaper,
  ArrowLeftRight,
  Puzzle,
  ShieldCheck,
  ExternalLink,
  Star,
  Copy,
  LoaderCircle,
} from "lucide-react";
import { translate, locales } from "./i18n";
import { api } from "./api";
import LandingPage from "./LandingPage";
import QuranAudioPlayer from "./quran/QuranAudioPlayer";
import QuranReader from "./quran/QuranReader";
import { localized } from "./config/common-urls.mjs";
import SurahVideoLibrary from "./video/SurahVideoLibrary";
import QiblaFinder from "./qibla/QiblaFinder";
import { useAccurateLocation } from "./qibla/useAccurateLocation";
import SiteFooter from "./footer/SiteFooter";
import { resourceHref } from "../../shared/resource-navigation.mjs";
import { sitePageHref } from "../../shared/site-navigation.mjs";
import HeaderActions from "./header/HeaderActions";
import "./styles.css";
import { useStored } from "./hooks/useStored";
const BooksPage = React.lazy(() => import("./books/BooksPage"));
const defaultToolPage = () => location.pathname.endsWith("/Books.html") ? "books" : "prayer_times";
const icons = {
  prayer_times: Clock3,
  qibla: Compass,
  quran: BookOpen,
  reminders: Bell,
  tasbih: CircleDot,
  calendar: CalendarDays,
  audio: Headphones,
  books: LibraryBig,
  allah_names: Sparkles,
  hajj: Landmark,
  umrah: Landmark,
  halal: ShieldCheck,
  news: Newspaper,
  quiz: HelpCircle,
  photo: Images,
  video: Video,
  donate: HandHeart,
  dua: HandHeart,
  prayer_guide: BookOpen,
  mosque: Landmark,
  zakat: Calculator,
  currency: ArrowLeftRight,
  games_and_puzzles: Puzzle,
};
const core = [
  "prayer_times",
  "qibla",
  "quran",
  "audio",
  "reminders",
  "tasbih",
  "calendar",
];
const learning = ["audio", "books", "allah_names", "dua", "prayer_guide"];
const prayerIcons = {
  Fajr: Moon,
  Sunrise,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};
const descriptions = {
  qibla: "Find your direction, wherever you are.",
  quran: "Words to nourish your soul.",
  tasbih: "Find peace in remembrance.",
  audio: "Pause, listen, and reflect.",
  books: "A world of wisdom awaits.",
  allah_names: "Discover the beautiful names.",
};
function Icon({ name, ...props }) {
  const I = icons[name] || Sparkles;
  return <I size={20} strokeWidth={1.65} {...props} />;
}
function MosqueArt() {
  return (
    <svg
      className="mosque-art"
      viewBox="0 0 450 270"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="dome"
          x1="180"
          y1="90"
          x2="280"
          y2="240"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e2c98c" />
          <stop offset="1" stopColor="#8eaa85" />
        </linearGradient>
        <linearGradient id="wall">
          <stop stopColor="#b8c5a0" />
          <stop offset="1" stopColor="#72977c" />
        </linearGradient>
      </defs>
      <circle cx="260" cy="146" r="116" stroke="#e3d6aa" strokeOpacity=".18" />
      <circle cx="260" cy="146" r="100" stroke="#e3d6aa" strokeOpacity=".12" />
      <path
        d="M65 242h340M260 22v12M254 28h12M369 75v10M364 80h10M120 89v10M115 94h10"
        stroke="#e8ce93"
        strokeOpacity=".7"
      />
      <path d="M331 39a14 14 0 1 0 12 23 15 15 0 0 1-12-23" fill="#e6ce92" />
      <path
        d="M109 240V115h18v125M105 115h26l-5-15h-16zM112 100V79l6-12 6 12v21M117 67V56M365 240V115h18v125M361 115h26l-5-15h-16zM368 100V79l6-12 6 12v21M373 67V56"
        fill="url(#wall)"
      />
      <path d="M140 240V164h47v76M304 240v-76h47v76" fill="#7e9d80" />
      <path
        d="M135 164c0-20 24-22 29-36 5 14 28 16 28 36M299 164c0-20 24-22 29-36 5 14 28 16 28 36"
        fill="url(#dome)"
      />
      <path d="M188 240V145h116v95" fill="url(#wall)" />
      <path
        d="M178 146c0-44 52-54 68-88 15 34 68 44 68 88z"
        fill="url(#dome)"
      />
      <path
        d="M246 59V40m0 0a8 8 0 0 1 0-13 8 8 0 1 0 0 13"
        stroke="#e8ce93"
        strokeWidth="2"
      />
      <path d="M228 240v-42c0-14 18-24 18-24s18 10 18 24v42" fill="#234f40" />
      <path
        d="M201 183v-16c0-6 7-10 7-10s7 4 7 10v16M277 183v-16c0-6 7-10 7-10s7 4 7 10v16M151 201v-16c0-6 7-10 7-10s7 4 7 10v16M320 201v-16c0-6 7-10 7-10s7 4 7 10v16"
        fill="#38624b"
      />
      <path
        d="M181 147h129M189 154h113M103 127h29M361 127h29"
        stroke="#e4d0a0"
        strokeOpacity=".65"
      />
      <path
        d="M79 241q-20-35-10-59 26 14 10 59M92 242q-9-48 10-58 14 30-10 58M398 241q-16-40 3-55 17 27-3 55"
        fill="#92a781"
        fillOpacity=".55"
      />
      <path
        d="M246 66c-14 34-40 42-40 78M246 66c14 34 40 42 40 78"
        stroke="#fff6c8"
        strokeOpacity=".18"
      />
    </svg>
  );
}
function App() {
  const [language, setLanguage] = useStored("iu-language", "en");
  const t = (key) => translate(key, language);
  const [page, setPage] = useState(location.hash.slice(1) || defaultToolPage());
  const [menu, setMenu] = useState(null),
    [menuError, setMenuError] = useState("");
  const [prayers, setPrayers] = useState(null),
    [prayerError, setPrayerError] = useState("");
  const [cal, setCal] = useState(null),
    [verse, setVerse] = useState(null);
  const [coords, setCoords] = useStored("iu-location", {
    lat: 28.6139,
    lon: 77.209,
    name: "New Delhi, India",
  });
  const [tomorrowPrayers, setTomorrowPrayers] = useState(null);
  const qiblaLocation = useAccurateLocation(position => {
    setCoords({ ...position, name: "Current location" });
  });
  const [month, setMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [now, setNow] = useState(new Date()),
    [sidebar, setSidebar] = useState(false),
    [toast, setToast] = useState("");
  const [reminders, setReminders] = useStored("iu-reminders", {}),
    [count, setCount] = useStored("iu-tasbih", 0),
    [phrase, setPhrase] = useStored("iu-phrase", "SubhanAllah");
  const [target, setTarget] = useStored("iu-target", 33),
    [voices, setVoices] = useState([]),
    [voiceName, setVoiceName] = useStored("iu-voice", "");
  const [settings, setSettings] = useState(false),
    [dark, setDark] = useStored("iu-dark", false);
  const [content, setContent] = useState(null),
    [contentError, setContentError] = useState("");
  const [reload, setReload] = useState(0);
  const fired = useRef(new Set());
  useEffect(() => {
    if (!settings) return;
    const onKey = (e) => {
      if (e.key === "Escape") setSettings(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [settings]);
  useEffect(() => {
    const listener = () => {
      setPage(location.hash.slice(1) || defaultToolPage());
      setSidebar(false);
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = ["ar", "ur"].includes(language)
      ? "rtl"
      : "ltr";
  }, [language]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    api("menu")
      .then((data) => {
        setMenu(data);
        setMenuError("");
      })
      .catch((e) => setMenuError(e.message));
    api("quran")
      .then(setVerse)
      .catch(() => {});
  }, [reload]);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  useEffect(() => {
    api(`calendar?date=${date}`)
      .then(setCal)
      .catch(() => {});
  }, [date, reload]);
  useEffect(() => {
    let active = true;
    setPrayers(null);
    setPrayerError("");
    api(`prayertimes?lat=${coords.lat}&lon=${coords.lon}&date=${date}`)
      .then((p) => {
        if (active) {
          setPrayers(p);
          setTimezone(p.timezone);
        }
      })
      .catch((e) => {
        if (active) setPrayerError(e.message);
      });
    return () => {
      active = false;
    };
  }, [coords, date, reload]);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(speechSynthesis.getVoices());
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", load);
      speechSynthesis.cancel();
    };
  }, []);
  useEffect(() => {
    if (core.includes(page) || page === "settings" || page === "video" || page === "books") return;
    let active = true;
    setContent(null);
    setContentError("");
    api(`features/${encodeURIComponent(page)}`)
      .then((c) => {
        if (active) setContent(c);
      })
      .catch((e) => {
        if (active) setContentError(e.message);
      });
    return () => {
      active = false;
    };
  }, [page, reload]);
  const timeParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const secondsNow =
    +timeParts.hour * 3600 + +timeParts.minute * 60 + +timeParts.second;
  const prayerList = prayers
    ? Object.entries(prayers.timings).map(([name, time]) => ({
        name,
        time,
        seconds: +time.slice(0, 2) * 3600 + +time.slice(3, 5) * 60,
      }))
    : [];
  const upcoming = prayerList.filter((p) => p.name !== "Sunrise");
  const afterLastPrayer =
    upcoming.length > 0 && upcoming.every((p) => p.seconds <= secondsNow);
  useEffect(() => {
    if (!afterLastPrayer) {
      setTomorrowPrayers(null);
      return;
    }
    let active = true;
    setTomorrowPrayers(null);
    const d = new Date(date + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    api(
      `prayertimes?lat=${coords.lat}&lon=${coords.lon}&date=${d.toISOString().slice(0, 10)}`,
    )
      .then((p) => {
        if (active) setTomorrowPrayers(p);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [afterLastPrayer, coords, date, reload]);
  const tomorrowFajr = tomorrowPrayers?.timings?.Fajr;
  const next =
    upcoming.find((p) => p.seconds > secondsNow) ||
    (tomorrowFajr
      ? {
          name: "Fajr",
          time: tomorrowFajr,
          seconds:
            +tomorrowFajr.slice(0, 2) * 3600 + +tomorrowFajr.slice(3, 5) * 60,
        }
      : null);
  const delta = next ? (next.seconds - secondsNow + 86400) % 86400 : 0;
  const countdown = [
    Math.floor(delta / 3600),
    Math.floor((delta % 3600) / 60),
    delta % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(" : ");
  useEffect(() => {
    if (!prayers || prayers.sample) return;
    for (const prayer of prayerList) {
      const key = `${prayers.date}:${coords.lat}:${coords.lon}:${prayer.name}`;
      if (
        prayer.name !== "Sunrise" &&
        reminders[prayer.name] &&
        secondsNow >= prayer.seconds &&
        secondsNow < prayer.seconds + 60 &&
        !fired.current.has(key)
      ) {
        fired.current.add(key);
        const text = `${t(prayer.name)} · ${formatTime(prayer.time)}`;
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("Islamic Unity", { body: text });
          } catch {
            setToast(text);
          }
        } else {
          setToast(text);
        }
      }
    }
  }, [secondsNow, prayers, reminders]);
  function navigate(id) {
    const direct = resourceHref(id, import.meta.env.BASE_URL);
    if (direct) { location.assign(direct); return; }
    location.hash = id;
    setPage(id);
    setSidebar(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function speak(text, lang = "hi-IN") {
    if (!("speechSynthesis" in window))
      return setToast("Speech is unavailable in this browser.");
    const available = speechSynthesis.getVoices(),
      candidates = available.filter((v) => v.lang.startsWith(lang.slice(0, 2)));
    const chosen =
      available.find((v) => v.name === voiceName) ||
      candidates.find((v) =>
        /female|swara|heera|kalpana|lekha|priya/i.test(v.name),
      ) ||
      candidates[0];
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.87;
    if (chosen) utterance.voice = chosen;
    else
      setToast(
        "No Hindi voice installed. Your browser will use its default voice.",
      );
    utterance.onerror = (e) => {
      if (e.error !== "interrupted" && e.error !== "canceled")
        setToast(
          "The voice could not play. Please check your browser voice settings.",
        );
    };
    speechSynthesis.speak(utterance);
  }
  function speakTimes() {
    if (prayers)
      speak(
        `आज की नमाज़ के समय। ${prayerList.map((p) => `${translate(p.name, "hi")}: ${formatTime(p.time)}`).join("। ")}।`,
      );
  }
  async function toggleReminder(name) {
    if (
      !reminders[name] &&
      "Notification" in window &&
      Notification.permission === "default"
    )
      await Notification.requestPermission();
    setReminders((r) => ({ ...r, [name]: !r[name] }));
    if ("Notification" in window && Notification.permission === "denied")
      setToast(
        "Browser notifications are blocked. In-app reminders will appear while this tab is open.",
      );
  }
  const navItems =
    menu?.home?.items?.filter((i) => i.enabled && i.visible) || [];
  const nav = (id) => {
    const item = navItems.find((i) => i.id === id);
    if (!item && !["quran", "reminders"].includes(id)) return null;
    const href = resourceHref(id, import.meta.env.BASE_URL)
      || (id === "donate" ? sitePageHref("donate", import.meta.env.BASE_URL) : null);
    const Tag = href ? "a" : "button";
    return (
      <Tag
        key={id}
        className={`nav-item ${page === id ? "active" : ""}`}
        href={href || undefined}
        onClick={href ? undefined : () => navigate(id)}
        aria-current={page === id ? "page" : undefined}
      >
        <Icon name={id} />
        <span>
          {t(id)}
          {language === "en" &&
            ["prayer_times", "qibla", "quran", "tasbih"].includes(id) && (
              <small>{translate(id, "hi")}</small>
            )}
        </span>
        {page === id && <span className="active-dot" />}
      </Tag>
    );
  };
  function PrayerSchedule() {
    return (
      <section className="schedule">
        <div className="section-heading">
          <div>
            <h2>{t("today")}</h2>
            <p>
              {timezone} <span className="dot-separator">•</span>{" "}
              {prayers?.sample
                ? t("sample")
                : "University of Islamic Sciences, Karachi"}
            </p>
          </div>
          <button
            className="text-button"
            onClick={speakTimes}
            disabled={!prayers}
          >
            <Volume2 size={16} />
            {t("speak")}
          </button>
        </div>
        {prayerError ? (
          <ErrorBox
            message={prayerError}
            retry={() => setReload((r) => r + 1)}
          />
        ) : !prayers ? (
          <div className="loading">
            <LoaderCircle className="spin" size={20} /> Loading today’s
            schedule…
          </div>
        ) : (
          <>
            <div className="prayer-grid">
              {prayerList.map((p) => {
                const I = prayerIcons[p.name];
                return (
                  <div
                    key={p.name}
                    className={`prayer-tile ${next?.name === p.name ? "upcoming" : ""}`}
                  >
                    <div className="prayer-tile-top">
                      <I size={23} strokeWidth={1.5} />
                      {next?.name === p.name && <span>{t("nextBadge")}</span>}
                    </div>
                    <div className="prayer-name">{t(p.name)}</div>
                    <div className="prayer-time">
                      {formatTime(p.time).split(" ")[0]}
                      <small>{formatTime(p.time).split(" ")[1]}</small>
                    </div>
                    <div className="prayer-tile-bottom">
                      {p.name === "Sunrise" ? (
                        <span className="muted">{t("daybreak")}</span>
                      ) : (
                        <button
                          aria-label={`${reminders[p.name] ? "Disable" : "Enable"} ${p.name} reminder`}
                          className={reminders[p.name] ? "bell-enabled" : ""}
                          onClick={() => toggleReminder(p.name)}
                        >
                          <Bell
                            size={14}
                            fill={reminders[p.name] ? "currentColor" : "none"}
                          />
                          <span>
                            {reminders[p.name]
                              ? t("reminderOn")
                              : t("remindMe")}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="schedule-note">
              <ShieldCheck size={13} />
              {prayers.sample ? t("sampleNote") : t("timingNote")}
            </p>
          </>
        )}
      </section>
    );
  }
  function VerseCard({ expanded = false }) {
    return (
      <section className={`card verse-card ${expanded ? "expanded" : ""}`}>
        <div className="card-heading">
          <span className="eyebrow">
            <BookOpen size={16} /> {t("daily")}
          </span>
          <button
            className="icon-button"
            onClick={() => {
              if (verse) {
                navigator.clipboard
                  ?.writeText(
                    `${verse.arabic}\n${verse.translations[language]} — ${verse.reference}`,
                  )
                  .then(() => setToast("Verse copied."))
                  .catch(() =>
                    setToast("Copy is unavailable in this browser."),
                  );
              }
            }}
            aria-label="Copy verse"
          >
            <Copy size={16} />
          </button>
        </div>
        {verse ? (
          <>
            <p className="verse-arabic" lang="ar" dir="rtl">
              {verse.arabic} <span>۝</span>
            </p>
            <p className="verse-translation">
              “{verse.translations[language]}”
            </p>
            {expanded && (
              <p className="transliteration">{verse.transliteration}</p>
            )}
            <div className="verse-footer">
              <span>{verse.reference}</span>
              <button
                className="round-play"
                aria-label={t("listen")}
                onClick={() => speak(verse.transliteration)}
              >
                <Play size={13} fill="currentColor" />
              </button>
            </div>
            {expanded && (
              <>
                <hr />
                <p>{verse.reflection}</p>
                <button
                  className="button"
                  onClick={() => speak(verse.transliteration)}
                >
                  <Volume2 size={16} />
                  {t("listen")}
                </button>
                <p className="helper">{t("readingAid")}</p>
              </>
            )}
          </>
        ) : (
          <p>
            Inspiration is unavailable.{" "}
            <button
              className="text-button"
              onClick={() => setReload((r) => r + 1)}
            >
              Retry
            </button>
          </p>
        )}
      </section>
    );
  }
  function Tasbih({ expanded = false }) {
    return (
      <section className={`card tasbih-card ${expanded ? "expanded" : ""}`}>
        <div className="card-heading">
          <span className="eyebrow">
            <CircleDot size={16} />
            {!expanded && t("tasbih")}
          </span>
          <button
            className="icon-button"
            aria-label={t("reset")}
            onClick={() => setCount(0)}
          >
            <RotateCcw size={15} />
          </button>
        </div>
        <select
          aria-label="Dhikr phrase"
          className="phrase-select"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
        >
          {["SubhanAllah", "Alhamdulillah", "Allahu Akbar"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <button
          className="counter-button"
          onClick={() => {
            setCount((c) => c + 1);
            navigator.vibrate?.(20);
          }}
          aria-label={`${t("count")}, ${count}`}
          style={{ "--progress": `${Math.min(count / target, 1) * 360}deg` }}
        >
          <span>
            {count}
            <small>/ {target}</small>
          </span>
        </button>
        <p className="tap-hint">
          {count >= target ? t("goalComplete") : t("count")}
        </p>
        {expanded && (
          <label className="target-label">
            {t("goal")}
            <select value={target} onChange={(e) => setTarget(+e.target.value)}>
              {[33, 99, 100].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        )}
      </section>
    );
  }
  function CalendarCard({ expanded = false }) {
    const days = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    const start = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    return (
      <section className={`card calendar-card ${expanded ? "expanded" : ""}`}>
        <div className="card-heading">
          <span className="eyebrow">
            <CalendarDays size={16} />
            {t("upcoming")}
          </span>
          <span className="tiny-badge">{t("hijri")}</span>
        </div>
        {expanded && (
          <>
            <h2>{cal?.hijri}</h2>
            <div className="month-nav">
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                <ChevronLeft size={18} />
              </button>
              <strong>
                {month.toLocaleDateString(language, {
                  month: "long",
                  year: "numeric",
                })}
              </strong>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="calendar-grid">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <b key={"h" + i}>{d}</b>
              ))}
              {Array.from({ length: start }, (_, i) => (
                <span key={"e" + i} />
              ))}
              {Array.from({ length: days }, (_, i) => {
                const d = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                const event = cal?.events.find((e) => e.date === d);
                return (
                  <span
                    key={i}
                    title={event?.title}
                    className={`${d === date ? "calendar-today" : ""} ${event ? "calendar-event" : ""}`}
                  >
                    {i + 1}
                  </span>
                );
              })}
            </div>
          </>
        )}
        {cal?.events.slice(0, expanded ? 4 : 2).map((e) => (
          <div className="event" key={e.title}>
            <div className="event-date">
              <span>
                {new Date(e.date + "T12:00:00").toLocaleDateString("en", {
                  month: "short",
                })}
              </span>
              <strong>{+e.date.slice(-2)}</strong>
            </div>
            <div>
              <h4>
                {t(
                  {
                    "Ramadan begins": "ramadan",
                    "Eid al-Fitr": "eidFitr",
                    "Day of Arafah": "arafah",
                    "Eid al-Adha": "eidAdha",
                    "Islamic New Year": "newYear",
                  }[e.title] || e.title,
                )}
              </h4>
              <p>{e.subtitle}</p>
            </div>
            <span className="event-away">{e.daysAway}d</span>
          </div>
        ))}
        <p className="helper">
          {cal?.note || "Calendar is currently unavailable."}
        </p>
        {!expanded && (
          <button
            className="calendar-link"
            onClick={() => navigate("calendar")}
          >
            {t("view")}
            <ChevronRight size={15} />
          </button>
        )}
      </section>
    );
  }
  return (
    <div className="app-shell">
      {sidebar && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside className={`sidebar ${sidebar ? "is-open" : ""}`}>
        <a className="brand" href="#prayer_times" aria-label="Home">
          <span className="brand-mark">
            <Moon size={27} fill="currentColor" />
            <Sparkles size={13} />
          </span>
          <span className="sidebar-brand-name">Islamic Unity</span>
        </a>
        <button
          className="mobile-close icon-button"
          onClick={() => setSidebar(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>
        <div className="sidebar-nav">
          <p className="nav-label">{t("essentials")}</p>
          {core.map(nav)}
          <p className="nav-label">{t("discover")}</p>
          {learning.map(nav)}
          <p className="nav-label">{t("more")}</p>
          {navItems
            .filter((i) => !core.includes(i.id) && !learning.includes(i.id))
            .map((i) => nav(i.id))}
          {menuError && (
            <ErrorBox
              message="Menu unavailable"
              retry={() => setReload((r) => r + 1)}
            />
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="faith-note">
            <span>بِسْمِ اللَّهِ</span>
            <p>{t("faithNote")}</p>
            <Sparkles size={14} />
          </div>
          <button className="nav-item" onClick={() => setSettings(true)}>
            <Settings2 size={19} />
            <span>{t("settings")}</span>
          </button>
          <p className="powered">
            {t("closer")} <Heart size={11} />
          </p>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-title">
            <a
              className="lp-back-home"
              href={sitePageHref("home", import.meta.env.BASE_URL) + "#home"}
              aria-label="Islamic Unity homepage"
            >
              <ChevronLeft size={13} />
              <span>{t("websiteHome")}</span>
            </a>
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setSidebar(true)}
            >
              <Menu size={22} />
            </button>
            <span>
              {page === "books" ? <a href={sitePageHref("home", import.meta.env.BASE_URL) + "#prayer_times"}>{t("home")}</a> : t("home")} <ChevronRight size={13} />
              <b>{t(page)}</b>
            </span>
          </div>
          <div className="topbar-actions">
            <span className="live-date">
              <CalendarDays size={15} />
              {now.toLocaleDateString(language, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <div className="language-select">
              <Globe2 size={16} />
              <select
                aria-label="Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {Object.entries(locales).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <HeaderActions language={language} onReminders={() => navigate("reminders")} />
          </div>
        </header>
        <main>
          <div className="page-content" key={page}>
            {page === "prayer_times" ? (
              <>
                <section className="prayer-hero">
                  <div className="hero-pattern" />
                  <div className="hero-main">
                    <div className="hero-date">
                      <span className="date-dot" />
                      {cal?.hijri || "Your daily moment of connection"}
                    </div>
                    <p className="next-label">
                      {t("next")}
                      {afterLastPrayer ? " · " + t("tomorrow") : ""}
                      {afterLastPrayer && tomorrowPrayers?.sample
                        ? " · " + t("sample")
                        : ""}
                    </p>
                    <div className="next-prayer">
                      <h2>{next ? t(next.name) : "—"}</h2>
                      <span>{next ? formatTime(next.time) : t("loading")}</span>
                    </div>
                    <div className="countdown">
                      <Clock3 size={16} />
                      <span>{t("remaining")}</span>
                      <strong>{countdown}</strong>
                    </div>
                    <button
                      className="hero-button"
                      onClick={() => navigate("reminders")}
                    >
                      <Bell size={15} />
                      {t("enable")}
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="hero-art">
                    <p>حَيَّ عَلَى الصَّلَاةِ</p>
                    <MosqueArt />
                    <span>{t("peace")}</span>
                  </div>
                </section>
                {PrayerSchedule()}
                <div className="daily-grid">
                  {VerseCard({})}
                  <QiblaFinder location={qiblaLocation} language={language} onOpen={() => navigate("qibla")} />
                  {Tasbih({})}
                </div>
                <div className="bottom-grid">
                  <section className="explore-section">
                    <div className="section-heading">
                      <div>
                        <h2>{t("explore")}</h2>
                        <p>{t("journey")}</p>
                      </div>
                      <span className="section-flower">✳</span>
                    </div>
                    <div className="explore-grid">
                      {["quran", "audio", "books", "allah_names"].map(
                        (id, i) => (
                          <button
                            className={`explore-card color-${i}`}
                            key={id}
                            onClick={() => navigate(id)}
                          >
                            <span className="explore-icon">
                              <Icon name={id} size={23} />
                            </span>
                            <ArrowUpRight className="explore-arrow" size={16} />
                            <h3>{t(id)}</h3>
                            <p>{t(id + "Desc")}</p>
                          </button>
                        ),
                      )}
                    </div>
                  </section>
                  {CalendarCard({})}
                </div>
              </>
            ) : page === "qibla" ? (
              <QiblaFinder location={qiblaLocation} language={language} expanded />
            ) : page === "books" ? (
              <React.Suspense fallback={<div className="loading">{t("loading")}</div>}><BooksPage language={language} /></React.Suspense>
            ) : page === "quran" || page === "audio" ? (
              <>
                <PageHeading title={t(page)} subtitle={t("quranSubtitle")} />
                {VerseCard({ expanded: true })}
                <QuranAudioPlayer language={language} />
                <QuranReader language={language} />
              </>
            ) : page === "video" ? (
              <SurahVideoLibrary language={language} />
            ) : page === "tasbih" ? (
              <>
                <PageHeading title={t(page)} subtitle={t("tasbihSubtitle")} />
                {Tasbih({ expanded: true })}
              </>
            ) : page === "calendar" ? (
              <>
                <PageHeading
                  title={t(page)}
                  subtitle={now.toLocaleDateString(language, {
                    dateStyle: "full",
                  })}
                />
                {CalendarCard({ expanded: true })}
              </>
            ) : page === "reminders" ? (
              <>
                <PageHeading title={t(page)} subtitle={t("remindersNote")} />
                <section className="card reminders-card">
                  {upcoming.map((p) => (
                    <div className="reminder-row" key={p.name}>
                      <span className="reminder-icon">
                        <Icon name="prayer_times" />
                      </span>
                      <div>
                        <h3>{t(p.name)}</h3>
                        <p>
                          {formatTime(p.time)} · {prayers.timezone}
                        </p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={!!reminders[p.name]}
                        aria-label={`${t(p.name)} reminder`}
                        className={`toggle ${reminders[p.name] ? "on" : ""}`}
                        onClick={() => toggleReminder(p.name)}
                      >
                        <span />
                      </button>
                    </div>
                  ))}
                  {!prayers && (
                    <p>{prayerError || "Loading prayer schedule…"}</p>
                  )}
                  <p className="helper">
                    {prayers?.sample
                      ? "Sample schedule: notifications are paused until live prayer timings are available."
                      : "Notifications require browser permission. The app must stay open; this is not a background alarm."}
                  </p>
                  <button
                    className="button secondary"
                    onClick={() =>
                      setToast("Test reminder · Your moment of peace is here.")
                    }
                  >
                    <Bell size={16} /> {t("testReminder")}
                  </button>
                </section>
              </>
            ) : (
              <>
                <PageHeading
                  title={t(page)}
                  subtitle={
                    content?.description || "Discover more with Islamic Unity."
                  }
                />
                {["quiz", "dua"].includes(page) && <button className="button secondary" onClick={() => setReload(r => r + 1)}>{({ en: "Refresh shared data", hi: "नया डेटा लाएँ", ur: "نیا ڈیٹا لائیں", ar: "تحديث البيانات" })[language]}</button>}
                {contentError ? (
                  <ErrorBox
                    message={contentError}
                    retry={() => setReload((r) => r + 1)}
                  />
                ) : !content || content.id !== page ? (
                  <div className="loading">
                    <LoaderCircle className="spin" /> {t("loading")}
                  </div>
                ) : (
                  <FeatureContent
                    content={content}
                    page={page}
                    speak={speak}
                    t={t}
                    language={language}
                  />
                )}
              </>
            )}
          </div>
          <section className="subscribe-banner">
            <span className="subscribe-icon">
              <Heart size={23} />
            </span>
            <div>
              <h3>{t("subscribe")}</h3>
              <p>{t("subscribeText")}</p>
            </div>
            <a
              className="subscribe-button"
              href="https://www.youtube.com/results?search_query=M3H+Media+Islamic+Unity"
              target="_blank"
              rel="noreferrer"
            >
              <Play size={14} fill="currentColor" /> {t("subscribeButton")}
              <ArrowUpRight size={15} />
            </a>
          </section>
          <SiteFooter />
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {settings && (
        <div className="modal-backdrop" onClick={() => setSettings(false)}>
          <section
            className="settings-modal card"
            role="dialog"
            aria-modal="true"
            aria-label={t("settings")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-heading">
              <h2>{t("settings")}</h2>
              <button
                className="icon-button"
                aria-label="Close settings"
                onClick={() => setSettings(false)}
              >
                <X />
              </button>
            </div>
            <label>
              Language / भाषा
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {Object.entries(locales).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("voice")}
              <select
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
              >
                <option value="">{t("automaticVoice")}</option>
                {voices
                  .filter((v) => v.lang.startsWith("hi"))
                  .map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name}
                    </option>
                  ))}
              </select>
            </label>
            <p className="helper">
              Voices are provided by your browser and device. Install a Hindi
              voice in your system settings if none appears. Voice gender is not
              exposed by the browser; automatic selection prefers known female
              voices.
            </p>
            <button
              className="button secondary"
              onClick={() =>
                speak("अस्सलामु अलैकुम। इस्लामिक यूनिटी में आपका स्वागत है।")
              }
            >
              <Volume2 size={16} /> {t("previewVoice")}
            </button>
            <div className="reminder-row">
              <span>{t("nightMode")}</span>
              <button
                className={`toggle ${dark ? "on" : ""}`}
                aria-label="Night mode"
                role="switch"
                aria-checked={dark}
                onClick={() => setDark(!dark)}
              >
                <span />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
function PageHeading({ title, subtitle }) {
  return (
    <div className="page-heading">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}
function ErrorBox({ message, retry }) {
  return (
    <div className="error-box" role="alert">
      <p>{message}. Please check your connection and try again.</p>
      <button className="button secondary" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
function FeatureContent({ content, page, speak, t, language }) {
  const [amount, setAmount] = useState(""),
    [currency, setCurrency] = useState("INR"),
    [to, setTo] = useState("SAR"),
    [quiz, setQuiz] = useState(0),
    [answer, setAnswer] = useState(null);
  if (page === "zakat")
    return (
      <section className="card tool-card">
        <h2>{t("zakatEstimate")}</h2>
        <p>
          Estimate 2.5% of eligible net assets held for one lunar year. Nisab
          eligibility must be checked separately with current gold/silver values
          and a qualified scholar.
        </p>
        <label>
          {t("assets")}
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <div className="calculation-result">
          <span>{t("potentialZakat")}</span>
          <strong>
            {(Math.max(0, Number(amount) || 0) * 0.025).toLocaleString(
              undefined,
              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            )}
          </strong>
        </div>
        <p className="helper">
          This estimate uses the same currency as your input. It does not
          determine whether Zakat is due.
        </p>
      </section>
    );
  if (page === "currency")
    return (
      <section className="card tool-card">
        <span className="tiny-badge">{t("sampleRates")}</span>
        <label>
          {t("amount")}
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
          />
        </label>
        <div className="currency-selects">
          <label>
            {t("from")}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {Object.keys(content.rates).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <ArrowLeftRight size={20} />
          <label>
            {t("to")}
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {Object.keys(content.rates).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="calculation-result">
          <span>{t("conversion")}</span>
          <strong>
            {(
              (Math.max(0, Number(amount) || 0) / content.rates[currency]) *
              content.rates[to]
            ).toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
            {to}
          </strong>
        </div>
      </section>
    );
  if (page === "quiz") {
    const q = content.questions[quiz];
    return (
      <section className="card tool-card">
        <span className="tiny-badge">
          {t("question")} {quiz + 1} / {content.questions.length}
        </span>
        <h2>{localized(q.question, language)}</h2>
        <div className="quiz-options">
          {(Array.isArray(q.options) ? q.options : q.options[language] || q.options.en).map((o, i) => (
            <button
              key={o}
              disabled={answer !== null}
              onClick={() => setAnswer(i)}
              className={`quiz-option ${answer !== null && i === q.answer ? "correct" : ""} ${answer === i && i !== q.answer ? "incorrect" : ""}`}
            >
              {o}
              {answer !== null && i === q.answer && <Check size={18} />}
            </button>
          ))}
        </div>
        {answer !== null && (
          <>
            <p role="status">
              {answer === q.answer ? "Correct! " : "Keep learning. "}
              {localized(q.explanation, language)}
            </p>
            <button
              className="button"
              onClick={() => {
                setQuiz((quiz + 1) % content.questions.length);
                setAnswer(null);
              }}
            >
              {t("nextQuestion")} <ChevronRight size={16} />
            </button>
          </>
        )}
      </section>
    );
  }
  return (
    <div className="resource-grid">
      {content.items?.map((item, i) => {
        const linked = item.url && /^https:\/\//.test(item.url);
        const Card = linked ? "a" : "section";
        return <Card className="card resource-card" key={i}
          href={linked ? item.url : undefined}
          target={linked ? "_blank" : undefined}
          rel={linked ? "noopener noreferrer" : undefined}>
          <span className="resource-icon">
            <Icon name={page} size={27} />
          </span>
          <h2>{localized(item.title, language)}</h2>
          {item.arabic && <p className="arabic" lang="ar" dir="rtl">{item.arabic}</p>}
          <p>{localized(item.body, language)}</p>
          {item.speech && !linked && (
            <button
              className="button secondary"
              onClick={() => speak(item.speech)}
            >
              <Volume2 size={16} />
              {t("listen")}
            </button>
          )}
          {linked && <ExternalLink size={15} aria-hidden="true" />}
        </Card>;
      })}
      {!content.items?.length && (
        <section className="card resource-card">
          <p>This section has no resources available yet.</p>
        </section>
      )}
    </div>
  );
}
function DirectResource({ href }) {
  useEffect(() => { location.replace(href); }, [href]);
  return null;
}
function Site() {
  const [route, setRoute] = useState(location.hash.slice(1));
  useEffect(() => {
    const change = () => setRoute(location.hash.slice(1));
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  if (location.pathname.endsWith("/Books.html") && (!route || route === "books")) return <App />;
  const isHomepage = [
    "",
    "home",
    "features",
    "about",
    "download",
    "donate",
    "contact",
    "privacy",
  ].includes(route);
  const direct = resourceHref(route, import.meta.env.BASE_URL);
  return isHomepage ? <LandingPage section={route} /> : direct ? <DirectResource href={direct} /> : <App />;
}
createRoot(document.getElementById("root")).render(<Site />);
