import { mkdir, readFile, writeFile } from "node:fs/promises";
import { verse, content } from "../../backend/content.js";

const menu = JSON.parse(
  await readFile(new URL("../../backend/menu.json", import.meta.url), "utf8"),
);
const directory = new URL("../public/data/", import.meta.url);
await mkdir(new URL("features/", directory), { recursive: true });
const write = (path, data) =>
  writeFile(new URL(path, directory), JSON.stringify(data));
await write("menu.json", menu);
await write("quran.json", verse);
for (const item of menu.home.items) {
  await write(`features/${item.id}.json`, {
    id: item.id,
    ...content[item.id],
    title: content[item.id]?.title || item.title,
    description:
      content[item.id]?.description ||
      "Continue your journey with the original Islamic Unity resource.",
    items:
      content[item.id]?.items ||
      (item.url
        ? [
            {
              title: item.title,
              body: "Open the original Islamic Unity resource.",
              url: item.url,
            },
          ]
        : []),
  });
}
console.log(
  `Exported menu, verse, and ${menu.home.items.length} feature resources for static hosting.`,
);
