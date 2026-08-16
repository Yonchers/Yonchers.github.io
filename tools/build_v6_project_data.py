from __future__ import annotations

import csv
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "project-tabs-data.js"


def e(value: object) -> str:
    return html.escape(str(value), quote=True)


def heading(kicker: str, title: str, note: str | None = None) -> str:
    note_html = f"<p>{e(note)}</p>" if note else ""
    return (
        '<div class="project-section-heading compact">'
        f'<div><p class="project-eyebrow">{e(kicker)}</p><h2>{e(title)}</h2></div>'
        f'{note_html}</div>'
    )


def overview(title: str, cards: list[tuple[str, str, str]]) -> str:
    blocks = "".join(
        f'<article><p class="project-eyebrow">{e(k)}</p><h3>{e(t)}</h3><p>{e(c)}</p></article>'
        for k, t, c in cards
    )
    return heading("Overview", title) + f'<div class="project-overview-grid">{blocks}</div>'


def decisions(title: str, items: list[tuple[str, str]]) -> str:
    blocks = "".join(
        f'<article class="project-decision"><span>{i:02d}</span><div><h3>{e(t)}</h3><p>{e(c)}</p></div></article>'
        for i, (t, c) in enumerate(items, 1)
    )
    return heading("Engineering", title) + f'<div class="project-decision-grid compact-decisions">{blocks}</div>'


def results(title: str, items: list[tuple[str, str]]) -> str:
    blocks = "".join(
        f'<article><span>{i:02d}</span><h3>{e(t)}</h3><p>{e(c)}</p></article>'
        for i, (t, c) in enumerate(items, 1)
    )
    return heading("Results", title) + f'<div class="project-outcome-grid compact-outcomes">{blocks}</div>'


def future(title: str, items: list[tuple[str, str]]) -> str:
    blocks = "".join(
        f'<article><span>{i:02d}</span><h3>{e(t)}</h3><p>{e(c)}</p></article>'
        for i, (t, c) in enumerate(items, 1)
    )
    return heading("Current R&D", title) + f'<div class="project-flow compact-flow">{blocks}</div>'


def documentation(title: str, images: list[dict[str, str]], note: str | None = None) -> str:
    figures = []
    for item in images:
        classes = []
        if item.get("kind") == "screenshot":
            classes.append("screenshot")
        if item.get("orientation"):
            classes.append(item["orientation"])
        cls = f' class="{" ".join(classes)}"' if classes else ""
        caption = f'{item["title"]} — {item["copy"]}'
        figures.append(
            f'<figure{cls}>'
            f'<button type="button" data-lightbox data-caption="{e(caption)}">'
            f'<img loading="lazy" src="{e(item["src"])}" alt="{e(item["alt"])}"></button>'
            f'<figcaption><strong>{e(item["title"])}</strong>{e(item["copy"])}</figcaption>'
            '</figure>'
        )
    note_html = f'<p class="documentation-note">{e(note)}</p>' if note else ""
    return (
        heading("Documentation", title)
        + note_html
        + f'<div class="project-gallery documentation-carousel gallery-count-{len(images)}">{"".join(figures)}</div>'
    )


def reference_tab(intro: str, contribution: str, refs: list[tuple[str, str]]) -> str:
    chips = "".join(
        f'<a class="project-reference-chip" href="{e(url)}" rel="noreferrer" target="_blank">{e(label)} <span>↗</span></a>'
        for label, url in refs
    )
    return (
        heading("References", "Upstream projects and technical references")
        + '<div class="reference-callout">'
        f'<p>{e(intro)}</p><p><strong>My work:</strong> {e(contribution)}</p>'
        f'<div class="project-reference-list">{chips}</div></div>'
    )


def metrics(*pairs: tuple[str, str]) -> list[dict[str, str]]:
    return [{"value": v, "label": l} for v, l in pairs]


def table(headers: list[str], rows: list[list[str]], classes: str = "") -> str:
    head = "".join(f"<th>{e(h)}</th>" for h in headers)
    body = "".join(
        "<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>" for row in rows
    )
    return f'<div class="benchmark-table-wrap"><table class="benchmark-table {classes}"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'


