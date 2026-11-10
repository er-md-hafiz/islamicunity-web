import React, { useEffect, useState } from "react";
import {
  Moon,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Globe2,
  Clock3,
  Compass,
  BookOpen,
  CircleDot,
  CalendarDays,
  HandHeart,
  Heart,
  Check,
  ShieldCheck,
  Smartphone,
  Mail,
  Github,
  ChevronDown,
  MapPin,
  Bell,
  Sunrise,
  Sun,
  Sunset,
  Users,
  Leaf,
} from "lucide-react";
import { locales } from "./i18n";
import { landingText } from "./landing-copy";
import "./landing.css";

const PLAY =
  "https://play.google.com/store/apps/details?id=com.islamicunity.android";
const EMAIL = "m3hmedia@gmail.com";
const REPO = "https://github.com/er-md-hafiz/islamicunity-web";
const RESOURCES = import.meta.env.BASE_URL;
const featureIcons = {
  prayer_times: Clock3,
  qibla: Compass,
  quran: BookOpen,
  tasbih: CircleDot,
  calendar: CalendarDays,
  dua: HandHeart,
};

function PlayMark() {
  return (
    <svg
      width="23"
      height="25"
      viewBox="0 0 24 26"
      fill="none"
      aria-hidden="true"
    >
      <path d="m2 2 13 11L2 24z" fill="currentColor" />
      <path
        d="m4 1 14 9-3 3zM15 13l3 3L4 25z"
        fill="currentColor"
        opacity=".7"
      />
      <path d="m18 10 5 3-5 3-3-3z" fill="currentColor" opacity=".5" />
    </svg>
  );
}
function Brand({ footer = false }) {
  return (
    <a
      className={`lp-brand ${footer ? "lp-brand-light" : ""}`}
      href="#home"
      aria-label="Islamic Unity home"
    >
      <span className="lp-brand-symbol">
        <Moon size={27} fill="currentColor" strokeWidth={1.5} />
        <Sparkles size={13} />
      </span>
      <span>
        Islamic<span>Unity</span>
        <small>FAITH. TOGETHER.</small>
      </span>
    </a>
  );
}
function Ornament({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M100 8 126 38 165 35 162 74 192 100 162 126 165 165 126 162 100 192 74 162 35 165 38 126 8 100 38 74 35 35 74 38Z"
        stroke="currentColor"
      />
      <path
        d="M100 25 139 61 175 100 139 139 100 175 61 139 25 100 61 61Z"
        stroke="currentColor"
      />
      <path
        d="m100 48 15 37 37 15-37 15-15 37-15-37-37-15 37-15Z"
        stroke="currentColor"
      />
      <circle cx="100" cy="100" r="67" stroke="currentColor" />
      <circle cx="100" cy="100" r="9" fill="currentColor" />
    </svg>
  );
}
function MosqueSkyline() {
  return (
    <svg viewBox="0 0 500 300" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="lp-dome"
          x1="130"
          y1="80"
          x2="350"
          y2="270"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e5cf94" />
          <stop offset="1" stopColor="#a7b893" />
        </linearGradient>
      </defs>
      <circle cx="250" cy="161" r="113" stroke="#d6d3aa" strokeOpacity=".25" />
      <circle cx="250" cy="161" r="130" stroke="#d6d3aa" strokeOpacity=".15" />
      <path
        d="M60 275h380M113 274V131h18v143M109 131h26l-5-14h-16zM116 117V89l6-12 6 12v28M122 77V61M369 274V131h18v143M365 131h26l-5-14h-16zM372 117V89l6-12 6 12v28M378 77V61"
        fill="#91aa86"
        stroke="#cccca0"
        strokeWidth=".5"
      />
      <path d="M146 274V188h61v86M293 274v-86h61v86" fill="#9db28b" />
      <path
        d="M140 188c0-27 31-32 37-49 7 17 36 22 36 49M287 188c0-27 31-32 37-49 7 17 36 22 36 49"
        fill="url(#lp-dome)"
      />
      <path d="M195 274V157h110v117" fill="#bec59e" />
      <path
        d="M183 158c0-49 52-57 67-94 15 37 67 45 67 94Z"
        fill="url(#lp-dome)"
      />
      <path
        d="M250 65V43m2 0a9 9 0 1 1 3-16 9 9 0 0 0-3 16"
        stroke="#e5d5a2"
        strokeWidth="2"
      />
      <path
        d="M232 274v-45c0-17 18-28 18-28s18 11 18 28v45M208 194v-18c0-7 7-12 7-12s7 5 7 12v18M278 194v-18c0-7 7-12 7-12s7 5 7 12v18M163 228v-19c0-6 8-12 8-12s8 6 8 12v19M322 228v-19c0-6 8-12 8-12s8 6 8 12v19"
        fill="#47745b"
      />
      <path
        d="M193 158h114M195 165h110M250 69c-22 45-43 47-43 88M250 69c22 45 43 47 43 88"
        stroke="#f3e7b6"
        strokeOpacity=".3"
      />
      <path d="M351 45a15 15 0 1 0 15 22 16 16 0 0 1-15-22" fill="#f0d69b" />
      <path
        d="M171 49v10m-5-5h10M401 89v10m-5-5h10M76 176v8m-4-4h8"
        stroke="#cfc99c"
      />
    </svg>
  );
}
function AppPreview({ t }) {
  return (
    <div className="lp-showcase">
      <div className="lp-arch">
        <Ornament className="lp-arch-ornament" />
        <span className="lp-arch-calligraphy" lang="ar" dir="rtl">
          بِسْمِ اللَّهِ
        </span>
        <MosqueSkyline />
      </div>
      <div className="lp-phone" aria-hidden="true">
        <div className="lp-phone-camera" />
        <div className="lp-phone-status">
          <span>9:41</span>
          <span>▮▮▮ ▰</span>
        </div>
        <div className="lp-phone-greeting">
          <div>
            <small>YOUR DAILY COMPANION</small>
            <strong>
              Assalamu Alaikum<span> ☀</span>
            </strong>
          </div>
          <span className="lp-phone-avatar">IU</span>
        </div>
        <div className="lp-phone-location">
          <MapPin size={10} /> New Delhi, India <ChevronDown size={9} />
        </div>
        <div className="lp-phone-prayer">
          <div className="lp-phone-prayer-pattern" />
          <small>NEXT PRAYER</small>
          <div>
            <strong>Dhuhr</strong>
            <span>12:08 PM</span>
          </div>
          <p>
            <Clock3 size={10} /> A moment to reconnect.
          </p>
          <Moon className="lp-phone-crescent" size={46} strokeWidth={1} />
        </div>
        <div className="lp-phone-times">
          {[
            [Moon, "Fajr", "5:25"],
            [Sunrise, "Sunrise", "6:38"],
            [Sun, "Dhuhr", "12:08"],
            [Sunset, "Asr", "3:15"],
            [Moon, "Isha", "6:51"],
          ].map(([I, label, time]) => (
            <div className={label === "Dhuhr" ? "selected" : ""} key={label}>
              <I size={15} />
              <span>{label}</span>
              <b>{time}</b>
            </div>
          ))}
        </div>
        <h4>
          Your daily essentials <ArrowRight size={11} />
        </h4>
        <div className="lp-phone-tools">
          {[
            [Compass, "Qibla"],
            [BookOpen, "Quran"],
            [CircleDot, "Tasbih"],
            [CalendarDays, "Calendar"],
          ].map(([I, label], i) => (
            <span className={`tone-${i}`} key={label}>
              <I size={20} />
              <small>{label}</small>
            </span>
          ))}
        </div>
        <div className="lp-phone-verse">
          <BookOpen size={12} />
          <span>A verse for your day</span>
          <p lang="ar" dir="rtl">
            فَإِنَّ مَعَ الْعُسْرِ يُسْرًا
          </p>
          <small>With hardship comes ease. · 94:5</small>
        </div>
        <div className="lp-phone-nav">
          <span>
            <Moon size={15} />
            Home
          </span>
          <span>
            <Compass size={15} />
            Qibla
          </span>
          <span>
            <BookOpen size={15} />
            Quran
          </span>
          <span>
            <Menu size={15} />
            More
          </span>
        </div>
      </div>
      <div className="lp-floating lp-floating-qibla" aria-hidden="true">
        <span className="lp-mini-compass">
          <i />
          <b>N</b>
        </span>
        <div>
          <small>WHEREVER YOU ARE</small>
          <strong>Find your direction.</strong>
          <span>Qibla, always close.</span>
        </div>
        <Check size={14} />
      </div>
      <div className="lp-floating lp-floating-dhikr" aria-hidden="true">
        <span className="lp-mini-counter">
          33<small>/33</small>
        </span>
        <div>
          <strong>A little dhikr.</strong>
          <span>A little more peace.</span>
        </div>
        <Sparkles size={16} />
      </div>
      <span className="lp-preview-caption">{t("preview")}</span>
    </div>
  );
}

