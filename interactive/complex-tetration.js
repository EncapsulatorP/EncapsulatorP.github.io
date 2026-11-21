/* Gemini contribution: gemini-code-1795274340354.html.
 * Original iteration, palette, noise and per-step sheet choices retained.
 * Finite labels, responsive canvas, singular-base handling and lifecycle adapted. */
(function () {
  'use strict';
  const VIEW = Object.freeze({ reMin: -3.2, reMax: 3.8, imMin: -2.6, imMax: 2.6 });
  const ESCAPE_R2 = 1e8;
  const TOLERANCE = 1e-4;

  function tetrationStep(zr, zi, lr, li) {
    const u = zr * lr - zi * li, v = zr * li + zi * lr;
    if (u > 25 || !Number.isFinite(u) || !Number.isFinite(v)) return null;
    const eu = Math.exp(u);
    return [eu * Math.cos(v), eu * Math.sin(v)];
  }
  function logarithm(base) {
    const mag = Math.hypot(base.re, base.im);
    return mag < 1e-12 || !Number.isFinite(mag) ? null : [Math.log(mag), Math.atan2(base.im, base.re)];
  }
  function randn(random) {
    let u = 0, v = 0;
    while (u === 0) u = random();
    while (v === 0) v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function orbit(base, count, options = {}) {
    const log = logarithm(base), points = [{ re: base.re, im: base.im, k: 0 }];
    const result = { points, state: 'survived', escapedAt: null, toleranceAt: null, jumps: 0 };
    if (!log) { result.state = 'undefined'; return result; }
    let zr = base.re, zi = base.im;
    const random = options.random || Math.random, probability = options.pBranch || 0;
    for (let n = 1; n <= count; n++) {
      const k = random() < probability ? (random() < .5 ? -1 : 1) : 0;
      if (k) result.jumps++;
      const next = tetrationStep(zr, zi, log[0], log[1] + 2 * Math.PI * k);
      if (!next || !Number.isFinite(next[0] * next[0] + next[1] * next[1]) || next[0] * next[0] + next[1] * next[1] > ESCAPE_R2) {
        result.state = 'escaped'; result.escapedAt = n; break;
      }
      const [nr, ni] = next;
      points.push({ re: nr, im: ni, k });
      if (options.stopOnTolerance !== false && Math.hypot(nr - zr, ni - zi) < TOLERANCE) {
        result.state = 'tolerance'; result.toleranceAt = n; break;
      }
      zr = nr; zi = ni;
    }
    return result;
  }
  function ensemble(base, count, size, sigma, probability, random = Math.random) {
    const paths = [];
    for (let m = 0; m < size; m++) {
      const perturbed = { re: base.re + randn(random) * sigma, im: base.im + randn(random) * sigma };
      paths.push(orbit(perturbed, count, { pBranch: probability, random, stopOnTolerance: false }));
    }
    return paths;
  }
  function fieldSample(re, im, count) {
    const log = logarithm({ re, im });
    if (!log) return { state: 'undefined', re, im, escapedIndex: -1 };
    let zr = re, zi = im;
    for (let n = 0; n < count; n++) {
      const next = tetrationStep(zr, zi, log[0], log[1]);
      if (!next || !Number.isFinite(next[0] * next[0] + next[1] * next[1]) || next[0] * next[0] + next[1] * next[1] > ESCAPE_R2)
        return { state: 'escaped', re: zr, im: zi, escapedIndex: n };
      const [nr, ni] = next;
      if (Math.hypot(nr - zr, ni - zi) < TOLERANCE) return { state: 'tolerance', re: nr, im: ni, escapedIndex: -1 };
      zr = nr; zi = ni;
    }
    return { state: 'survived', re: zr, im: zi, escapedIndex: -1 };
  }
  function fieldColor(sample, count) {
    if (sample.state === 'undefined') return [15, 18, 26];
    if (sample.state === 'tolerance') {
      const arg = Math.atan2(sample.im, sample.re);
      return [Math.floor(30 + 35 * Math.cos(arg)), Math.floor(75 + 55 * Math.cos(arg - 2.094)), Math.floor(145 + 75 * Math.cos(arg + 2.094))];
    }
    if (sample.state === 'survived') return [22, 42, 68];
    const v = Math.floor(12 + 190 * Math.pow(Math.min(1, sample.escapedIndex / count), .55));
    return [Math.floor(v * .85), Math.floor(v * .45), Math.floor(v * .32)];
  }
  const model = { VIEW, ESCAPE_R2, TOLERANCE, tetrationStep, logarithm, orbit, ensemble, fieldSample, fieldColor };
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  if (typeof document === 'undefined') return;

  let seed = { re: 1.32, im: .38 }, principal, paths = [], field = null;
  const { state, ui } = WH.createApp({
    title: 'Complex tetration, Shell–Thron basin and stochastic sheet jumps',
    params: {
      maxIter: { value: 64, min: 16, max: 160, step: 8, label: 'Iterations (N)' },
      pBranch: { value: .08, min: 0, max: .4, step: .01, label: 'Sheet-jump probability pₖ' },
      sigma: { value: .015, min: 0, max: .08, step: .005, label: 'Base perturbation σ' },
      ensembleSize: { value: 24, min: 4, max: 60, step: 4, label: 'Ensemble orbits (M)' },
      lowerCritical: { type: 'button', label: 'c = e⁻ᵉ', onClick: () => setSeed(Math.exp(-Math.E), 0) },
      upperCritical: { type: 'button', label: 'c = e¹/ᵉ', onClick: () => setSeed(Math.exp(1 / Math.E), 0) },
      originalSeed: { type: 'button', label: 'Original complex seed', onClick: () => setSeed(1.32, .38) },
      resample: { type: 'button', label: 'Resample ensemble', onClick: resample }
    }
  });
  const root = document.getElementById('widget'), stage = document.getElementById('viz');
  stage.classList.add('ct-stage');
  const seedFields = document.createElement('div'); seedFields.className = 'ct-seed';
  const reInput = seedInput('Real part of c', 'ct-seed-re', VIEW.reMin, VIEW.reMax);
  const imInput = seedInput('Imaginary part of c', 'ct-seed-im', VIEW.imMin, VIEW.imMax);
  const hint = document.createElement('p'); hint.textContent = 'Click the basin to seed an orbit. Focus it and use arrow keys to move c; hold Shift for a finer step.';
  seedFields.append(hint); stage.before(seedFields);
  const caption = document.createElement('p'); caption.className = 'ct-caption';
  caption.innerHTML = '<strong>Read the field.</strong> Basin tint: successive-step tolerance met. Dark blue: undecided after N updates. Brown: escape recorded. Background = bases c; paths = states z on the same scale.';
  stage.after(caption);
  const status = root.querySelector('.ix-status'); status.classList.add('ct-status'); status.setAttribute('role', 'status');
  ui.setLegend([
    { label: 'Principal orbit', color: '#ffffff' },
    { label: 'Ensemble: survived N', color: '#4589ff' },
    { label: 'Ensemble: escaped', color: '#ff6b6b' },
    { label: 'Sheet choice k = ±1', color: '#e0be73' }
  ]);
  function seedInput(labelText, id, min, max) {
    const label = document.createElement('label'); label.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'number'; input.id = id; input.min = min; input.max = max; input.step = 'any';
    input.addEventListener('change', () => {
      const re = reInput.valueAsNumber, im = imInput.valueAsNumber;
      const valid = Number.isFinite(re) && Number.isFinite(im) && re >= VIEW.reMin && re <= VIEW.reMax && im >= VIEW.imMin && im <= VIEW.imMax;
      reInput.setAttribute('aria-invalid', String(!valid)); imInput.setAttribute('aria-invalid', String(!valid));
      if (valid) setSeed(re, im);
      else ui.setStatus('Choose a real part from −3.2 to 3.8 and an imaginary part from −2.6 to 2.6.');
    });
    label.append(input); seedFields.append(label); return input;
  }
  function setSeed(re, im) {
    seed = { re, im };
    reInput.value = Number(re.toPrecision(15)); imInput.value = Number(im.toPrecision(15));
    reInput.removeAttribute('aria-invalid'); imInput.removeAttribute('aria-invalid');
    resample();
  }
  function resample() {
    principal = orbit(seed, state.maxIter);
    paths = ensemble(seed, state.maxIter, state.ensembleSize, state.sigma, state.pBranch);
    const survived = paths.filter(path => path.state === 'survived').length;
    const escapes = paths.filter(path => path.state === 'escaped').map(path => path.escapedAt);
    const undefinedCount = paths.filter(path => path.state === 'undefined').length;
    const validCount = paths.length - undefinedCount;
    const zeroBase = seed.re === 0 && seed.im === 0;
    const principalLabel = principal.state === 'undefined' ? (zeroBase ? 'Undefined at c = 0' : 'Below numerical cutoff')
      : principal.state === 'tolerance' ? 'Tolerance met at n = ' + principal.toleranceAt
      : principal.state === 'escaped' ? 'Escaped at n = ' + principal.escapedAt
      : 'No escape in ' + state.maxIter;
    ui.setHUD([
      { label: 'Seed base c', value: seed.re.toFixed(3) + (seed.im < 0 ? ' − ' : ' + ') + Math.abs(seed.im).toFixed(3) + 'i' },
      { label: 'Principal sample', value: principalLabel },
      { label: 'Survived N updates', value: validCount ? survived + '/' + validCount + ' · ' + (100 * survived / validCount).toFixed(0) + '%' : '—' },
      { label: 'Mean escape step', value: escapes.length ? (escapes.reduce((a, b) => a + b, 0) / escapes.length).toFixed(1) : '—' }
    ]);
    root.dataset.principalState = principal.state;
    root.dataset.ensembleSurvived = String(survived);
    root.dataset.ensembleEscaped = String(escapes.length);
    root.dataset.sampledJumps = String(paths.reduce((sum, path) => sum + path.jumps, 0));
    ui.setStatus((principal.state === 'undefined'
      ? (zeroBase ? 'The principal logarithm at c = 0 is undefined. Perturbed nonzero bases can still have ensemble paths.'
        : 'The principal base is below the source’s numerical cutoff |c| < 10⁻¹².')
      : 'One fixed ensemble is shown until you change a parameter or resample.')
      + (undefinedCount ? ' Perturbed bases excluded below |c| = 10⁻¹²: ' + undefinedCount + '/' + paths.length + '.' : ''));
    WH.requestDraw();
  }
  function beginField(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(600, Math.ceil(width / 2)); canvas.height = Math.ceil(canvas.width * height / width);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#0f202c'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    return { canvas, ctx, image: ctx.createImageData(canvas.width, canvas.height), row: 0, count: state.maxIter };
  }
  function advanceField() {
    if (!field || field.row >= field.canvas.height) return;
    const w = field.canvas.width, h = field.canvas.height, startRow = field.row, deadline = performance.now() + 9;
    do {
      const ci = VIEW.imMax - field.row / h * (VIEW.imMax - VIEW.imMin);
      for (let px = 0; px < w; px++) {
        const cr = VIEW.reMin + px / w * (VIEW.reMax - VIEW.reMin);
        const color = fieldColor(fieldSample(cr, ci, field.count), field.count);
        const offset = (field.row * w + px) * 4;
        field.image.data[offset] = color[0]; field.image.data[offset + 1] = color[1];
        field.image.data[offset + 2] = color[2]; field.image.data[offset + 3] = 255;
      }
      field.row++;
    } while (field.row < h && performance.now() < deadline);
    field.ctx.putImageData(field.image, 0, 0, 0, startRow, w, field.row - startRow);
    stage.setAttribute('aria-busy', String(field.row < h));
    if (field.row < h) WH.requestDraw();
  }
  WH.initCanvas(stage, ({ ctx, width, height }) => {
    field = beginField(width, height);
    const xy = (re, im) => [(re - VIEW.reMin) / (VIEW.reMax - VIEW.reMin) * width, (VIEW.imMax - im) / (VIEW.imMax - VIEW.imMin) * height];
    function pathLine(path, color, lineWidth) {
      if (!path || path.state === 'undefined') return;
      ctx.beginPath();
      path.points.forEach((point, index) => { const [x, y] = xy(point.re, point.im); if (index) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
    }
    return () => {
      if (!field || field.count !== state.maxIter) field = beginField(width, height);
      advanceField();
      if (field) ctx.drawImage(field.canvas, 0, 0, width, height);
      const [ox, oy] = xy(0, 0);
      ctx.strokeStyle = 'rgba(255,255,255,.20)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(width, oy); ctx.moveTo(ox, 0); ctx.lineTo(ox, height); ctx.stroke();
      ctx.font = '10px ui-monospace,monospace'; ctx.fillStyle = '#cbd8e3'; ctx.textAlign = 'left';
      ctx.fillText('Im', Math.min(width - 20, ox + 6), 16); ctx.fillText('Re', width - 21, oy - 8);
      [{ re: Math.exp(-Math.E), label: 'e⁻ᵉ', dy: 14 }, { re: Math.exp(1 / Math.E), label: 'e¹/ᵉ', dy: -8 }].forEach(marker => {
        const [x, y] = xy(marker.re, 0); ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillText(marker.label, x + 6, y + marker.dy);
      });
      paths.forEach(path => pathLine(path, path.state === 'survived' ? 'rgba(69,137,255,.48)' : 'rgba(255,107,107,.38)', 1.15));
      ctx.fillStyle = 'rgba(224,190,115,.8)';
      paths.forEach(path => path.points.forEach(point => {
        if (!point.k) return;
        const [x, y] = xy(point.re, point.im);
        if (x < 0 || x > width || y < 0 || y > height) return;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      }));
      pathLine(principal, '#ffffff', 2);
      const [sx, sy] = xy(seed.re, seed.im);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#edf4eb'; ctx.font = '10px system-ui';
      ctx.fillText('c', Math.min(width - 12, sx + 12), Math.max(12, sy - 8));
      if (field && field.row < field.canvas.height) {
        ctx.fillStyle = 'rgba(10,22,31,.86)'; ctx.fillRect(8, 8, 150, 24);
        ctx.fillStyle = '#edf4eb'; ctx.fillText('Rendering basin · ' + Math.floor(100 * field.row / field.canvas.height) + '%', 16, 24);
      }
    };
  });
  const canvas = stage.querySelector('canvas');
  if (canvas) {
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', 'Complex tetration basin. Click to choose the base c. Arrow keys move the base; Shift gives finer steps. White principal orbit, blue surviving and red escaping ensemble paths.');
    canvas.addEventListener('click', event => {
      const box = canvas.getBoundingClientRect();
      setSeed(VIEW.reMin + (event.clientX - box.left) / box.width * (VIEW.reMax - VIEW.reMin),
        VIEW.imMax - (event.clientY - box.top) / box.height * (VIEW.imMax - VIEW.imMin));
    });
    canvas.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault(); const step = event.shiftKey ? .005 : .05;
      setSeed(Math.max(VIEW.reMin, Math.min(VIEW.reMax, seed.re + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0))),
        Math.max(VIEW.imMin, Math.min(VIEW.imMax, seed.im + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0))));
    });
  }
  state._subscribe(key => { if (['maxIter', 'pBranch', 'sigma', 'ensembleSize'].includes(key)) resample(); });
  setSeed(seed.re, seed.im);
}());
