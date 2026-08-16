from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "project-tabs-data.js"


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def heading(kicker: str, title: str, note: str | None = None) -> str:
    note_html = f'<p>{esc(note)}</p>' if note else ''
    compact = ' compact' if not note else ''
    return (
        f'<div class="project-section-heading{compact}">'
        f'<div><p class="project-eyebrow">{esc(kicker)}</p><h2>{esc(title)}</h2></div>'
        f'{note_html}</div>'
    )


def overview(title: str, cards: list[tuple[str, str, str]]) -> str:
    blocks = ''.join(
        f'<article><p class="project-eyebrow">{esc(kicker)}</p><h3>{esc(card_title)}</h3><p>{esc(copy)}</p></article>'
        for kicker, card_title, copy in cards
    )
    return heading('Overview', title) + f'<div class="project-overview-grid">{blocks}</div>'


def decisions(title: str, items: list[tuple[str, str]]) -> str:
    blocks = ''.join(
        f'<article class="project-decision"><span>{index:02d}</span><div><h3>{esc(item_title)}</h3><p>{esc(copy)}</p></div></article>'
        for index, (item_title, copy) in enumerate(items, start=1)
    )
    return heading('Engineering choices', title) + f'<div class="project-decision-grid compact-decisions">{blocks}</div>'


def outcomes(title: str, items: list[tuple[str, str]]) -> str:
    blocks = ''.join(
        f'<article><span>{index:02d}</span><h3>{esc(item_title)}</h3><p>{esc(copy)}</p></article>'
        for index, (item_title, copy) in enumerate(items, start=1)
    )
    return heading('Results', title) + f'<div class="project-outcome-grid compact-outcomes">{blocks}</div>'


def gallery(title: str, images: list[dict[str, str]]) -> str:
    figures = []
    for item in images:
        classes = []
        if item.get('kind') == 'screenshot':
            classes.append('screenshot')
        if item.get('orientation'):
            classes.append(item['orientation'])
        cls = f' class="{" ".join(classes)}"' if classes else ''
        caption = f"{item['title']} — {item['copy']}"
        figures.append(
            f'<figure{cls}>'
            f'<button type="button" data-lightbox data-caption="{esc(caption)}">'
            f'<img loading="lazy" src="{esc(item["src"])}" alt="{esc(item["alt"])}"></button>'
            f'<figcaption><strong>{esc(item["title"])}</strong>{esc(item["copy"])}</figcaption>'
            f'</figure>'
        )
    count = len(images)
    return (
        heading('Photos', title)
        + f'<div class="project-gallery gallery-count-{count}">{"".join(figures)}</div>'
    )


def workflow(title: str, items: list[tuple[str, str]]) -> str:
    blocks = ''.join(
        f'<article><span>{index:02d}</span><h3>{esc(item_title)}</h3><p>{esc(copy)}</p></article>'
        for index, (item_title, copy) in enumerate(items, start=1)
    )
    return heading('Workflow', title) + f'<div class="project-flow compact-flow">{blocks}</div>'


def metrics(*items: tuple[str, str]) -> list[dict[str, str]]:
    return [{'value': value, 'label': label} for value, label in items]


