# Apple Light + Dark Theme (Prerendered) Implementation Plan

> **Status 2026-10-17:** Tasks 1–8 done (`3e66365..f9a0883`). Tasks 9–13 **superseded** by `2026-10-17-life-story.md` after the owner repositioned the site as a life-stages summary.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-theme the portfolio to an Apple-style light + dark design and prerender all content into `index.html`, so recruiters, link previews and scrapers see the full page.

**Architecture:** `data.js` stays the only content source. A dependency-free Node script (`build/build.mjs`) renders it into marker regions of `index.html`, which is committed and served by GitHub Pages as-is. `app.js` shrinks to progressive enhancement. The theme is two token sets in `tokens.css`, switched by `prefers-color-scheme`.

**Tech Stack:** Plain HTML/CSS/JS; Node ≥ 22 built-ins only (`node:test`, `node:vm`, `node:fs`); headless Chrome for screenshots; claude-in-chrome for interactive QA; GitHub Actions for the staleness check.

**Spec:** `docs/superpowers/specs/2026-10-17-apple-theme-design.md`. All token values, type values, copy and component rules come from it. Read it before any task.

**Skills to follow:** invoke via the Skill tool: `apple-design`, `animate` (Task 9), `animation-vocabulary` (name
motions in commits and docs), `find-animation-opportunities` + `improve-animations` (re-run read-only in Task 12; their
pre-change findings are already folded into spec §5), `mobile-native` (Task 10), `break-ui` (Task 12). ECC is **not
enabled**, so read its skill files from disk under `C:\Users\aswin\.claude\plugins\cache\ecc\ecc\2.2.3\skills\`:
`design-system`, `frontend-design-direction`, `accessibility`, `seo`, `browser-qa`.

## Global Constraints

- No runtime dependencies, no npm packages, no web fonts. The page loads only `styles.css` (which imports `tokens.css`) and `app.js`.
- Node scripts use built-ins only; `.mjs` files; run with `node` ≥ 22.
- `data.js` keeps its current shape (`const DATA = {…}`); editing content never requires touching HTML.
- Generated `index.html` is written with LF line endings.
- WCAG 2.2 AA: text ≥ 4.5:1, non-text ≥ 3:1, targets ≥ 24×24 CSS px, visible focus.
- Every `:hover` rule lives inside `@media (hover: hover) and (pointer: fine)`.
- Motion: only what spec §5's inventory lists. `transform`/`opacity` (plus colour/filter on small elements), never `transition: all`, existing `--ease-out` token only.
- Tasks 6–8 are static styling. They add **no** transitions or animations; motion is Task 9.
- Target viewports: `375x812`, `768x1024`, `1440x900`, each light and dark.
- Commit messages: lowercase prefix like the repo (`theme:`, `build:`, `qa:`, `docs:`), ending with the line
  `Claude-Session: https://claude.ai/code/session_011pPay4Lp8fEXSRTaZkZwJf`.
- All work on branch `theme-apple`. `redesign-baseline-anomaly` is not modified.

## Review Focus

1. **Data with HTML metacharacters.** `"<2%"` already exists in `stats`. It must render as text in HTML and must not break the JSON-LD `<script>` (`</script>` in any string). Tests in Task 2.
2. **CRLF on Windows.** `data.js` is CRLF locally (vault note). `--check` must not report stale just because of line endings, and the build must emit LF. Test in Task 3.
3. **No JavaScript.** A scraper or no-JS visitor must see every section with full opacity, including the trace bars. Tests in Tasks 3 and 4.
4. **Two phases on the same trace slot at the right edge** (`mark: 1`). Today's de-dup does `slot += 1` and can push a flag past the last slot, so it never renders. Test in Task 2.
5. **Segoe UI fallback.** On Windows (this machine, and many recruiters), SF-tuned negative tracking may look cramped at hero size. Checked on screenshots in Task 6.

---

### Task 1: Baseline audit of the current theme

**Files:**
- Create: `scripts/shoot.ps1`, `docs/qa/2026-10-17-before-audit.md`
- Modify: `.gitignore` (create if missing): add `qa/`

**Interfaces:**
- Produces: `scripts/shoot.ps1 -Url <string> -Out <dir>`, which writes `<Out>/<w>x<h>-<light|dark>.png` (viewport) and `<Out>/<w>x<h>-<light|dark>-full.png` (height 7000) for the three target viewports. Also `qa/before/dom.html`, the JS-rendered DOM used for the parity check in Task 4.

