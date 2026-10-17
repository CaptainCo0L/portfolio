# Life-story redesign — design spec

Date: 2026-10-17 · Branch: `theme-apple` (continues from `f9a0883`, Task 8 of the theme plan)
Content (copy, facts, privacy): `docs/superpowers/specs/2026-10-17-life-story-content.md` — **authoritative for all words.**

**Relationship to the theme spec** (`2026-10-17-apple-theme-design.md`): §2 tokens, §3 type, §5b mobile layer,
§6 accessibility and §7's build architecture stay in force unchanged. This spec **replaces** theme-spec §1
(direction), §4 "Career trace" and "Readout", §5 motion inventory, §7 head copy, and §8 content states.

Skills: `apple-design`, `animate`, `animation-vocabulary`, `find-animation-opportunities`, `improve-animations`,
`mobile-native`, `break-ui`; ECC (read from disk): `frontend-design-direction`, `design-system`, `accessibility`,
`seo`, `browser-qa`.

## 1. Direction contract (ECC `frontend-design-direction`)

| | |
|---|---|
| Purpose | A reflective summary of the owner's life in stages — for the owner first, recruiters second. |
| Audience | The owner and people who know them; recruiters arriving from LinkedIn/CV who still need fieldwork, toolbox, CV and email within one scroll of the story. |
| Primary action | Read the story. Secondary (kept): Email me, Download CV. |
| Tone | Calm, personal, first person. Apple restraint; nothing shouty. |
| Memorable detail | **The line that changes colour.** A vertical timeline whose line is grey ("baseline") until the first turning point (Aspire), then blue from there on. It keeps the Baseline & Anomaly idea, applied to a life instead of a CV. |
| Constraints | Static Pages, no deps, no web fonts, WCAG 2.2 AA, works without JS, no photos of the owner, no family, city-level location only. |
| Target viewports | `375x812`, `768x1024`, `1440x900`, light + dark. |

## 2. Page structure (one long page)

1. **Nav**: brand · status chip · `Story` `Off the clock` `Fieldwork` `Toolbox` · Email me. Phone: two rows, as built.
2. **Hero**: headline + first-person lede + CV / LinkedIn actions (copy from the content doc).
3. **Story** (`#story`): the vertical timeline (§3).
4. **Off the clock** (`#off-the-clock`): eight items with line illustrations (§4).
5. **Fieldwork** (`#fieldwork`), **Toolbox** (`#toolbox`, incl. Education/Certifications): unchanged from Task 8.
6. **Contact**: heading "Say hello.", body and actions kept; meta line shows `Kochi, Kerala, India (IST)`.
7. Footer as built.

Removed: the horizontal career-trace band (`renderBand`, its CSS and tests) and the readout rail (`renderStats` output
moves into the popover, §3.2).

## 3. Story timeline

### 3.1 Layout
- `<ol class="story">` of `<li class="stage">` (`id="stage-<slug>"`, `tabindex="-1"`). Each stage: `.stage__when`
  (years, tabular), `.stage__node` (the dot, decorative), `.stage__body` (title, place/role line, paragraphs, tags,
  stage extras).
- **Desktop (≥ 760px):** three columns: when (7rem) · rail (24px, line + node) · body (max `--measure`).
  **Phone:** rail at the left edge (24px), when-line above the title inside the body.
- **Line:** a 2px rail segment per stage (`.stage::before`), `--tick` colour; stages from the first turning point
  onward get `.is-after-turn` (computed at build time), so their segment is `--accent`.
- **Node:** 11px circle. Normal = `--bg` fill with a 2px `--signal-base` ring. Turning point (`.is-turn`) = `--accent`
  fill plus a small "Turning point" caption in `--accent` beside the years. Current stage in view (`.is-current`, JS) =
  ring/fill in `--label` (subtle; turning points keep blue).
