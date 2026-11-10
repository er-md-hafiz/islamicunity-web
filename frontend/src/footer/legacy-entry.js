import "./register-footer";

// Existing dashboard feature cards with verified destinations bypass its demo modal.
const destinations = {
  hajj: "Hajj.html", zakat: "ZakatCalculator.html", charity: "IslamicCharity.html",
  halal: "index.html#halal",
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