G = {
    "print-orchestrator": [
        {"src": "assets/screenshots/print-orchestrator-dashboard-v6.png", "alt": "Print Orchestrator fleet dashboard", "title": "Fleet control", "copy": "PrusaLink and Moonraker/Klipper machines share one operator view without losing machine-specific controls.", "kind": "screenshot", "orientation": "portrait"},
        {"src": "assets/screenshots/print-orchestrator-power.png", "alt": "Print Orchestrator power observation page", "title": "Power observation", "copy": "Kasa smart-plug telemetry tracks printers and the B70 server while also enabling remote power control.", "kind": "screenshot", "orientation": "portrait"},
        {"src": "assets/images/pi-case-render.png", "alt": "Parametric Raspberry Pi enclosure prepared for printing", "title": "AI-assisted CAD output", "copy": "This enclosure is an output artifact from the prototype OpenSCAD and slicing workflow; full unattended operation is still being validated.", "orientation": "landscape"},
        {"src": "assets/images/pfp-server-pi-case.jpg", "alt": "Raspberry Pi enclosure installed on the PFP server", "title": "Installed enclosure", "copy": "The printed enclosure is mounted on the server and supports the low-power control node used by the wider automation stack.", "orientation": "portrait"},
    ],
    "pfc-supervisor": [
        {"src": "assets/screenshots/pfc-power-management-v6.png", "alt": "PFC power management dashboard", "title": "Power management", "copy": "Power policy, workload attribution, schedule protection, and estimated savings are visible in one control surface.", "kind": "screenshot", "orientation": "portrait"},
        {"src": "assets/screenshots/pfc-energy-ledger-v6.png", "alt": "PFC energy ledger", "title": "Energy ledger", "copy": "Observed sleep history is kept separate from modeled avoided energy and projected cost savings.", "kind": "screenshot", "orientation": "portrait"},
        {"src": "assets/screenshots/pfc-ai-runtime-v6.png", "alt": "PFC AI runtime reconciliation page", "title": "Runtime reconciliation", "copy": "Model endpoints are checked after wake for process state, model identity, and required GPU offload.", "kind": "screenshot", "orientation": "portrait"},
        {"src": "assets/screenshots/pfc-eligibility-matrix-v6.png", "alt": "PFC subsystem eligibility matrix", "title": "Suspend safety matrix", "copy": "The policy engine explains exactly which subsystem allowed or blocked a suspend decision.", "kind": "screenshot", "orientation": "portrait"},
        {"src": "assets/screenshots/pfc-top-terminal.png", "alt": "PFC Top terminal interface", "title": "PFC Top", "copy": "A custom terminal-style interface makes compute, workloads, power policy, and energy status readable on the server display.", "kind": "screenshot", "orientation": "landscape"},
        {"src": "assets/images/pfc-top-physical.jpg", "alt": "PFC Top running on the physical server display", "title": "Physical monitoring", "copy": "The local screen keeps server health visible even when the main web interface is not open.", "orientation": "portrait"},
    ],
    "hermes": [
        {"src": "assets/screenshots/pfc-pulse.png", "alt": "PFC Pulse desktop voice companion", "title": "PFC Pulse", "copy": "A push-to-talk desktop companion uses Whisper speech recognition and Piper speech output around Hermes voice control.", "kind": "screenshot", "orientation": "portrait"},
        {"src": "assets/screenshots/pfc-command.png", "alt": "PFC Command compact desktop widget", "title": "PFC Command", "copy": "The compact widget exposes server state, workloads, and limited power actions without opening the full control plane.", "kind": "screenshot", "orientation": "portrait"},
        {"src": "assets/images/pi-case-render.png", "alt": "OpenSCAD Raspberry Pi enclosure output", "title": "Prompt-to-CAD output", "copy": "A Pi enclosure demonstrates the type of parametric output being developed for the Hermes-to-Print-Orchestrator workflow.", "orientation": "landscape"},
        {"src": "assets/screenshots/pfc-top-terminal.png", "alt": "PFC Top terminal data available to Hermes integrations", "title": "Shared operations data", "copy": "PFC, printer, power, and runtime data form the operational context used by the automation layer.", "kind": "screenshot", "orientation": "landscape"},
    ],
    "ai-server": [
        {"src": "assets/images/pfp-server-pi-case.jpg", "alt": "Custom B70 PFP server with Raspberry Pi enclosure and display", "title": "B70 / PFP system", "copy": "The physical server hosts local inference, orchestration services, power controls, and the local monitoring display.", "orientation": "portrait"},
        {"src": "assets/images/ai-img-8916.jpg", "alt": "Open B70 server chassis", "title": "Hardware integration", "copy": "Compute, cooling, power, storage, and service access were packaged into a custom enclosure.", "orientation": "portrait"},
        {"src": "assets/images/ai-img-8931.jpg", "alt": "B70 server display and enclosure", "title": "Operational system", "copy": "The platform is used for daily inference and engineering tools rather than benchmark-only testing.", "orientation": "portrait"},
        {"src": "assets/screenshots/pfc-ai-runtime-v6.png", "alt": "PFC AI runtime page showing local model services", "title": "Runtime operations", "copy": "llama.cpp services are monitored and reconciled through PFC after power-state changes.", "kind": "screenshot", "orientation": "portrait"},
    ],
    "e3ng": [
        {"src": "assets/images/e3ng-full-printer.jpg", "alt": "Complete E3NG CoreXY conversion", "title": "Complete machine", "copy": "The converted Ender platform is operating as a custom CoreXY printer with Klipper and networked control electronics.", "orientation": "portrait"},
        {"src": "assets/images/e3ng-img-7200-1.jpg", "alt": "E3NG toolhead probe and wiring", "title": "Toolhead sensing", "copy": "Probe integration and compact wiring support repeatable bed measurement and serviceability.", "orientation": "portrait"},
        {"src": "assets/images/e3ng-img-7128-1.jpg", "alt": "E3NG controller and Raspberry Pi electronics", "title": "Control hardware", "copy": "The controller, Raspberry Pi, networking, and toolhead electronics are integrated as one motion platform.", "orientation": "portrait"},
        {"src": "assets/images/e3ng-img-7150-1.jpg", "alt": "E3NG Klipper bed mesh heightmap", "title": "Measured calibration", "copy": "Bed-mesh and input-shaper data guide tuning instead of visual guesswork.", "orientation": "portrait"},
    ],
    "voron-systems": [
        {"src": "assets/images/voron-2-4-full-printer.jpg", "alt": "Complete enclosed Voron 2.4 printer", "title": "Complete Voron 2.4", "copy": "The enclosed CoreXY system is commissioned for technical materials, functional parts, and repeatable maintenance.", "orientation": "portrait"},
        {"src": "assets/images/voron-img-6388-1.jpg", "alt": "Voron toolhead and printed components", "title": "Functional printed assembly", "copy": "Printed mechanical components are used to validate fit, material behavior, and machine repeatability.", "orientation": "portrait"},
    ],
    "metuned": [
        {"src": "assets/images/metuned-copy-of-proto-2.jpg", "alt": "Metuned digital dash enclosure prototype", "title": "Enclosure prototype", "copy": "The housing establishes display fit, airflow, service access, and product identity.", "orientation": "landscape"},
        {"src": "assets/images/metuned-copy-of-proto-4-1.jpg", "alt": "Metuned PCB and enclosure fitment", "title": "Electronics fitment", "copy": "PCB placement, connectors, wiring, and cooling were evaluated as one product package.", "orientation": "landscape"},
    ],
    "motorsports": [
        {"src": "assets/images/motorsports-thebigpicture-1.jpg", "alt": "Sierra College Cars and Coffee event", "title": "Community event", "copy": "Cars and Coffee events built visibility, recruited support, and helped fund the motorsports program.", "orientation": "landscape"},
        {"src": "assets/images/motorsports-img-5023-2.jpg", "alt": "Fabricated motorsports component", "title": "Track-driven fabrication", "copy": "Repairs and brackets were developed around packaging, schedule, safety, and service constraints.", "orientation": "portrait"},
    ],
    "espresso-machine": [
        {"src": "assets/images/me190-full-assembly.png", "alt": "SolidWorks full assembly drawing for the ME190 espresso machine", "title": "Full assembly", "copy": "The 1:3 SolidWorks drawing documents the hand-actuated mechanism, brew group, reservoir, controls, and electronics packaging.", "orientation": "landscape"},
        {"src": "assets/images/espresso-image-113.jpg", "alt": "ME190 espresso machine lever mechanism prototype", "title": "Lever mechanism", "copy": "The mechanism translates hand input into the pressure path used for extraction.", "orientation": "portrait"},
        {"src": "assets/images/espresso-img-4665.jpg", "alt": "ME190 team presenting the espresso machine project", "title": "Design presentation", "copy": "The team presented requirements, architecture, and validation plans for the complete system.", "orientation": "landscape"},
        {"src": "assets/images/espresso-group1-standing.jpg", "alt": "ME190 espresso machine project team", "title": "Project team", "copy": "Mechanical, electrical, controls, documentation, and sponsored fabrication work were coordinated across the team.", "orientation": "landscape"},
    ],
    "uei-lab": [
        {"src": "assets/images/uei-img-8868.jpg", "alt": "Residential fan airflow test duct", "title": "Airflow test duct", "copy": "The controlled geometry supports repeatable residential-fan airflow and CFM measurements.", "orientation": "landscape"},
        {"src": "assets/images/uei-img-8870.jpg", "alt": "Wood test room and fan fixture", "title": "Controlled test room", "copy": "The eight-foot test environment was built, sealed, and maintained for standards-driven testing.", "orientation": "landscape"},
        {"src": "assets/images/manufacturing-img-8774.jpg", "alt": "Wooden test fixture under construction", "title": "Fixture construction", "copy": "Practical fixture work included construction, sealing, repair, and preparation before measurement.", "orientation": "portrait"},
    ],
    "abb-rexroth": [
        {"src": "assets/images/me165-image-111.jpg", "alt": "ABB robot and Rexroth controls in the ME165 laboratory", "title": "Industrial robotics lab", "copy": "The supervised setup connected robot hardware, controller interfaces, cabling, I/O, and emergency-stop behavior.", "orientation": "portrait"},
    ],
    "makerspace-manufacturing": [
        {"src": "assets/images/makerspace-laser-training.jpg", "alt": "Joseph working with another user at a makerspace laser cutter", "title": "Laser-system support", "copy": "User training included safe setup, file preparation, process checks, and supervised operation.", "orientation": "landscape"},
        {"src": "assets/images/makerspace-prusa-mk4.jpg", "alt": "Prusa MK4 printer assembled in the makerspace", "title": "Printer setup", "copy": "Makerspace work included assembling, configuring, maintaining, and supporting additive-manufacturing equipment.", "orientation": "portrait"},
        {"src": "assets/images/manufacturing-img-8774.jpg", "alt": "Woodworking fixture in a shop environment", "title": "Hands-on shop work", "copy": "The role required practical setup, safe tool use, troubleshooting, and clear handoff to other users.", "orientation": "portrait"},
    ],
}


