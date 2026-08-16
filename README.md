# Joseph Dwyer Engineering Portfolio — V7 Ground-Up

A static GitHub Pages portfolio built from a clean HTML/CSS/JavaScript architecture.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages

Use:

- Source: **Deploy from a branch**
- Branch: **Main**
- Folder: **/(root)**

The repository should contain `index.html` at the root. The included `.nojekyll` file disables Jekyll processing.

## Structure

- `index.html` — semantic page shell
- `styles.css` — one design system and responsive stylesheet
- `data.js` — project, benchmark, experience, and interface content
- `app.js` — rendering, tabs, project workspaces, galleries, lightbox, navigation, and motion controls
- `assets/` — project images and sanitized interface captures
- `downloads/` — resume and engineering portfolio PDFs
- `data/` — public benchmark CSVs with local file paths removed
- `verify.sh` — source and asset validation
- `VERSION` — visible deployment/version marker
- `tools/publish_v7.sh` — backup, upload, publish, and cache-busting helper

## Design choices

- Main portfolio: graphite, warm white, and orange
- Print Orchestrator: white and blue
- PFC Supervisor: black and acid green
- Hermes: compact integration section rather than a standalone project
- Project cards open integrated project workspaces inside the site
- Production profiles, standardized benchmark results, and MTP research remain separate

## Validation

```bash
./verify.sh
```

## One-command publish

From the extracted V7 folder:

```bash
chmod +x tools/publish_v7.sh
./tools/publish_v7.sh
```

The script creates a timestamped backup branch, syncs V7 into the repository root, commits to `Main`, pushes to GitHub, and opens a cache-busted Pages URL.
