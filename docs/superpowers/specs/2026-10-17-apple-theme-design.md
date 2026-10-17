# Apple light + dark theme, prerendered — design spec

Date: 2026-10-17 · Branch: `theme-apple` (from `redesign-baseline-anomaly` @ `e25ac74`)
Sources: skills `apple-design`, `animate`, `animation-vocabulary`, `find-animation-opportunities`,
`improve-animations`, `mobile-native`; ECC skills read from disk (plugin not enabled):
`frontend-design-direction`, `design-system`, `accessibility`, `seo`, `browser-qa`.

## 1. Direction contract (ECC `frontend-design-direction`)

| | |
|---|---|
| Purpose | Get a recruiter / SOC hiring manager to email or download the CV. |
| Audience | Recruiters skimming in under 30 s, often on a phone from a LinkedIn link; hiring managers reading the record and fieldwork in full. |
| Primary action | "Email me" (nav + contact); secondary "Download CV". |
| Tone | Calm, precise, Apple product-page restraint. Quiet everywhere except one signature. |
| Memorable detail | The **career trace** band stays: same mechanics, restyled — grey baseline, blue flags. |
| Constraints | Static GitHub Pages, no runtime dependencies, no web fonts, WCAG 2.2 AA, works without JS. |
| Target viewports | `375x812`, `768x1024`, `1440x900` — each in light and dark. |

**Themes:** light and dark, chosen by `prefers-color-scheme`. No manual toggle (out of scope).

## 2. Tokens (`tokens.css`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#ffffff` | `#000000` | page ground |
| `--surface` | `#f5f5f7` | `#1c1c1e` | fieldwork cards |
| `--label` | `#1d1d1f` | `#f5f5f7` | primary text |
| `--label-2` | `#6e6e73` | `#a1a1a6` | secondary text |
| `--label-3` | `#86868b` | `#86868b` | captions — **large/bold text or non-text only** (see §6) |
| `--separator` | `rgba(0,0,0,.1)` | `rgba(255,255,255,.14)` | hairlines |
| `--tick` | `#d2d2d7` | `#3a3a3c` | routine bars in the trace |
| `--signal-base` | `#86868b` | `#8e8e93` | recorded baseline events (bars, dots) |
| `--accent` | `#0071e3` | `#2997ff` | flagged events, accent text |
| `--link` | `#0066cc` | `#2997ff` | text links |
| `--button` / `--button-hover` | `#0071e3` / `#0068d1` | same | filled buttons; hover goes *darker* (Apple's `#0077ed` gives white text only ~4.3:1) |
| `--on-accent` | `#ffffff` | same | text on buttons |
| `--material` | `rgba(255,255,255,.72)` | `rgba(22,22,23,.8)` | translucent nav |
| `--focus` | `#0071e3` | `#2997ff` | focus ring |

Structure: `--radius-sm: 8px` (record rows, skip link), `--radius: 18px` (cards), `--radius-pill: 980px` (buttons, tags).
Spacing scale and z-index unchanged from current `tokens.css`. Motion: `--ease-out: cubic-bezier(0.16,1,0.3,1)`,
`--dur-press: 100ms`, `--dur-micro: 150ms`, `--dur-short: 260ms`, `--dur-long: 520ms`.

## 3. Type (system fonts only — Google Fonts link removed)

Stacks: display `-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
body same with `"SF Pro Text"`; mono `ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace` (no longer used for labels).

Tracking and leading are set **per level**, never globally (apple-design §15):

| Level | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| Hero h1 | `clamp(2.75rem, 5.2vw + 1rem, 5rem)` | 600 | 1.05 | -0.03em |
| Section h2 | `clamp(2rem, 2.8vw + 1rem, 3rem)` | 600 | 1.08 | -0.022em |
| Readout number | 2.5rem, tabular | 600 | 1.1 | -0.025em |
| Record h3 | 1.75rem | 600 | 1.14 | -0.016em |
| Card h3 | 1.5rem | 600 | 1.17 | -0.01em |
| Lede / section intro | 1.3125rem | 400 | 1.38 | +0.005em |
| Body | 1.0625rem (17px) | 400 | 1.47 | -0.01em |
| Caption | 0.875rem | 500 | 1.4 | -0.005em |

The `.mono` uppercase label class is replaced by `.caption` (sentence case, sans).

## 4. Components

- **Nav** — sticky translucent material (`backdrop-filter: blur(20px) saturate(180%)`), no bottom border, min-height 52px.
  Order: brand · status (green dot `#34c759`, hidden ≤900px) · section links · "Email me" (`.btn--sm`, outside `<nav>`).
  Section links get ≥ 24px tap height (`padding-block: 0.25rem` + line-height).
  ≤640px: row 1 = brand + Email me; row 2 = Record / Fieldwork / Toolbox. Current section's link gets
  `aria-current="location"` and `--label` colour.
- **Buttons** — pill, 17px, `--button` fill; `.btn--ghost` = `--link` outline that fills on hover; `.btn--sm` 14px.
  `.quiet` link = `--link` text with a trailing " ›". Motion in §5.
- **Career trace** — 168 slots (≤640px: every even-indexed `.tick` hidden → ~88 visible). Ticks `--tick`, rounded
  tops 2px; baseline events `--signal-base` at 72% height; flagged `--accent` at 100%; one bottom hairline as the
  literal baseline (top border removed). Labels 12px/600: flagged in `--accent`, baseline events in `--label-2`
  (`--signal-base` text would be 3.6:1). Legend keys become 8px circles.
  Hit area stays ≥24×24 CSS px (`::after` inset -8px -12px). Motion in §5.
- **Readout** — four stats, no dividers, large numbers; 2×2 ≤760px.
- **Record** — rows separated by hairlines, `--radius-sm` so the arrival highlight reads as a rounded wash
  (`color-mix(in oklab, var(--accent) 9%, transparent)`). Status dot: grey = Baseline, blue = Flagged —
  with the word, never colour alone.
- **Tags** — pill, filled `color-mix(in oklab, var(--label) 6%, transparent)` (8% inside cards), no border.
- **Fieldwork cards** — `--surface`, `--radius`, no border/left rule, 2 columns ≥ ~62rem via
  `repeat(auto-fit, minmax(min(100%, 30rem), 1fr))`. Org line in `--link` 14px/600 (`--accent` on `--surface`
  is ~4.3:1 in light). No card inside a card.
- **Toolbox table / creds / contact / footer** — same structure, recoloured to label tiers; `th` 14px/600 `--label`.

## 5. Motion (apple-design §1/3/7/10/14 · `animate` · `improve-animations` · `find-animation-opportunities`)

Tokens: keep the repo's existing `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` (`animate` Hard Rule 3: extend, don't
fork). Every animated property is `transform`, `opacity`, or a colour/filter on a tiny element. Names below use
`animation-vocabulary` terms.

