/* Writes the content from data.js into index.html, between marker comments:
     <!-- @build:NAME --> … <!-- @end:NAME -->
   The generated index.html is committed; GitHub Pages serves it as-is.

     node build/build.mjs           rebuild index.html
     node build/build.mjs --check   exit 1 if index.html is out of date        */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { renderSections } from "./render.mjs";

const ROOT = new URL("../", import.meta.url);
const SITE = {
  url: "https://captainco0l.github.io/portfolio/",
  ogImage: "https://captainco0l.github.io/portfolio/assets/og.png",
};
const MARKER = /<!-- @build:([\w-]+) -->[\s\S]*?<!-- @end:\1 -->/g;

const lf = (s) => s.replace(/\r\n/g, "\n");

/* data.js is a plain browser script (`const DATA = {…}`), so evaluate it in a sandbox. */
export function loadData(path = fileURLToPath(new URL("data.js", ROOT))) {
  return vm.runInNewContext(readFileSync(path, "utf8") + "\n;DATA");
}

export function applyMarkers(html, sections) {
  const seen = new Set();
  const out = lf(html).replace(MARKER, (_, name) => {
    if (!(name in sections)) throw new Error(`unknown marker: ${name}`);
    seen.add(name);
    return `<!-- @build:${name} -->${lf(sections[name])}<!-- @end:${name} -->`;
  });
  for (const name of Object.keys(sections)) {
    if (!seen.has(name)) throw new Error(`missing marker: ${name}`);
  }
  return out;
}

/* git may check index.html out with CRLF; only content counts. */
export const isStale = (current, fresh) => lf(current) !== lf(fresh);

/* ?v=<hash of the file> on every asset URL: Pages caches assets for ~10 min,
   and new HTML with a cached old app.js or CSS breaks the page. Hashed over
   LF-normalised text so a CRLF checkout and CI's LF checkout agree. */
const stamp = (file) => {
  const text = lf(readFileSync(new URL(file, ROOT), "utf8"));
  return `${file}?v=${createHash("sha256").update(text).digest("hex").slice(0, 10)}`;
};

export const buildIndex = (html, data) =>
  applyMarkers(html, {
    ...renderSections(data, SITE),
    styles: `<link rel="stylesheet" href="${stamp("tokens.css")}" />
  <link rel="stylesheet" href="${stamp("styles.css")}" />`,
    script: `<script src="${stamp("app.js")}"></script>`,
  });

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const indexPath = fileURLToPath(new URL("index.html", ROOT));
  const current = readFileSync(indexPath, "utf8");
  const fresh = buildIndex(current, loadData());
  if (process.argv.includes("--check")) {
    if (isStale(current, fresh)) {
      console.error("index.html is stale — run: node build/build.mjs");
      process.exit(1);
    }
    console.log("index.html is up to date");
  } else {
    writeFileSync(indexPath, fresh);
    console.log("index.html written");
  }
}
