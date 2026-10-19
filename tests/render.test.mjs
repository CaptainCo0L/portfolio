import { test } from "node:test";
import assert from "node:assert/strict";
import { loadData } from "../build/build.mjs";
import {
  esc, renderNumbers, renderStory, renderOffClock, renderProjects,
  renderContactMeta, renderHead, renderSections,
} from "../build/render.mjs";
import { ILLUSTRATIONS } from "../build/illustrations.mjs";

const DATA = loadData();
const SITE = {
  url: "https://captainco0l.github.io/portfolio/",
  ogImage: "https://captainco0l.github.io/portfolio/assets/og.png",
};
const count = (html, re) => (html.match(re) || []).length;
const stageHtml = (html, id) => {
  const start = html.indexOf(`id="stage-${id}"`);
  const next = html.indexOf('<li class="stage', start + 1);
  return html.slice(start, next === -1 ? undefined : next);
};

test("esc escapes the five HTML metacharacters", () => {
  assert.equal(esc(`& < > " '`), "&amp; &lt; &gt; &quot; &#39;");
});

test("renderNumbers escapes a value like <2% and puts the unit in <small>", () => {
  const html = renderNumbers([{ value: "<2%", unit: "", label: "x" }, { value: "3", unit: "yrs", label: "y" }]);
  assert.match(html, /&lt;2%/);
  assert.doesNotMatch(html, /<2%/);
  assert.match(html, /<dt>3<small>yrs<\/small><\/dt>/);
});

test("renderStory: six stages; turning points say so in words, not only colour", () => {
  const html = renderStory(DATA.stages, DATA.numbers);
  assert.equal(count(html, /<li class="stage/g), 6);
  assert.equal(count(html, /<li class="stage[^"]*\bis-turn\b/g), 2);
  for (const id of ["aspire", "security"]) assert.match(stageHtml(html, id), /Turning point/);
  for (const id of ["college", "postgrad", "pause", "next"]) assert.doesNotMatch(stageHtml(html, id), /Turning point/);
});

test("renderStory: the line is blue from the first turning point on; next is the future stage", () => {
  const html = renderStory(DATA.stages, DATA.numbers);
  const classes = (id) => html.match(new RegExp(`<li class="([^"]*)" id="stage-${id}"`))[1];
  for (const id of ["aspire", "pause", "security", "next"]) assert.match(classes(id), /\bis-after-turn\b/, id);
  for (const id of ["college", "postgrad"]) assert.doesNotMatch(classes(id), /\bis-after-turn\b/, id);
  assert.match(classes("next"), /\bis-future\b/);
  assert.equal(count(html, /\bis-future\b/g), 1);
  assert.equal(count(html, /tabindex="-1"/g), 6);
});

test("renderStory: one numbers popover, opened by a real button, not nested in it", () => {
  const html = renderStory(DATA.stages, DATA.numbers);
  assert.equal(count(html, /popovertarget="numbers"/g), 1);
  assert.equal(count(html, /id="numbers"[^>]*\bpopover\b/g), 1);
  const aspire = stageHtml(html, "aspire");
  assert.match(aspire, /<button class="chip" type="button" popovertarget="numbers">By the numbers<\/button>/);
  assert.match(aspire, /<\/button>\s*<div id="numbers"/, "popover is the button's sibling");
});

test("renderStory: every paragraph appears unchanged (escaped)", () => {
  const html = renderStory(DATA.stages, DATA.numbers);
  for (const s of DATA.stages) for (const p of s.body) assert.ok(html.includes(esc(p)), `${s.id}: ${p.slice(0, 40)}`);
});

test("renderStory: stage link and empty fields", () => {
  const html = renderStory(DATA.stages, DATA.numbers);
  assert.match(stageHtml(html, "security"), /<a class="quiet" href="#fieldwork">See the fieldwork<\/a>/);
  const next = stageHtml(html, "next");
  assert.doesNotMatch(next, /class="tags"/, "no tags → no empty list");
  assert.doesNotMatch(next, /class="stage__years"/, "no years → no empty label");
});

test("renderOffClock: eight items, each with a decorative illustration; text unchanged", () => {
  const html = renderOffClock(DATA.offClock);
  assert.equal(count(html, /<li class="off__item">/g), 8);
  assert.equal(count(html, /<svg[^>]*aria-hidden="true"/g), 8);
  for (const o of DATA.offClock) assert.ok(html.includes(esc(o.text)), o.title);
});

test("illustrations: exactly the eight, and nothing executable", () => {
  assert.deepEqual(Object.keys(ILLUSTRATIONS).sort(),
    ["controller", "dumbbell", "football", "guitar", "mountain", "planet", "server", "speech"]);
  for (const [name, svg] of Object.entries(ILLUSTRATIONS)) {
    assert.match(svg, /^<svg [^>]*viewBox="0 0 24 24"/, name);
    assert.doesNotMatch(svg, /<script|\son\w+=/i, name);
  }
});

test("renderProjects: write-up link only when link is set", () => {
  const base = { title: "T", org: "O", body: "B", tags: ["x"] };
  assert.doesNotMatch(renderProjects([{ ...base, link: "" }]), /Read the write-up/);
  const linked = renderProjects([{ ...base, link: "https://x" }]);
  assert.match(linked, /Read the write-up/);
  assert.match(linked, /rel="noopener"/);
});

test("renderProjects: optional report link renders alongside the write-up", () => {
  const base = { title: "T", org: "O", body: "B", tags: ["x"] };
  assert.doesNotMatch(renderProjects([{ ...base, report: "" }]), /Report \(PDF\)/);
  const both = renderProjects([{ ...base, link: "https://x", report: "assets/r.pdf" }]);
  assert.match(both, /Read the write-up/);
  assert.match(both, /Report \(PDF\)/);
  assert.match(both, /href="assets\/r\.pdf"/);
});

test("renderContactMeta omits a missing phone without a dangling separator", () => {
  assert.equal(renderContactMeta({ email: "a@b.c", location: "Here", timezone: "IST" }), "a@b.c · Here (IST)");
});

test("renderHead: JSON-LD cannot be broken out of with </script>", () => {
  const data = { ...DATA, lede: "evil </script><b>x</b>" };
  const body = renderHead(data, SITE).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.doesNotMatch(body, /<\/script/i);
  assert.equal(JSON.parse(body).description, data.lede);
});

test("renderHead: life-story title, short description, Kochi, languages, previews", () => {
  const html = renderHead(DATA, SITE);
  assert.match(html, /<title>Aswin Sunil — The story so far · QA to security<\/title>/);
  const desc = html.match(/<meta name="description" content="([^"]*)"/)[1];
  assert.ok(desc.length <= 160, `description is ${desc.length} chars`);
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld.address.addressLocality, "Kochi");
  assert.deepEqual(ld.knowsLanguage, ["English", "Malayalam", "Tamil", "Hindi"]);
  assert.match(html, /property="og:image" content="https:\/\/captainco0l\.github\.io\/portfolio\/assets\/og\.png"/);
  assert.match(html, /rel="canonical"/);
});

test("footer has no build-time year, so the build output never goes stale on Jan 1", () => {
  const foot = renderSections(DATA, SITE).foot;
  assert.match(foot, /<span id="foot-year"><\/span>/);
  assert.doesNotMatch(foot, /\d{4}/);
});

test("renderSections returns every marker", () => {
  assert.deepEqual(Object.keys(renderSections(DATA, SITE)).sort(), [
    "certs", "contact", "education", "fieldwork-note", "foot", "head",
    "hero", "nav-status", "off-clock", "projects", "skills", "story",
  ]);
});