- Stage order and data: `college`, `postgrad`, `aspire` (turn), `pause`, `security` (turn), `next` (dashed rail
  segment, hollow node — it hasn't happened yet).

### 3.2 "By the numbers" popover (Aspire stage)
- Markup: `<button class="chip" popovertarget="numbers" aria-describedby…>By the numbers</button>` and
  `<div id="numbers" popover class="numbers"><dl>…4 stats…</dl></div>` — **native Popover API**: tap, click, Enter/
  Space toggle it; Esc and outside-click close it; it works without JS.
- Hover (JS enhancement, only `(hover: hover) and (pointer: fine)`): open after 120ms of hovering the chip; close
  200ms after the pointer leaves both chip and popover. Hover never fights a click-opened state.
- Position: JS places it below the chip, left-aligned, clamped 16px inside the viewport. Without JS: UA default
  (centred), still readable.
- Look: `--surface`, `--radius`, a soft shadow (`0 8px 30px rgb(0 0 0 / .12)`, `/ .5` in dark), padding
  `--space-lg`; four stats in a 2×2 grid, big numbers as the old readout (2rem/600, tabular).
- Content is in the HTML, so scrapers and no-JS readers still see the numbers.

### 3.3 Other stage extras
- Security stage: a `.quiet` link "See the fieldwork" → `#fieldwork`.

## 4. Off the clock

- Grid of eight items, `repeat(auto-fit, minmax(min(100%, 15rem), 1fr))`, items on `--surface`, `--radius`.
- Each item: illustration (inline SVG, 40px, `currentColor` strokes in `--label-2`, accent detail in `--accent`,
  `aria-hidden="true"`), title (17px/600), one sentence (`--label-2`).
- Illustrations (owner: "up to your imagination"), drawn as a consistent monoline set (1.5px stroke, round caps,
  24-unit grid like SF Symbols): football, game controller, server rack (home lab), guitar, ringed planet
  (astrophysics), dumbbell, mountain + path (quiet places), speech bubbles (languages). Stored in
  `build/illustrations.mjs`, inlined at build time. No image files, no photos.
- Order follows the content doc.

## 5. Motion inventory (replaces theme-spec §5)

Tokens unchanged (`--ease-out`, `--dur-*`). Only these move:

| Motion | Purpose · frequency | Spec |
|---|---|---|
| Button / chip **press feedback** | Feedback · tens/visit | `:active { transform: scale(0.97) }`, `--dur-press` `--ease-out` |
| Hover colour (links, buttons, chip) | Feedback | `--dur-micro` `ease`, fine-pointer only |
| Popover **origin-aware scale-in** | Spatial consistency · occasional | enter: `opacity 0→1`, `scale(.97→1)`, `transform-origin: top left` (the chip side), 180ms `--ease-out`, via `@starting-style` + `transition-behavior: allow-discrete` on `display`/`overlay`; exit the same path reversed, 120ms. Interruptible (CSS transitions retarget). |
| Current-stage node | State indication · as you scroll | `.is-current` swap of node colour, 200ms `ease` on `background-color`/`border-color`; IntersectionObserver band `-45% 0px -50% 0px` (same as the nav spy). |
| Section-heading **scroll reveal** | Preventing a jarring change · once per section | `.head` only: opacity + `translateY(8px)`, 400ms `--ease-out`, under `.js`. |
| Light ↔ dark switch | Preventing a jarring change · rare | `body` `background-color`/`color` 300ms `ease`. |
| Anchor scroll | Spatial consistency | `scroll-behavior: smooth` (existing). |
| **Hero backdrop** (scroll-driven fade/drift) — added 2026-10-17 at owner request | Spatial consistency (the intro dissolves into the story) · continuous while scrolling the first screen | Hero-only glow in the timeline colours; `animation-timeline: scroll(root)`, range 0–80vh, `linear`; opacity 1→0, `translateY(-12%) scale(1.08)`; CSS only, compositor properties only. Full-page moving background rejected (frequency, function, vestibular — apple-design §14). Reduced motion: static glow. More contrast: no glow. Reduced transparency keeps it (a tint, not a see-through surface — corrected 2026-10-17 after finding Windows' "Transparency effects: off" maps to this query). |

**Rejected (gate):** scroll-drawn timeline line (function — it's what people read alongside; also frequency);
staggered stage entrances (function — delays reading); illustration idle animation (purpose — none; ambient motion
on a reading page); number ticker in the popover (function); parallax (purpose).
**Reduced motion:** popover fades only (no scale); node colour change instant; headings fade without moving;
instant anchor scroll; no press scale.

## 6. Head and previews (replaces theme-spec §7 copy; architecture unchanged)

- `<title>`: `Aswin Sunil — The story so far · QA to security` (47 chars)
- description: `Aswin Sunil from Kochi: college, three years of QA automation that changed direction, a reset, and the turn into security — plus football, games and a home lab.` (≤ 160)
- OG/Twitter/canonical as before; `og:image` card shows name, headline and the two-colour line motif.
- JSON-LD `Person`: as before, `address.addressLocality` = `Kochi`; `knowsLanguage` = English, Malayalam, Tamil,
  Hindi. No email, phone, family.

## 7. Content states (replaces theme-spec §8)

| State | Applies? |
|---|---|
| Loading | N/A — prerendered. |
| Empty | Yes — project with empty `link` shows no write-up link; stage with no tags renders no tag list. |
| Partial | Yes — `next` stage has no years; contact without phone; skills row with empty note. |
| Error / Success / Permission | N/A — no requests, forms or gated content. |

## 8. Data shape (`data.js`)

`stages: [{ id, years, title, place, turn?: true, future?: true, body: string[] /* paragraphs */, tags?: string[],
numbers?: true, link?: { href, text } }]` · `numbers: [{ value, unit, label }]` (was `stats`) ·
`offClock: [{ icon, title, text }]` (`icon` ∈ the eight illustration names) · `phases` and `stats` removed ·
everything else unchanged. `contact.location` → `"Kochi, Kerala, India"`; `contactHeading` → `"Say hello."`.

## 9. Aurora backdrop (added 2026-10-17, owner request — supersedes the static backdrop)

Owner explicitly chose always-on background motion after the gate result (frequency/function/vestibular) was
explained. Implemented with the safeguards in plan Task 12: slow co-prime drift (41/53/67s, transform only), scroll
parallax + colour balance via scroll timeline, reduced motion → still, WCAG 2.2.2 pause toggle (persisted), more
contrast → removed, worst-case stacked-layer contrast enforced by tests. Colours: `--accent`, `--aurora-2` (teal),
`--aurora-3` (indigo) at per-layer strength tokens.
