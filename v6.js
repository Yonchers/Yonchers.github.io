(() => {
  'use strict';

  const doc = document;
  const $ = (selector, scope = doc) => scope.querySelector(selector);
  const $$ = (selector, scope = doc) => Array.from(scope.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function activateTabbedView(buttons, panels, value, buttonAttribute, panelAttribute) {
    buttons.forEach((button) => {
      const active = button.getAttribute(buttonAttribute) === value;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.getAttribute(panelAttribute) === value;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });
  }

  function bindArrowNavigation(buttons, activate) {
    buttons.forEach((button) => {
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const enabled = buttons.filter((item) => item.getAttribute('aria-disabled') !== 'true');
        const current = Math.max(0, enabled.indexOf(event.currentTarget));
        let next = current;
        if (event.key === 'ArrowLeft') next = (current - 1 + enabled.length) % enabled.length;
        if (event.key === 'ArrowRight') next = (current + 1) % enabled.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = enabled.length - 1;
        enabled[next]?.focus();
        enabled[next]?.click();
      });
    });
  }

  function initPrintOrchestratorViews() {
    const demo = $('[data-real-orch-demo]');
    if (!demo) return;

    const buttons = $$('[data-rpd-view]', demo);
    const panels = $$('[data-rpd-panel]', demo);
    const available = new Set(panels.map((panel) => panel.dataset.rpdPanel));
    const nav = $('.rpd-tabs', demo);
    nav?.setAttribute('role', 'tablist');

    buttons.forEach((button) => {
      const value = button.dataset.rpdView;
      const enabled = available.has(value);
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-disabled', String(!enabled));
      if (!enabled) {
        button.title = 'This portfolio demo focuses on the Fleet and Power views.';
        button.tabIndex = -1;
      }
      button.addEventListener('click', () => {
        if (!enabled) return;
        activateTabbedView(buttons, panels, value, 'data-rpd-view', 'data-rpd-panel');
      });
    });

    panels.forEach((panel, index) => {
      panel.setAttribute('role', 'tabpanel');
      panel.id ||= `rpd-panel-${panel.dataset.rpdPanel || index}`;
      const owner = buttons.find((button) => button.dataset.rpdView === panel.dataset.rpdPanel);
      if (owner) {
        owner.id ||= `rpd-tab-${panel.dataset.rpdPanel}`;
        owner.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', owner.id);
      }
    });

    bindArrowNavigation(buttons, () => {});
  }

  function initBenchmarkViews() {
    const suite = $('[data-benchmark-suite]');
    if (!suite) return;

    const buttons = $$('[data-benchmark-tab]', suite);
    const panels = $$('[data-benchmark-panel]', suite);
    const tablist = $('.benchmark-suite-tabs', suite);
    tablist?.setAttribute('role', 'tablist');

    buttons.forEach((button) => {
      const value = button.dataset.benchmarkTab;
      const panel = panels.find((item) => item.dataset.benchmarkPanel === value);
      button.setAttribute('role', 'tab');
      button.id ||= `benchmark-tab-${value}`;
      if (panel) {
        panel.id ||= `benchmark-panel-${value}`;
        button.setAttribute('aria-controls', panel.id);
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', button.id);
      }
      button.addEventListener('click', () => {
        activateTabbedView(buttons, panels, value, 'data-benchmark-tab', 'data-benchmark-panel');
      });
    });

    bindArrowNavigation(buttons, () => {});
  }

  function enhanceCarousel(carousel) {
    if (carousel.dataset.carouselReady === 'true') return;
    carousel.dataset.carouselReady = 'true';
    carousel.tabIndex = 0;
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-label', 'Project documentation gallery');

    const slides = $$(':scope > figure', carousel);
    if (slides.length < 2) return;

    const controls = doc.createElement('div');
    controls.className = 'gallery-carousel-controls';
    controls.setAttribute('aria-label', 'Gallery controls');

    const previous = doc.createElement('button');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Previous image');
    previous.innerHTML = '<span aria-hidden="true">←</span>';

    const counter = doc.createElement('span');
    counter.setAttribute('aria-live', 'polite');

    const next = doc.createElement('button');
    next.type = 'button';
    next.setAttribute('aria-label', 'Next image');
    next.innerHTML = '<span aria-hidden="true">→</span>';

    controls.append(previous, counter, next);
    carousel.before(controls);

    let activeIndex = 0;
    let scrollFrame = 0;

    function nearestSlideIndex() {
      const left = carousel.scrollLeft;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      slides.forEach((slide, index) => {
        const distance = Math.abs(slide.offsetLeft - left);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      return bestIndex;
    }

    function updateCounter(index = nearestSlideIndex()) {
      activeIndex = Math.max(0, Math.min(index, slides.length - 1));
      counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      previous.disabled = activeIndex === 0;
      next.disabled = activeIndex === slides.length - 1;
    }

    function goTo(index) {
      const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
      const target = slides[targetIndex];
      if (!target) return;
      carousel.scrollTo({
        left: target.offsetLeft,
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
      });
      updateCounter(targetIndex);
    }

    previous.addEventListener('click', () => goTo(activeIndex - 1));
    next.addEventListener('click', () => goTo(activeIndex + 1));
    carousel.addEventListener('scroll', () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => updateCounter());
    }, { passive: true });
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(activeIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(activeIndex + 1);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        goTo(0);
      }
      if (event.key === 'End') {
        event.preventDefault();
        goTo(slides.length - 1);
      }
    });

    updateCounter(0);
  }

  function enhanceProjectPanel(root) {
    $$('.documentation-carousel', root).forEach(enhanceCarousel);
  }

  function observeProjectWorkspace() {
    const panel = $('[data-workspace-panel]');
    if (!panel) return;

    enhanceProjectPanel(panel);
    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(() => enhanceProjectPanel(panel));
    });
    observer.observe(panel, { childList: true, subtree: true });
  }

  function setFooterYear() {
    const year = $('[data-current-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  initPrintOrchestratorViews();
  initBenchmarkViews();
  observeProjectWorkspace();
  setFooterYear();
})();
