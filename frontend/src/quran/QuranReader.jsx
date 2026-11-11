import React, { useEffect, useState } from "react";
import { loadQuranSources, loadQuranText } from "../config/common-urls.mjs";
import VerseList from "./VerseList";

const copy = {
  en: ["Read Quran", "Surah", "Refresh shared data", "Loading Quran…", "Try again", "Sajda", "Ayahs"],
  hi: ["क़ुरआन पढ़ें", "सूरह", "नया डेटा लाएँ", "क़ुरआन लोड हो रहा है…", "फिर प्रयास करें", "सजदा", "आयतें"],
  ur: ["قرآن پڑھیں", "سورۃ", "نیا ڈیٹا لائیں", "قرآن لوڈ ہو رہا ہے…", "دوبارہ کوشش کریں", "سجدہ", "آیات"],
  ar: ["اقرأ القرآن", "سورة", "تحديث البيانات", "جار تحميل القرآن…", "حاول مجددًا", "سجدة", "آيات"],
};
export default function QuranReader({ language = "en" }) {
  const [data, setData] = useState(null), [number, setNumber] = useState(1), [error, setError] = useState(""), [reload, setReload] = useState(0);
  const t = copy[language] || copy.en;
  useEffect(() => {
    let active = true;
    setData(null); setError("");
    loadQuranSources().then(async sources => ({ ...await loadQuranText(sources.urls), names: sources.surahs }))
      .then(result => { if (active) setData(result); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [reload]);
  return <section className="card tool-card quran-reader" aria-label={t[0]}>
    <div className="section-heading"><h2>{t[0]}</h2><button className="button secondary" onClick={() => setReload(n => n + 1)}>{t[2]}</button></div>
    {error ? <div role="alert">{error} <button onClick={() => setReload(n => n + 1)}>{t[4]}</button></div> : !data ? <p role="status">{t[3]}</p> : <>
      <p>{data.meta.surahs.count} {t[1]} · {data.meta.ayahs.count} {t[6]} · {data.sajdas.size} {t[5]}</p>
      <label>{t[1]} <select aria-label={t[1]} value={number} onChange={e => setNumber(Number(e.target.value))}>
        {data.names.map(s => <option key={s.number} value={s.number}>{s.number}. {s.englishName} — {s.arabicName}</option>)}
      </select></label>
      <VerseList verses={data.surahs.find(s => s.number === number)?.ayahs || []} sajdas={data.sajdas} sajdaLabel={t[5]} />
    </>}
  </section>;
}
