import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Play, Search, X, ExternalLink, RotateCcw, Video, Clock3 } from "lucide-react";
import { filterSurahs, loadVideoLibrary } from "./video-data.mjs";
import { videoCopy } from "./video-copy";
import "./surah-videos.css";

function VideoPlayer({ selected, available, onSelect, onClose, copy, language }) {
  const dialog = useRef(null);
  const close = useRef(null);
  useEffect(() => {
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    const appRoot = document.getElementById("root");
    const wasInert = appRoot?.hasAttribute("inert");
    const hidden = appRoot?.getAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    close.current?.focus();
    appRoot?.setAttribute("inert", "");
    appRoot?.setAttribute("aria-hidden", "true");
    const keydown = event => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const items = [...dialog.current.querySelectorAll('button, a[href], select, iframe')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = overflow;
      if (!wasInert) appRoot?.removeAttribute("inert");
      if (hidden === null) appRoot?.removeAttribute("aria-hidden");
      else if (hidden !== undefined) appRoot?.setAttribute("aria-hidden", hidden);
      document.removeEventListener("keydown", keydown);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [onClose]);
  return createPortal(
    <div className="sv-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialog} className="sv-dialog" role="dialog" aria-modal="true" aria-labelledby="sv-player-title"
        lang={language} dir={["ar", "ur"].includes(language) ? "rtl" : "ltr"}>
        <header className="sv-player-heading">
          <div><span className="sv-eyebrow">{copy.surah} {selected.number}</span><h2 id="sv-player-title">{selected.name}</h2>
            <p lang="ar" dir="rtl">{selected.arabicName}</p></div>
          <button ref={close} className="sv-close" aria-label={copy.close} onClick={onClose}><X size={22} /></button>
        </header>
        <div className="sv-frame">
          <iframe key={selected.videoId} src={selected.embedUrl} title={`${copy.surah} ${selected.number}: ${selected.name} — ${selected.arabicName}`}
            loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin" />
        </div>
        <div className="sv-player-actions">
          <label>{copy.select}<select value={selected.number} onChange={event => onSelect(available.find(s => s.number === Number(event.target.value)))}>
            {available.map(s => <option key={s.number} value={s.number}>{s.number}. {s.name}</option>)}
          </select></label>
          <a href={selected.videoUrl} target="_blank" rel="noopener noreferrer" className="sv-button">{copy.youtube}<ExternalLink size={16} /></a>
        </div>
        <p className="sv-player-note">{copy.note}</p>
      </section>
    </div>, document.body,
  );
}

export default function SurahVideoLibrary({ language = "en" }) {
  const copy = videoCopy(language);
  const section = useRef(null);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  // Stable close callback keeps focus restoration tied to modal mount/unmount only.
  const onClose = React.useCallback(() => setSelected(null), []);
  useEffect(() => {
    section.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }, []);
  useEffect(() => {
    let active = true;
    setStatus("loading");
    loadVideoLibrary({ fresh: attempt > 0 }).then(result => {
      if (active) { setData(result); setStatus("ready"); }
    }).catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [attempt]);
  const visible = useMemo(() => filterSurahs(data?.surahs || [], search, filter), [data, search, filter]);
  const available = useMemo(() => data?.surahs.filter(s => s.hasVideo) || [], [data]);
  return <section id="video" ref={section} className="sv-library" aria-labelledby="sv-title">
    <header className="sv-hero">
      <span className="sv-eyebrow"><BookOpen size={16} /> ISLAMIC UNITY · QURAN</span>
      <h2 id="sv-title">{language === "en" && data ? data.title : copy.title}</h2>
      <p>{copy.subtitle}</p>
      <div className="sv-stats">
        {[[copy.total, data?.totalSurahs], [copy.available, data?.availableVideos], [copy.soon, data?.comingSoon]].map(([label, value]) =>
          <div key={label}><strong>{value ?? "—"}</strong><span>{label}</span></div>)}
      </div>
    </header>
    {status === "loading" ? <div className="sv-loading" role="status" aria-label={copy.loading}>
      <span className="sv-sr-only">{copy.loading}</span>
      {Array.from({ length: 6 }, (_, index) => <div className="sv-skeleton" key={index} aria-hidden="true"><i /><i /><i /></div>)}
    </div> : status === "error" ? <div className="sv-state card" role="alert"><Video size={32} /><p>{copy.error}</p>
      <button className="sv-button" onClick={() => setAttempt(n => n + 1)}><RotateCcw size={16} />{copy.retry}</button></div> : <>
      <div className="sv-toolbar">
        <button className="sv-button" onClick={() => setAttempt(n => n + 1)}>
          <RotateCcw size={16} />{({ en: "Refresh shared data", hi: "नया डेटा लाएँ", ur: "نیا ڈیٹا لائیں", ar: "تحديث البيانات" })[language] || "Refresh shared data"}
        </button>
        <label className="sv-search"><Search size={19} /><span className="sv-sr-only">{copy.search}</span>
          <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={copy.placeholder} />
        </label>
        <div className="sv-filters" role="group" aria-label={copy.title}>
          {[["all", copy.all], ["available", copy.available], ["soon", copy.soon]].map(([value, label]) =>
            <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
      </div>
      <p className="sv-results" role="status">{visible.length} / {data.totalSurahs} {copy.results}</p>
      {visible.length ? <div className="sv-grid">{visible.map(surah => <article className={`sv-card ${surah.hasVideo ? "sv-available" : "sv-soon"}`} key={surah.number} data-surah={surah.number}>
        <div className="sv-card-top"><span className="sv-number">{String(surah.number).padStart(3, "0")}</span>
          <span className="sv-status">{surah.hasVideo ? <Video size={13} /> : <Clock3 size={13} />}{surah.hasVideo ? copy.ready : copy.soon}</span></div>
        <p className="sv-arabic" lang="ar" dir="rtl">{surah.arabicName}</p><h3>{surah.name}</h3>
        {surah.hasVideo ? <button className="sv-play" onClick={() => setSelected(surah)} aria-label={`${copy.play}: ${surah.name}`}><Play size={15} fill="currentColor" />{copy.play}</button>
          : <span className="sv-coming"><Clock3 size={15} />{copy.soon}</span>}
      </article>)}</div> : <div className="sv-state card"><Search size={32} /><h3>{copy.empty}</h3><p>{copy.emptyHint}</p>
        <button className="sv-button" onClick={() => { setSearch(""); setFilter("all"); }}>{copy.reset}</button></div>}
    </>}
    {selected && <VideoPlayer selected={selected} available={available} onSelect={setSelected} onClose={onClose} copy={copy} language={language} />}
  </section>;
}
