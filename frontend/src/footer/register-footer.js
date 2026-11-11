import css from "./site-footer.css?inline";
import { footerColumns, socialProfiles } from "./footer-data.mjs";
import { sitePageHref } from "../../../shared/site-navigation.mjs";
import facebook from "./brands/facebook-f.svg?raw";
import instagram from "./brands/instagram.svg?raw";
import youtube from "./brands/youtube.svg?raw";
import x from "./brands/x-twitter.svg?raw";

const brandIcons = { facebook, instagram, youtube, x };
const icons = {
  up: '<path d="m6 14 6-6 6 6M12 8v13"/>',
  moon: '<path d="M20.5 13A9 9 0 0 1 11 3a9 9 0 1 0 9.5 10Z"/><path d="m19 2 .6 1.4L21 4l-1.4.6L19 6l-.6-1.4L17 4l1.4-.6Z"/>',
};
const icon = name => brandIcons[name]
  ? brandIcons[name].replace("<svg ", `<svg data-brand="${name}" width="20" height="20" aria-hidden="true" `)
  : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

class SiteFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const home = sitePageHref("home", import.meta.env.BASE_URL);
    this.shadowRoot.innerHTML = `<style>${css}</style>
      <footer aria-label="Islamic Unity website footer" lang="en" dir="ltr">
        <div class="footer-grid">
          <section class="brand-column" aria-labelledby="footer-brand">
            <a class="brand" href="${escape(home)}" id="footer-brand">${icon("moon")}<span>Islamic <b>Unity</b></span></a>
            <p>Your complete Islamic companion for prayer, Quran, learning, and community. Providing accurate Islamic tools and resources for Muslims worldwide.</p>
            <div class="website-links"><a class="website-link" href="${escape(home)}">Islamic Unity website ↗</a><a class="website-link" href="${escape(home)}#privacy">Website privacy</a></div>
            <div class="socials" aria-label="Social media">${socialProfiles.map(profile => profile.enabled && profile.url
              ? `<a href="${escape(profile.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(profile.name)} (opens in a new tab)" title="${escape(profile.name)}">${icon(profile.icon)}</a>`
              : `<span class="social-unavailable" role="img" aria-label="${escape(profile.name)} — unavailable" title="${escape(profile.name)} — unavailable">${icon(profile.icon)}</span>`).join("")}</div>
          </section>
          ${footerColumns.map((column, n) => `<nav aria-labelledby="footer-column-${n}"><h2 id="footer-column-${n}">${escape(column.title)}</h2><ul>${column.links.map(([label, url]) => `<li><a href="${escape(url)}"${url.startsWith("https:") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escape(label)}</a></li>`).join("")}</ul></nav>`).join("")}
        </div>
        <div class="footer-bottom"><p>© <span class="year">${new Date().getFullYear()}</span> Islamic Unity. All Rights Reserved.</p><p>Made with <span class="heart" aria-label="love">♥</span> for the Muslim Ummah.</p><button class="back-to-top" type="button" aria-label="Back to top">Back to top ${icon("up")}</button></div>
      </footer>`;
    this.shadowRoot.querySelector(".back-to-top").addEventListener("click", () => {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, left: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }
}
if (!customElements.get("iu-site-footer")) customElements.define("iu-site-footer", SiteFooter);
