#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
pass() { printf 'PASS: %s\n' "$*"; }

for file in index.html styles.css data.js app.js .nojekyll README.md; do
  [[ -e "$file" ]] || fail "missing $file"
done
pass "required root files exist"

if command -v node >/dev/null 2>&1; then
  node --check app.js
fi
pass "app.js syntax"

python3 - <<'PY'
from pathlib import Path
import json,re,sys
root=Path('.')
refs=set()
html=(root/'index.html').read_text(encoding='utf-8')
refs.update(re.findall(r'(?:src|href)=["\']([^"\']+)["\']', html))
text=(root/'data.js').read_text(encoding='utf-8')
m=re.fullmatch(r'window\.SITE_DATA = (.*);\s*', text, re.S)
assert m, 'data.js wrapper is invalid'
data=json.loads(m.group(1))

def walk(v):
    if isinstance(v,dict):
        for x in v.values(): walk(x)
    elif isinstance(v,list):
        for x in v: walk(x)
    elif isinstance(v,str) and v.startswith(('assets/','downloads/','data/')):
        refs.add(v)
walk(data)
missing=[]
for ref in refs:
    if ref.startswith(('http:','https:','mailto:','tel:','#','javascript:')):
        continue
    path=root/ref.split('?',1)[0].split('#',1)[0]
    if not path.exists(): missing.append(ref)
if missing:
    print('Missing local references:')
    for item in sorted(missing): print(' -',item)
    sys.exit(1)
print(f'Checked {len(refs)} references; no missing local files.')
PY
pass "local file references"

if grep -RInE --exclude='verify.sh' --exclude='README.md' '(/home/[^/]+/|192\.168\.|127\.0\.0\.1|API[_ -]?KEY|SECRET[_ -]?KEY|BEGIN (RSA|OPENSSH) PRIVATE KEY)' .; then
  fail "sensitive-looking paths, addresses, or secrets found"
fi
pass "public source does not expose local paths, private IPv4 addresses, or key markers"

python3 - <<'PY'
import json,re
from pathlib import Path
text=Path('data.js').read_text()
m=re.fullmatch(r'window\.SITE_DATA = (.*);\s*',text,re.S)
assert m, 'data.js wrapper is invalid'
data=json.loads(m.group(1))
assert len(data['projects'])==11, f"expected 11 projects, got {len(data['projects'])}"
ids=[p['id'] for p in data['projects']]
assert len(ids)==len(set(ids)), 'duplicate project ids'
assert {'print-orchestrator','pfc-supervisor','espresso-machine'} <= set(ids)
assert 'Hermes' in data['hermes']['title']
assert len(data['benchmarks']['production'])==2
print('Project and benchmark data structure is valid.')
PY
pass "project data"

echo "All V7 checks passed."
