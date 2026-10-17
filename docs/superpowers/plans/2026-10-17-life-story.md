# Life-Story Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the hiring page into a reflective, one-page summary of the owner's life in stages: a vertical timeline, a "By the numbers" popover and an "Off the clock" section. It keeps the Apple light/dark theme, the prerender build, and the recruiter essentials.

**Architecture:** Same as the theme plan. `data.js` holds the content, `build/render.mjs` turns it into HTML, and `build/build.mjs` writes it into the marker regions of `index.html` with content-hashed asset URLs. `app.js` is enhancement only. The popover uses the native Popover API, so it works without JS. Illustrations are inline SVG strings inlined at build time.

**Tech Stack:** Plain HTML/CSS/JS; Node ≥ 22 built-ins (`node:test`, `vm`, `crypto`); `scripts/shoot.mjs` (CDP screenshots) and `scripts/probe.mjs` (CDP behaviour checks); GitHub Actions `check-build`.

**Spec:** `docs/superpowers/specs/2026-10-17-life-story-design.md` (design) and `docs/superpowers/specs/2026-10-17-life-story-content.md` (all copy, authoritative). The theme spec `2026-10-17-apple-theme-design.md` stays in force for tokens, type, the mobile layer, accessibility and the build.

**Supersedes:** Tasks 9–13 of `docs/superpowers/plans/2026-10-17-apple-theme.md`. Its Tasks 1–8 are done (`3e66365..f9a0883`).

## Global Constraints

- No runtime dependencies, no web fonts, no image files except `assets/og.png` and the CV PDF.
- **Content:** words come only from the content doc. Never add a fact that isn't there. No family, no location finer than "Kochi, Kerala", no photos of the owner.
- Every `:hover` rule lives inside `@media (hover: hover) and (pointer: fine)`. Motion is only what design-spec §5 lists, with the existing `--ease-out` and `--dur-*` tokens and never `transition: all`.
- Hidden-until-JS states stay scoped under `.js` (existing test). Asset URLs stay hashed, and `node build/build.mjs --check` stays green at every commit.
- Tests: `node --test "tests/*.test.mjs"`. Screenshots: `node scripts/shoot.mjs --url http://localhost:8000/ --out qa/<name>`. Behaviour checks: `node scripts/probe.mjs --width <w> <check.js>` (the check file sits in the scratchpad; exit 1 on `"ok": false`).
- Commit prefixes `content:`, `build:`, `theme:`, `qa:`, `docs:`, each ending with `Claude-Session: https://claude.ai/code/session_011pPay4Lp8fEXSRTaZkZwJf`.
- Ask the owner before merging or pushing.

## Review Focus

1. **Popover on touch and keyboard.** There's no hover on phones. Tap must open it and tapping outside must close it, and Enter, Space and Esc must work, all without JS. The hover enhancement must never close a popover the user opened by click. Tests in Tasks 2 and 5.
2. **Content drift.** A render or CSS change must not silently drop or alter owner-approved copy. Tested by comparing rendered text against `data.js` in Task 2.
3. **Long-ish copy at 375.** Stage paragraphs, the `next` stage without years, and an illustration grid with odd counts. Checked in Task 4 and with `break-ui` in Task 8.
4. **Turning-point colour isn't the only signal.** Blue vs grey must be backed by the "Turning point" text (WCAG 1.4.1). Test in Task 2.
5. **Popover off-screen** at 375 when the chip sits near the right edge. Clamped by JS; with no JS it's the UA-centred default. Probe in Task 5.

---

### Task 1: Content model in `data.js`

**Files:**
- Modify: `data.js` (reshape per design-spec §8, copy verbatim from the content doc)
- Test: `tests/data.test.mjs` (create)