projects: dict[str, dict] = {}
order: list[str] = []


def add(project: dict) -> None:
    projects[project["id"]] = project
    order.append(project["id"])


# Print Orchestrator
pipeline = (
    heading("Automation pipeline", "Hermes can turn a request into a controlled printer workflow")
    + '<div class="automation-pipeline">'
    + ''.join(
        f'<article><span>{i:02d}</span><h3>{e(t)}</h3><p>{e(c)}</p></article>'
        for i, (t, c) in enumerate([
            ("Prompt / job request", "Hermes receives a part request or a prepared model."),
            ("Parametric CAD", "OpenSCAD scripts can be generated or modified from a prompt."),
            ("CLI slicing", "A modified OrcaSlicer command-line path prepares G-code."),
            ("Preflight checks", "Printer state, power, connectivity, and bed occupancy are checked."),
            ("API dispatch", "Print Orchestrator selects and controls the appropriate machine."),
            ("Vision monitoring", "A modified Obico container evaluates camera frames and can warn through Discord."),
        ], 1)
    )
    + '</div><p class="project-caveat"><strong>Status:</strong> the backend pipeline is implemented in parts and remains under end-to-end validation. The Pi enclosure is an output artifact from the prototype workflow; fully unattended production is still being validated.</p>'
)
power_html = (
    heading("Power", "Kasa smart plugs connect energy telemetry to printer automation")
    + '<div class="savings-kpi-grid blue-kpis">'
    + '<article><strong>Fleet + server</strong><span>printer and B70 power telemetry</span></article>'
    + '<article><strong>Remote control</strong><span>safe power-on and power-off actions</span></article>'
    + '<article><strong>Hermes-ready</strong><span>actions exposed to scripts and automations</span></article>'
    + '</div><figure class="single-documentation"><button type="button" data-lightbox data-caption="Print Orchestrator power observation page"><img src="assets/screenshots/print-orchestrator-power.png" alt="Print Orchestrator power observation page"></button><figcaption>Power history, device averages, state, and availability are reported per Kasa outlet.</figcaption></figure>'
)
add({
    "id": "print-orchestrator", "tone": "blue", "eyebrow": "AI automation frontend",
    "title": "Print Orchestrator", "lede": "A mixed-fleet control layer that gives Hermes a safe, inspectable way to create, prepare, dispatch, monitor, and power printer jobs.",
    "status": ["Active", "Private project", "PrusaLink + Moonraker/Klipper"],
    "image": G["print-orchestrator"][0]["src"], "imageAlt": G["print-orchestrator"][0]["alt"], "imageCaption": "Live mixed-fleet control panel.", "imageFit": "contain", "gallery": G["print-orchestrator"],
    "metrics": metrics(("3 printers", "mixed fleet in the current dashboard"), ("AI vision", "failure warnings through Discord"), ("Bed check", "part-detection start interlock"), ("Kasa", "power telemetry and control")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("A printer dashboard that also acts as an automation API.", [
            ("Operator view", "One place for the fleet", "Jobs, cameras, temperatures, power, part detection, files, and recovery states are kept together."),
            ("Automation role", "Hermes controls physical work through it", "Print Orchestrator exposes the machine state and actions needed for AI-assisted CAD, slicing, dispatch, and monitoring."),
        ])},
        {"id": "engineering", "label": "Engineering", "html": decisions("The API keeps automation tied to real machine state.", [
            ("Preserve machine differences", "PrusaLink and Moonraker/Klipper devices keep their actual capabilities and limits."),
            ("Block unsafe starts", "Part detection can prevent a job from starting while an object remains on the bed."),
            ("Separate detection from action", "Vision warnings, operator review, and control actions remain distinct so a model result does not silently become a machine command."),
        ])},
        {"id": "pipeline", "label": "Automation", "html": pipeline},
        {"id": "power", "label": "Power", "html": power_html},
        {"id": "documentation", "label": "Documentation", "html": documentation("Control panels and a prototype workflow output.", G["print-orchestrator"])},
        {"id": "results", "label": "Results", "html": results("The printer fleet now has one automation-ready control surface.", [
            ("Shared fleet state", "Mixed printer protocols are translated into a consistent operator and API model."),
            ("Safer automation", "Power, bed occupancy, connectivity, and failure warnings are visible before actions are taken."),
            ("Foundation for autonomy", "The current system can grow toward automatic resetting and part removal without redesigning the software boundary."),
        ])},
        {"id": "future", "label": "Future Work", "html": future("Move from assisted orchestration toward a repeatable print cell.", [
            ("End-to-end validation", "Test prompt-to-CAD, slicing, preflight, dispatch, and monitoring as one measured workflow."),
            ("Robotic reset", "Add a mechanism that can remove finished parts and prepare the bed for the next job."),
            ("Production reporting", "Track job yield, failure causes, intervention time, and energy per completed part."),
        ])},
        {"id": "references", "label": "References", "html": reference_tab(
            "Print Orchestrator is Joseph's private control and automation project. It integrates established open-source tools rather than claiming their upstream work.",
            "API design, mixed-fleet normalization, power integration, part-detection interlocks, Hermes workflows, modified CLI slicing, modified Obico deployment, and the control interface.",
            [("OpenSCAD docs", "https://openscad.org/documentation"), ("OrcaSlicer", "https://github.com/OrcaSlicer/OrcaSlicer"), ("Obico failure detection", "https://www.obico.io/blog/how-obico-ai-failure-detection-works/"), ("Klipper docs", "https://www.klipper3d.org/")]
        )},
    ],
    "next": "Validate the full automated workflow and add physical part removal only after the safety and recovery paths are measured.",
    "fallbackPage": "projects/print-orchestrator/",
})

