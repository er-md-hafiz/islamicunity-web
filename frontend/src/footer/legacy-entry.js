import "./register-footer";
import { SITE_PAGES } from "../../../shared/site-navigation.mjs";

// Existing dashboard feature cards with verified destinations bypass its demo modal.
const destinations = {
  hajj: SITE_PAGES.hajj, zakat: SITE_PAGES.zakat, charity: SITE_PAGES.charity,
  halal: `${SITE_PAGES.home}#halal`,
};
document.querySelectorAll(".feature-item[data-feature]").forEach(card => {
  const path = destinations[card.dataset.feature];
  if (!path) return;
  card.setAttribute("role", "link");
  card.tabIndex = 0;
  const open = event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(new URL(path, location.href).href);
  };
  card.addEventListener("click", open, true);
  card.addEventListener("keydown", event => {
    if (event.key === "Enter") open(event);
  });
});
