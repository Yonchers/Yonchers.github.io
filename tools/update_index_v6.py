from bs4 import BeautifulSoup
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / 'index.html'
soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')

# Metadata and assets
soup.body['data-portfolio-version'] = '6'
soup.title.string = 'Joseph Dwyer | Mechanical Engineering, Automation & Local AI'
meta_desc = soup.find('meta', attrs={'name':'description'})
if meta_desc:
    meta_desc['content'] = "Joseph Dwyer's engineering portfolio spanning mechanical systems, automation, local AI, manufacturing, controls, robotics, and test engineering."
for link in soup.find_all('link', rel='stylesheet'):
    if link.get('href') == 'v5.css':
        link.decompose()
head = soup.head
new_css = soup.new_tag('link', rel='stylesheet', href='v6.css')
head.append(new_css)

# Header nav text
nav = soup.select_one('#siteNav')
if nav:
    nav.clear()
    for href, label in [('#systems','Systems'),('#portfolio','Projects'),('#ai-lab','AI + Benchmarks'),('#experience','Experience'),('#contact','Contact')]:
        a=soup.new_tag('a', href=href); a.string=label; nav.append(a)

# Hero copy
hero = soup.select_one('#home')
hero.select_one('.eyebrow').string = 'Joseph Dwyer · Mechanical Engineering · Automation'
hero.select_one('h1').string = 'I build machines, automation, and local AI systems that work together.'
hero.select_one('.hero-lede').string = 'My work connects mechanical design, fabrication, controls, test engineering, and local AI—from custom printers and lab fixtures to the software that monitors, powers, and automates them.'
actions = hero.select_one('.hero-actions')
actions.clear()
for href,label,cls in [('#systems','Explore the connected systems','button button-primary magnetic'),('#portfolio','Browse the project work','button button-ghost magnetic')]:
    a=soup.new_tag('a',href=href); a['class']=cls.split(); a.string=label; actions.append(a)
meta = hero.select_one('.hero-meta')
meta.clear()
for value,label in [('B70 / PFP','local AI infrastructure'),('Founder','Metuned small business'),('3+','printer and motion platforms'),('Fall 2026','B.S. Mechanical Engineering')]:
    d=soup.new_tag('div'); s=soup.new_tag('strong'); s.string=value; sp=soup.new_tag('span'); sp.string=label; d.extend([s,sp]); meta.append(d)

# Replace hero geometry with one centered coordinate system
old_system = hero.select_one('.hero-system')
new_system_html = '''
<div aria-label="Animated engineering systems radar" class="hero-system hero-radar reveal">
  <div class="radar-ring ring-outer"></div>
  <div class="radar-ring ring-mid"></div>
  <div class="radar-ring ring-inner"></div>
  <div class="radar-grid"></div>
  <div class="radar-sweep"></div>
  <div class="radar-ping ping-one"></div>
  <div class="radar-ping ping-two"></div>
  <div class="hero-core tilt-card" data-tilt-strength="5">
    <span class="hero-core-kicker">ENGINEERING PORTFOLIO</span>
    <strong>JD</strong>
    <span class="hero-core-status"><i></i> design / integrate / verify</span>
  </div>
  <span class="radar-node node-ai">LOCAL AI</span>
  <span class="radar-node node-motion">MOTION</span>
  <span class="radar-node node-controls">CONTROLS</span>
  <span class="radar-node node-fabrication">FABRICATION</span>
  <span class="radar-node node-test">TEST</span>
</div>'''
old_system.replace_with(BeautifulSoup(new_system_html,'html.parser').div)

# Systems intro
systems_intro = soup.select_one('#systems')
systems_intro.select_one('.eyebrow').string = 'Connected engineering systems'
systems_intro.select_one('h2').string = 'The software, AI, and hardware are designed as one stack.'
systems_intro.select_one('.section-heading > p:last-child').string = 'llama.cpp runs the local models, Hermes coordinates work, PFC manages the server, and Print Orchestrator turns automation into safe actions on the printer fleet.'
rail = systems_intro.select_one('.systems-rail')
rail.clear()
for i,label in [('01','PRINT ORCHESTRATOR'),('02','PFC SUPERVISOR'),('03','HERMES + LLAMA.CPP')]:
    sp=soup.new_tag('span'); sp.string=i; rail.append(sp)
    it=soup.new_tag('i'); rail.append(it)
    sp2=soup.new_tag('span'); sp2.string=label; rail.append(sp2)
    if label != 'HERMES + LLAMA.CPP': rail.append(soup.new_tag('i'))

