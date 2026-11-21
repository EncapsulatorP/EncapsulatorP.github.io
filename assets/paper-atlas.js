(function () {
  'use strict';
  const dialog = document.getElementById('pirate-map');
  const data = window.PIRATE_MAP_DATA;
  if (!dialog || !data || typeof dialog.showModal !== 'function') return;
  const $ = id => document.getElementById(id);
  const { trail, shapes } = data;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 760px)');
  const canvas = $('pm-canvas');
  const pins = $('pm-pins');
  const timeline = $('pm-timeline');
  const journal = $('pm-journal');
  const find = $('pm-find');
  const shapeSelect = $('pm-shape-select');
  const topicFilter = $('pm-topic-filter');
  const kindFilter = $('pm-kind-filter');
  const storageKey = 'encapsulatorp.paperAtlas.shape';
  const kindNames = { treasure: 'Treasure', wildcard: 'Wildcard', trap: 'Trap' };
  const visited = new Set();
  let chosen = 0, shapeIndex = 0, engine = null, opener = null;
  let leavingForLink = false, motion = !media.matches, hoveringPin = false;
  let latestProjection = [], foldFrame = 0;

  function matches(stop) {
    return (topicFilter.value === 'all' || topicFilter.value === stop.topic) &&
      (kindFilter.value === 'all' || kindFilter.value === stop.kind);
  }
  function refreshPins() {
    Array.from(pins.children).forEach((item, i) => {
      const p = latestProjection[i];
      const visible = !!p && p.visible !== false && matches(trail[i]);
      item.hidden = !visible;
      if (!visible) return;
      item.style.setProperty('--pm-x', `${p.x * 100}%`);
      item.style.setProperty('--pm-y', `${p.y * 100}%`);
      item.style.zIndex = String(100 + Math.round((p.depth || 0) * 5));
    });
  }
  function syncMotion() {
    $('pm-motion').setAttribute('aria-pressed', String(motion));
    $('pm-motion').textContent = motion ? 'Pause motion' : 'Play motion';
    if (engine) engine.setMotion(motion && !hoveringPin);
  }
  function initEngine() {
    if (engine) return;
    try {
      if (typeof window.PaperMapEngine !== 'function') throw new Error('3D renderer unavailable');
      engine = new window.PaperMapEngine(canvas, {
        reducedMotion: media.matches,
        onProject(points) { latestProjection = points; refreshPins(); },
        onInteraction() { hoveringPin = false; }
      });
      engine.setMotion(motion);
    } catch (error) {
      $('pm-render-fallback').hidden = false;
      canvas.hidden = true;
      pins.hidden = true;
      $('pm-reveal').hidden = true;
      dialog.dataset.renderer = 'unavailable';
      console.warn('Paper atlas: the subject trail is available without the 3D renderer.', error.message);
    }
  }
  function setShape(index) {
    shapeIndex = (index + shapes.length) % shapes.length;
    const shape = shapes[shapeIndex];
    shapeSelect.value = shape.key;
    $('pm-shape').textContent = shape.name;
    $('pm-description').textContent = shape.description;
    $('pm-fold-row').hidden = shape.key !== 'origami' || dialog.dataset.mapState !== 'explored';
    $('pm-structure').hidden = shape.key !== 'tensegrity' || dialog.dataset.mapState !== 'explored';
    if (engine) {
      engine.setShape(shape.key);
      engine.setSelected(chosen);
      engine.setFold(Number($('pm-fold').value) / 100);
    }
    try { localStorage.setItem(storageKey, shape.key); } catch (_) {}
  }
  function selectStop(index, fromPin) {
    chosen = index;
    const stop = trail[index];
    visited.add(index);
    find.hidden = false;
    find.dataset.kind = stop.kind;
    $('pm-stop-kind').textContent = `${kindNames[stop.kind]} · ${stop.date} · ${stop.evidenceLabel}`;
    $('pm-stop-number').textContent = `${String(index + 1).padStart(2, '0')} / ${String(trail.length).padStart(2, '0')}`;
    $('pm-stop-title').textContent = stop.name;
    $('pm-stop-prompt').textContent = stop.question;
    $('pm-stop-clue').textContent = stop.clue;
    $('pm-story-link').href = stop.href;
    $('pm-story-link').setAttribute('aria-label', `Explore this subject: ${stop.name}`);
    const repo = $('pm-repository-link');
    repo.hidden = !stop.repository;
    if (stop.repository) {
      repo.href = stop.repository;
      repo.textContent = stop.repositoryLabel || 'Open the repository';
      repo.setAttribute('aria-label', `${stop.repositoryLabel || 'Open the repository'} (opens a new tab)`);
    }
    [pins, timeline].forEach(list => Array.from(list.children).forEach((item, i) => {
      const button = item.firstElementChild;
      button.setAttribute('aria-pressed', String(i === chosen));
      button.classList.toggle('pm-visited', visited.has(i));
    }));
    $('pm-progress').textContent = `${visited.size} of ${trail.length} explored`;
    if (engine) engine.setSelected(chosen);
    if (fromPin && compact.matches) {
      $('pm-stop-title').focus({ preventScroll: true });
      journal.scrollIntoView({ block: 'start', behavior: media.matches ? 'auto' : 'smooth' });
    }
  }
  function makeStop(stop, index, isPin) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.kind = stop.kind;
    button.setAttribute('aria-label', `${String(index + 1).padStart(2, '0')} · ${stop.name} · ${kindNames[stop.kind]}`);
    button.setAttribute('aria-pressed', 'false');
    if (isPin) {
      button.className = 'pm-pin';
      button.textContent = String(index + 1).padStart(2, '0');
      button.title = stop.name;
      button.addEventListener('pointerenter', () => { hoveringPin = true; syncMotion(); });
      button.addEventListener('pointerleave', () => { hoveringPin = false; syncMotion(); });
      button.addEventListener('focus', () => { hoveringPin = true; syncMotion(); });
      button.addEventListener('blur', () => { hoveringPin = false; syncMotion(); });
    } else {
      const date = document.createElement('span');
      date.className = 'pm-date';
      const number = document.createElement('strong');
      number.textContent = String(index + 1).padStart(2, '0');
      date.append(number, document.createTextNode(` / ${stop.date}`));
      const title = document.createElement('span');
      title.textContent = stop.name;
      button.append(date, title);
    }
    button.addEventListener('click', () => selectStop(index, isPin));
    item.append(button);
    return item;
  }
  function filterStops() {
    const active = [];
    trail.forEach((stop, i) => {
      const visible = matches(stop);
      timeline.children[i].hidden = !visible;
      if (visible) active.push(i);
    });
    refreshPins();
    $('pm-empty').hidden = active.length !== 0;
    find.hidden = !active.length;
    if (active.length && !active.includes(chosen)) selectStop(active[0]);
  }
  function unfold() {
    dialog.dataset.mapState = 'explored';
    $('pm-reveal').hidden = true;
    [$('pm-toolbar'), journal, $('pm-legend')].forEach(el => { el.hidden = false; });
    pins.hidden = !engine;
    $('pm-fold-row').hidden = shapes[shapeIndex].key !== 'origami';
    $('pm-structure').hidden = shapes[shapeIndex].key !== 'tensegrity';
    selectStop(chosen);
    filterStops();
    if (engine && shapes[shapeIndex].key === 'origami') {
      cancelAnimationFrame(foldFrame);
      const start = performance.now(), target = Number($('pm-fold').value) / 100;
      const animateFold = now => {
        const t = media.matches ? 1 : Math.min(1, (now - start) / 1100);
        const ease = 1 - Math.pow(1 - t, 3);
        engine.setFold(.94 + (target - .94) * ease);
        if (t < 1 && dialog.open) foldFrame = requestAnimationFrame(animateFold);
      };
      foldFrame = requestAnimationFrame(animateFold);
    }
    shapeSelect.focus({ preventScroll: true });
  }
  function openMap(trigger, directly) {
    if (dialog.open) return;
    opener = trigger || null;
    leavingForLink = false;
    $('pm-close-caption').textContent = opener ? 'Close map' : 'Skip to atlas';
    dialog.dataset.mapState = 'landing';
    [$('pm-toolbar'), pins, journal, $('pm-legend'), $('pm-fold-row'), $('pm-structure')].forEach(el => { el.hidden = true; });
    $('pm-reveal').hidden = false;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.documentElement.classList.add('pm-open');
    initEngine();
    let next = 0;
    try {
      const previous = shapes.findIndex(s => s.key === localStorage.getItem(storageKey));
      if (previous >= 0) next = (previous + 1) % shapes.length;
    } catch (_) {}
    setShape(next);
    if (engine) {
      engine.setActive(true);
      if (shapes[next].key === 'origami') engine.setFold(.94);
      syncMotion();
    }
    if (!engine || directly) unfold();
  }
  shapes.forEach(shape => {
    const option = document.createElement('option'); option.value = shape.key; option.textContent = shape.name; shapeSelect.append(option);
  });
  [...new Set(trail.map(stop => stop.topic))].sort().forEach(topic => {
    const option = document.createElement('option'); option.value = topic; option.textContent = topic; topicFilter.append(option);
  });
  trail.forEach((stop, i) => { pins.append(makeStop(stop, i, true)); timeline.append(makeStop(stop, i, false)); });
  document.querySelectorAll('[data-open-pirate-map]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => openMap(button));
  });
  $('pm-reveal').addEventListener('click', unfold);
  $('pm-close').addEventListener('click', () => dialog.close());
  $('pm-next-map').addEventListener('click', () => setShape(shapeIndex + 1));
  shapeSelect.addEventListener('change', () => setShape(shapes.findIndex(s => s.key === shapeSelect.value)));
  $('pm-motion').addEventListener('click', () => { motion = !motion; syncMotion(); });
  $('pm-zoom-in').addEventListener('click', () => { if (engine) engine.zoomBy(1.12); });
  $('pm-zoom-out').addEventListener('click', () => { if (engine) engine.zoomBy(1 / 1.12); });
  $('pm-reset').addEventListener('click', () => {
    cancelAnimationFrame(foldFrame);
    $('pm-fold').value = '62';
    $('pm-fold-value').value = '62%';
    if (engine) engine.reset();
  });
  $('pm-fold').addEventListener('input', () => {
    cancelAnimationFrame(foldFrame);
    $('pm-fold-value').value = `${$('pm-fold').value}%`;
    if (engine) engine.setFold(Number($('pm-fold').value) / 100);
  });
  topicFilter.addEventListener('change', filterStops);
  kindFilter.addEventListener('change', filterStops);
  [$('pm-story-link'), $('pm-credit-link')].forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    leavingForLink = true;
    dialog.close();
    const hash = new URL(link.href, location.href).hash;
    if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = hash;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (location.hash !== hash) return;
      const [name, query = ''] = hash.slice(1).split('?');
      const entry = new URLSearchParams(query).get('entry');
      const destination = document.getElementById(entry ? `atlas-entry-${entry}` : name);
      const heading = destination?.querySelector('h2,h3,h4') || destination;
      if (heading) {
        if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }));
  }));
  $('pm-source-notes').addEventListener('click', () => { leavingForLink = true; dialog.close(); });
  dialog.addEventListener('close', () => {
    cancelAnimationFrame(foldFrame);
    document.documentElement.classList.remove('pm-open');
    if (engine) engine.setActive(false);
    if (!leavingForLink) (opener || document.querySelector('[data-open-pirate-map]'))?.focus({ preventScroll: true });
  });
  document.addEventListener('visibilitychange', () => { if (engine) engine.setActive(dialog.open && !document.hidden); });
  media.addEventListener('change', () => { if (media.matches) { motion = false; syncMotion(); } });
  window.addEventListener('hashchange', () => { if (location.hash === '#paper-atlas') openMap(null, true); });
  syncMotion();
  if (!location.hash || location.hash === '#paper-atlas') openMap(null, location.hash === '#paper-atlas');
})();
