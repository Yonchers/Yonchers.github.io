from __future__ import annotations

import json
from pathlib import Path
from bs4 import BeautifulSoup, Doctype

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
REGISTRY = ROOT / 'project-tabs-data.js'

raw = REGISTRY.read_text(encoding='utf-8').strip()
payload = json.loads(raw[len('window.PORTFOLIO_PROJECTS = '):-1])
projects = payload['projects']

html = INDEX.read_text(encoding='utf-8')
soup = BeautifulSoup(html, 'html.parser')

# Versioned stylesheet.
for old in soup.find_all('link', href='v5.css'):
    old.decompose()
link = soup.new_tag('link', rel='stylesheet', href='v5.css')
last_css = soup.find('link', href='v4.css')
if last_css:
    last_css.insert_after(link)
else:
    soup.head.append(link)

# Main-page copy: shorter, less repetitive, more direct.
soup.select_one('#home .hero-lede').string = (
    'I build and test electromechanical systems—from custom printers and lab fixtures '
    'to local AI infrastructure. My work focuses on practical fabrication, clear controls, '
    'and systems that are easier to operate and troubleshoot.'
)

systems = soup.select_one('#systems .section-heading')
systems.select_one('.eyebrow').string = 'Live software systems'
systems.select_one('h2').string = 'Software built around the machines I actually run'
systems.find_all('p')[-1].string = (
    'Print Orchestrator manages the printer fleet. PFC coordinates the AI server’s power state. '
    'The demos use the same structure as the live control panels without exposing private services.'
)

orch = soup.select_one('#orchestrator .product-stage-copy')
orch.select_one('h2').string = 'One dashboard for a mixed printer fleet'
orch.find_all('p', recursive=False)[1].string = (
    'PrusaLink and Moonraker/Klipper machines report through one operator view, '
    'while each printer keeps its real capabilities and limits.'
)
orch_list = orch.select_one('.feature-list')
orch_list.clear()
for copy in [
    'Printer, camera, power, job, and detection states stay separate',
    'Machine-specific controls appear only where they are supported',
    'Recovery language explains the problem and the next safe action',
]:
    li = soup.new_tag('li')
    li.string = copy
    orch_list.append(li)
orch.select_one('.demo-note').string = 'Portfolio demo · private endpoints and real controls removed'
orch.select_one('[data-open-project]').string = 'Open project'

pfc = soup.select_one('#pfc .product-stage-copy')
pfc.select_one('h2').string = 'Let the AI server sleep without missing scheduled work'
pfc.find_all('p', recursive=False)[1].string = (
    'A low-power Pi keeps wake protection, schedules, status, and recovery logic available '
    'while the main server sleeps through long idle windows.'
)
pfc.select_one('.savings-caveat').string = (
    'Sleep time is observed from retained state history. Avoided energy and dollar values '
    'remain estimates until direct host metering is added.'
)
pfc_list = pfc.select_one('.feature-list')
pfc_list.clear()
for copy in [
    'Checks active workloads and safety rules before suspend',
    'Keeps Hermes schedules cached on the low-power Pi',
    'Tracks observed sleep beside estimated energy savings',
]:
    li = soup.new_tag('li')
    li.string = copy
    pfc_list.append(li)
pfc.select_one('[data-open-project]').string = 'Open project'

portfolio_heading = soup.select_one('#portfolio .section-heading')
portfolio_heading.select_one('h2').string = 'Selected engineering projects'
portfolio_heading.find_all('p')[-1].string = (
    'Open a project for build photos, control-panel captures, and concise notes. '
    'The Makerspace and Vanquish section uses a labeled role map because I do not have useful workplace photos.'
)

ai_intro = soup.select_one('#ai-lab .ai-intro')
ai_intro.select_one('h2').string = 'The B70 server runs the models and tools behind the lab'
ai_intro.find_all('p', recursive=False)[1].string = (
    'I use it for local inference, model benchmarks, software development, and the services '
    'behind Print Orchestrator and PFC.'
)
ai_cards = ai_intro.select('.ai-work-grid article')
ai_copy = [
    ('Infrastructure', 'Hardware, cooling, Linux services, endpoints, storage, and monitoring.'),
    ('Model testing', 'Measured speed plus role-specific tests for coding, supervision, and recovery.'),
    ('Applied tools', 'Printer control, power orchestration, scheduling, and engineering workflows.'),
]
for card, (title, copy) in zip(ai_cards, ai_copy):
    card.select_one('h3').string = title
    card.select_one('p').string = copy