GALLERIES: dict[str, list[dict[str, str]]] = {
    'print-orchestrator': [
        {'src': 'assets/screenshots/print-orchestrator-dashboard-v6.png', 'alt': 'Print Orchestrator fleet dashboard', 'title': 'Fleet dashboard', 'copy': 'The live interface keeps printer, camera, power, job, and detection states visible together.', 'kind': 'screenshot', 'orientation': 'portrait'},
        {'src': 'assets/images/e3ng-img-7200-1.jpg', 'alt': 'Networked probe and toolhead hardware on the E3NG printer', 'title': 'Machine-level hardware', 'copy': 'The dashboard represents real sensors, controllers, and machine-specific capabilities.', 'orientation': 'portrait'},
        {'src': 'assets/images/e3ng-img-7128-1.jpg', 'alt': 'Controller and Raspberry Pi hardware used in the printer fleet', 'title': 'Controller integration', 'copy': 'The mixed fleet includes Linux hosts, printer controllers, and networked toolhead electronics.', 'orientation': 'portrait'},
    ],
    'pfc-supervisor': [
        {'src': 'assets/screenshots/pfc-power-management-v6.png', 'alt': 'PFC power management command center', 'title': 'Power command center', 'copy': 'Workload state, suspend controls, and the current savings snapshot are shown in one place.', 'kind': 'screenshot', 'orientation': 'portrait'},
        {'src': 'assets/screenshots/pfc-energy-ledger-v6.png', 'alt': 'PFC energy ledger and savings charts', 'title': 'Energy ledger', 'copy': 'Observed sleep and estimated avoided energy remain separate so the savings claim is inspectable.', 'kind': 'screenshot', 'orientation': 'portrait'},
        {'src': 'assets/screenshots/pfc-ai-runtime-v6.png', 'alt': 'PFC AI runtime reconciliation panel', 'title': 'Runtime recovery', 'copy': 'Endpoints are checked again after wake, including model identity and required GPU offload.', 'kind': 'screenshot', 'orientation': 'portrait'},
        {'src': 'assets/screenshots/pfc-eligibility-matrix-v6.png', 'alt': 'PFC subsystem eligibility matrix', 'title': 'Suspend safety matrix', 'copy': 'Each rule reports eligible, blocked, unknown, or stale instead of hiding the decision.', 'kind': 'screenshot', 'orientation': 'portrait'},
    ],
    'ai-server': [
        {'src': 'assets/images/ai-img-8931.jpg', 'alt': 'Custom B70 local AI server installation', 'title': 'Installed B70 system', 'copy': 'The server is a working local-inference platform rather than a benchmark-only test bench.', 'orientation': 'portrait'},
        {'src': 'assets/images/ai-img-8916.jpg', 'alt': 'Open B70 server chassis showing internal hardware', 'title': 'Hardware integration', 'copy': 'The build combines compute, cooling, power, and service access inside a custom enclosure.', 'orientation': 'portrait'},
        {'src': 'assets/images/ai-calculator-code-2.jpg', 'alt': 'Local AI coding workflow and calculator tool test', 'title': 'Applied local workflow', 'copy': 'Models are tested on engineering tasks, tool use, and service integration—not only token speed.', 'orientation': 'portrait'},
    ],
    'e3ng': [
        {'src': 'assets/images/e3ng-img-7200-1.jpg', 'alt': 'Probe and toolhead hardware on the E3NG CoreXY printer', 'title': 'Toolhead sensing', 'copy': 'The custom toolhead combines probing, wiring, and motion-system packaging.', 'orientation': 'portrait'},
        {'src': 'assets/images/e3ng-img-7150-1.jpg', 'alt': 'Klipper heightmap from E3NG bed mesh calibration', 'title': 'Bed-mesh verification', 'copy': 'Calibration data is used to verify geometry and compensate for the build surface.', 'orientation': 'portrait'},
        {'src': 'assets/images/e3ng-img-7128-1.jpg', 'alt': 'E3NG controller and Raspberry Pi electronics', 'title': 'Control hardware', 'copy': 'The electronics stack ties the printer controller, Raspberry Pi, networking, and toolhead together.', 'orientation': 'portrait'},
    ],
    'voron-systems': [
        {'src': 'assets/images/voron-img-6388-1.jpg', 'alt': 'Voron printer toolhead and printed mechanical components', 'title': 'Functional printed assembly', 'copy': 'The system is used to produce and validate real mechanical parts in technical materials.', 'orientation': 'portrait'},
    ],
    'metuned': [
        {'src': 'assets/images/metuned-copy-of-proto-2.jpg', 'alt': 'Metuned digital dashboard enclosure prototype', 'title': 'Enclosure prototype', 'copy': 'The printed housing establishes display fit, airflow, service access, and product identity.', 'orientation': 'landscape'},
        {'src': 'assets/images/metuned-copy-of-proto-4-1.jpg', 'alt': 'Metuned electronics prototype board', 'title': 'Electronics fitment', 'copy': 'PCB placement, wiring, and cooling were evaluated as part of the product package.', 'orientation': 'landscape'},
    ],
    'motorsports': [
        {'src': 'assets/images/motorsports-thebigpicture-1.jpg', 'alt': 'Sierra College Cars and Coffee event', 'title': 'Community-funded program', 'copy': 'Cars and Coffee events built visibility, recruited support, and helped fund the race program.', 'orientation': 'landscape'},
        {'src': 'assets/images/motorsports-img-5023-2.jpg', 'alt': 'Fabricated motorsports bracket and component repair', 'title': 'Practical fabrication', 'copy': 'Repairs and brackets were developed around real packaging, schedule, and service constraints.', 'orientation': 'portrait'},
    ],
    'espresso-machine': [
        {'src': 'assets/images/espresso-img-4665.jpg', 'alt': 'ME190 espresso machine team presenting the project', 'title': 'Senior design presentation', 'copy': 'The team presented the system targets, architecture, and planned validation approach.', 'orientation': 'landscape'},
        {'src': 'assets/images/espresso-image-113.jpg', 'alt': 'Mechanical lever and pressure mechanism prototype for the espresso machine', 'title': 'Lever mechanism', 'copy': 'The prototype converts hand input into a controlled extraction-pressure path.', 'orientation': 'portrait'},
        {'src': 'assets/images/espresso-group1-standing.jpg', 'alt': 'ME190 espresso machine project team', 'title': 'Project team', 'copy': 'The project combines mechanical, electrical, controls, documentation, and sponsored fabrication work.', 'orientation': 'landscape'},
    ],
    'uei-lab': [
        {'src': 'assets/images/uei-img-8868.jpg', 'alt': 'Residential fan airflow and CFM test duct', 'title': 'Airflow test duct', 'copy': 'The long duct and controlled geometry support repeatable residential-fan measurements.', 'orientation': 'landscape'},
        {'src': 'assets/images/uei-img-8870.jpg', 'alt': 'Wood test room and fan fixture under construction', 'title': 'Controlled test room', 'copy': 'The eight-foot test environment was built, sealed, and repaired to support standards-driven testing.', 'orientation': 'landscape'},
        {'src': 'assets/images/manufacturing-img-8774.jpg', 'alt': 'Wood fixture construction detail from the UEI lab', 'title': 'Fixture construction', 'copy': 'Material, sealing, fastener, and access decisions affected the quality of the final test setup.', 'orientation': 'portrait'},
    ],
    'abb-rexroth': [
        {'src': 'assets/images/me165-image-111.jpg', 'alt': 'ABB robot and Rexroth controls in the ME165 laboratory', 'title': 'Industrial robotics lab', 'copy': 'The supervised setup included robot hardware, controller interfaces, cabling, and emergency-stop controls.', 'orientation': 'portrait'},
    ],
}


projects: dict[str, dict] = {}


def add(project: dict) -> None:
    projects[project['id']] = project


