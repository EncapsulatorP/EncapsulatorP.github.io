/* Gemini (Neon) · RG micro-lattice & Hopf detector.
 * Ported from the c3.2z "Living SPEC & Prime Forms" workspace, tab 1 (drawRG, dimensionState,
 * renderDimension, paintDimension). Same rules and defaults; Atlas palette; no network, no eval.
 */
(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const root = byId('rg-hopf');
  if (!root) return;
  if (window.parent !== window) document.documentElement.classList.add('ix-embedded');

  // ---- Shared constants (verbatim from the source) ----
  const C = 299792458n;
  const heights = [0, 0, 1, 1, 2, 1, 2, 1, 3, 2];
  const families = [
    { label: 'Metric', rows: [['ms', 'm/s', 1, 1, 1], ['kms', 'km/s', 1000, 1, 1], ['cms', 'cm/s', 1, 100, 1], ['mms', 'mm/s', 1, 1000, 1], ['mns', 'm/ns', 1, 1, 1000000000, true], ['kmh', 'km/h', 1000, 1, 3600]] },
    { label: 'US customary', rows: [['ins', 'in/s', 127, 5000, 1], ['fts', 'ft/s', 381, 1250, 1], ['yds', 'yd/s', 1143, 1250, 1], ['mis', 'mi/s', 201168, 125, 1], ['mph', 'mph', 201168, 125, 3600]] },
    { label: 'Nautical', rows: [['nmis', 'nmi/s', 1852, 1, 1], ['kn', 'kn', 1852, 1, 3600]] },
    { label: 'Normalized', rows: [['norm', 'c/c', 299792458, 1, 1]] }
  ];
  const RG_META = [
    { scale: '10⁻³⁵ m', state: 'Discrete', block: 1, desc: 'Layer 0 · Planck-scale label. The raw 32 × 32 field, seeded by prime-factor tower heights of the digits and the Odd Mirror Knot amplitude. Every node fluctuates independently.' },
    { scale: '10⁻¹⁸ m', state: 'Quantum fields', block: 2, desc: 'Layer 1 · 2 × 2 block averages. Neighbouring nodes merge into a smoother field.' },
    { scale: '10⁻⁶ m', state: 'Classical', block: 4, desc: 'Layer 2 · 4 × 4 block averages. Most node-to-node interference is averaged out.' },
    { scale: '10⁰ m', state: 'Thermodynamic', block: 8, desc: 'Layer 3 · 8 × 8 macro-gradient. Only a 4 × 4 field of averages remains; individual nodes are no longer recoverable.' }
  ];
  // Gemini's four-step instrument ramp, in the Atlas palette (low → peak).
  const RAMP = ['#cdd3e6', '#7f97de', '#284cad', '#ee9a12'];

  function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
  function expand(n, d) {
    const common = gcd(n, d); n /= common; d /= common;
    const whole = String(n / d), seen = new Map();
    let remainder = n % d, digits = '';
    while (remainder && !seen.has(remainder)) { seen.set(remainder, digits.length); remainder *= 10n; digits += String(remainder / d); remainder %= d; }
    const start = remainder ? seen.get(remainder) : digits.length;
    return { n, d, whole, prefix: digits.slice(0, start), cycle: digits.slice(start) };
  }
  function fractionWindow(v, count) {
    if (!v.cycle) return v.prefix.slice(0, count);
    return (v.prefix + v.cycle.repeat(Math.ceil(count / v.cycle.length))).slice(0, count);
  }
  const towerHeight = (d, raw) => raw ? heights[d] : Math.min(2, heights[d]);
  const knotAttractors = (r, e) => r <= 1 ? [0] : [-Math.sqrt((r - 1) / e), Math.sqrt((r - 1) / e)];

  const units = new Map();
  const unitSelects = [byId('rg-unit'), byId('hopf-unit')];
  for (const family of families) {
    const groups = unitSelects.map(select => { const g = document.createElement('optgroup'); g.label = family.label; select.append(g); return g; });
    for (const [id, label, mN, mD, time, ns] of family.rows) {
      const val = ns ? expand(C, BigInt(time)) : expand(C * BigInt(time) * BigInt(mD), BigInt(mN));
      units.set(id, { ...val, label });
      groups.forEach(g => { const o = document.createElement('option'); o.value = id; o.textContent = label; g.append(o); });
    }
  }
  let selected = 'ms';
  const PRECISION = 9;
  function visibleDigits() { const u = units.get(selected); return u.whole + fractionWindow(u, PRECISION); }

  // ---- RG micro-lattice ----
  const rgCanvas = byId('rg-canvas'), rgWrap = byId('rg-stage');
  const microField = new Float32Array(1024);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let playing = !reduced, animTime = 0, lastTs = 0, raf = 0, visible = true, remoteActive = window.parent === window;

  function drawRG(t) {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const w = rgWrap.clientWidth || 720, h = rgWrap.clientHeight || 420;
    if (rgCanvas.width !== Math.round(w * ratio) || rgCanvas.height !== Math.round(h * ratio)) { rgCanvas.width = Math.round(w * ratio); rgCanvas.height = Math.round(h * ratio); }
    const ctx = rgCanvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    const sc = Number(byId('rg-scale').value), meta = RG_META[sc];
    const raw = byId('rg-uncap').checked;
    const digs = [...visibleDigits()].map(d => towerHeight(d, raw) / 3);
    const dLen = digs.length || 1;
    const kR = Number(byId('rg-knot-r').value), kE = Number(byId('rg-knot-e').value);
    const roots = knotAttractors(kR, kE), knotAmp = roots.length === 2 ? roots[1] : 0.25;

    let s0 = 0, sq0 = 0;
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      const hA = digs[(x + y * 3) % dLen], hB = digs[(x * 5 + y * 7) % dLen];
      const wave = 0.5 + 0.5 * Math.sin(t * 1.15 + x * 0.42 - y * 0.37 + knotAmp * Math.cos(t * 0.8 + ((x * 7) ^ (y * 11)) * 0.22));
      const v = Math.max(0, Math.min(1, 0.42 * hA + 0.22 * hB + 0.36 * wave));
      microField[y * 32 + x] = v; s0 += v; sq0 += v * v;
    }
    const var0 = Math.max(1e-9, sq0 / 1024 - (s0 / 1024) ** 2);
    const blk = meta.block, side = 32 / blk, gridPx = Math.min(w - 40, h - 32), ox = (w - gridPx) / 2, oy = (h - gridPx) / 2, cell = gridPx / side;
    ctx.strokeStyle = '#d9ddec'; ctx.lineWidth = 1; ctx.strokeRect(ox - 6, oy - 6, gridPx + 12, gridPx + 12);
    let sB = 0, sqB = 0;
    for (let by = 0; by < side; by++) for (let bx = 0; bx < side; bx++) {
      let acc = 0;
      for (let dy = 0; dy < blk; dy++) for (let dx = 0; dx < blk; dx++) acc += microField[(by * blk + dy) * 32 + bx * blk + dx];
      const avg = acc / (blk * blk); sB += avg; sqB += avg * avg;
      const cx = ox + (bx + 0.5) * cell, cy = oy + (by + 0.5) * cell;
      const color = avg < 0.34 ? RAMP[0] : avg < 0.54 ? RAMP[1] : avg < 0.72 ? RAMP[2] : RAMP[3];
      if (blk === 1) { ctx.beginPath(); ctx.arc(cx, cy, Math.max(1.8, cell * 0.36), 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
      else if (blk === 8) {
        const grad = ctx.createRadialGradient(cx, cy, cell * 0.08, cx, cy, cell * 0.78);
        grad.addColorStop(0, color); grad.addColorStop(1, 'rgba(255,255,255,0.35)');
        ctx.fillStyle = grad; ctx.fillRect(cx - cell * 0.48, cy - cell * 0.48, cell * 0.96, cell * 0.96);
      } else { const sz = cell * 0.86; ctx.fillStyle = color; ctx.fillRect(cx - sz / 2, cy - sz / 2, sz, sz); }
    }
    const nB = side * side, varB = Math.max(0, sqB / nB - (sB / nB) ** 2);
    const varRetained = sc === 0 ? 100 : Math.min(100, (varB / var0) * 100);
    const bitsLost = sc === 0 ? 0 : Math.log2(1024 / nB) + Math.max(0, -Math.log2(Math.max(0.01, varRetained / 100)) * 0.5);
    byId('rg-top-scale').textContent = meta.scale;
    byId('rg-top-state').textContent = meta.state;
    byId('rg-subtitle').textContent = meta.desc;
    byId('rg-scale-out').textContent = 'Layer ' + sc + ' · ' + blk + '×' + blk;
    byId('rg-kpi-var').textContent = varRetained.toFixed(1) + '%';
    byId('rg-kpi-ent').textContent = bitsLost.toFixed(2) + ' bits';
    byId('rg-kpi-cells').textContent = nB + ' / 1024';
    byId('rg-kpi-seed').textContent = units.get(selected).label + ' · r = ' + kR.toFixed(2);
    byId('rg-knot-r-out').textContent = kR.toFixed(2);
    byId('rg-knot-e-out').textContent = kE.toFixed(2);
    byId('rg-digits').textContent = visibleDigits().split('').join(' ');
  }

  // ---- Hopf detector ----
  const hopfCanvas = byId('hopf-canvas');
  let displayed = null;
  function dimensionState() {
    const unit = units.get(selected), digit = unit.whole.at(-1);
    const h = towerHeight(digit, byId('rg-uncap').checked);
    const bias = Number(byId('hopf-bias').value), floor = Number(byId('hopf-floor').value);
    const driven = byId('hopf-drive').value === 'tower', detector = byId('hopf-view').value;
    const mu = bias + (driven ? 0.30 * (h - 2) : 0), radius = Math.sqrt(Math.max(0, mu));
    const active = radius > 0, resolved = active && radius > floor, seen = resolved && detector !== 'power';
    return { digit, h, bias, floor, driven, detector, mu, radius, active, resolved, visible: seen, hole: seen && detector === 'iq' };
  }
  function kpi(label, value, tone) { const d = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = label; const dd = document.createElement('dd'); dd.textContent = value; if (tone) dd.dataset.tone = tone; d.append(dt, dd); return d; }
  function renderDimension() {
    displayed = dimensionState(); const d = displayed;
    byId('hopf-bias-out').textContent = d.bias.toFixed(2);
    byId('hopf-floor-out').textContent = d.floor.toFixed(2);
    byId('hopf-kpis').replaceChildren(
      kpi('μ', d.mu.toFixed(2)), kpi('Radius √μ', d.radius.toFixed(3)),
      kpi('Attractor dimension', d.active ? '1' : '0', 'violet'), kpi('Visible dimension', d.visible ? '1' : '0'), kpi('Visible holes', d.hole ? '1' : '0', d.hole ? 'amber' : '')
    );
    byId('hopf-caption').textContent = !d.active ? 'The loop has collapsed. The attracting state is a fixed point.'
      : !d.resolved ? 'The loop is below the detection floor. The oscillator still has a limit cycle.'
      : d.detector === 'sum' ? 'The mirror fields cancel in the imaginary quadrature. Their sum moves along a line.'
      : d.detector === 'power' ? 'The field keeps rotating. Its steady intensity is constant.'
      : 'The stable circle and its mirror share a loop. The two fields run in opposite directions.';
    byId('hopf-command').textContent = 'Unit digit ' + d.digit + ' → height ' + d.h + ' · ' + (d.driven
      ? 'tower drives the pump: μ = bias + 0.30 × (height − 2) = ' + d.mu.toFixed(2)
      : 'physical pump held at μ = ' + d.mu.toFixed(2) + ' while the unit and tower may change');
    byId('hopf-check').textContent = Math.abs(d.radius * d.radius - Math.max(0, d.mu)) < 1e-12 && (d.hole === (d.visible && d.detector === 'iq')) ? 'Check passed · R² = max(0, μ)' : 'Check failed';
    paintDimension(animTime * 1000);
  }
  function dot(ctx, x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); }
  function paintDimension(timeMs) {
    const ctx = hopfCanvas.getContext('2d'); if (!ctx || !displayed) return;
    const { radius, visible: seen, detector, resolved } = displayed;
    const x = 320, y = 130, angle = 0.0022 * timeMs + 0.66, px = radius * 100;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 640, 260);
    ctx.strokeStyle = '#d9ddec'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(600, y); ctx.moveTo(x, 14); ctx.lineTo(x, 246); ctx.stroke();
    ctx.font = '13px system-ui'; ctx.fillStyle = '#525c74';
    ctx.fillText(detector === 'power' ? 'Power' : detector === 'sum' ? 'Real field sum' : 'In-phase field', 490, 152);
    if (detector === 'iq') ctx.fillText('Quadrature field', 330, 24);
    if (!seen) { dot(ctx, detector === 'power' && resolved ? x + 120 * radius ** 2 : x, y, 6.5, '#ee9a12'); return; }
    ctx.strokeStyle = '#284cad'; ctx.lineWidth = 3; ctx.beginPath();
    if (detector === 'sum') { ctx.moveTo(x - 2 * px, y); ctx.lineTo(x + 2 * px, y); } else ctx.arc(x, y, px, 0, 2 * Math.PI);
    ctx.stroke();
    if (detector === 'sum') dot(ctx, x + 2 * px * Math.cos(angle), y, 6.5, '#ee9a12');
    else { dot(ctx, x + px * Math.cos(angle), y - px * Math.sin(angle), 6.5, '#284cad'); dot(ctx, x + px * Math.cos(angle), y + px * Math.sin(angle), 6.5, '#6c46c4'); }
  }

  // ---- Wiring ----
  function setUnit(id) { selected = id; unitSelects.forEach(s => { s.value = id; }); renderDimension(); drawRG(animTime); }
  unitSelects.forEach(s => s.addEventListener('change', () => setUnit(s.value)));
  ['rg-scale', 'rg-knot-r', 'rg-knot-e'].forEach(id => byId(id).addEventListener('input', () => drawRG(animTime)));
  byId('rg-uncap').addEventListener('change', () => { drawRG(animTime); renderDimension(); });
  ['hopf-view', 'hopf-drive', 'hopf-bias', 'hopf-floor'].forEach(id => byId(id).addEventListener('input', renderDimension));
  byId('rg-step').addEventListener('click', () => { const s = byId('rg-scale'); s.value = String((Number(s.value) + 1) % 4); drawRG(animTime); });
  const play = byId('rg-play');
  function syncPlay() { play.textContent = playing ? 'Pause' : 'Play'; play.setAttribute('aria-pressed', String(playing)); }
  play.addEventListener('click', () => { playing = !playing; syncPlay(); schedule(); });
  byId('rg-save').addEventListener('click', () => { const a = document.createElement('a'); a.href = rgCanvas.toDataURL('image/png'); a.download = 'rg-lattice-layer-' + byId('rg-scale').value + '.png'; a.click(); });
  syncPlay();

  function active() { return remoteActive && visible && !document.hidden; }
  function loop(ts) {
    raf = 0;
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000); lastTs = ts;
    if (playing) animTime += dt;
    drawRG(animTime); paintDimension(animTime * 1000);
    if (playing && active()) raf = requestAnimationFrame(loop); else lastTs = 0;
  }
  function schedule() { if (!raf && active()) raf = requestAnimationFrame(loop); }
  if ('IntersectionObserver' in window) new IntersectionObserver(e => { visible = e[0].isIntersecting; schedule(); }, { rootMargin: '160px 0px' }).observe(root);
  document.addEventListener('visibilitychange', schedule);
  new ResizeObserver(() => drawRG(animTime)).observe(rgWrap);
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== location.origin || event.data?.type !== 'atlas-interactive-visibility') return;
    remoteActive = event.data.active === true; schedule();
  });
  function announceHeight() { if (window.parent !== window) window.parent.postMessage({ type: 'atlas-interactive-size', height: Math.ceil(document.body.getBoundingClientRect().height) + 2 }, location.origin); }
  new ResizeObserver(announceHeight).observe(document.body);
  window.addEventListener('load', () => { announceHeight(); if (window.parent !== window) window.parent.postMessage({ type: 'atlas-interactive-ready' }, location.origin); });

  window.__rgHopf = { dimensionState, units, visibleDigits, setUnit };
  renderDimension(); drawRG(0); schedule();
}());
