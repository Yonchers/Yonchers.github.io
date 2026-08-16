#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / 'index.html'
soup = BeautifulSoup(PATH.read_text(encoding='utf-8'), 'html.parser')

# Version-specific styles.
head = soup.head
for href in ('project.css', 'v4.css'):
    if not soup.find('link', href=href):
        link = soup.new_tag('link', rel='stylesheet', href=href)
        # Keep the V4 overrides after the existing V3 styles.
        head.append(link)

# More natural, direct section headings.
copy_updates = {
    '#home .eyebrow': 'Joseph Dwyer · Mechanical Engineering',
    '#home h1': 'I build practical systems where hardware, software, and people have to work together.',
    '#home .hero-lede': (
        "I'm a Sacramento State mechanical engineering student working across mechanical design, controls, "
        "software, fabrication, and testing. I am most interested in projects where the hardware has to work, "
        "the interface has to make sense, and the result has to be maintainable."
    ),
    '#systems .eyebrow': 'Software built for my own lab',
    '#systems h2': 'The tools I use to run the printers and AI server',
    '#systems .section-heading > p': (
        'These demos are self-contained versions of tools I use for printer operations and server power management. '
        'They follow the structure of the live systems without exposing private services or real controls.'
    ),
    '#orchestrator .product-stage-copy .eyebrow': 'Printer fleet management · Print Orchestrator',
    '#orchestrator .product-stage-copy h2': 'One place to monitor and manage every printer',
    '#orchestrator .product-stage-copy > p:not(.eyebrow):not(.demo-note)': (
        'Print Orchestrator brings PrusaLink and Moonraker/Klipper machines into one operator view. It keeps each '
        'printer’s real capabilities visible while putting jobs, cameras, power, part detection, temperatures, '
        'files, and recovery tools in the same place.'
    ),
    '#pfc .product-stage-copy .eyebrow': 'Server power management · PFC Supervisor',
    '#pfc .product-stage-copy h2': 'A safer way to let the AI server sleep when it is idle',
    '#portfolio .section-heading .eyebrow': 'Projects',
    '#portfolio .section-heading h2': 'A closer look at the work',
    '#portfolio .section-heading > p': (
        'Open any card to view the full project inside the portfolio. Each project has tabs for the overview, '
        'engineering choices, evidence, results, and any project-specific material such as benchmarks or power savings.'
    ),
    '#ai-lab .section-heading .eyebrow': 'Local AI',
    '#ai-lab .section-heading h2': 'Building and testing local AI on the B70 server',
    '#experience .section-heading .eyebrow': 'Experience',
    '#experience .section-heading h2': 'Hands-on work in labs, shops, and motorsports',
    '#contact .eyebrow': 'Contact',
    '#contact h2': 'I’m looking for hands-on engineering work',
}
for selector, text in copy_updates.items():
    node = soup.select_one(selector)
    if node:
        node.clear()
        node.append(text)

# Update the supporting PFC paragraph separately so the savings message stays clear.
pfc_copy = soup.select_one('#pfc .product-stage-copy > p:not(.eyebrow):not(.demo-note)')
if pfc_copy:
    pfc_copy.clear()
    pfc_copy.append(
        'PFC coordinates sleep and wake behavior for the main AI server while a low-power Pi keeps schedules, '
        'wake protection, status, and recovery logic available. The current dashboard snapshot records 95.0 hours '
        'of sleep and estimates 13.19 kWh avoided over seven days, with the estimate and its measurement limits shown together.'
    )

# Replace standalone-page links with in-site project tabs.
for project_id, selector in (
    ('print-orchestrator', '#orchestrator .system-links a[href^="projects/"]'),
    ('pfc-supervisor', '#pfc .system-links a[href^="projects/"]'),
):
    link = soup.select_one(selector)
    if link:
        button = soup.new_tag('button', type='button')
        button['class'] = link.get('class', [])
        button['data-open-project'] = project_id
        button.string = 'Open project details'
        link.replace_with(button)

