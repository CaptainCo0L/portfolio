# Aswin Sunil — portfolio

A single-page static portfolio. No build step, no dependencies.

## Editing content

**Everything on the page lives in [`data.js`](data.js).** Open it, change a value, save, refresh the browser.

- **Add a project** → add an object to the `projects` array (there's a commented example in place).
- **Add a skill row / cert / education line** → append to `skills`, `certs`, or `education`.
- **Change the headline, stats, phases, contact info** → edit the matching field at the top.
- The stat figures come from the CV — keep them real.

### The signal band

The hero trace is generated from `phases`. Each phase carries two extra fields:

- `flag: true` draws a tall amber bar (a turn in the story); `false` draws a shorter mint one (steady baseline work). The same distinction labels the entry in the record below.
- `mark:` is where it sits on the band, `0` (far left) to `1` (far right).

Add a phase and a new bar appears; clicking it scrolls to that entry.

## CV download

Drop your CV PDF at `assets/Aswin-Sunil-CV.pdf` (or change `contact.cv` in `data.js` to another path/URL).

## Preview locally

Just open `index.html` in a browser. Or serve it:

```
npx serve .
```

## Deploy (GitHub Pages)

1. Create a repo (e.g. `aswin-portfolio`), push these files.
2. Repo → Settings → Pages → Source: `main` branch, `/ (root)`.
3. Site appears at `https://<username>.github.io/aswin-portfolio/`.

Netlify/Vercel also work — point them at the folder, no build command.

## Files

| File | What it is |
|------|------------|
| `data.js` | **All content — edit this one** |
| `index.html` | Page structure |
| `styles.css` | Design (Baseline & Anomaly) |
| `tokens.css` | Design tokens (colours, type, spacing) |
| `app.js` | Rendering + the signal band (rarely needs edits) |
