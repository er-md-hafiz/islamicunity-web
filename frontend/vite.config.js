import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(
    mode,
    fileURLToPath(new URL(".", import.meta.url)),
    "VITE_",
  );
  return {
    base: env.VITE_BASE_PATH || "/",
    server: { proxy: { "/api": "http://127.0.0.1:3001" } },
    build: {
      rollupOptions: {
        preserveEntrySignatures: "strict",
        input: {
          contentData: fileURLToPath(new URL("./src/config/legacy-entry.js", import.meta.url)),
          main: fileURLToPath(new URL("./index.html", import.meta.url)),
          siteFooter: fileURLToPath(new URL("./src/footer/legacy-entry.js", import.meta.url)),
          siteHeader: fileURLToPath(new URL("./src/header/legacy-entry.jsx", import.meta.url)),
          qiblaFinder: fileURLToPath(new URL("./src/qibla/legacy-entry.jsx", import.meta.url)),
          quranAudio: fileURLToPath(
            new URL("./src/quran/legacy-entry.jsx", import.meta.url),
          ),
        },
        output: {
          entryFileNames: (chunk) =>
            chunk.name === "contentData" ? "assets/content-data.js" : chunk.name === "siteHeader"
              ? "assets/site-header.js"
              : chunk.name === "qiblaFinder"
              ? "assets/qibla-finder.js"
              : chunk.name === "siteFooter"
              ? "assets/site-footer.js"
              : chunk.name === "quranAudio"
              ? "assets/quran-audio.js"
              : "assets/[name]-[hash].js",
        },
      },
    },
    plugins: [
      react(),
      {
        name: "legacy-quran-dev-entry",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.split("?")[0] === "/assets/content-data.js") {
              res.setHeader("Content-Type", "application/javascript");
              res.end(`export * from ${JSON.stringify(server.config.base + "src/config/legacy-entry.js")};`);
              return;
            }
            if (req.url?.split("?")[0] === "/assets/site-footer.js") {
              res.setHeader("Content-Type", "application/javascript");
              res.end(`import ${JSON.stringify(server.config.base + "src/footer/legacy-entry.js")};`);
            } else if (["/assets/quran-audio.js", "/assets/qibla-finder.js", "/assets/site-header.js"].includes(req.url?.split("?")[0])) {
              const base = server.config.base;
              const entry = req.url.split("?")[0].includes("site-header") ? "header" : req.url.split("?")[0].includes("qibla-finder") ? "qibla" : "quran";
              res.setHeader("Content-Type", "application/javascript");
              res.end(
                `import RefreshRuntime from ${JSON.stringify(base + "@react-refresh")};\nRefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;\nawait import(${JSON.stringify(base + `src/${entry}/legacy-entry.jsx`)});`,
              );
            } else next();
          });
        },
      },
    ],
  };
});
