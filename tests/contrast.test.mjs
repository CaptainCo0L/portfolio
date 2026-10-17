import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Light tokens come from the first :root block; dark tokens from the :root inside
// @media (prefers-color-scheme: dark), falling back to light for anything not redefined.
const css = readFileSync(new URL("../tokens.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const hexTokens = (block) =>
  Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]]));
const lightBlock = css.match(/^:root\s*\{([\s\S]*?)\n\}/m)?.[1] ?? "";
const darkBlock = css.match(/prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([\s\S]*?)\}/)?.[1] ?? "";
const light = hexTokens(lightBlock);
const dark = { ...light, ...hexTokens(darkBlock) };

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Spec §6. [foreground, background, minimum]
const PAIRS = [
  ["--label", "--bg", 4.5], ["--label", "--surface", 4.5],
  ["--label-2", "--bg", 4.5], ["--label-2", "--surface", 4.5],
  ["--link", "--bg", 4.5], ["--link", "--surface", 4.5],
  ["--accent", "--bg", 4.5],
  ["--on-accent", "--button", 4.5], ["--on-accent", "--button-hover", 4.5],
  ["--signal-base", "--bg", 3], ["--accent", "--bg", 3], ["--focus", "--bg", 3],
];

for (const [mode, tokens] of [["light", light], ["dark", dark]]) {
  for (const [fg, bg, min] of PAIRS) {
    test(`${mode}: ${fg} on ${bg} ≥ ${min}:1`, () => {
      assert.ok(tokens[fg], `${fg} missing in ${mode}`);
      assert.ok(tokens[bg], `${bg} missing in ${mode}`);
      const r = ratio(tokens[fg], tokens[bg]);
      assert.ok(r >= min, `${fg} ${tokens[fg]} on ${bg} ${tokens[bg]} is ${r.toFixed(2)}:1`);
    });
  }
}

// The page backdrop: --accent at --glow-strength over --bg is the brightest/darkest spot any text
// on the page can sit on. Every text colour must still clear 4.5:1 there; accent marks 3:1.
const pct = (block) => Number(block.match(/--glow-strength:\s*(\d+(?:\.\d+)?)%/)?.[1]);
const glowStrength = { light: pct(lightBlock), dark: pct(darkBlock) || pct(lightBlock) };
const mix = (fg, bg, a) => "#" + [1, 3, 5].map((i) => {
  const f = parseInt(fg.slice(i, i + 2), 16), b = parseInt(bg.slice(i, i + 2), 16);
  return Math.round(f * a + b * (1 - a)).toString(16).padStart(2, "0");
}).join("");

for (const [mode, tokens] of [["light", light], ["dark", dark]]) {
  for (const fg of ["--label", "--label-2", "--link"]) {
    test(`${mode}: ${fg} over the backdrop glow ≥ 4.5:1`, () => {
      const a = glowStrength[mode] / 100;
      assert.ok(a > 0 && a <= 1, `--glow-strength missing for ${mode}`);
      const glow = mix(tokens["--accent"], tokens["--bg"], a);
      const r = ratio(tokens[fg], glow);
      assert.ok(r >= 4.5, `${fg} on glow ${glow} is ${r.toFixed(2)}:1`);
    });
  }
}

for (const [mode, tokens] of [["light", light], ["dark", dark]]) {
  test(`${mode}: --accent marks over the backdrop glow ≥ 3:1 (non-text)`, () => {
    const glow = mix(tokens["--accent"], tokens["--bg"], glowStrength[mode] / 100);
    assert.ok(ratio(tokens["--accent"], glow) >= 3);
  });
}