export default function LandingPage({ section }) {
  const [language, setLanguage] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("iu-language")) || "en";
    } catch {
      return "en";
    }
  });
  const [mobileMenu, setMobileMenu] = useState(false);
  const t = (key) => landingText(key, language);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = ["ar", "ur"].includes(language)
      ? "rtl"
      : "ltr";
    document.documentElement.dataset.theme = "light";
    try {
      localStorage.setItem("iu-language", JSON.stringify(language));
    } catch {}
  }, [language]);
  useEffect(() => {
    setMobileMenu(false);
    if (!section || section === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const id = requestAnimationFrame(() =>
      document.getElementById(section)?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      }),
    );
    return () => cancelAnimationFrame(id);
  }, [section]);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setMobileMenu(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  return (
    <div className="landing-page">
      <a className="lp-skip" href="#features">
        Skip to content
      </a>
      <header className="lp-header">
        <div className="lp-header-inner">
          <Brand />
          <nav
            className={`lp-navigation ${mobileMenu ? "is-open" : ""}`}
            aria-label="Main navigation"
            id="homepage-navigation"
          >
            {["home", "features", "about", "donate", "contact"].map((id) => (
              <a
                href={`#${id}`}
                key={id}
                className={
                  (!section && id === "home") || section === id ? "active" : ""
                }
                aria-current={section === id ? "location" : undefined}
              >
                {t(id)}
                {id === "home" && <span />}
              </a>
            ))}
          </nav>
          <div className="lp-header-actions">
            <label className="lp-language">
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
            </label>
            <a
              className="lp-header-download"
              href={PLAY}
              target="_blank"
              rel="noreferrer"
            >
              {t("download")}
              <ArrowUpRight size={15} />
            </a>
            <button
              className="lp-menu-toggle"
              aria-label={mobileMenu ? t("closeMenu") : t("menu")}
              aria-expanded={mobileMenu}
              aria-controls="homepage-navigation"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main className="lp-main">
        <section className="lp-hero" id="home" aria-labelledby="homepage-title">
          <div className="lp-hero-lines" />
          <Ornament className="lp-hero-ornament" />
          <div className="lp-hero-content">
            <span className="lp-overline lp-overline-light">
              <span />
              {t("eyebrow")}
            </span>
            <h1 id="homepage-title">
              {t("title")}
              <br />
              <em>{t("titleGold")}</em>
            </h1>
            <p className="lp-hero-description">{t("intro")}</p>
            <div className="lp-hero-ctas">
              <a
                className="lp-button lp-button-gold"
                href={PLAY}
                target="_blank"
                rel="noreferrer"
              >
                <PlayMark />
                <span>{t("google")}</span>
                <ArrowUpRight size={16} />
              </a>
              <a className="lp-hero-donate" href="#donate">
                {t("donate")}
                <Heart size={16} />
              </a>
            </div>
            <div className="lp-hero-reassurance">
              <span>
                <Check size={12} />
              </span>
              {t("heroNote")}
            </div>
            <div className="lp-hero-bottom">
              <div className="lp-language-glyphs" aria-hidden="true">
                <span>A</span>
                <span>अ</span>
                <span>ا</span>
                <span>ع</span>
              </div>
              <div>
                <strong>{t("languages")}</strong>
                <small>English · हिन्दी · اردو · العربية</small>
              </div>
            </div>
          </div>
          <AppPreview t={t} />
          <div className="lp-hero-bottom-edge" />
        </section>
        <div className="lp-purpose-strip">
          <span>
            <Clock3 size={18} />
            {t("strip1")}
          </span>
          <i />
          <span>
            <Compass size={18} />
            {t("strip2")}
          </span>
          <i />
          <span>
            <CircleDot size={18} />
            {t("strip3")}
          </span>
          <a href="#prayer_times">
            {t("open")}
            <ArrowUpRight size={16} />
          </a>
        </div>
        <section
          className="lp-section lp-features"
          id="features"
          aria-labelledby="features-title"
        >
          <div className="lp-section-heading">
            <div>
              <span className="lp-overline">
                <span />
                {t("featureEyebrow")}
              </span>
              <h2 id="features-title">
                {t("featureTitle")}
                <br />
                <em>{t("featureTitle2")}</em>
              </h2>
            </div>
            <p>{t("featureIntro")}</p>
          </div>
          <div className="lp-features-grid">
            {Object.entries(featureIcons).map(([id, I], i) => (
              <a
                className={`lp-feature lp-feature-${i}`}
                href={`#${id}`}
                key={id}
              >
                <div className="lp-feature-top">
                  <span className="lp-feature-icon">
                    <I size={27} strokeWidth={1.5} />
                  </span>
                  <span className="lp-feature-number">0{i + 1}</span>
                </div>
                <h3>{t(id)}</h3>
                <p>{t(id + "Desc")}</p>
                <span className="lp-feature-link">
                  {t("try")}
                  <ArrowUpRight size={16} />
                </span>
              </a>
            ))}
          </div>
          <div className="lp-features-bottom">
            <span>
              <Sparkles size={16} />
              {t("tools")}
            </span>
            <a href="#prayer_times">
              {t("allTools")}
              <ArrowRight size={17} />
            </a>
          </div>
        </section>
        <section
          className="lp-section lp-story"
          id="about"
          aria-labelledby="story-title"
        >
          <div className="lp-reflection">
            <div className="lp-reflection-inner">
              <Ornament className="lp-reflection-ornament" />
              <span className="lp-reflection-arabic" lang="ar" dir="rtl">
                فَإِنَّ مَعَ الْعُسْرِ يُسْرًا
              </span>
              <blockquote>“{t("verse")}”</blockquote>
              <span className="lp-reflection-reference">{t("verseRef")}</span>
              <div className="lp-reflection-art">
                <MosqueSkyline />
              </div>
            </div>
            <span className="lp-reflection-corner">۞</span>
          </div>
          <div className="lp-story-content">
            <span className="lp-overline">
              <span />
              {t("storyEyebrow")}
            </span>
            <h2 id="story-title">
              {t("storyTitle")}
              <br />
              <em>{t("storyTitle2")}</em>
            </h2>
            <p>{t("storyBody")}</p>
            <div className="lp-story-values">
              {[
                [Leaf, "storyPoint1"],
                [Globe2, "storyPoint2"],
                [Smartphone, "storyPoint3"],
              ].map(([I, key]) => (
                <div key={key}>
                  <span>
                    <I size={19} strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3>{t(key)}</h3>
                    <p>{t(key + "Desc")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          className="lp-download-section"
          id="download"
          aria-labelledby="download-title"
        >
          <div className="lp-download-content">
            <span className="lp-overline">
              <span />
              {t("downloadEyebrow")}
            </span>
            <h2 id="download-title">
              {t("downloadTitle")}
              <br />
              <em>{t("downloadTitle2")}</em>
            </h2>
            <p>{t("downloadBody")}</p>
            <div className="lp-download-actions">
              <a
                className="lp-button lp-button-green"
                href={PLAY}
                target="_blank"
                rel="noreferrer"
              >
                <PlayMark />
                {t("google")}
                <ArrowUpRight size={16} />
              </a>
              <a className="lp-inline-link" href="#prayer_times">
                {t("open")}
                <ArrowRight size={17} />
              </a>
            </div>
            <span className="lp-android-note">
              <Smartphone size={14} />
              {t("android")}
            </span>
          </div>
          <div className="lp-download-art" aria-hidden="true">
            <Ornament className="lp-download-orbit" />
            <div className="lp-app-tile">
              <Moon size={83} strokeWidth={1} fill="currentColor" />
              <Sparkles className="lp-app-tile-star" size={33} />
            </div>
            <span className="lp-orbit-icon lp-orbit-book">
              <BookOpen size={26} />
            </span>
            <span className="lp-orbit-icon lp-orbit-compass">
              <Compass size={26} />
            </span>
            <span className="lp-orbit-icon lp-orbit-dhikr">
              <CircleDot size={25} />
            </span>
            <span className="lp-orbit-icon lp-orbit-heart">
              <Heart size={24} />
            </span>
          </div>
        </section>
        <section
          className="lp-donate"
          id="donate"
          aria-labelledby="donate-title"
        >
          <Ornament className="lp-donate-ornament" />
          <div className="lp-donate-content">
            <span className="lp-overline lp-overline-light">
              <span />
              {t("donateEyebrow")}
            </span>
            <h2 id="donate-title">
              {t("donateTitle")}
              <br />
              <em>{t("donateTitle2")}</em>
            </h2>
            <p>{t("donateBody")}</p>
            <a
              className="lp-button lp-button-gold"
              href={`${RESOURCES}donate.html`}
            >
              <HandHeart size={20} />
              {t("support")}
              <ArrowUpRight size={16} />
            </a>
            <small className="lp-support-note">{t("supportNote")}</small>
          </div>
          <div className="lp-support-visual">
            <div className="lp-generosity-symbol">
              <HandHeart size={63} strokeWidth={1} />
              <span lang="ar">صدقة</span>
            </div>
            <div className="lp-support-points">
              {[
                [Sparkles, "support1"],
                [Users, "support2"],
              ].map(([I, key]) => (
                <div key={key}>
                  <I size={20} />
                  <div>
                    <h3>{t(key)}</h3>
                    <p>{t(key + "Desc")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          className="lp-section lp-contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div>
            <span className="lp-overline">
              <span />
              {t("contactEyebrow")}
            </span>
            <h2 id="contact-title">
              {t("contactTitle")}
              <br />
              <em>{t("contactTitle2")}</em>
            </h2>
            <p>{t("contactBody")}</p>
            <a className="lp-email-link" href={`mailto:${EMAIL}`}>
              <span>
                <Mail size={21} />
              </span>
              <div>
                <small>{t("email")}</small>
                <strong>{EMAIL}</strong>
              </div>
              <ArrowUpRight size={20} />
            </a>
            <a
              className="lp-inline-link lp-github-link"
              href={REPO}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={17} />
              {t("github")}
              <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="lp-faq">
            <h3>{t("faq")}</h3>
            {[1, 2, 3].map((n) => (
              <details
                key={n}
                id={n === 3 ? "privacy" : undefined}
                open={n === 3 && section === "privacy" ? true : undefined}
              >
                <summary>
                  {t("faq" + n)}
                  <span>
                    <ChevronDown size={18} />
                  </span>
                </summary>
                <p>{t("faq" + n + "Answer")}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="lp-footer">
        <div className="lp-footer-main">
          <div>
            <Brand footer />
            <p>{t("footerLine")}</p>
          </div>
          <div className="lp-footer-links">
            <a href={`${RESOURCES}PrivacyPolicy.html`}>{t("appPrivacy")}</a>
            <a href={`${RESOURCES}terms_and_conditions.html`}>{t("terms")}</a>
            {["features", "about", "contact", "privacy"].map((id) => (
              <a href={`#${id}`} key={id}>
                {t(id)}
              </a>
            ))}
            <a href={PLAY} target="_blank" rel="noreferrer">
              Google Play
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} Islamic Unity</span>
          <span>
            {t("builtBy")}
            <Heart size={12} />
          </span>
          <a href="#home">{t("home")} ↑</a>
        </div>
      </footer>
    </div>
  );
}
