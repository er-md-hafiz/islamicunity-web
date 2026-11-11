import { readFile, readdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, relative, extname } from "node:path";
import assert from "node:assert/strict";
import { SITE_BASE_URL, SITE_PAGES } from "../shared/site-navigation.mjs";
import { footerColumns } from "../frontend/src/footer/footer-data.mjs";
import { maskRequestedMenuUrls } from "./menu-url-exceptions.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const retiredHost = "er-md-hafiz.github.io/" + ["islamicunity", "api"].join("-");
const excluded = new Set([".git", "node_modules", ".gradle", ".idea", ".tools", "build", "kotlin-js-store", "test-results", "playwright-report"]);
const textExtensions = new Set([".html", ".js", ".jsx", ".mjs", ".cjs", ".css", ".scss", ".json", ".map", ".md", ".txt", ".xml", ".webmanifest", ".yaml", ".yml", ".svg", ".kt", ".kts", ".properties", ".ps1", ".toml"]);
const failures = [];
let checked = 0;
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.isSymbolicLink()) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (textExtensions.has(extname(entry.name)) || entry.name.startsWith(".env")) {
      const content = await readFile(path, "utf8");
      const text = maskRequestedMenuUrls(content, relative(root, path).replaceAll("\\", "/")).replace(/\\\//g, "/").replace(/\\u002f/gi, "/");
      checked++;
      if (text.toLowerCase().includes(retiredHost)) failures.push(relative(root, path));
    }
  }
}
await scan(root); // Includes the generated frontend/dist artifact when present.
assert.deepEqual(failures, [], "Retired website URLs remain in project/build files");
const publicFiles = new Set((await readdir(resolve(root, "frontend/public"))).filter(name => name.endsWith(".html")));
for (const path of Object.values(SITE_PAGES)) {
  if (["index.html", "Books.html"].includes(path)) await access(resolve(root, "frontend", path));
  else assert.ok(publicFiles.has(path), `Missing or incorrectly cased page: ${path}`);
}
const internal = footerColumns.flatMap(column => column.links.map(([, url]) => url))
  .filter(url => url.startsWith(SITE_BASE_URL));
for (const url of internal) {
  const path = decodeURIComponent(new URL(url).pathname.slice(new URL(SITE_BASE_URL).pathname.length));
  assert.ok(publicFiles.has(path) || path === "index.html", `Missing footer destination: ${url}`);
}
assert.equal(internal.length, 13, "Every internal footer link must stay on the canonical website");
console.log(`Audited ${checked} project/build text files: no unapproved retired URLs (four exact commonUrls values are explicitly allowed); all ${Object.keys(SITE_PAGES).length} configured pages and ${internal.length} internal footer links exist.`);