# PFC
savings = (
    heading("Power savings", "The current snapshot records 95 hours of sleep")
    + '<div class="savings-kpi-grid">'
    + '<article><strong>95.0 h</strong><span>observed sleep history</span></article>'
    + '<article><strong>13.19 kWh</strong><span>estimated avoided energy over seven days</span></article>'
    + '<article><strong>2.27 kWh/day</strong><span>average estimated savings</span></article>'
    + '<article><strong>68.23 kWh</strong><span>projected over 30 days</span></article>'
    + '<article><strong>$290.54/yr</strong><span>current projected annual value</span></article>'
    + '</div><p class="project-caveat"><strong>Measurement note:</strong> sleep duration is retained from system-state history. Avoided energy and dollar values are modeled from configured power baselines until direct host metering is available.</p>'
)
minecraft = (
    heading("Access control", "A separate Minecraft surface demonstrates safe delegation")
    + '<div class="project-overview-grid">'
    + '<article><p class="project-eyebrow">Launcher</p><h3>In-house and AI-assisted</h3><p>Automatic installation and updates reduce support work for the private server.</p></article>'
    + '<article><p class="project-eyebrow">Permissions</p><h3>Friends only see Minecraft controls</h3><p>Moderator and player access is separated from AI-runtime and power-administration functions.</p></article>'
    + '<article><p class="project-eyebrow">Network</p><h3>Tailscale and reverse proxying</h3><p>Remote access is designed around identity, limited scope, and private infrastructure rather than exposing the control plane directly.</p></article>'
    + '</div>'
)
add({
    "id": "pfc-supervisor", "tone": "green", "eyebrow": "Power and runtime control plane",
    "title": "PFC Supervisor", "lede": "A supervisory layer that coordinates local AI runtimes, server sleep, protected schedules, recovery, and energy reporting across the PFP/B70 infrastructure.",
    "status": ["Active", "Private project", "Power + runtime orchestration"],
    "image": G["pfc-supervisor"][0]["src"], "imageAlt": G["pfc-supervisor"][0]["alt"], "imageCaption": "Power Management command center.", "imageFit": "contain", "gallery": G["pfc-supervisor"],
    "metrics": metrics(("95.0 h", "observed sleep"), ("13.19 kWh", "estimated seven-day avoidance"), ("$290.54/yr", "current projection"), ("Fail-safe", "blocked on stale or unknown state")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("A control plane for an AI server that should not stay awake without a reason.", [
            ("Power policy", "Sleep when idle, wake for work", "PFC combines host state, workloads, schedules, leases, and safety rules before allowing a suspend."),
            ("Runtime recovery", "Wake is not the end of the process", "llama.cpp endpoints are reconciled after wake so model identity and GPU offload are verified before service is accepted as healthy."),
        ])},
        {"id": "engineering", "label": "Engineering", "html": decisions("The system favors explainable, reversible state changes.", [
            ("Treat unknown as unsafe", "Stale or missing telemetry blocks automatic suspend instead of being guessed away."),
            ("Protect scheduled work", "Hermes schedules stay cached on the low-power Pi so the server can still wake for future jobs."),
            ("Separate recommendation from policy", "Predicted sleep or wake windows remain advisory until explicitly saved."),
        ])},
        {"id": "savings", "label": "Power Savings", "html": savings},
        {"id": "documentation", "label": "Documentation", "html": documentation("The web control plane and the physical server display.", G["pfc-supervisor"])},
        {"id": "minecraft", "label": "Access Control", "html": minecraft},
        {"id": "results", "label": "Results", "html": results("PFC reduced idle runtime while keeping scheduled and active work protected.", [
            ("Measured sleep history", "Wake and sleep transitions are retained rather than inferred from missing power samples."),
            ("Inspectable policy", "Every suspend decision can be traced to explicit subsystem states and blockers."),
            ("Operational continuity", "PFC Top, cached schedules, and runtime reconciliation keep the system understandable across sleep/wake cycles."),
        ])},
        {"id": "future", "label": "Future Work", "html": future("Improve measurement accuracy and infrastructure recovery.", [
            ("Direct host metering", "Replace modeled host load with a dedicated metering source where practical."),
            ("Cross-machine diagnosis", "Let a Hermes agent on the workstation and server help inspect one another when either side is unavailable."),
            ("Longer retained history", "Build a larger measured dataset before relying on long-range projections or schedule recommendations."),
        ])},
        {"id": "references", "label": "References", "html": reference_tab(
            "PFC is Joseph's private supervisory application. It manages local services built on established infrastructure components.",
            "Power policy, energy ledger, schedule cache, wake/suspend safety matrix, runtime reconciliation, PFC Top, access-control surfaces, and integrated operational UI.",
            [("llama.cpp", "https://github.com/ggml-org/llama.cpp"), ("Hermes Agent docs", "https://hermes-agent.nousresearch.com/docs/"), ("Tailscale docs", "https://tailscale.com/kb")]
        )},
    ],
    "next": "Add direct host metering and validate cross-machine recovery before expanding autonomous policy changes.",
    "fallbackPage": "projects/pfc-supervisor/",
})

# Hermes
integrations = (
    heading("Integrations", "Hermes links local inference to the tools that operate the lab")
    + '<div class="hermes-integration-map">'
    + '<article><span>01</span><h3>Print Orchestrator</h3><p>CAD, slicing, dispatch, printer state, power, and failure warnings.</p></article>'
    + '<article><span>02</span><h3>PFC</h3><p>Runtime state, schedule protection, energy policy, and server recovery.</p></article>'
    + '<article><span>03</span><h3>Desktop</h3><p>PFC Pulse, PFC Command, voice input, and limited control surfaces.</p></article>'
    + '<article><span>04</span><h3>Discord</h3><p>Notifications, scheduled outputs, planned meeting summaries, and action-item delivery.</p></article>'
    + '</div>'
)
meeting = (
    heading("Meeting automation", "Reduce administrative overhead in engineering meetings")
    + '<div class="project-flow compact-flow">'
    + '<article><span>01</span><h3>Capture</h3><p>Transcribe Discord or in-person audio and identify speakers where the source supports it.</p></article>'
    + '<article><span>02</span><h3>Understand</h3><p>Translate when needed, summarize the discussion, and extract decisions and action items.</p></article>'
    + '<article><span>03</span><h3>Organize</h3><p>Prepare calendar entries, deadlines, and follow-up notes for review before saving.</p></article>'
    + '<article><span>04</span><h3>Deliver</h3><p>Publish a concise record to Discord or another approved destination.</p></article>'
    + '</div><p class="project-caveat"><strong>Status:</strong> active R&amp;D. These workflows are not presented as finished production features.</p>'
)
add({
    "id": "hermes", "tone": "orange", "eyebrow": "Local agent and automation layer",
    "title": "Hermes automation stack", "lede": "A locally hosted Hermes Agent deployment configured to route work between llama.cpp models, PFC, Print Orchestrator, desktop tools, Discord, and scheduled automations.",
    "status": ["Active", "Built on Nous Research Hermes", "Local-first automation"],
    "image": G["hermes"][0]["src"], "imageAlt": G["hermes"][0]["alt"], "imageCaption": "PFC Pulse voice companion on the main workstation.", "imageFit": "contain", "gallery": G["hermes"],
    "metrics": metrics(("2 roles", "manager + worker routing"), ("Whisper", "speech recognition"), ("Piper", "speech output"), ("Cross-system", "PFC + printers + desktop")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("The agent layer connecting local models to physical and operational systems.", [
            ("Inference", "Local llama.cpp endpoints", "Muse handles manager duties while Qwen3.6 handles high-throughput tool and implementation work."),
            ("Automation", "Tools remain behind explicit interfaces", "Hermes acts through PFC and Print Orchestrator instead of receiving unrestricted access to every service."),
        ])},
        {"id": "integrations", "label": "Integrations", "html": integrations},
        {"id": "documentation", "label": "Documentation", "html": documentation("Desktop controls and shared automation outputs.", G["hermes"])},
        {"id": "meetings", "label": "Meeting R&D", "html": meeting},
        {"id": "engineering", "label": "Engineering", "html": decisions("AI assistance is useful only when the boundaries remain clear.", [
            ("Separate manager and worker roles", "Model choice is based on scope control, recovery, coding, tool use, and throughput rather than one general score."),
            ("Keep control surfaces narrow", "PFC Command and project APIs expose the actions a workflow needs without exposing the entire infrastructure."),
            ("Verify AI-generated work", "Hermes and ChatGPT accelerate implementation and troubleshooting, while architecture, testing, and final decisions remain human-owned."),
        ])},
        {"id": "future", "label": "Future Work", "html": future("Make the automation layer more durable and useful in engineering workflows.", [
            ("Cross-machine recovery agent", "Connect the workstation and server so each can help inspect the other during an outage."),
            ("Production model evaluation", "Continue role-specific tests for manager and worker duties as models and llama.cpp builds change."),
            ("Meeting assistant", "Validate transcription, translation, summarization, calendars, and action-item extraction with review gates."),
        ])},
        {"id": "references", "label": "References", "html": reference_tab(
            "Hermes Agent is the upstream Nous Research platform. My work covers local deployment, model routing, tools, voice interfaces, schedules, and integrations with PFC and Print Orchestrator.",
            "Local model routing, llama.cpp endpoints, PFC/Print-Orchestrator integrations, PFC Pulse, PFC Command, scheduled workflows, and ongoing recovery/meeting automation development.",
            [("Hermes Agent docs", "https://hermes-agent.nousresearch.com/docs/"), ("llama.cpp", "https://github.com/ggml-org/llama.cpp"), ("OpenSCAD docs", "https://openscad.org/documentation")]
        )},
    ],
    "next": "Validate the cross-machine recovery design and meeting workflows before treating them as operational services.",
    "fallbackPage": "projects/hermes/",
})

