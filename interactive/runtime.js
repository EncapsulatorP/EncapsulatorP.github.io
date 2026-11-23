/* Atlas adapter for the supplied Gemini topic scripts.
 * Local controls, Canvas plots and Three.js lifecycle only. No bridge, eval or network calls.
 */
(function () {
  'use strict';

  // The instrument also runs inside Atlas embeds. Add site chrome only when it owns the page.
  if (window.top === window && document.querySelector('.ix-exhibit')) {
    const wordmark = document.createElement('script');
    wordmark.src = new URL('../assets/pq-wordmark.js?v=map-layout-1', document.currentScript.src);
    wordmark.setAttribute('data-pq-standalone', '');
    document.head.append(wordmark);
  }
  const root = document.getElementById('widget');
  if (!root) return;
  if (window.parent !== window) document.documentElement.classList.add('ix-embedded');
  const colors = {
    '--surface': '#163b43', '--primary': '#a9e1cc', '--positive': '#e0be73',
    '--negative': '#ed9a88', '--chart-1': '#a9e1cc', '--chart-2': '#89c5df',
    '--chart-3': '#d6c782', '--chart-4': '#dfad8e', '--chart-5': '#c5b4df',
    '--on-surface-default': '#edf4eb', '--on-surface-variant': '#bfd2c8',
    '--outline': '#8daea3', '--outline-variant': '#496d67',
    '--stroke-emphasis': '#74958a', '--surface-container-high': '#72978d',
    '--surface-container-highest': '#617b74'
  };
  const loops = [], redraws = [], cleanups = [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let appState, raf = 0, lastTime = 0, frameCount = 0, clock = 0, remoteActive = window.parent === window, interactionUntil = 0, inViewport = true;
  function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
  function active() { return remoteActive && inViewport && !document.hidden; }
  function animated() { return appState && (appState.play || appState.isPlaying || appState.isRunning); }
  function requestDraw() { if (active() && !raf) raf = requestAnimationFrame(tick); }
  function tick(now) {
    raf = 0;
    if (!active()) { lastTime = 0; return; }
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
    lastTime = now; clock += dt; frameCount++;
    loops.forEach(fn => fn({ time: clock, dt, frameCount, state: appState }));
    redraws.forEach(fn => fn());
    if (animated() || now < interactionUntil) requestDraw();
    else lastTime = 0;
  }
  function visibility() {
    if (active()) requestDraw();
    else { cancelAnimationFrame(raf); raf = 0; lastTime = 0; }
  }
  document.addEventListener('visibilitychange', visibility);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inViewport = entries[0].isIntersecting; visibility(); }, { rootMargin: '160px 0px' }).observe(root);
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== location.origin) return;
    if (!event.data || event.data.type !== 'atlas-interactive-visibility') return;
    remoteActive = event.data.active === true;
    visibility();
  });
  window.addEventListener('pagehide', event => { remoteActive = false; visibility(); if (!event.persisted) cleanups.forEach(fn => fn()); });
  window.addEventListener('pageshow', () => {
    if (window.parent === window) { remoteActive = true; visibility(); }
    else window.parent.postMessage({ type: 'atlas-interactive-ready' }, location.origin);
  });
  function announceHeight() {
    if (window.parent !== window) window.parent.postMessage({ type: 'atlas-interactive-size', height: Math.ceil(document.body.getBoundingClientRect().height) + 2 }, location.origin);
  }
  new ResizeObserver(announceHeight).observe(document.body);
  window.addEventListener('load', announceHeight);

  function createApp(config) {
    const listeners = [], inputs = new Map(), outputs = new Map();
    const controls = el('div', 'ix-controls'), hud = el('dl', 'ix-hud'), legend = el('div', 'ix-legend');
    const viz = el('div', 'ix-viz'); viz.id = 'viz';
    const status = el('p', 'ix-status'), badges = el('p', 'ix-hints');
    root.setAttribute('aria-label', config.title);
    root.append(controls, hud, viz, legend, badges, status);
    let hudLast = '', hudTime = -Infinity;
    const values = {};
    const state = new Proxy(values, {
      set(target, key, value) {
        if (Object.is(target[key], value)) return true;
        target[key] = value;
        const input = inputs.get(key), output = outputs.get(key);
        if (input) {
          if (input.tagName === 'BUTTON') { input.setAttribute('aria-pressed', String(Boolean(value))); input.textContent = (value ? 'Pause ' : 'Play ') + (input.dataset.label || 'animation'); }
          else input.value = value;
        }
        if (output) output.value = String(value);
        listeners.slice().forEach(record => { if (record.key === key) record.fn(value); else if (record.key === null) record.fn(key, value); });
        requestDraw();
        return true;
      }
    });
    Object.defineProperty(values, '_subscribe', { value: (key, fn) => { listeners.push(typeof key === 'function' ? { key: null, fn: key } : { key, fn }); } });
    appState = state;
    Object.entries(config.params).forEach(([key, param]) => {
      if (param.type === 'button') {
        const button = el('button', 'ix-button', param.label); button.type = 'button';
        button.addEventListener('click', () => { param.onClick(state); requestDraw(); }); controls.append(button); return;
      }
      values[key] = reducedMotion && ['play', 'isPlaying', 'isRunning'].includes(key) ? false : param.value;
      if (param.type === 'play' || typeof param.value === 'boolean') {
        const button = el('button', 'ix-button'); button.type = 'button'; button.dataset.label = 'animation';
        button.textContent = values[key] ? 'Pause animation' : 'Play animation'; button.setAttribute('aria-pressed', String(Boolean(values[key])));
        button.addEventListener('click', () => { state[key] = !state[key]; }); inputs.set(key, button); controls.append(button); return;
      }
      const field = el('label', 'ix-field'), name = el('span', 'ix-control-label', param.label), input = el(param.options ? 'select' : 'input');
      input.id = 'control-' + key; field.htmlFor = input.id;
      if (param.options) param.options.forEach(option => { const node = el('option', '', option); node.value = option; input.append(node); });
      else {
        input.type = 'range'; input.min = param.min; input.max = param.max; input.step = param.step || 0.1;
        const output = el('output'); output.htmlFor = input.id; output.value = String(values[key]); outputs.set(key, output); name.append(output);
      }
      input.value = values[key]; input.addEventListener(param.options ? 'change' : 'input', () => { state[key] = param.options ? input.value : Number(input.value); });
      field.append(name, input); inputs.set(key, input); controls.append(field);
    });
    const ui = {
      splitViz() { viz.replaceChildren(); viz.classList.add('ix-split'); const vizTop = el('div', 'ix-plot'), vizBottom = el('div', 'ix-plot'); vizTop.id = 'vizTop'; vizBottom.id = 'vizBottom'; viz.append(vizTop, vizBottom); return { vizTop, vizBottom }; },
      setHUD(items) {
        const signature = JSON.stringify(items), now = performance.now();
        if (signature === hudLast || (animated() && now - hudTime < 120)) return;
        hudLast = signature; hudTime = now; hud.replaceChildren();
        items.forEach(item => { const itemNode = el('div'); itemNode.append(el('dt', '', item.label), el('dd', '', String(item.value))); hud.append(itemNode); });
      },
      setEditorial(editorial) { if (editorial.hud) ui.setHUD(editorial.hud); },
      setLegend(items) { legend.replaceChildren(); items.forEach(item => { const chip = el('span', '', item.label), dot = el('i'); dot.style.background = getColor(item.color); chip.prepend(dot); legend.append(chip); }); },
      setStatus(text) { if (status.textContent !== text) status.textContent = text; }
    };
    if (config.editorial) ui.setEditorial(config.editorial);
    window.WH._badges = badges;
    return { state, ui };
  }
  function getColor(token) { return colors[token] || token; }
  function target(where) { return typeof where === 'string' ? document.getElementById(where) : where; }
  function canvasTarget(where) {
    const host = target(where), canvas = el('canvas'); canvas.setAttribute('role', 'img'); host.append(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); host.append(el('p', 'ix-fallback', 'Canvas is unavailable here. The recurrence, source notes and numerical controls remain available.')); }
    let width = 0, height = 0;
    function resize() {
      width = Math.max(240, host.clientWidth); height = host.clientHeight || 340;
      const ratio = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      canvas.style.width = '100%'; canvas.style.height = height + 'px';
      if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0); requestDraw();
    }
    new ResizeObserver(resize).observe(host); resize();
    return { host, canvas, ctx, get size() { return { width, height }; } };
  }
  function initCanvas(where, setup) {
    const view = canvasTarget(where), ctx = view.ctx;
    if (!ctx) return;
    view.canvas.setAttribute('aria-label', 'Goldbach mirror scan: prime points around a chosen center. Exact pairs are also listed in the table below.');
    let oldWidth = 0, oldHeight = 0, render;
    ctx.drawTag = function (text, x, y) {
      text = text.replace(/\$/g, ''); this.save(); this.font = '600 13px system-ui';
      const w = this.measureText(text).width + 20;
      this.fillStyle = '#fffdf8'; this.fillRect(x - w / 2, y - 15, w, 26);
      this.fillStyle = '#182b35'; this.textAlign = 'center'; this.fillText(text, x, y + 3); this.restore();
    };
    loops.push(frame => {
      const { width, height } = view.size;
      if (width !== oldWidth || height !== oldHeight) { oldWidth = width; oldHeight = height; render = setup({ ctx, cx: width / 2, cy: height / 2, state: appState, width, height }); }
      ctx.clearRect(0, 0, width, height); ctx.fillStyle = colors['--surface']; ctx.fillRect(0, 0, width, height);
      render(frame);
    });
    requestDraw();
  }
  function initTable(where, build) {
    const host = target(where); host.classList.add('ix-table-host');
    let previous = '';
    redraws.push(() => {
      const config = build({ state: appState }), signature = JSON.stringify(config.data);
      if (signature === previous) return; previous = signature;
      const table = el('table', 'ix-table'), caption = el('caption', '', 'All prime pairs for the selected center'), head = el('thead'), row = el('tr'), body = el('tbody');
      config.columns.forEach(column => { const th = el('th', '', column.label); th.scope = 'col'; row.append(th); }); head.append(row);
      config.data.forEach(record => { const tr = el('tr'); config.columns.forEach(column => tr.append(el('td', '', record[column.key]))); body.append(tr); });
      table.append(caption, head, body); host.replaceChildren(table);
    }); requestDraw();
  }

  // Small Canvas adapter for the marks used by the supplied logistic/threshold scripts.
  const Plot = {};
  ['dot', 'line', 'lineY', 'areaY', 'ruleX', 'ruleY', 'text'].forEach(type => { Plot[type] = (data, options = {}) => ({ type, data, options }); });
  function channel(value, datum, index) { return typeof value === 'function' ? value(datum, index) : typeof value === 'string' ? datum[value] : value; }
  function finiteExtent(values) { const filtered = values.filter(Number.isFinite); if (!filtered.length) return [0, 1]; const min = Math.min(...filtered), max = Math.max(...filtered); return min === max ? [min - .5, max + .5] : [min, max]; }
  function plotCanvas(view, config) {
    const { width, height } = view.size, ctx = view.canvas.getContext('2d'), left = 51, right = width - 17, top = 36, bottom = height - 44;
    ctx.clearRect(0, 0, width, height); ctx.fillStyle = colors['--surface']; ctx.fillRect(0, 0, width, height);
    const allX = [], allY = [];
    config.marks.forEach(mark => mark.data.forEach((d, i) => { if (mark.type === 'ruleX') allX.push(d); else if (mark.type === 'ruleY') allY.push(d); else { allX.push(channel(mark.options.x, d, i)); allY.push(channel(mark.options.y, d, i)); } }));
    const xd = config.x?.domain || finiteExtent(allX), yd = config.y?.domain || finiteExtent(allY);
    const x = v => left + (v - xd[0]) / (xd[1] - xd[0]) * (right - left), y = v => bottom - (v - yd[0]) / (yd[1] - yd[0]) * (bottom - top);
    ctx.font = '10px system-ui'; ctx.textBaseline = 'middle'; ctx.fillStyle = colors['--on-surface-variant'];
    for (let i = 0; i <= 4; i++) {
      const px = left + i / 4 * (right - left), py = bottom - i / 4 * (bottom - top);
      ctx.strokeStyle = '#365b5c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bottom); ctx.moveTo(left, py); ctx.lineTo(right, py); ctx.stroke();
      const xv = xd[0] + i / 4 * (xd[1] - xd[0]), yv = yd[0] + i / 4 * (yd[1] - yd[0]);
      ctx.textAlign = 'center'; ctx.fillText(Number(xv.toPrecision(4)).toString(), px, bottom + 15); ctx.textAlign = 'right'; ctx.fillText(Number(yv.toPrecision(3)).toString(), left - 7, py);
    }
    ctx.fillStyle = colors['--on-surface-default']; ctx.font = '11px system-ui'; ctx.textAlign = 'left'; ctx.fillText(config.title || '', left, 16);
    ctx.textAlign = 'center'; ctx.fillText(config.x?.label || '', (left + right) / 2, height - 10);
    ctx.save(); ctx.translate(12, (top + bottom) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(config.y?.label || '', 0, 0); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(left, top, right - left, bottom - top); ctx.clip();
    config.marks.forEach(mark => {
      const o = mark.options; ctx.save(); ctx.strokeStyle = o.stroke || colors['--primary']; ctx.fillStyle = o.fill || colors['--primary']; ctx.lineWidth = o.strokeWidth || 1.4;
      ctx.globalAlpha = o.strokeOpacity ?? o.fillOpacity ?? 1; ctx.setLineDash(o.strokeDasharray ? String(o.strokeDasharray).split(',').map(Number) : []);
      if (mark.type === 'ruleX' || mark.type === 'ruleY') {
        mark.data.forEach(v => { ctx.beginPath(); if (mark.type === 'ruleX') { ctx.moveTo(x(v), top); ctx.lineTo(x(v), bottom); } else { ctx.moveTo(left, y(v)); ctx.lineTo(right, y(v)); } ctx.stroke(); });
      } else if (mark.type === 'dot' || mark.type === 'text') {
        mark.data.forEach((d, i) => { const px = x(channel(o.x, d, i)), py = y(channel(o.y, d, i)); if (!Number.isFinite(px + py)) return; if (mark.type === 'dot') { ctx.beginPath(); ctx.arc(px, py, o.r || 2, 0, Math.PI * 2); ctx.fill(); } else { ctx.textAlign = 'center'; ctx.fillText(channel(o.text, d, i), px, py + (o.dy || 0)); } });
      } else {
        let started = false, group, firstX, lastX; ctx.beginPath();
        mark.data.forEach((d, i) => { const px = x(channel(o.x, d, i)), py = y(channel(o.y, d, i)), nextGroup = o.z ? channel(o.z, d, i) : 0;
          if (!Number.isFinite(px + py)) { started = false; return; }
          if (!started || nextGroup !== group) { ctx.moveTo(px, py); firstX ??= px; } else ctx.lineTo(px, py);
          started = true; group = nextGroup; lastX = px;
        });
        if (mark.type === 'areaY' && firstX !== undefined) { ctx.lineTo(lastX, y(0)); ctx.lineTo(firstX, y(0)); ctx.closePath(); ctx.fill(); } else ctx.stroke();
      }
      ctx.restore();
    }); ctx.restore();
  }
  function initPlot(where, build) {
    const view = canvasTarget(where); let dirty = true;
    if (!view.ctx) return () => {};
    view.canvas.setAttribute('aria-label', 'Finite sampled mathematical plot. Parameters, sample sizes and limitations are shown with this exhibit.');
    const update = () => { dirty = true; requestDraw(); };
    appState._subscribe(update); new ResizeObserver(update).observe(view.host);
    redraws.push(() => { if (!dirty) return; dirty = false; plotCanvas(view, build({ ...view.size, state: appState })); });
    requestDraw(); return update;
  }
  function initThree(where, setup) {
    const host = target(where); host.classList.add('ix-three');
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch (error) { host.append(el('p', 'ix-fallback', 'The 3D view needs WebGL. The equations, controls and source notes remain available below.')); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); host.append(renderer.domElement);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('aria-label', '3D interactive view. Drag to orbit, scroll to zoom. Keyboard: arrow keys orbit, plus and minus zoom, R resets the view.');
    const scene = new THREE.Scene(); scene.background = new THREE.Color(colors['--surface']);
    const camera = new THREE.PerspectiveCamera(45, 1, .1, 5000); camera.position.set(10, 10, 10);
    const controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
    controls.addEventListener('start', () => { interactionUntil = performance.now() + 1000; requestDraw(); });
    controls.addEventListener('change', () => { interactionUntil = performance.now() + 250; requestDraw(); });
    const result = setup(scene, camera, renderer, controls), render = typeof result === 'function' ? result : result?.render;
    const initialPosition = camera.position.clone(), initialTarget = controls.target.clone();
    renderer.domElement.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'r', 'R'].includes(event.key)) return;
      event.preventDefault();
      if (event.key.toLowerCase() === 'r') { camera.position.copy(initialPosition); controls.target.copy(initialTarget); }
      else {
        const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
        if (event.key === 'ArrowLeft') spherical.theta -= .12;
        if (event.key === 'ArrowRight') spherical.theta += .12;
        if (event.key === 'ArrowUp') spherical.phi -= .1;
        if (event.key === 'ArrowDown') spherical.phi += .1;
        if (event.key === '+' || event.key === '=') spherical.radius *= .9;
        if (event.key === '-') spherical.radius *= 1.1;
        spherical.makeSafe(); camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      }
      interactionUntil = performance.now() + 300; controls.update(); requestDraw();
    });
    new ResizeObserver(() => { const width = Math.max(240, host.clientWidth), height = host.clientHeight || 430; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); requestDraw(); }).observe(host);
    loops.push(frame => { if (render) render(frame); controls.update(); renderer.render(scene, camera); });
    cleanups.push(() => { if (result?.stop) result.stop(); controls.dispose(); renderer.dispose(); });
    requestDraw();
  }
  window.Plot = Plot;
  window.WH = {
    createApp, initCanvas, initTable, initPlot, initThree, getColor,
    onFrame(callback) {
      loops.push(callback); requestDraw();
      return () => { const index = loops.indexOf(callback); if (index !== -1) loops.splice(index, 1); };
    },
    addBadge(icon, label) { const node = window.WH._badges; if (node && !node.textContent.includes(label)) node.append(el('span', '', label)); },
    createScale(tokens) { return fraction => tokens[Math.min(tokens.length - 1, Math.floor(Math.max(0, fraction) * tokens.length))]; },
    transparent(token, alpha) { const hex = getColor(token).replace('#', ''); return 'rgba(' + [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',') + ',' + alpha + ')'; },
    requestDraw
  };
}());
