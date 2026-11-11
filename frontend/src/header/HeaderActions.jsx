import React from "react";
import { Bell, MapPin, LoaderCircle } from "lucide-react";
import { useAccurateLocation } from "../qibla/useAccurateLocation";
import { locationErrors } from "../qibla/qibla-copy";
import { sitePageHref } from "../../../shared/site-navigation.mjs";
import "./header-actions.css";
const labels = {
  en: ["Current location", "Use my location", "Update location", "Finding location…", "Retry location", "Open reminders"],
  hi: ["वर्तमान स्थान", "मेरा स्थान उपयोग करें", "स्थान अपडेट करें", "स्थान खोज रहे हैं…", "स्थान फिर खोजें", "रिमाइंडर खोलें"],
  ur: ["موجودہ مقام", "میرا مقام استعمال کریں", "مقام تازہ کریں", "مقام تلاش ہو رہا ہے…", "مقام دوبارہ تلاش کریں", "یاد دہانیاں کھولیں"],
  ar: ["الموقع الحالي", "استخدام موقعي", "تحديث الموقع", "جارٍ تحديد الموقع…", "إعادة تحديد الموقع", "فتح التذكيرات"],
};
export default function HeaderActions({ language = "en", onReminders }) {
  const location = useAccurateLocation();
  const text = labels[language] || labels.en;
  const subtitle = location.status === "loading" ? text[3] : location.error ? text[4] : location.position ? text[2] : text[1];
  return <div className="iu-header-actions" dir="ltr">
    <a className="iu-notification-button" href={sitePageHref("home", import.meta.env.BASE_URL) + "#reminders"}
      aria-label={text[5]} onClick={onReminders ? event => { event.preventDefault(); onReminders(); } : undefined}><Bell size={20} /></a>
    <button className="iu-location-button" onClick={location.request} disabled={location.status === "loading"}
      aria-label={`${text[0]}: ${subtitle}`} aria-describedby={location.error ? "iu-location-feedback" : undefined}
      title={location.position ? `${location.position.lat.toFixed(4)}°, ${location.position.lon.toFixed(4)}°` : text[1]}>
      {location.status === "loading" ? <LoaderCircle size={17} className="iu-location-loading" /> : <MapPin size={17} />}
      <span dir="auto">{text[0]}<small>{subtitle}</small></span>
    </button>
    <span className="iu-avatar" aria-label="IU">IU</span>
    {location.error && <p className="iu-location-feedback" id="iu-location-feedback" role="alert">{locationErrors[location.error]}</p>}
  </div>;
}
