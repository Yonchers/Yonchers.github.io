#!/usr/bin/env sh
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"

for required in \
  index.html \
  styles.css \
  v3.css \
  v4.css \
  v5.css \
  app.js \
  v3.js \
  v4.js \
  project.css \
  project-tabs-data.js \
  tools/build_v5_project_data.py \
  tools/update_index_v5.py \
  tools/build_project_redirects.py \
  assets/favicon.svg \
  assets/graphics/experience-role-map.svg; do
  if [ ! -f "$required" ]; then
    printf 'Missing required file: %s\n' "$required" >&2
    exit 1
  fi
done

node --check app.js
node --check v3.js
node --check v4.js
node --check project-tabs-data.js

python3 - <<'PY'
from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import unquote, urlparse

from bs4 import BeautifulSoup

root = Path.cwd().resolve()
index_path = root / "index.html"
project_pages = sorted(root.glob("projects/*/index.html"))
html_files = [index_path, *project_pages]
expected_projects = {
    "abb-rexroth",
    "ai-server",
    "e3ng",
    "espresso-machine",
    "makerspace-manufacturing",
    "metuned",
    "motorsports",
    "pfc-supervisor",
    "print-orchestrator",
    "uei-lab",
    "voron-systems",
}
expected_order = [
    "print-orchestrator", "pfc-supervisor", "ai-server", "e3ng", "voron-systems",
    "metuned", "motorsports", "espresso-machine", "uei-lab", "abb-rexroth",
    "makerspace-manufacturing",
]

found_project_pages = {path.parent.name for path in project_pages}
if found_project_pages != expected_projects:
    raise SystemExit(
        f"Project-page mismatch. Missing={sorted(expected_projects - found_project_pages)}; "
        f"extra={sorted(found_project_pages - expected_projects)}"
    )


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
            for item in srcset.split(","):
                candidate = item.strip().split()[0]
                if candidate:
                    self.refs.append(candidate)


def validate_ref(ref: str, base: Path, source_name: str, missing: list[str]) -> None:
    parsed = urlparse(ref)
    if parsed.scheme or ref.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return
    path_part = unquote(parsed.path)
    local = (base / path_part).resolve()
    try:
        local.relative_to(root)
    except ValueError:
        missing.append(f"{source_name} -> {ref} (outside package)")
        return
    if local.is_dir():
        local = local / "index.html"
    if not local.exists():
        missing.append(f"{source_name} -> {ref}")


missing_refs: list[str] = []
duplicate_ids: list[str] = []
reference_count = 0

for html_file in html_files:
    parser = PageParser()
    parser.feed(html_file.read_text(encoding="utf-8"))
    reference_count += len(parser.refs)
    duplicates = sorted(key for key, count in Counter(parser.ids).items() if count > 1)
    if duplicates:
        duplicate_ids.append(f"{html_file.relative_to(root)}: {', '.join(duplicates)}")
    for ref in parser.refs:
        validate_ref(ref, html_file.parent, str(html_file.relative_to(root)), missing_refs)

if duplicate_ids:
    raise SystemExit("Duplicate HTML ids:\n  " + "\n  ".join(duplicate_ids))

registry_text = (root / "project-tabs-data.js").read_text(encoding="utf-8").strip()
prefix = "window.PORTFOLIO_PROJECTS = "
if not registry_text.startswith(prefix) or not registry_text.endswith(";"):
    raise SystemExit("project-tabs-data.js does not contain the expected registry assignment")
registry = json.loads(registry_text[len(prefix):-1])
projects = registry.get("projects", {})
if set(projects) != expected_projects:
    raise SystemExit("Integrated project registry does not match the 11 project routes")
if registry.get("order") != expected_order:
    raise SystemExit("Integrated project order changed unexpectedly")

projects_with_gallery = set()
for project_id, project in projects.items():
    tabs = project.get("tabs", [])
    tab_ids = [tab.get("id") for tab in tabs]
    gallery_items = project.get("gallery", [])
    if len(tabs) < 4:
        raise SystemExit(f"{project_id} has too few integrated tabs: {len(tabs)}")
    if not project.get("title") or not project.get("lede") or not project.get("image"):
        raise SystemExit(f"{project_id} is missing hero content")
    validate_ref(project["image"], root, f"project registry:{project_id}", missing_refs)

    if gallery_items:
        projects_with_gallery.add(project_id)
        if "gallery" not in tab_ids:
            raise SystemExit(f"{project_id} has images but no gallery tab")
        gallery_tab = next(tab for tab in tabs if tab.get("id") == "gallery")
        gallery_soup = BeautifulSoup(gallery_tab.get("html", ""), "html.parser")
        figure_count = len(gallery_soup.select(".project-gallery figure"))
        if figure_count != len(gallery_items):
            raise SystemExit(
                f"{project_id} gallery count mismatch: registry={len(gallery_items)}, rendered={figure_count}"
            )
        for item in gallery_items:
            validate_ref(item["src"], root, f"project gallery:{project_id}", missing_refs)
    elif "gallery" in tab_ids:
        raise SystemExit(f"{project_id} exposes an empty gallery tab")

    for tab in tabs:
        parser = PageParser()
        parser.feed(tab.get("html", ""))
        for ref in parser.refs:
            validate_ref(ref, root, f"project registry:{project_id}/{tab.get('id')}", missing_refs)