**Interfaces:**
- Produces: `DATA.stages[]` `{ id, years, title, place, turn?, future?, body: string[], tags?, numbers?, link? }` with ids `college, postgrad, aspire, pause, security, next`; `DATA.numbers[]` `{ value, unit, label }`; `DATA.offClock[]` `{ icon, title, text }` with icons `football, controller, server, guitar, planet, dumbbell, mountain, speech`; `DATA.headline`, `DATA.lede`, `DATA.contactHeading = "Say hello."`, `DATA.contact.location = "Kochi, Kerala, India"`. `phases` and `stats` removed.

- [ ] **Step 1: Write failing tests** in `tests/data.test.mjs` (load with `loadData()`):
  - stage ids in order are exactly the six above; `aspire` and `security` have `turn: true`; only `next` has `future: true`; only `aspire` has `numbers: true`.
  - `numbers` has 4 entries, including `{ value: "<2%" }`.
  - `offClock` has 8 entries whose `icon` values are the eight names, each used once.
  - **Privacy guard:** a JSON dump of DATA contains none of `/\b(mother|father|brother|sister|wife|husband|family)\b/i`, and no `phone` field is set.
  - `DATA.phases` and `DATA.stats` are `undefined`.
- [ ] **Step 2:** Run the tests. Expected: FAIL (`stages` undefined).
- [ ] **Step 3:** Rewrite `data.js`: copy from the content doc verbatim, with `[inferred]` markers removed but their text kept, as the owner approved the draft. Keep the file's header comment style and the "add the next one like this" examples.
- [ ] **Step 4:** Run the tests. Expected: `data.test.mjs` passes. `render`/`build` tests will fail until Task 2, so don't commit yet; this task's commit lands together with Task 2.

### Task 2: Render the story, popover and off-the-clock; remove the band

**Files:**
- Modify: `build/render.mjs`, `index.html` (markers + section shells), `tests/render.test.mjs`, `tests/build.test.mjs`
- Create: `build/illustrations.mjs`

**Interfaces:**
- Consumes: Task 1 data shape.
- Produces:
  - `renderStory(stages, numbers): string`, the `<li class="stage …">` items described in design-spec §3.1–3.3. Classes: `is-turn`, `is-after-turn` (first turn onward), `is-future`. `id="stage-<id>"`, `tabindex="-1"`. Turning points carry the text `Turning point`. The Aspire stage holds `<button class="chip" type="button" popovertarget="numbers">By the numbers</button>` and `<div id="numbers" class="numbers" popover><dl>…</dl></div>`.
  - `renderNumbers(numbers)`, the `<dl>` items (old `renderStats` markup, renamed).
  - `renderOffClock(items)`, `<li class="off__item">${ILLUSTRATIONS[icon]}<h3>…</h3><p>…</p></li>`.
  - `ILLUSTRATIONS: Record<string, string>` in `build/illustrations.mjs`: eight `<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">…</svg>` strings. Accent parts carry `class="accent"`.
  - `renderSections` keys become: `head, nav-status, hero, story, off-clock, projects, fieldwork-note, skills, education, certs, contact, foot`. `band`, `stats` and `phases` are gone.
  - `renderHead` uses design-spec §6 copy and adds `knowsLanguage`.

- [ ] **Step 1: Write failing tests** (replace the band/phase/stat tests; keep escape, projects, contact-meta, head-injection, footer-year):
  - `renderStory` gives 6 `<li class="stage`; exactly 2 `is-turn`, each also containing `Turning point` (**Review Focus 4**); `is-after-turn` on aspire, pause, security, next and not on college or postgrad; `is-future` only on next; one `popovertarget="numbers"` and one `id="numbers"` with a `popover` attribute.
  - **Review Focus 1 (markup half):** the chip is a `<button type="button">`, and the popover element is a sibling inside the same stage, not inside the button.
  - **Review Focus 2:** every `stages[].body` paragraph and every `offClock[].text` appears escaped in the output, unchanged.
  - `renderNumbers` escapes `<2%`.
  - `renderOffClock` gives 8 items, each containing `<svg` with `aria-hidden="true"`; `ILLUSTRATIONS` has exactly the eight keys and none contains `<script` or `on\w+=`.
  - `renderHead`: the title is `Aswin Sunil — The story so far · QA to security`, the description is ≤ 160 chars, JSON-LD `addressLocality` is `Kochi`, and `knowsLanguage` has 4 entries.
  - `renderSections` keys equal the new list.
  - In `tests/build.test.mjs`, the no-JS content test asserts the headline, every stage title, every off-clock title and every project title.
