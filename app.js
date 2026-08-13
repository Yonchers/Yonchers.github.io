(() => {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const $ = (selector, scope = doc) => scope.querySelector(selector);
  const $$ = (selector, scope = doc) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  const nowClock = () => new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());

  let toastTimer = 0;
  function showToast(message) {
    const toast = $('#demoToast');
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // ---------------------------------------------------------------------------
  // Global navigation, scroll state, reveal motion, and section theming
  // ---------------------------------------------------------------------------

  const footerYear = $('#footerYear');
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  const header = $('#siteHeader');
  const scrollProgress = $('#scrollProgress');
  const navToggle = $('#navToggle');
  const siteNav = $('#siteNav');
  const navLinks = $$('#siteNav a');
  const toneSections = $$('[data-observe-tone]');

  let scrollTicking = false;
  function updateScrollUI() {
    const scrollTop = window.scrollY || root.scrollTop;
    const scrollRange = Math.max(doc.body.scrollHeight - window.innerHeight, 1);
    const progress = clamp(scrollTop / scrollRange, 0, 1);

    if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;
    if (header) header.classList.toggle('is-compact', scrollTop > 34);

    if (toneSections.length) {
      const targetY = window.innerHeight * 0.46;
      let closest = toneSections[0];
      let closestDistance = Number.POSITIVE_INFINITY;

      toneSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!visible) return;
        const sectionCenter = clamp(targetY, rect.top, rect.bottom);
        const distance = Math.abs(sectionCenter - targetY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = section;
        }
      });

      const tone = closest?.dataset.observeTone || 'orange';
      if (body.dataset.tone !== tone) body.dataset.tone = tone;
    }

    const activePoint = window.innerHeight * 0.36;
    let activeId = 'home';
    $$('main section[id]').forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= activePoint && rect.bottom > activePoint) activeId = section.id;
    });
    if (activeId === 'orchestrator' || activeId === 'pfc') activeId = 'systems';

    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    scrollTicking = false;
  }

  function queueScrollUpdate() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  }

  window.addEventListener('scroll', queueScrollUpdate, { passive: true });
  window.addEventListener('resize', queueScrollUpdate, { passive: true });
  updateScrollUI();

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('open', !expanded);
      body.classList.toggle('nav-open', !expanded);
    });

    navLinks.forEach((link) => link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('open');
      body.classList.remove('nav-open');
    }));
  }

  const revealElements = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotionQuery.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  // ---------------------------------------------------------------------------
  // Ambient motion control and canvas constellation
  // ---------------------------------------------------------------------------

  const motionToggle = $('#motionToggle');
  let motionPaused = false;

  function readStoredMotion() {
    try {
      return window.localStorage.getItem('jd-portfolio-motion');
    } catch (_error) {
      return null;
    }
  }

  function writeStoredMotion(value) {
    try {
      window.localStorage.setItem('jd-portfolio-motion', value);
    } catch (_error) {
      // Storage is optional. The page remains fully functional without it.
    }
  }

  function applyMotionState(paused, persist = true) {
    motionPaused = paused;
    body.dataset.motion = paused ? 'paused' : 'full';
    if (motionToggle) {
      motionToggle.setAttribute('aria-pressed', String(paused));
      motionToggle.title = paused ? 'Resume ambient motion' : 'Pause ambient motion';
      const label = $('.motion-label', motionToggle);
      if (label) label.textContent = paused ? 'Paused' : 'Motion';
    }
    if (persist) writeStoredMotion(paused ? 'paused' : 'full');
    window.dispatchEvent(new CustomEvent('portfolio:motion', { detail: { paused } }));
  }

  const storedMotion = readStoredMotion();
  applyMotionState(storedMotion ? storedMotion === 'paused' : reduceMotionQuery.matches, false);

  motionToggle?.addEventListener('click', () => applyMotionState(!motionPaused));
  reduceMotionQuery.addEventListener?.('change', (event) => {
    if (!readStoredMotion()) applyMotionState(event.matches, false);
  });

  function initStarfield() {
    const canvas = $('#starfield');
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const tones = {
      orange: [242, 122, 26],
      blue: [35, 104, 239],
      green: [182, 255, 50],
    };

    let width = 0;
    let height = 0;
    let dpr = 1;
    let points = [];
    let frame = 0;
    let lastTime = performance.now();
    const pointer = { x: 0, y: 0, active: false };

    function createPoint(index, count) {
      const layer = index % 3;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.45 + Math.random() * (layer === 0 ? 1.2 : 0.75),
        vx: (Math.random() - 0.5) * (0.014 + layer * 0.006),
        vy: (Math.random() - 0.5) * (0.012 + layer * 0.005),
        alpha: 0.15 + Math.random() * 0.55,
        pulse: Math.random() * Math.PI * 2,
        layer,
        index,
        count,
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, window.innerWidth);
      height = Math.max(rect.height, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = clamp(Math.round((width * height) / 17500), 44, 115);
      points = Array.from({ length: count }, (_, index) => createPoint(index, count));
      draw(performance.now(), true);
    }

    function draw(time, force = false) {
      const elapsed = Math.min((time - lastTime) / 16.67, 2.5);
      lastTime = time;
      context.clearRect(0, 0, width, height);

      const color = tones[body.dataset.tone] || tones.orange;
      const parallaxX = pointer.active ? (pointer.x / Math.max(width, 1) - 0.5) : 0;
      const parallaxY = pointer.active ? (pointer.y / Math.max(height, 1) - 0.5) : 0;

      points.forEach((point) => {
        if (!motionPaused && !reduceMotionQuery.matches) {
          point.x += point.vx * elapsed * 8;
          point.y += point.vy * elapsed * 8;
          point.pulse += 0.008 * elapsed;
          if (point.x < -8) point.x = width + 8;
          if (point.x > width + 8) point.x = -8;
          if (point.y < -8) point.y = height + 8;
          if (point.y > height + 8) point.y = -8;
        }

        const offsetFactor = (point.layer + 1) * 4;
        const x = point.x + parallaxX * offsetFactor;
        const y = point.y + parallaxY * offsetFactor;
        const pulse = 0.76 + Math.sin(point.pulse) * 0.24;
        context.beginPath();
        context.arc(x, y, point.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${color.join(',')},${point.alpha * pulse})`;
        context.fill();
      });

      const linkDistance = width < 700 ? 84 : 112;
      const maxLinksPerPoint = 2;
      points.forEach((point, index) => {
        let links = 0;
        for (let next = index + 1; next < points.length && links < maxLinksPerPoint; next += 1) {
          const other = points[next];
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          const distance = Math.hypot(dx, dy);
          if (distance >= linkDistance) continue;
          const opacity = (1 - distance / linkDistance) * 0.065;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(${color.join(',')},${opacity})`;
          context.lineWidth = 0.55;
          context.stroke();
          links += 1;
        }
      });

      if (!motionPaused || force) frame = window.requestAnimationFrame(draw);
      else frame = 0;
    }

    function restart() {
      if (!frame) {
        lastTime = performance.now();
        frame = window.requestAnimationFrame(draw);
      }
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener('pointerleave', () => { pointer.active = false; });
    window.addEventListener('portfolio:motion', (event) => {
      if (event.detail.paused) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        draw(performance.now(), true);
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
      } else {
        restart();
      }
    });

    const toneObserver = new MutationObserver(() => {
      if (motionPaused) {
        draw(performance.now(), true);
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
      }
    });
    toneObserver.observe(body, { attributes: true, attributeFilter: ['data-tone'] });

    resize();
    if (motionPaused && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  initStarfield();

  // Depth and magnetic interactions are deliberately subtle and disabled for
  // touch devices or users who prefer reduced motion.
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotionQuery.matches) {
    $$('.tilt-card').forEach((card) => {
      const strength = Number(card.dataset.tiltStrength || 7);
      card.addEventListener('pointermove', (event) => {
        if (motionPaused) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateZ(2px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    $$('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        if (motionPaused) return;
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.11;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.15;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  // ---------------------------------------------------------------------------
  // Print Orchestrator portfolio simulation
  // ---------------------------------------------------------------------------

  function initOrchestratorDemo() {
    const demo = $('[data-orchestrator-demo]');
    if (!demo) return;

    const dispatchButton = $('[data-orch-dispatch]', demo);
    const recoveryButton = $('[data-orch-recover]', demo);
    const queueList = $('[data-orch-queue-list]', demo);
    const queueCount = $('[data-orch-queue]', demo);
    const readyCount = $('[data-orch-ready]', demo);
    const completedCount = $('[data-orch-completed]', demo);
    const logText = $('[data-orch-log]', demo);
    const logTime = $('.log-time', demo);
    const e3ngProgress = $('[data-orch-progress]', demo);
    const e3ngProgressLabel = $('[data-orch-progress-label]', demo);
    const e3ngEta = $('[data-orch-eta]', demo);
    const e3ngHotend = $('[data-orch-hotend]', demo);
    const machineCards = $$('[data-printer-card]', demo);
    const completionTimers = new WeakMap();

    let completed = Number(completedCount?.textContent || 7);
    let e3ngPercent = Number.parseInt(e3ngProgressLabel?.textContent || '42', 10);
    let dispatching = false;
    let recovering = false;

    function setLog(message) {
      if (logText) logText.textContent = message;
      if (logTime) logTime.textContent = nowClock();
    }

    function getStateElement(card) {
      return $('.state', card);
    }

    function updateFleetCounts() {
      const ready = machineCards.filter((card) => getStateElement(card)?.classList.contains('state-ready')).length;
      const queued = $$('[data-queue-item]', queueList).length;
      if (readyCount) readyCount.textContent = `${ready} / ${machineCards.length}`;
      if (queueCount) queueCount.textContent = String(queued);
      if (completedCount) completedCount.textContent = String(completed);
    }

    function setMachineState(card, state, message, statusText) {
      if (!card) return;
      const stateElement = getStateElement(card);
      const messageElement = $('.printer-job span', card);
      const jobStatus = $('.printer-job strong', card);
      if (stateElement) {
        stateElement.classList.remove('state-ready', 'state-printing', 'state-warning', 'state-fault');
        const stateClass = {
          READY: 'state-ready',
          PRINTING: 'state-printing',
          QUEUED: 'state-warning',
          RECOVERING: 'state-warning',
          FAULT: 'state-fault',
        }[state] || 'state-ready';
        stateElement.classList.add(stateClass);
        stateElement.textContent = state;
      }
      card.classList.toggle('ready', state === 'READY');
      card.classList.toggle('printing', state === 'PRINTING');
      if (messageElement && message) messageElement.textContent = message;
      if (jobStatus && statusText) jobStatus.textContent = statusText;
      updateFleetCounts();
    }

    function scheduleCompletion(card, jobName) {
      const priorTimer = completionTimers.get(card);
      if (priorTimer) window.clearTimeout(priorTimer);
      const timer = window.setTimeout(() => {
        if (card.classList.contains('is-fault') || card.classList.contains('is-recovering')) return;
        setMachineState(card, 'READY', 'Calibrated · ready for assignment', 'Idle');
        completed += 1;
        updateFleetCounts();
        setLog(`${card.dataset.printerCard.toUpperCase()} completed ${jobName}. Quality gate passed.`);
      }, 10500 + Math.random() * 2500);
      completionTimers.set(card, timer);
    }

    dispatchButton?.addEventListener('click', async () => {
      if (dispatching) return;
      const queueItem = $('[data-queue-item]', queueList);
      if (!queueItem) {
        setLog('Queue clear. No pending geometry requires dispatch.');
        showToast('Print Orchestrator demo: queue is clear.');
        return;
      }

      const availableCard = machineCards.find((card) => getStateElement(card)?.classList.contains('state-ready'));
      if (!availableCard) {
        setLog('Dispatch deferred. No ready machine satisfies the current policy.');
        showToast('No ready printer is available in the simulated fleet.');
        return;
      }

      dispatching = true;
      dispatchButton.disabled = true;
      const jobName = $('strong', queueItem)?.textContent?.trim() || 'queued job';
      const materialText = $('small', queueItem)?.textContent?.split('·')[0]?.trim() || 'material';
      const machineName = $('strong', $('.printer-card-top', availableCard))?.textContent?.trim() || availableCard.dataset.printerCard;

      setLog(`Analyzing ${jobName}: geometry, material, nozzle, and fleet policy.`);
      await wait(650);
      setLog(`Autoslicing ${jobName} with the validated ${materialText} profile.`);
      setMachineState(availableCard, 'QUEUED', `${jobName} · slicing`, 'Preparing');
      await wait(850);
      setLog(`${machineName} selected. Dispatch lease created and preflight running.`);
      queueItem.classList.add('is-dispatching');
      await wait(460);
      queueItem.remove();
      const newFirst = $('[data-queue-item]', queueList);
      newFirst?.classList.add('next');
      setMachineState(availableCard, 'PRINTING', jobName, '0%');
      setLog(`${jobName} dispatched to ${machineName}. First-layer monitoring armed.`);
      scheduleCompletion(availableCard, jobName);
      showToast(`Demo dispatch complete: ${jobName} → ${machineName}`);

      dispatching = false;
      dispatchButton.disabled = false;
      updateFleetCounts();
    });

    recoveryButton?.addEventListener('click', async () => {
      if (recovering) return;
      recovering = true;
      recoveryButton.disabled = true;
      const voronCard = $('[data-printer-card="voron"]', demo);
      const priorTimer = completionTimers.get(voronCard);
      if (priorTimer) window.clearTimeout(priorTimer);

      voronCard?.classList.add('is-fault');
      setMachineState(voronCard, 'FAULT', 'CAN heartbeat lost · toolhead offline', 'Alert');
      setLog('Voron 2.4 fault detected. Dispatch lease frozen; recovery playbook selected.');
      await wait(1150);

      voronCard?.classList.remove('is-fault');
      voronCard?.classList.add('is-recovering');
      setMachineState(voronCard, 'RECOVERING', 'Rebinding CAN interface · validating sensors', 'Step 2 / 4');
      setLog('Recovery: interface rebound. Verifying thermal channels and homing constraints.');
      await wait(1750);

      setMachineState(voronCard, 'RECOVERING', 'Restoring mesh · checking chamber interlock', 'Step 4 / 4');
      setLog('Recovery: safe state restored. Running final readiness gate.');
      await wait(1150);

      voronCard?.classList.remove('is-recovering');
      setMachineState(voronCard, 'READY', 'Recovered · mesh and CAN verified', 'Idle');
      setLog('Voron 2.4 returned to READY. Recovery event and evidence were recorded.');
      showToast('Simulated recovery succeeded. Voron 2.4 is ready.');
      recovering = false;
      recoveryButton.disabled = false;
    });

    // Give the live E3NG card a low-frequency heartbeat without turning the demo
    // into a distracting animation loop.
    window.setInterval(() => {
      if (doc.hidden || motionPaused || e3ngPercent >= 96) return;
      e3ngPercent = Math.min(96, e3ngPercent + 1 + Math.floor(Math.random() * 3));
      const remainingMinutes = Math.max(8, Math.round((100 - e3ngPercent) * 3.1));
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      if (e3ngProgress) e3ngProgress.style.setProperty('--progress', `${e3ngPercent}%`);
      if (e3ngProgressLabel) e3ngProgressLabel.textContent = `${e3ngPercent}%`;
      if (e3ngEta) e3ngEta.textContent = hours ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${minutes}m`;
      if (e3ngHotend) e3ngHotend.textContent = `${257 + Math.round(Math.random() * 3)}°`;
    }, 3900);

    updateFleetCounts();
  }

  initOrchestratorDemo();

  // ---------------------------------------------------------------------------
  // PFC Supervisor portfolio simulation
  // ---------------------------------------------------------------------------

  function initPfcDemo() {
    const demo = $('[data-pfc-demo]');
    if (!demo) return;

    const clock = $('[data-pfc-time]', demo);
    const events = $('[data-pfc-events]', demo);
    const wakeButton = $('[data-pfc-wake]', demo);
    const sleepButton = $('[data-pfc-sleep]', demo);
    const pfpNode = $('[data-pfp-node]', demo);
    const pfpSubtitle = $('[data-pfp-subtitle]', demo);
    const pfpState = $('[data-pfp-state]', demo);
    const pfpStateText = $('[data-pfp-state-text]', demo);
    const powerMeter = $('[data-power-meter]', demo);
    const powerDraw = $('[data-power-draw]', demo);
    const powerTemp = $('[data-power-temp]', demo);
    const cacheRefresh = $('[data-cache-refresh]', demo);
    const cacheAgeElement = $('[data-cache-age]', demo);
    const cacheHealth = $('[data-cache-health]', demo);
    const auditAgeElement = $('[data-pfc-last-audit]', demo);
    const settingToggles = $$('[data-setting-toggle]', demo);

    let pfpAwake = true;
    let transitioning = false;
    let cacheAge = 2 * 60 + 14;
    let auditAge = 18;
    let cacheRefreshing = false;

    function formatDuration(seconds) {
      const safe = Math.max(0, Math.floor(seconds));
      const hours = Math.floor(safe / 3600);
      const minutes = Math.floor((safe % 3600) / 60);
      const secs = safe % 60;
      return [hours, minutes, secs].map((part) => String(part).padStart(2, '0')).join(':');
    }

    function appendEvent(type, message) {
      if (!events) return;
      const row = doc.createElement('p');
      const time = doc.createElement('time');
      const badge = doc.createElement('b');
      const text = doc.createElement('span');
      time.textContent = nowClock();
      badge.textContent = type;
      text.textContent = message;
      row.append(time, badge, text);
      events.prepend(row);
      while (events.children.length > 6) events.lastElementChild?.remove();
      auditAge = 0;
    }

    function setPfpVisualState(mode) {
      const states = {
        awake: {
          label: 'ONLINE', text: 'Awake · services healthy', subtitle: 'compute node · awake', draw: '146 W', temp: '54°C', meter: '72%', offline: false,
        },
        sleeping: {
          label: 'SLEEPING', text: 'Sleeping · wake service armed', subtitle: 'compute node · sleeping', draw: '4 W', temp: '31°C', meter: '8%', offline: true,
        },
        waking: {
          label: 'WAKING', text: 'Power-on sequence · validating services', subtitle: 'compute node · wake sequence', draw: '82 W', temp: '36°C', meter: '42%', offline: false,
        },
        draining: {
          label: 'DRAINING', text: 'Graceful shutdown · leases releasing', subtitle: 'compute node · draining', draw: '96 W', temp: '49°C', meter: '50%', offline: false,
        },
        fault: {
          label: 'CHECK', text: 'Command timeout · state unchanged', subtitle: 'compute node · verify link', draw: '—', temp: '—', meter: '0%', offline: true,
        },
      };
      const state = states[mode];
      if (!state) return;
      if (pfpState) {
        pfpState.textContent = state.label;
        pfpState.classList.toggle('offline', state.offline);
      }
      if (pfpStateText) pfpStateText.textContent = state.text;
      if (pfpSubtitle) pfpSubtitle.textContent = state.subtitle;
      if (powerDraw) powerDraw.textContent = state.draw;
      if (powerTemp) powerTemp.textContent = state.temp;
      if (powerMeter) powerMeter.style.setProperty('--meter', state.meter);
      pfpNode?.classList.toggle('sleeping', mode === 'sleeping' || mode === 'fault');
    }

    async function transitionPfp(targetAwake) {
      if (transitioning) return;
      if (targetAwake === pfpAwake) {
        showToast(`PFP is already ${targetAwake ? 'awake' : 'sleeping'}.`);
        appendEvent('INFO', `Duplicate ${targetAwake ? 'wake' : 'sleep'} request ignored.`);
        return;
      }

      transitioning = true;
      wakeButton.disabled = true;
      sleepButton.disabled = true;

      if (targetAwake) {
        setPfpVisualState('waking');
        appendEvent('POWER', 'Wake command authorized; out-of-band sequence started.');
        await wait(1650);
        setPfpVisualState('awake');
        pfpAwake = true;
        appendEvent('NODE', 'PFP services healthy; workload lease restored.');
        showToast('PFC demo: PFP wake sequence completed.');
      } else {
        setPfpVisualState('draining');
        appendEvent('POWER', 'Sleep authorized; workloads draining and state preserved.');
        await wait(1750);
        setPfpVisualState('sleeping');
        pfpAwake = false;
        appendEvent('NODE', 'PFP entered low-power state; wake path remains armed.');
        showToast('PFC demo: PFP entered a safe sleep state.');
      }

      transitioning = false;
      wakeButton.disabled = false;
      sleepButton.disabled = false;
    }

    wakeButton?.addEventListener('click', () => transitionPfp(true));
    sleepButton?.addEventListener('click', () => transitionPfp(false));

    cacheRefresh?.addEventListener('click', async () => {
      if (cacheRefreshing) return;
      cacheRefreshing = true;
      cacheRefresh.disabled = true;
      cacheRefresh.classList.add('is-loading');
      if (cacheHealth) cacheHealth.textContent = 'SYNCING';
      appendEvent('SYNC', 'Manual Hermes cache refresh requested by operator.');
      await wait(1350);
      cacheAge = 0;
      if (cacheHealth) cacheHealth.textContent = 'HEALTHY';
      cacheRefresh.classList.remove('is-loading');
      cacheRefresh.disabled = false;
      cacheRefreshing = false;
      appendEvent('INFO', 'Hermes schedule cache refreshed; local fallback verified.');
      showToast('Hermes schedule cache refreshed in the demo.');
    });

    settingToggles.forEach((toggle) => {
      toggle.addEventListener('change', () => {
        const label = toggle.closest('.matrix-row');
        const name = $('strong', label)?.textContent?.trim() || 'Control';
        appendEvent('AUTH', `${name} ${toggle.checked ? 'enabled' : 'disabled'} in the settings matrix.`);
        showToast(`${name}: ${toggle.checked ? 'enabled' : 'disabled'}`);
      });
    });

    $$('.pfc-topbar nav button, .pfc-rail button', demo).forEach((button) => {
      button.addEventListener('click', () => {
        const group = button.closest('nav') || button.closest('.pfc-rail');
        $$('button', group).forEach((peer) => peer.classList.toggle('active', peer === button));
        showToast(`${button.textContent.trim()} view selected in the PFC demo.`);
      });
    });

    function updatePfcClock() {
      if (clock) clock.textContent = nowClock();
      cacheAge += 1;
      auditAge += 1;
      if (cacheAgeElement) cacheAgeElement.textContent = formatDuration(cacheAge);
      if (auditAgeElement) auditAgeElement.textContent = auditAge < 60 ? `${auditAge} sec` : `${Math.floor(auditAge / 60)} min`;

      if (cacheHealth && !cacheRefreshing) {
        if (cacheAge >= 15 * 60) cacheHealth.textContent = 'STALE';
        else cacheHealth.textContent = 'HEALTHY';
      }
    }

    updatePfcClock();
    window.setInterval(updatePfcClock, 1000);
  }

  initPfcDemo();

  // ---------------------------------------------------------------------------
  // Portfolio filtering and project evidence dialog
  // ---------------------------------------------------------------------------

  const projectData = {
    'print-orchestrator': {
      kicker: 'Fleet operations software · Working lab system',
      title: 'Print Orchestrator',
      image: 'assets/screenshots/print-orchestrator-dashboard.png',
      alt: 'Print Orchestrator fleet dashboard showing three printers and their independent machine states',
      summary: 'I built this dashboard because checking separate printer interfaces was slow and made it harder to see the full state of the lab. It combines PrusaLink and Moonraker/Klipper machines without hiding the differences between them.',
      contributions: [
        'Combined machine connectivity, temperatures, cameras, jobs, part detection, power state, files, and console access in one fleet view.',
        'Designed each printer card around the controls and evidence that machine actually supports instead of forcing a false one-size-fits-all model.',
        'Added plain-language offline, setup, recovery, and attention states so the operator can understand what failed and what to do next.',
        'Connected the print-control layer to the wider Hermes and PFC environment for notifications, scheduled work, and power-aware operations.',
      ],
      tags: ['PrusaLink', 'Moonraker', 'Klipper', 'fleet UI', 'part detection', 'camera monitoring', 'power control', 'recovery'],
      page: 'projects/print-orchestrator/',
    },
    'pfc-supervisor': {
      kicker: 'Power and runtime orchestration · Working lab system',
      title: 'PFC Supervisor',
      image: 'assets/screenshots/pfc-power-management-top.png',
      alt: 'PFC Supervisor power management dashboard with energy and sleep metrics',
      summary: 'PFC lets the main compute server sleep through long idle periods while a low-power Pi keeps schedules, wake protection, and operator visibility alive. The current seven-day ledger estimates 13.19 kWh avoided and records 95 hours of sleep.',
      contributions: [
        'Built an interlocked sleep/wake policy that checks active AI, Minecraft, print-control, scheduled, and background work before suspending the server.',
        'Kept Hermes schedule data cached on the Pi so scheduled jobs remain visible and can wake the server before execution.',
        'Added an energy ledger that separates current load, estimated avoided energy, observed sleep, and long-term projections with visible measurement caveats.',
        'Created runtime reconciliation and eligibility views so a blocked or accepted decision is explained instead of appearing as a black-box automation action.',
      ],
      tags: ['power automation', 'systemd', 'Hermes', 'sleep/wake', 'energy ledger', 'local AI', 'safety interlocks', 'auditability'],
      page: 'projects/pfc-supervisor/',
    },
    'ai-server': {
      page: 'projects/ai-server/',
      kicker: 'Local AI infrastructure · Active engineering program',
      title: 'B70 engineering server',
      image: 'assets/images/ai-img-8931.jpg',
      alt: 'Custom orange and black B70 local AI server with integrated status display',
      summary: 'A custom local-AI platform built to run private engineering assistants, benchmark model configurations, support manager/worker workflows, and serve as infrastructure for printer and power-control projects.',
      contributions: [
        'Integrated the B70 platform into a purpose-built enclosure with an operator-facing display and serviceable internal layout.',
        'Benchmarked dense and mixture-of-experts models using measured generation and prompt-processing results instead of relying on vendor claims.',
        'Developed role-specific evaluation criteria for supervision, coding, shell/tool use, debugging, preservation, recovery, and verification.',
        'Connected local inference work to practical software systems including Print Orchestrator, PFC Supervisor, and engineering automation workflows.',
      ],
      tags: ['B70 GPU', 'Linux', 'llama.cpp', 'local inference', 'benchmarking', 'model evaluation', 'web UI', 'systems integration'],
    },
    e3ng: {
      page: 'projects/e3ng/',
      kicker: 'Motion systems · Custom machine conversion',
      title: 'E3NG CoreXY platform',
      image: 'assets/images/e3ng-img-7200-1.jpg',
      alt: 'Completed E3NG CoreXY printer conversion and motion platform',
      summary: 'An Ender 3 Pro transformed into a custom CoreXY motion-control platform, combining mechanical redesign, electronics integration, Klipper configuration, networked toolhead troubleshooting, and calibration for engineering materials.',
      contributions: [
        'Built and aligned the CoreXY frame, belt path, gantry, toolhead package, bed system, and custom mechanical interfaces.',
        'Integrated an SKR Mini E3 V3, Raspberry Pi, U2C/CAN-style interface, sensors, camera, and toolhead electronics.',
        'Debugged Linux networking and CAN communication while migrating the machine into a reliable Klipper/Mainsail workflow.',
        'Completed input-shaper, bed-mesh, thermal, extrusion, homing, and repeatability tuning as a commissioning process.',
      ],
      tags: ['CoreXY', 'Klipper', 'CAN', 'Mainsail', 'SKR Mini E3 V3', 'Raspberry Pi', 'input shaper', 'commissioning'],
    },
    voron: {
      page: 'projects/voron-systems/',
      kicker: 'Rapid prototyping · Automated workcells',
      title: 'Voron-class print systems',
      image: 'assets/images/voron-img-6388-1.jpg',
      alt: 'Voron toolhead and hotend components during machine integration',
      summary: 'Large-format enclosed printers built, maintained, tuned, and used as practical automated workcells for functional components, technical materials, rapid iteration, and repeatable production workflows.',
      contributions: [
        'Applied precision assembly practices to frame squareness, gantry alignment, belt tension, Z synchronization, and thermal behavior.',
        'Integrated and serviced toolheads, electronics bays, cameras, probes, hotends, and custom printed components.',
        'Created reliable profiles and maintenance routines for ASA and other engineering-focused materials.',
        'Used failure evidence to isolate mechanical drag, wiring faults, thermal instability, firmware issues, slicing errors, and material problems.',
      ],
      tags: ['Voron 2.4', 'CoreXY', 'ASA', 'toolheads', 'thermal management', 'calibration', 'maintenance', 'rapid prototyping'],
    },
    metuned: {
      page: 'projects/metuned/',
      kicker: 'Product development · Co-founder / Chief Design Officer',
      title: 'Metuned digital dash',
      image: 'assets/images/metuned-copy-of-proto-4-1.jpg',
      alt: 'Metuned digital dashboard prototype with enclosure and electronics packaging',
      summary: 'A motorsports electronics concept developed from a real endurance-racing instrumentation problem into an affordable, customizable dashboard with prototype enclosure, electronics packaging, cooling, branding, and product-facing communication.',
      contributions: [
        'Translated driver and race-team pain points into product requirements for visibility, service access, cooling, packaging, and mounting.',
        'Developed CAD concepts and 3D-printed enclosure iterations around PCB fitment and practical vehicle constraints.',
        'Helped establish the product identity, panel graphics, technical narrative, and evidence used for outreach and fundraising.',
        'Connected trackside experience to manufacturable product decisions rather than treating the enclosure as a purely visual exercise.',
      ],
      tags: ['product design', 'CAD', '3D printing', 'PCB packaging', 'cooling', 'motorsports', 'branding', 'design iteration'],
    },
    motorsports: {
      page: 'projects/motorsports/',
      kicker: 'Leadership · Race operations · Fabrication',
      title: 'Sierra College Motorsports',
      image: 'assets/images/motorsports-img-5023-2.jpg',
      alt: 'Sierra College motorsports Mini Cooper race-car project and student team',
      summary: 'A student motorsports program developed through team leadership, community events, sponsorship outreach, race preparation, hands-on repair, and trackside problem solving around the “Notta Miata” Mini Cooper.',
      contributions: [
        'Progressed from treasurer to vice president to president while coordinating planning, funding, recruitment, safety, and race execution.',
        'Helped turn a low-cost Mini Cooper into a running race project through engine work, brackets, panels, mounts, welding support, and field repairs.',
        'Organized Cars & Coffee events that created community visibility and a self-funding pipeline for the club.',
        'Worked under budget, deadline, packaging, serviceability, and reliability constraints where solutions had to function in the real world.',
      ],
      tags: ['team leadership', '24 Hours of Lemons', 'fabrication', 'engine systems', 'sponsorship', 'events', 'trackside repair', 'safety'],
    },
    espresso: {
      page: 'projects/espresso-machine/',
      kicker: 'ME190 senior design · Industry-sponsored milestone',
      title: 'Hybrid hand-actuated espresso machine',
      image: 'assets/images/espresso-group1-standing.jpg',
      alt: 'ME190 senior design team with hybrid hand-actuated espresso machine project',
      summary: 'A compact senior-design machine targeting a double espresso shot at approximately 9 bar, 2 oz ±10%, and a 25–30 second pull, with manual force generation supported by heating, sensing, pumping, and control-system integration.',
      contributions: [
        'Supported electrical fundamentals, efficiency constraints, wattage calculations, controls planning, and mechanical/electrical integration.',
        'Developed project evidence through prototype work, poster presentation, drawing packages, bills of materials, testing plans, and technical documentation.',
        'The team recently secured a SendCutSend sponsorship worth $750 in store credit plus merchandise for project fabrication and visibility.',
        'Balanced pressure, volume, timing, envelope, heat, safety, serviceability, and manufacturability as a coupled system rather than isolated parts.',
      ],
      tags: ['senior design', '9 bar target', 'controls', 'thermal systems', 'CAD', 'drawing package', 'SendCutSend', '$750 sponsorship'],
    },
    uei: {
      page: 'projects/uei-lab/',
      kicker: 'Professional test engineering · Standards-driven work',
      title: 'UEI / Sacramento State lab',
      image: 'assets/images/uei-img-8870.jpg',
      alt: 'Instrumentation and controlled airflow test environment at Sacramento State laboratory',
      summary: 'Laboratory work supporting California Energy Commission-related appliance auditing, residential fan airflow/CFM evaluation, controlled test environments, instrumentation setup, repeatability, and technical documentation.',
      contributions: [
        'Helped construct and maintain an approximately 8-foot-cube room and associated setup for HVI 916-style whole-house fan testing.',
        'Configured tubing, pressure and flow measurement hardware, wet/dry-bulb readings, thermocouples, data logging, and related instrumentation.',
        'Supported portable-spa and food-heater energy-efficiency testing in controlled thermal environments.',
        'Collected and documented evidence used to compare measured performance against standards and advertised values.',
      ],
      tags: ['CFM testing', 'HVI 916 exposure', 'instrumentation', 'data acquisition', 'thermocouples', 'CEC', 'lab safety', 'documentation'],
    },
    robotics: {
      page: 'projects/abb-rexroth/',
      kicker: 'Industrial robotics coursework · Hands-on laboratory exposure',
      title: 'ABB / Rexroth systems',
      image: 'assets/images/me165-image-111.jpg',
      alt: 'ABB industrial robot and Rexroth controller platform in a university laboratory',
      summary: 'ME165 coursework connecting controls concepts to industrial ABB robot hardware and Rexroth controller platforms through supervised, safety-aware lab work and technical documentation.',
      contributions: [
        'Worked around industrial robot hardware, controller interfaces, emergency-stop systems, I/O, cabling, and supervised setup procedures.',
        'Connected motion and control concepts to real equipment states, faults, interfaces, and operator safety expectations.',
        'Practiced disciplined setup, observation, troubleshooting, and documentation rather than overstating coursework as production ownership.',
        'Built relevant familiarity for automation-support, commissioning, maintenance, and controls-adjacent engineering roles.',
      ],
      tags: ['ABB robotics', 'Rexroth', 'controllers', 'E-stop', 'I/O', 'automation', 'fault isolation', 'lab safety'],
    },
    manufacturing: {
      page: 'projects/makerspace-manufacturing/',
      kicker: 'Manufacturing support · Equipment and operator workflows',
      title: 'Makerspace & equipment work',
      image: 'assets/images/manufacturing-img-8774.jpg',
      alt: 'Fabricated test fixture and controlled manufacturing or laboratory setup',
      summary: 'Hands-on experience spanning makerspace technical support, CAD/CAM, additive manufacturing, CNC routing, laser systems, woodworking tools, shop safety, user training, production support, deburr, and packaging.',
      contributions: [
        'Supported users and equipment across 3D printers, CNC routers, lasers, woodworking, embroidery, vinyl, and related shop workflows.',
        'Converted designs into practical machine setups while considering material, fixturing, tool access, safety, and repeatability.',
        'Built documentation and training habits that improve safe operation, equipment uptime, and successful handoff to other users.',
        'Connected design work to the realities of finishing, inspection, deburr, packaging, and production support.',
      ],
      tags: ['CAD/CAM', 'CNC routing', 'laser cutting', '3D printing', 'shop safety', 'training', 'deburr', 'equipment uptime'],
    },
  };

  const filterButtons = $$('[data-project-filter]');
  const projectCards = $$('[data-project]');
  const projectDialog = $('#projectDialog');
  const dialogClose = $('[data-dialog-close]', projectDialog || doc);

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.projectFilter;
      filterButtons.forEach((peer) => peer.classList.toggle('active', peer === button));
      projectCards.forEach((card) => {
        const categories = (card.dataset.category || '').split(/\s+/);
        card.hidden = filter !== 'all' && !categories.includes(filter);
      });
    });
  });

  function openProjectDialog(projectId) {
    const data = projectData[projectId];
    if (!data || !projectDialog) return;

    const image = $('[data-dialog-image]', projectDialog);
    const kicker = $('[data-dialog-kicker]', projectDialog);
    const title = $('[data-dialog-title]', projectDialog);
    const summary = $('[data-dialog-summary]', projectDialog);
    const contributions = $('[data-dialog-contributions]', projectDialog);
    const tags = $('[data-dialog-tags]', projectDialog);
    const pageLink = $('[data-dialog-page]', projectDialog);

    if (image) {
      image.src = data.image;
      image.alt = data.alt;
    }
    if (kicker) kicker.textContent = data.kicker;
    if (title) title.textContent = data.title;
    if (summary) summary.textContent = data.summary;
    if (contributions) {
      contributions.replaceChildren(...data.contributions.map((text) => {
        const item = doc.createElement('li');
        item.textContent = text;
        return item;
      }));
    }
    if (tags) {
      tags.replaceChildren(...data.tags.map((text) => {
        const tag = doc.createElement('span');
        tag.textContent = text;
        return tag;
      }));
    }
    if (pageLink) {
      pageLink.href = data.page || '#portfolio';
      pageLink.hidden = !data.page;
    }

    try {
      projectDialog.showModal();
    } catch (_error) {
      projectDialog.setAttribute('open', '');
    }
    root.style.overflow = 'hidden';
  }

  function closeProjectDialog() {
    if (!projectDialog) return;
    if (projectDialog.open) projectDialog.close();
    else projectDialog.removeAttribute('open');
    root.style.overflow = '';
  }

  projectCards.forEach((card) => {
    $('button', card)?.addEventListener('click', () => openProjectDialog(card.dataset.project));
  });

  dialogClose?.addEventListener('click', closeProjectDialog);
  projectDialog?.addEventListener('click', (event) => {
    if (event.target === projectDialog) closeProjectDialog();
  });
  projectDialog?.addEventListener('close', () => { root.style.overflow = ''; });

  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && projectDialog?.open) closeProjectDialog();
  });
})();
