#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$ROOT"

for required in \
  index.html resume.html portfolio-summary.html documents.css .nojekyll \
  styles.css v3.css project.css v4.css v6.css \
  app.js v3.js project-tabs-data.js v4.js v6.js \
  tools/build_v6_project_data.py tools/update_index_v6.py tools/build_project_redirects.py \
  assets/favicon.svg \
  assets/downloads/b70-standardized-llama-bench-2026-08-14.csv \
  assets/downloads/mtp-broad-sweep-2026-08-14.csv \
  assets/downloads/production-model-profiles-2026-08-15.csv; do
  if [ ! -f "$required" ]; then
    printf 'Missing required file: %s\n' "$required" >&2
    exit 1
  fi
done

node --check app.js
node --check v3.js
node --check v4.js
node --check v6.js
node --check project-tabs-data.js

python3 - <<'PY'
from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
import csv
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlparse

from bs4 import BeautifulSoup

root = Path.cwd().resolve()
expected_order = [
    "print-orchestrator", "pfc-supervisor", "hermes", "ai-server", "e3ng",
    "voron-systems", "metuned", "motorsports", "espresso-machine", "uei-lab",
    "abb-rexroth", "makerspace-manufacturing",
]
expected_projects = set(expected_order)

registry_text = (root / "project-tabs-data.js").read_text(encoding="utf-8").strip()
prefix = "window.PORTFOLIO_PROJECTS = "
if not registry_text.startswith(prefix) or not registry_text.endswith(";"):
    raise SystemExit("project-tabs-data.js does not contain the expected assignment")
registry = json.loads(registry_text[len(prefix):-1])
projects = registry.get("projects", {})
if registry.get("version") != 6:
    raise SystemExit("Project registry is not V6")
if registry.get("order") != expected_order or set(projects) != expected_projects:
    raise SystemExit("Project registry order/content mismatch")

project_pages = sorted(root.glob("projects/*/index.html"))
if {page.parent.name for page in project_pages} != expected_projects:
    raise SystemExit("Direct project routes do not match the 12 integrated projects")

html_files = [root / "index.html", root / "resume.html", root / "portfolio-summary.html", *project_pages]

class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[str] = []
        self.ids: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        for key in ("src", "href", "poster"):
            value = attrs.get(key)
            if value:
                self.refs.append(value)
        srcset = attrs.get("srcset")
        if srcset:
            self.refs.extend(item.strip().split()[0] for item in srcset.split(",") if item.strip())


def validate_ref(ref: str, base: Path, source: str, missing: list[str]) -> None:
    parsed = urlparse(ref)
    if parsed.scheme or ref.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return
    local = (base / unquote(parsed.path)).resolve()
    try:
        local.relative_to(root)
    except ValueError:
        missing.append(f"{source} -> {ref} (outside package)")
        return
    if local.is_dir():
        local = local / "index.html"
    if not local.exists():
        missing.append(f"{source} -> {ref}")

missing: list[str] = []
for html_file in html_files:
    parser = PageParser()
    parser.feed(html_file.read_text(encoding="utf-8"))
    duplicates = [item for item, count in Counter(parser.ids).items() if count > 1]
    if duplicates:
        raise SystemExit(f"Duplicate IDs in {html_file.relative_to(root)}: {duplicates}")
    for ref in parser.refs:
        validate_ref(ref, html_file.parent, str(html_file.relative_to(root)), missing)

for project_id, project in projects.items():
    if not all(project.get(key) for key in ("title", "lede", "image", "tabs")):
        raise SystemExit(f"Missing core project content: {project_id}")
    validate_ref(project["image"], root, f"registry:{project_id}/hero", missing)
    tab_ids = [tab.get("id") for tab in project["tabs"]]
    if len(tab_ids) < 4:
        raise SystemExit(f"Too few tabs for {project_id}")
    gallery = project.get("gallery", [])
    if gallery and "documentation" not in tab_ids:
        raise SystemExit(f"{project_id} has gallery assets but no Documentation tab")
    for item in gallery:
        validate_ref(item["src"], root, f"registry:{project_id}/gallery", missing)
    for tab in project["tabs"]:
        parser = PageParser()
        parser.feed(tab.get("html", ""))
        for ref in parser.refs:
            validate_ref(ref, root, f"registry:{project_id}/{tab.get('id')}", missing)

