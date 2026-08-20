/* ============================================================
   JOSEPH DWYER — portfolio-next  (app.js)
   Renders every section from data.js. No hard-coded content.
   ============================================================ */
(function () {
  "use strict";
  const D = window.PORTFOLIO;

  /* ---- image extension resolver (real files on disk) ---- */
  const IMG_PNG = new Set([
    "car-award","car-night-team","e3ng-cam","metuned-brand",
    "metuned-dash2","metuned-dash4","metuned-exploded","metuned-screen"
  ]);
  const SHOT_JPG = new Set([
    "coreone-printing","pfp-chassis-print","pfp-host-physical"
  ]);
  function imgPath(name, dir) {
    let ext;
    if (dir === "screenshots") ext = SHOT_JPG.has(name) ? ".jpg" : ".png";
    else ext = IMG_PNG.has(name) ? ".png" : ".jpg";
    return `assets/${dir}/${name}${ext}`;
  }
  // shots may be strings or {id, cap}
  const shotId = (s) => (typeof s === "string" ? s : s.id);
  const shotCap = (s) => (typeof s === "string" ? s : (s.cap || s.id));
  const esc = (s) => String(s).replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt2 = (n) => n.toFixed(2);
  const fmt3 = (n) => n.toFixed(2);

  /* ---- link chips ---- */
  function linkChips(links) {
    if (!links || !links.length) return "";
    return `<div class="link-chips">` + links.map((l) =>
      `<a class="chip" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`
    ).join("") + `</div>`;
  }

  /* ---- hero meta tags (validated V5 pattern) ---- */
  (function heroStats() {
    const el = document.getElementById("heroStats");
    if (!el) return;
    el.className = "hero-meta";
    const stats = [
      { b: "B70 / PFP", l: "local AI platform" },
      { b: "Small-business founder", l: "Metuned LLC · CDO" },
      { b: "3+", l: "motion platforms" },
      { b: "Fall 2026", l: "B.S. Mechanical Engineering" },
    ];
    el.innerHTML = stats.map((s) =>
      `<div><strong>${esc(s.b)}</strong><span>${esc(s.l)}</span></div>`
    ).join("");
  })();

  /* ---- systems map ---- */
  (function sysmap() {
    const el = document.getElementById("sysmap");
    if (!el) return;
    const c = D.systems.core;
    let html =
      `<div class="sysnode core">` +
      `<div class="core-badge">${esc(c.label)}</div>` +
      `<div><span class="sn-id">CORE NODE · ${esc(c.sub)}</span>` +
      `<span class="sn-label" style="font-size:15px">Everything routes through here</span>` +
      `<span class="sn-sub">Enterprise hardware, Fedora 44, 3D-printed chassis. Local-first: inference, control plane, and the agent layer all live on this tailnet.</span></div>` +
      `</div>`;
    D.systems.nodes.forEach((n) => {
      html +=
        `<div class="sysnode kind-${esc(n.kind)}">` +
        `<span class="sn-kind">${esc(n.kind).toUpperCase()}</span>` +
        `<span class="sn-id">NODE</span>` +
        `<span class="sn-label">${esc(n.label)}</span>` +
        `<span class="sn-sub">${esc(n.sub)}</span>` +
        `</div>`;
    });
    el.innerHTML = html;
  })();

  /* ---- generic tab bar builder ---- */
  function tabBar(tabs, activeId) {
    return `<div class="tab-bar" role="tablist">` + tabs.map((t) =>
      `<button class="tab-btn${t.id === activeId ? " active" : ""}" role="tab" data-tab="${esc(t.id)}">${esc(t.label)}</button>`
    ).join("") + `</div>`;
  }

  /* ---- workspaces ---- */
  (function workspaces() {
    const el = document.getElementById("wsList");
    if (!el) return;
    el.innerHTML = D.workspaces.map((w, wi) => {
      const facts = w.facts.map((f) =>
        `<div class="wfact"><span class="k">${esc(f.k)}</span><span class="v">${esc(f.v)}</span></div>`
      ).join("");
      const scope = w.scope.map((s) => `<li>${esc(s)}</li>`).join("");
      const power = (w.power || []).map((p) =>
        `<div class="ps-item"><b>${esc(p.v)}</b><span class="l">${esc(p.l)}</span><span class="s">${esc(p.s)}</span></div>`
      ).join("");

      const shots = w.shots || [];
      const gallery = shots.map((s) =>
        `<figure class="gitem"><a href="${imgPath(shotId(s), "screenshots")}" data-cap="${esc(w.name)} — ${esc(shotCap(s))}">` +
        `<img src="${imgPath(shotId(s), "screenshots")}" alt="${esc(shotCap(s))}" loading="lazy"></a>` +
        `<figcaption>${esc(shotCap(s))}</figcaption></figure>`
      ).join("");

      /* overview tab content */
      let overview = `<p class="ws-blurb">${esc(w.blurb)}</p>`;
      if (power) overview += `<div class="power-strip">${power}</div>`;
      if (w.noPhotos && w.whatIs) {
        overview += w.whatIs.map((b) =>
          `<div class="doc-block"><h4>${esc(b.h)}</h4><p>${esc(b.p)}</p></div>`
        ).join("");
        if (w.howIUse) overview += `<div class="doc-block"><h4>How I run it day to day</h4><ul class="ws-scope">${w.howIUse.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`;
        if (w.links) overview += linkChips(w.links);
      }
      overview += `<div class="ws-facts">${facts}</div>`;
      if (!w.noPhotos) overview += `<ul class="ws-scope">${scope}</ul>`;
      const docsTab = (w.docs || []).map((b) =>
        `<div class="doc-block"><h4>${esc(b.h)}</h4><p>${esc(b.p)}</p></div>`
      ).join("");

      const tabs = [{ id: "overview", label: "OVERVIEW" }];
      if (docsTab) tabs.push({ id: "docs", label: "DOCUMENTATION" });
      if (gallery) tabs.push({ id: "gallery", label: `GALLERY · ${shots.length}` });

      const panels =
        `<div class="tab-panel active" data-tab="overview">${overview}</div>` +
        (docsTab ? `<div class="tab-panel" data-tab="docs"><div class="doc-scroll">${docsTab}</div></div>` : "") +
        (gallery ? `<div class="tab-panel" data-tab="gallery"><div class="gallery-scroll"><div class="gallery-grid">${gallery}</div>` +
        (w.shotNote ? `<p class="shot-note">${esc(w.shotNote)}</p>` : "") + `</div></div>` : "");

      return (
        `<article class="ws accent-${esc(w.accent)} reveal" data-ws="${wi}">` +
        `<div class="ws-head">` +
        `<div><span class="ws-tag">${esc(w.tag)}</span><div class="ws-name" style="margin-top:12px">${esc(w.name)}</div></div>` +
        `<span class="ws-version">${esc(w.version)}</span>` +
        `</div>` +
        `<div class="ws-body">` +
        tabBar(tabs, "overview") +
        `<div class="tab-panels">${panels}</div>` +
        `</div>` +
        `</article>`
      );
    }).join("");
  })();

  /* ---- projects ---- */
  (function projects() {
    const el = document.getElementById("projGrid");
    if (!el) return;
    el.innerHTML = D.projects.map((p, pi) => {
      const main = imgPath(shotId(p.shots[0]), "images");
      const mainCap = esc(shotCap(p.shots[0]));
      const thumbs = p.shots.slice(1, 1 + (p.featured ? 4 : 3)).map((s) =>
        `<a href="${imgPath(shotId(s), "images")}" data-cap="${esc(p.name)} — ${esc(shotCap(s))}"><img src="${imgPath(shotId(s), "images")}" alt="${esc(shotCap(s))}" loading="lazy"></a>`
      ).join("");
      const facts = p.facts.map((f) => `<span>${esc(f)}</span>`).join("");
      return (
        `<article class="proj accent-${esc(p.accent)}${p.featured ? " featured" : ""} reveal">` +
        `<div class="proj-media"><span class="proj-cat">${esc(p.cat)}</span>` +
        `<a href="${main}" data-cap="${esc(p.name)} — ${mainCap}"><img src="${main}" alt="${esc(p.name)}" loading="lazy"></a></div>` +
        `<div class="proj-body">` +
        `<h3>${esc(p.name)}</h3>` +
        (p.role ? `<p class="proj-role">${esc(p.role)}</p>` : "") +
        `<p class="proj-blurb">${esc(p.blurb)}</p>` +
        `<div class="proj-facts">${facts}</div>` +
        (p.links && p.links.length ? linkChips(p.links) : "") +
        `<button class="btn btn-ghost btn-dossier" data-proj="${pi}">Open dossier — docs + gallery</button>` +
        `</div>` +
        (thumbs ? `<div class="proj-thumbs">${thumbs}</div>` : "") +
        `</article>`
      );
    }).join("");
  })();

  /* ---- project dossier modal ---- */
  (function dossier() {
    const wrap = document.createElement("div");
    wrap.className = "dossier";
    wrap.innerHTML =
      `<div class="dossier-backdrop"></div>` +
      `<div class="dossier-panel" role="dialog" aria-modal="true">` +
      `<div class="dossier-head"><div><span class="ws-tag" id="dCat"></span><div class="ws-name" id="dName" style="margin-top:8px"></div></div>` +
      `<button class="dossier-close" aria-label="Close">×</button></div>` +
      `<div class="dossier-body" id="dBody"></div>` +
      `</div>`;
    document.body.appendChild(wrap);
    const panel = wrap.querySelector(".dossier-panel");

    function open(pi) {
      const p = D.projects[pi];
      if (!p) return;
      wrap.querySelector("#dCat").textContent = p.cat;
      wrap.querySelector("#dName").textContent = p.name;
      const facts = p.facts.map((f) => `<span>${esc(f)}</span>`).join("");
      const docs = (p.docs || []).map((b) =>
        `<div class="doc-block"><h4>${esc(b.h)}</h4><p>${esc(b.p)}</p></div>`
      ).join("") + (p.docsDeliverables ?
        `<div class="doc-block"><h4>Deliverables</h4><ul class="deliverables">` +
        p.docsDeliverables.map((d) => {
          const img = d.img ? `<img class="dv-thumb" src="${esc(d.img)}" alt="${esc(d.title)}">` : "";
          return `<li>${img}<a href="${esc(d.href)}" target="_blank" rel="noopener">${esc(d.title)} ↗</a></li>`;
        }).join("") + `</ul></div>` : "") ||
        `<p class="muted">Full write-up lives in the engineering portfolio PDF.</p>`;
      const gallery = p.shots.map((s) =>
        `<figure class="gitem"><a href="${imgPath(shotId(s), "images")}" data-cap="${esc(p.name)} — ${esc(shotCap(s))}" class="doss-lb">` +
        `<img src="${imgPath(shotId(s), "images")}" alt="${esc(shotCap(s))}" loading="lazy"></a>` +
        `<figcaption>${esc(shotCap(s))}</figcaption></figure>`
      ).join("");
      const links = linkChips(p.links);
      const tabs = [{ id: "overview", label: "OVERVIEW" }, { id: "docs", label: "DOCUMENTATION" }, { id: "gallery", label: `GALLERY · ${p.shots.length}` }];
      wrap.querySelector("#dBody").innerHTML =
        tabBar(tabs, "overview") +
        `<div class="tab-panels">` +
        `<div class="tab-panel active" data-tab="overview"><p class="ws-blurb">${esc(p.blurb)}</p><div class="proj-facts dossier-facts">${facts}</div>${links}</div>` +
        `<div class="tab-panel" data-tab="docs"><div class="doc-scroll">${docs}</div></div>` +
        `<div class="tab-panel" data-tab="gallery"><div class="gallery-scroll"><div class="gallery-grid">${gallery}</div></div></div>` +
        `</div>`;
      wrap.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() { wrap.classList.remove("open"); document.body.style.overflow = ""; }
    wrap.addEventListener("click", (e) => {
      if (e.target.classList.contains("dossier-close") || e.target.classList.contains("dossier-backdrop")) close();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    document.addEventListener("click", (e) => {
      const b = e.target.closest("button.btn-dossier");
      if (b) open(+b.dataset.proj);
    });
  })();

  /* ---- benchmark bar (log-scaled for 19 t/s ↔ 202 t/s) ---- */
  function tpsBar(v, max, min) {
    if (!v || v <= 0) return "";
    const lo = Math.log10(min), hi = Math.log10(max);
    const pct = Math.max(4, Math.min(100, ((Math.log10(v) - lo) / (hi - lo)) * 100));
    return `<span class="tps-bar"><i style="width:${pct.toFixed(1)}%"></i></span>`;
  }

  /* ---- benchmarks ---- */
  (function benchmarks() {
    const el = document.getElementById("benchStack");
    if (!el) return;

    const lib = D.benchmarks.library;
    const libRows = lib.rows.map((r) =>
      `<tr><td class="model">${esc(r.model)}</td><td>${esc(r.role)}</td><td class="mono">${esc(r.ctx)}</td><td class="muted">${esc(r.note)}</td></tr>`
    ).join("");

    /* native */
    const nat = D.benchmarks.native;
    const natMax = Math.max(...nat.rows.map((r) => r[3]));
    const natMin = Math.min(...nat.rows.map((r) => r[3]));
    const natRows = nat.rows.map((r) =>
      `<tr><td class="model">${esc(r[0])}</td><td class="mono muted">${esc(r[1])}</td>` +
      `<td class="mono">${fmt2(r[2])}</td>` +
      `<td class="mono num">${fmt2(r[3])}</td>` +
      `<td class="bar-cell">${tpsBar(r[3], natMax, natMin)}</td></tr>`
    ).join("");
    const natFindings = nat.findings.map((f) => `<li>${esc(f)}</li>`).join("");

    /* mtp full spread */
    const mtp = D.benchmarks.mtp;
    // baseline decode + best decode per model
    const baseByModel = {}, bestByModel = {};
    mtp.rows.forEach((r) => {
      const m = r[0];
      if (r[1] === "baseline") baseByModel[m] = r[3];
      else bestByModel[m] = Math.max(bestByModel[m] || 0, r[3]);
    });
    let lastModel = null;
    const mtpRows = mtp.rows.map((r) => {
      const m = r[0], mode = r[1], dec = r[3];
      const showModel = m !== lastModel; lastModel = m;
      const base = baseByModel[m];
      const isBest = m !== null && bestByModel[m] === dec && dec > (base || 0);
      const isLoss = base != null && dec < base;
      const cls = isBest ? "win" : isLoss ? "loss" : "";
      return `<tr class="${cls}"><td class="model">${showModel ? esc(m) : ""}</td><td class="mono">${esc(mode)}</td>` +
        `<td class="mono">${fmt3(r[2])}</td><td class="mono num">${fmt3(dec)}</td>` +
        `<td class="mono">${r[4] == null ? "—" : esc(r[4])}</td>` +
        `<td class="mono ${isBest ? "win" : isLoss ? "loss" : "muted"}">${esc(r[5])}</td></tr>`;
    }).join("");
    const mtpFindings = mtp.findings.map((f) => `<li>${esc(f)}</li>`).join("");

    /* draft */
    const dr = D.benchmarks.draft;
    const drRows = dr.rows.map((r) =>
      `<tr><td class="model">${esc(r[0])}</td><td class="mono">${esc(r[1])}</td>` +
      `<td class="mono">${fmt2(r[2])}</td><td class="mono num">${fmt2(r[3])}</td>` +
      `<td class="mono">${esc(r[4])}</td></tr>`
    ).join("");
    const drFindings = dr.findings.map((f) => `<li>${esc(f)}</li>`).join("");

    const prod = D.benchmarks.prod;
    const prodRows = prod.rows.map((r) =>
      `<div class="k">${esc(r.k)}</div><div class="v">${esc(r.v)}</div>`
    ).join("");

    el.innerHTML =
      `<div class="panel bench reveal"><div class="bench-head"><h3>${esc(lib.title)}</h3></div>` +
      `<p class="bench-sub">${esc(lib.sub)}</p>` +
      `<div class="bench-scroll"><table class="bench-table"><thead><tr><th>Model</th><th>Role</th><th>Ctx</th><th>Note</th></tr></thead>` +
      `<tbody>${libRows}</tbody></table></div></div>` +

      `<div class="panel bench reveal"><div class="bench-head"><h3>${esc(nat.title)}</h3><span class="run-id">${esc(nat.run)}</span></div>` +
      `<p class="bench-sub">${esc(nat.sub)}</p>` +
      `<div class="bench-scroll"><table class="bench-table"><thead><tr>${nat.cols.map((c) => `<th>${esc(c)}</th>`).join("")}<th>gen bar</th></tr></thead>` +
      `<tbody>${natRows}</tbody></table></div>` +
      (nat.failed ? `<p class="bench-failed">⚠ ${esc(nat.failed)}</p>` : "") +
      `<ul class="findings">${natFindings}</ul></div>` +

      `<div class="panel bench reveal"><div class="bench-head"><h3>${esc(mtp.title)}</h3><span class="run-id">${esc(mtp.run)}</span></div>` +
      `<p class="bench-sub">${esc(mtp.sub)}</p>` +
      `<div class="bench-scroll"><table class="bench-table"><thead><tr>${mtp.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>` +
      `<tbody>${mtpRows}</tbody></table></div>` +
      `<ul class="findings">${mtpFindings}</ul></div>` +

      `<div class="panel bench reveal"><div class="bench-head"><h3>${esc(dr.title)}</h3><span class="run-id">${esc(dr.run)}</span></div>` +
      `<p class="bench-sub">${esc(dr.sub)}</p>` +
      `<div class="bench-scroll"><table class="bench-table"><thead><tr>${dr.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>` +
      `<tbody>${drRows}</tbody></table></div>` +
      `<ul class="findings">${drFindings}</ul></div>` +

      `<div class="panel bench reveal"><div class="bench-head"><h3>${esc(prod.title)}</h3></div>` +
      `<p class="bench-sub">${esc(prod.sub)}</p>` +
      `<div class="bench-kv">${prodRows}</div></div>`;
  })();

  /* ---- interactive helpers (ported from validated V5) ---- */
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

  /* ---- Print Orchestrator interactive replica ---- */
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

  /* ---- PFC Supervisor interactive replica ---- */
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

  /* ---- live systems (two interactive product stages) ---- */
  (function demos() {
    const el = document.getElementById("demoStages");
    if (!el) return;
    if (!document.getElementById("demoToast")) {
      const t = document.createElement("div");
      t.id = "demoToast"; t.className = "toast"; t.setAttribute("aria-live", "polite");
      document.body.appendChild(t);
    }
    const DEMO_STAGES_HTML = `<section class="product-stage orchestrator-stage real-system-stage" id="orchestrator">
<div class="product-stage-copy reveal">
<p class="eyebrow blue">Print Orchestrator</p>
<h2>One dashboard for a mixed printer fleet</h2>
<p>PrusaLink and Moonraker/Klipper machines report through one operator view, while each printer keeps its real capabilities and limits.</p>
<ul class="feature-list blue-list"><li>Printer, camera, power, job, and detection states stay separate</li><li>Machine-specific controls appear only where they are supported</li><li>Recovery language explains the problem and the next safe action</li></ul>
<p class="demo-note">Portfolio demo · private endpoints and real controls removed</p>
<div class="system-links">
<a class="button button-blue magnetic" href="#workspaces">Open project</a>
<a class="button button-ghost-dark magnetic" href="assets/screenshots/po-fleet.png" rel="noreferrer" target="_blank">View the real dashboard capture</a>
</div>
</div>
<div class="demo-frame real-orch-frame reveal" data-real-orch-demo="">
<header class="rpd-topbar">
<div class="rpd-brand"><span>PD</span><strong>Print Dashboard</strong><small>fabrication systems / live fleet control</small></div>
<div class="rpd-top-actions">
<span class="rpd-chip online"><i></i> API online</span>
<span class="rpd-chip">Updated <b data-rpd-time="">9:08:37 AM</b></span>
<button class="rpd-chip" data-rpd-theme="" type="button">☀ Light</button>
<span class="rpd-chip">Notifications <b class="rpd-bubble">36</b></span>
<span class="rpd-chip rpd-user">Print Orchestrator Administrator <b>ADMINISTRATOR</b></span>
<button class="rpd-refresh" data-rpd-refresh="" type="button">Refresh</button>
</div>
</header>
<nav aria-label="Print dashboard demo navigation" class="rpd-tabs">
<button class="active" type="button">Fleet</button>
<button type="button">Jobs</button>
<button type="button">Server</button>
<button type="button">Power</button>
<button type="button">Failure detection</button>
<button type="button">Files</button>
<button type="button">Hermes chat</button>
<button type="button">Admin</button>
</nav>
<div class="rpd-scroll">
<section class="rpd-overview">
<div class="rpd-overview-main">
<p>Print Orchestrator / Fleet overview</p>
<h3><span data-rpd-online-count="">1</span> of 3 printers online</h3>
<strong data-rpd-summary="">Two printers are currently unreachable, but the connected fleet remains available.</strong>
<div class="rpd-summary-grid">
<article><span>Configured</span><b>3</b><small>printers</small></article>
<article><span>Connected</span><b data-rpd-connected="">1</b><small>reachable now</small></article>
<article><span>Printing</span><b>0</b><small>active jobs</small></article>
<article><span>Paused</span><b>0</b><small>awaiting action</small></article>
<article><span>Offline</span><b data-rpd-offline="">2</b><small>unreachable</small></article>
</div>
</div>
<aside class="rpd-network">
<p>System state</p><h4>Machine network</h4>
<dl>
<div><dt>Dashboard API</dt><dd class="ok">Online</dd></div>
<div><dt>Auto refresh</dt><dd>Status 10s · telemetry 0.75s</dd></div>
<div><dt>Last successful poll</dt><dd data-rpd-poll="">9:08:37 AM</dd></div>
<div><dt>Signed in</dt><dd>Administrator</dd></div>
</dl>
</aside>
</section>
<section class="rpd-printers">
<div class="rpd-printer-head">
<div><h3>Printers</h3><p>Power, connectivity, jobs, cameras, and detection are shown as separate machine states.</p></div>
<div aria-label="Filter demo printers" class="rpd-filter-group" role="group">
<button class="active" data-rpd-filter="all" type="button">All</button>
<button data-rpd-filter="online" type="button">Online</button>
<button data-rpd-filter="attention" type="button">Needs attention</button>
<button data-rpd-filter="offline" type="button">Offline</button>
</div>
</div>
<div class="rpd-layout-bar">
<label>Sort<select><option>Manual order</option><option>Name</option><option>Status</option></select></label>
<label>New cards<select><option>Standard</option><option>Compact</option></select></label>
<button type="button">Edit layout</button><button disabled="" type="button">Save layout</button>
<span>Layout saved to your account</span>
</div>
<div class="rpd-printer-grid">
<article class="rpd-printer-card online" data-rpd-printer="online">
<header><div><h4>Prusa Core One</h4><small>PRUSALINK · updated just now</small></div><span class="rpd-state idle">◆ IDLE</span></header>
<div class="rpd-camera"><img alt="Live printer camera preview represented with an existing project photo" loading="lazy" src="assets/images/e3ng-cam.png"/><span>● live snapshot · primary camera</span><button type="button">Rotate 180°</button></div>
<section class="rpd-mini-panel detection">
<div><p>Part detection</p><h5 data-rpd-detect-state="">Detection off</h5></div>
<button aria-pressed="false" class="rpd-toggle" data-rpd-detection="" type="button"><i></i></button>
<p data-rpd-detect-copy="">Primary camera · score 0.079 · clear ≤ 0.030 · part ≥ 0.065 · 17/3 confirmations</p>
</section>
<section class="rpd-mini-panel power">
<div><p>Power</p><h5>ON</h5></div><strong>Plug online</strong>
<p>Prusa Core One Outlet · 18.3 W · updated now</p>
<button data-rpd-power="" type="button">Safe power off</button>
</section>
<section class="rpd-job"><strong>No active job</strong><b>0.0%</b><i></i><div><span>Elapsed<br/>—</span><span>Remaining<br/>—</span><span>Estimated total<br/>—</span></div></section>
<section class="rpd-temp-grid"><article><span>◆ Nozzle</span><b>19.0°C</b><small>stable</small></article><article><span>◆ Bed</span><b>17.9°C</b><small>stable</small></article><article><span>◆ Chamber</span><b>0.0°C</b><small>stable</small></article></section>
<footer><button type="button">Home axes</button><button class="danger" type="button">Emergency stop</button><a href="#workspaces">Project details ↓</a></footer>
</article>
<article class="rpd-printer-card offline" data-rpd-printer="offline attention">
<header><div><h4>Alpine</h4><small>MOONRAKER / KLIPPER · updated 9.5s ago</small></div><span class="rpd-state offline">◆ DISCONNECTED</span></header>
<div class="rpd-camera empty"><span>Loading camera snapshot…</span></div>
<section class="rpd-mini-panel detection"><div><p>Part detection</p><h5>Detection offline</h5></div><button aria-pressed="true" class="rpd-toggle active" type="button"><i></i></button><p>Primary camera · score 0.000 · clear ≤ 0.035 · waiting for first scan.</p></section>
<section class="rpd-mini-panel power"><div><p>Power</p><h5>PLUG OFFLINE</h5></div><strong>Plug offline</strong><p>Alpine Outlet · last update 9s ago</p><button disabled="" type="button">Plug unavailable</button></section>
<section class="rpd-console"><div><p>Klipper console card</p><strong>Show a movable console on the Fleet page</strong></div><button aria-pressed="true" class="rpd-toggle active" type="button"><i></i></button></section>
<section class="rpd-alert">△ Disconnected</section>
<section class="rpd-job"><strong>No active job</strong><b>0.0%</b><i></i><div><span>Elapsed<br/>—</span><span>Remaining<br/>—</span><span>Estimated total<br/>—</span></div></section>
<section class="rpd-temp-grid"><article><span>◆ Nozzle</span><b>0.0°C</b><small>offline</small></article><article><span>◆ Bed</span><b>0.0°C</b><small>offline</small></article><article><span>◆ Chamber</span><b>0.0°C</b><small>offline</small></article></section>
<footer><span>No active controls</span><a href="#workspaces">Project details ↓</a></footer>
</article>
<article class="rpd-printer-card offline" data-rpd-printer="offline attention">
<header><div><h4>E3NG</h4><small>MOONRAKER / KLIPPER · updated 8.5s ago</small></div><span class="rpd-state offline">◆ DISCONNECTED</span></header>
<div class="rpd-camera empty"><span>No camera configured</span></div>
<section class="rpd-mini-panel detection"><div><p>Part detection</p><h5>Needs setup</h5></div><button aria-pressed="false" class="rpd-toggle" type="button"><i></i></button><p>No enabled camera is configured for part detection.</p></section>
<section class="rpd-mini-panel power"><div><p>Power</p><h5>NOT MAPPED</h5></div><strong>Unconfigured</strong><p>No Kasa plug is mapped to this printer.</p><button disabled="" type="button">Configure in Admin</button></section>
<section class="rpd-console"><div><p>Klipper console card</p><strong>Show a movable console on the Fleet page</strong></div><button aria-pressed="true" class="rpd-toggle active" type="button"><i></i></button></section>
<section class="rpd-alert">△ Disconnected</section>
<section class="rpd-job"><strong>No active job</strong><b>0.0%</b><i></i><div><span>Elapsed<br/>—</span><span>Remaining<br/>—</span><span>Estimated total<br/>—</span></div></section>
<section class="rpd-temp-grid"><article><span>◆ Nozzle</span><b>0.0°C</b><small>offline</small></article><article><span>◆ Bed</span><b>0.0°C</b><small>offline</small></article><article><span>◆ Chamber</span><b>0.0°C</b><small>offline</small></article></section>
<footer><span>No active controls</span><a href="#workspaces">Project details ↓</a></footer>
</article>
</div>
</section>
</div>
</div>
</section>
<section class="product-stage pfc-stage real-system-stage" id="pfc">
<div class="product-stage-copy reveal">
<p class="eyebrow green">PFC Supervisor</p>
<h2>Let the AI server sleep without missing scheduled work</h2>
<p>A low-power Pi keeps wake protection, schedules, status, and recovery logic available while the main server sleeps through long idle windows.</p>
<div class="pfc-savings-callout">
<article><strong>13.19 kWh</strong><span>avoided over the current seven-day ledger</span></article>
<article><strong>95.0 hours</strong><span>of observed sleep retained in history</span></article>
<article><strong>$290.54 / yr</strong><span>current annual projection from the dashboard</span></article>
</div>
<p class="savings-caveat">Sleep time is observed from retained state history. Avoided energy and dollar values remain estimates until direct host metering is added.</p>
<ul class="feature-list green-list"><li>Checks active workloads and safety rules before suspend</li><li>Keeps Hermes schedules cached on the low-power Pi</li><li>Tracks observed sleep beside estimated energy savings</li></ul>
<div class="system-links">
<a class="button button-green magnetic" href="#workspaces">Open project</a>
<a class="button button-ghost-green magnetic" href="assets/screenshots/pfc-power-management.png" rel="noreferrer" target="_blank">View the real control panel</a>
</div>
</div>
<div class="demo-frame real-pfc-frame reveal" data-real-pfc-demo="">
<aside class="rpc-sidebar">
<div class="rpc-logo"><strong>PFC <span>CONTROL</span><br/>PLANE</strong><small>09 // PFC</small></div>
<nav aria-label="PFC demo navigation">
<span>Console</span>
<button class="active" type="button">○ Overview</button><button type="button">○ Infrastructure</button><button type="button">○ Workloads</button><button type="button">○ Operations</button><button type="button">○ Administration</button><button type="button">○ Mobile</button>
</nav>
<div class="rpc-side-meta"><span>POWER-STATE ORCHESTRATION</span><strong>Interface</strong><div><label>Theme<select><option>Dark</option></select></label><label>Motion<select><option>System</option></select></label></div></div>
<div class="rpc-auth"><span><i></i> Authenticated</span><strong>Yonchers</strong><small>owner</small><div><button data-rpc-sleep-side="" type="button">Sleep PFP</button><button type="button">Sign out</button></div></div>
</aside>
<main class="rpc-main">
<header class="rpc-main-head">
<div><p>POWER AUTOMATION · ENERGY LEDGER</p><h3 data-rpc-heading="">POWER MANAGEMENT</h3></div>
<span>PFC // DISTRIBUTED OPERATIONS SURFACE</span>
</header>
<nav aria-label="PFC demo views" class="rpc-subtabs" role="tablist">
<button aria-selected="true" class="active" data-rpc-tab="power" role="tab" type="button">Command Center</button>
<button aria-selected="false" data-rpc-tab="runtime" role="tab" type="button">AI Runtime</button>
<button aria-selected="false" data-rpc-tab="cache" role="tab" type="button">Hermes Cache</button>
<button aria-selected="false" data-rpc-tab="safety" role="tab" type="button">Safety Matrix</button>
</nav>
<div class="rpc-scroll">
<section class="rpc-view active" data-rpc-view="power">
<div class="rpc-command-card">
<div class="rpc-command-copy"><p>— PFP POWER COMMAND CENTER</p><h4 data-rpc-status="">Online</h4><span data-rpc-status-copy="">PFP is reachable and reporting through the power ledger.</span><div><button data-rpc-wake="" type="button">Wake PFP</button><button class="danger" data-rpc-sleep="" type="button">Sleep PFP</button><button data-rpc-policy="" type="button">Evaluate policy</button><button data-rpc-refresh="" type="button">Refresh telemetry</button></div></div>
<div class="rpc-command-metrics">
<article><span>Automation</span><strong class="green" data-rpc-automation="">Automatic</strong><small>blocked · wake armed · suspend armed</small></article>
<article><span>Combined load</span><strong data-rpc-load="">154.8 W</strong><small>PFP 150.0 W estimated · Pi 4.8 W estimated</small></article>
<article><span>Seven-day avoided</span><strong>13.19 kWh</strong><small>$4.62 net avoided · PFP avoidance 13.77 kWh</small></article>
<article><span>Observed sleep</span><strong>95.0 h</strong><small>Pi-retained state history</small></article>
<article><span>Next execution</span><strong class="green">9h 19m</strong><small>Evening Brief · 6:30 PM</small></article>
<article><span>Suspend safety</span><strong class="yellow">Interlocked</strong><small>recommendation: blocked</small></article>
</div>
</div>
<div class="rpc-two-col">
<section class="rpc-panel allocation-panel"><p>— CURRENT WORKLOAD ATTRIBUTION</p><h4>Modeled PFP Power Allocation</h4><span>Current wall power is allocated with activity weights from CPU, GPU, AI, Minecraft, and Print Orchestrator telemetry.</span><div class="rpc-allocation"><article><label>Base host <b>30.0 W · 20.0%</b></label><i style="--w:20%"></i></article><article><label>AI runtime <b>93.7 W · 62.4%</b></label><i style="--w:62.4%"></i></article><article><label>Minecraft <b>0.0 W · 0.0%</b></label><i style="--w:0%"></i></article><article><label>Print control <b>14.6 W · 9.8%</b></label><i style="--w:9.8%"></i></article><article><label>Other workload <b>11.7 W · 7.8%</b></label><i style="--w:7.8%"></i></article></div></section>
<aside class="rpc-panel blocker-panel"><p>— ACTIVE SUSPEND BLOCKERS</p><div class="rpc-code">AI runtime is active.<br/>Qwen3.6 endpoint is serving locally.<br/>GPU offload policy is required.<br/><br/>Decision: keep PFP awake until the workload clears.</div></aside>
</div>
<section class="rpc-panel savings-panel">
<div class="rpc-panel-head"><div><p>— ENERGY INTELLIGENCE · 30 DAYS</p><h4>What the idle-time policy is saving</h4><span>The ledger separates actual consumption, estimated avoided energy, and the always-on baseline so the estimate is inspectable.</span></div><span class="rpc-badge yellow">● collecting</span></div>
<div class="rpc-savings-kpis"><article><span>Average daily load</span><strong>1.33 kWh</strong></article><article><span>Average daily saved</span><strong>2.27 kWh</strong></article><article class="emphasis"><span>Projected 30-day saved</span><strong>68.23 kWh</strong><small>$23.88</small></article><article><span>Projected annual value</span><strong>$290.54</strong></article><article><span>Net efficiency</span><strong>63.2%</strong></article><article><span>Wake / sleep cycles</span><strong>45 / 45</strong></article></div>
<div aria-label="Seven-day actual and avoided energy chart" class="rpc-energy-chart"><div class="rpc-chart-legend"><span><i class="actual"></i>Actual</span><span><i class="avoided"></i>Avoided</span><span><i class="baseline"></i>Baseline</span></div><div class="rpc-bars"><article><i class="avoided" style="--h:92%"></i><i class="actual" style="--h:12%"></i><span>Fri<small>0.314 kWh</small></span></article><article><i class="avoided" style="--h:94%"></i><i class="actual" style="--h:9%"></i><span>Sat<small>0.210 kWh</small></span></article><article><i class="avoided" style="--h:91%"></i><i class="actual" style="--h:16%"></i><span>Sun<small>0.451 kWh</small></span></article><article><i class="avoided" style="--h:62%"></i><i class="actual" style="--h:71%"></i><span>Mon<small>2.57 kWh</small></span></article><article><i class="avoided" style="--h:68%"></i><i class="actual" style="--h:64%"></i><span>Tue<small>2.29 kWh</small></span></article><article><i class="avoided" style="--h:60%"></i><i class="actual" style="--h:72%"></i><span>Wed<small>2.57 kWh</small></span></article><article><i class="avoided" style="--h:4%"></i><i class="actual" style="--h:42%"></i><span>Thu<small>1.41 kWh</small></span></article></div></div>
<p class="rpc-caveat"><strong>Measurement note:</strong> most PFP energy is currently estimated from configured wattage baselines. A direct meter source will improve attribution and savings accuracy.</p>
</section>
</section>
<section class="rpc-view" data-rpc-view="runtime" hidden="">
<section class="rpc-panel runtime-summary"><p>— RUNTIME FLEET</p><div class="rpc-runtime-banner"><h4>2 model runtimes online</h4><span>2 systemd · 0 managed</span><strong>All Ready</strong></div></section>
<div class="rpc-runtime-grid"><article><p>— PRIMARY ROUTE · ADOPTED SYSTEMD SERVICE</p><h4>Qwen3.6-35B-A3B-UD-Q5_K_XL</h4><span class="rpc-badge">● endpoint ready</span><dl><div><dt>Endpoint</dt><dd>local · /v1</dd></div><div><dt>Backend</dt><dd>llama.cpp GGUF</dd></div><div><dt>Context</dt><dd>196608</dd></div><div><dt>GPU layers</dt><dd>99</dd></div><div><dt>Identity source</dt><dd class="green">Live /props · authoritative</dd></div></dl></article><article><p>— AUXILIARY ROUTE · ADOPTED SYSTEMD SERVICE</p><h4>gemma-4-E4B-it-UD-Q4_K_XL</h4><span class="rpc-badge">● endpoint ready</span><dl><div><dt>Endpoint</dt><dd>local · /v1 (aux)</dd></div><div><dt>Backend</dt><dd>llama.cpp GGUF</dd></div><div><dt>Context</dt><dd>131072</dd></div><div><dt>GPU layers</dt><dd>0</dd></div><div><dt>Identity source</dt><dd class="green">Live /props · authoritative</dd></div></dl></article></div>
<section class="rpc-panel telemetry-panel"><p>— LIVE INFERENCE ACTIVITY</p><h4>Prompt and generation telemetry</h4><span>Endpoint telemetry separates prompt processing, queued work, and generation without rescanning the model inventory.</span><div><article><strong>Qwen3.6</strong><span>Prompt 0.00 tok/s</span><span>Generation 0.00 tok/s</span><span>Idle</span></article><article><strong>Gemma E4B</strong><span>Prompt 0.00 tok/s</span><span>Generation 0.00 tok/s</span><span>Idle</span></article></div></section>
<section class="rpc-panel recovery-panel"><p>— WAKE &amp; GPU RECOVERY</p><h4>Runtime reconciliation</h4><span>Qwen is only accepted as healthy after endpoint, process, model identity, and required Intel GPU offload checks pass.</span><div class="rpc-warning">Qwen3.6-35B-A3B-UD-Q5_K_XL: GPU offload verification is required before the runtime can be accepted.</div><div class="rpc-button-row"><button type="button">Reconcile active runtimes</button><button type="button">Prepare for suspend</button><button type="button">Restore after wake</button></div></section>
</section>
<section class="rpc-view" data-rpc-view="cache" hidden="">
<section class="rpc-panel cache-panel"><div class="rpc-panel-head"><div><p>— HERMES CRON SCHEDULE CACHE</p><h4>Wake protection retained on the Pi</h4><span>Cached jobs stay visible and continue protecting scheduled execution while PFP is asleep or temporarily unreachable.</span></div><button data-rpc-cache-refresh="" type="button">Refresh cache</button></div><div class="rpc-cache-kpis"><article><span>Cache state</span><strong data-rpc-cache-state="">Fresh</strong></article><article><span>Jobs cached</span><strong>5</strong></article><article><span>Cache age</span><strong data-rpc-cache-age="">38s</strong></article><article><span>Last success</span><strong data-rpc-cache-time="">9:09:59 AM</strong></article><article><span>Source</span><strong>Hermes cron list</strong></article></div><div class="rpc-table-wrap"><table><thead><tr><th>Job</th><th>Execution</th><th>Wake dispatch</th><th>Protected until</th></tr></thead><tbody><tr><td>Evening Brief</td><td>8/13/2026, 6:30 PM</td><td>6:20 PM</td><td>6:50 PM</td></tr><tr><td>nightly-data-scan</td><td>8/14/2026, 2:00 AM</td><td>1:50 AM</td><td>2:20 AM</td></tr><tr><td>Morning Brief</td><td>8/14/2026, 7:00 AM</td><td>6:50 AM</td><td>7:20 AM</td></tr><tr><td>weekly-side-hustle-intel</td><td>8/14/2026, 7:00 AM</td><td>6:50 AM</td><td>7:20 AM</td></tr><tr><td>Monthly Deep Analysis</td><td>9/1/2026, 1:00 AM</td><td>12:50 AM</td><td>1:20 AM</td></tr></tbody></table></div></section>
<section class="rpc-panel timeline-panel"><p>— DAILY AUTO-ON / AUTO-OFF TIMELINE</p><h4>Thursday, August 13</h4><span>Green shows observed online time. Yellow protects scheduled jobs. Dark space is eligible sleep time.</span><div class="rpc-timeline"><div class="planned"><b>Planned</b><i class="sleep"></i><i class="job"></i><i class="sleep tail"></i></div><div class="observed"><b>Observed</b><i class="online"></i><i class="sleep tail"></i></div></div><p>Planned online 0.5 h · sleep 23.5 h · projected combined 0.277 kWh including Pi 0.084 kWh · net avoided 3.32 kWh ($1.16).</p></section>
</section>
<section class="rpc-view" data-rpc-view="safety" hidden="">
<section class="rpc-panel safety-panel"><div class="rpc-panel-head"><div><p>— SUSPEND DECISION ENGINE</p><h4>Subsystem Eligibility Matrix</h4><span>Unknown and stale states are explicit. With the safety default enabled, either state blocks automatic suspend.</span></div><span class="rpc-badge yellow">● blocked</span></div><div class="rpc-eligibility"><article class="eligible"><b>ELIGIBLE</b><strong>Host telemetry</strong><span>Host-state telemetry is current.</span><small>power-history</small></article><article class="eligible"><b>ELIGIBLE</b><strong>Protected schedule</strong><span>No availability or Hermes protection interval is active.</span><small>policy</small></article><article class="eligible"><b>ELIGIBLE</b><strong>Minimum awake period</strong><span>Minimum awake duration has elapsed.</span><small>runtime</small></article><article class="eligible"><b>ELIGIBLE</b><strong>Automation pause</strong><span>No temporary automation pause is active.</span><small>policy</small></article><article class="eligible"><b>ELIGIBLE</b><strong>Inhibition leases</strong><span>No active inhibition leases.</span><small>lease-store</small></article><article class="blocked"><b>BLOCKED</b><strong>PFP workload interlock</strong><span>AI runtime is active and the GPU-offload requirement is still in force.</span><small>pfp-host-control</small></article><article class="eligible"><b>ELIGIBLE</b><strong>Daily suspend-cycle limit</strong><span>Cycle budget 0/12.</span><small>runtime</small></article></div></section>
<section class="rpc-panel advisory-panel"><p>— PREDICTIVE RECOMMENDATIONS</p><h4>Advisory Schedule Intelligence</h4><span>Recommendations come from retained wake and sleep transitions and never change policy without an explicit save.</span><div><article><strong>Common Tuesday sleep time</strong><p>PFP often becomes idle near 17:15. Review the end of that day's availability window.</p><small>41% confidence · 13 observations · advisory only</small></article><article><strong>Common Monday wake time</strong><p>PFP often wakes near 10:45. Consider an availability window starting 10 minutes earlier.</p><small>41% confidence · 13 observations · advisory only</small></article></div></section>
</section>
</div>
</main>
</div>
</section>`;
    el.innerHTML = DEMO_STAGES_HTML;
    initPrintDashboard();
    initPfcDashboard();
  })();

  /* ---- experience ---- */
  (function experience() {
    const tl = document.getElementById("expTimeline");
    const edu = document.getElementById("eduPanel");
    const sk = document.getElementById("skillsPanel");
    if (tl) tl.innerHTML = D.experience.map((e) =>
      `<div class="exp-item kind-${esc(e.kind)}">` +
      `<div class="exp-role">${esc(e.role)}</div>` +
      `<div class="exp-org">${esc(e.org)}</div>` +
      `<div class="exp-span">${esc(e.span)}</div>` +
      `<p class="exp-body">${esc(e.body)}</p>` +
      `</div>`
    ).join("");
    if (edu) edu.innerHTML =
      `<h4>Education</h4>` + D.education.map((e) =>
        `<div class="edu-item"><div class="edu-school">${esc(e.school)}</div>` +
        `<div class="edu-deg">${esc(e.deg)}</div>` +
        `<div class="edu-meta">${esc(e.span)}${e.gpa ? " · " + esc(e.gpa) : ""}${e.cert ? " · " + esc(e.cert) : ""}</div>` +
        `</div>`
      ).join("");
    if (sk) sk.innerHTML =
      `<h4>Skills</h4>` + D.skills.map((g) =>
        `<div class="skill-group"><div class="sg-name">${esc(g.g)}</div>` +
        `<div class="sg-items">${esc(g.items)}</div></div>`
      ).join("");
  })();

  /* ---- lightbox (also covers dossier gallery via .doss-lb) ---- */
  (function lightbox() {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `<button class="lb-close" aria-label="Close">×</button><img alt=""><div class="lb-cap"></div>`;
    document.body.appendChild(lb);
    const img = lb.querySelector("img");
    const cap = lb.querySelector(".lb-cap");
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href^='assets/']");
      if (!a) return;
      e.preventDefault();
      img.src = a.getAttribute("href");
      cap.textContent = a.dataset.cap || "";
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    });
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  })();

  /* ---- tab switching (workspaces + dossiers) ---- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    const bar = btn.closest(".tab-bar");
    const scope = bar.closest(".ws-body, .dossier-body");
    if (!scope) return;
    const id = btn.dataset.tab;
    bar.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === id));
    scope.querySelectorAll(":scope .tab-panels > .tab-panel").forEach((p) =>
      p.classList.toggle("active", p.dataset.tab === id)
    );
  });

  /* ---- scroll reveal (respects reduced-motion) ---- */
  (function reveal() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = document.querySelectorAll(".reveal");
    if (reduce || typeof window.IntersectionObserver !== "function") {
      items.forEach((i) => i.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach((i) => io.observe(i));
  })();

  /* ---- footer year ---- */
  const y = document.getElementById("footYear");
  if (y) y.textContent = new Date().getFullYear();
})();
