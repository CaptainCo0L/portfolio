import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import {
  esc, renderStats, renderPhases, renderBand, renderProjects,
  renderContactMeta, renderHead, renderSections,
} from "../build/render.mjs";

const DATA = vm.runInNewContext(readFileSync(new URL("../data.js", import.meta.url), "utf8") + "\n;DATA");
const SITE = {
  url: "https://captainco0l.github.io/portfolio/",
  ogImage: "https://captainco0l.github.io/portfolio/assets/og.png",
};
const count = (html, re) => (html.match(re) || []).length;

test("esc escapes the five HTML metacharacters", () => {
  assert.equal(esc(`& < > " '`), "&amp; &lt; &gt; &quot; &#39;");
});

test("renderStats escapes a value like <2%", () => {
  const html = renderStats([{ value: "<2%", unit: "", label: "defect leakage rate" }]);
  assert.match(html, /&lt;2%/);
  assert.doesNotMatch(html, /<2%/);
});

test("renderStats puts the unit in <small>", () => {
  assert.match(renderStats([{ value: "3", unit: "yrs", label: "x" }]), /<dt>3<small>yrs<\/small><\/dt>/);
});

test("renderPhases: ids, tabindex, is-flagged only on flagged, no reveal", () => {
  const html = renderPhases(DATA.phases);
  assert.match(html, /id="event-0"/);
  assert.equal(count(html, /tabindex="-1"/g), DATA.phases.length);
  assert.equal(count(html, /is-flagged/g), DATA.phases.filter((p) => p.flag).length);
  assert.doesNotMatch(html, /reveal/);
});

test("renderBand: 168 children, one button per phase, ticks aria-hidden", () => {
  const html = renderBand(DATA.phases);
  const buttons = count(html, /<button class="flagbtn/g);
  const ticks = count(html, /<span class="tick" aria-hidden="true"/g);
  assert.equal(buttons, DATA.phases.length);
  assert.equal(buttons + ticks, 168);
  assert.doesNotMatch(html, /band--draw/);
});

test("renderBand: draw-in delay is 2.5ms per slot", () => {
  const html = renderBand(DATA.phases);
  assert.match(html, /--d:0ms/);
  assert.match(html, /--d:417\.5ms/); // slot 167
});

test("renderBand: two phases both at mark 1 both render", () => {
  const phases = [
    { mark: 1, flag: true, year: "A", title: "a" },
    { mark: 1, flag: true, year: "B", title: "b" },
  ];
  const html = renderBand(phases, 168);
  assert.equal(count(html, /<button class="flagbtn/g), 2);
  assert.equal(count(html, /<button class="flagbtn/g) + count(html, /<span class="tick"/g), 168);
});

test("renderProjects: write-up link only when link is set; no reveal", () => {
  const base = { title: "T", org: "O", body: "B", tags: ["x"] };
  assert.doesNotMatch(renderProjects([{ ...base, link: "" }]), /Read the write-up/);
  const linked = renderProjects([{ ...base, link: "https://x" }]);
  assert.match(linked, /Read the write-up/);
  assert.match(linked, /rel="noopener"/);
  assert.doesNotMatch(linked, /reveal/);
});

test("renderContactMeta omits a missing phone without a dangling separator", () => {
  const meta = renderContactMeta({ email: "a@b.c", location: "Here", timezone: "IST" });
  assert.equal(meta, "a@b.c · Here (IST)");
});

test("renderHead: JSON-LD cannot be broken out of with </script>", () => {
  const data = { ...DATA, lede: "evil </script><b>x</b>" };
  const html = renderHead(data, SITE);
  const body = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.doesNotMatch(body, /<\/script/i);
  assert.match(body, /\\u003c\/script/);
  assert.equal(JSON.parse(body).description, data.lede);
});

test("renderHead: og:image and canonical", () => {
  const html = renderHead(DATA, SITE);
  assert.match(html, /property="og:image" content="https:\/\/captainco0l\.github\.io\/portfolio\/assets\/og\.png"/);
  assert.match(html, /rel="canonical" href="https:\/\/captainco0l\.github\.io\/portfolio\/"/);
});

test("renderSections returns every marker", () => {
  const keys = Object.keys(renderSections(DATA, SITE)).sort();
  assert.deepEqual(keys, [
    "band", "certs", "contact", "education", "fieldwork-note", "foot", "head",
    "hero", "nav-status", "phases", "projects", "skills", "stats",
  ]);
});