# AI server benchmarks
standard_rows = [
    ["Gemma 4 E2B", "Q4_K_XL", "5315.26 ± 96.11", "136.58 ± 0.12"],
    ["Gemma 4 E4B", "Q4_K_XL", "3165.46 ± 64.46", "88.48 ± 0.39"],
    ["Gemma 4 12B", "Q4_K_XL", "1511.79 ± 3.94", "49.04 ± 0.26"],
    ["Gemma 4 26B-A4B", "Q4_K_M", "772.25 ± 86.10", "66.89 ± 8.71"],
    ["Qwen3.6 35B-A3B", "Q5_K_XL", "724.97 ± 68.36", "75.63 ± 1.19"],
    ["Qwen3.6 35B-A3B", "Q5_K_S", "724.90 ± 68.10", "72.77 ± 3.28"],
    ["Qwen3.6 35B-A3B", "Q4_K_M", "706.68 ± 97.73", "77.52 ± 1.98"],
    ["Muse-Glimmer 30B", "Q5_K_XL", "569.33 ± 77.41", "22.00 ± 0.02"],
    ["Kanana 2 30B-A3B", "Q4_K_M", "593.42 ± 37.51", "28.18 ± 0.08"],
    ["Qwen 3.8 27B", "Q6_K", "485.92 ± 80.05", "19.92 ± 0.03"],
    ["Gemma 4 31B", "Q4_K_XL", "427.72 ± 16.36", "22.62 ± 0.07"],
    ["Qwen3.5 0.8B", "Q8_K_XL", "14262.06 ± 1417.45", "202.79 ± 0.35"],
]
standard_html = (
    heading("Standardized llama-bench", "Full model throughput library")
    + '<p class="benchmark-method">SYCL backend · pp512 + tg128 · 3 repetitions · <code>-ngl 99</code> · llama.cpp build 10369. A llama-server process warning was present during the chosen reference sweep, so these values remain the normal comparison set rather than a laboratory-isolated claim.</p>'
    + table(["Model", "Quant", "pp512 tok/s", "tg128 tok/s"], [[e(c) for c in r] for r in standard_rows], "compact-benchmark")
    + '<div class="data-downloads"><a href="assets/downloads/b70-standardized-llama-bench-2026-08-14.csv" download>Download standardized CSV ↓</a></div>'
)
mtp_rows = [
    ["Gemma 4 12B", "47.863", "n2", "71.555", "76.35%", "1.495×"],
    ["Gemma 4 26B-A4B", "75.318", "n4", "93.331", "63.61%", "1.239×"],
    ["Gemma 4 31B", "22.100", "n2", "33.060", "81.44%", "1.496×"],
    ["Qwen3.6 35B-A3B Q5_K_S", "77.153", "baseline", "77.153", "—", "1.000×"],
    ["Qwen 3.8 27B", "19.870", "n2", "33.196", "70.70%", "1.671×"],
]
mtp_html = (
    heading("Broad MTP sweep", "Speculative decoding helped some models and hurt others")
    + table(["Model", "Baseline", "Best mode", "Best decode", "Acceptance", "Speedup"], [[e(c) for c in r] for r in mtp_rows], "compact-benchmark")
    + '<p class="project-caveat">n2 was usually the useful setting, n4 won for Gemma 26B-A4B, n8 was consistently harmful, and Qwen3.6 was faster without MTP. Baseline-only rows in the source file are labeled as not measured in this sweep rather than unsupported.</p>'
    + '<div class="data-downloads"><a href="assets/downloads/mtp-broad-sweep-2026-08-14.csv" download>Download broad sweep CSV ↓</a></div>'
)
production_html = (
    heading("Production profiles", "The configurations actually serving Hermes")
    + '<div class="production-profile-grid">'
    + '<article class="production-profile manager"><span>MANAGER</span><h3>Muse-Glimmer 30B Q5_K_XL</h3><p>llama.cpp / SYCL · 131K context · Q8_0 KV · medium reasoning · DFlash n2 / p-min 0.30</p><div><strong>29.2 tok/s</strong><small>~71.2% draft acceptance</small></div><ul><li>~21.4 tok/s native</li><li>~36% selected improvement</li><li>Higher-speed low-reasoning tests made more mistakes</li></ul></article>'
    + '<article class="production-profile worker"><span>WORKER</span><h3>Qwen3.6 35B-A3B Q5_K_XL</h3><p>llama.cpp / SYCL · 131K context · q4_1 KV · custom Jinja tool template · native decode</p><div><strong>68–71 tok/s</strong><small>MTP tested and rejected</small></div><ul><li>Q5_K_S reached ~72.9 tok/s in testing</li><li>Q5_K_XL remains the selected production worker</li><li>Production script differs from the simpler router preset</li></ul></article>'
    + '</div><div class="data-downloads"><a href="assets/downloads/production-model-profiles-2026-08-15.csv" download>Download profile summary CSV ↓</a></div>'
)
add({
    "id": "ai-server", "tone": "orange", "eyebrow": "Local AI infrastructure",
    "title": "B70 / PFP local AI server", "lede": "A custom local-inference platform built around llama.cpp, SYCL, role-specific model testing, production service profiles, and integration with Hermes and PFC.",
    "status": ["Active", "llama.cpp inference", "Manager + worker services"],
    "image": G["ai-server"][0]["src"], "imageAlt": G["ai-server"][0]["alt"], "imageCaption": "Custom B70/PFP server with local control node and display.", "imageFit": "contain", "gallery": G["ai-server"],
    "metrics": metrics(("29.2 tok/s", "Muse manager with DFlash"), ("68–71 tok/s", "Qwen3.6 worker native"), ("131K", "production context"), ("llama.cpp", "preferred inference engine")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("Local inference as an engineering platform rather than a single benchmark.", [
            ("Hardware", "Custom B70 / PFP system", "The server combines compute, cooling, power, storage, local display, and service access in one working platform."),
            ("Software", "llama.cpp is the inference layer", "Deployment, model selection, quantization, KV strategy, context, GPU offload, templates, routing, and recovery are tuned around the upstream engine."),
        ])},
        {"id": "production", "label": "Production Profiles", "html": production_html},
        {"id": "benchmarks", "label": "Full Benchmarks", "html": standard_html},
        {"id": "mtp", "label": "MTP Sweep", "html": mtp_html},
        {"id": "documentation", "label": "Documentation", "html": documentation("Physical hardware and the runtime control surface.", G["ai-server"])},
        {"id": "engineering", "label": "Engineering", "html": decisions("Models enter production only after role-specific testing.", [
            ("Benchmark methods separately", "Standard llama-bench, end-to-end decode, and speculative-decoding studies are not mixed into one ranking."),
            ("Select for the role", "Manager tests emphasize scope, delegation, and recovery; worker tests emphasize coding, tool use, debugging, and throughput."),
            ("Keep deployed profiles explicit", "The selected Muse and Qwen startup settings are treated separately from router presets and research configurations."),
        ])},
        {"id": "results", "label": "Results", "html": results("The system now has measured, role-specific production choices.", [
            ("Faster manager", "DFlash raises selected Muse generation from about 21.4 to 29.2 tok/s at roughly 71% acceptance."),
            ("Fast native worker", "Qwen3.6 serves tool and implementation work at about 68–71 tok/s without speculative overhead."),
            ("Traceable research", "Standardized throughput, broad MTP tests, and active production profiles remain separate and downloadable."),
        ])},
        {"id": "references", "label": "References", "html": reference_tab(
            "llama.cpp is the upstream local-inference engine used throughout the system.",
            "Hardware integration, SYCL deployment, containers, model/quant selection, KV/cache tuning, speculative-decoding experiments, custom tool templates, benchmarks, service startup, PFC recovery, and Hermes routing.",
            [("llama.cpp", "https://github.com/ggml-org/llama.cpp"), ("Hermes Agent docs", "https://hermes-agent.nousresearch.com/docs/")]
        )},
    ],
    "next": "Refresh the standardized sweep with the next model set while preserving older rows as explicitly labeled historical data.",
    "fallbackPage": "projects/ai-server/",
})