- [ ] **Step 2:** Run the tests. Expected: FAIL on the new functions.
- [ ] **Step 3:** Implement. Draw the eight illustrations as clean monoline glyphs on a 24-unit grid (design-spec §4). In `index.html`: remove the `<figure class="band">` and `<dl class="readout">`, rename `#record` to `#story` (heading "The story so far." and a one-line intro from the content doc), add the `#off-the-clock` section (heading "Off the clock."), update the nav links and order per design-spec §2, and update the markers.
- [ ] **Step 4:** Run `node build/build.mjs`, then the tests, then `--check`. Expected: all green.
- [ ] **Step 5:** Commit Tasks 1 and 2 together (`content: life-story data model` + `build: story timeline, numbers popover, off-the-clock`). Two commits are fine if the tree is green at each.

### Task 3: `app.js` for the new page

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `.stage` items, `#numbers` popover, nav links to `#story`, `#off-the-clock`, `#fieldwork`, `#toolbox`.
- Produces: `.is-current` on the stage in view; popover hover intent plus positioning; the nav spy covers the new sections. The band code is deleted.

- [ ] **Step 1:** Write `qa`-scratch probe checks (behaviour is browser-only, so probes stand in for unit tests). Run them first and watch them fail:
  - (a) Scroll each stage to centre; expect `.is-current` on that stage only.
  - (b) **Review Focus 1:** click the chip, expect `#numbers.matches(":popover-open")`. Dispatch `pointerleave` on the chip, wait 300 ms, expect it *still open* (opened by click). Press Esc, expect it closed.
  - (c) Hover: dispatch `pointerenter` on the chip with `pointerType: "mouse"`, wait 200 ms, expect open; `pointerleave` from both, wait 300 ms, expect closed.
  - (d) **Review Focus 5:** at width 375, open it and expect the popover rect to sit inside `[16, innerWidth-16]`.
  - (e) The nav spy marks `#story` and `#off-the-clock`.
- [ ] **Step 2:** Implement. Hover intent only when `matchMedia("(hover: hover) and (pointer: fine)")` matches. Track `openedBy` (`"hover"` | `"click"`, from `pointerdown` on the chip) and auto-close only hover-opened. Position on the `toggle` event (`newState === "open"`): `position: fixed`, top = chip bottom + 8, left = clamp(chip left, 16, innerWidth − width − 16). Keep the IIFE style and the `reduceMotion` const.
- [ ] **Step 3:** Run the probes. Expected: all `ok: true`. Run tests and `--check`.
- [ ] **Step 4:** Commit.

### Task 4: Static styles: timeline, popover, off-the-clock; remove band CSS

**Files:**
- Modify: `styles.css`

- [ ] **Step 1:** Delete the signal-band and readout CSS, and the `.record` rules the story replaces. Implement design-spec §3.1 (rail, nodes, `is-turn`, `is-after-turn`, `is-future` dashed, `is-current`), §3.2 (`.chip`, `.numbers` look; static, no transitions), and §4 (grid, items, illustration colours: stroke `--label-2`, `.accent` stroke `--accent`). The phone layout follows §3.1.
- [ ] **Step 2:** Rebuild, run tests and `--check`, then shoot to `qa/ls4`. Expected: the line is grey through college and postgrad and blue from Aspire on; the next stage is dashed; the illustrations read in light and dark. At 375 there's no overflow (the script prints any) and stage text never collides with the rail. **Review Focus 3:** check the 375 full shot.
- [ ] **Step 3:** Commit.

### Task 5: Motion (`animate`, `apple-design`)

