/* Gemini · Recamán Obstructions — 3D Phase & Möbius Explorer.
 * Source: gemini-code-1795274358812.html; original module preserved under sources/.
 * The source's trajectory and red-hole mappings are retained exactly.
 * Atlas adaptation: finite-horizon labels, corrected ratio, local rendering and access.
 */
(function () {
  'use strict';

  function computeRecaman(N) {
    if (!Number.isSafeInteger(N) || N < 2 || N > 8000) throw new RangeError('Choose 2–8,000 terms, including a₀.');
    const seq = new Int32Array(N), dirs = new Int8Array(N), visited = new Set([0]);
    let maxVal = 0, backwardCount = 0;
    for (let n = 1; n < N; n++) {
      const candidate = seq[n - 1] - n;
      if (candidate > 0 && !visited.has(candidate)) {
        seq[n] = candidate; dirs[n] = -1; backwardCount++;
      } else {
        seq[n] = seq[n - 1] + n; dirs[n] = 1;
      }
      visited.add(seq[n]);
      maxVal = Math.max(maxVal, seq[n]);
    }
    const holes = [];
    for (let h = 1; h < maxVal; h++) if (!visited.has(h)) holes.push(h);
    return { N, seq, dirs, visited, maxVal, holes, smallestHole: holes[0] ?? null,
      backwardCount, backwardRatio: backwardCount / (N - 1) };
  }

  function trajectoryPoint(data, index, mode) {
    if (!Number.isSafeInteger(index) || index < 0 || index >= data.N - 2) throw new RangeError('Index outside the source’s N − 2 points.');
    const scale = 1 / Math.max(data.maxVal, 1);
    if (mode === 'delay') return [
      (data.seq[index] * scale - 0.5) * 2.2,
      (data.seq[index + 1] * scale - 0.5) * 2.2,
      (data.seq[index + 2] * scale - 0.5) * 2.2
    ];
    if (mode !== 'mobius') throw new RangeError('Unknown projection.');
    const u = index / data.N * Math.PI * 2;
    const v = (data.seq[index] % 6 / 5 - 0.5) * 0.9;
    const r = 1.1 + data.seq[index] * scale * 0.6;
    return [(r + v * Math.cos(u / 2)) * Math.cos(u),
      (r + v * Math.cos(u / 2)) * Math.sin(u), v * Math.sin(u / 2) + data.dirs[index] * 0.12];
  }

  function holePoint(data, h, mode) {
    if (!Number.isSafeInteger(h) || h < 1 || h >= data.maxVal || data.visited.has(h)) throw new RangeError('A finite unvisited value below the maximum is required.');
    const t = h / Math.max(data.maxVal, 1);
    if (mode === 'delay') {
      const p = (t - 0.5) * 2.2, jitter = (h % 6 - 2.5) * 0.025;
      return [p + jitter, p - jitter, p];
    }
    if (mode !== 'mobius') throw new RangeError('Unknown projection.');
    const u = t * Math.PI * 2, v = (h % 6 / 5 - 0.5) * 0.9, r = 1.1 + t * 0.6;
    return [(r + v * Math.cos(u / 2)) * Math.cos(u),
      (r + v * Math.cos(u / 2)) * Math.sin(u), v * Math.sin(u / 2)];
  }

  function buildSceneData(data, mode) {
    const trajectory = [], holes = [], stride = Math.max(1, Math.floor(data.holes.length / 4000));
    for (let i = 0; i < data.N - 2; i++) trajectory.push({ position: trajectoryPoint(data, i, mode), direction: data.dirs[i], index: i });
    for (let i = 0; i < data.holes.length; i += stride) holes.push({ position: holePoint(data, data.holes[i], mode), value: data.holes[i] });
    return { trajectory, holes, stride };
  }

  function responsiveCameraScale(width, height) {
    // Preserve the source camera on wide stages. The original cloud fits within
    // radius 2.25; this horizontal-framing allowance also fits it in portrait.
    return Math.max(1, 1.4 * height / Math.max(width, 1));
  }

  const api = { computeRecaman, trajectoryPoint, holePoint, buildSceneData, responsiveCameraScale };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  window.RecamanObstructions = api;
  const root = document.getElementById('recaman-obstructions');
  if (!root) return;
  if (window.parent !== window) document.documentElement.classList.add('ix-embedded');

  const byId = id => document.getElementById('ro-' + id);
  const format = n => n.toLocaleString('en-GB');
  const host = byId('canvas-host'), stage = byId('stage'), reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const palettes = {
    dark: { back: '#89c5ff', forward: '#70d795', hole: '#ff6269', axes: ['#b294e6', '#a4d6a2', '#87bdd9'] },
    light: { back: '#0f62fe', forward: '#198038', hole: '#da1e28', axes: ['#7b56bc', '#6b8b51', '#5f85a1'] }
  };
  let data = computeRecaman(2500), mode = 'delay', showHoles = true, theme = 'dark';
  let sceneData = buildSceneData(data, mode), playing = !reduced.matches;
  let renderer = null, controls = null, canvas = null, ctx = null, scene = null, group = null, holeCloud = null;
  let camera = null, initialPosition = null, initialTarget = null, rotation = 0, framingScale = 1;
  let width = 640, height = 500, raf = 0, lastFrame = 0, lastCanvasDraw = 0, dragging = false;
  let interactionUntil = 0, inViewport = true, remoteActive = window.parent === window, disposed = false;
  let resizeObserver = null, viewportObserver = null, heightObserver = null, liveTimer = 0;
  let projection = null, rotationMatrix = null;

  function active() { return !disposed && remoteActive && inViewport && !document.hidden; }
  function wake() { if (!raf && active() && canvas) raf = requestAnimationFrame(frame); }
  function visibility() {
    if (active()) wake();
    else { cancelAnimationFrame(raf); raf = 0; lastFrame = 0; }
  }
  function announceHeight() {
    if (window.parent !== window) window.parent.postMessage({ type: 'atlas-interactive-size', height: Math.ceil(document.body.getBoundingClientRect().height) + 2 }, location.origin);
  }
  function updateMotion() {
    byId('motion').textContent = playing ? 'Pause rotation' : 'Play rotation';
    byId('motion').setAttribute('aria-pressed', String(playing));
    wake();
  }
  function report() {
    byId('terms-value').value = format(data.N);
    byId('horizon').textContent = format(data.N - 1) + ' transitions · a₀ through a' + String(data.N - 1).replace(/\d/g, n => '₀₁₂₃₄₅₆₇₈₉'[Number(n)]);
    byId('maximum').textContent = format(data.maxVal);
    byId('smallest').textContent = data.smallestHole === null ? 'None' : format(data.smallestHole);
    byId('hole-count').textContent = format(data.holes.length);
    byId('backward').textContent = format(data.backwardCount) + ' / ' + format(data.N - 1) + ' · ' + (100 * data.backwardRatio).toFixed(1) + '%';
    byId('first-holes').textContent = data.holes.length ? data.holes.slice(0, 16).map(format).join(', ') : 'None below this prefix maximum.';
    byId('first-terms').textContent = Array.from(data.seq.slice(0, 16)).map(format).join(', ');
    byId('view-name').textContent = mode === 'delay' ? 'Delay phase space · finite triples' : 'Twisted Möbius · chosen mapping';
    byId('sampling').textContent = format(sceneData.trajectory.length) + ' trajectory points · ' + (showHoles ? format(sceneData.holes.length) + ' of ' + format(data.holes.length) + ' red holes drawn (source stride ' + sceneData.stride + ').' : 'Red holes hidden; all ' + format(data.holes.length) + ' remain counted.');
    byId('mapping').textContent = mode === 'delay'
      ? 'Red holes use the source’s diagonal map with a small remainder-modulo-6 offset. Their positions are illustrative; they are not observed triples.'
      : 'The trajectory wraps by sequence index; red holes wrap by scalar value / prefix maximum. Both retain Gemini’s twisted coordinates. The two layers are chosen mappings, not a proven manifold.';
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => { byId('live').textContent = format(data.N) + ' terms. Maximum ' + format(data.maxVal) + ', ' + format(data.holes.length) + ' finite holes. ' + byId('sampling').textContent; }, 250);
  }
  function rebuild() {
    sceneData = buildSceneData(data, mode);
    if (renderer) rebuildWebGL();
    report(); wake();
  }
  function clearGeometry() {
    if (!group) return;
    while (group.children.length) {
      const child = group.children[0];
      child.geometry?.dispose();
      if (Array.isArray(child.material)) child.material.forEach(material => material.dispose());
      else child.material?.dispose();
      group.remove(child);
    }
  }
  function rebuildWebGL() {
    clearGeometry();
    const palette = palettes[theme], positions = [], colors = [];
    const back = new THREE.Color(palette.back), forward = new THREE.Color(palette.forward);
    sceneData.trajectory.forEach(point => {
      positions.push(...point.position);
      const color = point.direction === -1 ? back : forward;
      colors.push(color.r, color.g, color.b);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    group.add(new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.024, vertexColors: true, transparent: true, opacity: 0.85 })));
    const holesGeometry = new THREE.BufferGeometry();
    holesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sceneData.holes.flatMap(point => point.position), 3));
    holeCloud = new THREE.Points(holesGeometry, new THREE.PointsMaterial({ size: 0.032, color: palette.hole, transparent: true, opacity: 0.9 }));
    holeCloud.visible = showHoles; group.add(holeCloud);
    const axes = new THREE.AxesHelper(1.3);
    axes.setColors(...palette.axes.map(color => new THREE.Color(color)));
    group.add(axes);
  }
  function configureCanvas(element) {
    element.tabIndex = 0;
    element.setAttribute('role', 'img');
    element.setAttribute('aria-label', 'Recamán 3D trajectory and red finite-gap markers. Drag to orbit. Arrow keys orbit, plus and minus zoom, R resets the camera, and Space pauses rotation.');
    element.addEventListener('keydown', onKey);
  }
  function bindControls() {
    controls?.dispose();
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true; controls.dampingFactor = 0.06;
    controls.minDistance = 0.8 * framingScale; controls.maxDistance = 20 * framingScale;
    controls.addEventListener('start', () => { dragging = true; interactionUntil = performance.now() + 1000; wake(); });
    controls.addEventListener('end', () => { dragging = false; interactionUntil = performance.now() + 600; wake(); });
    controls.addEventListener('change', () => { interactionUntil = performance.now() + 180; wake(); });
    if (!initialTarget) initialTarget = controls.target.clone();
  }
  function setupRenderer() {
    // Three's camera/OrbitControls work for both renderers; WebGL is optional.
    if (!window.THREE || !THREE.OrbitControls) {
      byId('renderer').textContent = 'Numerical view'; byId('no-canvas').hidden = false; return;
    }
    camera = new THREE.PerspectiveCamera(48, 1, 0.01, 200);
    camera.position.set(2.4, 2.0, 2.8); camera.lookAt(0, 0, 0);
    initialPosition = camera.position.clone();
    projection = new THREE.Matrix4(); rotationMatrix = new THREE.Matrix4();
    let element = document.createElement('canvas'), context = null;
    const forceCanvas = new URLSearchParams(location.search).get('renderer') === 'canvas';
    if (!forceCanvas) {
      try { context = element.getContext('webgl2', { antialias: true, alpha: true }) || element.getContext('webgl', { antialias: true, alpha: true }); } catch (_) { /* Canvas fallback below. */ }
    }
    if (context) {
      try {
        renderer = new THREE.WebGLRenderer({ canvas: element, context, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        scene = new THREE.Scene(); group = new THREE.Group(); scene.add(group);
        canvas = renderer.domElement; byId('renderer').textContent = '3D · WebGL';
        canvas.addEventListener('webglcontextlost', event => {
          event.preventDefault();
          // Preserve exact data and camera even when a mobile GPU loses its context.
          controls?.dispose(); clearGeometry(); renderer?.dispose(); renderer = null; group = null; scene = null;
          installCanvasFallback(); fit(); wake();
        }, { once: true });
      } catch (_) { renderer?.dispose(); renderer = null; }
    }
    if (!renderer) installCanvasFallback();
    else { configureCanvas(canvas); host.append(canvas); bindControls(); rebuildWebGL(); }
  }
  function installCanvasFallback() {
    const previousTarget = controls?.target.clone();
    controls?.dispose();
    canvas = document.createElement('canvas'); ctx = null;
    try { ctx = canvas.getContext('2d'); } catch (_) { /* Statistics remain usable. */ }
    host.replaceChildren(canvas); configureCanvas(canvas);
    byId('renderer').textContent = ctx ? '3D coordinates · Canvas projection' : 'Numerical view';
    byId('no-canvas').hidden = Boolean(ctx);
    bindControls();
    if (previousTarget) controls.target.copy(previousTarget);
  }
  function fit() {
    width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
    if (!camera || !canvas) return;
    const nextScale = responsiveCameraScale(width, height);
    if (nextScale !== framingScale) {
      // Resize the current orbit about its target, preserving the user's
      // relative zoom, pan and orientation in both rendering backends.
      const offset = camera.position.clone().sub(controls.target).multiplyScalar(nextScale / framingScale);
      camera.position.copy(controls.target).add(offset);
      framingScale = nextScale;
      initialPosition.set(2.4, 2.0, 2.8).multiplyScalar(framingScale);
      controls.minDistance = 0.8 * framingScale; controls.maxDistance = 20 * framingScale;
      controls.update();
    }
    camera.aspect = width / height; camera.updateProjectionMatrix();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (renderer) { renderer.setPixelRatio(dpr); renderer.setSize(width, height, false); }
    else {
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    lastCanvasDraw = 0; wake();
  }
  function projectedPoint(position) {
    const e = projection.elements, x = position[0], y = position[1], z = position[2];
    const w = e[3] * x + e[7] * y + e[11] * z + e[15];
    if (w <= 0) return null;
    const nx = (e[0] * x + e[4] * y + e[8] * z + e[12]) / w;
    const ny = (e[1] * x + e[5] * y + e[9] * z + e[13]) / w;
    const nz = (e[2] * x + e[6] * y + e[10] * z + e[14]) / w;
    if (nz < -1 || nz > 1 || Math.abs(nx) > 1.1 || Math.abs(ny) > 1.1) return null;
    return { x: (nx + 1) * width / 2, y: (1 - ny) * height / 2, z: nz, w };
  }
  function drawCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    camera.updateMatrixWorld();
    rotationMatrix.makeRotationY(rotation);
    projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(rotationMatrix);
    const palette = palettes[theme], marks = [];
    sceneData.trajectory.forEach(point => {
      const p = projectedPoint(point.position);
      if (p) marks.push({ ...p, color: point.direction === -1 ? palette.back : palette.forward, size: Math.max(1.35, 0.024 * height / (2 * p.w)), alpha: 0.85 });
    });
    if (showHoles) sceneData.holes.forEach(point => {
      const p = projectedPoint(point.position);
      if (p) marks.push({ ...p, color: palette.hole, size: Math.max(2.1, 0.032 * height / (2 * p.w)), alpha: 0.9 });
    });
    // Sort far-to-near instead of flattening the red layer over the trajectory.
    marks.sort((a, b) => b.z - a.z);
    for (const point of marks) {
      ctx.fillStyle = point.color; ctx.globalAlpha = point.alpha;
      ctx.fillRect(point.x - point.size / 2, point.y - point.size / 2, point.size, point.size);
    }
    ctx.globalAlpha = 0.65; ctx.lineWidth = 1;
    const origin = projectedPoint([0, 0, 0]);
    if (origin) [[1.3, 0, 0], [0, 1.3, 0], [0, 0, 1.3]].forEach((axis, i) => {
      const end = projectedPoint(axis); if (!end) return;
      ctx.strokeStyle = palette.axes[i]; ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }
  function frame(now) {
    raf = 0;
    if (!active()) { lastFrame = 0; return; }
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0; lastFrame = now;
    if (playing && !dragging) rotation = (rotation + dt * 0.072) % (2 * Math.PI);
    controls?.update();
    if (renderer) { group.rotation.y = rotation; renderer.render(scene, camera); }
    else if (now - lastCanvasDraw >= 1000 / 30 || !playing || dragging) { drawCanvas(); lastCanvasDraw = now; }
    if (playing || dragging || now < interactionUntil) wake();
    else lastFrame = 0;
  }
  function moveCamera(key) {
    if (!camera || !controls) return;
    if (key.toLowerCase() === 'r') {
      camera.position.copy(initialPosition); controls.target.copy(initialTarget); rotation = 0;
    } else {
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if (key === 'ArrowLeft') spherical.theta -= 0.12;
      if (key === 'ArrowRight') spherical.theta += 0.12;
      if (key === 'ArrowUp') spherical.phi -= 0.1;
      if (key === 'ArrowDown') spherical.phi += 0.1;
      if (key === '+' || key === '=') spherical.radius *= 0.9;
      if (key === '-') spherical.radius *= 1.1;
      spherical.radius = Math.max(controls.minDistance, Math.min(controls.maxDistance, spherical.radius)); spherical.makeSafe();
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    }
    interactionUntil = performance.now() + 350; controls.update(); wake();
  }
  function onKey(event) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'r', 'R', ' '].includes(event.key)) return;
    event.preventDefault();
    if (event.key === ' ') { playing = !playing; updateMotion(); }
    else moveCamera(event.key);
  }

  byId('terms').addEventListener('input', event => { data = computeRecaman(Number(event.target.value)); rebuild(); });
  byId('mode').addEventListener('change', event => { mode = event.target.value; rebuild(); });
  byId('holes').addEventListener('click', () => {
    showHoles = !showHoles;
    byId('holes').textContent = showHoles ? 'Holes: ON' : 'Holes: OFF';
    byId('holes').setAttribute('aria-pressed', String(showHoles));
    if (holeCloud) holeCloud.visible = showHoles;
    report(); wake();
  });
  byId('motion').addEventListener('click', () => { playing = !playing; updateMotion(); });
  byId('theme').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark'; root.dataset.theme = theme;
    byId('theme').textContent = 'Scene: ' + (theme === 'dark' ? 'midnight' : 'paper');
    byId('theme').setAttribute('aria-pressed', String(theme === 'dark'));
    if (renderer) rebuildWebGL(); wake();
  });
  byId('zoom-in').addEventListener('click', () => moveCamera('+'));
  byId('zoom-out').addEventListener('click', () => moveCamera('-'));
  byId('reset').addEventListener('click', () => moveCamera('r'));
  reduced.addEventListener('change', event => { if (event.matches) { playing = false; updateMotion(); } });
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== location.origin || event.data?.type !== 'atlas-interactive-visibility') return;
    remoteActive = event.data.active === true; visibility();
  });
  window.addEventListener('pageshow', () => {
    if (window.parent === window) { remoteActive = true; visibility(); }
    else window.parent.postMessage({ type: 'atlas-interactive-ready' }, location.origin);
  });
  window.addEventListener('pagehide', event => {
    remoteActive = false; visibility();
    if (event.persisted) return;
    disposed = true; clearTimeout(liveTimer); resizeObserver?.disconnect(); viewportObserver?.disconnect(); heightObserver?.disconnect();
    controls?.dispose(); clearGeometry(); renderer?.dispose();
  });
  if ('IntersectionObserver' in window) {
    viewportObserver = new IntersectionObserver(entries => { inViewport = entries[0].isIntersecting; visibility(); }, { rootMargin: '160px 0px' });
    viewportObserver.observe(stage);
  }
  setupRenderer(); report(); updateMotion();
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(fit); resizeObserver.observe(host);
    heightObserver = new ResizeObserver(announceHeight); heightObserver.observe(document.body);
  } else window.addEventListener('resize', fit);
  fit(); announceHeight();
  if (window.parent !== window) window.parent.postMessage({ type: 'atlas-interactive-ready' }, location.origin);
}());
