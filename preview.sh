#!/usr/bin/env sh
set -eu
PORT="${1:-8000}"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"
printf 'Serving Joseph Dwyer Portfolio V6 at http://localhost:%s\n' "$PORT"
exec python3 -m http.server "$PORT"
