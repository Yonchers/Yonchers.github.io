# Joseph Dwyer Engineering Portfolio — V6.1

V6.1 normalizes section spacing and type scale, standardizes project-card sizing, and presents Hermes as a compact systems-integration section using the current application capture rather than as a standalone project workspace.

A GitHub Pages-ready static portfolio connecting Joseph Dwyer's mechanical systems, automation software, local AI infrastructure, manufacturing work, testing, robotics, and motorsports experience.

## V6 focus

- Rebuilt the opening radar graphic around one centered coordinate system so its rings, scan line, labels, and core scale together.
- Rewrote the desktop section headings and supporting copy for a concise employer/colleague audience.
- Added a system-architecture map linking B70/PFP, llama.cpp, Hermes, PFC Supervisor, Print Orchestrator, and desktop controls.
- Expanded Print Orchestrator as an AI-automation frontend rather than only a printer dashboard: OpenSCAD, a modified OrcaSlicer CLI path, API dispatch, part-on-bed interlocks, modified Obico failure warnings, Discord, Kasa power telemetry, and future robotic reset.
- Added an interactive Fleet/Power switch to the Print Orchestrator demonstration.
- Expanded PFC around measured sleep history, modeled energy savings, runtime reconciliation, Hermes schedule protection, PFC Top, and permission-separated Minecraft controls.
- Added Hermes as a full project with PFC Pulse, PFC Command, llama.cpp manager/worker routing, meeting-assistant R&D, and planned cross-machine recovery.
- Split AI results into three views: deployed production profiles, the standardized llama-bench sweep, and broad speculative-decoding/MTP research.
- Replaced "Evidence" with project Documentation galleries and added carousel controls, lightbox viewing, captions, status labels, results, future work, and upstream references.
- Updated project hero images for E3NG, Voron 2.4, ME190, PFC, Print Orchestrator, the B70/PFP server, and Makerspace experience.
- Added working printable HTML versions of the resume and project summary so the contact links no longer break.
- Sanitized local endpoints, file paths, and private network details from the public source.

## Preview locally

```sh
./preview.sh 8000
```

Then open `http://localhost:8000`.

## Verify the package

```sh
./verify.sh
```

The verifier checks:

- JavaScript syntax
- all 15 HTML pages
- all local links and image references
- duplicate IDs
- 12 project routes and integrated cards
- benchmark downloads and three-view separation
- Documentation galleries
- the corrected hero radar structure
- Print Orchestrator Fleet/Power panels
- public-source sanitization
- resume and printable project-summary links

## Publish to GitHub Pages

Copy the **contents** of this directory into the root of `Yonchers.github.io`, test locally, commit on a feature branch, and merge into the repository's `Main` branch when ready.

The root includes `.nojekyll`, and the existing Pages workflow remains available under `.github/workflows/`.

## Main files

- `index.html` — portfolio, architecture map, product demos, project cards, benchmark views, and integrated project workspace
- `styles.css` — original/base visual system
- `v3.css` — Print Orchestrator and PFC control-panel visual systems
- `project.css` — project-content components
- `v4.css` — integrated project workspace
- `v6.css` — V6 geometry, scale, architecture, Hermes, galleries, and benchmark overrides
- `app.js` — global navigation, motion, filtering, and base interactions
- `v3.js` — Print Orchestrator and PFC demo interactions
- `v4.js` — integrated project workspace, tabs, deep links, history, and lightbox
- `v6.js` — Fleet/Power switching, benchmark tabs, and Documentation carousel controls
- `project-tabs-data.js` — generated registry for 12 project/experience workspaces
- `resume.html` — printable resume
- `portfolio-summary.html` — printable compact technical portfolio
- `documents.css` — shared printable-document styling
- `tools/build_v6_project_data.py` — rebuilds project content and galleries
- `tools/update_index_v6.py` — reapplies the main V6 structure
- `tools/build_project_redirects.py` — rebuilds direct project routes
- `assets/downloads/` — standardized benchmark, MTP research, and production-profile CSVs

## Accuracy notes

- Print Orchestrator's prompt-to-CAD/slice/dispatch workflow is described as a prototype under end-to-end validation. The Raspberry Pi enclosure is an output artifact, not proof of fully unattended production.
- PFC sleep time is observed from retained state history. Avoided-energy and dollar values use configured power baselines and remain estimates until direct host metering is available.
- Open-source references distinguish upstream platforms from Joseph's deployment, integration, tuning, controls, and documentation work.
- Qwen3.5-122B remains historical/retired and is not part of the active production stack.
