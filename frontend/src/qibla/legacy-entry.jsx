import React from "react";
import { createRoot } from "react-dom/client";
import QiblaFinder from "./QiblaFinder";
import { useAccurateLocation } from "./useAccurateLocation";
import css from "./qibla.css?inline";
function LegacyQibla() { const location = useAccurateLocation(); return <QiblaFinder location={location} expanded />; }
const host = document.getElementById("qiblaMount");
if (host) {
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style"); style.textContent = css;
  const mount = document.createElement("div"); shadow.append(style, mount);
  createRoot(mount).render(<LegacyQibla />);
}