expected_gallery_projects = expected_projects - {"makerspace-manufacturing"}
if projects_with_gallery != expected_gallery_projects:
    raise SystemExit(
        f"Unexpected gallery coverage. Missing={sorted(expected_gallery_projects - projects_with_gallery)}; "
        f"extra={sorted(projects_with_gallery - expected_gallery_projects)}"
    )

makerspace = projects["makerspace-manufacturing"]
if makerspace.get("gallery"):
    raise SystemExit("Makerspace/Vanquish must not claim workplace photos")
if makerspace.get("image") != "assets/graphics/experience-role-map.svg":
    raise SystemExit("Makerspace/Vanquish must use the labeled role map")
if "manufacturing-img-8774.jpg" in json.dumps(makerspace):
    raise SystemExit("UEI construction photo was incorrectly reused for Makerspace/Vanquish")
if "assets/images/manufacturing-img-8774.jpg" not in json.dumps(projects["uei-lab"]):
    raise SystemExit("The test-room construction photo is not assigned to the UEI gallery")

if missing_refs:
    raise SystemExit("Missing local references:\n  " + "\n  ".join(sorted(set(missing_refs))))

index_soup = BeautifulSoup(index_path.read_text(encoding="utf-8"), "html.parser")
if index_soup.body.get("data-portfolio-version") != "5":
    raise SystemExit("Portfolio version marker is not V5")
if not index_soup.select_one("#projectWorkspace"):
    raise SystemExit("Integrated project workspace is missing")
if index_soup.select_one("#projectDialog"):
    raise SystemExit("Old quick-view dialog is still present")

stylesheets = [link.get("href") for link in index_soup.select('link[rel~="stylesheet"]')]
if not stylesheets or stylesheets[-1] != "v5.css":
    raise SystemExit("v5.css must be the last stylesheet override")

cards = index_soup.select(".project-card[data-project]")
if len(cards) != 11:
    raise SystemExit(f"Expected 11 project cards, found {len(cards)}")
aliases = {
    "voron": "voron-systems",
    "espresso": "espresso-machine",
    "uei": "uei-lab",
    "robotics": "abb-rexroth",
    "manufacturing": "makerspace-manufacturing",
}
for card in cards:
    project_id = aliases.get(card.get("data-project"), card.get("data-project"))
    opener = card.select_one(".project-tab-button[data-open-project]")
    if not opener or opener.get("data-open-project") != project_id:
        raise SystemExit(f"Missing or mismatched in-site opener for card {project_id}")
    if card.select_one('.project-card-actions a[href^="projects/"]'):
        raise SystemExit(f"Card {project_id} still navigates away from the portfolio")
    badge = card.select_one(".project-photo-badge")
    if projects[project_id].get("gallery") and not badge:
        raise SystemExit(f"Photo badge missing from {project_id}")
    if not projects[project_id].get("gallery") and badge:
        raise SystemExit(f"No-photo project {project_id} must not display a photo badge")

if len(index_soup.select(".project-photo-badge")) != 10:
    raise SystemExit("Expected exactly ten project photo badges")

for page in project_pages:
    project_id = page.parent.name
    page_soup = BeautifulSoup(page.read_text(encoding="utf-8"), "html.parser")
    refresh = page_soup.select_one('meta[http-equiv="refresh"]')
    target = f"../../index.html#project={project_id}"
    if not refresh or target not in refresh.get("content", ""):
        raise SystemExit(f"Fallback route {project_id} does not redirect into the integrated workspace")

combined_copy = index_path.read_text(encoding="utf-8") + registry_text
old_phrases = [
    "Projects, photos, and measured results",
    "Select any image to view it at full size.",
    "Here is the work behind the claims.",
    "The problem, the work, and the engineering judgment behind it.",
    "The choices that shaped the result.",
    "What the project proves—and what it still does not.",
]
for phrase in old_phrases:
    if phrase in combined_copy:
        raise SystemExit(f"Redundant or superseded copy remains: {phrase}")

v4_js = (root / "v4.js").read_text(encoding="utf-8")
if "scrollTabsIntoView" not in v4_js:
    raise SystemExit("Project tabs no longer scroll their content into view")

print(f"Validated {len(html_files)} HTML pages and {reference_count} source references.")
print("Validated 11 integrated projects, 10 truthful photo galleries, and the no-photo role map.")
print("Validated gallery counts, local assets, in-site tabs, redirects, and concise V5 copy.")
PY

printf 'Portfolio V5 verification passed.\n'
