from __future__ import annotations
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'project-tabs-data.js').read_text().strip()
data=json.loads(s[len('window.PORTFOLIO_PROJECTS = '):-1])
for pid in data['order']:
    project=data['projects'][pid]
    target=f'../../index.html#project={pid}'
    page=f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{project['title']} | Joseph Dwyer Engineering Portfolio</title>
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="{target}">
<style>
html{{color-scheme:dark;background:#090b0e;color:#f3f1ea;font-family:system-ui,sans-serif}}
body{{min-height:100vh;display:grid;place-items:center;margin:0;padding:24px}}
a{{color:#ff9b49}}
</style>
<script>location.replace({target!r});</script>
</head>
<body><p>Opening <a href="{target}">{project['title']}</a> inside the portfolio.</p></body>
</html>'''
    dest=ROOT/'projects'/pid/'index.html'
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(page,encoding='utf-8')
print('Updated project fallback routes.')