# Architecture map after systems intro
arch_html = '''
<section class="architecture-section portfolio-surface" data-observe-tone="orange" id="architecture">
  <div class="section-heading reveal">
    <p class="eyebrow">System architecture</p>
    <h2>One local stack connects inference, automation, power, and physical machines.</h2>
    <p>Each layer has a defined responsibility. AI models do not reach hardware directly; they act through narrow, inspectable control interfaces.</p>
  </div>
  <div class="stack-map reveal" aria-label="B70, llama.cpp, Hermes, PFC, Print Orchestrator, and desktop integration map">
    <article class="stack-node server"><span>01</span><strong>B70 / PFP</strong><small>compute · storage · local display</small></article>
    <div class="stack-link vertical"></div>
    <article class="stack-node inference"><span>02</span><strong>llama.cpp</strong><small>SYCL inference · manager + worker endpoints</small></article>
    <div class="stack-link vertical"></div>
    <article class="stack-node hermes"><span>03</span><strong>Hermes</strong><small>routing · schedules · tools · voice · automation</small></article>
    <div class="stack-branches">
      <article class="stack-node blue"><strong>Print Orchestrator</strong><small>CAD · slicing · printers · power · vision</small></article>
      <article class="stack-node green"><strong>PFC Supervisor</strong><small>sleep · wake · runtime · energy · safety</small></article>
      <article class="stack-node desktop"><strong>Desktop tools</strong><small>PFC Pulse · PFC Command · future recovery agent</small></article>
    </div>
  </div>
</section>'''
systems_intro.insert_after(BeautifulSoup(arch_html,'html.parser').section)

# Print Orchestrator stage copy and link
orch = soup.select_one('#orchestrator')
orch.select_one('.product-stage-copy .eyebrow').string = 'Print Orchestrator · AI automation frontend'
orch.select_one('.product-stage-copy h2').string = 'Hermes uses it to turn digital work into controlled printer actions.'
orch.select_one('.product-stage-copy > p').string = 'The dashboard unifies PrusaLink and Moonraker/Klipper machines while the API supports AI-assisted CAD, CLI slicing, power control, preflight checks, dispatch, and failure monitoring.'
fl = orch.select_one('.feature-list'); fl.clear()
for text in [
    'OpenSCAD generation and a modified OrcaSlicer CLI form the prototype prompt-to-print path',
    'Part detection can block a new job when an object remains on the bed',
    'A modified Obico container can send AI failure warnings through Discord',
    'Kasa smart plugs expose power telemetry and safe power actions to Hermes automations',
]:
    li=soup.new_tag('li'); li.string=text; fl.append(li)
orch.select_one('.demo-note').string = 'Interactive portfolio simulation · live endpoints and machine actions are disconnected'
links=orch.select_one('.system-links')
links.select_one('a')['href']='assets/screenshots/print-orchestrator-dashboard-v6.png'
links.select_one('a').string='Open dashboard capture'
# mark tabs and add power panel
for b in orch.select('.rpd-tabs button'):
    txt=b.get_text(' ',strip=True).lower()
    if txt=='fleet': b['data-rpd-view']='fleet'
    elif txt=='power': b['data-rpd-view']='power'
    else: b['data-rpd-view']='disabled'
rpd_scroll=orch.select_one('.rpd-scroll')
rpd_scroll['data-rpd-panel']='fleet'
power_panel_html='''
<div class="rpd-power-preview" data-rpd-panel="power" hidden>
  <div class="rpd-power-preview-head"><p>Print Orchestrator / Power observation</p><h3>Fleet and server power history</h3><span>Kasa smart-plug telemetry keeps device state, demand, and energy visible beside printer controls.</span></div>
  <img src="assets/screenshots/print-orchestrator-power.png" alt="Print Orchestrator power observation interface" loading="lazy">
  <div class="rpd-power-summary"><article><strong>100.7 W</strong><span>current observed total</span></article><article><strong>141.8 W</strong><span>24-hour average</span></article><article><strong>3.121 kWh</strong><span>energy observed</span></article><article><strong>2 / 3</strong><span>smart plugs online</span></article></div>
</div>'''
rpd_scroll.insert_after(BeautifulSoup(power_panel_html,'html.parser').div)

