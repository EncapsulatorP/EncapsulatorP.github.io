/* Recamán finite-prefix explorer.
 * Supplied interface / projection concept: Gemini, via Zolton, 21 November 2026.
 * Sequence: Bernardo Recamán Santos (OEIS A005132).
 * Local renderer and arithmetic integration: ChatGPT. No external requests.
 */
(function () {
  'use strict';

  function computeRecaman(terms) {
    if (!Number.isSafeInteger(terms) || terms < 2 || terms > 8000) {
      throw new RangeError('Choose between 2 and 8,000 terms, including a₀.');
    }
    const sequence = new Int32Array(terms), directions = new Int8Array(terms);
    const visited = new Set([0]);
    let maximum = 0, backward = 0, boundary = 0, collision = 0;
    for (let n = 1; n < terms; n += 1) {
      const candidate = sequence[n - 1] - n;
      if (candidate >= 0 && !visited.has(candidate)) {
        sequence[n] = candidate; directions[n] = -1; backward += 1;
      } else {
        sequence[n] = sequence[n - 1] + n; directions[n] = 1;
        if (candidate < 0) boundary += 1; else collision += 1;
      }
      visited.add(sequence[n]);
      maximum = Math.max(maximum, sequence[n]);
    }
    const gaps = [];
    for (let value = 1; value < maximum; value += 1) {
      if (!visited.has(value)) gaps.push(value);
    }
    return { terms, sequence, directions, visited, maximum, gaps,
      smallestGap: gaps.length ? gaps[0] : null, backward, boundary, collision,
      transitions: terms - 1, backwardRatio: backward / (terms - 1) };
  }

  function delayPoint(data, index) {
    if (!Number.isSafeInteger(index) || index < 0 || index + 2 >= data.terms) throw new RangeError('Triple index outside prefix.');
    const scale = 2.2 / Math.max(data.maximum, 1);
    return [data.sequence[index] * scale - 1.1, data.sequence[index + 1] * scale - 1.1, data.sequence[index + 2] * scale - 1.1];
  }

  function ribbonPoint(data, index) {
    if (!Number.isSafeInteger(index) || index < 0 || index >= data.terms) throw new RangeError('Index outside prefix.');
    const angle = 2 * Math.PI * index / data.terms;
    const across = (data.sequence[index] % 6 / 5 - 0.5) * 0.8;
    return ribbonCoordinate(angle, across);
  }

  function ribbonCoordinate(angle, across) {
    const radius = 1.15 + across * Math.cos(angle / 2);
    return [radius * Math.cos(angle), radius * Math.sin(angle), across * Math.sin(angle / 2)];
  }

  function gapBins(data, count) {
    if (!Number.isSafeInteger(count) || count < 1) throw new RangeError('Positive bin count required.');
    const total = Math.max(0, data.maximum - 1);
    if (!total) return [];
    const bins = [], width = Math.ceil(total / count);
    for (let first = 1; first <= total; first += width) {
      const last = Math.min(total, first + width - 1);
      let missing = 0;
      for (let n = first; n <= last; n += 1) if (!data.visited.has(n)) missing += 1;
      bins.push({ first, last, missing, total: last - first + 1 });
    }
    return bins;
  }

  const api = { computeRecaman, delayPoint, ribbonPoint, ribbonCoordinate, gapBins };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  window.RecamanExplorer = api;

  let instanceCount = 0;
  const format = n => Number(n).toLocaleString('en-GB');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const doc = document;
  function create(tag, cls, text) {
    const node = doc.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mount(host) {
    if (host.dataset.recamanMounted === 'true') return;
    host.dataset.recamanMounted = 'true';
    const id = 'recaman-' + (++instanceCount);
    const headingTag = ['h1', 'h2', 'h3'].includes(host.dataset.recamanHeading) ? host.dataset.recamanHeading : 'h3';
    host.classList.add('rx-explorer');
    host.innerHTML = `
      <div class="rx-heading"><div><p class="rx-eyebrow">Sequence study / a finite horizon</p><${headingTag} id="${id}-title">Recamán, around the gaps.</${headingTag}></div><span class="rx-credit-badge">Gemini · visual concept</span></div>
      <p class="rx-intro">Step back by n if the result is nonnegative and new. Otherwise step forward by n. The rule is exact; the unanswered question is what lies beyond the displayed horizon.</p>
      <div class="rx-instrument">
        <div class="rx-visual">
          <div class="rx-stage-top"><span data-rx-view-label>Observed triples</span><span data-rx-sample></span></div>
          <canvas class="rx-stage" tabindex="0" role="img" aria-label="Recamán sequence in three-dimensional delay coordinates. Drag or use arrow keys to rotate; plus and minus zoom; space pauses motion.">A textual prefix and finite-gap statistics are provided below this drawing.</canvas>
          <p class="rx-fallback" hidden>The drawing is unavailable in this browser. The exact finite-prefix statistics and first terms remain available below.</p>
          <div class="rx-stage-actions"><span data-rx-hint>Drag to orbit · arrow keys also work</span><div><button type="button" data-rx-action="out" aria-label="Zoom out">−</button><button type="button" data-rx-action="in" aria-label="Zoom in">+</button><button type="button" data-rx-action="reset">Reset view</button></div></div>
          <div class="rx-legend"><span><i class="rx-back"></i>−n · backward</span><span><i class="rx-forward"></i>+n · forward</span><span class="rx-legend-gap"><i class="rx-gap"></i>Unvisited · separate rail below</span></div>
        </div>
        <div class="rx-console">
          <label class="rx-label" for="${id}-terms">Terms, including a₀ = 0 <output id="${id}-count">2,500</output></label>
          <input id="${id}-terms" class="rx-range" type="range" min="200" max="8000" step="100" value="2500" aria-describedby="${id}-horizon">
          <p class="rx-help" id="${id}-horizon">2,499 transitions · a₀ through a₂₄₉₉</p>
          <label class="rx-label" for="${id}-view">View of the same sequence</label>
          <select id="${id}-view" class="rx-select"><option value="delay">Delay triples · observed coordinates</option><option value="ribbon">Möbius ribbon · illustrative mapping</option><option value="arcs">Number-line arcs · first 80 steps</option></select>
          <p class="rx-view-note" data-rx-view-note></p>
          <div class="rx-buttons"><button type="button" data-rx-action="motion" aria-pressed="false">Pause motion</button><button type="button" data-rx-action="gaps" aria-pressed="true">Gap rail: on</button></div>
          <dl class="rx-stats"><div><dt>Prefix maximum</dt><dd data-rx-stat="maximum"></dd></div><div><dt>Smallest unvisited</dt><dd data-rx-stat="smallest"></dd></div><div><dt>Unvisited below maximum</dt><dd data-rx-stat="gaps"></dd></div><div><dt>Backward / all transitions</dt><dd data-rx-stat="backward"></dd></div></dl>
          <p class="rx-scope">Finite-prefix observation. An unvisited value is not a proven permanent omission.</p>
        </div>
      </div>
      <div class="rx-gap-panel"><div class="rx-gap-heading"><h4>Values not yet reached</h4><span data-rx-gap-range></span></div><canvas class="rx-gap-canvas" role="img" aria-label="Binned rail of positive integers below the prefix maximum. Coral height shows the fraction not visited in each bin."></canvas><p class="rx-gap-key">Each column is an integer interval. Coral height shows its unvisited fraction; these are scalar gaps, not missing delay triples.</p><p class="rx-first-gaps" data-rx-first-gaps></p></div>
      <details class="rx-details"><summary>Rule, coordinates, and the limit of the picture</summary><div><p><strong>Sequence rule.</strong> a₀ = 0. At transition n, use aₙ₋₁ − n if it is nonnegative and absent from earlier terms; otherwise use aₙ₋₁ + n. Forward steps may revisit a value.</p><p data-rx-rule-counts></p><p><strong>Delay view.</strong> Each drawn point is an observed triple (aᵢ, aᵢ₊₁, aᵢ₊₂), normalized by this prefix's maximum. Color identifies its first transition. Large prefixes use a disclosed deterministic sampling of points.</p><p><strong>Ribbon view.</strong> The index goes around a chosen Möbius band; the remainder of aᵢ modulo 6 sets the transverse coordinate. This is an illustrative representation, not evidence that the sequence generates a Möbius manifold or a topological obstruction.</p><p><strong>Arc view.</strong> Each semicircle joins consecutive terms on a number line. Only the first 80 transitions are drawn, so individual steps stay readable. All statistics still use the selected full prefix.</p><p><strong>First 16 terms:</strong> <span data-rx-prefix></span></p></div></details>
      <div class="rx-colophon"><p>Sequence: <strong>Bernardo Recamán Santos</strong>. Supplied 3D interface and projection concept: <strong>Gemini</strong>, contributed by Zolton. Local implementation, arithmetic corrections, and finite-horizon labels: ChatGPT.</p><div><a href="https://oeis.org/A005132" target="_blank" rel="noopener noreferrer">Sequence definition ↗</a><a href="https://github.com/EncapsulatorP/recaman" target="_blank" rel="noopener noreferrer">Recamán research repository ↗</a><a href="/atlas/recaman-visual-notes.md">Formulas and source notes</a></div></div>
      <p class="rx-live" role="status" aria-live="polite" aria-atomic="true"></p>`;
    host.setAttribute('aria-labelledby', id + '-title');
    const canvas = host.querySelector('.rx-stage'), gapCanvas = host.querySelector('.rx-gap-canvas');
    let ctx = null, gapCtx = null;
    try { ctx = canvas.getContext('2d'); gapCtx = gapCanvas.getContext('2d'); } catch (_) { /* Numeric fallback below. */ }
    const range = host.querySelector('.rx-range'), modeSelect = host.querySelector('.rx-select');
    const count = host.querySelector('#' + id + '-count'), horizon = host.querySelector('#' + id + '-horizon');
    const motionButton = host.querySelector('[data-rx-action="motion"]');
    const gapButton = host.querySelector('[data-rx-action="gaps"]');
    const gapPanel = host.querySelector('.rx-gap-panel');
    const live = host.querySelector('.rx-live');
    let data = computeRecaman(2500), mode = 'delay', points = [], showGaps = true;
    let yaw = -0.63, pitch = 0.36, zoom = 1, playing = !reduced.matches, onScreen = true;
    let raf = null, pendingBuild = null, lastFrame = 0, drag = null, width = 640, height = 420;
    let palette = {}, gapWidth = 640;

    const viewNotes = {
      delay: 'Shape from data: observed triples (aᵢ, aᵢ₊₁, aᵢ₊₂). Normalization follows the selected prefix maximum.',
      ribbon: 'Illustrative shape: index wraps around the ribbon; aᵢ mod 6 sets its width. No manifold theorem is claimed.',
      arcs: 'Exact steps on the number line: alternate arcs connect the first 80 transitions. Statistics use the entire selected prefix.'
    };
    function isVisible() {
      const room = host.closest('.page');
      return onScreen && !doc.hidden && host.isConnected && host.getClientRects().length > 0 &&
        (!room || room.classList.contains('on')) && !doc.querySelector('dialog[open]');
    }
    function colors() {
      const style = getComputedStyle(host);
      const pick = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
      palette = { ink: pick('--atlas-ink', '#182b35'), muted: pick('--atlas-muted', '#596d69'),
        line: pick('--atlas-line', '#d8ddd2'), back: '#236b67', forward: '#52259f', gap: '#ad514b' };
    }
    function fit() {
      const box = canvas.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return;
      width = box.width; height = box.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const rail = gapCanvas.getBoundingClientRect();
      if (rail.width > 0) {
        gapWidth = rail.width;
        gapCanvas.width = Math.round(rail.width * ratio); gapCanvas.height = Math.round(rail.height * ratio);
        if (gapCtx) gapCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      colors(); drawGaps(); wake();
    }
    function project(point) {
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x = point[0] * cy + point[2] * sy, z0 = -point[0] * sy + point[2] * cy;
      const y = point[1] * cp - z0 * sp, z = point[1] * sp + z0 * cp;
      const scale = Math.min(width, height) * 0.27 * zoom * 5 / (5 - z);
      return { x: width * 0.5 + x * scale, y: height * 0.49 - y * scale, z };
    }
    function line(list, color, alpha, lineWidth) {
      ctx.beginPath(); list.forEach((point, i) => { const p = project(point); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth || 1; ctx.globalAlpha = alpha; ctx.stroke(); ctx.globalAlpha = 1;
    }
    function grid() {
      if (mode === 'ribbon') {
        [-0.4, -0.2, 0, 0.2, 0.4].forEach(v => {
          const path = []; for (let k = 0; k <= 120; k += 1) path.push(ribbonCoordinate(2 * Math.PI * k / 120, v));
          line(path, palette.line, 0.9, 1);
        });
        for (let k = 0; k < 32; k += 1) line([ribbonCoordinate(2 * Math.PI * k / 32, -0.4), ribbonCoordinate(2 * Math.PI * k / 32, 0.4)], palette.line, 0.7, 1);
      } else {
        for (let i = 0; i <= 4; i += 1) {
          const p = -1.1 + i * 0.55;
          line([[p, -1.1, -1.1], [p, -1.1, 1.1]], palette.line, 0.7);
          line([[-1.1, -1.1, p], [1.1, -1.1, p]], palette.line, 0.7);
        }
        const axes = [[1.25, -1.1, -1.1, 'aᵢ'], [-1.1, 1.25, -1.1, 'aᵢ₊₁'], [-1.1, -1.1, 1.25, 'aᵢ₊₂']];
        axes.forEach(a => {
          line([[-1.1, -1.1, -1.1], a], palette.muted, 0.5);
          const p = project(a); ctx.fillStyle = palette.muted; ctx.font = '12px system-ui'; ctx.fillText(a[3], p.x + 4, p.y - 4);
        });
      }
    }
    function arcs() {
      const count = Math.min(80, data.transitions), slice = data.sequence.slice(0, count + 1);
      const maximum = Math.max.apply(null, slice), margin = 24, baseline = height * 0.5;
      const unit = Math.min((width - margin * 2) / Math.max(maximum, 1), (height - 40) / 80);
      const left = (width - maximum * unit) / 2;
      ctx.strokeStyle = palette.line; ctx.beginPath(); ctx.moveTo(margin, baseline); ctx.lineTo(width - margin, baseline); ctx.stroke();
      for (let n = 1; n <= count; n += 1) {
        const a = left + slice[n - 1] * unit, b = left + slice[n] * unit;
        const center = (a + b) / 2, radius = Math.abs(b - a) / 2;
        ctx.beginPath(); ctx.arc(center, baseline, radius, n % 2 ? Math.PI : 0, n % 2 ? 2 * Math.PI : Math.PI);
        ctx.strokeStyle = data.directions[n] < 0 ? palette.back : palette.forward;
        ctx.globalAlpha = 0.66; ctx.lineWidth = 1.2; ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.fillStyle = palette.muted; ctx.font = '11px system-ui';
      ctx.fillText('0', left, baseline + 16); ctx.fillText(format(maximum), left + maximum * unit - 20, baseline + 16);
    }
    function draw() {
      if (!ctx || !isVisible()) return;
      ctx.clearRect(0, 0, width, height);
      if (mode === 'arcs') { arcs(); return; }
      grid();
      const projected = points.map(p => ({ p: project(p.xyz), direction: p.direction })).sort((a, b) => a.p.z - b.p.z);
      projected.forEach(({ p, direction }) => {
        const radius = Math.max(1.15, Math.min(2.8, 1.45 + (p.z + 1.5) * 0.24));
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = direction < 0 ? palette.back : direction > 0 ? palette.forward : palette.muted;
        ctx.globalAlpha = 0.42 + Math.min(0.5, Math.max(0, (p.z + 2) / 7)); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    function drawGaps() {
      if (!gapCtx || !showGaps) return;
      const h = 54, bins = gapBins(data, Math.max(1, Math.floor(gapWidth / 4))), w = gapWidth / Math.max(1, bins.length);
      gapCtx.clearRect(0, 0, gapWidth, h);
      bins.forEach((bin, i) => {
        gapCtx.fillStyle = palette.line; gapCtx.fillRect(i * w, 0, Math.max(1, w - 1), h);
        const fill = h * bin.missing / bin.total;
        gapCtx.fillStyle = palette.gap; gapCtx.fillRect(i * w, h - fill, Math.max(1, w - 1), fill);
      });
    }
    function tick(time) {
      raf = null;
      if (!isVisible()) { lastFrame = 0; return; }
      const delta = lastFrame ? Math.min((time - lastFrame) / 1000, 0.1) : 0;
      if (lastFrame && time - lastFrame < 32 && playing && mode !== 'arcs') { raf = requestAnimationFrame(tick); return; }
      lastFrame = time;
      if (playing && !drag && mode !== 'arcs') yaw += delta * 0.11;
      draw();
      if (playing && mode !== 'arcs') raf = requestAnimationFrame(tick);
    }
    function wake() {
      if (raf === null && ctx && isVisible()) raf = requestAnimationFrame(tick);
    }
    function syncMotion() {
      motionButton.disabled = !ctx || mode === 'arcs';
      host.querySelectorAll('[data-rx-action="in"],[data-rx-action="out"],[data-rx-action="reset"]').forEach(button => { button.disabled = !ctx || mode === 'arcs'; });
      host.querySelector('[data-rx-hint]').textContent = mode === 'arcs' ? 'Exact endpoints · a static view of the first 80 steps' : 'Drag to orbit · arrow keys also work';
      motionButton.textContent = mode === 'arcs' ? 'Static exact arcs' : playing ? 'Pause motion' : 'Play motion';
      motionButton.setAttribute('aria-pressed', String(playing && mode !== 'arcs'));
      canvas.setAttribute('aria-label', mode === 'delay' ? 'Observed Recamán delay triples. Drag or use arrow keys to rotate; plus and minus zoom; space toggles motion.' : mode === 'ribbon' ? 'Illustrative Möbius ribbon mapping of Recamán terms. Drag or use arrow keys to rotate; plus and minus zoom; space toggles motion.' : 'Number-line arcs joining the first 80 Recamán transitions. Statistics below use the full selected prefix.');
      canvas.dataset.static = String(mode === 'arcs');
      wake();
    }
    function rebuild(announce) {
      data = computeRecaman(Number(range.value)); mode = modeSelect.value;
      count.textContent = format(data.terms);
      horizon.textContent = format(data.transitions) + ' transitions · a₀ through a' + String(data.terms - 1).replace(/\d/g, n => '₀₁₂₃₄₅₆₇₈₉'[n]);
      const total = mode === 'delay' ? data.terms - 2 : data.terms;
      const stride = Math.max(1, Math.ceil(total / 3600)); points = [];
      if (mode !== 'arcs') for (let i = 0; i < total; i += stride) {
        points.push({ xyz: mode === 'delay' ? delayPoint(data, i) : ribbonPoint(data, i), direction: data.directions[mode === 'delay' ? i + 1 : i] });
      }
      host.querySelector('[data-rx-view-label]').textContent = mode === 'delay' ? 'Observed triples' : mode === 'ribbon' ? 'Illustrative ribbon' : 'Exact number-line steps';
      host.querySelector('[data-rx-sample]').textContent = mode === 'arcs' ? 'First 80 transitions' : format(points.length) + ' / ' + format(total) + (mode === 'delay' ? ' triples drawn' : ' terms drawn');
      host.querySelector('[data-rx-view-note]').textContent = viewNotes[mode];
      host.querySelector('[data-rx-stat="maximum"]').textContent = format(data.maximum);
      host.querySelector('[data-rx-stat="smallest"]').textContent = data.smallestGap === null ? 'None in range' : format(data.smallestGap);
      host.querySelector('[data-rx-stat="gaps"]').textContent = format(data.gaps.length);
      host.querySelector('[data-rx-stat="backward"]').textContent = (100 * data.backwardRatio).toFixed(1) + '%';
      host.querySelector('[data-rx-stat="backward"]').title = format(data.backward) + ' / ' + format(data.transitions);
      host.querySelector('[data-rx-gap-range]').textContent = '1 ≤ value < ' + format(data.maximum);
      host.querySelector('[data-rx-first-gaps]').textContent = 'First unvisited values in this prefix: ' + (data.gaps.slice(0, 12).map(format).join(' · ') || 'none below the maximum') + (data.gaps.length > 12 ? ' …' : '');
      host.querySelector('[data-rx-rule-counts]').textContent = 'This prefix has ' + format(data.backward) + ' legal backward steps, ' + format(data.boundary) + ' additions forced by a negative subtraction candidate, and ' + format(data.collision) + ' additions forced by an already visited candidate. These sum to ' + format(data.transitions) + ' transitions.';
      host.querySelector('[data-rx-prefix]').textContent = Array.from(data.sequence.slice(0, 16)).join(', ') + '.';
      syncMotion(); drawGaps(); wake();
      if (announce) live.textContent = format(data.terms) + ' terms. Maximum ' + format(data.maximum) + '. ' + format(data.gaps.length) + ' positive integers below that maximum remain unvisited in this prefix.';
    }

    range.addEventListener('input', () => {
      count.textContent = format(range.value);
      if (pendingBuild !== null) cancelAnimationFrame(pendingBuild);
      pendingBuild = requestAnimationFrame(() => { pendingBuild = null; rebuild(false); });
    });
    range.addEventListener('change', () => rebuild(true));
    modeSelect.addEventListener('change', () => { lastFrame = 0; rebuild(false); });
    host.querySelectorAll('[data-rx-action]').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.rxAction;
      if (action === 'motion') { playing = !playing; lastFrame = 0; syncMotion(); }
      if (action === 'reset') { yaw = -0.63; pitch = 0.36; zoom = 1; }
      if (action === 'in') zoom = Math.min(1.5, zoom + 0.1);
      if (action === 'out') zoom = Math.max(0.65, zoom - 0.1);
      if (action === 'gaps') { showGaps = !showGaps; gapPanel.hidden = !showGaps; gapButton.setAttribute('aria-pressed', String(showGaps)); gapButton.textContent = showGaps ? 'Gap rail: on' : 'Gap rail: off'; if (showGaps) fit(); }
      wake();
    }));
    canvas.addEventListener('pointerdown', event => {
      if (mode === 'arcs' || event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', event => {
      if (!drag) return;
      yaw += (event.clientX - drag.x) * 0.008;
      pitch = Math.max(-1.2, Math.min(1.2, pitch + (event.clientY - drag.y) * 0.008));
      drag = { x: event.clientX, y: event.clientY }; wake();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => canvas.addEventListener(type, () => { drag = null; wake(); }));
    canvas.addEventListener('keydown', event => {
      if (mode === 'arcs' || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-',' '].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') yaw -= 0.12;
      if (event.key === 'ArrowRight') yaw += 0.12;
      if (event.key === 'ArrowUp') pitch = Math.min(1.2, pitch + 0.1);
      if (event.key === 'ArrowDown') pitch = Math.max(-1.2, pitch - 0.1);
      if (event.key === '+' || event.key === '=') zoom = Math.min(1.5, zoom + 0.1);
      if (event.key === '-') zoom = Math.max(0.65, zoom - 0.1);
      if (event.key === ' ') { playing = !playing; syncMotion(); }
      wake();
    });
    function visibilityChanged() {
      if (!isVisible()) { if (raf !== null) cancelAnimationFrame(raf); raf = null; lastFrame = 0; }
      else { fit(); wake(); }
    }
    if (typeof IntersectionObserver !== 'undefined') new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; visibilityChanged(); }).observe(host);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(canvas);
    else window.addEventListener('resize', fit);
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(visibilityChanged), room = host.closest('.page');
      if (room) observer.observe(room, { attributes: true, attributeFilter: ['class','hidden'] });
      doc.querySelectorAll('dialog').forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    }
    doc.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('hashchange', visibilityChanged);
    reduced.addEventListener('change', () => { if (reduced.matches) { playing = false; syncMotion(); } });
    if (!ctx) {
      host.querySelector('.rx-fallback').hidden = false;
      canvas.hidden = true;
      host.querySelectorAll('[data-rx-action="in"],[data-rx-action="out"],[data-rx-action="reset"]').forEach(button => { button.disabled = true; });
    }
    if (!gapCtx) gapCanvas.hidden = true;
    rebuild(false); fit();
  }

  api.mount = mount;
  function start() { doc.querySelectorAll('[data-recaman-explorer]').forEach(mount); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once: true }); else start();
}());
