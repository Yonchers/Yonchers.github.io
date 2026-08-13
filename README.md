# Joseph Dwyer Engineering Portfolio — V4 Demo

A static GitHub Pages portfolio covering mechanical engineering, automation, local AI, additive manufacturing, testing, robotics, motorsports, and product development.

## What changed in V4

- Every project card now opens a **full project workspace inside the website**. Visitors stay on the portfolio instead of being sent to a separate standalone page.
- Each workspace uses project-specific tabs. Common tabs include Overview, Design decisions, Evidence, and Results; relevant projects also add Workflow, Power savings, Benchmarks, or Sponsorship.
- Project workspaces support direct links such as `#project=pfc-supervisor&tab=savings` and browser back/forward navigation.
- The main page and project title blocks were rewritten in a more direct, first-person voice.
- PFC power savings are featured prominently while keeping the current measurement limitation visible beside the estimate.
- The Print Orchestrator and PFC demos retain the higher-fidelity treatment based on the supplied control-panel captures.
- Standalone files under `projects/` remain as fallbacks for direct-link compatibility, but the portfolio cards no longer navigate away from the main site.

## Preview locally

```sh
./preview.sh 8080
```

Then open `http://localhost:8080`.

## Verify the package

```sh
./verify.sh
```

The verifier checks JavaScript syntax, local references, duplicate IDs, the 11 long-form project sources, and the generated in-site project registry.

## Publish to GitHub Pages

Copy the contents of this directory into the root of `Yonchers.github.io`, commit, and push. The included GitHub Pages workflow can publish the static site.

## Key files

- `index.html` — primary portfolio, software demos, project cards, and the integrated project workspace
- `styles.css` — base visual system
- `v3.css` — higher-fidelity Print Orchestrator and PFC styling
- `project.css` — shared long-form project content styles
- `v4.css` — integrated workspace, project tabs, responsive layout, and revised title hierarchy
- `app.js` — global navigation, motion, filtering, and base interactions
- `v3.js` — Print Orchestrator and PFC demo behavior
- `project-tabs-data.js` — generated content registry for all 11 projects
- `v4.js` — project workspace, tabs, deep links, project navigation, and evidence lightbox
- `projects/` — retained long-form source/fallback pages
- `tools/build_project_tabs.py` — rebuilds `project-tabs-data.js` from the long-form project pages
- `assets/` — project photos, dashboard captures, and icons

## Measurement note

The PFC dashboard snapshot reports 13.19 kWh avoided over the current seven-day ledger, 95.0 hours of observed sleep, 68.23 kWh projected over 30 days, and a projected annual value of $290.54. Sleep history is observed from retained system state. Avoided-energy and dollar values currently use configured power baselines and should remain labeled as estimates until direct host metering is added.