- [ ] **Step 1:** Write `scripts/shoot.ps1`. For each viewport and each scheme, run
  `& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --hide-scrollbars --virtual-time-budget=4000 --window-size=W,H --screenshot=<file> <Url>`. Dark adds `--force-dark-mode --blink-settings=preferredColorScheme=0`.
- [ ] **Step 2:** Start the server in the background: `python -m http.server 8000` (repo root).
- [ ] **Step 3:** Run `./scripts/shoot.ps1 -Url http://localhost:8000/ -Out qa/before`. Expected: 12 PNGs. The current theme has no dark mode, so light and dark should look identical. Then make a throwaway page with `@media (prefers-color-scheme: dark){body{background:red}}`, shoot it dark, and confirm it comes out red. That proves the dark flag works. If it doesn't, change the flags until it does.
- [ ] **Step 4:** Dump the DOM: `chrome.exe --headless=new --virtual-time-budget=4000 --dump-dom http://localhost:8000/ > qa/before/dom.html`. Expected: the file contains `Three years reading the baseline`.
- [ ] **Step 5:** Follow ECC `design-system` Mode 2 (10-dimension audit) and Mode 3 (slop check) against the screenshots and `styles.css`. Write scores with `file:line` evidence to `docs/qa/2026-10-17-before-audit.md`.
- [ ] **Step 6:** Commit `scripts/shoot.ps1`, `.gitignore`, and the audit doc (`qa/` stays ignored).

### Task 2: Render functions

**Files:**
- Create: `build/render.mjs`, `tests/render.test.mjs`

**Interfaces:**
- Produces (all return HTML strings, all text escaped):
  `esc(value: unknown): string` ·
  `renderStats(stats)` (one `<div><dt>…<small>unit</small></dt><dd>…</dd></div>` per stat) ·
  `renderPhases(phases)` (`<li class="[is-flagged]" id="event-{i}" tabindex="-1">`, **no `reveal` class** (spec §5), inner markup as current `app.js:39-50`) ·
  `renderBand(phases, slots = 168)` (ticks/flag buttons as current `app.js:57-94`, `--d` = `i * 2.5` ms, no `band--draw` class) ·
  `renderProjects(projects)` (as current `app.js:119-129` minus the `reveal` class; write-up link only when `link` is non-empty) ·
  `renderSkills(skills)` · `renderList(items: string[])` ·
  `renderContactMeta(contact)` (`email · location (tz)[ · phone]`) ·
  `renderHead(data, site: { url: string, ogImage: string })` (spec §7 head tags + JSON-LD) ·
  `renderSections(data, site): Record<string, string>`, keyed by marker names:
  `head, nav-status, hero, stats, band, phases, projects, fieldwork-note, skills, education, certs, contact, foot`.

- [ ] **Step 1: Write failing tests** in `tests/render.test.mjs` (`node:test` + `node:assert/strict`):
  - `esc` escapes `& < > " '`.
  - `renderStats([{value:"<2%",unit:"",label:"defect leakage rate"}])` includes `&lt;2%` and no raw `<2%`.
  - `renderPhases` gives `id="event-0"`, `tabindex="-1"` and `is-flagged` exactly on `flag: true` entries, and no `reveal`. Same "no `reveal`" check for `renderProjects`.
  - `renderBand(DATA.phases)` gives exactly 168 children: `phases.length` `.flagbtn` buttons and the rest `.tick` spans with `aria-hidden="true"`.
  - **Review Focus 4:** `renderBand([{mark:1,flag:true,year:"A",title:"a"},{mark:1,flag:true,year:"B",title:"b"}], 168)` contains 2 buttons and 168 children.
  - `renderProjects([{…, link:""}])` has no `Read the write-up`; with `link:"https://x"` it has one, with `rel="noopener"`.
  - `renderContactMeta` without `phone` contains no trailing ` · `.
  - **Review Focus 1:** `renderHead` with a lede containing `</script><b>` produces JSON-LD whose text has no literal `</script` inside the JSON (`<` escaped as `\u003c`), and `JSON.parse` of the script body round-trips the lede.
  - `renderHead` includes `og:image` content `https://captainco0l.github.io/portfolio/assets/og.png` and `rel="canonical"`.
- [ ] **Step 2:** Run `node --test tests/`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement `build/render.mjs`. Port markup from `app.js` verbatim except as the interfaces say. Band de-dup: if the next slot is taken or past the end, search downward for a free slot. JSON-LD: `JSON.stringify(obj).replace(/</g, "\\u003c")`.
- [ ] **Step 4:** Run `node --test tests/`. Expected: all pass.
- [ ] **Step 5:** Commit.

