#!/usr/bin/env sh
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"

for required in \
  index.html \
  styles.css \
  v3.css \
  v4.css \
  app.js \
  v3.js \
  v4.js \
  project.css \
  project.js \
  project-tabs-data.js \
  tools/build_project_tabs.py \
  assets/favicon.svg; do
  if [ ! -f "$required" ]; then
    printf 'Missing required file: %s\n' "$required" >&2
    exit 1
  fi
done

node --check app.js
node --check v3.js
node --check v4.js
node --check project.js
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
html_files = sorted([root / "index.html", *root.glob("projects/*/index.html")])
expected_project_pages = {
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
found_project_pages = {path.parent.name for path in html_files if path.parent.parent.name == "projects"}
if found_project_pages != expected_project_pages:
    missing = sorted(expected_project_pages - found_project_pages)
    extra = sorted(found_project_pages - expected_project_pages)
    raise SystemExit(f"Project-page mismatch. Missing={missing}; extra={extra}")

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

# Validate the generated in-site project registry.
registry_text = (root / "project-tabs-data.js").read_text(encoding="utf-8").strip()
prefix = "window.PORTFOLIO_PROJECTS = "
if not registry_text.startswith(prefix) or not registry_text.endswith(";"):
    raise SystemExit("project-tabs-data.js does not contain the expected registry assignment")
registry = json.loads(registry_text[len(prefix):-1])
if set(registry.get("projects", {})) != expected_project_pages:
    raise SystemExit("Integrated project registry does not match the 11 project pages")
if registry.get("order") != [
    "print-orchestrator", "pfc-supervisor", "ai-server", "e3ng", "voron-systems",
    "metuned", "motorsports", "espresso-machine", "uei-lab", "abb-rexroth",
    "makerspace-manufacturing",
]:
    raise SystemExit("Integrated project order changed unexpectedly")

for project_id, project in registry["projects"].items():
    tabs = project.get("tabs", [])
    if len(tabs) < 4:
        raise SystemExit(f"{project_id} has too few integrated tabs: {len(tabs)}")
    if not project.get("title") or not project.get("lede") or not project.get("image"):
        raise SystemExit(f"{project_id} is missing hero content")
    validate_ref(project["image"], root, f"project registry:{project_id}", missing_refs)
    for tab in tabs:
        parser = PageParser()
        parser.feed(tab.get("html", ""))
        for ref in parser.refs:
            validate_ref(ref, root, f"project registry:{project_id}/{tab.get('id')}", missing_refs)

if missing_refs:
    raise SystemExit("Missing local references:\n  " + "\n  ".join(sorted(set(missing_refs))))

# Verify that every visible card opens the in-site workspace rather than a standalone page.
index_soup = BeautifulSoup((root / "index.html").read_text(encoding="utf-8"), "html.parser")
if not index_soup.select_one("#projectWorkspace"):
    raise SystemExit("Integrated project workspace is missing")
if index_soup.select_one("#projectDialog"):
    raise SystemExit("Old quick-view dialog is still present")

cards = index_soup.select(".project-card[data-project]")
if len(cards) != 11:
    raise SystemExit(f"Expected 11 project cards, found {len(cards)}")
for card in cards:
    opener = card.select_one(".project-tab-button[data-open-project]")
    if not opener:
        raise SystemExit(f"Missing in-site project opener for card {card.get('data-project')}")
    if card.select_one('.project-card-actions a[href^="projects/"]'):
        raise SystemExit(f"Card {card.get('data-project')} still navigates to a standalone project page")

old_phrases = [
    "Here is the work behind the claims.",
    "The problem, the work, and the engineering judgment behind it.",
    "The choices that shaped the result.",
    "What the project proves—and what it still does not.",
    "The next useful improvement is already clear.",
]
combined_copy = (root / "index.html").read_text(encoding="utf-8") + registry_text
for phrase in old_phrases:
    if phrase in combined_copy:
        raise SystemExit(f"Old title-block language remains: {phrase}")

print(f"Validated {len(html_files)} HTML pages and {reference_count} source references.")
print("Validated 11 integrated project workspaces and their local assets.")
print("All project cards open inside the portfolio; old title-block copy is gone.")
PY

printf 'Portfolio V4 verification passed.\n'
