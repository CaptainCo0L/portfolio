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

test("aurora backdrop: decorative, three layers, motion only where supported and wanted", () => {
  assert.match(html, /<body>\s*<div class="backdrop" aria-hidden="true">/);
  for (const n of [1, 2, 3]) assert.match(html, new RegExp(`<div class="aurora-wrap aurora-wrap--${n}"><span class="aurora aurora--${n}"></span></div>`));
  assert.match(css, /\.backdrop\s*\{[^}]*position:\s*fixed[^}]*100lvh/);
  // Every animation of the aurora sits inside the no-preference gate; scroll timelines also inside @supports
  const motion = css.match(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{([\s\S]*?)\n\}\n/)?.[1];
  assert.ok(motion, "a prefers-reduced-motion: no-preference block");
  assert.match(motion, /\.aurora--1\s*\{[^}]*animation:[^;}]*\b41s\b/);
  assert.match(motion, /\.aurora--2\s*\{[^}]*animation:[^;}]*\b53s\b/);
  assert.match(motion, /\.aurora--3\s*\{[^}]*animation:[^;}]*\b67s\b/);
  assert.match(motion, /@supports\s*\(animation-timeline:\s*scroll\(\)\)\s*\{[\s\S]*animation-timeline:\s*scroll\(root\)/);
  const outside = css.replace(motion, "");
  assert.doesNotMatch(outside, /\.aurora[\w-]*\s*\{[^}]*animation(-name)?:\s*(?!none)/, "no aurora animation outside the gate");
  // Pause (WCAG 2.2.2) freezes everything
  assert.match(css, /\.aurora-paused\s+\.aurora[^{]*,\s*\.aurora-paused\s+\.aurora-wrap[^{]*\{[^}]*animation-play-state:\s*paused/);
  // More contrast removes it; reduced transparency keeps it (a tint, not a see-through surface)
  const contrast = css.match(/@media\s*\(prefers-contrast:\s*more\)\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.match(contrast, /\.backdrop[^{]*\{[^}]*display:\s*none/);
  const transparency = css.match(/@media\s*\(prefers-reduced-transparency:\s*reduce\)\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.doesNotMatch(transparency, /\.backdrop|\.aurora/);
});

test("pause toggle: a real button, hidden until JS shows it, saved choice applied before paint", () => {
  assert.match(html, /<button class="motion-toggle" type="button" aria-pressed="false" hidden[ >]/);
  // Lives in the sticky nav, not floating over body text (it covered copy on a 411px Pixel)
  const nav = html.slice(html.indexOf('<header class="nav">'), html.indexOf("</header>"));
  assert.match(nav, /<button class="motion-toggle"[\s\S]*?<span class="sr-only">Pause background<\/span>[\s\S]*?<\/button>\s*<a class="btn btn--sm nav__cta"/);
  assert.doesNotMatch(css.match(/\.motion-toggle\s*\{[^}]*\}/)[0], /position:\s*fixed/);
  const head = html.slice(0, html.indexOf("</head>"));
  assert.match(head, /localStorage\.getItem\("aurora"\)\s*===\s*"paused"/);
  assert.match(head, /classList\.add\("aurora-paused"\)/);
});

test("turning-point captions use the link blue (accent text fails 4.5:1 on the glow)", () => {
  assert.match(css, /\.stage__turn\s*\{[^}]*color:\s*var\(--link\)/);
});
