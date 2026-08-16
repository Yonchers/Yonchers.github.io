(() => {
  'use strict';

  const payload = window.PORTFOLIO_PROJECTS;
  if (!payload?.projects || !Array.isArray(payload.order)) return;

  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const $ = (selector, scope = doc) => scope.querySelector(selector);
  const $$ = (selector, scope = doc) => Array.from(scope.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const workspace = $('#projectWorkspace');
  const windowPanel = $('.project-workspace-window', workspace || doc);
  const scrollArea = $('[data-workspace-scroll]', workspace || doc);
  const eyebrow = $('[data-workspace-eyebrow]', workspace || doc);
  const title = $('[data-workspace-title]', workspace || doc);
  const shortTitle = $('[data-workspace-title-short]', workspace || doc);
  const lede = $('[data-workspace-lede]', workspace || doc);
  const status = $('[data-workspace-status]', workspace || doc);
  const heroImage = $('[data-workspace-image]', workspace || doc);
  const heroCaption = $('[data-workspace-caption]', workspace || doc);
  const metrics = $('[data-workspace-metrics]', workspace || doc);
  const tabs = $('[data-workspace-tabs]', workspace || doc);
  const panel = $('[data-workspace-panel]', workspace || doc);
  const previousButton = $('[data-project-prev]', workspace || doc);
  const nextButton = $('[data-project-next]', workspace || doc);
  const lightbox = $('#projectLightbox');
  const lightboxImage = $('[data-lightbox-image]', lightbox || doc);
  const lightboxCaption = $('[data-lightbox-caption]', lightbox || doc);
  const lightboxClose = $('[data-lightbox-close]', lightbox || doc);

  if (!workspace || !windowPanel || !panel || !tabs) return;

  const aliasMap = {
    voron: 'voron-systems',
    espresso: 'espresso-machine',
    uei: 'uei-lab',
    robotics: 'abb-rexroth',
    manufacturing: 'makerspace-manufacturing',
  };

  const defaultDocumentTitle = doc.title;
  let activeProjectId = null;
  let activeTabId = null;
  let returnFocus = null;
  let closeTimer = 0;
  let syncingHistory = false;

  function canonicalProjectId(value) {
    const normalized = aliasMap[value] || value;
    return payload.projects[normalized] ? normalized : null;
  }

  function projectIndex(projectId) {
    return payload.order.indexOf(projectId);
  }

  function escapeText(value) {
    return String(value ?? '');
  }

  function setInert(isInert) {
    const targets = [$('#siteHeader'), $('#main'), $('.site-footer')].filter(Boolean);
    targets.forEach((target) => {
      if (isInert) target.setAttribute('inert', '');
      else target.removeAttribute('inert');
    });
  }

  function buildMetrics(project) {
    metrics.replaceChildren(...project.metrics.map((metric) => {
      const article = doc.createElement('article');
      const strong = doc.createElement('strong');
      const span = doc.createElement('span');
      strong.textContent = metric.value;
      span.textContent = metric.label;
      article.append(strong, span);
      return article;
    }));
  }

  function buildStatus(project) {
    status.replaceChildren(...project.status.map((item) => {
      const span = doc.createElement('span');
      span.textContent = item;
      return span;
    }));
  }

  function buildTabs(project, requestedTabId) {
    const selected = project.tabs.some((tab) => tab.id === requestedTabId)
      ? requestedTabId
      : project.tabs[0]?.id;

    tabs.replaceChildren(...project.tabs.map((tab, index) => {
      const button = doc.createElement('button');
      const isActive = tab.id === selected;
      button.type = 'button';
      button.id = `workspace-tab-${project.id}-${tab.id}`;
      button.dataset.workspaceTab = tab.id;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', 'workspaceProjectPanel');
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
      button.classList.toggle('is-active', isActive);
      button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span>${escapeText(tab.label)}`;
      button.addEventListener('click', () => selectTab(tab.id, true));
      button.addEventListener('keydown', handleTabKeyboard);
      return button;
    }));

    selectTab(selected, false);
  }

  function handleTabKeyboard(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const tabButtons = $$('[data-workspace-tab]', tabs);
    const current = tabButtons.indexOf(event.currentTarget);
    let nextIndex = current;
    if (event.key === 'ArrowRight') nextIndex = (current + 1) % tabButtons.length;
    if (event.key === 'ArrowLeft') nextIndex = (current - 1 + tabButtons.length) % tabButtons.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabButtons.length - 1;
    tabButtons[nextIndex]?.focus();
    tabButtons[nextIndex]?.click();
  }

  function attachPanelInteractions() {
    $$('[data-lightbox]', panel).forEach((button) => {
      button.addEventListener('click', () => {
        const image = $('img', button);
        if (!image || !lightbox) return;
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt || '';
        lightboxCaption.textContent = button.dataset.caption || image.alt || '';
        try {
          lightbox.showModal();
        } catch (_error) {
          lightbox.setAttribute('open', '');
        }
        lightboxClose?.focus();
      });
    });
  }

  function appendNextStep(project, tab) {
    if (tab.id !== 'outcomes' || !project.next) return;
    const next = doc.createElement('aside');
    next.className = 'workspace-next-step';
    next.innerHTML = '<span>Next step</span>';
    const paragraph = doc.createElement('p');
    paragraph.textContent = project.next;
    next.append(paragraph);
    panel.append(next);
  }

  function scrollTabsIntoView(behavior = 'smooth') {
    const shell = $('.workspace-tab-shell', workspace);
    if (!shell || !scrollArea) return;
    const scrollRect = scrollArea.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    const top = Math.max(0, scrollArea.scrollTop + shellRect.top - scrollRect.top - 10);
    scrollArea.scrollTo({ top, behavior });
  }

  function selectTab(tabId, updateHistory = true) {
    const project = payload.projects[activeProjectId];
    if (!project) return;
    const tab = project.tabs.find((item) => item.id === tabId) || project.tabs[0];
    if (!tab) return;

    activeTabId = tab.id;
    $$('[data-workspace-tab]', tabs).forEach((button) => {
      const isActive = button.dataset.workspaceTab === tab.id;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    panel.classList.remove('is-ready');
    panel.id = 'workspaceProjectPanel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `workspace-tab-${project.id}-${tab.id}`);
    panel.innerHTML = `<section class="project-section workspace-project-section">${tab.html}</section>`;
    appendNextStep(project, tab);
    attachPanelInteractions();
    window.requestAnimationFrame(() => {
      panel.classList.add('is-ready');
      if (updateHistory) scrollTabsIntoView(reduceMotion.matches ? 'auto' : 'smooth');
    });

    if (updateHistory && !syncingHistory) updateHash(project.id, tab.id, true);
  }

  function updateNeighborButtons(projectId) {
    const index = projectIndex(projectId);
    const previousId = payload.order[(index - 1 + payload.order.length) % payload.order.length];
    const nextId = payload.order[(index + 1) % payload.order.length];
    previousButton.dataset.projectTarget = previousId;
    nextButton.dataset.projectTarget = nextId;
    const previousTitle = payload.projects[previousId]?.title || 'Previous project';
    const nextTitle = payload.projects[nextId]?.title || 'Next project';
    previousButton.title = previousTitle;
    nextButton.title = nextTitle;
  }

  function renderProject(projectId, requestedTabId) {
    const project = payload.projects[projectId];
    if (!project) return;

    activeProjectId = projectId;
    workspace.dataset.tone = project.tone || 'orange';
    eyebrow.textContent = project.eyebrow;
    title.textContent = project.title;
    shortTitle.textContent = project.title;
    lede.textContent = project.lede;
    heroImage.src = project.image;
    heroImage.alt = project.imageAlt || project.title;
    heroCaption.textContent = project.imageCaption || '';
    workspace.dataset.mediaFit = project.imageFit || 'cover';
    workspace.dataset.galleryCount = String(project.gallery?.length || 0);
    buildStatus(project);
    buildMetrics(project);
    updateNeighborButtons(projectId);
    buildTabs(project, requestedTabId);
    doc.title = `${project.title} | Joseph Dwyer Engineering Portfolio`;
  }

  function openProject(projectId, requestedTabId = null, options = {}) {
    const canonical = canonicalProjectId(projectId);
    if (!canonical) return;
    const project = payload.projects[canonical];
    const tabId = requestedTabId || project.tabs[0]?.id;
    const { updateHistory = true, preserveFocus = false } = options;

    window.clearTimeout(closeTimer);
    if (!preserveFocus) returnFocus = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
    renderProject(canonical, tabId);

    workspace.hidden = false;
    workspace.setAttribute('aria-hidden', 'false');
    body.classList.add('project-workspace-open');
    setInert(true);
    scrollArea.scrollTop = 0;
    window.requestAnimationFrame(() => {
      workspace.classList.add('is-open');
      window.setTimeout(() => windowPanel.focus({ preventScroll: true }), reduceMotion.matches ? 0 : 180);
      const firstTabId = project.tabs[0]?.id;
      if (requestedTabId && requestedTabId !== firstTabId) {
        window.setTimeout(() => scrollTabsIntoView('auto'), reduceMotion.matches ? 0 : 220);
      }
    });

    if (updateHistory && !syncingHistory) updateHash(canonical, activeTabId, false);
  }

  function closeProject(options = {}) {
    if (workspace.hidden) return;
    const { updateHistory = true, restoreFocus = true } = options;
    workspace.classList.remove('is-open');
    workspace.setAttribute('aria-hidden', 'true');
    body.classList.remove('project-workspace-open');
    setInert(false);
    doc.title = defaultDocumentTitle;
    activeProjectId = null;
    activeTabId = null;

    if (updateHistory && !syncingHistory) {
      try {
        history.pushState(null, '', '#portfolio');
      } catch (_error) {
        window.location.hash = 'portfolio';
      }
    }

    closeTimer = window.setTimeout(() => {
      workspace.hidden = true;
      panel.replaceChildren();
      tabs.replaceChildren();
      if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    }, reduceMotion.matches ? 0 : 440);
  }

  function updateHash(projectId, tabId, replace) {
    const params = new URLSearchParams();
    params.set('project', projectId);
    if (tabId) params.set('tab', tabId);
    const hash = params.toString();
    const method = replace ? 'replaceState' : 'pushState';
    try {
      history[method](null, '', `#${hash}`);
    } catch (_error) {
      window.location.hash = hash;
    }
  }

  function readHash() {
    const raw = location.hash.slice(1);
    if (!raw.startsWith('project=')) return null;
    const params = new URLSearchParams(raw);
    const projectId = canonicalProjectId(params.get('project'));
    if (!projectId) return null;
    const project = payload.projects[projectId];
    const requestedTab = params.get('tab');
    const tabId = project.tabs.some((tab) => tab.id === requestedTab)
      ? requestedTab
      : project.tabs[0]?.id;
    return { projectId, tabId };
  }

  function syncFromHistory() {
    syncingHistory = true;
    const target = readHash();
    if (target) openProject(target.projectId, target.tabId, { updateHistory: false, preserveFocus: true });
    else closeProject({ updateHistory: false, restoreFocus: false });
    syncingHistory = false;
  }

  $$('[data-open-project]').forEach((control) => {
    control.addEventListener('click', (event) => {
      event.preventDefault();
      openProject(control.dataset.openProject);
    });
  });

  $$('[data-project-close]', workspace).forEach((control) => {
    control.addEventListener('click', () => closeProject());
  });

  previousButton?.addEventListener('click', () => {
    openProject(previousButton.dataset.projectTarget, null, { updateHistory: true, preserveFocus: true });
  });
  nextButton?.addEventListener('click', () => {
    openProject(nextButton.dataset.projectTarget, null, { updateHistory: true, preserveFocus: true });
  });

  lightboxClose?.addEventListener('click', () => lightbox?.close());
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (lightbox?.open) {
        lightbox.close();
        event.preventDefault();
        return;
      }
      if (!workspace.hidden) {
        closeProject();
        event.preventDefault();
      }
    }

    if (event.key === 'Tab' && !workspace.hidden && !lightbox?.open) {
      const focusable = $$('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', windowPanel)
        .filter((item) => !item.hidden && item.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && doc.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && doc.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    }
  });

  window.addEventListener('popstate', syncFromHistory);

  const initialTarget = readHash();
  if (initialTarget) {
    window.setTimeout(() => openProject(initialTarget.projectId, initialTarget.tabId, {
      updateHistory: false,
      preserveFocus: true,
    }), 120);
  }
})();
