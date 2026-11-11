import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Globe2,
  Layers,
  LibraryBig,
  LoaderCircle,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useStored } from "../hooks/useStored";
import VerseList from "../quran/VerseList";
import { normalizeSurahSearch } from "../quran/search.mjs";
import { localized } from "../config/common-urls.mjs";
import {
  ARABIC,
  divisions,
  loadBooksLibrary,
  loadCompleteSurah,
  loadEditions,
  loadMetadata,
  loadPassage,
  safeResourceUrl,
  searchVerses,
} from "./books-data.mjs";
import { booksText } from "./books-copy";
import "./books.css";

const sections = [
  "home",
  "quran",
  "surah",
  "pdf",
  "sajda",
  "hadith",
  "search",
  "other",
  "edition",
  "meta",
  "bookmarks",
  ...Object.keys(divisions),
];
function readRoute() {
  const p = new URLSearchParams(location.search),
    mode = p.get("section") || "home";
  const number = Number(p.get("number") || 0),
    verse = Number(p.get("verse") || 0);
  const maximum =
    divisions[mode] || (["quran", "surah"].includes(mode) ? 114 : 0);
  const validNumber =
    Number.isInteger(number) && number >= 1 && number <= maximum
      ? number
      : mode in divisions
        ? 1
        : 0;
  return {
    mode: sections.includes(mode) ? mode : "home",
    number: validNumber,
    verse: Number.isInteger(verse) && verse > 0 && verse <= 6236 ? verse : 0,
    query: (p.get("query") || "").slice(0, 128),
    page: Math.max(0, Number(p.get("results")) || 0),
  };
}
function readingHref(ayah) {
  const url = new URL(`${import.meta.env.BASE_URL}Books.html`, location.origin);
  url.search = new URLSearchParams({
    section: "surah",
    number: String(ayah.surah.number),
    verse: String(ayah.number),
  });
  return url.href;
}
function PdfPreview({ resource, t, close }) {
  const dialog = useRef(null),
    [status, setStatus] = useState("loading");
  const url = safeResourceUrl(resource.url);
  useEffect(() => {
    const trigger = document.activeElement;
    dialog.current.showModal();
    // Native PDF embeds do not require fetch CORS. The verified publisher does
    // not enable CORS, so downloads stay on its own permitted download page.
    setStatus(url && /\.pdf(?:[?#]|$)/i.test(url) ? "ready" : "error");
    return () => {
      trigger?.isConnected && trigger.focus();
    };
  }, [url]);
  return (
    <dialog
      className="books-pdf-dialog"
      ref={dialog}
      aria-labelledby="books-pdf-title"
      onCancel={close}
    >
      <header>
        <h2 id="books-pdf-title">{resource.label}</h2>
        <button className="icon-button" onClick={close} aria-label={t("close")}>
          <X />
        </button>
      </header>
      <p>{resource.credit}</p>
      <div className="books-link-actions">
        <a
          className="button secondary"
          href={safeResourceUrl(resource.sourceUrl) || url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("publisher")} <ArrowUpRight size={15} />
        </a>
        {url && (
          <a
            className="button secondary"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("view")} <ArrowUpRight size={15} />
          </a>
        )}
        {resource.allowDownload === true &&
          safeResourceUrl(resource.sourceUrl) && (
            <a
              className="button"
              href={safeResourceUrl(resource.sourceUrl)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={15} />
              {t("download")}
            </a>
          )}
      </div>
      {status === "loading" ? (
        <p role="status">{t("loading")}</p>
      ) : status === "error" ? (
        <p role="alert">{t("previewError")}</p>
      ) : (
        <>
          <p>{t("previewHelp")}</p>
          <iframe
            src={url}
            title={resource.label}
            onError={() => setStatus("error")}
          />
        </>
      )}
    </dialog>
  );
}
export default function BooksPage({ language = "en" }) {
  const t = useCallback((key) => booksText(key, language), [language]);
  const [view, setView] = useState(readRoute),
    [library, setLibrary] = useState(null),
    [libraryError, setLibraryError] = useState(false);
  const [revision, setRevision] = useState(0),
    [result, setResult] = useState(null),
    [error, setError] = useState(false);
  const [editions, setEditions] = useState([]),
    [editionError, setEditionError] = useState(false),
    [editionRetry, setEditionRetry] = useState(0);
  const [edition, setEdition] = useStored("iu-books-edition", ARABIC),
    [fontSize, setFontSize] = useStored("iu-reading-font-size", 28);
  const [resume, setResume] = useStored("iu-books-position", null),
    [savedBookmarks, setBookmarks] = useStored("iu-books-bookmarks", {});
  const bookmarks =
    savedBookmarks &&
    typeof savedBookmarks === "object" &&
    !Array.isArray(savedBookmarks)
      ? savedBookmarks
      : {};
  const [query, setQuery] = useState(view.query),
    [filter, setFilter] = useState(""),
    [limit, setLimit] = useState(40),
    [notice, setNotice] = useState("");
  const [pdf, setPdf] = useState(null),
    [hadithQuery, setHadithQuery] = useState("");
  const refreshReading = useRef(false),
    lastEditionRetry = useRef(0);
  function refresh() {
    refreshReading.current = true;
    setRevision((n) => n + 1);
  }
  const list = ["quran", "surah"].includes(view.mode) && view.number === 0;
  const reading =
    (["quran", "surah"].includes(view.mode) && view.number > 0) ||
    view.mode in divisions ||
    view.mode === "sajda" ||
    view.mode === "search";
  const translation = /^[a-z][a-z0-9.-]{1,63}$/.test(edition)
    ? edition
    : ARABIC;
  const currentSurah = library?.data.surahs.find(
    (s) => s.number === view.number,
  );
  const translationLanguage = editions.find(
    (e) => e.identifier === translation,
  )?.language;
  const open = useCallback((mode, number = 0, verse = 0, extra = {}) => {
    const next = { mode, number, verse, query: "", page: 0, ...extra };
    const url = new URL(location.href);
    url.search = new URLSearchParams({
      section: mode,
      ...(number ? { number } : {}),
      ...(verse ? { verse } : {}),
      ...(next.query ? { query: next.query } : {}),
      ...(next.page ? { results: next.page } : {}),
    });
    history.pushState(null, "", url);
    setResult(null);
    setView(next);
    setLimit(40);
    setFilter("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  useEffect(() => {
    const pop = () => {
      setView(readRoute());
      setLimit(40);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    let active = true;
    setLibraryError(false);
    loadBooksLibrary({ fresh: revision > 0 })
      .then((data) => {
        if (active) setLibrary(data);
      })
      .catch(() => {
        if (active) setLibraryError(true);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  useEffect(() => {
    if (!library || (!reading && view.mode !== "edition")) return;
    let active = true;
    setEditionError(false);
    const fresh = editionRetry > lastEditionRetry.current;
    lastEditionRetry.current = editionRetry;
    loadEditions(library.data.urls, { fresh })
      .then((response) => {
        if (active) setEditions(response.data);
      })
      .catch(() => {
        if (active) setEditionError(true);
      });
    return () => {
      active = false;
    };
  }, [library, reading, view.mode, editionRetry]);
  useEffect(() => {
    if (!library || (!reading && view.mode !== "meta")) {
      setResult(null);
      return;
    }
    let active = true;
    setResult(null);
    setError(false);
    const urls = library.data.urls,
      options = { fresh: refreshReading.current };
    refreshReading.current = false;
    (async () => {
      if (view.mode === "meta") return loadMetadata(urls, options);
      if (view.mode === "search") {
        const term = queryForSearch(view.query);
        if (!term) return { data: [], total: 0 };
        const chapterMatches = library.data.surahs.filter((s) =>
          /^\d+$/.test(term)
            ? s.number === Number(term)
            : [s.englishName, s.arabicName].some((name) =>
                normalizeSurahSearch(name).includes(normalizeSurahSearch(term)),
              ),
        );
        if (chapterMatches.length)
          return { data: [], chapters: chapterMatches };
        if (/^(?:\d{1,3}:\d{1,3}|#\d{1,4})$/.test(term)) {
          if (term.includes(":")) {
            const [chapter, ayah] = term.split(":").map(Number);
            if (
              ayah >
              (library.data.surahs.find((s) => s.number === chapter)
                ?.ayahCount || 0)
            )
              throw new Error("Invalid Ayah reference");
          }
          const reference = term.replace(/^#/, "");
          const arabic = await loadPassage(
            urls,
            "ayah",
            reference,
            ARABIC,
            options,
          );
          if (translation === ARABIC) return arabic;
          const tr = await loadPassage(
            urls,
            "ayah",
            reference,
            translation,
            options,
          );
          return {
            ...arabic,
            data: arabic.data.map((a) => ({
              ...a,
              translation: tr.data.find((b) => b.number === a.number)?.text,
            })),
          };
        }
        // Keyword search uses an API edition, never a locally invented verse index.
        const searchEdition = /[\u0600-\u06ff]/.test(term)
          ? ARABIC
          : translation !== ARABIC && translationLanguage !== "ar"
            ? translation
            : editions.find(
                (e) => e.type === "translation" && e.language === "en",
              )?.identifier;
        if (!searchEdition) {
          if (!editionError) return null; // Wait for available text editions.
          throw new Error("Editions unavailable");
        }
        return {
          ...(await searchVerses(
            urls,
            term,
            searchEdition,
            view.page,
            options,
          )),
          translationLanguage: editions.find(
            (e) => e.identifier === searchEdition,
          )?.language,
        };
      }
      const group = view.mode === "quran" ? "surah" : view.mode;
      const primary =
        view.mode === "quran"
          ? loadCompleteSurah(urls, view.number, options)
          : loadPassage(urls, group, view.number, ARABIC, options);
      const translated =
        translation === ARABIC
          ? Promise.resolve(null)
          : loadPassage(urls, group, view.number, translation, options);
      const [arabic, tr] = await Promise.all([primary, translated]);
      return {
        ...arabic,
        offline: arabic.offline || tr?.offline,
        data: arabic.data.map((a) => ({
          ...a,
          translation: tr?.data.find((b) => b.number === a.number)?.text,
        })),
      };
    })()
      .then((data) => {
        if (active && data) setResult(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [
    library,
    reading,
    view.mode,
    view.number,
    view.query,
    view.page,
    translation,
    revision,
    view.mode === "search" ? editions : null,
    view.mode === "search" ? editionError : false,
  ]);
  useEffect(() => {
    if (!view.verse || !Array.isArray(result?.data)) return;
    const index = result.data.findIndex((a) => a.number === view.verse);
    if (index < 0) return;
    if (index >= limit) {
      setLimit(Math.ceil((index + 1) / 40) * 40);
      return;
    }
    const frame = requestAnimationFrame(() => {
      const node = document.getElementById(`verse-${view.verse}`);
      node?.scrollIntoView({ block: "center", behavior: "auto" });
      node?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [result, view.verse, limit]);
  const position = useCallback(
    (number) => {
      const ayah = result?.data?.find?.((a) => a.number === number);
      if (!ayah) return;
      setResume((previous) =>
        previous?.verse === ayah.number && previous?.mode === view.mode
          ? previous
          : {
              mode: view.mode === "search" ? "surah" : view.mode,
              number: view.mode === "search" ? ayah.surah.number : view.number,
              verse: ayah.number,
              label: `${ayah.surah.englishName} · ${ayah.surah.number}:${ayah.numberInSurah}`,
            },
      );
    },
    [result, view.mode, view.number, setResume],
  );
  const openedReading = useRef("");
  useEffect(() => {
    if (!Array.isArray(result?.data) || !result.data.length) return;
    const key = `${view.mode}:${view.number}:${view.query}:${view.verse}`;
    if (openedReading.current === key) return;
    openedReading.current = key;
    position(
      (result.data.find((a) => a.number === view.verse) || result.data[0])
        .number,
    );
  }, [result, position, view.mode, view.number, view.query, view.verse]);
  const rows = useMemo(
    () => (Array.isArray(result?.data) ? result.data.slice(0, limit) : []),
    [result, limit],
  );
  const filteredSurahs =
    library?.data.surahs.filter(
      (s) =>
        !filter ||
        String(s.number) === normalizeSurahSearch(filter).replace(/^0+/, "") ||
        [s.englishName, s.arabicName].some((name) =>
          normalizeSurahSearch(name).includes(normalizeSurahSearch(filter)),
        ),
    ) || [];
  async function copy(ayah, includeLink = false) {
    try {
      await navigator.clipboard.writeText(
        `${ayah.text}\n${ayah.translation || ""}\n${ayah.surah.englishName} ${ayah.surah.number}:${ayah.numberInSurah}${includeLink ? "\n" + readingHref(ayah) : ""}`,
      );
      setNotice(t("copied"));
    } catch {
      setNotice(t("actionError"));
    }
  }
  async function share(ayah) {
    if (!navigator.share) return copy(ayah, true);
    try {
      await navigator.share({
        title: `${ayah.surah.englishName} ${ayah.surah.number}:${ayah.numberInSurah}`,
        text: ayah.text,
        url: readingHref(ayah),
      });
    } catch (e) {
      if (e.name !== "AbortError") setNotice(t("actionError"));
    }
  }
  function bookmark(ayah) {
    setBookmarks((previous) => {
      const next = { ...(previous || {}) };
      if (next[ayah.number]) delete next[ayah.number];
      else next[ayah.number] = ayah;
      return next;
    });
  }
  function openVerse(ayah) {
    open("surah", ayah.surah.number, ayah.number);
  }
  function card(mode, Icon, description = `${mode}Desc`) {
    return (
      <button
        key={mode}
        className={`card books-resource books-resource-${mode}`}
        onClick={() => open(mode, mode in divisions ? 1 : 0)}
      >
        <span className="books-card-icon">
          <Icon size={24} />
        </span>
        <ArrowUpRight className="books-card-arrow" size={18} />
        <h3>{t(mode)}</h3>
        {t(description) !== description && <p>{t(description)}</p>}
      </button>
    );
  }
  function chapters(surahs) {
    return (
      <div className="books-surahs">
        {surahs.map((s) => (
          <button
            className="books-surah"
            key={s.number}
            onClick={() =>
              open(view.mode === "quran" ? "quran" : "surah", s.number)
            }
          >
            <span className="books-number">{s.number}</span>
            <span>
              <strong>{s.englishName}</strong>
              <small>
                {s.ayahCount} {t("ayahs")} ·{" "}
                {t(s.revelationType === "Medinan" ? "medinan" : "meccan")}
              </small>
            </span>
            <span className="books-surah-arabic" lang="ar" dir="rtl">
              {s.arabicName}
            </span>
          </button>
        ))}
      </div>
    );
  }
  function resources(kind) {
    const resources =
      library?.data.resources[
        kind === "pdf"
          ? "pdfResources"
          : kind === "hadith"
            ? "hadithResources"
            : "otherResources"
      ] || [];
    return (
      <div className="books-resources">
        {resources.map((resource) => {
          const url = safeResourceUrl(resource.url),
            label = localized(resource.title, language);
          return (
            <article className="card" key={resource.id}>
              <FileText className="books-gold" size={25} />
              <h3>{label}</h3>
              <p>{resource.credit}</p>
              {url ? (
                <div className="books-link-actions">
                  {kind === "pdf" ? (
                    <button
                      className="button"
                      onClick={() => setPdf({ ...resource, label })}
                    >
                      {t("view")} <BookOpen size={16} />
                    </button>
                  ) : (
                    <a
                      className="button"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("view")} <ArrowUpRight size={16} />
                    </a>
                  )}
                  {safeResourceUrl(resource.sourceUrl) && (
                    <a
                      className="button secondary"
                      href={safeResourceUrl(resource.sourceUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("publisher")}
                    </a>
                  )}
                </div>
              ) : (
                <p>{t("previewError")}</p>
              )}
            </article>
          );
        })}
        {!resources.length && <p>{t("empty")}</p>}
      </div>
    );
  }
  if (!library)
    return (
      <section className="books-page">
        <h1>{t("title")}</h1>
        <p role={libraryError ? "alert" : "status"}>
          {t(libraryError ? "error" : "loading")}
        </p>
        {libraryError && (
          <button className="button" onClick={refresh}>
            {t("retry")}
          </button>
        )}
      </section>
    );
  return (
    <section
      className="books-page"
      aria-labelledby="books-title"
      dir={["ar", "ur"].includes(language) ? "rtl" : "ltr"}
    >
      <div className="books-page-heading">
        <div>
          <h1 id="books-title">{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>
        <span className="books-heading-icon">
          <LibraryBig size={27} />
        </span>
      </div>
      <nav className="books-breadcrumb" aria-label={t("title")}>
        <button onClick={() => open("home")}>
          <ArrowLeft size={15} />
          {t("home")}
        </button>
        {view.mode !== "home" && (
          <>
            <span>/</span>
            <span aria-current="page">{t(view.mode)}</span>
          </>
        )}
      </nav>
      {(library.offline || result?.offline) && (
        <p className="books-cache" role="status">
          {t("cached")}
        </p>
      )}
      {view.mode === "home" ? (
        <>
          <section className="books-hero">
            <div>
              <span className="books-kicker">
                <Sparkles size={14} />
                {t("home")}
              </span>
              <h2>{t("begin")}</h2>
              <p>{t("quranDesc")}</p>
              <div className="books-stats">
                <span>
                  <strong>{library.data.surahs.length}</strong> {t("surah")}
                </span>
                <span>
                  <strong>30</strong> {t("juz")}
                </span>
              </div>
            </div>
            <div className="books-art" aria-hidden="true">
              <BookOpen size={100} strokeWidth={0.7} />
              <span>✧</span>
            </div>
          </section>
          <div className="books-saved-row">
            <button
              className="card books-continue"
              onClick={() =>
                open(
                  resume?.mode && sections.includes(resume.mode)
                    ? resume.mode
                    : "surah",
                  Number(resume?.number) || 1,
                  Number(resume?.verse) || 0,
                )
              }
            >
              <span className="books-card-icon">
                <Bookmark />
              </span>
              <span>
                <strong>{t("continue")}</strong>
                <small>{resume?.label || t("begin")}</small>
              </span>
              <ArrowUpRight size={20} />
            </button>
            <button
              className="card books-bookmarks-link"
              onClick={() => open("bookmarks")}
            >
              <Bookmark size={22} />
              {t("bookmarks")} <span>{Object.keys(bookmarks).length}</span>
            </button>
          </div>
          <h2 className="books-section-title">{t("explore")}</h2>
          <div className="books-grid">
            {card("quran", BookOpen)}
            {card("pdf", FileText)}
            {card("surah", LibraryBig)}
            {card("juz", Layers)}
            {card("sajda", Sparkles)}
            {card("hadith", BookOpen)}
            {card("search", Search)}
            {card("other", Globe2, "subtitle")}
          </div>
          <h2 className="books-section-title">{t("browseMore")}</h2>
          <div className="books-small-grid">
            {["page", "ruku", "manzil", "hizbQuarter", "edition", "meta"].map(
              (mode) => card(mode, Layers, ""),
            )}
          </div>
        </>
      ) : (
        <>
          <div className="books-section-heading">
            <h2>
              {currentSurah && !list
                ? `${currentSurah.englishName} · ${currentSurah.number}`
                : t(view.mode)}
            </h2>
            <button className="button secondary" onClick={refresh}>
              {t("refresh")}
            </button>
          </div>
          {list && (
            <>
              <label className="books-search">
                <Search size={20} />
                <input
                  type="search"
                  aria-label={t("filter")}
                  placeholder={t("filter")}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </label>
              {chapters(filteredSurahs)}
              {!filteredSurahs.length && (
                <p className="books-state">{t("empty")}</p>
              )}
            </>
          )}
          {(reading || view.mode === "edition") && (
            <div className="books-controls">
              <label>
                {t("translation")}
                <select
                  aria-label={t("translation")}
                  value={translation}
                  onChange={(e) => setEdition(e.target.value)}
                >
                  <option value={ARABIC}>{t("arabicOnly")}</option>
                  {editions
                    .filter((e) => e.identifier !== ARABIC)
                    .map((e) => (
                      <option key={e.identifier} value={e.identifier}>
                        {e.language} · {e.englishName}
                      </option>
                    ))}
                </select>
              </label>
              {reading && (
                <label>
                  {t("font")}
                  <input
                    type="range"
                    min="20"
                    max="44"
                    value={Math.max(20, Math.min(44, Number(fontSize) || 28))}
                    aria-label={t("font")}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                </label>
              )}
              {editionError && (
                <button
                  className="button secondary"
                  onClick={() => setEditionRetry((n) => n + 1)}
                >
                  {t("editionRetry")}
                </button>
              )}
            </div>
          )}
          {view.mode === "edition" && !editions.length && !editionError && (
            <p role="status">{t("loading")}</p>
          )}
          {view.mode === "edition" && (
            <div className="books-editions">
              {editions.map((e) => (
                <button
                  className="card"
                  key={e.identifier}
                  onClick={() => {
                    setEdition(e.identifier);
                    open("surah", 1);
                  }}
                >
                  <strong>{e.englishName}</strong>
                  <span lang={e.language} dir="auto">
                    {e.name}
                  </span>
                  <small>
                    {e.identifier} · {e.language}
                  </small>
                </button>
              ))}
            </div>
          )}
          {view.mode in divisions && (
            <form
              className="books-division"
              onSubmit={(e) => {
                e.preventDefault();
                const number = Number(
                  new FormData(e.currentTarget).get("division"),
                );
                if (
                  Number.isInteger(number) &&
                  number >= 1 &&
                  number <= divisions[view.mode]
                )
                  open(view.mode, number);
              }}
            >
              <button
                type="button"
                className="button secondary"
                disabled={view.number <= 1}
                onClick={() => open(view.mode, view.number - 1)}
              >
                <ChevronLeft size={16} />
                {t("previous")}
              </button>
              <label>
                {t(view.mode)}
                <input
                  key={`${view.mode}-${view.number}`}
                  name="division"
                  aria-label={t(view.mode)}
                  type="number"
                  min="1"
                  max={divisions[view.mode]}
                  defaultValue={view.number}
                  required
                />
              </label>
              <span>/ {divisions[view.mode]}</span>
              <button className="button">{t("go")}</button>
              <button
                type="button"
                className="button secondary"
                disabled={view.number >= divisions[view.mode]}
                onClick={() => open(view.mode, view.number + 1)}
              >
                {t("next")}
                <ChevronRight size={16} />
              </button>
            </form>
          )}
          {view.mode === "search" && (
            <form
              className="books-query-form"
              onSubmit={(e) => {
                e.preventDefault();
                open("search", 0, 0, { query });
              }}
            >
              <label className="books-search">
                <Search size={20} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  maxLength="128"
                  placeholder={t("searchHint")}
                  aria-label={t("search")}
                  required
                />
              </label>
              <button className="button">{t("search")}</button>
            </form>
          )}
          {(reading || view.mode === "meta") &&
            (error ? (
              <div className="card books-state" role="alert">
                <p>{t("error")}</p>
                <button className="button" onClick={refresh}>
                  {t("retry")}
                </button>
              </div>
            ) : !result ? (
              <div className="books-state" role="status">
                <LoaderCircle className="spin" />
                {t("loading")}
              </div>
            ) : (
              <>
                {view.mode === "meta" ? (
                  <div className="books-meta">
                    {Object.entries({
                      surah: result.data.surahs?.count,
                      ayahs: result.data.ayahs?.count,
                      juz: result.data.juzs?.count,
                      page: result.data.pages?.count,
                      ruku: result.data.rukus?.count,
                      manzil: result.data.manzils?.count,
                      hizbQuarter: result.data.hizbQuarters?.count,
                      sajda: result.data.sajdas?.count,
                    }).map(([key, count]) => (
                      <article className="card" key={key}>
                        <strong>{count}</strong>
                        <span>{t(key)}</span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <>
                    {result.chapters && chapters(result.chapters)}
                    <VerseList
                      verses={rows}
                      sajdaLabel={t("sajda")}
                      reading={{
                        t,
                        fontSize: Math.max(
                          20,
                          Math.min(44, Number(fontSize) || 28),
                        ),
                        bookmarks,
                        bookmark,
                        copy,
                        share,
                        onPosition: position,
                        translationLanguage:
                          result?.translationLanguage || translationLanguage,
                        open: ["surah", "quran"].includes(view.mode)
                          ? null
                          : openVerse,
                      }}
                    />
                    {!rows.length && !result.chapters?.length && (
                      <p className="books-state">{t("empty")}</p>
                    )}
                    {Array.isArray(result.data) &&
                      result.data.length > limit && (
                        <button
                          className="button books-load-more"
                          onClick={() => setLimit((n) => n + 40)}
                        >
                          {t("more")}
                        </button>
                      )}
                    {view.mode === "search" && result.total > 20 && (
                      <div className="books-pagination">
                        <button
                          className="button secondary"
                          disabled={view.page === 0}
                          onClick={() =>
                            open("search", 0, 0, {
                              query: view.query,
                              page: view.page - 1,
                            })
                          }
                        >
                          {t("previous")}
                        </button>
                        <span>
                          {view.page * 20 + 1}–
                          {Math.min((view.page + 1) * 20, result.total)} /{" "}
                          {result.total}
                        </span>
                        <button
                          className="button secondary"
                          disabled={(view.page + 1) * 20 >= result.total}
                          onClick={() =>
                            open("search", 0, 0, {
                              query: view.query,
                              page: view.page + 1,
                            })
                          }
                        >
                          {t("next")}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            ))}
          {view.mode === "pdf" && resources("pdf")}
          {view.mode === "hadith" && (
            <>
              <p className="books-source-note">{t("hadithNote")}</p>
              {safeResourceUrl(
                library.data.resources.hadithSearchUrl?.replace(
                  "{query}",
                  "test",
                ),
              ) && (
                <form
                  className="books-query-form"
                  action={library.data.resources.hadithSearchUrl.split("?")[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <label className="books-search">
                    <Search size={20} />
                    <input
                      name="q"
                      required
                      value={hadithQuery}
                      onChange={(e) => setHadithQuery(e.target.value)}
                      aria-label={t("hadith")}
                    />
                  </label>
                  <button className="button">{t("search")}</button>
                </form>
              )}
              {resources("hadith")}
            </>
          )}
          {view.mode === "other" && resources("other")}
          {view.mode === "bookmarks" && (
            <div className="books-bookmarks">
              {Object.values(bookmarks)
                .filter((a) => a?.surah?.number && a?.text)
                .map((a) => (
                  <button
                    className="card"
                    key={a.number}
                    onClick={() => openVerse(a)}
                  >
                    <strong>
                      {a.surah.englishName} · {a.surah.number}:{a.numberInSurah}
                    </strong>
                    <p lang="ar" dir="rtl">
                      {a.text}
                    </p>
                  </button>
                ))}
              {!Object.keys(bookmarks).length && <p>{t("empty")}</p>}
            </div>
          )}
        </>
      )}
      <p className="books-action-notice" role="status" aria-live="polite">
        {notice}
      </p>
      {pdf && <PdfPreview resource={pdf} t={t} close={() => setPdf(null)} />}
    </section>
  );
}
function queryForSearch(value) {
  return String(value)
    .trim()
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x6f0));
}