card_copy = {
    'print-orchestrator': ('Printer fleet management', 'Monitoring, cameras, power, detection, and recovery in one fleet view'),
    'pfc-supervisor': ('Server power management', 'Safe sleep/wake automation, schedule protection, runtime checks, and energy tracking'),
    'ai-server': ('Local AI infrastructure', 'Custom hardware, local inference, benchmarking, orchestration, and applied engineering tools'),
    'e3ng': ('Custom motion platform', 'CoreXY mechanics, Klipper, networked electronics, calibration, and commissioning'),
    'voron': ('Printer commissioning and production', 'Enclosed CoreXY systems, technical materials, maintenance, and repeatable workflows'),
    'metuned': ('Motorsports product development', 'Digital dash concept, enclosure design, PCB packaging, cooling, and product direction'),
    'motorsports': ('Team leadership and fabrication', 'Race preparation, repairs, sponsorship, community events, and trackside execution'),
    'espresso': ('ME190 senior design', 'Hybrid espresso system, controls integration, sponsored fabrication, and technical documentation'),
    'uei': ('Appliance and airflow testing', 'Controlled environments, CFM instrumentation, repeatable setup, and documentation'),
    'robotics': ('Industrial robotics coursework', 'ABB robot hardware, Rexroth controllers, safety systems, I/O, and supervised lab work'),
    'manufacturing': ('Manufacturing and equipment support', 'CAD/CAM, CNC, laser systems, operator training, finishing, and equipment uptime'),
}
for card in soup.select('.project-card[data-project]'):
    pid = card.get('data-project')
    label, summary = card_copy.get(pid, ('Engineering project', 'Open the project for the full story and evidence'))
    copy = card.select_one('.project-card-copy')
    if copy:
        p = copy.find('p')
        span = copy.find('span')
        if p:
            p.string = label
        if span:
            span.string = summary

    actions = card.select_one('.project-card-actions')
    if actions:
        actions.clear()
        button = soup.new_tag('button', type='button')
        button['class'] = ['project-tab-button']
        button['data-open-project'] = pid
        title = card.select_one('h3')
        accessible_title = title.get_text(' ', strip=True) if title else 'project'
        button['aria-label'] = f'Open {accessible_title} project inside the portfolio'
        label_span = soup.new_tag('span')
        label_span.string = 'Open project'
        arrow = soup.new_tag('i')
        arrow['aria-hidden'] = 'true'
        arrow.string = '→'
        button.append(label_span)
        button.append(arrow)
        actions.append(button)

# Simplify the footer language.
back_top = soup.select_one('.site-footer a[href="#home"]')
if back_top:
    back_top.string = 'Back to top ↑'

# Remove the old quick-view dialog.
old_dialog = soup.select_one('#projectDialog')
if old_dialog:
    old_dialog.decompose()

workspace_html = '''
<section class="project-workspace" id="projectWorkspace" aria-hidden="true" hidden>
  <div class="project-workspace-backdrop" data-project-close></div>
  <div class="project-workspace-window" role="dialog" aria-modal="true" aria-labelledby="workspaceTitle" tabindex="-1">
    <header class="project-workspace-header">
      <button class="workspace-back" type="button" data-project-close><span aria-hidden="true">←</span> Back to projects</button>
      <div class="workspace-breadcrumb"><span>Project view</span><strong data-workspace-title-short>Engineering project</strong></div>
      <div class="workspace-header-actions">
        <button type="button" data-project-prev aria-label="Open previous project">← <span>Previous</span></button>
        <button type="button" data-project-next aria-label="Open next project"><span>Next</span> →</button>
        <button class="workspace-close" type="button" data-project-close aria-label="Close project view">×</button>
      </div>
    </header>

    <div class="project-workspace-scroll" data-workspace-scroll>
      <section class="workspace-hero">
        <div class="workspace-hero-copy">
          <p class="workspace-eyebrow" data-workspace-eyebrow></p>
          <h2 id="workspaceTitle" data-workspace-title></h2>
          <p class="workspace-lede" data-workspace-lede></p>
          <div class="workspace-status" data-workspace-status></div>
        </div>
        <figure class="workspace-hero-media">
          <img src="" alt="" data-workspace-image>
          <figcaption data-workspace-caption></figcaption>
        </figure>
      </section>

      <section class="workspace-metrics" data-workspace-metrics aria-label="Project highlights"></section>

      <div class="workspace-tab-shell">
        <nav class="workspace-tabs" role="tablist" aria-label="Project sections" data-workspace-tabs></nav>
        <div class="workspace-panel" data-workspace-panel tabindex="0"></div>
      </div>
    </div>
  </div>
</section>

<dialog class="project-lightbox workspace-lightbox" id="projectLightbox">
  <img src="" alt="" data-lightbox-image>
  <footer><span data-lightbox-caption></span><button type="button" data-lightbox-close aria-label="Close image">×</button></footer>
</dialog>
'''
workspace = BeautifulSoup(workspace_html, 'html.parser')
toast = soup.select_one('#demoToast')
if toast:
    toast.insert_before(workspace)
else:
    soup.body.append(workspace)

# Scripts for the integrated project workspace.
for script_name in ('project-tabs-data.js', 'v4.js'):
    if not soup.find('script', src=script_name):
        script = soup.new_tag('script', src=script_name)
        soup.body.append(script)

PATH.write_text(str(soup), encoding='utf-8')
print('Updated index.html for V4 in-page project tabs.')
