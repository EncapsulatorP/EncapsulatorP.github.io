/* Gemini contribution · source interactive_visual_im_3fd6497132606067.html.
 * Preserve the defined map; expose its cobweb and keep capped feedback explicit. */
(function () {
  'use strict';
  const DEFAULTS = Object.freeze({ lambda: 0.85, vTh: 2, vShift: 1, x0: 1.5, iterations: 50 });
  const RAW = 'Raw recurrence', CAPPED = 'Original capped replay';
  const PARAM_KEYS = Object.keys(DEFAULTS);

  function mapStep(x, params) {
    const scaled = params.lambda * x, band = Math.floor(scaled / params.vTh);
    const branch = band % 2 === 0 ? 'Even' : 'Odd';
    return { value: branch === 'Even' ? scaled / 2 : 3 * scaled + params.vShift, band, branch };
  }
  function validate(params) {
    const limits = { lambda: [0.1, 1.5], vTh: [0.5, 5], vShift: [0, 5], x0: [0.1, 10], iterations: [10, 200] };
    for (const [key, [min, max]] of Object.entries(limits)) {
      if (!Number.isFinite(params[key]) || params[key] < min || params[key] > max) throw new RangeError(`Invalid ${key}`);
    }
    if (!Number.isInteger(params.iterations)) throw new RangeError('Iterations must be an integer.');
  }
  function buildRun(params, mode = RAW) {
    validate(params);
    if (![RAW, CAPPED].includes(mode)) throw new RangeError('Unknown recurrence mode.');
    const orbit = [{ n: 0, x: params.x0 }], transitions = [], segments = [];
    let current = params.x0, cursor = { x: current, y: 0 }, escapeAt = null, cappedSteps = 0;
    for (let n = 1; n <= params.iterations; n++) {
      const result = mapStep(current, params), rawNext = result.value;
      const next = mode === CAPPED ? Math.min(rawNext, 100) : rawNext;
      const capped = next !== rawNext;
      transitions.push({ n, from: current, to: next, rawNext, band: result.band, branch: result.branch, capped });
      const corner = { x: current, y: next }, diagonal = { x: next, y: next };
      segments.push({ n, phase: 'vertical', from: cursor, to: corner, branch: result.branch, band: result.band });
      segments.push({ n, phase: 'horizontal', from: corner, to: diagonal, branch: result.branch, band: result.band });
      orbit.push({ n, x: next }); cursor = diagonal; current = next;
      if (capped) cappedSteps++;
      if (!Number.isFinite(current) || (mode === RAW && current > 100)) { escapeAt = n; break; }
    }
    return { params: { ...params }, mode, orbit, transitions, segments, escapeAt, cappedSteps };
  }
  function playback(run, value, action) {
    const total = run.segments.length, position = Math.min(total, Math.max(0, value.position));
    if (action === 'reset') return { position: 0, playing: false };
    if (action === 'play') return { position: position === total ? 0 : position, playing: total > 0 };
    if (action === 'pause') return { position, playing: false };
    if (action === 'show-all') return { position: total, playing: false };
    if (action === 'step' || (action === 'tick' && value.playing)) {
      const next = Math.min(total, position + 1);
      return { position: next, playing: action === 'tick' && next < total };
    }
    return { position, playing: Boolean(value.playing) };
  }
  function mapSegments(params, limit, mode = RAW) {
    const result = [], width = params.vTh / params.lambda;
    for (let band = 0; band * width < limit; band++) {
      const start = band * width, end = Math.min(limit, (band + 1) * width);
      const slope = (band % 2 === 0 ? 0.5 : 3) * params.lambda;
      const offset = band % 2 === 0 ? 0 : params.vShift;
      const points = [{ x: start, y: slope * start + offset }];
      if (mode === CAPPED) {
        const crossing = (100 - offset) / slope;
        if (crossing > start && crossing < end) points.push({ x: crossing, y: 100 });
      }
      points.push({ x: end, y: slope * end + offset });
      if (mode === CAPPED) points.forEach(point => { point.y = Math.min(point.y, 100); });
      result.push({ band, points, openEnd: end === (band + 1) * width });
    }
    return result;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { DEFAULTS, RAW, CAPPED, mapStep, buildRun, playback, mapSegments };
  if (typeof document === 'undefined') return;

  let run = buildRun(DEFAULTS), elapsed = 0, applying = false;
  const { state, ui } = WH.createApp({
    title: 'Poincaré return-map specimen and cobweb',
    params: {
      lambda: { value: DEFAULTS.lambda, min: 0.1, max: 1.5, step: 0.01, label: 'Multiplier λ' },
      vTh: { value: DEFAULTS.vTh, min: 0.5, max: 5, step: 0.1, label: 'Threshold Vth' },
      vShift: { value: DEFAULTS.vShift, min: 0, max: 5, step: 0.1, label: 'Shift Vshift' },
      x0: { value: DEFAULTS.x0, min: 0.1, max: 10, step: 0.1, label: 'Initial x₀' },
      iterations: { value: DEFAULTS.iterations, min: 10, max: 200, step: 1, label: 'Iterations (N)' },
      window: { value: 'Orbit focus', options: ['Orbit focus', 'Original 0–20'], label: 'Map window' },
      mode: { value: RAW, options: [RAW, CAPPED], label: 'Recurrence' },
      play: { type: 'play', value: false, label: 'Cobweb' },
      step: { type: 'button', label: 'Next leg', onClick: () => applyPlayback('step') },
      reset: { type: 'button', label: 'Reset trace', onClick: () => applyPlayback('reset') },
      all: { type: 'button', label: 'Show full trace', onClick: () => applyPlayback('show-all') },
      example: { type: 'button', label: 'Jump example', onClick: () => loadParams({ ...DEFAULTS, lambda: 1, x0: 2 }) },
      defaults: { type: 'button', label: 'Original defaults', onClick: () => loadParams(DEFAULTS) }
    }
  });
  state.position = 6;
  const { vizTop, vizBottom } = ui.splitViz();
  vizTop.classList.add('pc-map'); vizBottom.classList.add('pc-orbit');
  const readout = document.createElement('output'); readout.id = 'pc-readout'; readout.className = 'pc-readout';
  readout.setAttribute('aria-live', 'polite'); readout.setAttribute('aria-atomic', 'true');
  const modeNote = document.createElement('p'); modeNote.className = 'pc-mode-note';
  document.getElementById('viz').before(modeNote);
  document.getElementById('viz').after(readout);
  const ledger = document.createElement('details'); ledger.className = 'pc-ledger';
  const summary = document.createElement('summary'); summary.textContent = 'Inspect the complete finite orbit';
  const tableHost = document.createElement('div'); tableHost.className = 'ix-table-host'; tableHost.tabIndex = 0;
  tableHost.setAttribute('role', 'region'); tableHost.setAttribute('aria-label', 'Finite orbit values and branch decisions');
  ledger.append(summary, tableHost); document.getElementById('widget').append(ledger);
  const format = value => Number.isFinite(value) ? Number(value.toPrecision(6)).toString() : String(value);

  function params() { return Object.fromEntries(PARAM_KEYS.map(key => [key, state[key]])); }
  function applyPlayback(action) {
    const next = playback(run, { position: state.position, playing: state.play }, action);
    applying = true; state.position = next.position; state.play = next.playing; applying = false;
    elapsed = 0; updateReadout();
  }
  function loadParams(values) {
    applying = true;
    for (const key of PARAM_KEYS) state[key] = values[key];
    state.mode = RAW; state.window = 'Orbit focus'; applying = false;
    recompute();
  }
  function updateLedger() {
    const table = document.createElement('table'); table.className = 'ix-table';
    const caption = document.createElement('caption'); caption.textContent = `${run.mode} · ${run.orbit.length - 1} recorded steps`;
    const head = document.createElement('thead'), headRow = document.createElement('tr'), body = document.createElement('tbody');
    ['n', 'xₙ', 'Branch used', 'Raw F(xₙ₋₁)'].forEach(label => { const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = label; headRow.append(cell); });
    head.append(headRow);
    run.orbit.forEach(point => {
      const tr = document.createElement('tr'); tr.dataset.n = point.n;
      const transition = run.transitions[point.n - 1];
      [point.n, format(point.x), transition ? `${transition.branch} · band ${transition.band}${transition.capped ? ' · capped' : ''}` : 'Initial value', transition ? format(transition.rawNext) : '—'].forEach(value => { const cell = document.createElement('td'); cell.textContent = String(value); tr.append(cell); });
      body.append(tr);
    });
    table.append(caption, head, body); tableHost.replaceChildren(table);
  }
  function updateReadout() {
    const n = Math.ceil(state.position / 2), point = run.orbit[n];
    const segment = run.segments[state.position - 1], transition = run.transitions[n - 1];
    const branch = transition || mapStep(state.x0, params());
    ui.setHUD([
      { label: `Current iterate x${n}`, value: format(point.x) },
      { label: 'Cobweb legs', value: `${state.position} / ${run.segments.length}` },
      { label: segment ? 'Branch used' : 'Next branch', value: `${branch.branch} · band ${branch.band}` },
      { label: 'Finite run', value: run.escapeAt === null ? `${run.orbit.length - 1} steps recorded` : `Above 100 at n = ${run.escapeAt}` }
    ]);
    const capText = transition?.capped ? ` Capped replay replaces raw ${format(transition.rawNext)} with 100.` : '';
    readout.textContent = !segment ? `Start at (x₀, 0) = (${format(state.x0)}, 0). Next leg moves vertically to F(x₀).` :
      segment.phase === 'vertical' ? `Leg ${state.position}: vertical map evaluation, x${n - 1} = ${format(transition.from)} → x${n} = ${format(transition.to)}. ${transition.branch} branch, band ${transition.band}.${capText}` :
      `Leg ${state.position}: horizontal return to y = x at (${format(point.x)}, ${format(point.x)}). Iteration ${n} is complete.${capText}`;
    tableHost.querySelectorAll('[data-n]').forEach(row => row.setAttribute('aria-current', String(Number(row.dataset.n) === n)));
    const full = state.position === run.segments.length;
    ui.setStatus(full ? 'Trace complete. Play replays from the start; Reset returns to x₀.' : 'Next leg alternates vertical map evaluation and horizontal return to y = x.');
  }
  function recompute() {
    run = buildRun(params(), state.mode); elapsed = 0;
    applying = true; state.play = false; state.position = 0; applying = false;
    modeNote.dataset.capped = String(state.mode === CAPPED);
    modeNote.textContent = state.mode === CAPPED ? `Original capped replay: xₙ₊₁ = min(F(xₙ), 100). ${run.cappedSteps} values are capped in this finite run; this changes the recurrence.` :
      'Raw recurrence: record the first x > 100, then stop. The cutoff is a viewing rule.';
    updateLedger(); updateReadout();
  }
  state._subscribe(key => {
    if (applying) return;
    if (PARAM_KEYS.includes(key) || key === 'mode') recompute();
    else if (key === 'play') applyPlayback(state.play ? 'play' : 'pause');
  });
  ui.setLegend([
    { label: 'F(x)', color: '--chart-1' },
    { label: 'y = x', color: '--on-surface-variant' },
    { label: 'Cobweb', color: '--negative' },
    { label: 'Current leg', color: '--positive' },
    { label: 'Finite orbit', color: '--chart-2' }
  ]);

  function mapLimit() {
    if (state.window === 'Original 0–20') return 20;
    let limit = Math.max(1, ...run.orbit.map(point => point.x * 1.12));
    const first = state.vTh / state.lambda;
    if (first < limit * 1.6) limit = Math.max(limit, first * 1.12);
    return limit;
  }
  function axes(ctx, width, height, xMax, yMax, title, xLabel, yLabel) {
    const left = 48, right = width - 17, top = 42, bottom = height - 43;
    const x = value => left + value / xMax * (right - left), y = value => bottom - value / yMax * (bottom - top);
    ctx.font = '10px system-ui'; ctx.textBaseline = 'middle';
    for (let tick = 0; tick <= 4; tick++) {
      const px = x(xMax * tick / 4), py = y(yMax * tick / 4);
      ctx.strokeStyle = '#e6e9f4'; ctx.lineWidth = 1; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bottom); ctx.moveTo(left, py); ctx.lineTo(right, py); ctx.stroke();
      ctx.fillStyle = WH.getColor('--on-surface-variant'); ctx.textAlign = 'center'; ctx.fillText(Number((xMax * tick / 4).toPrecision(3)), px, bottom + 15);
      ctx.textAlign = 'right'; ctx.fillText(Number((yMax * tick / 4).toPrecision(3)), left - 7, py);
    }
    ctx.fillStyle = WH.getColor('--on-surface-default'); ctx.font = '600 11px system-ui'; ctx.textAlign = 'left'; ctx.fillText(title, 14, 19);
    ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.fillText(xLabel, (left + right) / 2, height - 11);
    ctx.save(); ctx.translate(12, (top + bottom) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(yLabel, 0, 0); ctx.restore();
    return { x, y, left, right, top, bottom };
  }
  function trace(ctx, segments, x, y, color, width, alpha = 1) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; ctx.setLineDash([]);
    ctx.beginPath(); segments.forEach(segment => { ctx.moveTo(x(segment.from.x), y(segment.from.y)); ctx.lineTo(x(segment.to.x), y(segment.to.y)); }); ctx.stroke(); ctx.globalAlpha = 1;
  }
  function dot(ctx, x, y, radius, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, 2 * Math.PI); ctx.fill(); }
  WH.initCanvas(vizTop, ({ ctx, width, height }) => () => {
    const limit = mapLimit(), a = axes(ctx, width, height, limit, limit, 'Return map & cobweb', 'xₙ', 'xₙ₊₁');
    const { x, y, left, top, right, bottom } = a;
    ctx.save(); ctx.beginPath(); ctx.rect(left - 4, top, right - left + 4, bottom - top + 4); ctx.clip();
    ctx.strokeStyle = WH.getColor('--on-surface-variant'); ctx.lineWidth = 1.8; ctx.setLineDash([7, 5]);
    ctx.beginPath(); ctx.moveTo(x(0), y(0)); ctx.lineTo(x(limit), y(limit)); ctx.stroke(); ctx.setLineDash([]);
    mapSegments(params(), limit, state.mode).forEach(segment => {
      ctx.strokeStyle = WH.getColor('--chart-1'); ctx.lineWidth = 2;
      ctx.beginPath(); segment.points.forEach((point, index) => index ? ctx.lineTo(x(point.x), y(point.y)) : ctx.moveTo(x(point.x), y(point.y))); ctx.stroke();
      if (state.vTh / state.lambda / limit * (right - left) > 12) {
        const first = segment.points[0], last = segment.points.at(-1);
        dot(ctx, x(first.x), y(first.y), 2.5, WH.getColor('--chart-1'));
        if (segment.openEnd) { dot(ctx, x(last.x), y(last.y), 2.5, WH.getColor('--surface')); ctx.beginPath(); ctx.arc(x(last.x), y(last.y), 2.5, 0, 2 * Math.PI); ctx.stroke(); }
      }
    });
    if (state.mode === CAPPED && limit > 100) {
      ctx.setLineDash([3, 4]); ctx.strokeStyle = WH.getColor('--chart-4'); ctx.beginPath(); ctx.moveTo(left, y(100)); ctx.lineTo(right, y(100)); ctx.stroke(); ctx.setLineDash([]);
    }
    trace(ctx, run.segments, x, y, WH.getColor('--negative'), 2, 0.24);
    trace(ctx, run.segments.slice(0, state.position), x, y, WH.getColor('--negative'), 3.4);
    const current = run.segments[state.position - 1];
    if (current) {
      trace(ctx, [current], x, y, WH.getColor('--positive'), 4.5);
      const dx = x(current.to.x) - x(current.from.x), dy = y(current.to.y) - y(current.from.y), length = Math.hypot(dx, dy);
      if (length > 18) {
        const px = x(current.from.x) + dx * 0.62, py = y(current.from.y) + dy * 0.62, ux = dx / length, uy = dy / length;
        ctx.fillStyle = WH.getColor('--positive'); ctx.beginPath(); ctx.moveTo(px + ux * 5, py + uy * 5); ctx.lineTo(px - ux * 5 - uy * 4, py - uy * 5 + ux * 4); ctx.lineTo(px - ux * 5 + uy * 4, py - uy * 5 - ux * 4); ctx.closePath(); ctx.fill();
      }
      dot(ctx, x(current.to.x), y(current.to.y), 5, WH.getColor('--positive'));
      const transition = run.transitions[current.n - 1];
      if (transition.capped && current.phase === 'vertical') {
        ctx.setLineDash([3, 4]); ctx.strokeStyle = WH.getColor('--chart-4'); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x(transition.from), y(transition.to)); ctx.lineTo(x(transition.from), y(transition.rawNext)); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    dot(ctx, x(state.x0), y(0), 4, WH.getColor('--negative'));
    ctx.restore();
    if (run.orbit.some(point => point.x > limit)) {
      ctx.fillStyle = WH.getColor('--positive'); ctx.textAlign = 'right'; ctx.font = '10px system-ui'; ctx.fillText('Trace continues outside this window', right, top - 12);
    }
  });
  WH.initCanvas(vizBottom, ({ ctx, width, height }) => () => {
    const xMax = Math.max(1, run.orbit.length - 1), yMax = Math.max(1, ...run.orbit.map(point => point.x * 1.12));
    const { x, y, left, top, right, bottom } = axes(ctx, width, height, xMax, yMax, 'Finite orbit · same iteration', 'Iteration n', 'xₙ');
    ctx.save(); ctx.beginPath(); ctx.rect(left - 4, top, right - left + 8, bottom - top + 4); ctx.clip();
    const threshold = state.vTh / state.lambda;
    if (threshold <= yMax) { ctx.strokeStyle = WH.getColor('--chart-3'); ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(left, y(threshold)); ctx.lineTo(right, y(threshold)); ctx.stroke(); ctx.setLineDash([]); }
    ctx.strokeStyle = WH.getColor('--chart-2'); ctx.lineWidth = 2; ctx.globalAlpha = 0.55;
    ctx.beginPath(); run.orbit.forEach((point, index) => index ? ctx.lineTo(x(point.n), y(point.x)) : ctx.moveTo(x(point.n), y(point.x))); ctx.stroke(); ctx.globalAlpha = 1;
    const n = Math.ceil(state.position / 2);
    ctx.strokeStyle = WH.getColor('--chart-2'); ctx.lineWidth = 3;
    ctx.beginPath(); run.orbit.slice(0, n + 1).forEach((point, index) => index ? ctx.lineTo(x(point.n), y(point.x)) : ctx.moveTo(x(point.n), y(point.x))); ctx.stroke();
    if (run.orbit.length <= 51) run.orbit.forEach(point => dot(ctx, x(point.n), y(point.x), 2.2, WH.getColor('--chart-2')));
    const current = run.orbit[n]; dot(ctx, x(current.n), y(current.x), 5, WH.getColor('--positive'));
    if (run.escapeAt !== null) {
      ctx.strokeStyle = WH.getColor('--negative'); ctx.setLineDash([4, 3]); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(left, y(100)); ctx.lineTo(right, y(100)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = WH.getColor('--negative'); ctx.textAlign = 'left'; ctx.font = '10px system-ui'; ctx.fillText('100 · display cutoff', left + 5, y(100) - 9);
    }
    ctx.restore();
  });
  vizTop.querySelector('canvas')?.setAttribute('aria-label', 'Return map with separately drawn threshold branches, dashed y=x, coral cobweb and gold current leg. Next leg and Play controls reveal the iteration; exact values follow below.');
  vizBottom.querySelector('canvas')?.setAttribute('aria-label', 'Finite orbit: iterate index n against x_n. The gold point matches the revealed cobweb step. Exact values are available in the finite orbit table.');
  WH.onFrame(({ dt }) => {
    if (!state.play) return;
    elapsed += dt;
    if (elapsed < 0.55) return;
    elapsed -= 0.55;
    const next = playback(run, { position: state.position, playing: true }, 'tick');
    applying = true; state.position = next.position; state.play = next.playing; applying = false; updateReadout();
  });
  modeNote.textContent = 'Raw recurrence: record the first x > 100, then stop. The cutoff is a viewing rule.';
  updateLedger(); updateReadout();
}());