# Card summaries and gallery badges.
card_summary = {
    'print-orchestrator': 'Mixed-fleet monitoring, recovery, cameras, jobs, and power',
    'pfc-supervisor': 'Safe sleep and wake control with schedule protection and savings tracking',
    'ai-server': 'Local inference, model benchmarks, runtime services, and engineering tools',
    'e3ng': 'CoreXY mechanics, Klipper, sensing, electronics, and commissioning',
    'voron-systems': 'Enclosed CoreXY printing, technical materials, tuning, and maintenance',
    'metuned': 'Digital dash enclosure, PCB packaging, cooling, and product direction',
    'motorsports': 'Race preparation, fabrication, events, sponsorship, and leadership',
    'espresso-machine': 'ME190 mechanism, controls integration, sponsored parts, and testing',
    'uei-lab': 'Airflow fixtures, instrumentation, controlled testing, and documentation',
    'abb-rexroth': 'ABB robot hardware, Rexroth controls, I/O, and safe lab work',
    'makerspace-manufacturing': 'Machine support, training, inventory, finishing, and production handoff',
}
card_alias = {
    'voron': 'voron-systems', 'espresso': 'espresso-machine', 'uei': 'uei-lab',
    'robotics': 'abb-rexroth', 'manufacturing': 'makerspace-manufacturing',
}
for card in soup.select('.project-card[data-project]'):
    key = card_alias.get(card.get('data-project'), card.get('data-project'))
    project = projects[key]
    copy = card.select_one('.project-card-copy')
    copy.select_one('p').string = project['eyebrow']
    copy.select_one('h3').string = project['title']
    copy.select_one('span').string = card_summary[key]
    image = card.select_one('.project-media img')
    image['src'] = project['image']
    image['alt'] = project['imageAlt']
    media = card.select_one('.project-media')
    if key == 'makerspace-manufacturing':
        media['class'] = list(dict.fromkeys(media.get('class', []) + ['graphic-media']))
    for badge in media.select('.project-photo-badge'):
        badge.decompose()
    gallery_count = len(project.get('gallery', []))
    if gallery_count:
        badge = soup.new_tag('span', attrs={'class': 'project-photo-badge'})
        noun = 'image' if gallery_count == 1 else 'images'
        badge.string = f'{gallery_count} {noun}'
        media.append(badge)
    button = card.select_one('.project-tab-button')
    button['aria-label'] = f"Open {project['title']} inside the portfolio"
    label = button.select_one('span')
    if label:
        label.string = 'Open project'

# Experience timeline: do not merge Makerspace and Vanquish into one vague role.
timeline = soup.select_one('#experience .timeline')
entries = [
    ('Current', 'University Enterprises / Sacramento State', 'Lab Assistant — Appliance Auditing', 'Controlled test environments, airflow instrumentation, data collection, documentation, and equipment support.'),
    ('Current', 'Metuned LLC', 'Co-founder / Chief Design Officer', 'Enclosure development, electronics packaging, product direction, prototypes, and motorsports application.'),
    ('Leadership', 'Sierra College Motorsports', 'Treasurer → Vice President → President', 'Race preparation, events, funding, sponsorship, recruitment, fabrication support, and trackside execution.'),
    ('Prior', 'Sierra College Makerspace', 'Makerspace Technical Assistant', '3D printing, CNC, laser systems, CAD/CAM, user training, troubleshooting, maintenance, and shop safety.'),
    ('Prior', 'Vanquish Products / ASB Products', 'Inventory Manager / Factory Support', 'Inventory, production staging, deburr, polishing, inspection, anodizing and laser-etch prep, packaging, and shipping.'),
]
timeline.clear()
for label, org, title, copy in entries:
    article = soup.new_tag('article')
    span = soup.new_tag('span'); span.string = label
    div = soup.new_tag('div')
    p = soup.new_tag('p'); p.string = org
    h3 = soup.new_tag('h3'); h3.string = title
    small = soup.new_tag('small'); small.string = copy
    div.extend([p, h3, small])
    article.extend([span, div])
    timeline.append(article)

# Project workspace can use per-project media fitting.
workspace_media = soup.select_one('.workspace-hero-media')
workspace_media['data-workspace-media'] = ''

# Version marker for README/testing without showing a loud badge to visitors.
soup.body['data-portfolio-version'] = '5'

# Preserve doctype and use a stable formatter.
output = str(soup)
if not output.lstrip().lower().startswith('<!doctype'):
    output = '<!DOCTYPE html>\n' + output
INDEX.write_text(output, encoding='utf-8')
print(f'Updated {INDEX}')
