(() => {
  'use strict';

  const doc = document;
  const $ = (selector, root = doc) => root.querySelector(selector);
  const $$ = (selector, root = doc) => Array.from(root.querySelectorAll(selector));

  function formatTime(date = new Date()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  }

  function notify(message) {
    const toast = $('#demoToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // ------------------------------------------------------------------------
  // Higher-fidelity Print Orchestrator mock-up
  // ------------------------------------------------------------------------

  function initPrintDashboard() {
    const demo = $('[data-real-orch-demo]');
    if (!demo) return;

    const refresh = $('[data-rpd-refresh]', demo);
    const time = $('[data-rpd-time]', demo);
    const poll = $('[data-rpd-poll]', demo);
    const summary = $('[data-rpd-summary]', demo);
    const connected = $('[data-rpd-connected]', demo);
    const offline = $('[data-rpd-offline]', demo);
    const onlineCount = $('[data-rpd-online-count]', demo);
    const theme = $('[data-rpd-theme]', demo);
    const filterButtons = $$('[data-rpd-filter]', demo);
    const cards = $$('[data-rpd-printer]', demo);
    const detection = $('[data-rpd-detection]', demo);
    const detectState = $('[data-rpd-detect-state]', demo);
    const detectCopy = $('[data-rpd-detect-copy]', demo);
    const power = $('[data-rpd-power]', demo);
    const prusaCard = $('.rpd-printer-card.online', demo);
    const prusaHeaderState = prusaCard ? $('.rpd-state', prusaCard) : null;
    const prusaPowerTitle = prusaCard ? $('.rpd-mini-panel.power h5', prusaCard) : null;
    const prusaPowerStatus = prusaCard ? $('.rpd-mini-panel.power > strong', prusaCard) : null;
    const prusaPowerCopy = prusaCard ? $('.rpd-mini-panel.power > p', prusaCard) : null;
    let poweredOn = true;

    function updateCounts() {
      const onlineCards = cards.filter((card) => card.dataset.rpdPrinter.split(/\s+/).includes('online'));
      const online = onlineCards.length;
      if (connected) connected.textContent = String(online);
      if (offline) offline.textContent = String(cards.length - online);
      if (onlineCount) onlineCount.textContent = String(online);
      if (summary) {
        summary.textContent = online === cards.length
          ? 'All configured printers are reachable.'
          : `${cards.length - online} printer${cards.length - online === 1 ? ' is' : 's are'} currently unreachable, but the connected fleet remains available.`;
      }
    }

    function setActiveTab(button) {
      $$('.rpd-tabs button', demo).forEach((peer) => peer.classList.toggle('active', peer === button));
      notify(`${button.textContent.trim()} is represented as a visual demo tab.`);
    }

    $$('.rpd-tabs button', demo).forEach((button) => {
      button.addEventListener('click', () => setActiveTab(button));
    });

    refresh?.addEventListener('click', () => {
      const stamp = formatTime();
      if (time) time.textContent = stamp;
      if (poll) poll.textContent = stamp;
      if (summary) summary.textContent = poweredOn
        ? 'Fleet refresh completed. Prusa Core One is reachable; Alpine and E3NG remain offline.'
        : 'Fleet refresh completed. All three configured printers are currently offline.';
      refresh.disabled = true;
      refresh.textContent = 'Refreshing…';
      window.setTimeout(() => {
        refresh.disabled = false;
        refresh.textContent = 'Refresh';
        notify('Print Orchestrator demo refreshed.');
      }, 650);
    });

    theme?.addEventListener('click', () => {
      const dim = demo.classList.toggle('is-dim');
      theme.textContent = dim ? '☾ Dim' : '☀ Light';
    });

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.rpdFilter;
        filterButtons.forEach((peer) => peer.classList.toggle('active', peer === button));
        cards.forEach((card) => {
          const states = card.dataset.rpdPrinter.split(/\s+/);
          card.hidden = filter !== 'all' && !states.includes(filter);
        });
      });
    });

    detection?.addEventListener('click', () => {
      const enabled = detection.getAttribute('aria-pressed') !== 'true';
      detection.setAttribute('aria-pressed', String(enabled));
      detection.classList.toggle('active', enabled);
      if (detectState) detectState.textContent = enabled ? 'Detection online' : 'Detection off';
      if (detectCopy) {
        detectCopy.textContent = enabled
          ? 'Primary camera · scan running every 5 seconds · score 0.079 · 17/3 confirmations.'
          : 'Primary camera · score 0.079 · clear ≤ 0.030 · part ≥ 0.065 · 17/3 confirmations.';
      }
      notify(enabled ? 'Part detection enabled for the demo.' : 'Part detection paused for the demo.');
    });

    power?.addEventListener('click', () => {
      poweredOn = !poweredOn;
      prusaCard?.classList.toggle('is-powered-off', !poweredOn);
      if (poweredOn) {
        prusaCard.dataset.rpdPrinter = 'online';
        if (prusaHeaderState) {
          prusaHeaderState.textContent = '◆ IDLE';
          prusaHeaderState.className = 'rpd-state idle';
        }
        if (prusaPowerTitle) prusaPowerTitle.textContent = 'ON';
        if (prusaPowerStatus) prusaPowerStatus.textContent = 'Plug online';
        if (prusaPowerCopy) prusaPowerCopy.textContent = 'Prusa Core One Outlet · 18.3 W · updated now';
        power.textContent = 'Safe power off';
        notify('Prusa Core One powered on in the mock-up.');
      } else {
        prusaCard.dataset.rpdPrinter = 'offline attention';
        if (prusaHeaderState) {
          prusaHeaderState.textContent = '◆ POWERED OFF';
          prusaHeaderState.className = 'rpd-state offline';
        }
        if (prusaPowerTitle) prusaPowerTitle.textContent = 'OFF';
        if (prusaPowerStatus) prusaPowerStatus.textContent = 'Plug off';
        if (prusaPowerCopy) prusaPowerCopy.textContent = 'Prusa Core One Outlet · 0.8 W standby estimate';
        power.textContent = 'Power on';
        notify('Safe power-off completed in the mock-up.');
      }
      updateCounts();
    });

    updateCounts();
  }

  // ------------------------------------------------------------------------
  // Higher-fidelity PFC Supervisor mock-up
  // ------------------------------------------------------------------------

  function initPfcDashboard() {
    const demo = $('[data-real-pfc-demo]');
    if (!demo) return;

    const tabs = $$('[data-rpc-tab]', demo);
    const views = $$('[data-rpc-view]', demo);
    const heading = $('[data-rpc-heading]', demo);
    const status = $('[data-rpc-status]', demo);
    const statusCopy = $('[data-rpc-status-copy]', demo);
    const load = $('[data-rpc-load]', demo);
    const automation = $('[data-rpc-automation]', demo);
    const wake = $('[data-rpc-wake]', demo);
    const sleep = $('[data-rpc-sleep]', demo);
    const sideSleep = $('[data-rpc-sleep-side]', demo);
    const policy = $('[data-rpc-policy]', demo);
    const refresh = $('[data-rpc-refresh]', demo);
    const cacheRefresh = $('[data-rpc-cache-refresh]', demo);
    const cacheAge = $('[data-rpc-cache-age]', demo);
    const cacheTime = $('[data-rpc-cache-time]', demo);
    const cacheState = $('[data-rpc-cache-state]', demo);
    let awake = true;
    let cacheSeconds = 38;

    const viewHeadings = {
      power: 'POWER MANAGEMENT',
      runtime: 'AI RUNTIME',
      cache: 'HERMES SCHEDULE CACHE',
      safety: 'SAFETY MATRIX',
    };

    function setView(name) {
      tabs.forEach((button) => {
        const active = button.dataset.rpcTab === name;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
      });
      views.forEach((view) => {
        const active = view.dataset.rpcView === name;
        view.hidden = !active;
        view.classList.toggle('active', active);
      });
      if (heading) heading.textContent = viewHeadings[name] || 'PFC CONTROL PLANE';
    }

    tabs.forEach((button) => button.addEventListener('click', () => setView(button.dataset.rpcTab)));

    function setPowerState(nextAwake) {
      awake = nextAwake;
      demo.classList.toggle('is-sleeping', !awake);
      if (status) status.textContent = awake ? 'Online' : 'Sleeping';
      if (statusCopy) statusCopy.textContent = awake
        ? 'PFP is reachable and reporting through the power ledger.'
        : 'The low-power Pi is retaining schedules, wake protection, and control-plane state.';
      if (load) load.textContent = awake ? '154.8 W' : '4.8 W';
      if (automation) automation.textContent = awake ? 'Automatic' : 'Sleep retained';
      if (sideSleep) sideSleep.textContent = awake ? 'Sleep PFP' : 'Wake PFP';
      notify(awake
        ? 'PFP wake sequence completed in the mock-up.'
        : 'PFP entered simulated sleep; Hermes protection remains on the Pi.');
    }

    wake?.addEventListener('click', () => setPowerState(true));
    sleep?.addEventListener('click', () => setPowerState(false));
    sideSleep?.addEventListener('click', () => setPowerState(!awake));

    policy?.addEventListener('click', () => {
      if (!awake) {
        notify('Policy result: keep sleeping. No protected job is due yet.');
        return;
      }
      if (automation) automation.textContent = 'Blocked';
      automation?.classList.remove('green');
      automation?.classList.add('yellow');
      if (statusCopy) statusCopy.textContent = 'Suspend was blocked because the Qwen runtime is still active.';
      notify('Policy evaluated: active AI runtime blocks suspend.');
      window.setTimeout(() => {
        if (automation) automation.textContent = 'Automatic';
        automation?.classList.add('green');
        automation?.classList.remove('yellow');
        if (statusCopy) statusCopy.textContent = 'PFP is reachable and reporting through the power ledger.';
      }, 3600);
    });

    refresh?.addEventListener('click', () => {
      refresh.disabled = true;
      refresh.textContent = 'Refreshing…';
      if (load && awake) load.textContent = `${(153.8 + Math.random() * 2.6).toFixed(1)} W`;
      window.setTimeout(() => {
        refresh.disabled = false;
        refresh.textContent = 'Refresh telemetry';
        notify('PFC telemetry refreshed.');
      }, 700);
    });

    cacheRefresh?.addEventListener('click', () => {
      cacheRefresh.disabled = true;
      cacheRefresh.textContent = 'Refreshing…';
      if (cacheState) cacheState.textContent = 'Syncing';
      window.setTimeout(() => {
        cacheSeconds = 0;
        if (cacheAge) cacheAge.textContent = '0s';
        if (cacheTime) cacheTime.textContent = formatTime();
        if (cacheState) cacheState.textContent = 'Fresh';
        cacheRefresh.disabled = false;
        cacheRefresh.textContent = 'Refresh cache';
        notify('Hermes schedule cache refreshed.');
      }, 800);
    });

    window.setInterval(() => {
      cacheSeconds += 1;
      if (cacheAge) cacheAge.textContent = cacheSeconds < 60 ? `${cacheSeconds}s` : `${Math.floor(cacheSeconds / 60)}m ${cacheSeconds % 60}s`;
      if (cacheState && cacheSeconds > 900) cacheState.textContent = 'Stale';
    }, 1000);
  }

  initPrintDashboard();
  initPfcDashboard();
})();
