# Aswin Sunil — the story so far

A one-page, static portfolio: a vertical timeline of life stages, an "Off the clock" section, and the
recruiter essentials (fieldwork, toolbox, CV, email). Apple-style light + dark theme that follows the
visitor's system setting. No runtime dependencies, no web fonts.

## Editing content

**Everything on the page lives in [`data.js`](data.js).** After editing it, rebuild:

```
node build/build.mjs
```

That writes the content into `index.html` (between `<!-- @build:… -->` markers), so the page works without
JavaScript and link previews / job-site scrapers see the real text. Commit both `data.js` and `index.html`.
CI fails if you forget to rebuild.

- **Add a life stage** → add an object to `stages` (oldest first). `turn: true` marks a turning point (blue
  node, and the line is blue from the first one onward); `future: true` is for what hasn't happened yet;
  `body` is a list of paragraphs; `tags` and `link` are optional.
- **"By the numbers"** → the `numbers` list, shown in a popover on the stage with `numbers: true`.
- **Off the clock** → `offClock`; `icon` is one of `football · controller · server · guitar · planet ·
  dumbbell · mountain · speech` (line drawings in `build/illustrations.mjs`).
- **Fieldwork / toolbox / certs / education** → `projects`, `skills`, `certs`, `education`.
- Keep it true: figures come from the CV; no family details, no location finer than the city.

## Checks

```
node --test "tests/*.test.mjs"     # render, data, contrast, mobile-layer and build tests
node build/build.mjs --check       # index.html is up to date
```

Both run in GitHub Actions (`.github/workflows/check-build.yml`) on every push.

For visual and behaviour checks (needs Chrome and a local server, `python -m http.server 8000`):

```
node scripts/shoot.mjs --url http://localhost:8000/ --out qa/now     # 375/768/1440 × light/dark screenshots
node scripts/probe.mjs --width 375 path/to/check.js                  # run a check script in the page
```

`qa/` is git-ignored. The link-preview image `assets/og.png` is rendered from `build/og-card.html`
(command in that file's header).

## Preview / deploy

Preview: `python -m http.server 8000` and open http://localhost:8000/ (opening `index.html` as a file works too).

Deploy: GitHub Pages serves `main` from the repo root — https://captainco0l.github.io/portfolio/.
Asset URLs carry a content hash (`styles.css?v=…`), so a deploy never pairs new HTML with cached old CSS/JS.

## Files

| File | What it is |
|------|------------|
| `data.js` | **All content — edit this one** |
| `index.html` | Page shell + generated content (rebuild after editing `data.js`) |
| `tokens.css` / `styles.css` | Design tokens (light + dark) / styles |
| `app.js` | Enhancement only: current stage, popover hover + placement, nav marker, reveals |
| `build/` | `build.mjs` (writes index.html), `render.mjs`, `illustrations.mjs`, `og-card.html` |
| `tests/` | `node:test` suites |
| `scripts/` | `shoot.mjs` (screenshots), `probe.mjs` (in-page checks) |
| `docs/` | Specs, plans, QA audits; `docs/superpowers/plans/future-dynamic-upgrade.md` for what's next |
