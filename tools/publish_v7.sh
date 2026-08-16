#!/usr/bin/env bash
set -euo pipefail

# Publish Joseph Dwyer Portfolio V7 to GitHub Pages.
#
# Defaults:
#   Repository: ~/Projects/llama.cpp/Yonchers.github.io
#   Live branch: Main
#   Site URL:    https://yonchers.github.io/
#
# Run from the extracted V7 folder:
#   chmod +x tools/publish_v7.sh
#   ./tools/publish_v7.sh

REPO_DIR="${REPO_DIR:-$HOME/Projects/llama.cpp/Yonchers.github.io}"
LIVE_BRANCH="${LIVE_BRANCH:-Main}"
REMOTE="${REMOTE:-origin}"
SITE_URL="${SITE_URL:-https://yonchers.github.io/}"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_BRANCH="backup-pre-v7-${TIMESTAMP}"

fail() {
  printf '\nERROR: %s\n' "$*" >&2
  exit 1
}

step() {
  printf '\n==> %s\n' "$*"
}

for cmd in git rsync; do
  command -v "$cmd" >/dev/null 2>&1 || fail "$cmd is required. On Fedora: sudo dnf install git rsync"
done

[[ -f "$SOURCE_DIR/index.html" ]] || fail "V7 index.html was not found at $SOURCE_DIR"
[[ -d "$REPO_DIR/.git" ]] || fail "Git repository was not found at $REPO_DIR"

cd "$REPO_DIR"

if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  fail "The repository has uncommitted changes. Commit, stash, or discard them first."
fi

step "Fetching GitHub"
git fetch "$REMOTE" --prune

if git show-ref --verify --quiet "refs/heads/$LIVE_BRANCH"; then
  git switch "$LIVE_BRANCH"
else
  git switch -c "$LIVE_BRANCH" --track "$REMOTE/$LIVE_BRANCH"
fi

git pull --ff-only "$REMOTE" "$LIVE_BRANCH"

step "Creating restore branch $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH" "$LIVE_BRANCH"
git push -u "$REMOTE" "$BACKUP_BRANCH"

step "Copying V7 into the repository root"
rsync -a --delete \
  --exclude '.git/' \
  --exclude '.git' \
  "$SOURCE_DIR/" "$REPO_DIR/"

touch .nojekyll
[[ -f index.html ]] || fail "index.html is missing after synchronization"
[[ -f VERSION ]] || fail "VERSION is missing after synchronization"

echo
git status --short

if [[ -n "$(git status --porcelain)" ]]; then
  step "Committing V7"
  git add -A
  git commit -m "Deploy engineering portfolio V7"

  step "Pushing $LIVE_BRANCH"
  git push "$REMOTE" "$LIVE_BRANCH"
else
  echo "No file changes were detected; V7 may already be deployed."
fi

COMMIT="$(git rev-parse --short HEAD)"
FRESH_URL="${SITE_URL}?v=${COMMIT}"

printf '\nPublished branch: %s\nCommit: %s\nBackup: %s\nFresh URL: %s\n' \
  "$LIVE_BRANCH" "$COMMIT" "$BACKUP_BRANCH" "$FRESH_URL"

if command -v xdg-open >/dev/null 2>&1; then
  nohup xdg-open "$FRESH_URL" >/dev/null 2>&1 &
fi

echo
echo "GitHub Pages may take several minutes to refresh."
echo "The footer should read: V7.0 · Updated August 2026"
echo "Use Ctrl+Shift+R if the browser still shows an older cached build."
