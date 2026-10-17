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

// The aurora backdrop: three layers (--accent, --aurora-2, --aurora-3), each at its strength
// token. They drift, so assume the worst case — all three peaks stacked on one spot — and require
// every text colour to clear 4.5:1 there, accent marks 3:1.
const strength = (block, name) => Number(block.match(new RegExp(String.raw`${name}:\s*(\d+(?:\.\d+)?)%`))?.[1]);
const LAYERS = [["--accent", "--glow-strength"], ["--aurora-2", "--aurora-2-strength"], ["--aurora-3", "--aurora-3-strength"]];
const mix = (fg, bg, a) => "#" + [1, 3, 5].map((i) => {
  const f = parseInt(fg.slice(i, i + 2), 16), b = parseInt(bg.slice(i, i + 2), 16);
  return Math.round(f * a + b * (1 - a)).toString(16).padStart(2, "0");
}).join("");
function worstCase(mode, tokens) {
  return LAYERS.reduce((under, [color, str]) => {
    const pct = strength(mode === "dark" ? darkBlock : lightBlock, str) || strength(lightBlock, str);
    assert.ok(tokens[color], `${color} missing in ${mode}`);
    assert.ok(pct > 0, `${str} missing in ${mode}`);
    return mix(tokens[color], under, pct / 100);
  }, tokens["--bg"]);
}

for (const [mode, tokens] of [["light", light], ["dark", dark]]) {
  for (const fg of ["--label", "--label-2", "--link"]) {
    test(`${mode}: ${fg} over the stacked aurora ≥ 4.5:1`, () => {
      const glow = worstCase(mode, tokens);
      const r = ratio(tokens[fg], glow);
      assert.ok(r >= 4.5, `${fg} on ${glow} is ${r.toFixed(2)}:1`);
    });
  }
  test(`${mode}: --accent marks over the stacked aurora ≥ 3:1 (non-text)`, () => {
    assert.ok(ratio(tokens["--accent"], worstCase(mode, tokens)) >= 3);
  });
}
