import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { loadData, applyMarkers, isStale, buildIndex } from "../build/build.mjs";

const page = (body) => `<head>\n<!-- @build:a -->old<!-- @end:a -->\n</head>${body}`;

test("applyMarkers replaces marker content and is idempotent", () => {
  const once = applyMarkers(page(""), { a: "new" });
  assert.equal(once, "<head>\n<!-- @build:a -->new<!-- @end:a -->\n</head>");
  assert.equal(applyMarkers(once, { a: "new" }), once);
});

test("applyMarkers throws on a section with no marker", () => {
  assert.throws(() => applyMarkers(page(""), { a: "x", b: "y" }), /missing marker: b/);
});

test("applyMarkers throws on a marker with no section", () => {
  assert.throws(() => applyMarkers(page(""), {}), /unknown marker: a/);
});

test("applyMarkers output is LF-only even from CRLF input", () => {
  const out = applyMarkers(page("").replace(/\n/g, "\r\n"), { a: "x\r\ny" });
  assert.doesNotMatch(out, /\r/);
});

test("isStale ignores CRLF vs LF differences", () => {
  const fresh = "a\nb\n";
  assert.equal(isStale("a\r\nb\r\n", fresh), false);
  assert.equal(isStale("a\nc\n", fresh), true);
});

test("every hidden-until-JS state in styles.css is scoped under .js", () => {
  const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const hiding = rules.filter(([, , body]) => /opacity:\s*0\s*[;}]|opacity:\s*0$|scaleY\(0\)/m.test(body.trim()));
  assert.ok(hiding.length > 0, "expected some hidden states to check");
  for (const [, selector] of hiding) {
    for (const s of selector.split(",").map((x) => x.trim())) {
      // A popover's closed/entry state is UA-hidden either way and opens natively without JS.
      if (/:popover-open\b/.test(s)) continue;
      assert.match(s, /^\.js /, `"${s}" hides content without JS`);
    }
  }
});

test("asset URLs carry a content hash so a deploy never pairs new HTML with cached old JS/CSS", () => {
  const html = buildIndex(readFileSync(new URL("../index.html", import.meta.url), "utf8"), loadData());
  for (const file of ["tokens.css", "styles.css", "app.js"]) {
    // LF-normalised: Windows checkouts are CRLF, CI is LF, and both must agree.
    const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");
    const hash = createHash("sha256").update(text).digest("hex").slice(0, 10);
    assert.ok(html.includes(`${file}?v=${hash}"`), `${file} not stamped with ?v=${hash}`);
  }
  const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /@import\s+(url\(|["'])/,"tokens.css must be linked from the HTML, not @imported (an import can't be cache-busted)");
});

test("index.html marks JS before CSS loads and no longer needs data.js", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const js = html.indexOf('document.documentElement.classList.add("js")');
  assert.ok(js > -1 && js < html.indexOf('rel="stylesheet"'), "inline .js script before the stylesheets");
  assert.doesNotMatch(html, /<script src="data\.js">/);
  assert.doesNotMatch(html, /<noscript>/);
});

test("the built index.html carries the content without JavaScript", () => {
  const data = loadData();
  const html = buildIndex(readFileSync(new URL("../index.html", import.meta.url), "utf8"), data);
  assert.ok(html.includes(data.headline), "headline");
  for (const s of data.stages) assert.ok(html.includes(`<h3>${s.title}</h3>`), `stage ${s.title}`);
  for (const o of data.offClock) assert.ok(html.includes(`<h3>${o.title}</h3>`), `off-clock ${o.title}`);
  for (const pr of data.projects) assert.ok(html.includes(pr.title.replace(/&/g, "&amp;")), `project ${pr.title}`);
  assert.match(html, /<dt>3<small>yrs<\/small><\/dt>/, "numbers are in the HTML even though they sit in a popover");
});

test("og.png is a 1200×630 PNG under 300 KB (link previews)", () => {
  const png = readFileSync(new URL("../assets/og.png", import.meta.url));
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(16), 1200, "width");
  assert.equal(png.readUInt32BE(20), 630, "height");
  assert.ok(png.length < 300 * 1024, `${png.length} bytes`);
});

test("the JSON-LD in the built page parses", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld["@type"], "Person");
});