# PFC stage copy
pfc = soup.select_one('#pfc')
pfc.select_one('.product-stage-copy .eyebrow').string = 'PFC Supervisor · power and runtime orchestration'
pfc.select_one('.product-stage-copy h2').string = 'Keep the AI server available when needed—and asleep when it is not.'
pfc.select_one('.product-stage-copy > p').string = 'PFC coordinates workloads, protected schedules, llama.cpp runtimes, wake recovery, and suspend safety while recording observed sleep and modeled energy savings.'
pfc_features=pfc.select_one('.feature-list'); pfc_features.clear()
for text in [
    '95.0 hours of observed sleep in the current retained snapshot',
    '13.19 kWh estimated avoided energy over the captured seven-day period',
    'Hermes schedule protection remains cached on the low-power Pi',
    'PFC Top provides a physical server-side monitoring interface',
]:
    li=soup.new_tag('li'); li.string=text; pfc_features.append(li)

# PFC already includes an explicit measured-vs-modeled caveat.
plink = pfc.select_one('.system-links a')
if plink:
    plink['href'] = 'assets/screenshots/pfc-power-management-v6.png'
    plink.string = 'Open control-panel capture'

# Hermes section after PFC
hermes_html = '''
<section class="hermes-stage" data-observe-tone="orange" id="hermes">
  <div class="hermes-copy reveal">
    <p class="eyebrow">Hermes automation stack</p>
    <h2>The agent layer connecting local models to the rest of the lab.</h2>
    <p>Hermes routes work between Muse and Qwen3.6 through llama.cpp, then acts through PFC, Print Orchestrator, desktop widgets, Discord, and scheduled workflows.</p>
    <div class="hermes-points">
      <article><span>01</span><strong>Voice and desktop controls</strong><p>PFC Pulse uses Whisper and Piper; PFC Command exposes a compact operational view.</p></article>
      <article><span>02</span><strong>Engineering automation</strong><p>Printer workflows, power controls, schedules, notifications, and structured tool calls.</p></article>
      <article><span>03</span><strong>Current R&amp;D</strong><p>Cross-machine recovery and meeting transcription, translation, summaries, action items, and calendar preparation.</p></article>
    </div>
    <button class="button button-primary magnetic" data-open-project="hermes" type="button">Open Hermes project</button>
  </div>
  <div class="hermes-console reveal">
    <div class="hermes-console-head"><span>LOCAL AUTOMATION SURFACES</span><i></i><small>Hermes · llama.cpp · PFC</small></div>
    <div class="widget-gallery">
      <figure><img src="assets/screenshots/pfc-pulse.png" alt="PFC Pulse desktop voice companion" loading="lazy"><figcaption><strong>PFC Pulse</strong><span>Push-to-talk Hermes voice control using Whisper input and Piper output.</span></figcaption></figure>
      <figure><img src="assets/screenshots/pfc-command.png" alt="PFC Command compact server control widget" loading="lazy"><figcaption><strong>PFC Command</strong><span>Compact server state, workload, and limited power controls.</span></figcaption></figure>
    </div>
    <div class="hermes-routing-strip"><span>MUSE MANAGER</span><i></i><span>HERMES ROUTER</span><i></i><span>QWEN WORKER</span></div>
  </div>
</section>'''
pfc.insert_after(BeautifulSoup(hermes_html,'html.parser').section)

