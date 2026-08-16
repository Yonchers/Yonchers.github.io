#!/usr/bin/env python3
"""Build the in-page project workspace data from the long-form project files."""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup, Tag

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT / "projects"
OUTPUT = ROOT / "project-tabs-data.js"

TAB_LABELS = {
    "overview": "Overview",
    "decisions": "Design decisions",
    "workflow": "Workflow",
    "savings": "Power savings",
    "benchmarks": "Benchmarks",
    "sponsorship": "Sponsorship",
    "evidence": "Evidence",
    "outcomes": "Results",
}

DEFAULT_HEADING_COPY = {
    "overview": (
        "Overview",
        "The project at a glance.",
        "The problem, my contribution, and the constraint that shaped the work.",
    ),
    "decisions": (
        "Design decisions",
        "How I approached the engineering.",
        "The tradeoffs and safeguards I used to move the project forward.",
    ),
    "workflow": (
        "Workflow",
        "How the system works from end to end.",
        "A step-by-step view of the data and operator workflow.",
    ),
    "savings": (
        "Power savings",
        "What the current power data shows.",
        "Observed sleep is separated from estimated energy savings so the result remains honest.",
    ),
    "benchmarks": (
        "Benchmarks",
        "What the hardware can run in practice.",
        "Results are tied to the actual hardware, model format, and launch configuration.",
    ),
    "sponsorship": (
        "Sponsorship",
        "Outside support is helping move the design into fabrication.",
        "The support adds outside validation and more room for production-intent fabrication.",
    ),
    "evidence": (
        "Evidence",
        "Build photos, interfaces, and documentation from the work.",
        "These images connect the description to work that was built, tested, or operated.",
    ),
    "outcomes": (
        "Results",
        "What the project accomplished and what comes next.",
        "The result, the main lesson, and the next useful improvement.",
    ),
}

PROJECT_HEADING_TITLES = {
    "print-orchestrator": {
        "overview": "Why I built one dashboard for a mixed printer fleet.",
        "decisions": "The interface had to respect how different each machine really is.",
        "workflow": "What happens between a printer update and an operator action.",
        "evidence": "Screenshots and build evidence from the working system.",
        "outcomes": "A clearer way to operate, troubleshoot, and extend the fleet.",
    },
    "pfc-supervisor": {
        "overview": "The AI server did not need to stay awake when no work was running.",
        "decisions": "Automatic sleep only works when the safety logic is visible.",
        "savings": "The current seven-day snapshot shows 95 hours of sleep.",
        "evidence": "The live control panels show how power decisions are made.",
        "outcomes": "Lower idle power without giving up schedules or recovery.",
    },
    "ai-server": {
        "overview": "I built the B70 around the local AI work I actually wanted to run.",
        "decisions": "A useful local model is more than a single speed number.",
        "benchmarks": "What the B70 can run in practice.",
        "evidence": "Hardware, services, and benchmark evidence from the active system.",
        "outcomes": "A private AI platform that now supports several other projects.",
    },
    "e3ng": {
        "overview": "I turned an Ender 3 platform into a custom CoreXY machine.",
        "decisions": "Mechanical alignment, electronics, and firmware had to work as one system.",
        "evidence": "Build photos and calibration results from the conversion.",
        "outcomes": "A working motion platform and deeper controls troubleshooting experience.",
    },
    "voron-systems": {
        "overview": "I build and maintain enclosed printers as small production systems.",
        "decisions": "Reliability came from geometry, thermal control, and repeatable maintenance.",
        "evidence": "Build, wiring, and production evidence from the printer fleet.",
        "outcomes": "Reliable prototyping capacity for technical materials and functional parts.",
    },
    "metuned": {
        "overview": "A race-day information problem became a product idea.",
        "decisions": "Packaging, cooling, service access, and the driver experience shaped the design.",
        "evidence": "CAD, enclosure prototypes, electronics fitment, and race context.",
        "outcomes": "A stronger path from field problem to manufacturable product.",
    },
    "motorsports": {
        "overview": "We built a race program around a $500 Mini Cooper.",
        "decisions": "The car and the organization had to improve at the same time.",
        "evidence": "Repairs, fabrication, events, and trackside work from the program.",
        "outcomes": "A practical lesson in leadership, safety, and engineering under pressure.",
    },
    "espresso-machine": {
        "overview": "Our senior design team is building a compact hybrid espresso machine.",
        "decisions": "Pressure, heat, timing, fabrication, and serviceability affect the same shot.",
        "sponsorship": "SendCutSend is helping us turn the design into real parts.",
        "evidence": "Design documents, prototypes, and manufacturing evidence from ME190.",
        "outcomes": "A stronger final build path backed by outside support.",
    },
    "uei-lab": {
        "overview": "I support appliance and airflow testing in a standards-driven lab.",
        "decisions": "Reliable data starts with a controlled setup and documented repairs.",
        "evidence": "The test fixtures, instruments, and environments behind the measurements.",
        "outcomes": "Professional experience with repeatability, uncertainty, and lab documentation.",
    },
    "abb-rexroth": {
        "overview": "ME165 gave me hands-on exposure to industrial robotics hardware.",
        "decisions": "Safety state, controller state, I/O, and the physical cell all matter together.",
        "evidence": "ABB and Rexroth hardware, controls, and supervised lab setups.",
        "outcomes": "A practical foundation for automation and equipment-support work.",
    },
    "makerspace-manufacturing": {
        "overview": "I helped people turn designs into parts while keeping equipment available.",
        "decisions": "Good manufacturing support is as much about setup and teaching as the machine.",
        "evidence": "Machines, fixtures, and production work from the shop floor.",
        "outcomes": "Broader equipment fluency and better operator-support habits.",
    },
}

