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
    plugins: [react()],
    base: env.VITE_BASE_PATH || "/",
    server: { proxy: { "/api": "http://127.0.0.1:3001" } },
  };
});
