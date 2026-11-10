import React from "react";
import { createRoot } from "react-dom/client";
import QuranAudioPlayer from "./QuranAudioPlayer";
import { QuranAudioController } from "./audio-controller.mjs";
import styles from "./quran-audio.css?inline";

function mount() {
  const host = document.getElementById("quranAudioMount");
  if (!host || host.shadowRoot) return;
  const shadow = host.attachShadow({ mode: "open" }),
    container = document.createElement("div");
  const style = document.createElement("style");
  style.textContent = styles;
  shadow.append(style, container);
  const controller = new QuranAudioController();
  window.addEventListener("iu-quran-select", (event) => {
    const number = Number(event.detail?.number);
    if (!Number.isInteger(number) || number < 1 || number > 114) return;
    controller.select(number);
    if (event.detail?.play) void controller.play();
  });
  let lastNumber = 0,
    lastPlaying = false;
  controller.subscribe(() => {
    const state = controller.getSnapshot();
    if (state.number !== lastNumber || state.playing !== lastPlaying) {
      lastNumber = state.number;
      lastPlaying = state.playing;
      window.dispatchEvent(
        new CustomEvent("iu-quran-state", {
          detail: { number: state.number, playing: state.playing },
        }),
      );
    }
  });
  createRoot(container).render(
    <QuranAudioPlayer
      controller={controller}
      language={document.documentElement.lang || "en"}
      compact
    />,
  );
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", mount, { once: true });
else mount();
