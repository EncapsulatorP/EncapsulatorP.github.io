(function () {
  'use strict';
  const dialog = document.getElementById('pirate-map');
  const data = window.PIRATE_MAP_DATA;
  if (!dialog || !data || typeof dialog.showModal !== 'function') return;
  const $ = id => document.getElementById(id);
  const { trail, shapes } = data;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 760px)');
  $('pm-reference').open = !compact.matches;
  compact.addEventListener('change', () => { $('pm-reference').open = !compact.matches; });
  const canvas = $('pm-canvas');
  const pins = $('pm-pins');
  const timeline = $('pm-timeline');
  const journal = $('pm-journal');
  const find = $('pm-find');
  const shapeSelect = $('pm-shape-select');
  const topicFilter = $('pm-topic-filter');
  const kindFilter = $('pm-kind-filter');
  const storageKey = 'encapsulatorp.paperAtlas.shape';
  const familyStorageKey = 'encapsulatorp.paperAtlas.collection';
  const bodyKeys = {
    origami: { studio: 'origami', voyage: 'voyage-chart' },
    sphere: { studio: 'sphere', voyage: 'voyage-globe' },
    portal: { studio: 'portal', voyage: 'voyage-portal' },
    tensegrity: { studio: 'tensegrity', voyage: 'voyage-rigging' },
    terrace: { studio: 'terrace', voyage: 'voyage-islands' },
    noperthedron: { studio: 'noperthedron', voyage: 'voyage-noperthedron' },
    neck: { studio: 'neck', voyage: 'voyage-neck' },
    klein: { studio: 'klein', voyage: 'voyage-klein' }
  };
  const tableButtons = Array.from(dialog.querySelectorAll('[data-table-form]'));
  const kindNames = { treasure: 'Treasure', wildcard: 'Wildcard', trap: 'Trap' };
  const visited = new Set();
  let chosen = 0, shapeIndex = 0, family = 'voyage', engine = null, opener = null;
  let leavingForLink = false, motion = !media.matches, hoveringPin = false;
  let latestProjection = [], foldFrame = 0, rendererAvailable = null, lastUnfoldPercent = -1;
  const connections = data.shapeConnections || {};
  const connectionPanel = document.createElement('section');
  connectionPanel.className = 'pm-connection';
  connectionPanel.setAttribute('aria-labelledby', 'pm-connection-title');
  const connectionLabel = document.createElement('p');
  connectionLabel.className = 'pm-kicker';
  const connectionTitle = document.createElement('h3');
  connectionTitle.id = 'pm-connection-title';
  const connectionNote = document.createElement('p');
  const connectionActions = document.createElement('div');
  connectionActions.className = 'pm-connection-actions';
  connectionPanel.append(connectionLabel, connectionTitle, connectionNote, connectionActions);
  $('pm-shape-notes').before(connectionPanel);
  const trioPanel = document.createElement('section');
  trioPanel.className = 'pm-trio';
  trioPanel.setAttribute('aria-labelledby', 'pm-trio-title');
  const trioTitle = document.createElement('h3');
  trioTitle.id = 'pm-trio-title'; trioTitle.textContent = 'Always on this map';
  const trioNote = document.createElement('p');
  trioNote.textContent = 'At least one treasure, one trap and one wildcard. These reading routes stay available when you filter the trail; the shape connection above explains the closest supported match.';
  const trioButtons = document.createElement('div');
  trioButtons.className = 'pm-trio-buttons';
  trioButtons.setAttribute('role', 'group'); trioButtons.setAttribute('aria-label', 'Guaranteed discoveries on this map');
  trioPanel.append(trioTitle, trioNote, trioButtons); connectionPanel.after(trioPanel);
  const subjectMatch = document.createElement('div');
  subjectMatch.className = 'pm-subject-match';
  const subjectMatchText = document.createElement('p');
  const subjectMatchButton = document.createElement('button');
  subjectMatchButton.className = 'pm-button';
  subjectMatchButton.type = 'button';
  subjectMatch.append(subjectMatchText, subjectMatchButton);
  find.append(subjectMatch);

  function currentBody() {
    return Object.keys(bodyKeys).find(name => Object.values(bodyKeys[name]).includes(shapes[shapeIndex].key));
  }
  function essentialIds() { return data.mapMinimumPicks[currentBody()] || []; }
  function syncTrio() {
    trioButtons.replaceChildren();
    essentialIds().forEach(id => {
      const index = trail.findIndex(stop => stop.id === id);
      if (index < 0) return;
      const stop = trail[index], button = document.createElement('button');
      button.type = 'button'; button.dataset.kind = stop.kind;
      button.setAttribute('aria-label', `${kindNames[stop.kind]} — ${stop.name}`);
      const label = document.createElement('span'); label.textContent = kindNames[stop.kind];
      const name = document.createElement('strong'); name.textContent = `${stop.name} →`;
      button.append(label, name);
      button.addEventListener('click', () => {
        topicFilter.value = 'all'; kindFilter.value = 'all'; chosen = index;
        if (dialog.dataset.mapState !== 'explored') unfold();
        filterStops(); selectStop(index, true);
        if (!compact.matches) $('pm-stop-title').focus({ preventScroll: true });
      });
      trioButtons.append(button);
    });
    refreshPins();
  }
  function syncSubjectMatch() {
    const stop = trail[chosen];
    const recommended = stop && stop.recommendedBody;
    const connection = recommended && connections[recommended];
    subjectMatch.hidden = !connection;
    if (!connection) return;
    const shape = shapes.find(item => item.key === bodyKeys[recommended][family]);
    const selectedConnection = connections[currentBody()];
    const selectedMatches = selectedConnection && selectedConnection.stops.includes(stop.id);
    subjectMatchText.textContent = selectedMatches
      ? `${selectedConnection.label}: this form has a stated connection to the selected discovery. The shape note explains its limits.`
      : `${connection.label}: ${shape.name} offers a related way to read this discovery.`;
    subjectMatchButton.hidden = !!selectedMatches;
    subjectMatchButton.textContent = `Use ${shape.name}`;
    subjectMatchButton.onclick = () => {
      setShape(shapes.findIndex(item => item.key === bodyKeys[recommended][family]));
      shapeSelect.focus({ preventScroll: true });
    };
  }
  function syncConnection() {
    const body = currentBody(), connection = connections[body];
    syncTrio();
    connectionPanel.hidden = !connection;
    if (!connection) return;
    connectionPanel.dataset.connectionKind = connection.kind;
    connectionLabel.textContent = connection.label;
    connectionTitle.textContent = connection.stops.length ? 'A connection that fits this form' : 'A form with its own source';
    connectionNote.textContent = connection.note;
    connectionActions.replaceChildren();
    connection.stops.forEach(id => {
      const index = trail.findIndex(stop => stop.id === id);
      if (index < 0) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pm-button';
      button.textContent = `${trail[index].name} →`;
      button.addEventListener('click', () => {
        topicFilter.value = 'all';
        kindFilter.value = 'all';
        chosen = index;
        if (dialog.dataset.mapState !== 'explored') unfold();
        filterStops();
        selectStop(index, true);
        if (!compact.matches) $('pm-stop-title').focus({ preventScroll: true });
      });
      connectionActions.append(button);
    });
    if (!connection.stops.length) {
      const link = document.createElement('a');
      link.className = 'pm-button';
      link.href = shapes[shapeIndex].sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Read the shape’s source ↗';
      connectionActions.append(link);
    }
    syncSubjectMatch();
  }

  function syncUnfold(info) {
    if (!info || !shapes[shapeIndex].unfoldable) return;
    const percent = Math.round(Math.max(0, Math.min(1, info.unfoldProgress || 0)) * 100);
    if (percent === lastUnfoldPercent) return;
    lastUnfoldPercent = percent;
    $('pm-unfold-progress').value = String(percent);
    $('pm-unfold-value').value = `${percent}%`;
    const phases = shapes[shapeIndex].phases || ['Closed form', 'Opening', 'Open form'];
    const phase = percent < 8 ? 0 : percent > 92 ? 2 : 1;
    $('pm-unfold-phase').textContent = phases[phase];
    $('pm-unfold-progress').setAttribute('aria-valuetext', `${percent}% open, ${phases[phase]}`);
    Array.from($('pm-unfold-stages').children).forEach((label, i) => { label.dataset.active = String(i === phase); });
  }
  function syncShapeNotes(shape) {
    $('pm-unfold-controls').hidden = !shape.unfoldable;
    $('pm-unfold-controls').setAttribute('aria-label', shape.unfoldLabel || 'Open the shape');
    $('pm-unfold-name').textContent = shape.unfoldLabel || 'Open the shape';
    $('pm-unfold-stages').replaceChildren();
    (shape.phases || ['Closed form', 'Opening', 'Open form']).forEach(label => {
      const item = document.createElement('span'); item.textContent = label; $('pm-unfold-stages').append(item);
    });
    $('pm-shape-notes').hidden = !shape.lesson;
    $('pm-shape-meaning').textContent = shape.lesson || '';
    $('pm-shape-boundary').textContent = shape.boundary || '';
    $('pm-shape-source').href = shape.sourceUrl;
    $('pm-shape-source').textContent = shape.sourceLabel;
    $('pm-stage-hint').textContent = shape.unfoldable ? 'Drag to orbit · Shift + drag to unfold' : 'Drag to orbit · choose a numbered landmark';
    lastUnfoldPercent = -1;
    syncUnfold({ unfoldProgress: 0 });
  }

  function matches(stop) {
    return (topicFilter.value === 'all' || topicFilter.value === stop.topic) &&
      (kindFilter.value === 'all' || kindFilter.value === stop.kind);
  }
  function refreshPins() {
    Array.from(pins.children).forEach((item, i) => {
      const p = latestProjection[i];
      const essential = essentialIds().includes(trail[i].id);
      item.firstElementChild.dataset.essential = String(essential);
      const visible = !!p && p.visible !== false && (essential || matches(trail[i]));
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
        onProject(points, info) {
          latestProjection = points;
          refreshPins();
          syncUnfold(info);
          if (info && typeof info.available === 'boolean' && info.available !== rendererAvailable) {
            rendererAvailable = info.available;
            $('pm-render-fallback').hidden = info.available;
            pins.hidden = !info.available || dialog.dataset.mapState === 'table';
            ['pm-motion', 'pm-zoom-in', 'pm-zoom-out', 'pm-reset', 'pm-fold', 'pm-unfold-progress', 'pm-refold', 'pm-open-body'].forEach(id => { $(id).disabled = !info.available; });
          }
        },
        onInteraction() { hoveringPin = false; }
      });
      engine.setMotion(motion);
    } catch (error) {
      $('pm-render-fallback').hidden = false;
      canvas.hidden = true;
      pins.hidden = true;
      ['pm-motion', 'pm-zoom-in', 'pm-zoom-out', 'pm-reset', 'pm-fold', 'pm-unfold-progress', 'pm-refold', 'pm-open-body'].forEach(id => { $(id).disabled = true; });
      $('pm-reveal').hidden = true;
      dialog.dataset.renderer = 'unavailable';
      console.warn('Paper atlas: the subject trail is available without the 3D renderer.', error.message);
    }
  }
  function setShape(index) {
    shapeIndex = (index + shapes.length) % shapes.length;
    const shape = shapes[shapeIndex];
    family = shape.family || 'studio';
    dialog.dataset.collection = family;
    dialog.dataset.shape = shape.key;
    const body = Object.keys(bodyKeys).find(name => Object.values(bodyKeys[name]).includes(shape.key));
    tableButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tableForm === body)));
    $('pm-unfold-label').textContent = shape.unfoldable ? 'Open this shape' : 'Explore this form';
    ['voyage', 'studio'].forEach(name => { $(`pm-family-${name}`).setAttribute('aria-pressed', String(name === family)); });
    if (shapeSelect.dataset.family !== family) {
      shapeSelect.replaceChildren();
      shapes.filter(item => (item.family || 'studio') === family).forEach(item => {
        const option = document.createElement('option'); option.value = item.key; option.textContent = item.name; shapeSelect.append(option);
      });
      shapeSelect.dataset.family = family;
    }
    shapeSelect.value = shape.key;
    $('pm-shape').textContent = shape.name;
    $('pm-description').textContent = shape.description;
    $('pm-fold-row').hidden = !shape.foldable || shape.unfoldable || dialog.dataset.mapState !== 'explored';
    syncShapeNotes(shape);
    syncConnection();
    $('pm-structure').hidden = !['tensegrity', 'voyage-rigging'].includes(shape.key) || dialog.dataset.mapState !== 'explored';
    if (engine) {
      engine.setShape(shape.key);
      engine.setSelected(chosen);
      engine.setFold(Number($('pm-fold').value) / 100);
      if (typeof engine.setUnfoldPreview === 'function') engine.setUnfoldPreview(dialog.dataset.mapState === 'table');
      if (dialog.dataset.mapState === 'explored' && shape.unfoldable) engine.playOpening();
    }
    try { localStorage.setItem(storageKey, shape.key); localStorage.setItem(familyStorageKey, family); } catch (_) {}
  }
  function nextShape() {
    const members = shapes.map((shape, i) => ({ shape, i })).filter(item => (item.shape.family || 'studio') === family);
    const current = members.findIndex(item => item.i === shapeIndex);
    setShape(members[(current + 1) % members.length].i);
  }
  function setFamily(name) {
    const body = Object.keys(bodyKeys).find(key => Object.values(bodyKeys[key]).includes(shapes[shapeIndex].key)) || 'origami';
    setShape(shapes.findIndex(shape => shape.key === bodyKeys[body][name]));
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
    syncSubjectMatch();
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
    button.addEventListener('click', () => {
      if (dialog.dataset.mapState !== 'explored') unfold();
      selectStop(index, isPin);
    });
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
    $('pm-table').hidden = true;
    $('pm-back-table').hidden = false;
    $('pm-stage-kicker').textContent = 'Charted discoveries / 01—09';
    $('pm-reveal').hidden = true;
    [$('pm-toolbar'), journal, $('pm-legend')].forEach(el => { el.hidden = false; });
    pins.hidden = !engine || rendererAvailable === false;
    $('pm-fold-row').hidden = !shapes[shapeIndex].foldable || shapes[shapeIndex].unfoldable;
    $('pm-structure').hidden = !['tensegrity', 'voyage-rigging'].includes(shapes[shapeIndex].key);
    selectStop(chosen);
    filterStops();
    if (engine) {
      if (typeof engine.setUnfoldPreview === 'function') engine.setUnfoldPreview(false);
      if (typeof engine.playOpening === 'function') engine.playOpening();
    }
    dialog.scrollTop = 0;
    shapeSelect.focus({ preventScroll: true });
  }
  function showTable(focus) {
    cancelAnimationFrame(foldFrame);
    hoveringPin = false;
    dialog.dataset.mapState = 'table';
    $('pm-table').hidden = false;
    $('pm-back-table').hidden = true;
    $('pm-stage-kicker').textContent = 'A live preview / move across the model';
    [journal, $('pm-legend'), $('pm-fold-row'), $('pm-structure')].forEach(el => { el.hidden = true; });
    $('pm-toolbar').hidden = false;
    $('pm-reveal').hidden = false;
    pins.hidden = true;
    if (engine) {
      engine.setShape(shapes[shapeIndex].key);
      engine.setFold(Number($('pm-fold').value) / 100);
      if (typeof engine.setUnfoldPreview === 'function') engine.setUnfoldPreview(true);
      syncMotion();
    }
    dialog.scrollTop = 0;
    if (focus) $('pm-table-title').focus({ preventScroll: true });
  }
  function openMap(trigger, directly) {
    if (dialog.open) return;
    opener = trigger || null;
    leavingForLink = false;
    hoveringPin = false;
    $('pm-close-caption').textContent = opener ? 'Close map' : 'Skip to atlas';
    dialog.dataset.mapState = 'table';
    $('pm-table').hidden = false;
    $('pm-back-table').hidden = true;
    [journal, $('pm-legend'), $('pm-fold-row'), $('pm-structure')].forEach(el => { el.hidden = true; });
    $('pm-toolbar').hidden = false;
    $('pm-reveal').hidden = false;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.documentElement.classList.add('pm-open');
    initEngine();
    let next = shapes.findIndex(shape => shape.key === 'voyage-globe');
    try {
      const savedFamily = localStorage.getItem(familyStorageKey);
      const members = shapes.map((shape, i) => ({ shape, i })).filter(item => item.shape.family === savedFamily);
      const previous = members.findIndex(item => item.shape.key === localStorage.getItem(storageKey));
      if (members.length) next = members[previous < 0 ? 0 : previous].i;
    } catch (_) {}
    setShape(next);
    if (engine) {
      engine.setActive(true);
      syncMotion();
    }
    if (directly) unfold();
    else showTable(false);
  }
  [...new Set(trail.map(stop => stop.topic))].sort().forEach(topic => {
    const option = document.createElement('option'); option.value = topic; option.textContent = topic; topicFilter.append(option);
  });
  trail.forEach((stop, i) => { pins.append(makeStop(stop, i, true)); timeline.append(makeStop(stop, i, false)); });
  document.querySelectorAll('[data-open-pirate-map]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => openMap(button));
  });
  document.querySelectorAll('a[href="#paper-table"]').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (dialog.open) showTable(true); else openMap(link);
    if (location.hash !== '#paper-table') location.hash = '#paper-table';
  }));
  $('pm-reveal').addEventListener('click', unfold);
  $('pm-back-table').addEventListener('click', () => showTable(true));
  tableButtons.forEach(button => {
    const preview = () => {
      if (dialog.dataset.mapState !== 'table') return;
      const key = bodyKeys[button.dataset.tableForm][family];
      if (shapes[shapeIndex].key !== key) setShape(shapes.findIndex(shape => shape.key === key));
    };
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') preview(); });
    button.addEventListener('focus', preview);
    button.addEventListener('click', () => { preview(); unfold(); });
  });
  $('pm-close').addEventListener('click', () => dialog.close());
  $('pm-next-map').addEventListener('click', nextShape);
  ['voyage', 'studio'].forEach(name => { $(`pm-family-${name}`).addEventListener('click', () => setFamily(name)); });
  shapeSelect.addEventListener('change', () => setShape(shapes.findIndex(s => s.key === shapeSelect.value)));
  $('pm-motion').addEventListener('click', () => { motion = !motion; syncMotion(); });
  $('pm-zoom-in').addEventListener('click', () => { if (engine) engine.zoomBy(1.12); });
  $('pm-zoom-out').addEventListener('click', () => { if (engine) engine.zoomBy(1 / 1.12); });
  $('pm-reset').addEventListener('click', () => {
    cancelAnimationFrame(foldFrame);
    $('pm-fold').value = '62';
    $('pm-fold-value').value = '62%';
    if (engine) engine.reset();
    if (engine && typeof engine.setUnfoldPreview === 'function') engine.setUnfoldPreview(dialog.dataset.mapState === 'table');
  });
  $('pm-fold').addEventListener('input', () => {
    cancelAnimationFrame(foldFrame);
    $('pm-fold-value').value = `${$('pm-fold').value}%`;
    if (engine) engine.setFold(Number($('pm-fold').value) / 100);
  });
  $('pm-unfold-progress').addEventListener('input', () => {
    if (!engine || typeof engine.setUnfold !== 'function') return;
    engine.setUnfold(Number($('pm-unfold-progress').value) / 100);
  });
  [['pm-refold', -1], ['pm-open-body', 1]].forEach(([id, direction]) => {
    $(id).addEventListener('click', () => {
      if (!engine || typeof engine.playUnfold !== 'function') return;
      if (!motion) engine.setUnfold(direction > 0 ? 1 : 0);
      else engine.playUnfold(direction);
    });
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
  window.addEventListener('hashchange', () => {
    if (location.hash === '#paper-atlas') openMap(null, true);
    else if (location.hash === '#paper-table') { if (dialog.open) showTable(true); else openMap(null, false); }
    else if (dialog.open && location.hash) {
      leavingForLink = true;
      dialog.close();
    }
  });
  syncMotion();
  if (!location.hash || ['#paper-atlas', '#paper-table'].includes(location.hash)) openMap(null, location.hash === '#paper-atlas');
})();
