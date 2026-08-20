# Joseph Dwyer — Engineering Portfolio

A static, single-page engineering portfolio. No build step, no framework, no
external JS dependencies — plain HTML + CSS + vanilla JS + a data model.

## Structure
- `index.html` — page shell (sections filled by `app.js`)
- `styles.css` — design system
- `data.js` — ALL content + figures (single source of truth)
- `app.js` — renders `data.js` → DOM, lightbox, interactive demos
- `resume.html` — printable resume (styled by `documents.css`)
- `assets/` — photos, screenshots, video
- `downloads/` — resume + engineering portfolio + project docs (PDF)

## Deploy
Served via GitHub Pages from this repository (root of the `Main` branch).
`.nojekyll` is included; all asset paths are relative, so it works from any
sub-path.
