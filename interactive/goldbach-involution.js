/* Gemini contribution · source interactive_visual_im_9df25cf48edc7ed6.html.
 * The supplied prime-indicator projections, range and normalization are preserved.
 * Local Canvas rendering and an inspectable orbit ledger replace the hosted shell. */
(function () {
  'use strict';
  const MIN_N = 10, MAX_N = 150, DEFAULT_N = 30;

  function isPrime(value) {
    if (!Number.isInteger(value) || value < 2) return false;
    for (let divisor = 2; divisor * divisor <= value; divisor++) {
      if (value % divisor === 0) return false;
    }
    return true;
  }

  function analyze(N) {
    if (!Number.isInteger(N) || N % 2 !== 0 || N < MIN_N || N > MAX_N) {
      throw new RangeError('Choose an even integer from 10 through 150.');
    }
    const P = Array.from({ length: N }, (_, k) => k > 0 && isPrime(k) ? 1 : 0);
    let ePlus = 0, eMinus = 0, primeCount = 0, orderedPairs = 0;
    // Full-vector sums exactly match Gemini's source, including both mirror indices.
    for (let k = 1; k < N; k++) {
      ePlus += ((P[k] + P[N - k]) / 2) ** 2;
      eMinus += ((P[k] - P[N - k]) / 2) ** 2;
      primeCount += P[k];
      orderedPairs += P[k] * P[N - k];
    }
    const orbits = [];
    for (let k = 1; k <= N / 2; k++) {
      const nk = N - k, kPrime = Boolean(P[k]), nkPrime = Boolean(P[nk]);
      const category = kPrime && nkPrime ? 'Prime–prime' : kPrime || nkPrime ? 'Prime–non-prime' : 'Non-prime–non-prime';
      const weight = k === nk ? 1 : 2;
      const plus = (P[k] + P[nk]) / 2, minus = (P[k] - P[nk]) / 2;
      orbits.push({ k, nk, kPrime, nkPrime, category, weight, plus, minus,
        ePlus: weight * plus ** 2, eMinus: weight * minus ** 2 });
    }
    const pairs = orbits.filter(orbit => orbit.kPrime && orbit.nkPrime);
    const totalEnergy = ePlus + eMinus;
    return { N, orbits, pairs, primeCount, orderedPairs, diagonal: P[N / 2],
      ePlus, eMinus, totalEnergy, rho: totalEnergy === 0 ? 0 : eMinus / totalEnergy };
  }

  // The pure calculation is also used by the independent finite-range verifier.
  if (typeof module !== 'undefined' && module.exports) module.exports = { analyze, isPrime, MIN_N, MAX_N, DEFAULT_N };
  if (typeof document === 'undefined') return;

  const { state, ui } = WH.createApp({
    title: 'Goldbach involution: symmetric and antisymmetric energy',
    params: {
      n: { value: DEFAULT_N, min: MIN_N, max: MAX_N, step: 2, label: 'Even integer (N)' },
      orbit: { value: 7, min: 1, max: DEFAULT_N / 2, step: 1, label: 'Inspect orbit (k)' }
    }
  });
  let analysis = analyze(state.n);
  const viz = document.getElementById('viz');
  viz.classList.add('ix-plot', 'gb-orbit-plot');
  const readout = document.createElement('output');
  readout.id = 'gb-orbit-readout'; readout.className = 'gb-readout';
  readout.setAttribute('aria-live', 'polite'); readout.setAttribute('aria-atomic', 'true');
  readout.htmlFor = 'control-n control-orbit';
  viz.after(readout);
  const pairList = document.createElement('p');
  pairList.className = 'gb-prime-pairs'; pairList.id = 'gb-prime-pairs'; readout.after(pairList);
  const ledger = document.createElement('details');
  ledger.className = 'gb-ledger';
  const ledgerSummary = document.createElement('summary');
  const tableHost = document.createElement('div'); tableHost.className = 'ix-table-host';
  tableHost.tabIndex = 0; tableHost.setAttribute('role', 'region'); tableHost.setAttribute('aria-label', 'All mirror orbits and exact energy contributions');
  ledger.append(ledgerSummary, tableHost); document.getElementById('widget').append(ledger);
  const nInput = document.getElementById('control-n'), orbitInput = document.getElementById('control-orbit');
  nInput.setAttribute('aria-describedby', 'gb-prime-pairs');
  orbitInput.setAttribute('aria-describedby', readout.id);

  function appendCell(row, tag, value) {
    const cell = document.createElement(tag); cell.textContent = String(value);
    if (tag === 'th') cell.scope = 'col';
    row.append(cell); return cell;
  }
  function updateLedger() {
    ledgerSummary.textContent = `Inspect all ${analysis.orbits.length} mirror orbits`;
    const table = document.createElement('table'); table.className = 'ix-table';
    const caption = document.createElement('caption');
    caption.textContent = `N = ${analysis.N}. Energy columns include both mirror coordinates, except the central fixed point, counted once.`;
    const head = document.createElement('thead'), heading = document.createElement('tr'), body = document.createElement('tbody');
    ['k', 'N − k', 'Orbit type', 'Coordinates', 'E+ contribution', 'E− contribution'].forEach(label => appendCell(heading, 'th', label));
    head.append(heading);
    analysis.orbits.forEach(orbit => {
      const row = document.createElement('tr'); row.dataset.orbit = orbit.k;
      [orbit.k, orbit.nk, orbit.category, orbit.weight === 1 ? '1 · fixed point' : '2', orbit.ePlus.toFixed(2), orbit.eMinus.toFixed(2)].forEach(value => appendCell(row, 'td', value));
      body.append(row);
    });
    table.append(caption, head, body); tableHost.replaceChildren(table);
  }
  function updateSelection() {
    const orbit = analysis.orbits[state.orbit - 1];
    if (!orbit) return;
    readout.textContent = `Orbit k = ${orbit.k}: ${orbit.k} ↔ ${orbit.nk} · ${orbit.category.toLowerCase()} · ${orbit.weight === 1 ? 'central fixed point, counted once' : 'two mirror coordinates'} · E+ contribution ${orbit.ePlus.toFixed(2)} · E− contribution ${orbit.eMinus.toFixed(2)}.`;
    tableHost.querySelectorAll('[data-orbit]').forEach(row => row.setAttribute('aria-current', String(Number(row.dataset.orbit) === state.orbit)));
    const canvas = viz.querySelector('canvas');
    if (canvas) canvas.setAttribute('aria-label', `Goldbach mirror involution for N = ${analysis.N}. ${analysis.pairs.length} prime pairs. Selected orbit ${orbit.k} and ${orbit.nk}, ${orbit.category.toLowerCase()}. Arrow keys select an orbit; Home and End select the first and last.`);
  }
  function updateAnalysis() {
    analysis = analyze(state.n);
    orbitInput.max = String(state.n / 2);
    if (state.orbit > state.n / 2) state.orbit = state.n / 2;
    ui.setHUD([
      { label: 'Symmetric energy (E+)', value: analysis.ePlus.toFixed(2) },
      { label: 'Antisymmetric energy (E−)', value: analysis.eMinus.toFixed(2) },
      { label: 'Ratio (ρ)', value: analysis.rho.toFixed(4) }
    ]);
    pairList.textContent = `${analysis.pairs.length} unordered prime pairs for ${state.n}: ${analysis.pairs.map(pair => `${pair.k} + ${pair.nk}`).join(' · ')}.`;
    ui.setStatus(`M = ${analysis.primeCount} prime coordinates · C = ${analysis.orderedPairs} ordered prime representations · E+ + E− = ${analysis.totalEnergy} · ρ = ${(analysis.rho * 100).toFixed(2)}% of total energy.`);
    updateLedger(); updateSelection();
  }
  state._subscribe('n', updateAnalysis);
  state._subscribe('orbit', updateSelection);
  ui.setLegend([
    { label: 'Prime–prime orbit', color: '--chart-1' },
    { label: 'Prime–non-prime orbit', color: '--chart-3' },
    { label: 'Non-prime–non-prime orbit', color: '--surface-container-highest' }
  ]);
  updateAnalysis();

  WH.initCanvas(viz, ({ ctx, width, height }) => {
    return () => {
      const left = 45, right = width - 20, mid = analysis.N / 2;
      const x = k => left + (k - 1) / (mid - 1) * (right - left);
      const top = Math.round(height * 0.26), bottom = Math.round(height * 0.73);
      const pitch = (right - left) / (mid - 1), radius = Math.min(4, Math.max(1.25, pitch * 0.32));
      ctx.font = '11px system-ui'; ctx.fillStyle = WH.getColor('--on-surface-default'); ctx.textAlign = 'left';
      ctx.fillText(`Mirror involution · N = ${analysis.N}`, 16, 25);
      ctx.font = '10px system-ui'; ctx.fillStyle = WH.getColor('--on-surface-variant');
      ctx.fillText('k', 12, top + 4); ctx.fillText('N−k', 8, bottom + 4);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = WH.getColor('--stroke-emphasis'); ctx.globalAlpha = 0.4; ctx.lineWidth = 1;
      [top, bottom].forEach(y => { ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke(); });
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      const selectedX = x(state.orbit);
      ctx.fillStyle = '#edf4eb12'; ctx.fillRect(selectedX - Math.max(5, pitch * 0.4), top - 13, Math.max(10, pitch * 0.8), bottom - top + 26);
      analysis.orbits.forEach(orbit => {
        const px = x(orbit.k), both = orbit.kPrime && orbit.nkPrime, neither = !orbit.kPrime && !orbit.nkPrime;
        ctx.strokeStyle = WH.getColor(both ? '--chart-1' : neither ? '--surface-container-highest' : '--chart-3');
        ctx.globalAlpha = neither ? 0.4 : 1;
        ctx.lineWidth = Math.min(pitch * 0.65, both ? 3 : 1.5);
        ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bottom); ctx.stroke(); ctx.globalAlpha = 1;
        [[top, orbit.kPrime], [bottom, orbit.nkPrime]].forEach(([py, prime]) => {
          ctx.fillStyle = WH.getColor(prime ? '--chart-1' : '--surface-container-highest');
          ctx.strokeStyle = WH.getColor('--on-surface-default'); ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.arc(px, py, radius, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
        });
        if (orbit.k % 10 === 0 || orbit.k === 1 || orbit.k === mid) {
          // Keep Gemini's numeric annotations; skip the penultimate label if the end would collide.
          if (orbit.k !== mid && orbit.k !== 1 && (mid - orbit.k) * pitch < 22) return;
          ctx.fillStyle = WH.getColor('--on-surface-default'); ctx.font = '10px system-ui'; ctx.textAlign = 'center';
          ctx.fillText(String(orbit.k), px, top - 21); ctx.fillText(String(orbit.nk), px, bottom + 29);
        }
      });
      ctx.strokeStyle = WH.getColor('--on-surface-default'); ctx.lineWidth = 1.5;
      [top, bottom].forEach(y => { ctx.beginPath(); ctx.arc(selectedX, y, radius + 3, 0, 2 * Math.PI); ctx.stroke(); });
      ctx.fillStyle = WH.getColor('--on-surface-variant'); ctx.font = '10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(width < 400 ? 'Select a column to inspect its orbit' : 'One column per mirror orbit · select a column to inspect', width / 2, height - 15);
    };
  });
  const canvas = viz.querySelector('canvas');
  if (canvas) {
    canvas.tabIndex = 0; canvas.setAttribute('aria-describedby', readout.id);
    canvas.addEventListener('pointerdown', event => {
      const box = canvas.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width * Math.max(240, viz.clientWidth);
      const last = analysis.N / 2;
      state.orbit = Math.max(1, Math.min(last, Math.round(1 + (px - 45) / (Math.max(240, viz.clientWidth) - 65) * (last - 1))));
    });
    canvas.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const last = analysis.N / 2;
      state.orbit = event.key === 'Home' ? 1 : event.key === 'End' ? last :
        Math.max(1, Math.min(last, state.orbit + (['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : -1)));
    });
  }
  updateSelection();
}());
