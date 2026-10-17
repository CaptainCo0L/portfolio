# Before audit — "Baseline & Anomaly" theme (commit e25ac74)

Method: ECC `design-system` Mode 2 (10-dimension visual audit) + Mode 3 (AI-slop check), against
`node scripts/shoot.mjs` captures at 375×812, 768×1024, 1440×900 (light/dark identical — no dark mode) and the
source. Screenshots are local only (`qa/before/`, git-ignored).

## Scores

| # | Dimension | Score | Evidence |
|---|---|---|---|
| 1 | Colour consistency | 7 | Tokens used throughout, but raw hexes leak: `styles.css:79` `#14232a`, `styles.css:86` `#ffbf5e`. |
| 2 | Typography hierarchy | 7 | Clear h1 > h2 > h3, but one tracking value (`-0.03em`) for every heading size (`styles.css:30`) and `line-height: 1.02` on 1.5rem card titles (`styles.css:29`, `:425`). Three web fonts (`index.html:11`) cost a render-blocking request. |
| 3 | Spacing rhythm | 8 | 4pt token scale (`tokens.css:36-44`) used consistently. |
| 4 | Component consistency | 7 | Buttons/tags/labels consistent; flag buttons have hover but no press state (`styles.css:252`). |
| 5 | Responsive behaviour | 5 | No overflow at 375, but ≤640px hides every section link (`styles.css:156`) — no wayfinding on phones; `viewport-fit=cover` with no safe-area padding (`index.html:5`). |
| 6 | Dark mode | n/a → 0 | Dark-only palette; ignores `prefers-color-scheme` entirely. Single `theme-color` (`index.html:8`). |
| 7 | Animation | 5 | Purposeful set, but: stale draw-in `transition-delay` persists on flags (`styles.css:277`); flag hover `filter` transition overridden (`:243` vs `:277`); record highlight snap (`:389` vs `:508`); scroll reveal hides read content (`:505`). |
| 8 | Accessibility | 6 | Good focus ring and reduced-motion; but ungated `:hover` (`:86, :94, :106, :150, :252`), flag click doesn't move focus (`app.js:106-115`), no reduced-transparency/contrast handling, content invisible without JS. |
| 9 | Information density | 8 | Calm, scannable, generous measure. |
| 10 | Polish | 6 | Strong signature (career trace); press feedback weak (`translateY(1px)`, `:87`); no tap-highlight suppression. |

**Total: 59 / 100** (dark mode scored 0).

## AI-slop check (Mode 3)

None of the listed patterns: no gradients, no purple→blue, no purposeless glass, near-square radius by design, no
generic centred hero. The career trace is a specific, owned idea — keep it.

## What the redesign must not lose

The career trace as the single loud element; the calm density; the tokenised spacing scale; the reduced-motion care.
