(() => {
  "use strict";

  const D = window.SITE_DATA;
  if (!D) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  const external = (href) => `href="${esc(href)}" target="_blank" rel="noreferrer"`;
  const localLink = (href) => `href="${esc(href)}"`;

  function configureProfile() {
    const p = D.profile;
    const headline = $("[data-profile-headline]");
    const subhead = $("[data-profile-subhead]");
    if (headline) headline.textContent = p.headline;
    if (subhead) subhead.textContent = p.subhead;

    $$('[data-resume-link]').forEach((node) => node.setAttribute('href', p.resume));
    $$('[data-portfolio-link]').forEach((node) => node.setAttribute('href', p.portfolio));
    $$('[data-email-link]').forEach((node) => node.setAttribute('href', `mailto:${p.email}`));
    $$('[data-linkedin-link]').forEach((node) => node.setAttribute('href', p.linkedin));
    $$('[data-github-link]').forEach((node) => node.setAttribute('href', p.github));
  }

  function renderHeroFacts() {
    const root = $("[data-hero-facts]");
    if (!root) return;
    root.innerHTML = D.heroFacts.map((fact) => `
      <div class="hero-fact">
        <strong>${esc(fact.value)}</strong>
        <span>${esc(fact.label)}</span>
      </div>
    `).join("");
  }

  function renderArchitecture() {
    const root = $("[data-architecture]");
    const caption = $("[data-architecture-caption]");
    if (!root) return;
    if (caption) caption.textContent = D.architecture.caption;

    root.innerHTML = D.architecture.layers.map((layer) => `
      <div class="arch-layer reveal">
        <div class="arch-label">${esc(layer.label)}</div>
        ${layer.nodes.map((node) => `
          <article class="arch-node" data-tone="${esc(node.tone)}">
            <strong>${esc(node.name)}</strong>
            <span>${esc(node.detail)}</span>
          </article>
        `).join("")}
      </div>
    `).join("");
  }

  function demoDetail(tab) {
    return `
      <p>${esc(tab.caption)}</p>
      <ul>${tab.points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul>
    `;
  }

  function renderDemos() {
    const root = $("[data-demos]");
    if (!root) return;

    root.innerHTML = D.demos.map((demo) => {
      const active = demo.tabs[0];
      return `
        <article class="demo-panel reveal" data-tone="${esc(demo.tone)}" data-demo-id="${esc(demo.id)}">
          <div class="demo-head">
            <div class="demo-copy">
              <p class="eyebrow">${esc(demo.eyebrow)}</p>
              <h3>${esc(demo.title)}</h3>
              <p>${esc(demo.summary)}</p>
              <div class="demo-metrics">
                ${demo.metrics.map((metric) => `
                  <div class="demo-metric">
                    <strong>${esc(metric.value)}</strong>
                    <span>${esc(metric.label)}</span>
                  </div>
                `).join("")}
              </div>
            </div>
            <div class="demo-stage" data-demo-stage>
              <img src="${esc(active.image)}" alt="${esc(active.alt)}" data-demo-image>
            </div>
          </div>
          <div class="demo-footer">
            <div class="demo-tabs" role="tablist" aria-label="${esc(demo.title)} interface views">
              ${demo.tabs.map((tab, index) => `
                <button class="demo-tab${index === 0 ? " active" : ""}" type="button" role="tab" aria-selected="${index === 0}" data-demo-tab="${esc(tab.id)}">${esc(tab.label)}</button>
              `).join("")}
            </div>
            <div class="demo-detail" data-demo-detail>${demoDetail(active)}</div>
            <button class="button demo-open" type="button" data-open-project="${esc(demo.project)}">Open project</button>
          </div>
        </article>
      `;
    }).join("");

    $$('[data-demo-id]', root).forEach((panel) => {
      const demo = D.demos.find((item) => item.id === panel.dataset.demoId);
      if (!demo) return;
      const image = $('[data-demo-image]', panel);
      const stage = $('[data-demo-stage]', panel);
      const detail = $('[data-demo-detail]', panel);

      $$('[data-demo-tab]', panel).forEach((button) => {
        button.addEventListener('click', () => {
          const tab = demo.tabs.find((item) => item.id === button.dataset.demoTab);
          if (!tab) return;
          $$('[data-demo-tab]', panel).forEach((item) => {
            const active = item === button;
            item.classList.toggle('active', active);
            item.setAttribute('aria-selected', String(active));
          });
          stage.classList.add('loading');
          window.setTimeout(() => {
            image.src = tab.image;
            image.alt = tab.alt;
            detail.innerHTML = demoDetail(tab);
            image.onload = () => stage.classList.remove('loading');
            window.setTimeout(() => stage.classList.remove('loading'), 400);
          }, 110);
        });
      });
    });
  }

  function renderReferences(refs = []) {
    if (!refs.length) return '<p class="project-reference-empty">No external platform reference is needed for this section.</p>';
    return `<div class="reference-row">${refs.map((item) => `<a class="reference-chip" ${external(item.url)}>${esc(item.label)} <span aria-hidden="true">↗</span></a>`).join("")}</div>`;
  }

  function renderHermes() {
    const root = $("[data-hermes]");
    if (!root) return;
    const h = D.hermes;
    root.innerHTML = `
      <div class="hermes-layout">
        <div class="hermes-copy reveal">
          <p class="eyebrow">${esc(h.eyebrow)}</p>
          <h2>${esc(h.title)}</h2>
          <p class="hermes-summary">${esc(h.summary)}</p>
          <div class="hermes-use-list">
            ${h.uses.map((item) => `
              <div class="hermes-use">
                <strong>${esc(item.title)}</strong>
                <span>${esc(item.copy)}</span>
              </div>
            `).join("")}
          </div>
          ${renderReferences(h.references)}
        </div>
        <div class="hermes-media reveal">
          <figure class="hermes-main-shot">
            <img src="${esc(h.image)}" alt="${esc(h.imageAlt)}" loading="lazy">
            <figcaption>Sanitized application view: local speech input, Hermes routing, conversation controls, and audio/output state.</figcaption>
          </figure>
          <div class="hermes-widgets">
            ${h.widgets.map((widget) => `
              <article class="hermes-widget">
                <img src="${esc(widget.image)}" alt="${esc(widget.title)} interface" loading="lazy">
                <div><strong>${esc(widget.title)}</strong><span>${esc(widget.copy)}</span></div>
              </article>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderProjects() {
    const root = $("[data-project-grid]");
    if (!root) return;
    root.innerHTML = D.projects.map((project, index) => `
      <button class="project-card reveal" type="button" data-open-project="${esc(project.id)}" data-fit="${esc(project.heroFit || 'cover')}">
        <div class="project-card-media">
          <span class="project-number">${String(index + 1).padStart(2, '0')}</span>
          <img src="${esc(project.hero)}" alt="${esc(project.title)}" loading="lazy">
        </div>
        <div class="project-card-body">
          <span class="project-card-category">${esc(project.category)}</span>
          <h3>${esc(project.title)}</h3>
          <p>${esc(project.short)}</p>
          <div class="project-card-footer">
            <span class="project-status">${project.status.slice(0, 2).map((status) => `<span class="status-chip">${esc(status)}</span>`).join("")}</span>
            <span class="project-open-label">Open <span>→</span></span>
          </div>
        </div>
      </button>
    `).join("");
  }

  function renderProduction() {
    const b = D.benchmarks;
    return `
      <div class="production-grid">
        ${b.production.map((profile) => `
          <article class="production-card">
            <span class="production-role">${esc(profile.role)}</span>
            <h3>${esc(profile.model)}</h3>
            <p class="production-runtime">${esc(profile.runtime)}</p>
            <div class="production-speed">
              <strong>${esc(profile.speed)}</strong>
              <span>${esc(profile.note)}</span>
            </div>
            <div class="production-settings">
              ${profile.settings.map((setting) => `<span>${esc(setting)}</span>`).join("")}
            </div>
          </article>
        `).join("")}
      </div>
      <div class="benchmark-note">Qwen3.6 Q5_K_S was the fastest tested quant at roughly 72.9 tok/s, but Q5_K_XL is the selected production worker. The production script also adds q4_1 KV and a custom Jinja tool template that are not present in the simpler router preset.</div>
    `;
  }

  function renderStandardized() {
    const b = D.benchmarks;
    return `
      <div class="benchmark-note">${esc(b.standardized.meta)}</div>
      <div class="table-wrap">
        <table class="benchmark-table">
          <thead><tr><th>Model</th><th>Quant</th><th>Type</th><th>Size (GiB)</th><th>pp512 tok/s</th><th>tg128 tok/s</th></tr></thead>
          <tbody>${b.standardized.rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
      <p class="benchmark-finding">Qwen3.5 122B remains historical only and is excluded from the active stack because it was impractical for the available hardware.</p>
      ${renderDataDownloads()}
    `;
  }

  function renderMtp() {
    const b = D.benchmarks;
    return `
      <div class="benchmark-note">${esc(b.mtp.meta)}</div>
      <div class="table-wrap">
        <table class="benchmark-table">
          <thead><tr><th>Model</th><th>Best mode</th><th>Decode tok/s</th><th>Acceptance</th><th>Speedup</th></tr></thead>
          <tbody>${b.mtp.rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
      <p class="benchmark-finding">${esc(b.mtp.finding)}</p>
      ${renderDataDownloads()}
    `;
  }

  function renderDataDownloads() {
    return `<div class="data-downloads">${D.benchmarks.downloads.map((item) => `<a href="${esc(item.href)}" download>${esc(item.label)} ↓</a>`).join("")}</div>`;
  }

  function renderBenchmarks() {
    const root = $("[data-benchmarks]");
    if (!root) return;
    root.innerHTML = `
      <div class="benchmark-tabs" role="tablist" aria-label="Benchmark views">
        <button class="benchmark-tab active" type="button" role="tab" aria-selected="true" data-benchmark-tab="production">Production profiles</button>
        <button class="benchmark-tab" type="button" role="tab" aria-selected="false" data-benchmark-tab="standardized">Standardized sweep</button>
        <button class="benchmark-tab" type="button" role="tab" aria-selected="false" data-benchmark-tab="mtp">MTP research</button>
      </div>
      <div class="benchmark-content" data-benchmark-content>${renderProduction()}</div>
    `;

    const content = $('[data-benchmark-content]', root);
    $$('[data-benchmark-tab]', root).forEach((button) => {
      button.addEventListener('click', () => {
        $$('[data-benchmark-tab]', root).forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        const view = button.dataset.benchmarkTab;
        content.innerHTML = view === 'standardized' ? renderStandardized() : view === 'mtp' ? renderMtp() : renderProduction();
      });
    });
  }

  function renderExperience() {
    const timeline = $("[data-experience]");
    const education = $("[data-education]");
    const skills = $("[data-skills]");
    if (timeline) {
      timeline.innerHTML = D.experience.map((item) => `
        <article class="timeline-item reveal">
          <h3>${esc(item.role)}</h3>
          <div class="timeline-org">${esc(item.org)}</div>
          <span class="timeline-period">${esc(item.period)}</span>
          <p>${esc(item.copy)}</p>
        </article>
      `).join("");
    }
    if (education) {
      education.innerHTML = D.education.map((item) => `
        <div class="education-item">
          <strong>${esc(item.school)}</strong>
          <span>${esc(item.degree)}</span>
          <small>${esc(item.period)}</small>
        </div>
      `).join("");
    }
    if (skills) {
      skills.innerHTML = D.skills.map((skill) => `<span>${esc(skill)}</span>`).join("");
    }
  }

  function projectTabContent(project, tab) {
    const head = (eyebrow, title, copy = "") => `
      <div class="project-section-head">
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h2>${esc(title)}</h2>
        ${copy ? `<p>${esc(copy)}</p>` : ""}
      </div>
    `;

    if (tab === 'overview') {
      return `${head('Overview', 'The project in context.')}
        <div class="project-content-grid">${project.overview.map((item) => `
          <article class="project-content-card"><h3>${esc(item.title)}</h3><p>${esc(item.copy)}</p></article>
        `).join("")}</div>`;
    }

    if (tab === 'engineering') {
      return `${head('Engineering', 'The decisions behind the system.')}
        <div class="project-content-grid">${project.engineering.map((item) => `
          <article class="project-content-card"><h3>${esc(item.title)}</h3><p>${esc(item.copy)}</p></article>
        `).join("")}</div>`;
    }

    if (tab === 'documentation') {
      return `${head('Documentation', 'Photos, drawings, interfaces, and build stages.')}
        <div class="project-gallery-shell">
          <div class="gallery-controls">
            <button class="gallery-control" type="button" data-gallery-prev aria-label="Previous image">←</button>
            <button class="gallery-control" type="button" data-gallery-next aria-label="Next image">→</button>
          </div>
          <div class="project-gallery" data-project-gallery>
            ${project.gallery.map((item) => {
              const contain = /screenshots\//.test(item.src) || /(full-assembly|render|exploded)/.test(item.src);
              return `
                <figure data-fit="${contain ? 'contain' : 'cover'}">
                  <button class="gallery-button" type="button" data-lightbox-src="${esc(item.src)}" data-lightbox-caption="${esc(item.title)} — ${esc(item.copy)}">
                    <img src="${esc(item.src)}" alt="${esc(item.title)}" loading="lazy">
                  </button>
                  <figcaption><strong>${esc(item.title)}</strong><span>${esc(item.copy)}</span></figcaption>
                </figure>
              `;
            }).join("")}
          </div>
        </div>`;
    }

    if (tab === 'results') {
      return `${head('Results', 'What changed because the work was completed.')}
        <div class="project-content-grid">${project.results.map((item) => `
          <article class="project-content-card"><h3>${esc(item.title)}</h3><p>${esc(item.copy)}</p></article>
        `).join("")}</div>`;
    }

    if (tab === 'future') {
      return `${head('Future work', 'The next useful engineering steps.')}
        <ol class="future-list">${project.future.map((item) => `<li>${esc(item)}</li>`).join("")}</ol>`;
    }

    return `${head('References', 'Upstream platforms and technical resources.')}
      <div class="project-reference-panel">
        <p>These links credit the upstream platforms or standards used by the project. The project description focuses on Joseph’s implementation, integration, testing, tuning, and documentation.</p>
        ${renderReferences(project.references)}
      </div>`;
  }

  const projectDialog = $("[data-project-dialog]");
  const projectView = $("[data-project-view]");
  const projectClose = $("[data-project-close]");
  let currentProject = null;
  let currentProjectTab = 'overview';
  let projectReturnHash = '#projects';

  function renderProjectView(project, tab = 'overview') {
    currentProject = project;
    currentProjectTab = tab;
    projectView.innerHTML = `
      <article class="project-view">
        <section class="project-hero" data-fit="${esc(project.heroFit || 'cover')}">
          <div class="project-hero-copy">
            <p class="eyebrow">${esc(project.category)}</p>
            <h1>${esc(project.title)}</h1>
            <p>${esc(project.short)}</p>
            <div class="project-status-row">${project.status.map((status) => `<span class="status-chip">${esc(status)}</span>`).join("")}</div>
          </div>
          <div class="project-hero-media"><img src="${esc(project.hero)}" alt="${esc(project.title)}"></div>
        </section>
        <div class="project-metrics">
          ${project.metrics.map((metric) => `<div class="project-metric"><strong>${esc(metric.value)}</strong><span>${esc(metric.label)}</span></div>`).join("")}
        </div>
        <nav class="project-tabs" role="tablist" aria-label="${esc(project.title)} project sections">
          ${[
            ['overview','Overview'],['engineering','Engineering'],['documentation','Documentation'],['results','Results'],['future','Future work'],['references','References']
          ].map(([id,label]) => `<button class="project-tab${id === tab ? ' active' : ''}" type="button" role="tab" aria-selected="${id === tab}" data-project-tab="${id}">${label}</button>`).join("")}
        </nav>
        <section class="project-tab-content" data-project-tab-content>${projectTabContent(project, tab)}</section>
      </article>
    `;

    $$('[data-project-tab]', projectView).forEach((button) => {
      button.addEventListener('click', () => {
        const nextTab = button.dataset.projectTab;
        currentProjectTab = nextTab;
        $$('[data-project-tab]', projectView).forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        $('[data-project-tab-content]', projectView).innerHTML = projectTabContent(project, nextTab);
        bindProjectContentEvents();
        updateProjectHash(project.id, nextTab, true);
        projectView.querySelector('.project-tabs').scrollIntoView({ block: 'start', behavior: document.body.classList.contains('motion-paused') ? 'auto' : 'smooth' });
      });
    });
    bindProjectContentEvents();
  }

  function bindProjectContentEvents() {
    const gallery = $('[data-project-gallery]', projectView);
    if (gallery) {
      $('[data-gallery-prev]', projectView)?.addEventListener('click', () => gallery.scrollBy({ left: -gallery.clientWidth * 0.72, behavior: 'smooth' }));
      $('[data-gallery-next]', projectView)?.addEventListener('click', () => gallery.scrollBy({ left: gallery.clientWidth * 0.72, behavior: 'smooth' }));
    }
    $$('[data-lightbox-src]', projectView).forEach((button) => {
      button.addEventListener('click', () => openLightbox(button.dataset.lightboxSrc, button.dataset.lightboxCaption));
    });
  }

  function updateProjectHash(id, tab, replace = false) {
    const hash = `#project=${encodeURIComponent(id)}&tab=${encodeURIComponent(tab)}`;
    if (replace) history.replaceState({ project: id, tab }, '', hash);
    else history.pushState({ project: id, tab }, '', hash);
  }

  function openProject(id, tab = 'overview', push = true) {
    const project = D.projects.find((item) => item.id === id);
    if (!project || !projectDialog || !projectView) return;
    if (!location.hash.startsWith('#project=')) projectReturnHash = location.hash || '#projects';
    renderProjectView(project, tab);
    if (!projectDialog.open) projectDialog.showModal();
    document.body.classList.add('dialog-open');
    if (push) updateProjectHash(id, tab);
  }

  function closeProject(updateHistory = true) {
    if (!projectDialog?.open) return;
    projectDialog.close();
    document.body.classList.remove('dialog-open');
    if (updateHistory) history.pushState({}, '', projectReturnHash || '#projects');
  }

  function parseProjectHash() {
    const raw = location.hash.replace(/^#/, '');
    if (!raw.startsWith('project=')) {
      if (projectDialog?.open) closeProject(false);
      return;
    }
    const params = new URLSearchParams(raw);
    const id = params.get('project');
    const tab = params.get('tab') || 'overview';
    openProject(id, tab, false);
  }

  function bindProjectLaunchers() {
    document.addEventListener('click', (event) => {
      const launcher = event.target.closest('[data-open-project]');
      if (!launcher) return;
      openProject(launcher.dataset.openProject, 'overview', true);
    });
    projectClose?.addEventListener('click', () => closeProject(true));
    projectDialog?.addEventListener('click', (event) => {
      if (event.target === projectDialog) closeProject(true);
    });
    projectDialog?.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeProject(true);
    });
    window.addEventListener('popstate', parseProjectHash);
  }

  const lightbox = $("[data-lightbox-dialog]");
  const lightboxImage = $("[data-lightbox-image]");
  const lightboxCaption = $("[data-lightbox-caption]");

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = caption || 'Project image';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.showModal();
  }

  function closeLightbox() {
    if (lightbox?.open) lightbox.close();
  }

  function bindLightbox() {
    $('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  function bindNavigation() {
    const toggle = $('[data-nav-toggle]');
    const nav = $('[data-nav]');
    const header = $('[data-header]');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      $$('a', nav).forEach((link) => link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }));
    }
    const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  function bindMotion() {
    const toggle = $('[data-motion-toggle]');
    if (!toggle) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let saved = null;
    try { saved = localStorage.getItem('portfolio-motion'); } catch (_) { saved = null; }
    const paused = saved === 'paused' || (saved === null && prefersReduced);
    document.body.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));

    toggle.addEventListener('click', () => {
      const next = !document.body.classList.contains('motion-paused');
      document.body.classList.toggle('motion-paused', next);
      toggle.setAttribute('aria-pressed', String(next));
      try { localStorage.setItem('portfolio-motion', next ? 'paused' : 'running'); } catch (_) { /* opaque preview origin */ }
    });

    const visual = $('[data-hero-visual]');
    if (visual && !prefersReduced) {
      visual.addEventListener('pointermove', (event) => {
        if (document.body.classList.contains('motion-paused')) return;
        const rect = visual.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        visual.style.transform = `perspective(900px) rotateX(${(-y * 3.5).toFixed(2)}deg) rotateY(${(x * 3.5).toFixed(2)}deg)`;
      });
      visual.addEventListener('pointerleave', () => { visual.style.transform = ''; });
    }
  }

  function bindReveal() {
    const nodes = $$('.reveal');
    nodes.forEach((node) => node.classList.add('will-reveal'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    nodes.forEach((node) => observer.observe(node));
  }

  configureProfile();
  renderHeroFacts();
  renderArchitecture();
  renderDemos();
  renderHermes();
  renderProjects();
  renderBenchmarks();
  renderExperience();
  bindProjectLaunchers();
  bindLightbox();
  bindNavigation();
  bindMotion();
  bindReveal();
  parseProjectHash();
})();