add({
    'id': 'print-orchestrator', 'tone': 'blue', 'eyebrow': 'Printer fleet management',
    'title': 'Print Orchestrator',
    'lede': 'A single control surface for PrusaLink and Moonraker/Klipper printers. It separates printer, camera, power, job, and detection states so faults are easier to understand and recover from.',
    'status': ['Working system', '3-printer fleet', 'Active development'],
    'image': GALLERIES['print-orchestrator'][0]['src'], 'imageAlt': GALLERIES['print-orchestrator'][0]['alt'],
    'imageCaption': 'Live fleet dashboard; real controls and private network details are removed from the demo.',
    'imageFit': 'contain', 'gallery': GALLERIES['print-orchestrator'],
    'metrics': metrics(('3', 'printers in the captured fleet'), ('2', 'printer API families'), ('1', 'shared operator view'), ('Separated', 'machine and service states')),
    'tabs': [
        {'id': 'overview', 'label': 'Overview', 'html': overview('Why one dashboard was worth building.', [
            ('Problem', 'Too many separate interfaces', 'The fleet mixes PrusaLink and Moonraker/Klipper. Checking jobs, cameras, temperatures, power, and fault states meant moving between several tools.'),
            ('My work', 'A practical operator view', 'I designed the interface, integrated the services, packaged releases, and tested recovery paths against the printers I actually run.'),
        ])},
        {'id': 'gallery', 'label': 'Photos', 'html': gallery('The software and the machines behind it.', GALLERIES['print-orchestrator'])},
        {'id': 'decisions', 'label': 'Engineering', 'html': decisions('Three choices keep the dashboard trustworthy.', [
            ('Keep machine differences visible', 'Shared concepts are normalized, but unsupported controls never appear as if they exist.'),
            ('Separate partial failures', 'Printer, camera, power, job, and detection states are reported independently.'),
            ('Gate high-risk actions', 'Power, emergency, console, and firmware controls use stronger warnings and machine context.'),
        ])},
        {'id': 'workflow', 'label': 'Workflow', 'html': workflow('From machine telemetry to a safe operator action.', [
            ('Collect', 'Read each printer and its supporting services.'),
            ('Normalize', 'Map shared states without hiding machine-specific limits.'),
            ('Present', 'Place evidence and available actions together.'),
            ('Verify', 'Confirm the machine returned to a safe state after recovery.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('The fleet is easier to read and recover.', [
            ('One operating surface', 'The whole fleet can be checked without opening several dashboards.'),
            ('Faster fault isolation', 'The interface shows which subsystem actually failed.'),
            ('Room to extend', 'The same structure can support routing, maintenance history, and richer detection.'),
        ])},
    ],
    'next': 'Continue improving part-detection feedback and make recovery history easier to compare.',
    'fallbackPage': 'projects/print-orchestrator/',
})

add({
    'id': 'pfc-supervisor', 'tone': 'green', 'eyebrow': 'Server power management',
    'title': 'PFC Supervisor',
    'lede': 'A control plane that lets the main AI server sleep during long idle windows while a low-power Pi keeps schedules, wake protection, and recovery logic available.',
    'status': ['Working system', 'Pi-retained control', 'Savings ledger'],
    'image': GALLERIES['pfc-supervisor'][0]['src'], 'imageAlt': GALLERIES['pfc-supervisor'][0]['alt'],
    'imageCaption': 'Power-management view from the live PFC control plane.',
    'imageFit': 'contain', 'gallery': GALLERIES['pfc-supervisor'],
    'metrics': metrics(('95.0 h', 'observed sleep in the snapshot'), ('13.19 kWh', 'estimated seven-day avoidance'), ('68.23 kWh', 'projected 30-day savings'), ('$290.54', 'projected annual value')),
    'tabs': [
        {'id': 'overview', 'label': 'Overview', 'html': overview('Why the AI server does not need to stay awake all day.', [
            ('Problem', 'High idle power, real availability needs', 'The B70/PFP host draws meaningful power, but scheduled jobs and local services still need a reliable way to wake it.'),
            ('My work', 'Power policy with visible safeguards', 'I built workload interlocks, Hermes schedule caching, wake and sleep control, runtime reconciliation, and a ledger that keeps estimates labeled.'),
        ])},
        {'id': 'savings', 'label': 'Power savings', 'html': heading('Power savings', 'The captured week includes 95 hours of sleep.') + '''
<div class="project-savings-spotlight">
  <div class="project-savings-main"><p class="project-eyebrow">Seven-day snapshot</p><h3>13.19 kWh estimated avoided</h3><div class="project-savings-kpis-mini"><article><strong>2.27 kWh</strong><span>average estimated daily savings</span></article><article><strong>68.23 kWh</strong><span>projected over 30 days</span></article><article><strong>$290.54</strong><span>projected annual value</span></article></div><div aria-label="Seven-day avoided energy chart" class="project-savings-chart"><article><i style="--height:90%"></i><span>Fri</span></article><article><i style="--height:94%"></i><span>Sat</span></article><article><i style="--height:87%"></i><span>Sun</span></article><article><i style="--height:55%"></i><span>Mon</span></article><article><i style="--height:63%"></i><span>Tue</span></article><article><i style="--height:52%"></i><span>Wed</span></article><article><i style="--height:18%"></i><span>Thu</span></article></div></div>
  <aside class="project-savings-note"><p class="project-eyebrow">Measurement note</p><strong>Sleep is observed; avoided energy is estimated.</strong><p>The ledger uses retained state history and configured power baselines. Direct host metering is the next accuracy upgrade, and the Pi's own consumption remains part of the combined estimate.</p></aside>
</div>'''},
        {'id': 'gallery', 'label': 'Screens', 'html': gallery('The control plane, energy ledger, and safety checks.', GALLERIES['pfc-supervisor'])},
        {'id': 'decisions', 'label': 'Engineering', 'html': decisions('The system is designed to fail safely.', [
            ('Keep control on the Pi', 'Schedules and wake logic remain available when the large host is asleep.'),
            ('Block on uncertain state', 'Unknown, stale, or active-workload conditions stop automatic suspend.'),
            ('Reconcile after wake', 'Endpoints, model identity, process state, and required GPU offload are checked again.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('PFC turns idle time into controlled sleep.', [
            ('Lower estimated energy use', 'The current ledger shows a meaningful reduction against the always-on baseline.'),
            ('Scheduled work stays protected', 'Hermes cache windows remain visible on the Pi.'),
            ('Every sleep decision is explainable', 'The safety matrix shows exactly what allowed or blocked suspend.'),
        ])},
    ],
    'next': 'Add direct host metering so savings can move from modeled attribution to measured wall power.',
    'fallbackPage': 'projects/pfc-supervisor/',
})

benchmark_rows = [
    ('qwen2.5-0.5b-instruct-q4_k_m', 'Dense tiny', '0.46 GiB', '223.42 tok/s', ''),
    ('gemma-4-E2B-it-UD-Q4_K_XL', 'Small Gemma', '2.97 GiB', '128.83 tok/s', ''),
    ('Qwen3-30B-A3B-Instruct-2507-Q4_K_M', 'MoE', '17.28 GiB', '93.31 tok/s', 'highlight'),
    ('gemma-4-E4B-it-UD-Q4_K_XL', 'Small Gemma', '4.77 GiB', '87.54 tok/s', ''),
    ('gemma-4-26B-A4B-it-UD-Q4_K_M', 'MoE', '15.78 GiB', '73.67 tok/s', ''),
    ('Qwen3.6-35B-A3B-UD-Q4_K_M', 'MoE', '20.61 GiB', '72.91 tok/s', 'highlight'),
    ('gemma-4-12b-it-UD-Q4_K_XL', 'Dense', '6.86 GiB', '47.93 tok/s', ''),
    ('Mistral-Small-3.2-24B-Instruct-2506-Q4_K_M', 'Dense', '13.34 GiB', '32.65 tok/s', ''),
    ('Qwen3.5-27B-Q4_K_M', 'Dense', '15.58 GiB', '24.39 tok/s', ''),
    ('Qwen3-32B-Q4_K_M', 'Dense', '18.40 GiB', '23.30 tok/s', ''),
    ('gemma-4-31B-it-UD-Q4_K_XL', 'Dense', '17.52 GiB', '22.36–22.82 tok/s', ''),
    ('Qwen3.5-122B-A10B-UD-IQ3_S', 'Retired stress test', 'retired', '10.15–13.13 tok/s', 'retired'),
]
benchmark_html = ''.join(
    f'<tr class="{css}"><td><strong>{esc(name)}</strong></td><td>{esc(kind)}</td><td>{esc(size)}</td><td>{esc(speed)}</td></tr>'
    for name, kind, size, speed, css in benchmark_rows
)

add({
    'id': 'ai-server', 'tone': 'orange', 'eyebrow': 'Local AI infrastructure',
    'title': 'B70 local AI server',
    'lede': 'A custom local-inference server used to benchmark models and run the services behind Print Orchestrator, PFC, and engineering workflows.',
    'status': ['Active platform', 'Local inference', 'Measured benchmarks'],
    'image': GALLERIES['ai-server'][0]['src'], 'imageAlt': GALLERIES['ai-server'][0]['alt'],
    'imageCaption': 'Installed B70 server in its working environment.',
    'imageFit': 'contain', 'gallery': GALLERIES['ai-server'],
    'metrics': metrics(('93.31 tok/s', 'Qwen3 30B MoE result'), ('72.91 tok/s', 'Qwen3.6 35B MoE result'), ('20.61 GiB', 'largest active benchmark shown'), ('Private', 'local inference and tooling')),
    'tabs': [
        {'id': 'overview', 'label': 'Overview', 'html': overview('A server built for practical local AI work.', [
            ('Purpose', 'Run useful models locally', 'The platform supports private inference, software development, engineering tools, and the services that coordinate the rest of the lab.'),
            ('My work', 'Hardware through runtime', 'I integrated the hardware, cooling, Linux services, llama.cpp launches, model testing, benchmarks, and recovery behavior.'),
        ])},
        {'id': 'gallery', 'label': 'Photos', 'html': gallery('The server, internal hardware, and an applied workflow.', GALLERIES['ai-server'])},
        {'id': 'benchmarks', 'label': 'Benchmarks', 'html': heading('Benchmarks', 'Generation rates measured on the B70 system.', 'Results depend on the model, quantization, context, and launch settings.') + f'<div class="project-special-table-wrap"><table class="project-special-table"><thead><tr><th>Model</th><th>Class</th><th>Size</th><th>Generation</th></tr></thead><tbody>{benchmark_html}</tbody></table></div><p class="project-special-note"><strong>Historical stress test:</strong> the retired 122B model reached about 248 tok/s prompt processing at pp512 and 10.15–13.13 tok/s generation around <code>-ngl 35</code> with 16k–24k context. It was removed from the active stack because it was too large for practical daily use.</p>'},
        {'id': 'decisions', 'label': 'Engineering', 'html': decisions('The model stack is chosen from measured behavior.', [
            ('Benchmark on the real host', 'Published model claims are not treated as a substitute for local measurements.'),
            ('Optimize for useful throughput', 'Model quality, memory use, prompt speed, generation speed, and stability all matter.'),
            ('Test by role', 'Manager and worker duties are evaluated separately instead of relying on one general score.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('The server became a working engineering platform.', [
            ('Repeatable model selection', 'Benchmarks make tradeoffs visible before a model enters the active stack.'),
            ('Shared infrastructure', 'PFC and Print Orchestrator now use the same host and service discipline.'),
            ('Practical local tools', 'The system supports coding, analysis, orchestration, and private workflows.'),
        ])},
    ],
    'next': 'Continue role-specific model evaluations and improve runtime recovery after host sleep.',
    'fallbackPage': 'projects/ai-server/',
})

add({
    'id': 'e3ng', 'tone': 'orange', 'eyebrow': 'Custom motion platform',
    'title': 'E3NG CoreXY conversion',
    'lede': 'A heavily modified Ender 3 platform rebuilt as a CoreXY machine with Klipper, networked electronics, custom sensing, and a commissioning workflow based on measured calibration.',
    'status': ['Working machine', 'CoreXY + Klipper', 'Custom electronics'],
    'image': GALLERIES['e3ng'][0]['src'], 'imageAlt': GALLERIES['e3ng'][0]['alt'],
    'imageCaption': 'Toolhead sensing and wiring on the working E3NG conversion.',
    'imageFit': 'contain', 'gallery': GALLERIES['e3ng'],
    'metrics': metrics(('CoreXY', 'motion conversion'), ('Klipper', 'firmware and tuning'), ('CAN-style', 'networked toolhead work'), ('Measured', 'mesh and input-shaper tuning')),
    'tabs': [
        {'id': 'overview', 'label': 'Overview', 'html': overview('A printer rebuild that became a controls project.', [
            ('Build', 'Mechanical and electrical conversion', 'The project combines CoreXY belt routing, extrusion geometry, toolhead packaging, controller integration, sensing, and power distribution.'),
            ('My work', 'Commissioning from first motion to repeatable parts', 'I assembled the platform, configured Klipper, debugged the toolhead network, tuned motion, and verified bed geometry.'),
        ])},
        {'id': 'gallery', 'label': 'Photos', 'html': gallery('Sensing, calibration, and control hardware.', GALLERIES['e3ng'])},
        {'id': 'decisions', 'label': 'Engineering', 'html': decisions('The build was treated as a complete machine.', [
            ('Tune after the mechanics are sound', 'Firmware compensation does not replace square frames, correct belt paths, or reliable motion.'),
            ('Use measurement for calibration', 'Heightmaps and input-shaper data guide changes instead of visual guesses.'),
            ('Make electronics serviceable', 'Controller, Pi, toolhead, and sensor connections stay reachable for diagnosis.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('The conversion produced a usable custom platform.', [
            ('Working CoreXY motion', 'The rebuilt kinematics and firmware operate as one system.'),
            ('Better troubleshooting habits', 'Mechanical, electrical, and software faults are isolated in a repeatable order.'),
            ('Transferable controls experience', 'The project mirrors small-scale commissioning and equipment support.'),
        ])},
    ],
    'next': 'Keep improving enclosure, thermal behavior, and repeatable technical-material profiles.',
    'fallbackPage': 'projects/e3ng/',
})

add({
    'id': 'voron-systems', 'tone': 'orange', 'eyebrow': 'Printer commissioning',
    'title': 'Voron printer systems',
    'lede': 'An enclosed CoreXY platform used as a reliable workcell for technical materials, functional parts, calibration, and maintenance practice.',
    'status': ['Working system', 'Voron 2.4', 'Technical materials'],
    'image': GALLERIES['voron-systems'][0]['src'], 'imageAlt': GALLERIES['voron-systems'][0]['alt'],
    'imageCaption': 'Functional printed assembly produced on the Voron-class system.',
    'imageFit': 'contain', 'gallery': GALLERIES['voron-systems'],
    'metrics': metrics(('Voron 2.4', 'enclosed CoreXY platform'), ('ASA', 'technical-material capability'), ('4-point', 'gantry and Z alignment'), ('Repeatable', 'profiles and maintenance')),
    'tabs': [
        {'id': 'overview', 'label': 'Overview', 'html': overview('A printer treated as production equipment.', [
            ('Purpose', 'Reliable functional prototyping', 'The enclosed machine supports larger parts and technical materials that need controlled motion, temperature, and repeatable setup.'),
            ('My work', 'Assembly, tuning, and maintenance', 'I handled frame accuracy, belts, gantry alignment, electronics, toolheads, calibration, profiles, and fault isolation.'),
        ])},
        {'id': 'gallery', 'label': 'Photo', 'html': gallery('A functional part from the working system.', GALLERIES['voron-systems'])},
        {'id': 'decisions', 'label': 'Engineering', 'html': decisions('Reliability comes from disciplined setup.', [
            ('Build square before tuning', 'Frame and gantry geometry establish the limit of later calibration.'),
            ('Control the thermal environment', 'Enclosure behavior and material profiles are part of the mechanical process.'),
            ('Document maintenance', 'Repeatable checks make ambiguous failures easier to isolate.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('The machine supports repeatable technical work.', [
            ('Functional parts', 'The system produces components for other engineering builds.'),
            ('Commissioning experience', 'Assembly, inspection, tuning, and verification are handled as one workflow.'),
            ('Uptime mindset', 'Maintenance and recovery are treated as part of machine ownership.'),
        ])},
    ],
    'next': 'Add more documented examples of finished technical-material parts and their design requirements.',
    'fallbackPage': 'projects/voron-systems/',
})

add({
    'id': 'metuned', 'tone': 'orange', 'eyebrow': 'Motorsports product development',
    'title': 'Metuned digital dash',
    'lede': 'A low-cost digital dashboard concept created from a real endurance-racing information gap. I led enclosure, packaging, cooling, prototype presentation, and product direction.',
    'status': ['Co-founder / CDO', 'Working prototype', 'Product development'],
    'image': GALLERIES['metuned'][0]['src'], 'imageAlt': GALLERIES['metuned'][0]['alt'],
    'imageCaption': 'Printed enclosure prototype for the Metuned digital dash.',
    'imageFit': 'cover', 'gallery': GALLERIES['metuned'],
    'metrics': metrics(('Prototype', 'printed enclosure and PCB fit'), ('Cooling', 'airflow and fan packaging'), ('Serviceable', 'wiring and access considered'), ('Race-led', 'problem came from track use')),
    'tabs': [
        {'id': 'overview', 'label': 'Overview', 'html': overview('A product idea built from a trackside failure.', [
            ('Problem', 'The driver needed better information', 'Factory instrumentation did not make the race car\'s condition clear enough during endurance use.'),
            ('My work', 'Turn the need into a physical product', 'I shaped the enclosure, PCB package, cooling, service access, branding, and prototype story as Chief Design Officer.'),
        ])},
        {'id': 'gallery', 'label': 'Photos', 'html': gallery('Prototype enclosure and electronics fitment.', GALLERIES['metuned'])},
        {'id': 'decisions', 'label': 'Engineering', 'html': decisions('Packaging had to work inside a race car.', [
            ('Design around the electronics', 'Display, PCB, connectors, wiring, and cooling set the enclosure geometry.'),
            ('Keep service access practical', 'A prototype is more useful when it can be opened, rewired, and repaired.'),
            ('Make the product readable', 'Branding and interface presentation support trust as well as appearance.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('The concept moved beyond a sketch.', [
            ('Physical prototype', 'The enclosure and electronics fit were tested together.'),
            ('Clear product direction', 'The project has a defined use case, audience, and development path.'),
            ('Startup experience', 'Technical work was connected to presentation, funding, and customer value.'),
        ])},
    ],
    'next': 'Document the next electronics revision and show the dash operating in a vehicle.',
    'fallbackPage': 'projects/metuned/',
})

add({
    'id': 'motorsports', 'tone': 'orange', 'eyebrow': 'Leadership and fabrication',
    'title': 'Sierra College Motorsports',
    'lede': 'Student-led race preparation, fabrication, events, sponsorship, and trackside problem solving around the “Notta Miata” Mini Cooper program.',
    'status': ['Club president', 'Race preparation', 'Community funding'],
    'image': GALLERIES['motorsports'][0]['src'], 'imageAlt': GALLERIES['motorsports'][0]['alt'],
    'imageCaption': 'Cars and Coffee event organized to build support for the motorsports program.',
    'imageFit': 'cover', 'gallery': GALLERIES['motorsports'],
    'metrics': metrics(('$500', 'starting Mini Cooper'), ('3 roles', 'treasurer to vice president to president'), ('Lemons', 'endurance-racing program'), ('Team-led', 'funding, repair, and execution')),
    'tabs': [
        {'id': 'overview', 'label': 'Overview', 'html': overview('A race program built under tight constraints.', [
            ('Technical work', 'Repair and fabricate what the car needed', 'The team handled engine work, brackets, mounts, field repairs, and race preparation with limited time and budget.'),
            ('Leadership', 'Build the team around the car', 'I helped organize funding, recruitment, events, sponsorship, task ownership, and trackside execution.'),
        ])},
        {'id': 'gallery', 'label': 'Photos', 'html': gallery('Community building and practical fabrication.', GALLERIES['motorsports'])},
        {'id': 'decisions', 'label': 'Engineering', 'html': decisions('The solution had to be safe and ready on time.', [
            ('Prioritize the failure that stops the car', 'Repairs were sequenced around safety, reliability, and race deadlines.'),
            ('Design for field service', 'Brackets and fixes needed access, inspectability, and fast replacement.'),
            ('Match tasks to the team', 'Clear ownership helped students with different experience levels contribute.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('The program became more than one car.', [
            ('Working race project', 'The Mini became a platform for repair, fabrication, and team learning.'),
            ('Sustainable outreach', 'Events and sponsors helped create funding and visibility.'),
            ('Leadership under pressure', 'Real deadlines required decisions that worked outside the classroom.'),
        ])},
    ],
    'next': 'Add a concise build timeline that connects major failures, repairs, and race outcomes.',
    'fallbackPage': 'projects/motorsports/',
})

add({
    'id': 'espresso-machine', 'tone': 'orange', 'eyebrow': 'ME190 senior design',
    'title': 'Hybrid hand-actuated espresso machine',
    'lede': 'A compact senior-design machine targeting 9 bar, a 2 oz shot, and a 25–30 second extraction while combining a hand-actuated mechanism with heating, sensing, and controls.',
    'status': ['Senior design', 'SendCutSend sponsored', 'Active build'],
    'image': GALLERIES['espresso-machine'][0]['src'], 'imageAlt': GALLERIES['espresso-machine'][0]['alt'],
    'imageCaption': 'ME190 team presenting the project and its design targets.',
    'imageFit': 'cover', 'gallery': GALLERIES['espresso-machine'],
    'metrics': metrics(('$750', 'SendCutSend store credit plus merchandise'), ('9 bar', 'target extraction pressure'), ('2 oz ±10%', 'target shot volume'), ('25–30 s', 'target extraction time')),
    'tabs': [
        {'id': 'overview', 'label': 'Overview', 'html': overview('A compact machine with mechanical and controls constraints.', [
            ('System', 'Hand input with controlled extraction', 'The design combines a lever mechanism, heating, pumping, sensors, and controls inside a compact package.'),
            ('My work', 'Electrical and system integration', 'I contributed electrical fundamentals, efficiency constraints, wattage calculations, PID-control planning, documentation, and cross-system integration.'),
        ])},
        {'id': 'gallery', 'label': 'Photos', 'html': gallery('The team, presentation, and lever mechanism.', GALLERIES['espresso-machine'])},
        {'id': 'sponsorship', 'label': 'Sponsorship', 'html': heading('Sponsorship', 'SendCutSend is supporting the next fabrication step.') + '''<div class="project-milestone"><div class="project-milestone-metric"><div><strong>$750</strong><span>store credit plus merchandise</span></div></div><div class="project-milestone-copy"><p class="project-eyebrow">Recent milestone</p><h3>Outside support for production-intent parts</h3><p>The sponsorship gives the team more room to order accurate cut parts and document material, geometry, assembly, and test results.</p></div></div>'''},
        {'id': 'decisions', 'label': 'Engineering', 'html': decisions('The machine has to balance force, heat, water, and controls.', [
            ('Design around measurable shot targets', 'Pressure, volume, time, and temperature define whether the concept works.'),
            ('Integrate the electrical load early', 'Heaters, pump, sensors, and controls affect power, packaging, and safety.'),
            ('Use sponsored parts as testable hardware', 'Cut components should connect directly to assembly and validation evidence.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('The project now has a clearer path into fabrication.', [
            ('Defined performance targets', 'The team can test the machine against pressure, time, volume, and temperature.'),
            ('External validation', 'SendCutSend sponsorship supports the credibility of the build.'),
            ('Integrated documentation', 'Drawings, calculations, BOMs, and test plans stay connected to the hardware.'),
        ])},
    ],
    'next': 'Show the sponsored parts, assembly progress, and first extraction-test data as they become available.',
    'fallbackPage': 'projects/espresso-machine/',
})

add({
    'id': 'uei-lab', 'tone': 'orange', 'eyebrow': 'Test engineering',
    'title': 'UEI energy-efficiency testing',
    'lede': 'Standards-driven appliance testing support for residential fan airflow and portable-spa energy efficiency through University Enterprises and Sacramento State.',
    'status': ['Professional lab work', 'CFM instrumentation', 'CEC-related testing'],
    'image': GALLERIES['uei-lab'][0]['src'], 'imageAlt': GALLERIES['uei-lab'][0]['alt'],
    'imageCaption': 'Residential-fan airflow test duct in the Sacramento State lab.',
    'imageFit': 'cover', 'gallery': GALLERIES['uei-lab'],
    'metrics': metrics(('8 ft', 'controlled test-room scale'), ('HVI 916', 'fan-test procedure exposure'), ('CFM', 'airflow and pressure measurement'), ('Logged', 'temperature and power data')),
    'tabs': [
        {'id': 'overview', 'label': 'Overview', 'html': overview('Testing where setup quality directly affects the result.', [
            ('Work', 'Build and prepare controlled environments', 'I helped construct the test room, seal fixtures, set up pressure and flow hardware, place sensors, and prepare data logging.'),
            ('Responsibility', 'Support repeatable measurements', 'The work required following procedures, documenting changes, repairing leaks, and keeping the setup consistent between tests.'),
        ])},
        {'id': 'gallery', 'label': 'Photos', 'html': gallery('The airflow duct, test room, and fixture construction.', GALLERIES['uei-lab'])},
        {'id': 'decisions', 'label': 'Engineering', 'html': decisions('Good data starts with a controlled setup.', [
            ('Control leaks and geometry', 'Sealing and fixture dimensions influence the measured airflow.'),
            ('Keep instrumentation traceable', 'Tubing, sensors, channels, and test conditions must be documented.'),
            ('Repair without losing repeatability', 'Changes to the room or fixture are recorded and checked before testing resumes.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('The role added real test-engineering discipline.', [
            ('Standards exposure', 'Procedures and compliance goals shaped the work.'),
            ('Instrumentation practice', 'Pressure, flow, temperature, and power data were handled together.'),
            ('Documentation habits', 'Setup details and changes were treated as part of the result.'),
        ])},
    ],
    'next': 'Add anonymized test diagrams or sample data only when they can be shared appropriately.',
    'fallbackPage': 'projects/uei-lab/',
})

add({
    'id': 'abb-rexroth', 'tone': 'orange', 'eyebrow': 'Industrial robotics coursework',
    'title': 'ABB and Rexroth robotics lab',
    'lede': 'Hands-on ME165 coursework using ABB robot hardware and Rexroth controls, with attention to controller state, I/O, emergency-stop behavior, and safe lab execution.',
    'status': ['ME165 coursework', 'ABB hardware', 'Rexroth controls'],
    'image': GALLERIES['abb-rexroth'][0]['src'], 'imageAlt': GALLERIES['abb-rexroth'][0]['alt'],
    'imageCaption': 'ABB robot and controller hardware in the supervised ME165 lab.',
    'imageFit': 'contain', 'gallery': GALLERIES['abb-rexroth'],
    'metrics': metrics(('ABB', 'industrial robot exposure'), ('Rexroth', 'controller-platform exposure'), ('E-stop', 'safety-state awareness'), ('ME165', 'hands-on coursework')),
    'tabs': [
        {'id': 'overview', 'label': 'Overview', 'html': overview('Controls concepts tied to real industrial hardware.', [
            ('Coursework', 'Work with the physical system', 'The lab connected motion, controller interfaces, I/O, cabling, and safety states to the theory covered in class.'),
            ('Scope', 'Accurate hands-on exposure', 'This is supervised academic experience, not production ownership. The portfolio keeps that distinction clear.'),
        ])},
        {'id': 'gallery', 'label': 'Photo', 'html': gallery('The supervised ABB and Rexroth lab setup.', GALLERIES['abb-rexroth'])},
        {'id': 'decisions', 'label': 'Engineering', 'html': decisions('Safe state awareness came first.', [
            ('Understand the stop path', 'Emergency-stop and controller state were treated as part of every motion task.'),
            ('Observe before changing', 'Robot, controller, and I/O state were checked before commands were issued.'),
            ('Document the real scope', 'The work is described as coursework so the evidence remains credible.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('The lab created a useful automation foundation.', [
            ('Industrial context', 'Controls concepts became connected to real equipment.'),
            ('Safety habits', 'Motion and controller work were framed around safe execution.'),
            ('Career relevance', 'The experience supports future commissioning and automation-support work.'),
        ])},
    ],
    'next': 'Build on the foundation with more direct robot programming, I/O integration, and documented fault recovery.',
    'fallbackPage': 'projects/abb-rexroth/',
})

role_overview = heading('Role overview', 'Two jobs that built practical production habits.') + '''
<div class="project-role-grid">
  <article><p class="project-eyebrow">Sierra College Makerspace</p><h3>Makerspace Technical Assistant</h3><ul><li>Trained users on 3D printers, CNC routers, laser systems, woodworking, vinyl, and embroidery equipment.</li><li>Supported CAD/CAM, print setup, troubleshooting, maintenance, and shop safety.</li><li>Helped users move from an idea to a safe, workable process.</li></ul></article>
  <article><p class="project-eyebrow">Vanquish Products / ASB Products</p><h3>Inventory Manager &amp; Factory Support</h3><ul><li>Managed inventory and staged machined RC-car parts through production.</li><li>Deburred, polished, cleaned, inspected, and prepared aluminum parts for anodizing or laser etching.</li><li>Supported packaging, shipping, and vendor processing.</li></ul></article>
</div>
<p class="project-no-photo-note"><strong>Photo note:</strong> I do not have useful workplace photos from these roles. The visual above is an illustrated responsibility map, not a photograph.</p>'''

add({
    'id': 'makerspace-manufacturing', 'tone': 'orange', 'eyebrow': 'Equipment and production support',
    'title': 'Makerspace + Vanquish Products',
    'lede': 'Two early roles that built practical habits around machine setup, training, inventory, finishing, inspection, packaging, and safe handoff. This project uses a role map because I do not have useful workplace photos.',
    'status': ['Makerspace support', 'Inventory management', 'Production finishing'],
    'image': 'assets/graphics/experience-role-map.svg',
    'imageAlt': 'Illustrated responsibility map for Sierra College Makerspace and Vanquish Products roles',
    'imageCaption': 'Illustrated role map; no workplace photographs are used for these positions.',
    'imageFit': 'contain', 'gallery': [],
    'metrics': metrics(('2 roles', 'equipment and production support'), ('CAD/CAM', 'machine and file setup'), ('Inventory', 'staging and tracking'), ('Finish', 'deburr, inspect, pack, ship')),
    'tabs': [
        {'id': 'overview', 'label': 'Roles', 'html': role_overview},
        {'id': 'workflow', 'label': 'Workflows', 'html': workflow('The work was built around safe, repeatable handoff.', [
            ('Makerspace setup', 'Check the file, material, machine, tooling, and safety plan.'),
            ('User support', 'Explain the process, supervise the first run, and leave the user more independent.'),
            ('Production flow', 'Receive, stage, finish, inspect, and prepare parts for the next operation.'),
            ('Final handoff', 'Package and ship parts with inventory and quality checks complete.'),
        ])},
        {'id': 'decisions', 'label': 'Lessons', 'html': decisions('The small steps around a machine determine whether the work succeeds.', [
            ('Teach the process, not only the button', 'Good support helps the next job go better without constant supervision.'),
            ('Treat finishing as production work', 'Deburr, cleaning, inspection, and packaging affect quality and customer experience.'),
            ('Protect equipment and people', 'Safe setup and maintenance are part of uptime, not separate from it.'),
        ])},
        {'id': 'outcomes', 'label': 'Results', 'html': outcomes('The roles connected design intent to real production work.', [
            ('Broader machine fluency', 'I supported several tools and workflows rather than one narrow process.'),
            ('Operator-support habits', 'Training, safety, and clear handoff became part of the technical solution.'),
            ('Production perspective', 'Inventory, finishing, inspection, and shipping showed what happens after machining.'),
        ])},
    ],
    'next': 'Keep this section evidence-based and add work samples only when they are mine and can be shown accurately.',
    'fallbackPage': 'projects/makerspace-manufacturing/',
})

order = [
    'print-orchestrator', 'pfc-supervisor', 'ai-server', 'e3ng', 'voron-systems',
    'metuned', 'motorsports', 'espresso-machine', 'uei-lab', 'abb-rexroth',
    'makerspace-manufacturing',
]

payload = {'order': order, 'projects': projects}
OUT.write_text('window.PORTFOLIO_PROJECTS = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print(f'Wrote {OUT} with {len(projects)} projects.')