# E3NG
add({
    "id": "e3ng", "tone": "orange", "eyebrow": "CoreXY conversion",
    "title": "E3NG CoreXY conversion", "lede": "An Ender 3 platform rebuilt into a custom CoreXY machine with Klipper, networked electronics, sensing, and a measured commissioning workflow.",
    "status": ["Working machine", "CoreXY + Klipper", "Custom integration"],
    "image": G["e3ng"][0]["src"], "imageAlt": G["e3ng"][0]["alt"], "imageCaption": "Complete E3NG conversion.", "imageFit": "contain", "gallery": G["e3ng"],
    "metrics": metrics(("CoreXY", "motion conversion"), ("Klipper", "firmware and tuning"), ("CAN-style", "toolhead networking"), ("Measured", "mesh and resonance tuning")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("A printer rebuild that became a complete controls project.", [
            ("Mechanical", "CoreXY frame and motion", "The conversion required frame alignment, belt routing, gantry setup, toolhead packaging, and a complete rebuild of the motion system."),
            ("Controls", "Firmware, sensing, and networks", "Klipper, the Raspberry Pi, controller, probe, toolhead electronics, and calibration data were commissioned together."),
        ])},
        {"id": "engineering", "label": "Engineering", "html": decisions("Mechanical accuracy came before software compensation.", [
            ("Square the machine first", "Frame, belt, and gantry errors were addressed before relying on firmware compensation."),
            ("Use measured tuning", "Bed mesh and resonance data guided configuration changes."),
            ("Keep electronics serviceable", "Controllers, networking, wiring, and toolhead connections remain reachable for diagnosis."),
        ])},
        {"id": "documentation", "label": "Documentation", "html": documentation("The complete machine, electronics, toolhead, and calibration output.", G["e3ng"])},
        {"id": "results", "label": "Results", "html": results("The conversion became a usable custom motion platform.", [
            ("Working CoreXY machine", "The rebuilt mechanics, firmware, and sensing operate as one system."),
            ("Repeatable commissioning", "Faults can be separated into mechanical, electrical, networking, and software layers."),
            ("Automation experience", "The project mirrors small-scale machine commissioning and maintenance work."),
        ])},
        {"id": "references", "label": "References", "html": reference_tab(
            "E3NG is an upstream RH3D Ender 3 NG CoreXY conversion project.",
            "Mechanical build, electronics integration, Raspberry Pi/controller setup, toolhead networking, Klipper configuration, sensing, commissioning, tuning, and maintenance.",
            [("RH3D E3NG", "https://github.com/RH3D/E3NG"), ("Klipper docs", "https://www.klipper3d.org/")]
        )},
    ],
    "next": "Continue enclosure, thermal, and material-profile work while documenting repeatability over longer production use.",
    "fallbackPage": "projects/e3ng/",
})

# Voron
add({
    "id": "voron-systems", "tone": "orange", "eyebrow": "Enclosed CoreXY system",
    "title": "Voron 2.4", "lede": "An enclosed CoreXY printer commissioned for technical materials, functional parts, calibration, maintenance, and repeatable operation.",
    "status": ["Working machine", "Voron 2.4", "Technical materials"],
    "image": G["voron-systems"][0]["src"], "imageAlt": G["voron-systems"][0]["alt"], "imageCaption": "Complete enclosed Voron 2.4.", "imageFit": "contain", "gallery": G["voron-systems"],
    "metrics": metrics(("Voron 2.4", "open-source platform"), ("Enclosed", "thermal control"), ("CoreXY", "high-speed motion"), ("Technical", "functional materials")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("A printer treated as production equipment.", [
            ("Purpose", "Functional prototyping", "The enclosed platform supports parts and materials that need controlled motion, temperature, and repeatable setup."),
            ("My work", "Build, tune, maintain", "Assembly, frame accuracy, belts, gantry alignment, electronics, toolheads, calibration, profiles, and troubleshooting are handled as one system."),
        ])},
        {"id": "engineering", "label": "Engineering", "html": decisions("Reliability begins with disciplined assembly.", [
            ("Build square before tuning", "Frame and gantry geometry determine the limit of later calibration."),
            ("Control the thermal process", "Enclosure behavior and material profiles are part of the mechanical system."),
            ("Maintain for uptime", "Repeatable checks make ambiguous failures easier to isolate and repair."),
        ])},
        {"id": "documentation", "label": "Documentation", "html": documentation("The complete machine and a functional printed assembly.", G["voron-systems"])},
        {"id": "results", "label": "Results", "html": results("The machine supports repeatable technical work.", [
            ("Functional parts", "The system produces components for other engineering builds."),
            ("Commissioning practice", "Assembly, inspection, tuning, and verification are treated as one workflow."),
            ("Maintenance discipline", "Recovery and uptime are part of machine ownership rather than afterthoughts."),
        ])},
        {"id": "references", "label": "References", "html": reference_tab(
            "VORON2.4 is an upstream open-source printer platform from Voron Design.",
            "Assembly, electronics integration, alignment, belts and gantry work, Klipper configuration, tuning, modifications, maintenance, and technical-material operation.",
            [("VORON2.4", "https://vorondesign.com/voron2.4"), ("Voron docs", "https://docs.vorondesign.com/"), ("Klipper docs", "https://www.klipper3d.org/")]
        )},
    ],
    "next": "Add more documented technical-material parts and track the requirements each print was designed to meet.",
    "fallbackPage": "projects/voron-systems/",
})

