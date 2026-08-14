# Joseph Dwyer Engineering Portfolio — V5

A static GitHub Pages portfolio covering mechanical engineering, automation, local AI, additive manufacturing, testing, robotics, motorsports, and product development.

## What changed in V5

- Project pages are now more visual and less repetitive. Supporting text was shortened so build photos, dashboard captures, measured results, and their captions carry more of the story.
- Ten projects include integrated photo or screenshot galleries inside the existing project workspace.
- Gallery tabs automatically move the workspace to the selected content instead of leaving the visitor at the top of an oversized project hero.
- The project hero, metrics, cards, software demos, and mobile layouts were rescaled to use screen space more efficiently.
- The project workspace no longer develops horizontal overflow from its decorative background orbit.
- The Makerspace and Vanquish Products section does **not** use unrelated photos. It uses a clearly labeled responsibility map because useful workplace photos are not available.
- The UEI test-room construction photo is correctly grouped with the energy-efficiency test project.
- The PFC project keeps power savings prominent while distinguishing observed sleep from baseline-based energy and dollar estimates.
- Standalone routes under `projects/` redirect into the corresponding integrated project tab, preserving direct links without duplicating long-form pages.

## Preview locally

```sh
./preview.sh 8080
```

Then open `http://localhost:8080`.

## Verify the package

```sh
./verify.sh
```

The verifier checks JavaScript syntax, local references, duplicate IDs, all 11 project routes, gallery counts, image assignments, the no-photo role map, project-card behavior, and the V5 stylesheet order.

## Publish to GitHub Pages

Copy the contents of this directory into the root of `Yonchers.github.io`, commit, and push. The included GitHub Pages workflow can publish the static site.

## Key files

- `index.html` — main portfolio, software demos, cards, and integrated project workspace
- `styles.css` — base visual system
- `v3.css` — high-fidelity Print Orchestrator and PFC demo styling
- `project.css` — shared project-content components
- `v4.css` — integrated project workspace and tab structure
- `v5.css` — scale corrections, gallery layouts, concise project presentation, and no-photo card layout
- `app.js` — global navigation, motion, filtering, and base interactions
- `v3.js` — Print Orchestrator and PFC demo behavior
- `project-tabs-data.js` — generated content registry for all 11 projects
- `v4.js` — project workspace, tabs, deep links, auto-scroll, navigation, and image lightbox
- `tools/build_v5_project_data.py` — rebuilds the concise project registry and galleries
- `tools/update_index_v5.py` — reapplies V5 main-page copy, card data, and experience entries
- `assets/graphics/experience-role-map.svg` — labeled non-photographic visual for Makerspace and Vanquish Products
- `assets/images/` and `assets/screenshots/` — project evidence used by the galleries

## Measurement note

The PFC snapshot reports 95.0 hours of observed sleep, 13.19 kWh estimated avoided energy over seven days, 68.23 kWh projected over 30 days, and a projected annual value of $290.54. Sleep history is observed from retained state. Avoided-energy and dollar values use configured power baselines and remain estimates until direct host metering is added.
