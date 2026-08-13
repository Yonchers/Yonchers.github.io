#!/usr/bin/env sh
set -eu
PORT="${1:-8080}"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
printf 'Serving Joseph Dwyer Portfolio V4 at http://localhost:%s\n' "$PORT"
exec python3 -m http.server "$PORT" --directory "$SCRIPT_DIR"