# Metuned
add({
    "id": "metuned", "tone": "orange", "eyebrow": "Small-business product development",
    "title": "Metuned digital dash", "lede": "A race-electronics product concept developed from an endurance-racing information gap, with work spanning enclosure design, PCB packaging, cooling, service access, branding, and product direction.",
    "status": ["Small business founder", "Chief Design Officer", "Prototype"],
    "image": G["metuned"][0]["src"], "imageAlt": G["metuned"][0]["alt"], "imageCaption": "Printed Metuned enclosure prototype.", "imageFit": "cover", "gallery": G["metuned"],
    "metrics": metrics(("Prototype", "enclosure + PCB fit"), ("Cooling", "airflow and fan packaging"), ("Serviceable", "wiring and access"), ("Founder", "product and business direction")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("A product idea built from a trackside problem.", [
            ("Problem", "Drivers needed clearer information", "Factory instrumentation did not make the race car's condition clear enough during endurance use."),
            ("Role", "Co-founder and Chief Design Officer", "I led the mechanical package, prototype presentation, product identity, and the connection between racing needs and a manufacturable concept."),
        ])},
        {"id": "engineering", "label": "Engineering", "html": decisions("Packaging had to work inside a race car.", [
            ("Design around the electronics", "Display, PCB, connectors, wiring, and cooling set the enclosure geometry."),
            ("Preserve service access", "The prototype can be opened, rewired, inspected, and repaired."),
            ("Treat presentation as product work", "Branding and interface quality help communicate function and build trust."),
        ])},
        {"id": "documentation", "label": "Documentation", "html": documentation("Enclosure and electronics fitment prototypes.", G["metuned"])},
        {"id": "results", "label": "Results", "html": results("The concept advanced from a problem statement to a physical product direction.", [
            ("Physical package", "The enclosure and electronics were evaluated together."),
            ("Defined use case", "The project has a clear customer problem and development path."),
            ("Founder experience", "Engineering decisions were connected to business, presentation, and customer value."),
        ])},
    ],
    "next": "Document the next electronics revision and show the dash operating in a vehicle when the system is ready.",
    "fallbackPage": "projects/metuned/",
})

# Motorsports
add({
    "id": "motorsports", "tone": "orange", "eyebrow": "Leadership and fabrication",
    "title": "Sierra College Motorsports", "lede": "Student-led race preparation, fabrication, repairs, community events, sponsorship, and trackside execution around the Notta Miata Mini Cooper program.",
    "status": ["Club president", "Race preparation", "Community funding"],
    "image": G["motorsports"][0]["src"], "imageAlt": G["motorsports"][0]["alt"], "imageCaption": "Cars and Coffee event organized to support the program.", "imageFit": "cover", "gallery": G["motorsports"],
    "metrics": metrics(("$500", "starting Mini Cooper"), ("3 roles", "treasurer → VP → president"), ("Lemons", "endurance-racing program"), ("Team-led", "funding, repair, execution")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("A race program built under budget, schedule, and reliability constraints.", [
            ("Vehicle", "Notta Miata Mini Cooper", "The student team rebuilt and developed a low-cost car for endurance racing."),
            ("Leadership", "Move the program forward", "I helped organize planning, funding, recruitment, sponsorship, events, race preparation, and trackside work."),
        ])},
        {"id": "engineering", "label": "Engineering", "html": decisions("Trackside work rewards practical decisions.", [
            ("Design for service", "Repairs must account for packaging, access, fasteners, and the time available."),
            ("Fabricate around real constraints", "Brackets, mounts, and fixes must be strong enough, inspectable, and achievable with the available tools."),
            ("Coordinate mixed experience", "Tasks were divided so new and experienced members could contribute safely."),
        ])},
        {"id": "documentation", "label": "Documentation", "html": documentation("Community building and hands-on fabrication.", G["motorsports"])},
        {"id": "results", "label": "Results", "html": results("The program connected leadership with physical engineering work.", [
            ("Sustained team activity", "Events and outreach created a practical funding and recruitment pipeline."),
            ("Real repair experience", "Failures were diagnosed and corrected under race-preparation deadlines."),
            ("Leadership progression", "Responsibility grew from treasury to vice president and president."),
        ])},
        {"id": "references", "label": "References", "html": reference_tab(
            "The race program participated in the broader amateur endurance-racing ecosystem.",
            "Student-team planning, repairs, fabrication support, community events, sponsorship, recruitment, budgeting, and trackside execution.",
            [("24 Hours of Lemons", "https://24hoursoflemons.com/")]
        )},
    ],
    "next": "Add race-day photos and a concise vehicle-development timeline when those records are available.",
    "fallbackPage": "projects/motorsports/",
})

# Espresso
sponsorship = (
    heading("Sponsorship", "SendCutSend is supporting the senior project")
    + '<div class="sponsor-panel"><strong>$750</strong><div><h3>Store credit plus merchandise</h3><p>The sponsorship gives the team access to externally manufactured sheet and plate components while adding an industry-facing milestone to the project.</p></div></div>'
)
add({
    "id": "espresso-machine", "tone": "orange", "eyebrow": "ME190 senior design",
    "title": "Hybrid hand-actuated espresso machine", "lede": "A compact senior-design system combining a hand-actuated pressure mechanism with heating, pumping, sensing, controls, electronics packaging, and formal engineering documentation.",
    "status": ["Active senior project", "Team project", "SendCutSend sponsored"],
    "image": G["espresso-machine"][0]["src"], "imageAlt": G["espresso-machine"][0]["alt"], "imageCaption": "SolidWorks full assembly drawing, scale 1:3.", "imageFit": "contain", "gallery": G["espresso-machine"],
    "metrics": metrics(("9 bar", "target extraction pressure"), ("2 oz ±10%", "target shot volume"), ("25–30 s", "target pull time"), ("$750", "SendCutSend store credit")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("A complete appliance system rather than a lever alone.", [
            ("Mechanism", "Human input with controlled extraction", "The lever and linkage are designed around espresso pressure and volume targets."),
            ("Integration", "Thermal, fluid, electrical, and control systems", "The project combines the brew mechanism with heating, pumping, sensors, controls, packaging, and validation."),
        ])},
        {"id": "engineering", "label": "Engineering", "html": decisions("The mechanism and controls must be designed together.", [
            ("Start from measurable targets", "Pressure, volume, time, and envelope constraints define the system architecture."),
            ("Package for service and safety", "Water, heat, electrical hardware, and moving mechanisms need clear separation and access."),
            ("Document the full assembly", "Drawings, revisions, interfaces, and team handoffs are treated as engineering outputs."),
        ])},
        {"id": "documentation", "label": "Documentation", "html": documentation("CAD, mechanism, presentation, and team documentation.", G["espresso-machine"])},
        {"id": "sponsorship", "label": "Sponsorship", "html": sponsorship},
        {"id": "results", "label": "Current Status", "html": results("The design has a defined architecture, documented assembly, and external manufacturing support.", [
            ("Integrated CAD", "The full assembly captures the mechanical and control-system package."),
            ("Prototype mechanism", "The lever concept has moved into physical development."),
            ("Industry support", "SendCutSend is supporting the team with manufacturing credit and merchandise."),
        ])},
        {"id": "references", "label": "References", "html": reference_tab(
            "This is a Sacramento State ME190 team project documented through SolidWorks and senior-design deliverables.",
            "Electrical fundamentals, controls planning, efficiency constraints, wattage calculations, system integration, documentation, and team coordination.",
            [("SendCutSend", "https://sendcutsend.com/")]
        )},
    ],
    "next": "Complete fabrication, integrate the thermal and fluid systems, and validate pressure, volume, time, and repeatability.",
    "fallbackPage": "projects/espresso-machine/",
})

