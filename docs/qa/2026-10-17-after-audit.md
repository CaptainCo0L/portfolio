# After audit — life-story redesign (branch `theme-apple`)

Compared with `2026-10-17-before-audit.md` (old "Baseline & Anomaly" hiring page, 59/100).
Captures: `node scripts/shoot.mjs` (CDP emulation, cache off) at 375×812, 768×1024, 1440×900, light + dark;
behaviour: `node scripts/probe.mjs` checks (local only, `qa/` is git-ignored).

## Verdict: **SHIP**, with one check only the owner can do (real phone, below)

## Smoke (ECC `browser-qa` phase 1–2)
- Console errors / uncaught exceptions / 4xx-5xx: **0** (probe collects all three). A `/favicon.ico` 404 was found
  and fixed with an inline SVG icon.
- All 7 in-page anchors resolve; CV PDF returns 200; both external links carry `rel=noopener`.
- Popover: click/tap opens, Esc (real key via CDP) closes, outside-click closes (native); hover opens after 120ms
  and closes 200ms after leaving; a hover-opened popover is pinned by a click; it's placed 8px under the chip,
  clamped 16px inside the viewport at 375.

## Visual (phase 3)
- No horizontal scroll at any target viewport, plus 812×375 landscape.
- Timeline: grey through College/Postgrad, blue from Aspire, dashed into Next; "Turning point" in words.
- Fixed during verification: leftover hero bottom padding from the removed trace band (~170px gap).
- Baseline comparison is against the old design, so it's a before/after, not a regression diff (expected).

## Accessibility (ECC `accessibility`, phase 4)
- axe-core 4.10.2, popover open, wcag2a/2aa/21aa/22aa + best-practice: **0 serious/critical** at 1440 and 375,
  light and dark. Fixed during verification: tag text was 4.49:1 on its tinted pill (light) — pills now use
  `--surface` / `--bg`, pairs already enforced by `tests/contrast.test.mjs`.
- Keyboard: real Tab walk, 14 stops in reading order (skip link → nav → hero → chip → story link → contact), every
  stop shows the focus ring; no positive tabindex. Targets ≥ 24×24.
- Preferences: reduced motion (fades only, sampled), reduced transparency (solid nav), increased contrast
  (secondary text → primary, borders on cards/popover/chip/tags — the off-the-clock cards and popover were
  missing their borders; fixed).
- axe covers ~30–40% of WCAG; a screen-reader pass (VoiceOver/NVDA) has **not** been done.

## Worst-case data (`break-ui`)
200-word stage, 60-character unbreakable tags, a URL in a card title, a long place line, nine off-the-clock items, an
unknown illustration name, a stage with no tags. **Broke:** page widened to 733px at 375 (text overflowing its boxes —
invisible to a box-based scan). **Fix:** `overflow-wrap: break-word` on body, `anywhere` on tags. Re-run: fits at 375.

## Design system re-score (ECC `design-system` Mode 2)

| # | Dimension | Before | After | Note |
|---|---|---|---|---|
| 1 | Colour consistency | 7 | 9 | Tokens only in the page; raw hexes only in `build/og-card.html` (a standalone render source). |
| 2 | Typography hierarchy | 7 | 9 | Per-level tracking/leading; system fonts; no render-blocking font request. |
| 3 | Spacing rhythm | 8 | 9 | 4pt scale throughout; hero gap fixed. |
| 4 | Component consistency | 7 | 8 | Buttons, chip, tags share the pill language; cards share radius/surface. |
| 5 | Responsive | 5 | 9 | Phone nav row, safe-area gutters, worst-case content fits. |
| 6 | Dark mode | 0 | 9 | Complete, contrast-tested, per-scheme `theme-color`. |
| 7 | Animation | 5 | 9 | Every motion in the spec inventory with a purpose; reduced-motion variants. |
| 8 | Accessibility | 6 | 9 | See above; −1 for no screen-reader pass yet. |
| 9 | Information density | 8 | 8 | Longer page by design (story first); recruiter sections one scroll away. |
| 10 | Polish | 6 | 8 | Press feedback, favicon, preview card; −2 until checked on a real phone. |

**Total: 87 / 100** (was 59).

**AI-slop check (Mode 3):** no gratuitous gradients (the only gradient draws the dashed "future" line), no purple→blue,
translucency only where content scrolls under the nav, no generic centred hero. "Sans-serif stack with no personality"
— deliberate: system fonts per `apple-design` and the owner's chosen direction; personality comes from the timeline.

## Motion re-audit (`improve-animations quick`, read-only)
- Theme-spec findings #1–#3 (stale trace delays, overridden filter transition, highlight snap) — **gone with the
  band/record**; #4 (reveal on read content) — reveals only on section headings; #5 (weak press) — `scale(.97)` on
  buttons and chip; #6 (ungated hover) — enforced by `tests/mobile.test.mjs`.
- New HIGH findings: **none**. LOW: `transition-behavior: allow-discrete` exit animation is Chromium/Safari 17.4+;
  elsewhere the popover just disappears (acceptable degradation).
- Sampled popover curve: opacity 0→0.86 in 57ms, settled ~150ms; exit ~100ms.

## Opportunities (`find-animation-opportunities`, read-only)
Nothing new survives the gate. Re-considered and rejected again: scroll-drawn timeline line (function — read
alongside), stage entrance stagger (function), illustration idle motion (purpose), popover number ticker (function).
Verdict: the page needs no more motion.

## Evidence gate (ECC `frontend-design-direction`)
`qa/final/evidence.json` → `check-evidence.js`: *"Evidence record complete"*. (The checker validates the record,
not the truth of the observations — those are the probes and screenshots above.)

## Owner's real-phone checklist (pending — can't be verified from a desktop)
Serve on the LAN: `python -m http.server 8000 --bind 0.0.0.0`, find the PC's IP with `ipconfig`, open
`http://<ip>:8000/` on the phone.
- [ ] No grey flash when tapping a button, the chip, or a nav link
- [ ] No hover state stuck after a tap
- [ ] "By the numbers" opens and closes by tap; tapping outside closes it
- [ ] Long-press on a button or the chip doesn't select its text
- [ ] Landscape on a notched iPhone: text clears the notch
- [ ] Status bar colour matches the page in light and dark
- [ ] Press feedback feels immediate; popover feels like it grows from the chip
