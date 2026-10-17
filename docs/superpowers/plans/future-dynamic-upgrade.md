# Future upgrade: making the site dynamic

Status: **parked**. To revisit after the life-stages redesign ships (owner request, 2026-10-17).
Not part of the current plan (`2026-10-17-apple-theme.md`).

## Why it comes up

Once the page is a summary of a life through stages rather than a one-off CV page, it grows all the time:
new stages, labs, write-ups, photos. Editing `data.js` and running `node build/build.mjs` on a laptop
is the bottleneck, not the lack of a server.

## Starting point (what exists after the current plan)

- Static GitHub Pages site; `data.js` is the single content source.
- `build/build.mjs` prerenders content into `index.html`; CI fails if it's stale.
- Asset URLs are content-hashed, so deploys are cache-safe.

## Options, cheapest first

| # | Option | What "dynamic" means here | Server? | Attack surface | Verdict |
|---|---|---|---|---|---|
| 1 | **Build in CI instead of locally** | Edit `data.js` (or markdown files) on github.com from any device; a GitHub Action builds and deploys. | No | None added | **Do first.** Removes the laptop step. Requires switching Pages source to "GitHub Actions". |
| 2 | **Content as markdown files** | One file per stage / write-up (`content/stages/2022-foundation.md`), rendered at build time. Write-ups get their own static pages. | No | None | **Do with #1.** Fits a growing life story better than one big JS object. |
| 3 | **Scheduled rebuilds pulling live data** | A nightly Action pulls public data (GitHub activity, CTF/lab platform profiles, latest write-ups) into the build. The page feels live while staying static. | No | Tokens live in Actions secrets only | **Good next step** once there's data worth showing. |
| 4 | **Git-backed CMS** (e.g. Decap / Sveltia) | A web editor at `/admin` that commits to the repo; nice for adding stages from a phone. | No (OAuth via GitHub) | OAuth app config | **Maybe.** Only if editing on GitHub is too clunky. |
| 5 | **Real backend** (API + DB: guestbook, comments, view counts, admin) | Server-rendered or API-driven pages. | Yes | Patching, auth, DB, abuse | **Avoid** unless a specific feature needs it. A security candidate's portfolio is a bad place for an unmaintained server. |

## Recommended path

1 → 2 → 3, re-evaluating 4 only if adding content is still painful. 5 only for a concrete feature that can't be
done statically (and then as a separate, isolated service).

## Revisit when

- Adding a stage or write-up takes more than one edit + push, or
- there are 3+ write-ups waiting for pages, or
- there's live data (lab/CTF profiles, GitHub) worth surfacing automatically.