**Inventory — every motion on the page after this change (anything not listed does not move):**

| Motion | Purpose · frequency | Spec |
|---|---|---|
| Button **press feedback** | Feedback · tens/visit | `:active { transform: scale(0.97) }`, `transition: transform var(--dur-press) var(--ease-out)` |
| Flag press feedback | Feedback · occasional | `.band--settled .flagbtn:active { transform: scaleY(0.94) }`, same transition |
| Hover colour (links, buttons, flags) | Feedback · tens/visit | `--dur-micro` `ease` on `color`/`background`/`filter`; only inside `@media (hover: hover) and (pointer: fine)` |
| Career-trace draw-in (**stagger** of bars growing from the baseline) | Explanation · once per page load | `scaleY(0→1)`, 420ms `--ease-out`, delay `i × 2.5ms` (~0.84s total). Growing from `transform-origin: bottom` is the bar-chart metaphor, so `scaleY(0)` is a deliberate exception to "never scale(0)". Labels fade in `--dur-short` after their bar. |
| Draw-in settle | — | After the last bar's `transitionend` (or 1500ms fallback), JS adds `.band--settled`, which sets `transition-delay: 0` and `transition: transform var(--dur-press) var(--ease-out), filter var(--dur-micro) ease`. **Fixes:** stale delays on press/release, and hover `filter` being overridden. |
| Flag click → entry | Spatial consistency · occasional | Smooth `scrollIntoView({block:"center"})`; focus the entry (`tabindex="-1"`, `focus({preventScroll:true})`); `.is-target` background wash fades in/out over `--dur-long`; single stored timer clears it after 2600ms; a new click clears the old timer first. The highlight transition lives on `.record > li` and nothing overrides it. |
| Section-heading **scroll reveal** | Preventing a jarring change · once per section | Only `.head` blocks: `opacity 0→1`, `translateY(8px→0)`, 400ms `--ease-out`, one-shot IntersectionObserver, hidden state only under `.js`. |
| Light ↔ dark switch | Preventing a jarring change · rare | `body { transition: background-color 300ms ease, color 300ms ease }` |
| Anchor scroll | Spatial consistency | `scroll-behavior: smooth` (existing) |