# Regenerate project cards
portfolio = soup.select_one('#portfolio')
portfolio.select_one('.eyebrow').string='Selected work'
portfolio.select_one('h2').string='Projects spanning machines, automation, local AI, testing, and manufacturing.'
portfolio.select_one('.section-heading > p:last-child').string='Open any card for the engineering decisions, documentation gallery, results, current status, and upstream references.'
project_grid=portfolio.select_one('.project-grid')
project_grid.clear()
cards=[
 ('print-orchestrator','systems','AI automation frontend','Print Orchestrator','Hermes-to-printer workflows, fleet state, power, part detection, and failure monitoring','assets/screenshots/print-orchestrator-dashboard-v6.png','featured software-card','contain'),
 ('pfc-supervisor','systems','Power and runtime control','PFC Supervisor','Safe server sleep, schedule protection, runtime recovery, energy reporting, and access control','assets/screenshots/pfc-power-management-v6.png','featured software-card','contain'),
 ('hermes','systems','Local agent orchestration','Hermes automation stack','llama.cpp routing, PFC and printer integrations, voice controls, schedules, and active R&D','assets/screenshots/pfc-pulse.png','featured software-card','contain'),
 ('ai-server','systems','Local AI infrastructure','B70 / PFP AI server','llama.cpp inference, production model profiles, benchmark research, and operational tooling','assets/images/pfp-server-pi-case.jpg','featured','cover'),
 ('e3ng','systems fabrication','CoreXY conversion','E3NG CoreXY conversion','Complete machine rebuild, Klipper, sensing, networking, calibration, and commissioning','assets/images/e3ng-full-printer.jpg','','cover'),
 ('voron-systems','systems fabrication','Enclosed CoreXY system','Voron 2.4','Assembly, alignment, technical materials, tuning, maintenance, and functional parts','assets/images/voron-2-4-full-printer.jpg','','cover'),
 ('metuned','fabrication leadership','Small-business product development','Metuned digital dash','Race electronics, enclosure design, PCB packaging, cooling, service access, and product direction','assets/images/metuned-copy-of-proto-2.jpg','wide','cover'),
 ('motorsports','fabrication leadership','Leadership and fabrication','Sierra College Motorsports','Race preparation, repairs, events, sponsorship, community funding, and trackside execution','assets/images/motorsports-thebigpicture-1.jpg','wide','cover'),
 ('espresso-machine','fabrication testing','ME190 senior design','Hybrid hand-actuated espresso machine','Full assembly CAD, mechanism, controls integration, testing targets, and SendCutSend support','assets/images/me190-full-assembly.png','featured','contain'),
 ('uei-lab','testing fabrication','Professional test engineering','UEI energy-efficiency testing','Controlled fixtures, airflow and CFM measurement, instrumentation, repairs, and documentation','assets/images/uei-img-8868.jpg','','cover'),
 ('abb-rexroth','systems testing','Industrial robotics coursework','ABB and Rexroth robotics lab','Robot hardware, controller state, I/O, emergency-stop behavior, and safe lab execution','assets/images/me165-image-111.jpg','','contain'),
 ('makerspace-manufacturing','fabrication testing','Work experience','Manufacturing and makerspace experience','Equipment support, CAD/CAM, user training, production finishing, inventory, and handoff','assets/images/makerspace-laser-training.jpg','wide','cover'),
]
for idx,(pid,cat,kicker,title,desc,img,extra,fit) in enumerate(cards,1):
    article=soup.new_tag('article'); article['class']=['project-card','reveal'] + extra.split(); article['data-category']=cat; article['data-project']=pid; article['id']='project-'+pid
    media=soup.new_tag('div'); media['class']=['project-media']; media['data-fit']=fit
    image=soup.new_tag('img',src=img,alt=title,loading='lazy'); media.append(image)
    badge=soup.new_tag('span'); badge['class']=['project-index']; badge.string=f'{idx:02d}'; media.append(badge)
    copy=soup.new_tag('div'); copy['class']=['project-card-copy']
    p=soup.new_tag('p'); p.string=kicker; h=soup.new_tag('h3'); h.string=title; sp=soup.new_tag('span'); sp.string=desc; copy.extend([p,h,sp])
    acts=soup.new_tag('div'); acts['class']=['project-card-actions']; btn=soup.new_tag('button',type='button'); btn['class']=['project-tab-button']; btn['data-open-project']=pid; btn['aria-label']=f'Open {title} inside the portfolio'; ss=soup.new_tag('span'); ss.string='Open project'; ii=soup.new_tag('i'); ii['aria-hidden']='true'; ii.string='→'; btn.extend([ss,ii]); acts.append(btn)
    article.extend([media,copy,acts]); project_grid.append(article)

