import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The mobile-native platform layer (theme spec §5b). These are one-line rules
// that only misbehave on real phones, so they're pinned here.
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

// Drop every `@media (hover: hover) and (pointer: fine) { … }` block (balanced braces).
function withoutFinePointerBlocks(text) {
  const marker = /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)\s*\{/g;
  let out = "", last = 0, m;
  while ((m = marker.exec(text))) {
    out += text.slice(last, m.index);
    let depth = 1, i = m.index + m[0].length;
    while (depth && i < text.length) depth += text[i] === "{" ? 1 : text[i] === "}" ? -1 : 0, i++;
    last = marker.lastIndex = i;
  }
  return out + text.slice(last);
}

test("every :hover rule is gated behind a fine pointer (no sticky hover on touch)", () => {
  const stray = withoutFinePointerBlocks(css).match(/[^{}]*:hover[^{]*\{/g) || [];
  assert.deepEqual(stray.map((s) => s.trim()), []);
});

test("no tap flash, no font inflation", () => {
  assert.match(css, /-webkit-tap-highlight-color:\s*transparent/);
  assert.match(css, /-webkit-text-size-adjust:\s*100%/);
});

test("links and buttons skip the double-tap wait", () => {
  assert.match(css, /(^|[,}\s])a,\s*button\s*\{[^}]*touch-action:\s*manipulation/m);
});

test("controls don't select their label on long-press; body text still can", () => {
  const rule = css.match(/([^{}]+)\{[^}]*-webkit-touch-callout:\s*none[^}]*\}/);
  assert.ok(rule, "a user-select/touch-callout rule exists");
  for (const sel of [".btn", ".chip", ".nav__links a"]) assert.ok(rule[1].includes(sel), sel);
  assert.doesNotMatch(css, /(^|[,}\s])(body|html)\s*\{[^}]*user-select:\s*none/m);
});

test("content clears the notch: safe-area insets are used with viewport-fit=cover", () => {
  assert.match(html, /viewport-fit=cover/);
  for (const side of ["left", "right", "top", "bottom"]) {
    assert.match(css, new RegExp(`env\\(safe-area-inset-${side}`), side);
  }
});

test("zoom is never disabled", () => {
  assert.doesNotMatch(html, /user-scalable\s*=\s*no|maximum-scale/);
});

test("status bar colour per scheme", () => {
  assert.match(html, /<meta name="theme-color" content="#ffffff" media="\(prefers-color-scheme: light\)"/);
  assert.match(html, /<meta name="theme-color" content="#000000" media="\(prefers-color-scheme: dark\)"/);
});

test("increased contrast: every surface-filled box gets a visible border", () => {
  const block = css.match(/@media\s*\(prefers-contrast:\s*more\)\s*\{([\s\S]*?)\n\}/)[1];
  for (const sel of [".case", ".off__item", ".numbers", ".tags li"]) assert.ok(block.includes(sel), sel);
});

test("long unbreakable words (URLs, tags) wrap instead of widening the page", () => {
  assert.match(css, /(^|[}\s])body\s*\{[^}]*overflow-wrap:\s*break-word/m);
  assert.match(css, /\.tags li\s*\{[^}]*overflow-wrap:\s*anywhere/);
});

test("hero glow: decorative, scroll-linked only where supported and wanted, gone when it would hurt", () => {
  assert.match(html, /<div class="hero__glow" aria-hidden="true"><\/div>/);
  // Scroll-driven motion lives inside both gates
  const gated = css.match(/@supports\s*\(animation-timeline:\s*scroll\(\)\)\s*\{[\s\S]*?prefers-reduced-motion:\s*no-preference[\s\S]*?animation-timeline:\s*scroll\(root\)/);
  assert.ok(gated, "animation-timeline: scroll(root) inside @supports + no-preference");
  assert.doesNotMatch(withoutFinePointerBlocks(css).replace(/@supports[\s\S]*$/, ""), /animation-timeline/, "no ungated scroll timeline before the @supports block");
  // Increased contrast removes it; reduced transparency keeps it — it's a background tint, not a
  // see-through surface (Windows users with transparency effects off would otherwise never see it).
  const contrast = css.match(/@media\s*\(prefers-contrast:\s*more\)\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.match(contrast, /\.hero__glow\s*\{[^}]*display:\s*none/);
  const transparency = css.match(/@media\s*\(prefers-reduced-transparency:\s*reduce\)\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.doesNotMatch(transparency, /\.hero__glow/);
});