### Task 3: Build CLI, markers, staleness check, CI

**Files:**
- Create: `build/build.mjs`, `tests/build.test.mjs`, `.github/workflows/check-build.yml`
- Modify: `index.html` (replace JS-filled elements with marker regions)

**Interfaces:**
- Consumes: `renderSections` (Task 2).
- Produces: `loadData(path = "data.js"): object` (evaluate with `vm.runInNewContext(src + "\n;DATA")`) ·
  `applyMarkers(html: string, sections: Record<string,string>): string`. Replaces everything between
  `<!-- @build:NAME -->` and `<!-- @end:NAME -->`. Throws `Error("missing marker: NAME")` / `Error("unknown marker: NAME")`. Output is LF-only.
  CLI: `node build/build.mjs` writes `index.html`; `node build/build.mjs --check` exits 1 with
  `index.html is stale — run: node build/build.mjs` if the output differs after CRLF→LF normalisation.

- [ ] **Step 1: Write failing tests** in `tests/build.test.mjs`:
  - `applyMarkers` replaces content and is idempotent (applying twice gives the same string).
  - Throws on a missing marker and on an unknown marker.
  - **Review Focus 2:** given an input with `\r\n`, the output contains no `\r`. A check run against a CRLF copy of fresh output reports "not stale". Export `isStale(current: string, fresh: string): boolean` for this.
  - **Review Focus 3 (content half):** build the real `index.html` in memory and assert it contains the headline, every `phases[].title`, every `projects[].title`, and `<dt>3<small>yrs</small></dt>`.
- [ ] **Step 2:** Run `node --test tests/`. Expected: FAIL.
- [ ] **Step 3:** Implement `build/build.mjs`. Put the marker pairs in `index.html` where `app.js` used to inject (the `head` marker sits after `<meta name="viewport">`).
- [ ] **Step 4:** Run `node --test tests/ ; node build/build.mjs ; node build/build.mjs --check`. Expected: tests pass, check exits 0. Then edit a `data.js` string without building and confirm `--check` exits 1. Revert the edit.
- [ ] **Step 5:** Write `.github/workflows/check-build.yml`: on `push` and `pull_request`, `actions/checkout@v4`, `actions/setup-node@v4` (node 22), `node --test tests/`, `node build/build.mjs --check`.
- [ ] **Step 6:** Commit, including the generated `index.html`.

### Task 4: `app.js` → enhancement only; works without JS

**Files:**
- Modify: `app.js` (rewrite), `index.html` (head inline script, remove `data.js` script tag and `<noscript>`), `styles.css` (reveal/draw-in selectors only)
- Test: `tests/build.test.mjs` (add)

**Interfaces:**
- Consumes: markup from Task 2 (`#band`, `.flagbtn[data-event]`, `#event-{i}`, `.reveal`).
- Produces: `html.js` class (inline `<script>document.documentElement.classList.add("js")</script>` in `<head>` before the stylesheet). `#foot-year` span that `app.js` fills with the current year (the build writes the build year as fallback).

- [ ] **Step 1: Write failing test (Review Focus 3, CSS half):** read `styles.css` and assert every rule that sets `opacity: 0` or `scaleY(0)` has a selector starting with `.js `.
- [ ] **Step 2:** Run it. Expected: FAIL on `.reveal { opacity: 0 …}` and `.band--draw …`.
- [ ] **Step 3:** Scope the hidden states to `.js` (`.js .reveal`, `.js .band__plot:not(.band--in) .tick/.flagbtn/.flag__label`). Rewrite `app.js` without `DATA`. Keep the IIFE style and `reduceMotion` const. It handles: the draw-in (add `band--in` after two rAFs, or immediately under reduced motion), the flag click (behaviour unchanged for now, Task 8 changes it), reveals (unchanged), and the footer year.
- [ ] **Step 4:** Run `node --test tests/`. Expected: pass.
- [ ] **Step 5: Parity check.** Dump the new DOM as in Task 1 Step 4 to `qa/after-build/dom.html`. Compare `main` textContent with `qa/before/dom.html` using a one-off `node -e` script (whitespace-collapsed). Expected: identical. Then load `http://localhost:8000/` in Chrome with JavaScript disabled (claude-in-chrome or DevTools) and confirm all sections and bars are visible.
- [ ] **Step 6:** Commit. The old theme still renders the same at this point; the only visible difference is that record rows and cards no longer scroll-reveal. That's intentional: the build change and the theme change can be reviewed separately.