**Files:**
- Modify: `styles.css`, `app.js` (only if a motion needs a class)

- [ ] **Step 1:** Invoke `animate`. For each design-spec §5 row, confirm the recorded gate result, then implement it exactly: press feedback, hover colours, the popover's `@starting-style` origin-aware scale-in and exit, node colour transition, heading reveal (400ms / 8px), body theme transition, and the reduced-motion block. Grep for `transition: all`, `ease-in[^-]`, and `.reveal` on anything but `.head`. Expected: none.
- [ ] **Step 2:** Probes: popover open, then after 50 ms `getComputedStyle(numbers).opacity` is < 1 (it's animating), and after 300 ms it's 1. Under `--media prefers-reduced-motion=reduce`, the transform at 50 ms is `none`. Re-run the Task 3 probes. Expected: still green (motion didn't break behaviour).
- [ ] **Step 3: Feel-check.** In DevTools → Animations, replay the popover open and close at 25% and 10% speed: it should grow from the chip corner, not the centre. Record notes in the commit message.
- [ ] **Step 4:** Commit.

### Task 6: Mobile platform layer (`mobile-native`)

Theme-spec §5b exactly, plus `.chip` among the controls (`touch-action: manipulation`, `user-select: none`). Grep for ungated `:hover`, `user-scalable`, `maximum-scale`, and `user-select` on `body`. Expected: none. Probe at 375 and at 812×375 landscape: no horizontal scroll. Then a **real-phone checklist for the owner** (LAN IP, `python -m http.server 8000 --bind 0.0.0.0`):
- no tap flash
- no stuck hover
- the popover opens and closes by tap
- long-press on the chip doesn't select its label
- notch clearance in landscape
- status bar colour in both schemes

Results go into the after-audit. Commit.

### Task 7: Head, OG image

**Files:**
- Create: `build/og-card.html`, `assets/og.png`

- [ ] **Step 1:** `og-card.html` at 1200×630, light theme, system font: name, headline "Not a straight line. A few good turns.", and the two-colour line motif (grey, then blue). Render it with `node scripts/shoot.mjs`-style CDP capture, or headless `--screenshot` at that size, since it's ≥ 504px so the window-size flag works. Expected: PNG 1200×630, < 300 KB.
- [ ] **Step 2:** Rebuild; run tests and `--check`; `JSON.parse` the JSON-LD from the built `index.html`. Commit.

### Task 8: Verification

As theme-plan Task 12, adapted:
- **Smoke:** probes for zero console errors and every nav link and the "See the fieldwork" link reaching its target; CV PDF returns 200.
- **Visual:** `shoot.mjs` to `qa/final` against `qa/before`.
- **Accessibility:** axe-core via probe injection (cdnjs `axe-core/4.10.2`) in light and dark; expect 0 serious/critical. A keyboard walk via probe (Tab order, focus visible); reduced-motion, transparency and contrast emulation.
- **`break-ui`:** a scratch `data.js` with a 200-word stage, a 60-character unbroken tag, nine off-clock items and a stage with no tags, built to a scratch page and shot at 375.
- **Audits:** ECC `design-system` Mode 2/3 after-score versus 59/100; `improve-animations quick` and `find-animation-opportunities` read-only (no HIGH findings).
- **Evidence:** the ECC `frontend-design-direction` evidence JSON plus `check-evidence.js`.

Write `docs/qa/2026-10-17-after-audit.md` with a SHIP / SHIP WITH FIXES / DO NOT SHIP verdict. Commit.

### Task 9: Docs and ship

- [ ] README: the new data shape (stages, numbers, offClock), how to add a stage, the edit loop (edit `data.js` → `node build/build.mjs` → commit), and tests/CI. Vault note + `log.md` line. Close the theme plan's ledger as superseded.
- [ ] `node --test "tests/*.test.mjs"` and `node build/build.mjs --check`. Expected: green.
- [ ] **Ask the owner** before merging or pushing. On yes: `git merge-base --is-ancestor origin/main HEAD`, then `git push origin HEAD:main`. Poll the live URL for `The story so far` (with a cache-buster) until it's present, check the CI run, then check the LinkedIn Post Inspector preview.

### Task 10: Hero backdrop that reacts to scroll (owner request, after review)

**Files:** `index.html` (glow element in `.hero`), `tokens.css` (`--glow-strength`), `styles.css`, `tests/contrast.test.mjs`, `tests/mobile.test.mjs`, `tests/build.test.mjs`

Design-spec §5 row "Hero backdrop": a soft two-colour glow (grey → blue, the timeline's colours) behind the hero
only, extending up behind the translucent nav. Scroll-linked (`animation-timeline: scroll(root)`, range 0–80vh,
`linear` — constant motion tied to input): opacity 1→0, `translateY(-12%) scale(1.08)`. `transform`/`opacity`
only (no animated blur). Pure CSS inside `@supports (animation-timeline: scroll())` and
`@media (prefers-reduced-motion: no-preference)`; unsupported browsers and reduced motion get the static glow;
increased contrast removes it (reduced transparency keeps it — see spec).

- [ ] Tests first: glow-composite contrast (`--label`, `--label-2`, `--link` over `--accent` at `--glow-strength`
  on `--bg` ≥ 4.5 in both modes); glow element `aria-hidden`; scroll animation gated by `@supports` + no-preference;
  glow hidden under increased contrast, kept under reduced transparency.
- [ ] Implement; probe: opacity 1 at top, < 0.5 at 60vh, static under reduced motion; no horizontal overflow; axe
  clean with the glow; screenshots light/dark.
- [ ] Commit.

### Task 11: Glow as a fixed full-page backdrop (owner request: "let the glow stay as static bg, and let everything else scroll")

Replaces Task 10's hero-only, scroll-faded glow. One `position: fixed` layer behind the whole page (`height: 100lvh`
so mobile URL-bar changes don't resize it), no animation. Contrast now applies page-wide: `.stage__turn` text moves
from `--accent` to `--link` (accent text on the glow is ~4.2:1); accent stays for non-text marks (≥ 3:1 on glow).
More contrast: backdrop removed. Tests first; browser check updated to assert it stays fixed while content scrolls.

### Task 12: Aurora backdrop — ambient drift + scroll reaction (owner request: "move like northern lights, and react when scrolling")

Owner chose this after the trade-off was explained (always-on background motion behind text). Safeguards are the spec:
- Three curtain layers (blue `--accent`, teal `--aurora-2`, indigo `--aurora-3`) inside the fixed `.backdrop`.
- **Ambient drift:** CSS keyframes on `.aurora` (transform only), 41s / 53s / 67s (co-prime, never sync; far from the
  ~5s vestibular-risk loop), `ease-in-out` alternate (on-screen movement), small amplitude.
- **Scroll reaction:** `.aurora-wrap` layers with `animation-timeline: scroll(root)` over the whole page (linear):
  different `translateY` depths (parallax) and opacity balance (blue top → teal/indigo lower). Gated by
  `@supports (animation-timeline: scroll())`.
- **Reduced motion:** no animation at all (static composition). **WCAG 2.2.2:** a "Pause background" toggle
  (`button.motion-toggle`, `aria-pressed`, persisted in `localStorage`, applied pre-paint from the inline head script)
  sets `html.aurora-paused` → `animation-play-state: paused` on every aurora animation. The toggle is shown only with
  JS and without reduced motion. **More contrast:** backdrop removed.
- **Contrast:** worst case = all three layers' peaks stacked over `--bg`; every text colour ≥ 4.5:1 on it, accent marks ≥ 3:1.
- Tests first; browser check `tests/browser/aurora.js`: drifts over time, reacts to scroll, pause freezes both, reduced
  motion has no animations and no toggle, no overflow; axe + keyboard walk (toggle is the last stop).
