import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import HeaderActions from "./HeaderActions";
import css from "./header-actions.css?inline";
function LegacyHeader() {
  const [language, setLanguage] = useState(document.documentElement.lang || "en");
  useEffect(() => {
    const update = event => { const lang = event?.target?.value || document.documentElement.lang; if (["en", "hi", "ur", "ar"].includes(lang)) setLanguage(lang); };
    const observer = new MutationObserver(() => update()); observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    document.addEventListener("change", update);
    return () => { observer.disconnect(); document.removeEventListener("change", update); };
  }, []);
  return <header className="iu-common-header"><HeaderActions language={language} /></header>;
}
const host = document.querySelector("iu-site-header");
if (host) {
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = ':host{display:block;width:100%;margin-bottom:12px;flex:none}.iu-common-header{display:flex;justify-content:flex-end;padding:12px 16px;background:var(--card,#f8faf5);border-bottom:1px solid var(--line,#dfe8df)}' + css;
  const mount = document.createElement("div"); shadow.append(style, mount); createRoot(mount).render(<LegacyHeader />);
}