# Replace AI lab with three distinct benchmark views
ai = soup.select_one('#ai-lab')
new_ai_html = '''
<section class="ai-lab section-tone-orange" data-observe-tone="orange" id="ai-lab">
  <div class="ai-intro reveal">
    <p class="eyebrow">Local inference and benchmarking</p>
    <h2>llama.cpp is the inference engine behind the B70/PFP stack.</h2>
    <p>I keep standardized throughput, broad speculative-decoding research, and the configurations I actually deploy as separate views.</p>
    <button class="button button-primary magnetic" data-open-project="ai-server" type="button">Open full AI server project</button>
  </div>
  <div class="benchmark-suite reveal" data-benchmark-suite>
    <div class="benchmark-suite-tabs" role="tablist" aria-label="Benchmark views">
      <button class="active" data-benchmark-tab="production" type="button">Production profiles</button>
      <button data-benchmark-tab="standard" type="button">Standardized sweep</button>
      <button data-benchmark-tab="mtp" type="button">Broad MTP research</button>
    </div>
    <div class="benchmark-suite-panel active" data-benchmark-panel="production">
      <div class="production-profile-grid main-profiles">
        <article class="production-profile manager"><span>MANAGER</span><h3>Muse-Glimmer 30B Q5_K_XL</h3><p>131K context · Q8 KV · medium reasoning · DFlash n2 / p0.30</p><div><strong>29.2 tok/s</strong><small>~71.2% acceptance · ~36% over native</small></div></article>
        <article class="production-profile worker"><span>WORKER</span><h3>Qwen3.6 35B-A3B Q5_K_XL</h3><p>131K context · q4_1 KV · custom tool template · native decode</p><div><strong>68–71 tok/s</strong><small>MTP tested; native selected</small></div></article>
      </div>
    </div>
    <div class="benchmark-suite-panel" data-benchmark-panel="standard" hidden>
      <div class="benchmark-compact-grid">
        <article><span>Qwen3.5 0.8B</span><strong>202.79 tok/s</strong><small>tg128 · Q8_K_XL</small></article>
        <article><span>Gemma 4 E2B</span><strong>136.58 tok/s</strong><small>tg128 · Q4_K_XL</small></article>
        <article><span>Gemma 4 E4B</span><strong>88.48 tok/s</strong><small>tg128 · Q4_K_XL</small></article>
        <article><span>Qwen3.6 Q4_K_M</span><strong>77.52 tok/s</strong><small>tg128</small></article>
        <article><span>Qwen3.6 Q5_K_XL</span><strong>75.63 tok/s</strong><small>selected worker quant</small></article>
        <article><span>Gemma 4 26B-A4B</span><strong>66.89 tok/s</strong><small>tg128 · Q4_K_M</small></article>
      </div>
      <p class="benchmark-method">Current normal reference: SYCL · pp512 + tg128 · 3 repetitions · <code>-ngl 99</code> · llama.cpp build 10369.</p>
    </div>
    <div class="benchmark-suite-panel" data-benchmark-panel="mtp" hidden>
      <div class="benchmark-compact-grid mtp-grid">
        <article><span>Gemma 4 12B</span><strong>1.495×</strong><small>n2 · 76.35% acceptance</small></article>
        <article><span>Gemma 4 26B-A4B</span><strong>1.239×</strong><small>n4 · 63.61% acceptance</small></article>
        <article><span>Gemma 4 31B</span><strong>1.496×</strong><small>n2 · 81.44% acceptance</small></article>
        <article><span>Qwen 3.8 27B</span><strong>1.671×</strong><small>n2 · 70.70% acceptance</small></article>
        <article><span>Qwen3.6 35B-A3B</span><strong>Baseline wins</strong><small>MTP overhead exceeded savings</small></article>
      </div>
      <p class="benchmark-method">n2 was usually useful, n4 won for Gemma 26B-A4B, and n8 was consistently harmful.</p>
    </div>
  </div>
</section>'''
ai.replace_with(BeautifulSoup(new_ai_html,'html.parser').section)

# Experience and contact cleanup
exp=soup.select_one('#experience')
exp.select_one('.eyebrow').string='Experience'
exp.select_one('h2').string='Engineering habits built in labs, shops, product work, and motorsports.'
# Change capability bars to text-first and avoid false precision in level labels later via CSS only
contact=soup.select_one('#contact')
contact.select_one('h2').string='Open to hands-on engineering roles and collaborative technical work.'
contact.select_one('.contact-copy > p:nth-of-type(2)').string='I am most interested in automation, manufacturing, controls, test engineering, product development, and equipment-support work where practical troubleshooting matters.'
doc_actions=contact.select_one('.document-actions')
doc_actions.clear()
for href,label in [('resume.html','Resume'),('portfolio-summary.html','Printable project summary')]:
    a=soup.new_tag('a',href=href,target='_blank'); a.string=label+' '; span=soup.new_tag('span'); span.string='↗'; a.append(span); doc_actions.append(a)