if missing:
    raise SystemExit("Missing local references:\n  " + "\n  ".join(sorted(set(missing))))

index_text = (root / "index.html").read_text(encoding="utf-8")
index = BeautifulSoup(index_text, "html.parser")
if index.body.get("data-portfolio-version") != "6":
    raise SystemExit("index.html is missing the V6 body marker")
styles = [node.get("href") for node in index.select('link[rel~="stylesheet"]')]
if not styles or styles[-1] != "v6.css":
    raise SystemExit("v6.css must be the final stylesheet")
scripts = [node.get("src") for node in index.select("script[src]")]
if not scripts or scripts[-1] != "v6.js":
    raise SystemExit("v6.js must be the final external script")
if len(index.select(".project-card[data-project]")) != 12:
    raise SystemExit("Expected 12 project cards")
if len(index.select(".project-card [data-open-project]")) != 12:
    raise SystemExit("Every project card must open the integrated workspace")
if not index.select_one("#projectWorkspace"):
    raise SystemExit("Integrated project workspace is missing")
if len(index.select("[data-benchmark-tab]")) != 3 or len(index.select("[data-benchmark-panel]")) != 3:
    raise SystemExit("The three benchmark views are incomplete")
if {node.get("data-rpd-panel") for node in index.select("[data-rpd-panel]")} != {"fleet", "power"}:
    raise SystemExit("Print Orchestrator demo must expose Fleet and Power panels")
if not index.select_one(".hero-radar .radar-sweep") or len(index.select(".hero-radar .radar-ring")) != 3:
    raise SystemExit("Corrected hero radar geometry is incomplete")
for required_copy in (
    "Small-business founder", "llama.cpp", "Hermes automation stack", "PFC Top",
    "modified OrcaSlicer", "part detection", "SendCutSend",
):
    if required_copy not in index_text and required_copy not in registry_text:
        raise SystemExit(f"Required V6 content is missing: {required_copy}")

combined_public = "\n".join([
    index_text,
    registry_text,
    (root / "resume.html").read_text(encoding="utf-8"),
    (root / "portfolio-summary.html").read_text(encoding="utf-8"),
])
for bad in ("/home/", "0.0.0.0", "127.0.0.1", "192.168."):
    if bad in combined_public:
        raise SystemExit(f"Private/local detail leaked into public source: {bad}")
if re.search(r"\bEvidence\b", combined_public, flags=re.I):
    raise SystemExit("The old Evidence label remains in public copy")
for phrase in (
    "what this should communicate", "for the reviewer", "safe portfolio version",
    "this portfolio documents", "without unrelated workplace photos",
):
    if phrase.lower() in combined_public.lower():
        raise SystemExit(f"Reviewer-facing copy remains: {phrase}")

for project_id in expected_order:
    page = root / "projects" / project_id / "index.html"
    target = f"../../index.html#project={project_id}"
    if target not in page.read_text(encoding="utf-8"):
        raise SystemExit(f"Direct route does not return to integrated project: {project_id}")

for csv_name in (
    "b70-standardized-llama-bench-2026-08-14.csv",
    "mtp-broad-sweep-2026-08-14.csv",
    "production-model-profiles-2026-08-15.csv",
):
    path = root / "assets" / "downloads" / csv_name
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.reader(handle))
    if len(rows) < 2:
        raise SystemExit(f"Benchmark download is empty: {csv_name}")

print(f"Validated {len(html_files)} HTML pages, 12 integrated projects, and all local references.")
print("Validated benchmark separation, public-source sanitization, documentation galleries, and V6 assets.")
PY

printf 'V6 static verification passed.\n'
