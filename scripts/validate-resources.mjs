import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve, relative } from "node:path";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicDirectory = resolve(root, "frontend/public");
const manifest = JSON.parse(
  await readFile(resolve(root, "migration/resource-manifest.json"), "utf8"),
);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const entries = await readdir(publicDirectory, {
  recursive: true,
  withFileTypes: true,
});
const actualPaths = new Set(
  entries
    .filter((e) => e.isFile())
    .map((e) =>
      relative(publicDirectory, resolve(e.parentPath, e.name)).replaceAll(
        "\\",
        "/",
      ),
    ),
);
const oldOrigin = new RegExp(
  "https?://(?:er-md-hafiz|m3hcoding)\\.github\\.io/(?:islamicunity-" +
    "api|Islamic" +
    "Unity)(?=/|[?#]|$)",
  "i",
);
const base = new URL(manifest.publishedBase);

function validateReference(reference, owner) {
  if (
    !reference ||
    reference.startsWith("#") ||
    /^(data:|mailto:|tel:|javascript:|upi:|intent:)/i.test(reference) ||
    reference.includes("${")
  )
    return;
  const url = new URL(reference.replaceAll("&amp;", "&"), new URL(owner, base));
  if (url.origin !== base.origin) return;
  assert.ok(
    url.pathname.startsWith(base.pathname),
    `${owner}: reference leaves the site subdirectory: ${reference}`,
  );
  const path = decodeURIComponent(url.pathname.slice(base.pathname.length));
  if (!path || path === "index.html") return;
  if (manifest.buildAssets?.includes(path)) return;
  assert.ok(
    actualPaths.has(path),
    `${owner}: missing or incorrectly cased resource ${path}`,
  );
}

for (const item of [...manifest.files, ...manifest.aliases]) {
  assert.ok(actualPaths.has(item.path), `Missing resource: ${item.path}`);
  const buffer = await readFile(resolve(publicDirectory, item.path));
  assert.equal(
    hash(buffer),
    item.sha256,
    `Resource changed without updating its migration manifest: ${item.path}`,
  );
  if (/\.(png|jpe?g)$/i.test(item.path) && item.sourceSha256)
    assert.equal(
      hash(buffer),
      item.sourceSha256,
      `Binary asset changed: ${item.path}`,
    );
  if (/\.(html|json|svg|css|js)$/i.test(item.path)) {
    const text = buffer.toString("utf8");
    assert.ok(
      !oldOrigin.test(text),
      `An old resource origin remains in ${item.path}`,
    );
    if (item.path.endsWith(".json")) JSON.parse(text);
    if (item.path.endsWith(".html")) {
      for (const match of text.matchAll(
        /\b(?:src|href)\s*=\s*['"]([^'"]+)['"]/g,
      ))
        validateReference(match[1], item.path);
      for (const match of text.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g))
        validateReference(match[1], item.path);
      for (const match of text.matchAll(
        /https:\/\/er-md-hafiz\.github\.io\/islamicunity-web\/[^\s'"<>`)]+/g,
      ))
        validateReference(match[0], item.path);
    }
  }
}
const menu = JSON.parse(
  await readFile(resolve(publicDirectory, "menu.json"), "utf8"),
);
const backendMenu = JSON.parse(
  await readFile(resolve(root, "backend/menu.json"), "utf8"),
);
assert.deepEqual(menu, backendMenu, "Android and REST menus must match");
const shape = JSON.parse(JSON.stringify(menu), (key, value) =>
  ["url", "icon"].includes(key) ? undefined : value,
);
assert.equal(
  hash(JSON.stringify(shape)),
  manifest.menuCompatibilitySha256,
  "Menu IDs, actions, fragments, analytics, version, or visibility changed",
);
function inspect(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (
      ["url", "icon"].includes(key) &&
      typeof child === "string" &&
      child.startsWith("http")
    )
      validateReference(child, "menu.json");
    else if (typeof child === "object") inspect(child);
  }
}
inspect(menu);
assert.deepEqual(
  await readFile(resolve(publicDirectory, "menu_icons/calender.png")),
  await readFile(resolve(publicDirectory, "menu_icons/calendar.png")),
);
console.log(
  `Validated ${manifest.files.length} migrated resources, ${manifest.aliases.length} compatibility alias, all menu targets, and unchanged native menu identifiers.`,
);
