import React, { useEffect, useRef } from "react";
import { Bookmark, Copy, Share2, ArrowUpRight } from "lucide-react";

// One verse renderer for the existing Quran reader and the enhanced Books reader.
export default function VerseList({
  verses,
  sajdas = new Set(),
  sajdaLabel = "Sajda",
  reading,
}) {
  const root = useRef(null);
  useEffect(() => {
    if (!reading?.onPosition || !globalThis.IntersectionObserver) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          )[0];
        if (first) reading.onPosition(Number(first.target.dataset.verse));
      },
      { rootMargin: "-100px 0px -45% 0px", threshold: 0.1 },
    );
    root.current
      ?.querySelectorAll("[data-verse]")
      .forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [verses, reading?.onPosition]);
  return (
    <div
      ref={root}
      className={reading ? "books-verses" : "quran-ayahs"}
      style={
        reading ? { "--reading-size": `${reading.fontSize}px` } : undefined
      }
    >
      {verses.map((a) =>
        reading ? (
          <article
            key={a.number}
            id={`verse-${a.number}`}
            data-verse={a.number}
            className="books-verse"
            tabIndex={-1}
          >
            <header>
              <span>
                {a.surah?.englishName} · {a.surah?.number}:{a.numberInSurah}
              </span>
              <span lang="ar" dir="rtl">
                {a.surah?.name}
              </span>
            </header>
            <p className="books-arabic" lang="ar" dir="rtl">
              {a.text} <small>﴿{a.numberInSurah}﴾</small>{" "}
              {(a.sajda || sajdas.has(a.number)) && (
                <span aria-label={sajdaLabel}>۩</span>
              )}
            </p>
            {a.translation && (
              <p
                className="books-translation"
                dir="auto"
                lang={reading.translationLanguage}
              >
                {a.translation}
              </p>
            )}
            <div className="books-verse-actions">
              <button
                onClick={() => reading.copy(a)}
                aria-label={`${reading.t("copy")} ${a.surah?.number}:${a.numberInSurah}`}
              >
                <Copy size={15} />
                <span>{reading.t("copy")}</span>
              </button>
              <button
                aria-pressed={!!reading.bookmarks[a.number]}
                onClick={() => reading.bookmark(a)}
                aria-label={`${reading.t("bookmark")} ${a.surah?.number}:${a.numberInSurah}`}
              >
                <Bookmark
                  size={15}
                  fill={reading.bookmarks[a.number] ? "currentColor" : "none"}
                />
                <span>{reading.t("bookmark")}</span>
              </button>
              <button
                onClick={() => reading.share(a)}
                aria-label={`${reading.t("share")} ${a.surah?.number}:${a.numberInSurah}`}
              >
                <Share2 size={15} />
                <span>{reading.t("share")}</span>
              </button>
              {reading.open && (
                <button onClick={() => reading.open(a)}>
                  <ArrowUpRight size={15} />
                  {reading.t("openVerse")}
                </button>
              )}
            </div>
          </article>
        ) : (
          <p key={a.number} dir="rtl" lang="ar">
            {a.text} <small>﴿{a.numberInSurah}﴾</small>{" "}
            {sajdas.has(a.number) && <span aria-label={sajdaLabel}>۩</span>}
          </p>
        ),
      )}
    </div>
  );
}