# UEI
add({
    "id": "uei-lab", "tone": "orange", "eyebrow": "Professional test engineering",
    "title": "UEI energy-efficiency testing", "lede": "Standards-driven appliance and ventilation testing through University Enterprises and Sacramento State, including controlled fixtures, instrumentation, data collection, repairs, and documentation.",
    "status": ["Professional work", "CEC-related testing", "HVI 916-style procedures"],
    "image": G["uei-lab"][0]["src"], "imageAlt": G["uei-lab"][0]["alt"], "imageCaption": "Residential fan airflow test duct.", "imageFit": "cover", "gallery": G["uei-lab"],
    "metrics": metrics(("8 ft", "controlled test-room scale"), ("CFM", "fan airflow measurements"), ("Thermal", "wet/dry bulb and appliance tests"), ("Standards", "procedure-driven documentation")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("Lab work where setup quality directly affects the result.", [
            ("Fixtures", "Controlled environments", "Test rooms and airflow fixtures were built, sealed, repaired, and prepared before measurement."),
            ("Instrumentation", "Pressure, flow, temperature, and power", "Tubing, sensors, thermocouples, loggers, and controlled conditions were coordinated for repeatable testing."),
        ])},
        {"id": "engineering", "label": "Engineering", "html": decisions("Repeatability starts before data collection.", [
            ("Control leakage and geometry", "Fixture condition and sealing affect airflow results."),
            ("Record setup changes", "Repairs and configuration changes remain part of the test record."),
            ("Follow the procedure", "Standards and safety determine the sequence, not convenience."),
        ])},
        {"id": "documentation", "label": "Documentation", "html": documentation("Airflow fixtures and controlled test environments.", G["uei-lab"])},
        {"id": "results", "label": "Experience", "html": results("The role developed practical test-engineering discipline.", [
            ("Standards exposure", "Procedures and compliance goals shaped the work."),
            ("Instrumentation practice", "Pressure, flow, temperature, and power measurements were handled together."),
            ("Documentation habits", "Setup, repairs, and changes were treated as part of the result."),
        ])},
    ],
    "next": "Add anonymized diagrams or sample data only when they can be shared appropriately.",
    "fallbackPage": "projects/uei-lab/",
})

# ABB
add({
    "id": "abb-rexroth", "tone": "orange", "eyebrow": "Industrial robotics coursework",
    "title": "ABB and Rexroth robotics lab", "lede": "Supervised ME165 coursework using ABB robot hardware and Rexroth controls, with attention to controller state, I/O, emergency-stop behavior, motion, and safe lab execution.",
    "status": ["ME165 coursework", "ABB hardware", "Rexroth controls"],
    "image": G["abb-rexroth"][0]["src"], "imageAlt": G["abb-rexroth"][0]["alt"], "imageCaption": "ABB robot and Rexroth controller hardware.", "imageFit": "contain", "gallery": G["abb-rexroth"],
    "metrics": metrics(("ABB", "industrial robot exposure"), ("Rexroth", "controller platform"), ("E-stop", "safety-state awareness"), ("ME165", "hands-on coursework")),
    "tabs": [
        {"id": "overview", "label": "Overview", "html": overview("Controls concepts connected to real industrial hardware.", [
            ("Hardware", "Robot and controller interfaces", "The lab connected motion, I/O, cabling, state, and safety behavior to controls theory."),
            ("Scope", "Academic hands-on exposure", "The work is presented accurately as supervised coursework rather than production ownership."),
        ])},
        {"id": "engineering", "label": "Engineering", "html": decisions("Safe state awareness came first.", [
            ("Understand the stop path", "Emergency-stop and controller state were part of every motion task."),
            ("Observe before changing", "Robot, controller, and I/O state were checked before commands were issued."),
            ("Document the actual scope", "Coursework and production experience are kept distinct."),
        ])},
        {"id": "documentation", "label": "Documentation", "html": documentation("The supervised ABB and Rexroth lab setup.", G["abb-rexroth"])},
        {"id": "results", "label": "Experience", "html": results("The lab created a useful foundation for automation work.", [
            ("Industrial context", "Controls concepts became connected to real equipment."),
            ("Safety habits", "Motion and controller tasks were framed around safe execution."),
            ("Troubleshooting foundation", "State, faults, interfaces, and hardware were considered together."),
        ])},
        {"id": "references", "label": "References", "html": reference_tab(
            "ABB and Bosch Rexroth are the upstream industrial platforms used in the supervised lab.",
            "Coursework execution, controller interaction, state awareness, I/O exposure, safe motion procedures, and documentation.",
            [("ABB Robotics", "https://new.abb.com/products/robotics"), ("Bosch Rexroth", "https://www.boschrexroth.com/")]
        )},
    ],
    "next": "Build on the foundation with more direct robot programming, I/O integration, and documented fault recovery.",
    "fallbackPage": "projects/abb-rexroth/",
})

# Makerspace / manufacturing
roles_html = (
    heading("Experience summary", "Practical skills developed across the makerspace and production floor")
    + '<div class="project-role-grid">'
    + '<article><p class="project-eyebrow">Sierra College Makerspace</p><h3>Makerspace Technical Assistant</h3><ul><li>3D printers, CNC routers, laser systems, woodworking, vinyl, and embroidery equipment.</li><li>CAD/CAM support, setup, troubleshooting, maintenance, user training, and shop safety.</li><li>Helped users move from an idea to a safe and workable process.</li></ul></article>'
    + '<article><p class="project-eyebrow">Vanquish Products / ASB Products</p><h3>Inventory and Factory Support</h3><ul><li>Inventory management and production staging for machined RC components.</li><li>Deburring, polishing, cleaning, inspection, anodizing or laser-etch preparation, packaging, and shipping.</li><li>Production workflow discipline from receiving through final handoff.</li></ul></article>'
    + '</div>'
)
add({
    "id": "makerspace-manufacturing", "tone": "orange", "eyebrow": "Work experience",
    "title": "Manufacturing and makerspace experience", "lede": "A summary of practical equipment, training, production, finishing, inventory, and handoff skills developed at the Sierra College Makerspace and Vanquish Products / ASB Products.",
    "status": ["Work experience", "Equipment support", "Production workflow"],
    "image": G["makerspace-manufacturing"][0]["src"], "imageAlt": G["makerspace-manufacturing"][0]["alt"], "imageCaption": "Laser-system user support in the Sierra College Makerspace.", "imageFit": "cover", "gallery": G["makerspace-manufacturing"],
    "metrics": metrics(("2 roles", "makerspace + production"), ("CAD/CAM", "machine and file setup"), ("Training", "safe user support"), ("Finish", "deburr, inspect, pack, ship")),
    "tabs": [
        {"id": "overview", "label": "Roles", "html": roles_html},
        {"id": "documentation", "label": "Documentation", "html": documentation("Makerspace equipment, user support, and hands-on shop work.", G["makerspace-manufacturing"])},
        {"id": "engineering", "label": "Skills", "html": decisions("The work around the machine determines whether the process succeeds.", [
            ("Teach the process", "Good support helps the next job run safely without constant supervision."),
            ("Treat finishing as production", "Deburring, cleaning, inspection, and packaging affect quality and customer experience."),
            ("Protect equipment and people", "Setup, maintenance, training, and safety are part of uptime."),
        ])},
        {"id": "results", "label": "Experience", "html": results("The roles connected design intent to real production work.", [
            ("Broader machine fluency", "I supported multiple tools and workflows instead of one narrow process."),
            ("Operator-support habits", "Training, safety, and clear handoff became part of the technical solution."),
            ("Production perspective", "Inventory, finishing, inspection, and shipping showed what happens after machining."),
        ])},
    ],
    "next": "Add future work samples only when they accurately represent the role and can be shared.",
    "fallbackPage": "projects/makerspace-manufacturing/",
})

payload = {"version": 6, "order": order, "projects": projects}
OUT.write_text("window.PORTFOLIO_PROJECTS = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print(f"wrote {OUT} with {len(order)} projects")
