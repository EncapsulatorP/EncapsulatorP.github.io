(function () {
  'use strict';
  var root = document.querySelector('[data-page="atlas"]');
  if (!root) return;
  var data = window.ENCAPSULATOR_ATLAS || { entries: [] };
  var entries = Array.isArray(data.entries) ? data.entries : [];
  var statusNames = {
    exact: 'Exact result', finite: 'Finite computation', reported: 'Reported computation',
    conjectural: 'Conjectural', exploratory: 'Exploratory', tooling: 'Research tooling'
  };
  var statusOrder = ['exact', 'finite', 'reported', 'conjectural', 'exploratory', 'tooling'];
  var byId = new Map(entries.map(function (entry) { return [entry.id, entry]; }));
  var cards = new Map();
  var form = document.getElementById('atlas-filters');
  var search = document.getElementById('atlas-search');
  var family = document.getElementById('atlas-family');
  var status = document.getElementById('atlas-status');
  var list = document.getElementById('atlas-entries');
  var count = document.getElementById('atlas-results-count');
  var empty = document.getElementById('atlas-empty');

  function node(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
  }
  function paragraphs(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    return value ? String(value).split(/\n\s*\n/).filter(Boolean) : [];
  }
  function normal(value) {
    return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function sourceLink(source) {
    if (!source || typeof source.url !== 'string') return null;
    var url = source.url.trim();
    if (!url || /^(?:javascript|data|vbscript):/i.test(url) || /[\u0000-\u001f]/.test(url)) return null;
    var parsed;
    try { parsed = new URL(url, location.href); } catch (_) { return null; }
    if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) return null;
    if (parsed.protocol === 'file:' && /^[a-z][a-z0-9+.-]*:/i.test(url)) return null;
    var a = node('a', '', source.label || url);
    a.setAttribute('href', url);
    if (/^https?:\/\//i.test(url)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  }
  function addLabeledParagraph(parent, label, value, className) {
    if (!value) return;
    parent.append(node('h5', 'at-detail-label', label));
    paragraphs(value).forEach(function (p) { parent.append(node('p', className || 'at-detail-paragraph', p)); });
  }
  function makeCard(entry, index) {
    var article = node('article', 'at-entry');
    article.id = 'atlas-entry-' + entry.id;
    article.dataset.status = entry.status;
    article.setAttribute('aria-labelledby', article.id + '-title');
    article.append(node('div', 'at-entry-top'));
    var body = node('div', 'at-entry-body');
    if (typeof entry.promoted === 'string' && entry.promoted.trim()) body.append(node('span', 'at-promotion at-entry-promotion', entry.promoted));
    var meta = node('div', 'at-entry-meta');
    meta.append(node('span', 'at-family', String(index + 1).padStart(2, '0') + ' / ' + (entry.family || 'Research')));
    var badge = node('span', 'at-status', statusNames[entry.status] || entry.status || 'Exploratory');
    badge.dataset.status = entry.status;
    meta.append(badge);
    body.append(meta);
    var title = node('h4', '', entry.title);
    title.id = article.id + '-title';
    body.append(title);
    var fullFormula = Array.isArray(entry.formula) ? entry.formula.join('\n') : String(entry.formula || '');
    var keyFormula = typeof entry.keyFormula === 'string' ? entry.keyFormula : fullFormula.split('\n')[0];
    if (keyFormula) body.append(node('div', 'at-formula', keyFormula));
    var detail = node('details', 'at-entry-detail');
    var summary = node('summary', '', 'Open thread');
    detail.append(summary);
    if (entry.summary) detail.append(node('p', 'at-entry-summary', entry.summary));
    if (fullFormula && fullFormula !== keyFormula) detail.append(node('div', 'at-formula', fullFormula));
    if (entry.why) {
      var why = node('p', 'at-entry-why');
      why.append(node('strong', '', 'Why follow it. '), document.createTextNode(entry.why));
      detail.append(why);
    }
    detail.addEventListener('toggle', function () { summary.textContent = detail.open ? 'Close thread' : 'Open thread'; article.classList.toggle('at-open', detail.open); });
    paragraphs(entry.detail).forEach(function (p) { detail.append(node('p', 'at-detail-paragraph', p)); });
    addLabeledParagraph(detail, 'Next experiment', entry.next, 'at-next');
    var sources = node('ul', 'at-sources');
    (entry.sources || []).forEach(function (source) {
      var a = sourceLink(source);
      if (a) { var li = node('li'); li.append(a); sources.append(li); }
    });
    if (sources.childElementCount) { detail.append(node('h5', 'at-detail-label', 'Sources & working notes'), sources); }
    var connections = node('ul', 'at-connections');
    (entry.connections || []).forEach(function (id) {
      var other = byId.get(id);
      if (!other || id === entry.id) return;
      var a = node('a', '', other.title + ' →');
      a.href = '#atlas?entry=' + encodeURIComponent(id);
      var li = node('li'); li.append(a); connections.append(li);
    });
    if (connections.childElementCount) detail.append(node('h5', 'at-detail-label', 'Connected threads'), connections);
    if (entry.origin) detail.append(node('p', 'at-origin', Array.isArray(entry.origin) ? entry.origin.join(' · ') : entry.origin));
    var permalink = node('a', 'at-entry-permalink', 'Link to this entry ↗');
    permalink.href = '#atlas?entry=' + encodeURIComponent(entry.id);
    detail.append(permalink);
    body.append(detail); article.append(body);
    var haystack = normal([entry.title, entry.family, entry.summary, entry.formula, entry.why, entry.detail, entry.next, entry.origin].flat().join(' '));
    cards.set(entry.id, { article: article, detail: detail, haystack: haystack, entry: entry });
    return article;
  }
  function filter() {
    var terms = normal(search.value).trim().split(/\s+/).filter(Boolean);
    var shown = 0;
    cards.forEach(function (item) {
      var match = (!family.value || item.entry.family === family.value) &&
        (!status.value || item.entry.status === status.value) &&
        terms.every(function (term) { return item.haystack.includes(term); });
      item.article.hidden = !match;
      if (match) shown++;
    });
    count.textContent = shown === entries.length ? entries.length + ' entries · every thread has a source trail' : shown + ' of ' + entries.length + ' entries';
    empty.hidden = shown !== 0;
  }
  function resetFilters() {
    search.value = ''; family.value = ''; status.value = '';
    filter();
  }
  function revealFromHash() {
    var hash = location.hash.slice(1);
    if (hash === 'atlas-credits') {
      requestAnimationFrame(function () { document.getElementById('atlas-credits').scrollIntoView({ block: 'start', behavior: 'instant' }); });
      return;
    }
    if (hash.split('?')[0] !== 'atlas') return;
    var params = new URLSearchParams(hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '');
    var selected = params.get('entry');
    cards.forEach(function (item, id) { item.article.classList.toggle('at-selected', id === selected); });
    if (!selected || !cards.has(selected)) return;
    resetFilters();
    var item = cards.get(selected);
    item.detail.open = true;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!root.classList.contains('on') && document.documentElement.classList.contains('js')) return;
        item.article.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
    });
  }

  if (data.coverage) document.getElementById('atlas-coverage').textContent = data.coverage;
  if (data.edition) document.getElementById('atlas-edition').textContent = 'Edition ' + data.edition + ' · a curated recovery from available conversations and source files.';
  var families = Array.from(new Set(entries.map(function (entry) { return entry.family; }).filter(Boolean))).sort();
  families.forEach(function (name) { var option = node('option', '', name); option.value = name; family.append(option); });
  statusOrder.filter(function (s) { return entries.some(function (entry) { return entry.status === s; }); }).forEach(function (s) { var option = node('option', '', statusNames[s]); option.value = s; status.append(option); });
  var fragment = document.createDocumentFragment();
  entries.forEach(function (entry, index) { fragment.append(makeCard(entry, index)); });
  list.append(fragment);
  var metrics = document.getElementById('atlas-metrics');
  [[entries.length, 'entries'], [families.length, 'families'], [entries.filter(function (entry) { return entry.status === 'exact'; }).length, 'exact results']].forEach(function (pair) { var item = node('div'); item.append(node('strong', '', pair[0]), node('span', '', pair[1])); metrics.append(item); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('input', filter);
  form.addEventListener('change', filter);
  form.addEventListener('reset', function (e) { e.preventDefault(); resetFilters(); });
  document.getElementById('atlas-empty-reset').addEventListener('click', function () { resetFilters(); search.focus(); });
  root.querySelectorAll('.at-enhanced').forEach(function (el) { el.hidden = false; });
  window.addEventListener('hashchange', revealFromHash);
  filter();

  var NS = 'http://www.w3.org/2000/svg';
  function svgNode(tag, attrs, text) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, String(attrs[key])); });
    if (text !== undefined) el.textContent = String(text);
    return el;
  }
  function chartBase(svg, title, yLabels, yMap, xLabels, xMap) {
    svg.replaceChildren();
    svg.append(svgNode('title', {}, title));
    svg.append(svgNode('rect', { x: 0, y: 0, width: 720, height: 320, rx: 8, fill: '#f6f8fc' }));
    yLabels.forEach(function (value) {
      var y = yMap(value);
      svg.append(svgNode('line', { x1: 62, y1: y, x2: 690, y2: y, stroke: '#dde5f0', 'stroke-width': 1 }));
      svg.append(svgNode('text', { x: 51, y: y + 4, 'text-anchor': 'end', fill: '#617391', 'font-size': 11 }, value));
    });
    xLabels.forEach(function (value) { svg.append(svgNode('text', { x: xMap(value), y: 299, 'text-anchor': 'middle', fill: '#617391', 'font-size': 11 }, value)); });
    svg.append(svgNode('path', { d: 'M62 25 V276 H690', fill: 'none', stroke: '#9dafc8', 'stroke-width': 1 }));
  }
  function isPrime(n) {
    if (n < 2 || n % 1) return false;
    for (var d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  }
  var pairInput = document.getElementById('at-pair-n');
  function drawPairs() {
    var n = Number(pairInput.value), m = n / 2, pairs = [];
    for (var p = 2; p <= m; p++) if (isPrime(p) && isPrime(n - p)) pairs.push([p, n - p]);
    document.getElementById('at-pair-n-value').value = String(n);
    document.getElementById('at-pair-summary').textContent = pairs.length + ' unordered prime ' + (pairs.length === 1 ? 'pair' : 'pairs') + ' · centre m = ' + m;
    var svg = document.getElementById('at-pair-plot');
    var x = function (d) { return 62 + (d / m) * 628; };
    var y = function (product) { return 276 - product / (m * m) * 235; };
    chartBase(svg, 'Prime pairs for ' + n + ': half-gap versus product', [0, Math.round(m * m / 2), m * m], y, [0, m / 2, m], x);
    var path = '';
    for (var i = 0; i <= 100; i++) { var d = m * i / 100; path += (i ? ' L' : 'M') + x(d).toFixed(2) + ' ' + y(m * m - d * d).toFixed(2); }
    svg.append(svgNode('path', { d: path, fill: 'none', stroke: '#a0b4d6', 'stroke-width': 2 }));
    pairs.forEach(function (pair, i) {
      var d = (pair[1] - pair[0]) / 2, product = pair[0] * pair[1];
      svg.append(svgNode('line', { x1: x(d), y1: y(product), x2: x(d), y2: 276, stroke: '#d3e3e8', 'stroke-dasharray': '3 5' }));
      var circle = svgNode('circle', { cx: x(d), cy: y(product), r: 5, fill: '#237f88', stroke: '#fff', 'stroke-width': 2 });
      circle.append(svgNode('title', {}, pair[0] + ' + ' + pair[1] + ' = ' + n + '; half-gap ' + d + '; product ' + product));
      svg.append(circle);
      if (pairs.length <= 8 || i === 0 || i === pairs.length - 1) svg.append(svgNode('text', { x: x(d), y: y(product) - 12, 'text-anchor': 'middle', fill: '#315877', 'font-size': 11 }, pair[0] + '+' + pair[1]));
    });
    svg.append(svgNode('text', { x: 680, y: 317, 'text-anchor': 'end', fill: '#617391', 'font-size': 10 }, 'half-gap d'));
    var values = document.getElementById('at-pair-values'); values.replaceChildren();
    pairs.forEach(function (pair) { values.append(node('li', '', pair[0] + ' + ' + pair[1] + ' · d=' + (pair[1] - pair[0]) / 2 + ' · pq=' + pair[0] * pair[1])); });
  }
  pairInput.addEventListener('input', drawPairs); drawPairs();

  var towerInput = document.getElementById('at-tower-c');
  function tower(c) {
    var a = Math.log(c), v = 1;
    for (var i = 0; i < 80; i++) v = Math.exp(a * Math.exp(-a * v));
    var u = Math.exp(-a * v), residual = Math.abs(v - Math.exp(a * u));
    return { u: u, v: v, residual: residual };
  }
  function drawTower() {
    var c = Number(towerInput.value), value = tower(c);
    document.getElementById('at-tower-c-value').value = c.toFixed(3);
    document.getElementById('at-tower-lower').textContent = value.u.toFixed(9);
    document.getElementById('at-tower-upper').textContent = value.v.toFixed(9);
    document.getElementById('at-tower-summary').textContent = 'Iteration residual |v − cᵘ| = ' + value.residual.toExponential(1) + ' · browser floating-point arithmetic';
    var svg = document.getElementById('at-tower-plot');
    var x = function (base) { return 62 + (base - 1) / 1.4 * 628; };
    var y = function (v) { return 276 - (v - 0.2) / 1.25 * 235; };
    chartBase(svg, 'Alternating-tower numerical phases, current base ' + c.toFixed(3), [0.25, 0.5, 0.75, 1, 1.25], y, [1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4], x);
    var paths = { u: '', v: '' };
    for (var i = 0; i <= 140; i++) {
      var base = 1 + i / 100, point = tower(base);
      ['u', 'v'].forEach(function (phase) { paths[phase] += (i ? ' L' : 'M') + x(base).toFixed(2) + ' ' + y(point[phase]).toFixed(2); });
    }
    svg.append(svgNode('line', { x1: x(c), y1: 25, x2: x(c), y2: 276, stroke: '#b1bdd2', 'stroke-dasharray': '4 5' }));
    ['u', 'v'].forEach(function (phase) {
      var color = phase === 'u' ? '#237f88' : '#8270c2';
      svg.append(svgNode('path', { d: paths[phase], fill: 'none', stroke: color, 'stroke-width': 3 }));
      svg.append(svgNode('circle', { cx: x(c), cy: y(value[phase]), r: 6, fill: color, stroke: '#fff', 'stroke-width': 2 }));
    });
    svg.append(svgNode('text', { x: 680, y: 317, 'text-anchor': 'end', fill: '#617391', 'font-size': 10 }, 'base c'));
  }
  towerInput.addEventListener('input', drawTower);
  document.getElementById('at-tower-specimen').addEventListener('click', function () { towerInput.value = '1.11'; drawTower(); });
  drawTower();

  var factors = new Set([2, 3, 5, 7]);
  var wheelGrid = document.getElementById('at-wheel-grid');
  for (var r = 0; r < 210; r++) { var cell = node('span', '', r); cell.setAttribute('role', 'listitem'); wheelGrid.append(cell); }
  function drawWheel() {
    var survives = 0;
    Array.from(wheelGrid.children).forEach(function (cell, r) {
      var accepted = Array.from(factors).every(function (p) { return r % p !== 0; });
      if (accepted) survives++;
      cell.classList.toggle('at-survives', accepted);
      cell.classList.toggle('at-composite-example', accepted && (r === 121 || r === 169));
      cell.setAttribute('aria-label', r + (accepted ? ', survives selected filters' : ', divisible by a selected factor'));
    });
    document.getElementById('at-wheel-summary').textContent = survives + ' of 210 remainders survive' + (factors.size === 4 ? ' · φ(210) = 48' : ' · ' + factors.size + ' filters active');
  }
  root.querySelectorAll('[data-at-factor]').forEach(function (button) {
    button.addEventListener('click', function () {
      var p = Number(button.dataset.atFactor);
      if (factors.has(p)) factors.delete(p); else factors.add(p);
      button.setAttribute('aria-pressed', String(factors.has(p))); drawWheel();
    });
  });
  drawWheel();

  var tabs = Array.from(root.querySelectorAll('[data-at-exhibit]'));
  function selectExhibit(button, focus) {
    tabs.forEach(function (tab) {
      var active = tab === button;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) button.focus();
  }
  tabs.forEach(function (button, index) {
    button.addEventListener('click', function () { selectExhibit(button, false); });
    button.addEventListener('keydown', function (event) {
      var target;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); selectExhibit(tabs[target], true); }
    });
  });
  revealFromHash();
})();
