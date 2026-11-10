// A deliberately API-free test server that mirrors a Pages project subdirectory.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, sep, extname } from "node:path";
const root = fileURLToPath(new URL("../frontend/dist/", import.meta.url));
const prefix = "/islamicunity-web/";
const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
};
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (!path.startsWith(prefix)) throw new Error("Not found");
    const file = resolve(root, path.slice(prefix.length) || "index.html");
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep))
      throw new Error("Not found");
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(4174, "127.0.0.1", () =>
  console.log(
    "Static Pages test server on http://127.0.0.1:4174/islamicunity-web/",
  ),
);
