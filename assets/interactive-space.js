/* One selected Gemini exhibit. Local sources only; hidden exhibits pause. */
(function () {
  'use strict';
  const script = document.currentScript;
  const base = new URL('../interactive/', script.src);
  const topics = [
    { id: 'complex-tetration', title: 'Complex tetration', glyph: 'c ↑↑ N', label: 'Finite basin · stochastic experiment', summary: 'Explore the Shell–Thron basin image, a white principal power tower and an ensemble with stochastic logarithm-sheet jumps.', boundary: 'The colors record a finite tolerance and escape test. The independently resampled sheets are a chosen stochastic experiment; survival does not prove convergence.', source: 'gemini-code-1795274340354', room: '#towers', roomLabel: 'Towers laboratory' },
    { id: 'recaman-obstructions', title: 'Recamán · holes & Möbius', glyph: 'aₙ ↔ ∅', label: 'Exact sequence · finite gaps', summary: 'Orbit the original 3D delay view and twisted Möbius mode, with the red unvisited-value markers restored inside the scene.', boundary: 'Red holes mark sampled values not yet visited in a finite prefix, placed by Gemini’s chosen coordinate map. They do not establish a topological obstruction theorem.', source: 'gemini-code-1795274358812', room: '#recaman', roomLabel: 'Recamán sequence explorer' },
    { id: 'goldbach-involution', title: 'Goldbach involution', glyph: 'E₊ · E₋ · ρ', label: 'Exact finite energies', summary: 'Fold the prime indicator through k ↔ N − k. Watch E+, E− and ρ change, and inspect the contribution of each mirror orbit.', boundary: 'The energies are exact for the displayed even total. The ratio describes that finite prime pattern and does not prove Goldbach’s conjecture.', source: '9df25cf48edc7ed6', room: '#goldbach', roomLabel: 'Goldbach laboratory' },
    { id: 'poincare', title: 'Poincaré map & cobweb', glyph: 'xₙ → F(xₙ)', label: 'Defined return-map toy', summary: 'Step vertically to the map, then horizontally to y = x. The cobweb and orbit chart expose every update of Gemini’s threshold recurrence.', boundary: '“Poincaré” preserves the supplied exhibit’s name. This specified toy is not a return map derived from a physical flow. The original capped replay is labeled separately.', source: '3fd6497132606067', room: '#collatz', roomLabel: 'Collatz laboratory' },
    { id: 'torus', title: 'Bitemporal torus', glyph: 'u ↻ v', label: 'Conceptual animation', summary: 'See four colored passes superimposed on the rotating reference mesh. Catch the next reset to inspect its marked endpoints and jump.', boundary: 'The retained paths show successive passes of one prescribed trajectory. The reset counter and arbitrary units are chosen rules, not a physical superposition or monodromy result.', source: '2a608082e24c9bed', room: '#paper-table', roomLabel: 'Shape workbench' },
    { id: 'goldbach', title: 'Goldbach mirror', glyph: 'p ↔ q', label: 'Exact rule · finite search', summary: 'Scan equal distances from a center. A prime on each side makes a Goldbach pair.', boundary: 'The displayed range is finite. Finding pairs here does not prove Goldbach’s conjecture.', source: '2424efeacfe55a9b', room: '#goldbach', roomLabel: 'Goldbach laboratory' },
    { id: 'logistic', title: 'The period-three window', glyph: 'r · x(1−x)', label: 'Finite numerical sample', summary: 'Move through a logistic-map window and compare its sampled bifurcation diagram with one orbit.', boundary: 'A finite grid and transient cutoff can miss narrow windows and slow approach. The display makes no stability verdict.', source: '33995aba88b532ea', room: '#atlas?entry=logistic-quarter-turn', roomLabel: 'Logistic identity in the Atlas' },
    { id: 'recaman', title: 'Recamán coordinates', glyph: '(aₙ, aₙ₋₁, aₙ₋₂)', label: 'Exact sequence · chosen coordinates', summary: 'Turn the same sequence through delay triples, normalized delay and time/value coordinates.', boundary: 'The coordinates show a selected finite sample. Apparent holes, growth rates and manifold topology are not proved.', source: '40a9d6898acfe388', room: '#recaman', roomLabel: 'Recamán sequence explorer' },
    { id: 'threshold', title: 'Threshold branching', glyph: '⌊λx / V⌋', label: 'Speculative toy model', summary: 'Follow a piecewise recurrence, its cobweb trace and the first part of its orbit.', boundary: 'This is a defined toy inspired by Collatz-style branching. No link to early dark energy or derived Poincaré map is established.', source: '3fd6497132606067', room: '#collatz', roomLabel: 'Collatz laboratory' },
    { id: 'phase-slip', title: 'Phase slip & lifted helix', glyph: 'θ ↗ h', label: 'Conceptual comparison', summary: 'Compare a circle with a reset rule and a lifted path whose height retains the same accumulation.', boundary: 'Reset and retention come from the programmed rules. A circle does not force information loss; this helix is not a constructed Riemann surface.', source: '57e7fdb3e8fe183e', room: '#paper-table', roomLabel: 'Shape workbench' }
  ];
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  function requestedTopic() {
    const query = location.hash.startsWith('#interactive?') ? location.hash.split('?')[1] : location.search.slice(1);
    return new URLSearchParams(query).get('topic');
  }
  document.querySelectorAll('[data-interactive-space]').forEach((mount, mountIndex) => {
    if (mount.dataset.interactiveReady) return;
    mount.dataset.interactiveReady = 'true'; mount.classList.add('is-space');
    const standalone = !mount.closest('.page');
    let selected = topics.find(t => t.id === requestedTopic()) || topics[0], frame = null, lastActive = null, inViewport = !('IntersectionObserver' in window);
    const prefix = 'gemini-space-' + mountIndex;
    const head = el('header', 'is-heading'), kicker = el('p', 'is-kicker', 'Interactive · Gemini’s contributions');
    head.append(kicker, el('h2', '', 'One question. A world to move.'), el('p', 'is-intro', 'Ten interactive views, recovered from Gemini’s supplied visualizations. Move through complex towers, red Recamán holes, prime energies and visible iteration. Each topic keeps its original idea and a clear claim boundary.'));
    const tabs = el('div', 'is-topics'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Interactive topics');
    const panel = el('section', 'is-selected'); panel.id = prefix + '-panel'; panel.setAttribute('role', 'tabpanel');
    const picker = el('label', 'is-topic-picker', 'Choose a topic'), pickerSelect = el('select');
    pickerSelect.setAttribute('aria-label', 'Interactive topic'); pickerSelect.setAttribute('aria-controls', panel.id);
    topics.forEach(topic => { const option = el('option', '', topic.title); option.value = topic.id; pickerSelect.append(option); });
    pickerSelect.addEventListener('change', () => { const topic = topics.find(item => item.id === pickerSelect.value); if (topic) choose(topic, true); });
    picker.append(pickerSelect);
    const overview = el('div', 'is-overview'), copy = el('div'), title = el('h3'), evidence = el('p', 'is-evidence'), description = el('p', 'is-description'), signature = el('p', 'is-signature');
    copy.append(evidence, title, description); overview.append(copy, signature);
    const boundary = el('p', 'is-boundary'), links = el('div', 'is-links'), exhibitLink = el('a', '', 'Open this exhibit on its own ↗'), roomLink = el('a'), sourceLink = el('a', '', 'Gemini’s original topic script ↗');
    links.append(exhibitLink, roomLink, sourceLink);
    const frameHost = el('div', 'is-frame-host'), placeholder = el('p', 'is-placeholder', 'The selected exhibit loads when this room is visible.');
    frameHost.append(placeholder); panel.append(overview, boundary, links, frameHost);
    const ledger = el('details', 'is-ledger'); ledger.append(el('summary', '', 'Source ledger · what was preserved, corrected and consolidated'));
    ledger.append(el('p', '', 'Fourteen supplied HTML exports contain eleven distinct source widgets, including the recovered standalone complex-tetration and Recamán-obstruction explorers. Nine sources are presented in ten views: the Poincaré cobweb and the compact threshold view share one source. Repeated torus and helix exports were consolidated.'));
    ledger.append(el('p', '', 'The visible concepts, original parameter ranges and topic logic remain Gemini’s contributions. The Atlas adaptation restores the red holes and energy readouts, adds explicit cobweb stepping, and strengthens the torus overlap. Numerical corrections are documented beside each exhibit. The coordinate-only twisted Recamán alternative remains in the inventory; the burst/Poisson widget remains withheld because its “High fit” label was not a valid fit test.'));
    const ledgerLinks = el('div', 'is-links'), notes = el('a', '', 'Adaptation notes ↗'), manifest = el('a', '', 'Complete source inventory ↗');
    notes.href = new URL('../atlas/gemini-interactive-notes.md', base).href; manifest.href = new URL('sources.json', base).href; ledgerLinks.append(notes, manifest); ledger.append(ledgerLinks);
    mount.replaceChildren(head, picker, tabs, panel, ledger);

    function visible() { return inViewport && !document.hidden && mount.getClientRects().length > 0 && !document.querySelector('dialog[open]'); }
    function tellFrame(active) { if (frame?.contentWindow) frame.contentWindow.postMessage({ type: 'atlas-interactive-visibility', active }, location.origin); }
    function ensureFrame() {
      if (frame || !visible()) return;
      frame = el('iframe', 'is-frame'); frame.title = 'Gemini · ' + selected.title;
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin'); frame.setAttribute('loading', 'lazy');
      frame.src = new URL(selected.id + '.html?v=restore-20261121-r2', base).href;
      frame.addEventListener('load', () => tellFrame(visible())); frameHost.replaceChildren(frame);
    }
    function syncVisibility() {
      const active = visible(); if (active) ensureFrame();
      if (active !== lastActive) { lastActive = active; tellFrame(active); }
    }
    const buttons = new Map();
    topics.forEach((topic, index) => {
      const button = el('button', 'is-topic'); button.type = 'button'; button.id = prefix + '-' + topic.id;
      button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id);
      const glyph = el('span', 'is-glyph', topic.glyph); glyph.setAttribute('aria-hidden', 'true');
      button.append(glyph, el('strong', '', topic.title), el('small', '', topic.label));
      button.addEventListener('click', () => choose(topic, true));
      button.addEventListener('keydown', event => {
        const next = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % topics.length : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (index - 1 + topics.length) % topics.length : event.key === 'Home' ? 0 : event.key === 'End' ? topics.length - 1 : null;
        if (next === null) return; event.preventDefault(); choose(topics[next], true); buttons.get(topics[next].id).focus();
      }); buttons.set(topic.id, button); tabs.append(button);
    });
    function choose(topic, updateAddress) {
      const changed = selected.id !== topic.id; selected = topic;
      pickerSelect.value = topic.id;
      buttons.forEach((button, id) => { const current = id === topic.id; button.setAttribute('aria-selected', String(current)); button.tabIndex = current ? 0 : -1; });
      panel.setAttribute('aria-labelledby', prefix + '-' + topic.id); title.textContent = topic.title; evidence.textContent = topic.label; description.textContent = topic.summary;
      signature.replaceChildren(el('span', '', 'Gemini · ' + topic.title), el('small', '', 'Interactive concept · Atlas adaptation'));
      boundary.replaceChildren(el('strong', '', 'Claim boundary. '), document.createTextNode(topic.boundary));
      exhibitLink.href = new URL(topic.id + '.html', base).href;
      roomLink.href = new URL('../index.html' + topic.room, base).href; roomLink.textContent = topic.roomLabel + ' ↗';
      sourceLink.href = new URL('sources/gemini-' + topic.id + '-original.js.txt', base).href;
      if (changed && frame) { frame.remove(); frame = null; frameHost.replaceChildren(placeholder); lastActive = null; }
      if (updateAddress) {
        const url = new URL(location.href);
        if (standalone) url.searchParams.set('topic', topic.id); else url.hash = 'interactive?topic=' + topic.id;
        history.replaceState(null, '', url);
      }
      syncVisibility();
    }
    window.addEventListener('message', event => {
      if (!frame || event.source !== frame.contentWindow || event.origin !== location.origin) return;
      if (event.data?.type === 'atlas-interactive-ready') tellFrame(visible());
      if (event.data?.type === 'atlas-interactive-size' && Number.isFinite(event.data.height)) frame.style.height = Math.max(420, Math.min(2600, event.data.height)) + 'px';
    });
    const observer = new MutationObserver(syncVisibility), page = mount.closest('.page');
    if (page) observer.observe(page, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
    document.querySelectorAll('dialog').forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inViewport = entries[0].isIntersecting; syncVisibility(); }, { rootMargin: '240px 0px' }).observe(frameHost);
    document.addEventListener('visibilitychange', syncVisibility);
    window.addEventListener('hashchange', () => { const match = topics.find(t => t.id === requestedTopic()); if (match && match.id !== selected.id) choose(match, false); syncVisibility(); });
    window.addEventListener('pagehide', () => tellFrame(false));
    window.addEventListener('pageshow', () => { lastActive = null; syncVisibility(); });
    choose(selected, false);
  });
}());