### Task 5: Tokens + contrast test

**Files:**
- Modify: `tokens.css` (rewrite to spec §2–3)
- Create: `tests/contrast.test.mjs`

**Interfaces:**
- Produces: every custom property named in spec §2, plus `--font-display/body/mono`, the `--text-*` scale, the spacing scale (unchanged), and the motion tokens. Dark values live in `@media (prefers-color-scheme: dark) { :root {…} }`; `:root` sets `color-scheme: light dark`.

- [ ] **Step 1: Write failing test.** Parse `tokens.css` into `{light, dark}` maps of hex tokens (dark inherits light for tokens it doesn't redefine). Assert the WCAG ratios for every pair in spec §6 (4.5 for text pairs, 3.0 for non-text pairs), in both modes.
- [ ] **Step 2:** Run it. Expected: FAIL (tokens missing).
- [ ] **Step 3:** Write `tokens.css` with the spec values (header comment in the file's existing style).
- [ ] **Step 4:** Run `node --test tests/`. Expected: pass. If a pair fails, stop and report it. Don't adjust a spec colour silently.
- [ ] **Step 5:** Commit (the page will look broken until Task 6, which is fine on the branch).

### Task 6: Base, type, buttons, nav (+ transparency/contrast preference queries)

**Files:**
- Modify: `styles.css` (Base, Buttons & links, Nav, Hero text, Accessibility preferences sections), `index.html` (nav: move "Email me" out of `<nav>` as `.btn.btn--sm.nav__cta`; `.mono` → `.caption`; remove the Google Fonts `<link>`s; two `theme-color` metas per scheme; `<meta name="color-scheme" content="light dark">`), `app.js` (current-section observer)

**Interfaces:**
- Consumes: tokens (Task 5).
- Produces: classes `.caption`, `.btn`, `.btn--sm`, `.btn--ghost`, `.quiet`, `.nav__cta`. Nav links carry `aria-current="location"` for the section in view (IntersectionObserver on `#record, #fieldwork, #toolbox`, rootMargin `-45% 0px -50% 0px`).

- [ ] **Step 1:** Implement spec §3 type table, §4 Nav and Buttons, and the reduced-transparency and increased-contrast queries from §5. Hover *colours* go inside `@media (hover: hover) and (pointer: fine)` with no transition yet. Delete the old `transition:` declarations from the rules you rewrite; Task 9 adds them back to spec.
- [ ] **Step 2:** `node build/build.mjs` (the nav lives outside markers; rebuild anyway so `--check` stays green), then `./scripts/shoot.ps1 -Url http://localhost:8000/ -Out qa/t6`.
  Expected: at 375 the nav has two rows (brand + Email me / three links) and nothing overflows horizontally. Light and dark differ. **Review Focus 5:** at 1440 light, the hero letters don't touch. If they do, raise the hero tracking toward `-0.02em` and note the change in the spec.
- [ ] **Step 3:** In claude-in-chrome, scroll to each section and confirm the matching nav link gets `aria-current` (read via `read_page`).
- [ ] **Step 4:** Commit.

### Task 7: Career trace + readout

**Files:**
- Modify: `styles.css` (Signal band, Readout sections), `index.html` (legend text → "Baseline" / "Flagged", `.caption`)

**Interfaces:**
- Consumes: band markup (Task 2), `.js` draw-in scoping (Task 4).

- [ ] **Step 1:** Implement spec §4 "Career trace" and "Readout", including `@media (max-width: 640px) { .tick:nth-of-type(even) { display: none } }` and the label colours. Leave the existing draw-in rules alone; Task 9 owns them.
- [ ] **Step 2:** Rebuild, shoot to `qa/t7`. Expected: four flags visible with labels inside the plot at 375 and 1440, in both schemes. Grey vs blue are distinguishable, and the first and last labels don't clip.
- [ ] **Step 3:** In claude-in-chrome, use `javascript_tool` to measure `getBoundingClientRect()` of each `.flagbtn::after` host plus the 8px/12px insets. Expected: hit area ≥ 24×24.
- [ ] **Step 4:** Commit.

### Task 8: Record, tags, cards, toolbox, contact, footer

**Files:**
- Modify: `styles.css` (remaining sections)

- [ ] **Step 1:** Implement spec §4 Record / Tags / Fieldwork cards / Toolbox / contact / footer, including the record `.is-target` wash colour and `--radius-sm`. Static only.
- [ ] **Step 2:** Rebuild, shoot to `qa/t8`. Expected: cards on `--surface` with 18px radius, two columns at 1440, one at 375; tags as pills; a fieldwork org line in `--link`.
- [ ] **Step 3:** Commit.

### Task 9: Motion (`animate`, `apple-design`)

**Files:**
- Modify: `styles.css` (transitions, draw-in, reveal, reduced-motion block), `app.js` (settle, flag click, head-only reveal)

**Interfaces:**
- Consumes: `#band`, `.flagbtn`, `#event-{i}` (Task 2); `.js` scoping (Task 4).
- Produces: classes `.band--in` (draw-in started), `.band--settled` (draw-in finished, delays cleared), `.is-target`; module-level `highlightTimer` in `app.js`.

Before starting, invoke `animate` and run its Build Sequence for each row of the spec §5 inventory. The gate results are already recorded there, so confirm them; don't re-litigate.

- [ ] **Step 1:** Implement every row of spec §5 exactly: press feedback, hover colour transitions, draw-in at 2.5ms/slot, the settle step (`transitionend` on the last bar, or a 1500ms fallback, adds `.band--settled`), the flag click (clear `highlightTimer`, remove `.is-target` everywhere, add it to the target, `scrollIntoView`, `focus({preventScroll:true})`, a 2600ms timer), heading-only reveal (400ms, 8px), and the body colour transition. Write the reduced-motion block per §5. Then grep: `transition: all`, `ease-in[^-]`, `.reveal` on anything but `.head`. Expected: no hits.
- [ ] **Step 2: Interruptibility checks** in claude-in-chrome on `http://localhost:8000/`:
  (a) Click a flag *during* the draw-in. Expected: the scroll and highlight still work, and the bars keep drawing.
  (b) After the draw-in, press and hold a flag, then release. Expected: it dips and returns at once, with no ~0.75s lag (finding #1). Check `getComputedStyle(flag).transitionDelay === "0s"` once `.band--settled` is set.
  (c) Click "2025", then "Now" within 1s. Expected: only "Now" is highlighted, it holds about 2.6s, then *fades* (finding #3). `document.activeElement.id === "event-3"`.
  (d) Keyboard: Tab to a flag and press Enter. Expected: a visible focus ring on the entry.
  (e) Hover a flag (mouse). Expected: brightness fades, doesn't snap (finding #2).
- [ ] **Step 3: Feel-check.** In DevTools → Animations, replay the draw-in at 25% and 10% and confirm the left-to-right sweep stays continuous, with no clumps. Record anything that feels off in the commit message; don't silently retune a value from the spec.
- [ ] **Step 4:** Emulate `prefers-reduced-motion: reduce` (DevTools Rendering). Expected: bars static on load, headings fade without moving, anchor scroll instant, buttons don't scale.
- [ ] **Step 5:** Commit (`theme: motion — press feedback, settled trace stagger, flag→entry highlight`).

### Task 10: Mobile platform layer (`mobile-native`)

**Files:**
- Modify: `styles.css` (base, `.wrap`, `.band__cap`, `.band__plot`, nav, footer), `index.html` (head metas)

- [ ] **Step 1:** Invoke `mobile-native`. Implement spec §5b exactly. Then grep for ungated `:hover` (any `:hover` not inside a `(hover: hover) and (pointer: fine)` block), `user-scalable`, `maximum-scale`, and `user-select` on `body`. Expected: no hits.
- [ ] **Step 2:** Emulation smoke (only proves nothing broke): at 375 and at 812×375 landscape, no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`).
- [ ] **Step 3: Real device (user runs this; can't be verified from here).** Run `python -m http.server 8000 --bind 0.0.0.0`, find the LAN IP with `ipconfig`, and open `http://<ip>:8000/` on a phone. Check:
  - no grey flash on tapping a button or flag
  - no stuck hover after a tap
  - long-press on a button doesn't select its label
  - in landscape on a notched iPhone, text clears the notch
  - press feedback feels immediate
  - status bar colour matches in light and dark

  Record the results in `docs/qa/2026-10-17-after-audit.md`.
- [ ] **Step 4:** Commit.

### Task 11: Head, Open Graph, JSON-LD, OG image

**Files:**
- Create: `build/og-card.html`, `assets/og.png`
- Modify: `build/render.mjs` (`renderHead` copy per spec §7), `index.html` (old `<title>`/description move inside the `head` marker)

**Interfaces:**
- Consumes: `renderHead` (Task 2).

- [ ] **Step 1:** Confirm the spec §7 `<title>` and description copy with the user before writing. These are the only copy changes in the plan.
- [ ] **Step 2:** Build `build/og-card.html` at 1200×630: light theme, system font, name, headline, a static trace strip. Render it with
  `chrome.exe --headless=new --hide-scrollbars --window-size=1200,630 --screenshot=assets/og.png build/og-card.html`. Expected: PNG 1200×630, under 300 KB.
- [ ] **Step 3:** Rebuild; `node --test tests/`; `--check` exits 0. Validate JSON-LD by `JSON.parse` of the script body in a `node -e` one-liner.
- [ ] **Step 4:** Commit.

### Task 12: Verification (ECC `browser-qa`, `accessibility`, `design-system`, `frontend-design-direction`; `break-ui`, `improve-animations`, `find-animation-opportunities`)

**Files:**
- Create: `docs/qa/2026-10-17-after-audit.md`, `qa/final/evidence.json` (ignored, kept locally)

- [ ] **Step 1: Smoke.** In claude-in-chrome on `http://localhost:8000/`: zero console errors, no 4xx in network requests (CV PDF 200), every nav link and every flag reaches its target.
- [ ] **Step 2: Visual.** `./scripts/shoot.ps1 -Out qa/final`, then compare against `qa/before`. Check for overflow, clipping, or elements missing at 375/768/1440 in both schemes.
- [ ] **Step 3: Accessibility.** Inject axe-core (`https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js`) via `javascript_tool`, run `axe.run()` in light and in dark (emulate via DevTools or `--force-dark-mode`). Expected: 0 serious/critical. Do a full keyboard walk: skip link → nav → CV → LinkedIn → each flag → contact buttons, with focus always visible. Toggle reduced motion, reduced transparency and increased contrast (Chrome DevTools rendering emulation). Expected: per spec §5.
- [ ] **Step 4: Worst-case data (`break-ui`).** On a scratch copy of `data.js`: a 120-char project title, an unbroken 60-char tag, a skill note of 80 chars, a ninth stat, and 10 phases. Build to a scratch `index.html`, shoot at 375. Expected: no horizontal scroll, nothing overlapping. Fix real breaks in `styles.css`, then discard the scratch data.
- [ ] **Step 5: Audit.** Repeat ECC `design-system` Mode 2 + Mode 3. Write the before/after scores to `docs/qa/2026-10-17-after-audit.md`.
- [ ] **Step 5b: Motion re-audit (read-only).** Invoke `improve-animations quick` and `find-animation-opportunities` on the finished branch. Expected: findings #1–#6 from spec §5 gone, and no new HIGH findings. Any surviving opportunity must not duplicate a rejected candidate in spec §5. Append both outputs to the after-audit doc. Fix HIGH findings before Step 6; list MEDIUM/LOW for the user rather than fixing silently.
- [ ] **Step 6: Evidence gate.** Write `qa/final/evidence.json` per `frontend-design-direction`: `targetViewports` = the six viewport/scheme labels, content states from spec §8, artifacts = `qa/final` PNGs. Run
  `node C:\Users\aswin\.claude\plugins\cache\ecc\ecc\2.2.3\skills\frontend-design-direction\scripts\check-evidence.js qa/final/evidence.json`. Expected: pass. Report anything untested instead of marking it passed.
- [ ] **Step 7:** Commit the after-audit doc. Verdict SHIP / SHIP WITH FIXES / DO NOT SHIP, per `browser-qa`.

### Task 13: Docs and ship

**Files:**
- Modify: `README.md` (new edit loop: edit `data.js` → `node build/build.mjs` → refresh; tests; CI; theme name), `Z:\Obsidian\The_Vault\Projects\Portfolio Website.md` + `log.md`

- [ ] **Step 1:** Update the README. Update the vault note: design line, the static-vs-prerender decision now implemented, and the build/check workflow. Append one `log.md` line.
- [ ] **Step 2:** `node --test tests/ ; node build/build.mjs --check`. Expected: pass / exit 0.
- [ ] **Step 3:** **Ask the user before merging or pushing.** On approval: `git merge-base --is-ancestor origin/main HEAD`, then `git push origin HEAD:main`.
- [ ] **Step 4:** Verify the deploy per the vault note: poll
  `curl -s "https://captainco0l.github.io/portfolio/?cb=<ts>" | grep -c "Automation at scale"` until it reads ≥ 1. Unlike before, this proves the HTML itself now carries the content. Then check the LinkedIn Post Inspector preview for the URL. Confirm the CI workflow run is green.
