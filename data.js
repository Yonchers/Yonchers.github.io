window.SITE_DATA = {
  "profile": {
    "name": "Joseph Dwyer",
    "title": "Mechanical Engineering Student",
    "headline": "Mechanical engineering across machines, automation, and local AI.",
    "subhead": "I build physical systems, then the software that monitors, controls, and improves them.",
    "location": "Antelope, California",
    "email": "jdwyer@csus.edu",
    "secondaryEmail": "joeyoungdwyer@gmail.com",
    "linkedin": "https://www.linkedin.com/in/joseph-dwyer-10a4131ba",
    "github": "https://github.com/Yonchers",
    "resume": "downloads/Joseph_Dwyer_Resume.pdf",
    "portfolio": "downloads/Joseph_Dwyer_Engineering_Portfolio.pdf"
  },
  "heroFacts": [
    {
      "value": "B.S. ME",
      "label": "Sacramento State · expected Fall 2026"
    },
    {
      "value": "Founder",
      "label": "Metuned LLC · race electronics"
    },
    {
      "value": "Local AI",
      "label": "llama.cpp · Hermes · private infrastructure"
    },
    {
      "value": "Hands-on",
      "label": "automation · test · manufacturing · fabrication"
    }
  ],
  "architecture": {
    "caption": "A connected engineering stack: local inference supports the agent layer, the agent layer coordinates control software, and the control software reaches real machines.",
    "layers": [
      {
        "label": "Inference + agent",
        "nodes": [
          {
            "name": "llama.cpp",
            "detail": "Local inference engine",
            "tone": "orange"
          },
          {
            "name": "Muse manager",
            "detail": "DFlash · reasoning · supervision",
            "tone": "orange"
          },
          {
            "name": "Qwen worker",
            "detail": "Tool use · implementation",
            "tone": "orange"
          },
          {
            "name": "Hermes",
            "detail": "Agent routing and workflows",
            "tone": "orange"
          }
        ]
      },
      {
        "label": "Control software",
        "nodes": [
          {
            "name": "Print Orchestrator",
            "detail": "Fleet API · slicing · vision · power",
            "tone": "blue"
          },
          {
            "name": "PFC Supervisor",
            "detail": "Power · runtime · safety · recovery",
            "tone": "acid"
          },
          {
            "name": "PFC Pulse",
            "detail": "Whisper + Piper voice interface",
            "tone": "acid"
          },
          {
            "name": "PFC Command",
            "detail": "Compact desktop controls",
            "tone": "acid"
          }
        ]
      },
      {
        "label": "Physical systems",
        "nodes": [
          {
            "name": "B70 / PFP",
            "detail": "Local AI and services",
            "tone": "gray"
          },
          {
            "name": "Printer fleet",
            "detail": "PrusaLink + Moonraker/Klipper",
            "tone": "gray"
          },
          {
            "name": "Raspberry Pi",
            "detail": "Low-power schedule and wake protection",
            "tone": "gray"
          },
          {
            "name": "Workstation",
            "detail": "Desktop tools and recovery peer",
            "tone": "gray"
          }
        ]
      }
    ]
  },
  "demos": [
    {
      "id": "print",
      "eyebrow": "Printer automation",
      "title": "Print Orchestrator",
      "summary": "A mixed-fleet frontend and API that gives Hermes an inspectable way to prepare, dispatch, monitor, and power printer jobs.",
      "tone": "blue",
      "project": "print-orchestrator",
      "metrics": [
        {
          "value": "3",
          "label": "printers in the current fleet view"
        },
        {
          "value": "2",
          "label": "printer protocols under one interface"
        },
        {
          "value": "AI vision",
          "label": "failure warnings and review"
        },
        {
          "value": "Kasa",
          "label": "power telemetry and control"
        }
      ],
      "tabs": [
        {
          "id": "fleet",
          "label": "Fleet",
          "image": "assets/screenshots/print-fleet.png",
          "alt": "Print Orchestrator fleet dashboard",
          "caption": "PrusaLink and Moonraker/Klipper machines share one operator view while keeping machine-specific capabilities visible.",
          "points": [
            "Jobs, cameras, temperatures, files, and recovery state in one place",
            "Adapters preserve the differences between printer backends",
            "The same state model is exposed to Hermes through the API"
          ]
        },
        {
          "id": "power",
          "label": "Power",
          "image": "assets/screenshots/print-power.png",
          "alt": "Print Orchestrator power observation page",
          "caption": "Kasa smart plugs report printer and server consumption and can be controlled by operators, scripts, or Hermes workflows.",
          "points": [
            "Per-device power history and availability",
            "Remote power-on and safe power-off actions",
            "Automation hooks for scheduled and conditional workflows"
          ]
        },
        {
          "id": "vision",
          "label": "Vision + safety",
          "image": "assets/screenshots/print-failure.png",
          "alt": "Print Orchestrator failure detection page",
          "caption": "A modified Obico container evaluates camera frames, while a separate part-detection interlock can block a new job when the bed is not clear.",
          "points": [
            "Discord warnings when a print appears to be failing",
            "Part-on-bed detection before a new start",
            "Detection, operator review, and machine action remain separate"
          ]
        }
      ]
    },
    {
      "id": "pfc",
      "eyebrow": "Infrastructure supervision",
      "title": "PFC Supervisor",
      "summary": "A control plane for server power, local inference, schedules, safety interlocks, and recovery across the PFP/B70 infrastructure.",
      "tone": "acid",
      "project": "pfc-supervisor",
      "metrics": [
        {
          "value": "95.0 h",
          "label": "observed sleep in the captured week"
        },
        {
          "value": "13.19 kWh",
          "label": "estimated avoided energy"
        },
        {
          "value": "68.23 kWh",
          "label": "projected 30-day savings"
        },
        {
          "value": "$290.54",
          "label": "projected annual value"
        }
      ],
      "tabs": [
        {
          "id": "power",
          "label": "Power",
          "image": "assets/screenshots/pfc-power.png",
          "alt": "PFC power-management dashboard",
          "caption": "Power policy combines observed host state, workload blockers, protected schedules, and a retained energy ledger.",
          "points": [
            "Observed sleep is separated from modeled energy savings",
            "Hermes schedules remain protected while the main server sleeps",
            "Power policy stays inspectable instead of hiding decisions"
          ]
        },
        {
          "id": "runtime",
          "label": "AI runtime",
          "image": "assets/screenshots/pfc-runtime.png",
          "alt": "PFC AI runtime dashboard",
          "caption": "PFC adopts and reconciles the active llama.cpp services rather than treating model processes as anonymous background tasks.",
          "points": [
            "Manager and worker endpoints are tracked independently",
            "Runtime identity, process state, and required GPU behavior are reconciled",
            "Prepare-for-suspend and restore-after-wake actions are explicit"
          ]
        },
        {
          "id": "safety",
          "label": "Safety matrix",
          "image": "assets/screenshots/pfc-safety.png",
          "alt": "PFC subsystem eligibility matrix",
          "caption": "The eligibility matrix shows exactly which rule allowed or blocked an automatic suspend decision.",
          "points": [
            "Workloads, leases, schedules, and telemetry are separate checks",
            "Unknown state defaults to blocked",
            "The operator can audit the decision path"
          ]
        },
        {
          "id": "local",
          "label": "Local display",
          "image": "assets/screenshots/pfc-top.png",
          "alt": "PFC Top terminal display",
          "caption": "PFC Top gives the physical server a local, one-second operational view of compute, workloads, power policy, and connectivity.",
          "points": [
            "Works directly on the server display",
            "Useful during network or web-interface failures",
            "Complements the browser dashboards rather than replacing them"
          ]
        }
      ]
    }
  ],
  "hermes": {
    "eyebrow": "Agent integration",
    "title": "Hermes connects the local models to the systems around them.",
    "summary": "I run Nous Research’s Hermes Agent on top of local llama.cpp inference and use it as the workflow layer between PFC, Print Orchestrator, desktop tools, schedules, Discord, and engineering tasks.",
    "image": "assets/screenshots/hermes-ambient.png",
    "imageAlt": "Sanitized view of the Ambient Operator Hermes voice application",
    "widgets": [
      {
        "image": "assets/screenshots/pfc-pulse.png",
        "title": "PFC Pulse",
        "copy": "Push-to-talk voice companion using Whisper speech recognition and Piper speech output."
      },
      {
        "image": "assets/screenshots/pfc-command.png",
        "title": "PFC Command",
        "copy": "A compact desktop view for host state, workloads, power protection, and common actions."
      }
    ],
    "uses": [
      {
        "title": "Daily orchestration",
        "copy": "Routes local model work into printer, server, scheduling, messaging, and research workflows."
      },
      {
        "title": "Engineering copilot",
        "copy": "Hermes and ChatGPT help prototype interfaces, compare approaches, debug infrastructure, and document systems; architecture and validation remain human-owned."
      },
      {
        "title": "Current R&D",
        "copy": "Model-role tuning, cross-machine recovery, and meeting transcription, translation, summaries, action items, and calendar preparation."
      }
    ],
    "references": [
      {
        "label": "Hermes Agent docs",
        "url": "https://hermes-agent.nousresearch.com/docs/"
      },
      {
        "label": "Nous Research",
        "url": "https://nousresearch.com/"
      }
    ]
  },
  "projects": [
    {
      "id": "print-orchestrator",
      "category": "Automation software",
      "title": "Print Orchestrator",
      "short": "AI-ready printer fleet control, slicing, vision, power, and machine APIs.",
      "status": [
        "Active",
        "Private project",
        "In development"
      ],
      "hero": "assets/screenshots/print-fleet.png",
      "heroFit": "contain",
      "tone": "blue",
      "metrics": [
        {
          "value": "Mixed fleet",
          "label": "PrusaLink + Moonraker/Klipper"
        },
        {
          "value": "OpenSCAD",
          "label": "prompt-driven parametric CAD"
        },
        {
          "value": "Orca CLI",
          "label": "automated slicing path"
        },
        {
          "value": "Obico",
          "label": "vision warnings through Discord"
        }
      ],
      "overview": [
        {
          "title": "Operator interface",
          "copy": "One place for jobs, cameras, temperatures, files, power, part detection, and recovery state."
        },
        {
          "title": "Hermes frontend",
          "copy": "The API lets Hermes inspect machine state and invoke controlled actions instead of sending blind commands."
        },
        {
          "title": "Automation pipeline",
          "copy": "Prompt or model → OpenSCAD → modified OrcaSlicer CLI → preflight → API dispatch → vision monitoring."
        }
      ],
      "engineering": [
        {
          "title": "Preserve machine differences",
          "copy": "Protocol adapters provide a shared model without pretending every printer has the same controls."
        },
        {
          "title": "Block unsafe starts",
          "copy": "Part detection can prevent a job from beginning while an object remains on the bed."
        },
        {
          "title": "Separate detection from action",
          "copy": "Vision results, operator review, and machine commands remain distinct."
        },
        {
          "title": "Make power part of the workflow",
          "copy": "Kasa smart plugs expose consumption and power state to operators, scripts, and Hermes automations."
        }
      ],
      "gallery": [
        {
          "src": "assets/screenshots/print-fleet.png",
          "title": "Fleet control",
          "copy": "Mixed printer backends share one operator view."
        },
        {
          "src": "assets/screenshots/print-power.png",
          "title": "Power observation",
          "copy": "Printer and server demand are tracked through Kasa smart plugs."
        },
        {
          "src": "assets/screenshots/print-failure.png",
          "title": "Failure detection",
          "copy": "A modified Obico workflow produces inspectable vision warnings."
        },
        {
          "src": "assets/images/pi-case-render.png",
          "title": "Prototype workflow output",
          "copy": "A Raspberry Pi enclosure produced while developing the AI-assisted CAD and slicing path; it is an output artifact, not proof of fully unattended operation."
        },
        {
          "src": "assets/images/b70-pi-case.jpg",
          "title": "Installed enclosure",
          "copy": "The printed Pi enclosure is mounted on the PFP server."
        }
      ],
      "results": [
        {
          "title": "One automation boundary",
          "copy": "Mixed protocols, power, vision, and machine actions are exposed through a consistent API."
        },
        {
          "title": "Safer AI assistance",
          "copy": "Preflight state and interlocks are visible before a model-generated workflow reaches hardware."
        },
        {
          "title": "Path toward autonomy",
          "copy": "The software boundary is ready to grow toward automatic unloading and printer reset."
        }
      ],
      "future": [
        "Validate the complete prompt-to-print workflow as one measured sequence",
        "Add robotic part removal and printer reset",
        "Track job quality, material, and machine history for repeatable production"
      ],
      "references": [
        {
          "label": "OpenSCAD docs",
          "url": "https://openscad.org/documentation.html"
        },
        {
          "label": "OrcaSlicer",
          "url": "https://github.com/SoftFever/OrcaSlicer"
        },
        {
          "label": "Obico docs",
          "url": "https://www.obico.io/docs/"
        },
        {
          "label": "Klipper",
          "url": "https://www.klipper3d.org/"
        }
      ]
    },
    {
      "id": "pfc-supervisor",
      "category": "Infrastructure software",
      "title": "PFC Supervisor",
      "short": "Power policy, runtime control, schedules, safety, recovery, and local monitoring.",
      "status": [
        "Active",
        "Production infrastructure"
      ],
      "hero": "assets/screenshots/pfc-power.png",
      "heroFit": "contain",
      "tone": "acid",
      "metrics": [
        {
          "value": "95.0 h",
          "label": "observed sleep"
        },
        {
          "value": "13.19 kWh",
          "label": "estimated avoided energy"
        },
        {
          "value": "2.27 kWh/day",
          "label": "estimated average savings"
        },
        {
          "value": "$290.54/year",
          "label": "projected annual value"
        }
      ],
      "overview": [
        {
          "title": "Power control plane",
          "copy": "Coordinates server sleep and wake around workload state, schedules, leases, and minimum-awake rules."
        },
        {
          "title": "Inference supervision",
          "copy": "Tracks and reconciles the active llama.cpp manager and worker services."
        },
        {
          "title": "Retained scheduling",
          "copy": "A low-power Pi keeps Hermes schedule protection and wake logic available while the main host sleeps."
        }
      ],
      "engineering": [
        {
          "title": "Unknown means blocked",
          "copy": "Automatic suspend only proceeds when every required subsystem is explicitly eligible."
        },
        {
          "title": "Observed and modeled stay separate",
          "copy": "Sleep history is measured; avoided energy and dollar value are labeled as estimates until direct host metering is available."
        },
        {
          "title": "Recovery is a first-class state",
          "copy": "Prepare-for-suspend and restore-after-wake workflows are explicit and auditable."
        },
        {
          "title": "Delegate safely",
          "copy": "Minecraft controls can be exposed to friends and moderators without granting access to AI or host administration."
        }
      ],
      "gallery": [
        {
          "src": "assets/screenshots/pfc-power.png",
          "title": "Power management",
          "copy": "Current state, workload attribution, schedule cache, and savings are brought together."
        },
        {
          "src": "assets/screenshots/pfc-runtime.png",
          "title": "AI runtime",
          "copy": "Adopted llama.cpp services are tracked by role and endpoint."
        },
        {
          "src": "assets/screenshots/pfc-safety.png",
          "title": "Eligibility matrix",
          "copy": "Each rule that allows or blocks suspend is visible."
        },
        {
          "src": "assets/screenshots/pfc-energy.png",
          "title": "Energy ledger",
          "copy": "Observed load, modeled avoided energy, and projections stay inspectable."
        },
        {
          "src": "assets/screenshots/pfc-top.png",
          "title": "PFC Top",
          "copy": "A one-second terminal display for local server monitoring."
        },
        {
          "src": "assets/images/pfc-top-physical.jpg",
          "title": "Physical display",
          "copy": "PFC Top running directly on the server screen."
        }
      ],
      "results": [
        {
          "title": "Long idle periods become useful",
          "copy": "The captured week retained 95 hours of observed sleep without removing schedule protection."
        },
        {
          "title": "Savings are inspectable",
          "copy": "The current model estimates 13.19 kWh avoided over the captured week and $290.54 in annual value."
        },
        {
          "title": "Operations stay local",
          "copy": "Web, desktop, and physical interfaces cover normal operation and degraded network conditions."
        }
      ],
      "future": [
        "Add direct host metering for stronger energy attribution",
        "Build a cross-machine recovery agent between the server and main workstation",
        "Expand workload-aware policy without weakening conservative safety defaults"
      ],
      "references": [
        {
          "label": "llama.cpp",
          "url": "https://github.com/ggml-org/llama.cpp"
        },
        {
          "label": "Tailscale",
          "url": "https://tailscale.com/"
        },
        {
          "label": "Hermes Agent docs",
          "url": "https://hermes-agent.nousresearch.com/docs/"
        }
      ]
    },
    {
      "id": "ai-server",
      "category": "Local AI infrastructure",
      "title": "B70 / PFP engineering server",
      "short": "The local compute, inference, service, and benchmark platform behind the automation stack.",
      "status": [
        "Active",
        "Production infrastructure"
      ],
      "hero": "assets/images/b70-front.jpg",
      "heroFit": "cover",
      "tone": "orange",
      "metrics": [
        {
          "value": "llama.cpp",
          "label": "inference engine of choice"
        },
        {
          "value": "131k",
          "label": "production context"
        },
        {
          "value": "2 roles",
          "label": "manager + worker"
        },
        {
          "value": "SYCL",
          "label": "GPU backend"
        }
      ],
      "overview": [
        {
          "title": "Physical platform",
          "copy": "A custom server build with printed chassis work, local display, Linux services, private networking, and power supervision."
        },
        {
          "title": "Inference platform",
          "copy": "llama.cpp hosts the active manager and worker models with role-specific runtime settings."
        },
        {
          "title": "Applied system",
          "copy": "The server supports Hermes, PFC, Print Orchestrator, benchmarks, messaging, and engineering tools."
        }
      ],
      "engineering": [
        {
          "title": "Tune by role",
          "copy": "Muse is optimized for management and reasoning; Qwen is optimized for tool use and implementation."
        },
        {
          "title": "Separate experiments from production",
          "copy": "Broad throughput and speculative-decoding sweeps are reported independently from deployed profiles."
        },
        {
          "title": "Treat runtime settings as engineering variables",
          "copy": "Quant, KV cache, context, offload, templates, and draft behavior are tested rather than assumed."
        },
        {
          "title": "Keep infrastructure recoverable",
          "copy": "Containers, service scripts, PFC state, and local monitoring make runtime failures easier to isolate."
        }
      ],
      "gallery": [
        {
          "src": "assets/images/b70-front.jpg",
          "title": "B70 / PFP server",
          "copy": "The physical host for local inference and automation services."
        },
        {
          "src": "assets/images/b70-open.jpg",
          "title": "Internal build",
          "copy": "Hardware integration and serviceability remain visible instead of hidden behind a sealed appliance."
        },
        {
          "src": "assets/images/b70-pi-case.jpg",
          "title": "Low-power control node",
          "copy": "The attached Pi retains wake, schedule, and monitoring responsibilities."
        },
        {
          "src": "assets/images/pi-case-render.png",
          "title": "Printed enclosure design",
          "copy": "The Pi enclosure was developed as part of the broader CAD and automation workflow."
        }
      ],
      "results": [
        {
          "title": "Muse manager",
          "copy": "DFlash n2/p0.30 produces about 29.2 tok/s at roughly 71.2% acceptance versus about 21.4 tok/s native."
        },
        {
          "title": "Qwen worker",
          "copy": "Qwen3.6 35B-A3B Q5_K_XL runs natively at roughly 68–71 tok/s with q4_1 KV and a custom tool template."
        },
        {
          "title": "Measured model selection",
          "copy": "The active stack is selected from role-specific benchmarks rather than one general score."
        }
      ],
      "future": [
        "Refresh the complete standardized model sweep",
        "Continue manager/worker evaluation for supervision, coding, recovery, and tool use",
        "Improve peer recovery between the workstation and server"
      ],
      "references": [
        {
          "label": "llama.cpp",
          "url": "https://github.com/ggml-org/llama.cpp"
        },
        {
          "label": "Hermes Agent docs",
          "url": "https://hermes-agent.nousresearch.com/docs/"
        },
        {
          "label": "Tailscale",
          "url": "https://tailscale.com/"
        }
      ]
    },
    {
      "id": "e3ng",
      "category": "Motion systems",
      "title": "E3NG CoreXY conversion",
      "short": "An Ender 3 platform rebuilt into a Klipper-controlled CoreXY machine.",
      "status": [
        "Operational",
        "Custom build"
      ],
      "hero": "assets/images/e3ng-full.jpg",
      "heroFit": "cover",
      "tone": "orange",
      "metrics": [
        {
          "value": "CoreXY",
          "label": "converted motion platform"
        },
        {
          "value": "Klipper",
          "label": "firmware and calibration"
        },
        {
          "value": "CAN-style",
          "label": "toolhead/network debugging"
        },
        {
          "value": "Input shaper",
          "label": "measured motion tuning"
        }
      ],
      "overview": [
        {
          "title": "Mechanical conversion",
          "copy": "Frame, belt path, gantry, toolhead packaging, and enclosure decisions were rebuilt around CoreXY motion."
        },
        {
          "title": "Electronics integration",
          "copy": "SKR Mini E3 V3, Raspberry Pi, sensors, probe, camera, and toolhead connectivity were integrated and debugged."
        },
        {
          "title": "Commissioning",
          "copy": "Klipper configuration, homing, input shaper, bed mesh, thermal behavior, and repeatability were tuned as one machine."
        }
      ],
      "engineering": [
        {
          "title": "Commission the system, not the parts",
          "copy": "Mechanical alignment, electronics, firmware, slicing, and material behavior were evaluated together."
        },
        {
          "title": "Use measurement to tune motion",
          "copy": "Input shaper and bed-mesh data guided changes instead of relying on visual guesswork."
        },
        {
          "title": "Design for service",
          "copy": "Toolhead, electronics, probe, and cable routing were arranged for maintenance and iteration."
        }
      ],
      "gallery": [
        {
          "src": "assets/images/e3ng-full.jpg",
          "title": "Complete machine",
          "copy": "The converted CoreXY platform assembled and operational."
        },
        {
          "src": "assets/images/e3ng-toolhead.jpg",
          "title": "Toolhead integration",
          "copy": "Extruder, hotend, fans, probe, and wiring packaged on the moving assembly."
        },
        {
          "src": "assets/images/e3ng-electronics.jpg",
          "title": "Electronics and control",
          "copy": "Controller and interface hardware during integration."
        },
        {
          "src": "assets/images/e3ng-mesh.jpg",
          "title": "Bed compensation",
          "copy": "Measured height-map output used during calibration."
        },
        {
          "src": "assets/images/e3ng-probe.jpg",
          "title": "Probe mounting",
          "copy": "Sensor placement and repeatability were part of commissioning."
        },
        {
          "src": "assets/images/e3ng-working.jpg",
          "title": "Operational test",
          "copy": "Machine state and remote monitoring during use."
        }
      ],
      "results": [
        {
          "title": "Working custom machine",
          "copy": "The conversion reached operational status rather than remaining a partial frame or CAD exercise."
        },
        {
          "title": "Controls experience",
          "copy": "Motion, sensors, configuration, feedback, and error recovery were handled together."
        },
        {
          "title": "Reusable troubleshooting habits",
          "copy": "The build developed a repeatable method for isolating mechanical, electrical, thermal, and software faults."
        }
      ],
      "future": [
        "Continue reliability and technical-material testing",
        "Refine toolhead and cable serviceability",
        "Document repeatable maintenance and commissioning procedures"
      ],
      "references": [
        {
          "label": "E3NG project",
          "url": "https://github.com/RH3D/E3NG"
        },
        {
          "label": "Klipper docs",
          "url": "https://www.klipper3d.org/"
        }
      ]
    },
    {
      "id": "voron-systems",
      "category": "Additive manufacturing",
      "title": "Voron 2.4 systems",
      "short": "A large enclosed CoreXY platform built, tuned, maintained, and used for functional parts.",
      "status": [
        "Operational",
        "Open-source platform"
      ],
      "hero": "assets/images/voron-full.jpg",
      "heroFit": "cover",
      "tone": "orange",
      "metrics": [
        {
          "value": "Voron 2.4",
          "label": "open-source platform"
        },
        {
          "value": "CoreXY",
          "label": "enclosed motion system"
        },
        {
          "value": "Klipper",
          "label": "configuration and control"
        },
        {
          "value": "Functional parts",
          "label": "technical-material workflow"
        }
      ],
      "overview": [
        {
          "title": "Full build",
          "copy": "Frame, motion system, printed components, electronics, enclosure, toolhead, and firmware were assembled into a working machine."
        },
        {
          "title": "Precision assembly",
          "copy": "Squareness, gantry alignment, belt tension, Z alignment, and thermal behavior all affect repeatability."
        },
        {
          "title": "Production support mindset",
          "copy": "Maintenance, profiles, calibration, and root-cause isolation keep the system useful after the initial build."
        }
      ],
      "engineering": [
        {
          "title": "Align before tuning",
          "copy": "Mechanical geometry and motion resistance were checked before firmware compensation."
        },
        {
          "title": "Control the thermal environment",
          "copy": "Enclosure, material, toolhead, and bed behavior were treated as one process."
        },
        {
          "title": "Keep the machine maintainable",
          "copy": "Electronics, wiring, printed parts, and toolhead components were arranged for replacement and iteration."
        }
      ],
      "gallery": [
        {
          "src": "assets/images/voron-full.jpg",
          "title": "Complete enclosed printer",
          "copy": "The operating Voron 2.4 system."
        },
        {
          "src": "assets/images/voron-frame.jpg",
          "title": "Frame and motion structure",
          "copy": "The mechanical platform during assembly."
        },
        {
          "src": "assets/images/voron-assembly.jpg",
          "title": "Assembly stage",
          "copy": "Gantry and structural work before enclosure completion."
        },
        {
          "src": "assets/images/voron-case.jpg",
          "title": "Enclosure development",
          "copy": "Printed and sheet components used to close the build."
        },
        {
          "src": "assets/images/voron-parts.jpg",
          "title": "Printed components",
          "copy": "Custom parts supporting the machine build and maintenance."
        },
        {
          "src": "assets/images/voron-printing.jpg",
          "title": "Functional operation",
          "copy": "The machine producing parts inside the controlled enclosure."
        }
      ],
      "results": [
        {
          "title": "Operational large-format system",
          "copy": "The project progressed from frame assembly to a complete enclosed machine."
        },
        {
          "title": "Technical-material capability",
          "copy": "The controlled environment supports functional prototyping workflows."
        },
        {
          "title": "Equipment-support experience",
          "copy": "Calibration, maintenance, configuration, and process troubleshooting are ongoing parts of ownership."
        }
      ],
      "future": [
        "Continue documenting material and profile capability",
        "Improve maintenance access and uptime tracking",
        "Use the fleet orchestration layer for more repeatable job handoff"
      ],
      "references": [
        {
          "label": "VORON2.4",
          "url": "https://vorondesign.com/voron2.4"
        },
        {
          "label": "Voron documentation",
          "url": "https://docs.vorondesign.com/"
        },
        {
          "label": "Klipper docs",
          "url": "https://www.klipper3d.org/"
        }
      ]
    },
    {
      "id": "metuned",
      "category": "Product development",
      "title": "Metuned digital dash",
      "short": "A small-business race-electronics concept developed from a real endurance-racing problem.",
      "status": [
        "Small business founder",
        "Prototype"
      ],
      "hero": "assets/images/metuned-enclosure.jpg",
      "heroFit": "cover",
      "tone": "orange",
      "metrics": [
        {
          "value": "Co-founder",
          "label": "Chief Design Officer"
        },
        {
          "value": "CAD + print",
          "label": "enclosure iteration"
        },
        {
          "value": "PCB fit",
          "label": "electronics packaging"
        },
        {
          "value": "Race context",
          "label": "problem-driven product direction"
        }
      ],
      "overview": [
        {
          "title": "Problem",
          "copy": "Factory instrumentation did not provide enough useful feedback during endurance racing."
        },
        {
          "title": "Product direction",
          "copy": "The concept focused on an affordable, customizable digital dashboard for motorsports and enthusiast cars."
        },
        {
          "title": "My contribution",
          "copy": "Mechanical and electrical packaging, enclosure iteration, product direction, branding, documentation, and prototype presentation."
        }
      ],
      "engineering": [
        {
          "title": "Package the electronics",
          "copy": "PCB fit, wiring, cooling, service access, and display visibility shaped the enclosure."
        },
        {
          "title": "Prototype quickly",
          "copy": "Printed enclosures allowed fit and presentation changes before expensive manufacturing decisions."
        },
        {
          "title": "Design for a user",
          "copy": "Mounting, readability, branding, and field service mattered as much as the internal board."
        }
      ],
      "gallery": [
        {
          "src": "assets/images/metuned-enclosure.jpg",
          "title": "Prototype enclosure",
          "copy": "A compact printed housing for the display and electronics."
        },
        {
          "src": "assets/images/metuned-pcb.jpg",
          "title": "PCB fitment",
          "copy": "Board packaging and access informed the mechanical layout."
        },
        {
          "src": "assets/images/metuned-exploded.png",
          "title": "Exploded design",
          "copy": "The enclosure was broken into manufacturable, serviceable components."
        },
        {
          "src": "assets/images/metuned-bench.jpg",
          "title": "Bench prototype",
          "copy": "Physical packaging and integration during development."
        },
        {
          "src": "assets/images/metuned-cage.jpg",
          "title": "Vehicle context",
          "copy": "The product originated in the packaging and information constraints of a race car."
        },
        {
          "src": "assets/images/metuned-screen.png",
          "title": "Display concept",
          "copy": "Early interface and display hardware exploration."
        }
      ],
      "results": [
        {
          "title": "Problem became product direction",
          "copy": "A race-team failure was translated into a practical electronics concept."
        },
        {
          "title": "Physical and customer-facing work stayed connected",
          "copy": "Packaging, branding, documentation, and prototype communication developed together."
        },
        {
          "title": "Founder experience",
          "copy": "The project added planning, communication, iteration, and ownership beyond a normal coursework build."
        }
      ],
      "future": [
        "Retain the project as product-development and founder experience",
        "Revisit only when hardware, market, and manufacturing scope can be validated together"
      ],
      "references": []
    },
    {
      "id": "motorsports",
      "category": "Team leadership + fabrication",
      "title": "Sierra College Motorsports",
      "short": "Race preparation, fabrication, sponsorship, events, and trackside problem solving.",
      "status": [
        "Completed team program",
        "Leadership"
      ],
      "hero": "assets/images/motorsports-track.jpg",
      "heroFit": "cover",
      "tone": "orange",
      "metrics": [
        {
          "value": "$500",
          "label": "starting Mini Cooper"
        },
        {
          "value": "24 Hours",
          "label": "Lemons endurance program"
        },
        {
          "value": "President",
          "label": "after VP and treasurer roles"
        },
        {
          "value": "Community",
          "label": "Cars & Coffee and sponsorship"
        }
      ],
      "overview": [
        {
          "title": "Race program",
          "copy": "A low-cost Mini Cooper became a student platform for repair, fabrication, planning, and endurance racing."
        },
        {
          "title": "Leadership",
          "copy": "I moved from treasurer to vice president to president while coordinating funding, recruitment, outreach, and preparation."
        },
        {
          "title": "Hands-on work",
          "copy": "Engine and drivetrain access, brackets, mounts, welding support, field repairs, and trackside diagnosis happened under deadline."
        }
      ],
      "engineering": [
        {
          "title": "Prioritize safe function",
          "copy": "A repair had to fit, survive, remain serviceable, and be completed within the race schedule."
        },
        {
          "title": "Work across experience levels",
          "copy": "Tasks were broken into specific work that mixed-experience student teams could execute and inspect."
        },
        {
          "title": "Use failure as information",
          "copy": "Damage, heat, vibration, packaging, and service access guided the next repair."
        }
      ],
      "gallery": [
        {
          "src": "assets/images/motorsports-track.jpg",
          "title": "Race car on track",
          "copy": "The Mini Cooper operating in the endurance-racing environment."
        },
        {
          "src": "assets/images/motorsports-team.jpg",
          "title": "Student team",
          "copy": "The program combined technical work, outreach, and team coordination."
        },
        {
          "src": "assets/images/motorsports-welding.jpg",
          "title": "Trackside fabrication",
          "copy": "Repairs and fabrication were completed under real schedule pressure."
        },
        {
          "src": "assets/images/motorsports-engine.jpg",
          "title": "Drivetrain work",
          "copy": "Engine and supporting-system access during preparation and repair."
        },
        {
          "src": "assets/images/motorsports-event.jpg",
          "title": "Community event",
          "copy": "Cars & Coffee helped build visibility and funding."
        },
        {
          "src": "assets/images/motorsports-sema.jpg",
          "title": "Industry outreach",
          "copy": "SEMA-related outreach connected the student program to the wider industry."
        },
        {
          "src": "assets/images/motorsports-night-team.png",
          "title": "Team at the circuit",
          "copy": "Race execution required coordination beyond the car itself."
        },
        {
          "src": "assets/images/motorsports-award.png",
          "title": "Recognition",
          "copy": "A reminder that creativity and persistence mattered in a low-budget program."
        }
      ],
      "results": [
        {
          "title": "A car became a program",
          "copy": "The effort grew beyond one vehicle into events, sponsorship, leadership, and repeatable team operations."
        },
        {
          "title": "Real constraints improved judgment",
          "copy": "Budget, safety, schedule, reliability, and serviceability shaped each decision."
        },
        {
          "title": "Technical and organizational work converged",
          "copy": "Fabrication and repair succeeded because planning and communication supported them."
        }
      ],
      "future": [
        "Carry the same field-repair and team habits into manufacturing and automation roles"
      ],
      "references": [
        {
          "label": "24 Hours of Lemons",
          "url": "https://24hoursoflemons.com/"
        }
      ]
    },
    {
      "id": "espresso-machine",
      "category": "Senior design",
      "title": "Hybrid hand-actuated espresso machine",
      "short": "A compact ME190 machine combining a manual pressure mechanism with heating, sensing, and controls.",
      "status": [
        "Active senior project",
        "Sponsored"
      ],
      "hero": "assets/images/me190-full-assembly.png",
      "heroFit": "contain",
      "tone": "orange",
      "metrics": [
        {
          "value": "9 bar",
          "label": "target extraction pressure"
        },
        {
          "value": "2 oz ±10%",
          "label": "target double-shot volume"
        },
        {
          "value": "25–30 s",
          "label": "target pull time"
        },
        {
          "value": "$750",
          "label": "SendCutSend store-credit sponsorship"
        }
      ],
      "overview": [
        {
          "title": "System target",
          "copy": "Produce a repeatable double shot within a compact machine that combines a hand-actuated mechanism with thermal and electrical systems."
        },
        {
          "title": "Integrated design",
          "copy": "The assembly brings together the lever mechanism, group, water system, heater, pump, sensors, controls, and structural packaging."
        },
        {
          "title": "My contribution",
          "copy": "Electrical fundamentals, efficiency constraints, wattage calculations, controls planning, documentation, and system integration support."
        }
      ],
      "engineering": [
        {
          "title": "Balance force and packaging",
          "copy": "The lever geometry must generate extraction pressure while fitting the machine envelope and remaining safe to operate."
        },
        {
          "title": "Coordinate thermal and electrical loads",
          "copy": "Heating, pumping, sensing, and controls must fit realistic power and timing limits."
        },
        {
          "title": "Document the assembly",
          "copy": "CAD, drawings, parts, tests, and handoff material keep the team aligned as the design changes."
        }
      ],
      "gallery": [
        {
          "src": "assets/images/me190-full-assembly.png",
          "title": "Full assembly",
          "copy": "SolidWorks assembly drawing for the complete ME190 concept."
        },
        {
          "src": "assets/images/me190-prototype.jpg",
          "title": "Physical prototype",
          "copy": "The hand-actuated mechanism and machine layout during development."
        },
        {
          "src": "assets/images/me190-poster.jpg",
          "title": "Project presentation",
          "copy": "The team presenting the senior design work and engineering documentation."
        },
        {
          "src": "assets/images/me190-team.jpg",
          "title": "Project team",
          "copy": "Team development outside the CAD environment."
        }
      ],
      "results": [
        {
          "title": "External manufacturing support",
          "copy": "SendCutSend awarded the team $750 in store credit plus merchandise."
        },
        {
          "title": "System-level design",
          "copy": "Mechanical, thermal, electrical, control, and packaging constraints are being resolved together."
        },
        {
          "title": "Engineering documentation",
          "copy": "The project includes a full assembly, drawing work, presentation material, and design targets."
        }
      ],
      "future": [
        "Use the SendCutSend support for fabricated components",
        "Validate pressure, volume, pull time, and thermal behavior",
        "Close the loop between test results and the final design"
      ],
      "references": [
        {
          "label": "SendCutSend",
          "url": "https://sendcutsend.com/"
        }
      ]
    },
    {
      "id": "uei-lab",
      "category": "Professional test engineering",
      "title": "UEI / Sacramento State lab testing",
      "short": "Standards-driven appliance, airflow, instrumentation, and controlled-environment testing.",
      "status": [
        "Professional work",
        "Current"
      ],
      "hero": "assets/images/uei-tunnel.jpg",
      "heroFit": "cover",
      "tone": "orange",
      "metrics": [
        {
          "value": "HVI 916",
          "label": "fan/airflow procedure exposure"
        },
        {
          "value": "CFM",
          "label": "residential ventilation testing"
        },
        {
          "value": "CEC",
          "label": "energy-efficiency work"
        },
        {
          "value": "DAQ",
          "label": "pressure, temperature, and logging"
        }
      ],
      "overview": [
        {
          "title": "Airflow testing",
          "copy": "Residential fan testing uses controlled ducting, pressure/flow measurement, repeatable setup, and documented procedures."
        },
        {
          "title": "Appliance efficiency",
          "copy": "Portable-spa and related appliance work connects ambient conditions, system temperature, power, and test duration."
        },
        {
          "title": "My contribution",
          "copy": "Build and maintain test environments, set up instrumentation, collect data, repair fixtures, and document methods and results."
        }
      ],
      "engineering": [
        {
          "title": "Control the environment",
          "copy": "Leakage, geometry, temperature, instrumentation placement, and setup repeatability affect the result."
        },
        {
          "title": "Treat documentation as part of the test",
          "copy": "Procedures and records make measurements reviewable and repeatable."
        },
        {
          "title": "Repair without compromising the method",
          "copy": "Fixture maintenance and sealing work must preserve the assumptions of the test."
        }
      ],
      "gallery": [
        {
          "src": "assets/images/uei-tunnel.jpg",
          "title": "Airflow duct",
          "copy": "The large controlled duct used for fan measurement."
        },
        {
          "src": "assets/images/uei-fan.jpg",
          "title": "Fan under test",
          "copy": "A residential ventilation unit prepared for measurement."
        },
        {
          "src": "assets/images/uei-rig.jpg",
          "title": "Pressure and flow setup",
          "copy": "Tubing and instruments connected to the test apparatus."
        },
        {
          "src": "assets/images/uei-logger.jpg",
          "title": "Data logging",
          "copy": "Temperature and channel data collected during testing."
        },
        {
          "src": "assets/images/uei-room.jpg",
          "title": "Controlled room",
          "copy": "A constructed environment used for appliance-efficiency work."
        },
        {
          "src": "assets/images/uei-room-build.jpg",
          "title": "Test-room construction",
          "copy": "The physical test environment during assembly."
        },
        {
          "src": "assets/images/uei-blower.jpg",
          "title": "Large fan setup",
          "copy": "Additional ventilation hardware and fixture work."
        }
      ],
      "results": [
        {
          "title": "Professional measurement discipline",
          "copy": "The work connects standards, instrumentation, environment control, data quality, and documentation."
        },
        {
          "title": "Hands-on test support",
          "copy": "Construction, setup, sealing, repair, and data collection all contribute to a valid result."
        },
        {
          "title": "Transferable test habits",
          "copy": "Repeatability and traceability apply directly to manufacturing and automation validation."
        }
      ],
      "future": [
        "Continue building direct experience with standards, instrumentation, and test reporting"
      ],
      "references": []
    },
    {
      "id": "abb-rexroth",
      "category": "Robotics coursework",
      "title": "ABB / Rexroth robotics",
      "short": "Supervised hands-on work with industrial robot hardware, controllers, I/O, and safety state.",
      "status": [
        "Coursework",
        "Completed"
      ],
      "hero": "assets/images/abb-robot.jpg",
      "heroFit": "cover",
      "tone": "orange",
      "metrics": [
        {
          "value": "ABB",
          "label": "industrial robot hardware"
        },
        {
          "value": "Rexroth",
          "label": "controller platform"
        },
        {
          "value": "I/O",
          "label": "state and interface exposure"
        },
        {
          "value": "Safety",
          "label": "E-stop and controlled motion"
        }
      ],
      "overview": [
        {
          "title": "Industrial context",
          "copy": "The lab connected academic controls concepts to real robot, controller, cabling, I/O, and emergency-stop hardware."
        },
        {
          "title": "State awareness",
          "copy": "Robot and controller state were checked before motion or configuration changes."
        },
        {
          "title": "Accurate scope",
          "copy": "The work is presented as supervised academic experience, not production ownership."
        }
      ],
      "engineering": [
        {
          "title": "Understand the stop path",
          "copy": "Emergency-stop behavior and safe state were part of every motion task."
        },
        {
          "title": "Observe before changing",
          "copy": "Controller, robot, and I/O state were inspected before commands were issued."
        },
        {
          "title": "Connect faults to hardware",
          "copy": "Motion problems were considered across controller state, cables, interfaces, and mechanical equipment."
        }
      ],
      "gallery": [
        {
          "src": "assets/images/abb-robot.jpg",
          "title": "ABB robot cell",
          "copy": "Industrial robot hardware in the supervised laboratory."
        },
        {
          "src": "assets/images/abb-robot-2.jpg",
          "title": "Robot and work area",
          "copy": "The physical cell and surrounding setup during coursework."
        },
        {
          "src": "assets/images/rexroth-controller.jpg",
          "title": "Rexroth controller platform",
          "copy": "Controller and I/O hardware used in the lab."
        },
        {
          "src": "assets/images/abb-lab.jpg",
          "title": "Integrated setup",
          "copy": "Robot, controller, cabling, and safety hardware in one view."
        }
      ],
      "results": [
        {
          "title": "Controls concepts became physical",
          "copy": "Motion, state, interfaces, and faults were tied to real equipment."
        },
        {
          "title": "Safety habits developed early",
          "copy": "Motion work was framed around controlled state and stop behavior."
        },
        {
          "title": "Foundation for automation support",
          "copy": "The experience supports later work in equipment troubleshooting and commissioning."
        }
      ],
      "future": [
        "Build on the foundation with more direct programming, I/O integration, and documented fault recovery"
      ],
      "references": [
        {
          "label": "ABB Robotics",
          "url": "https://new.abb.com/products/robotics"
        },
        {
          "label": "Bosch Rexroth",
          "url": "https://www.boschrexroth.com/"
        }
      ]
    },
    {
      "id": "makerspace-manufacturing",
      "category": "Work experience",
      "title": "Manufacturing and makerspace experience",
      "short": "Equipment support, user training, CAD/CAM, finishing, inventory, and production handoff.",
      "status": [
        "Work experience",
        "Equipment support"
      ],
      "hero": "assets/images/makerspace-laser.jpg",
      "heroFit": "cover",
      "tone": "orange",
      "metrics": [
        {
          "value": "2 roles",
          "label": "makerspace + production"
        },
        {
          "value": "CAD/CAM",
          "label": "file and machine setup"
        },
        {
          "value": "Training",
          "label": "safe user support"
        },
        {
          "value": "Finish",
          "label": "deburr, inspect, pack, ship"
        }
      ],
      "overview": [
        {
          "title": "Sierra College Makerspace",
          "copy": "Supported 3D printers, CNC routers, laser systems, woodworking, vinyl, and embroidery equipment through setup, maintenance, troubleshooting, training, and safety."
        },
        {
          "title": "Vanquish / ASB Products",
          "copy": "Supported inventory, staging, deburring, polishing, cleaning, inspection, anodizing or laser-etch preparation, packaging, and shipping."
        },
        {
          "title": "Shared lesson",
          "copy": "A design only becomes useful when the equipment, process, user, finishing, and handoff all work together."
        }
      ],
      "engineering": [
        {
          "title": "Teach the process",
          "copy": "Good support helps the next job run safely without constant supervision."
        },
        {
          "title": "Treat finishing as production",
          "copy": "Deburring, cleaning, inspection, and packaging affect quality and customer experience."
        },
        {
          "title": "Protect people and equipment",
          "copy": "Setup, maintenance, training, and safety are part of uptime."
        }
      ],
      "gallery": [
        {
          "src": "assets/images/makerspace-laser.jpg",
          "title": "Laser-system support",
          "copy": "Safe setup, file preparation, process checks, and supervised operation."
        },
        {
          "src": "assets/images/makerspace-prusa.jpg",
          "title": "Printer setup",
          "copy": "Additive-manufacturing equipment assembly, configuration, maintenance, and support."
        },
        {
          "src": "assets/images/makerspace-shop.jpg",
          "title": "Hands-on shop work",
          "copy": "Practical setup, safe tool use, troubleshooting, and handoff."
        },
        {
          "src": "assets/images/makerspace-lab.jpg",
          "title": "Makerspace environment",
          "copy": "A mixed-tool workspace where user support and equipment availability mattered."
        }
      ],
      "results": [
        {
          "title": "Broader machine fluency",
          "copy": "The roles covered multiple tools and workflows instead of one narrow process."
        },
        {
          "title": "Operator-support habits",
          "copy": "Training, safety, and clear handoff became part of the technical solution."
        },
        {
          "title": "Production perspective",
          "copy": "Inventory, finishing, inspection, and shipping showed what happens after machining."
        }
      ],
      "future": [
        "Add only work samples that accurately represent the roles and can be shared"
      ],
      "references": []
    }
  ],
  "benchmarks": {
    "production": [
      {
        "role": "Manager",
        "model": "Muse-Glimmer-30B-UD-Q5_K_XL",
        "runtime": "b70-llama-sycl-muse",
        "speed": "~29.2 tok/s",
        "note": "~71.2% DFlash acceptance · ~21.4 tok/s native",
        "settings": [
          "llama.cpp + SYCL0",
          "131,072 context",
          "Q8_0 K/V cache",
          "DFlash n2 · p-min 0.30",
          "medium reasoning",
          "-ngl 99 · flash attention"
        ]
      },
      {
        "role": "Worker",
        "model": "Qwen3.6-35B-A3B-UD-Q5_K_XL",
        "runtime": "b70-llama-sycl-next",
        "speed": "~68–71 tok/s",
        "note": "Native decode selected; MTP overhead exceeded savings",
        "settings": [
          "llama.cpp + SYCL0",
          "131,072 context",
          "q4_1 K/V cache",
          "custom Jinja tool template",
          "--no-mmap · -ncmoe 0",
          "-ngl 99 · flash attention"
        ]
      }
    ],
    "standardized": {
      "meta": "SYCL backend · pp512 + tg128 · 3 repetitions · -ngl 99 · llama.cpp build 6e62ba538 (10369). The run emitted a warning that a llama-server process appeared active, so these are the retained normal-results reference with that caveat.",
      "rows": [
        [
          "Gemma 4 12B",
          "Q4_K_XL",
          "Dense",
          "6.86",
          "1511.79 ± 3.94",
          "49.04 ± 0.26"
        ],
        [
          "Gemma 4 26B-A4B",
          "Q4_K_M",
          "MoE",
          "15.78",
          "772.25 ± 86.10",
          "66.89 ± 8.71"
        ],
        [
          "Gemma 4 31B",
          "Q4_K_XL",
          "Dense",
          "17.52",
          "427.72 ± 16.36",
          "22.62 ± 0.07"
        ],
        [
          "Gemma 4 E2B",
          "Q4_K_XL",
          "MoE",
          "2.97",
          "5315.26 ± 96.11",
          "136.58 ± 0.12"
        ],
        [
          "Gemma 4 E4B",
          "Q4_K_XL",
          "MoE",
          "4.77",
          "3165.46 ± 64.46",
          "88.48 ± 0.39"
        ],
        [
          "Muse-Glimmer 30B",
          "Q5_K_XL",
          "Dense",
          "20.28",
          "569.33 ± 77.41",
          "22.00 ± 0.02"
        ],
        [
          "Qwen3.5 0.8B",
          "Q8_K_XL",
          "Dense",
          "0.80",
          "14262.06 ± 1417.45",
          "202.79 ± 0.35"
        ],
        [
          "Qwen3.6 35B-A3B",
          "Q5_K_S",
          "MoE",
          "23.77",
          "724.90 ± 68.10",
          "72.77 ± 3.28"
        ],
        [
          "Qwen3.6 35B-A3B",
          "Q5_K_XL",
          "MoE",
          "20.61",
          "724.97 ± 68.36",
          "75.63 ± 1.19"
        ],
        [
          "Qwen3.6 35B-A3B",
          "Q4_K_M",
          "MoE",
          "20.61",
          "706.68 ± 97.73",
          "77.52 ± 1.98"
        ],
        [
          "Qwen 3.8 27B",
          "Q6_K",
          "Dense",
          "21.30",
          "485.92 ± 80.05",
          "19.92 ± 0.03"
        ],
        [
          "Kanana 2 30B-A3B",
          "Q4_K_M",
          "MoE",
          "17.00",
          "593.42 ± 37.51",
          "28.18 ± 0.08"
        ]
      ]
    },
    "mtp": {
      "meta": "Broad end-to-end sweep: llama-server, c=8192, ngl=99, parallel=1, temperature=0, seed=42, 256 output tokens, 4 workloads × 3 repetitions.",
      "rows": [
        [
          "Gemma 4 12B Q4_K_XL",
          "n2",
          "71.555",
          "76.35%",
          "1.495×"
        ],
        [
          "Gemma 4 26B-A4B Q4_K_M",
          "n4",
          "93.331",
          "63.61%",
          "1.239×"
        ],
        [
          "Gemma 4 31B Q4_K_XL",
          "n2",
          "33.060",
          "81.44%",
          "1.496×"
        ],
        [
          "Qwen3.6 35B-A3B Q5_K_S",
          "Baseline",
          "77.153",
          "—",
          "MTP regressed"
        ],
        [
          "Qwen 3.8 27B Q6_K",
          "n2",
          "33.196",
          "70.70%",
          "1.671×"
        ]
      ],
      "finding": "n2 was usually best, n4 won for Gemma 26B-A4B, n8 was consistently harmful, and Qwen3.6 remained faster without MTP."
    },
    "downloads": [
      {
        "label": "Standardized benchmark CSV",
        "href": "data/b70-standardized-llama-bench-2026-08-14.csv"
      },
      {
        "label": "Broad MTP sweep CSV",
        "href": "data/mtp-broad-sweep-2026-08-14.csv"
      }
    ]
  },
  "experience": [
    {
      "role": "Lab Assistant",
      "org": "University Enterprises / Sacramento State",
      "period": "May 2026 – Present",
      "copy": "CEC-related appliance testing, residential fan airflow/CFM work, controlled environments, instrumentation, data collection, fixture repair, and documentation."
    },
    {
      "role": "Co-founder / Chief Design Officer",
      "org": "Metuned LLC",
      "period": "2023 – 2026",
      "copy": "Race-electronics product direction, CAD and printed enclosure work, packaging, prototype communication, and small-business ownership."
    },
    {
      "role": "Makerspace Technical Assistant",
      "org": "Sierra College",
      "period": "2023",
      "copy": "Equipment support, user training, CAD/CAM, maintenance, troubleshooting, and shop safety across digital-fabrication tools."
    },
    {
      "role": "Inventory / Factory Support",
      "org": "Vanquish Products / ASB Products",
      "period": "2021 – 2023",
      "copy": "Inventory, staging, finishing, inspection, process handoff, packaging, and shipping for machined RC components."
    },
    {
      "role": "President / VP / Treasurer",
      "org": "Sierra College Motorsports Club",
      "period": "2023 – 2024",
      "copy": "Race preparation, fabrication, team coordination, events, sponsorship, funding, and trackside execution."
    }
  ],
  "education": [
    {
      "school": "California State University, Sacramento",
      "degree": "B.S. Mechanical Engineering",
      "period": "Expected Fall 2026"
    },
    {
      "school": "Sierra College",
      "degree": "A.S. Natural Science + A.S.-T Engineering",
      "period": "Completed"
    }
  ],
  "skills": [
    "Mechanical design and CAD/CAM",
    "Automation and controls-adjacent troubleshooting",
    "Klipper, Linux, APIs, and local infrastructure",
    "Test engineering and instrumentation",
    "Additive manufacturing and machine commissioning",
    "Fabrication, repair, and manufacturing support",
    "Technical documentation and operator training",
    "Local AI deployment, benchmarking, and orchestration"
  ]
};
