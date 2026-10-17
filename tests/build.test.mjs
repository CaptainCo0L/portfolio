import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("the built index.html carries the content without JavaScript", () => {
  const data = loadData();
  const html = buildIndex(readFileSync(new URL("../index.html", import.meta.url), "utf8"), data);
  assert.ok(html.includes(data.headline), "headline");
  for (const ph of data.phases) assert.ok(html.includes(ph.title), `phase ${ph.title}`);
  for (const pr of data.projects) assert.ok(html.includes(pr.title.replace(/&/g, "&amp;")), `project ${pr.title}`);
  assert.match(html, /<dt>3<small>yrs<\/small><\/dt>/);
});
