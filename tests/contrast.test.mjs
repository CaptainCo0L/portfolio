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
