import React, { useEffect, useState, useSyncExternalStore } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Search,
  X,
  BookOpen,
  LoaderCircle,
  RefreshCw,
  Headphones,
  ChevronDown,
  AudioLines,
  ExternalLink,
} from "lucide-react";
import { loadQuranSources } from "../config/common-urls.mjs";
import { QuranAudioController, PLAYBACK_RATES } from "./audio-controller.mjs";
import { formatAudioTime, getSurahAudioUrl } from "./audio-source.mjs";
import { playerText } from "./player-copy";
import "./quran-audio.css";

export function normalizeSurahSearch(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-'’]/g, "")
    .toLowerCase();
}
export default function QuranAudioPlayer(props) {
  const [sources, setSources] = useState(null), [error, setError] = useState(""), [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    loadQuranSources().then(data => {
      if (!active) return;
      if (props.controller) props.controller.audioUrl = number => getSurahAudioUrl(number, data.urls.audioSurahUrl);
      setSources(data);
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [retry, props.controller]);
  if (!sources) return <section className="qa-player" role="status">
    {error || playerText("loading", props.language)}
    {error && <button onClick={() => setRetry(n => n + 1)}>{playerText("retry", props.language)}</button>}
  </section>;
  return <ConfiguredPlayer {...props} sources={sources} />;
}
function ConfiguredPlayer({
  language = "en",
  controller: suppliedController,
  compact = false,
  sources,
}) {
  const { surahs, urls } = sources;
  const [controller] = useState(
    () => suppliedController || new QuranAudioController({ audioUrl: number => getSurahAudioUrl(number, urls.audioSurahUrl) }),
  );
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const [query, setQuery] = useState("");
  const t = (key) => playerText(key, language),
    current = surahs[state.number - 1];
  const search = normalizeSurahSearch(query),
    numeric = /^\d+$/.test(search);
  const matches = surahs.filter(
    (s) =>
      !search ||
      (numeric
        ? s.number === Number(search)
        : normalizeSurahSearch(s.englishName).includes(search) ||
          normalizeSurahSearch(s.arabicName).includes(search)),
  );
  useEffect(() => {
    const offline = () => controller.offline();
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("offline", offline);
      controller.dispose();
    };
  }, [controller]);
  return (
    <section
      className={`qa-player ${compact ? "qa-compact" : ""}`}
      aria-label={t("title")}
      dir={["ur", "ar"].includes(language) ? "rtl" : "ltr"}
    >
      <div className="qa-heading">
        <div className="qa-heading-icon">
          <Headphones size={22} />
        </div>
        <div>
          <h2>{t("title")}</h2>
          <p>{t("reciter")}</p>
        </div>
        <span className="qa-library-count">
          114 <BookOpen size={14} />
        </span>
      </div>
      <div className="qa-now-playing">
        <div className="qa-geometry" aria-hidden="true" />
        <div className="qa-track-number">
          <span>{t("surah")}</span>
          <strong>{String(current.number).padStart(3, "0")}</strong>
        </div>
        <div className="qa-track-info">
          <p className="qa-arabic" lang="ar" dir="rtl">
            {current.arabicName}
          </p>
          <h3>{current.englishName}</h3>
          <span>
            {current.ayahCount} {t("ayahs")} <i /> {t("reciter")}
          </span>
        </div>
        <span
          className={`qa-equalizer ${state.playing && state.status === "playing" ? "is-playing" : ""}`}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="qa-status" role="status" aria-live="polite">
        {state.status === "loading" ? (
          <LoaderCircle className="qa-spin" size={14} />
        ) : (
          <AudioLines size={14} />
        )}
        <span>{state.status === "error" ? t("network") : t(state.status)}</span>
      </div>
      <div className="qa-progress">
        <input
          type="range"
          min="0"
          max={state.duration || 1}
          step="1"
          value={Math.min(state.currentTime, state.duration || 1)}
          disabled={!state.duration || state.status === "error"}
          aria-label={t("seek")}
          aria-valuetext={`${formatAudioTime(state.currentTime)} / ${formatAudioTime(state.duration)}`}
          onChange={(e) => controller.seek(Number(e.target.value))}
        />
        <div className="qa-time" dir="ltr">
          <span>{formatAudioTime(state.currentTime)}</span>
          <span>{formatAudioTime(state.duration)}</span>
        </div>
      </div>
      <div className="qa-controls">
        <div className="qa-transport">
          <button
            type="button"
            className="qa-step"
            disabled={state.number === 1}
            aria-label={t("previous")}
            onClick={() => controller.previous()}
          >
            <SkipBack size={21} fill="currentColor" />
          </button>
          <button
            type="button"
            className="qa-play"
            aria-label={
              state.playing || state.status === "loading"
                ? t("pause")
                : t("play")
            }
            onClick={() =>
              state.playing || state.status === "loading"
                ? controller.pause()
                : controller.play()
            }
          >
            {state.playing ? (
              <Pause size={27} fill="currentColor" />
            ) : state.status === "loading" ? (
              <LoaderCircle className="qa-spin" size={27} />
            ) : (
              <Play size={27} fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            className="qa-step"
            disabled={state.number === 114}
            aria-label={t("next")}
            onClick={() => controller.next()}
          >
            <SkipForward size={21} fill="currentColor" />
          </button>
        </div>
        <div className="qa-options">
          <label className="qa-speed">
            <span>{t("speed")}</span>
            <select
              aria-label={t("speed")}
              value={state.rate}
              onChange={(e) => controller.setRate(Number(e.target.value))}
            >
              {PLAYBACK_RATES.map((rate) => (
                <option value={rate} key={rate}>
                  {rate}×
                </option>
              ))}
            </select>
          </label>
          <div className="qa-volume">
            <button
              type="button"
              aria-label={state.muted ? t("unmute") : t("mute")}
              aria-pressed={state.muted}
              onClick={() => controller.toggleMute()}
            >
              {state.muted || state.volume === 0 ? (
                <VolumeX size={19} />
              ) : (
                <Volume2 size={19} />
              )}
            </button>
            <input
              aria-label={t("volume")}
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.muted ? 0 : state.volume}
              onChange={(e) => controller.setVolume(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      {state.error && (
        <div className="qa-error" role="alert">
          <p>{t(state.error)}</p>
          <button type="button" onClick={() => controller.retry()}>
            <RefreshCw size={15} />
            {t("retry")}
          </button>
        </div>
      )}
      <label className="qa-continuous">
        <input
          type="checkbox"
          checked={state.autoNext}
          onChange={(e) => controller.setAutoNext(e.target.checked)}
        />
        <span className="qa-switch" aria-hidden="true" />
        <span>{t("auto")}</span>
      </label>
      <details className="qa-library" open={compact ? undefined : true}>
        <summary>
          {t("browse")}
          <ChevronDown size={17} />
        </summary>
        <div className="qa-search">
          <Search size={18} />
          <input
            type="search"
            aria-label={t("search")}
            placeholder={t("search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label={t("clear")}
              onClick={() => setQuery("")}
            >
              <X size={17} />
            </button>
          )}
        </div>
        <ul className="qa-surahs" aria-label={t("browse")}>
          {matches.map((s) => (
            <li
              key={s.number}
              className={state.number === s.number ? "qa-selected" : ""}
            >
              <button
                type="button"
                className="qa-select-surah"
                aria-pressed={state.number === s.number}
                onClick={() => controller.select(s.number)}
              >
                <span className="qa-list-number">
                  {String(s.number).padStart(2, "0")}
                </span>
                <span className="qa-list-title">
                  <strong>{s.englishName}</strong>
                  <small>
                    {s.ayahCount} {t("ayahs")}
                  </small>
                </span>
                <span className="qa-list-arabic" lang="ar" dir="rtl">
                  {s.arabicName}
                </span>
              </button>
              <button
                type="button"
                className="qa-list-play"
                aria-label={`${t("play")} ${s.englishName}`}
                onClick={() => {
                  controller.select(s.number);
                  void controller.play();
                }}
              >
                {state.number === s.number && state.playing ? (
                  <AudioLines size={17} />
                ) : (
                  <Play size={15} />
                )}
              </button>
            </li>
          ))}
        </ul>
        {!matches.length && <p className="qa-empty">{t("noResults")}</p>}
      </details>
      <p className="qa-hint">{t("hint")}</p>
      <a
        className="qa-attribution"
        href={getSurahAudioUrl(state.number, urls.audioSurahUrl)}
        target="_blank"
        rel="noreferrer"
      >
        {new URL(urls.audioSurahUrl).hostname}
        <ExternalLink size={11} />
      </a>
    </section>
  );
}