# Footer last updated
footer=soup.select_one('.site-footer')
first=footer.find('span')
first.string='JOSEPH DWYER / MECHANICAL ENGINEERING + AUTOMATION PORTFOLIO'
last=soup.new_tag('span'); last['class']=['footer-updated']; last.string='Updated August 2026'; footer.insert(1,last)

# Add v6 script after v4.js
for script in soup.find_all('script',src=True):
    if script['src']=='v5.js': script.decompose()
new_script=soup.new_tag('script',src='v6.js',defer=True)
soup.body.append(new_script)


# V6.1 final layout pass: Hermes is a compact integration section rather than a project.
hermes_card = soup.select_one('#project-hermes')
if hermes_card:
    hermes_card.decompose()
for idx, badge in enumerate(soup.select('#portfolio .project-card .project-index'), 1):
    badge.string = f'{idx:02d}'

compact_hermes = """<section class="hermes-stage hermes-compact" data-observe-tone="orange" id="hermes">
<div class="hermes-copy reveal"><p class="eyebrow">Hermes / local agent layer</p><h2>The agent layer between my local models and the systems I use.</h2><p>I run Nous Research's Hermes Agent locally around llama.cpp. It routes work to my manager and worker models, then gives those models controlled tools for PFC, Print Orchestrator, desktop utilities, schedules, Discord, and engineering troubleshooting.</p><div class="hermes-points"><article><span>01</span><strong>Daily orchestration</strong><p>Printer state, power actions, server status, scheduled jobs, notifications, and structured tool calls.</p></article><article><span>02</span><strong>Desktop interaction</strong><p>PFC Pulse adds push-to-talk voice control with Whisper and Piper, while PFC Command keeps core server state visible.</p></article><article><span>03</span><strong>Current development</strong><p>Cross-machine recovery plus meeting transcription, translation, summaries, action items, and calendar preparation.</p></article></div><div class="hermes-links"><a class="button button-primary magnetic" href="https://hermes-agent.nousresearch.com/docs/" rel="noreferrer" target="_blank">Hermes Agent docs ↗</a><a class="button button-ghost magnetic" href="#ai-lab">Local AI profiles</a></div></div>
<div class="hermes-visuals reveal"><figure class="hermes-app-shot"><a href="assets/screenshots/hermes-app-view.png" rel="noreferrer" target="_blank"><img alt="Hermes-connected PFC ambient operator application view" loading="lazy" src="assets/screenshots/hermes-app-view.png"></a><figcaption><strong>Ambient operator</strong><span>The working desktop interface for voice interaction, conversation history, local speech services, and the remote Hermes tunnel.</span><a href="assets/screenshots/hermes-app-view.png" rel="noreferrer" target="_blank">Open full capture ↗</a></figcaption></figure><div class="hermes-widget-row"><figure><img alt="PFC Pulse desktop voice companion" loading="lazy" src="assets/screenshots/pfc-pulse.png"><figcaption><strong>PFC Pulse</strong><span>Push-to-talk Hermes voice control using Whisper input and Piper output.</span></figcaption></figure><figure><img alt="PFC Command compact server control widget" loading="lazy" src="assets/screenshots/pfc-command.png"><figcaption><strong>PFC Command</strong><span>Compact PFP, runtime, Minecraft, power, and protection status.</span></figcaption></figure></div><div class="hermes-routing-strip"><span>MUSE MANAGER</span><i></i><span>HERMES</span><i></i><span>QWEN WORKER</span></div></div>
</section>"""
current_hermes = soup.select_one('#hermes')
if current_hermes:
    current_hermes.replace_with(BeautifulSoup(compact_hermes, 'html.parser').section)

soup.body['data-revision'] = '6.1'
if not soup.find('link', href='v6_1.css'):
    final_css = soup.find('link', href='v6.css')
    link = soup.new_tag('link', href='v6_1.css', rel='stylesheet')
    if final_css:
        final_css.insert_after(link)
    else:
        soup.head.append(link)

path.write_text(str(soup),encoding='utf-8')
print('updated',path)