**Removed:** scroll reveal on record rows, fieldwork cards and creds (content people read must not wait on motion;
it also left flag-click targets at `opacity: 0`).
**Rejected (gate that killed it):** stats number ticker (function — data being read); card hover lift (function —
cards aren't interactive, a lift is a false affordance); sliding nav indicator (frequency + decoration); hero
headline stagger (function — delays the first read); parallax on the trace (purpose — none).

**Reduced motion** (gentler, not zero): no draw-in (bars static), no reveal offset (headings still fade 200ms
opacity-only), instant anchor scroll, press feedback keeps colour change but no scale; highlight wash still fades
(it's opacity/colour, aids comprehension). **Reduced transparency:** solid `--bg` nav, no blur.
**Increased contrast:** `--label-2`/`--label-3` → `--label`, visible borders on nav, cards, tags.

**Feel-checks (cannot be settled from code):** draw-in total length, the 0.94 flag dip, highlight duration — run
at 10% / 25% in DevTools → Animations, and on a real phone.

## 5b. Mobile platform layer (`mobile-native`)

- `html { -webkit-tap-highlight-color: transparent; -webkit-text-size-adjust: 100%; }` — every tappable already has `:active`.
- `a, button { touch-action: manipulation; }` — no double-tap-zoom wait.
- `.btn, .flagbtn, .nav__links a { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }` — never on body text.
- All hover rules inside `@media (hover: hover) and (pointer: fine)`.
- Safe areas (`viewport-fit=cover` is already set, so `env()` is live): `.wrap` and `.band__cap` gutters become
  `max(1.25rem, env(safe-area-inset-left/right))`; the trace's `padding-inline` likewise; nav gets
  `padding-top: env(safe-area-inset-top, 0px)`; footer `padding-bottom: calc(var(--space-lg) + env(safe-area-inset-bottom, 0px))`.
- `theme-color` per scheme (`#ffffff` / `#000000`) + `<meta name="color-scheme" content="light dark">`.
- Not applicable: `dvh/svh` (no viewport-height layout), input font size (no inputs), `overscroll-behavior` (a
  document — pull-to-refresh is welcome), carousel `touch-action` (none).
- Never: `user-scalable=no`, `maximum-scale`.
- Needs a real phone (owner): sticky hover, tap flash, notch padding in landscape, press feel.

## 6. Accessibility (ECC `accessibility`, WCAG 2.2 AA)

- Body/secondary text ≥ 4.5:1 against `--bg` **and** `--surface` in both modes; enforced by a test. Pairs:
  `--label`, `--label-2`, `--link` on `--bg` and `--surface`; `--accent` on `--bg`; `--on-accent` on `--button`
  and `--button-hover`. Non-text ≥ 3:1: `--signal-base` and `--accent` on `--bg`; `--focus` on `--bg`.
  (`--tick` is decorative, `aria-hidden`, exempt.)
- `--label-3` (`#86868b`) is 3.6:1 on white → allowed only for text ≥ 18.66px bold / 24px, or non-text marks.
  Small captions use `--label-2`. (This corrects the earlier draft, which used `--label-3` for 14px captions.)
- Focus ring 2px `--focus`, offset 3px, visible on every interactive element; targets ≥ 24×24 CSS px.
- One `h1`; headings in order; landmarks: header/nav/main/footer.

## 7. Prerendered content (Phase 6, ECC `seo`)

Problem: content is injected by JS, so link previews, ATS scrapers and non-JS fetchers see an empty shell.

- `data.js` stays the single source of truth and is **unchanged in shape**.
- `node build/build.mjs` renders the content into `index.html` between marker comments
  `<!-- @build:NAME -->` … `<!-- @end:NAME -->`; the generated `index.html` is committed (Pages serves it as-is).
- `node build/build.mjs --check` exits 1 if `index.html` is stale; a GitHub Actions workflow runs it on push.
- `app.js` becomes enhancement-only (trace animation + click, reveals, nav current-section, footer year) and no
  longer reads `DATA`; `data.js` is no longer loaded by the page. `<noscript>` block removed.
- Reveal-hidden state applies only under `html.js` (set by an inline one-liner), so no-JS visitors see everything.
- Head (proposed copy — confirm or edit):
  - `<title>`: `Aswin Sunil — SOC Analyst Candidate · QA Automation` (51 chars)
  - description: `QA automation engineer moving into SOC analyst work: 3 years on Fortune 500 apps, 250+ automated tests, a Wazuh SIEM home lab and 6 rooted boot2root boxes.` (156 chars)
  - `link rel=canonical` → `https://captainco0l.github.io/portfolio/`
  - Open Graph: `og:type=profile`, `og:title`, `og:description`, `og:url`, `og:image` = `assets/og.png` (1200×630,
    absolute URL), `og:image:alt`; `twitter:card=summary_large_image`.
  - JSON-LD `Person`: name, url, description (lede), `sameAs` [LinkedIn], `address.addressLocality` Ernakulam,
    `knowsAbout` from skills domains. No email/phone in JSON-LD.
- `assets/og.png` rendered from `build/og-card.html` (light theme, name + headline + trace motif) via headless Chrome.
- Not applicable: `robots.txt` / sitemap — a project page at `/portfolio/` can't serve the domain-root `robots.txt`.

## 8. Content states (for the ECC evidence record)

| State | Applies? |
|---|---|
| Loading | N/A — prerendered, no async data. |
| Empty | Yes — project with `link: ""` shows no "Read the write-up" link (all five today). |
| Partial | Yes — `phone` absent → contact meta omits it; skills row with empty `note` renders an empty cell, no dangling separator. |
| Error | N/A — no requests or forms; CV link is a static asset checked in QA. |
| Success | N/A — no forms. |
| Permission | N/A — no gated content. |

## 9. Out of scope

Manual theme toggle; write-up pages; analytics; contact form; changing copy beyond the `<title>`/description above.