PROJECT_META = {
    "print-orchestrator": ("Printer fleet management", "Print Orchestrator"),
    "pfc-supervisor": ("Server power management", "PFC Supervisor"),
    "ai-server": ("Local AI infrastructure", "B70 local AI server"),
    "e3ng": ("Custom motion system", "E3NG CoreXY conversion"),
    "voron-systems": ("Rapid prototyping systems", "Voron printer systems"),
    "metuned": ("Motorsports product development", "Metuned digital dash"),
    "motorsports": ("Team leadership and fabrication", "Sierra College Motorsports"),
    "espresso-machine": ("ME190 senior design", "Hybrid hand-actuated espresso machine"),
    "uei-lab": ("Professional test engineering", "UEI energy-efficiency testing"),
    "abb-rexroth": ("Industrial robotics coursework", "ABB and Rexroth robotics lab"),
    "makerspace-manufacturing": ("Manufacturing support", "Makerspace and manufacturing support"),
}


def heading_copy(project_id: str, section_id: str) -> tuple[str, str, str | None] | None:
    base = DEFAULT_HEADING_COPY.get(section_id)
    if not base:
        return None
    title = PROJECT_HEADING_TITLES.get(project_id, {}).get(section_id, base[1])
    return base[0], title, base[2]


PROJECT_ORDER = [
    "print-orchestrator",
    "pfc-supervisor",
    "ai-server",
    "e3ng",
    "voron-systems",
    "metuned",
    "motorsports",
    "espresso-machine",
    "uei-lab",
    "abb-rexroth",
    "makerspace-manufacturing",
]


def rewrite_url(value: str) -> str:
    """Convert ../../assets references in source pages to site-root-relative paths."""
    if not value:
        return value
    parsed = urlparse(value)
    if parsed.scheme or value.startswith(("#", "mailto:", "tel:", "data:")):
        return value
    while value.startswith("../"):
        value = value[3:]
    if value.startswith("index.html"):
        return value
    return value


def clean_fragment(fragment: Tag) -> str:
    # Dynamically inserted content should already be visible; the page-load reveal
    # observer does not need to manage it.
    for node in fragment.select(".project-reveal"):
        classes = [name for name in node.get("class", []) if name != "project-reveal"]
        if classes:
            node["class"] = classes
        elif node.has_attr("class"):
            del node["class"]

    for node in fragment.find_all(True):
        for attr in ("src", "href", "poster"):
            if node.has_attr(attr):
                node[attr] = rewrite_url(node[attr])
        if node.has_attr("srcset"):
            parts = []
            for item in node["srcset"].split(","):
                bits = item.strip().split()
                if bits:
                    bits[0] = rewrite_url(bits[0])
                    parts.append(" ".join(bits))
            node["srcset"] = ", ".join(parts)

    return fragment.decode_contents(formatter="html")


def text_or_empty(node: Tag | None) -> str:
    return node.get_text(" ", strip=True) if node else ""


def build_project(project_id: str) -> dict:
    source = PROJECTS / project_id / "index.html"
    soup = BeautifulSoup(source.read_text(encoding="utf-8"), "html.parser")
    body = soup.body
    hero = soup.select_one(".project-hero")
    hero_img = hero.select_one(".project-hero-frame img") if hero else None
    hero_caption = hero.select_one(".project-hero-caption span") if hero else None

    metrics = []
    for article in soup.select(".project-metrics article"):
        metrics.append({
            "value": text_or_empty(article.select_one("strong")),
            "label": text_or_empty(article.select_one("span")),
        })

    tabs = []
    for section in soup.select("section.project-section[id]"):
        section_id = section.get("id", "").strip()
        if not section_id:
            continue
        heading = section.select_one(".project-section-heading")
        replacement = heading_copy(project_id, section_id)
        if heading and replacement:
            eyebrow, title, side = replacement
            eyebrow_node = heading.select_one(".project-eyebrow")
            title_node = heading.select_one("h2")
            side_node = next((child for child in heading.find_all("p", recursive=False)), None)
            if eyebrow_node:
                eyebrow_node.string = eyebrow
            if title_node:
                title_node.string = title
            if side is not None and side_node:
                side_node.string = side

        tabs.append({
            "id": section_id,
            "label": TAB_LABELS.get(section_id, section_id.replace("-", " ").title()),
            "html": clean_fragment(section),
        })

    next_section = soup.select_one(".project-next")
    next_copy = ""
    if next_section:
        paragraphs = next_section.select("p")
        if paragraphs:
            next_copy = text_or_empty(paragraphs[-1])

    status = [text_or_empty(node) for node in soup.select(".project-status-row span")]

    return {
        "id": project_id,
        "tone": body.get("data-project-tone", "orange") if body else "orange",
        "eyebrow": PROJECT_META.get(project_id, (text_or_empty(hero.select_one(".project-eyebrow") if hero else None), ""))[0],
        "title": PROJECT_META.get(project_id, ("", text_or_empty(hero.select_one("h1") if hero else None)))[1],
        "lede": text_or_empty(hero.select_one(".project-hero-lede") if hero else None),
        "status": status,
        "image": rewrite_url(hero_img.get("src", "")) if hero_img else "",
        "imageAlt": hero_img.get("alt", "") if hero_img else "",
        "imageCaption": text_or_empty(hero_caption),
        "metrics": metrics,
        "tabs": tabs,
        "next": next_copy,
        "fallbackPage": f"projects/{project_id}/",
    }


def main() -> None:
    projects = {project_id: build_project(project_id) for project_id in PROJECT_ORDER}
    payload = {
        "order": PROJECT_ORDER,
        "projects": projects,
    }
    OUTPUT.write_text(
        "window.PORTFOLIO_PROJECTS = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {len(projects)} integrated projects.")


if __name__ == "__main__":
    main()
