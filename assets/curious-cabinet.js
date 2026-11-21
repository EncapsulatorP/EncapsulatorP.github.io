/* Exact coordinate rules; finite numerical illustrations. No dependencies or animation loop. */
(function (scope, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (scope && scope.document) {
    scope.EncapsulatorCabinet = api;
    if (scope.document.readyState === 'loading') scope.document.addEventListener('DOMContentLoaded', function () { api.init(scope.document); }, { once: true });
    else api.init(scope.document);
  }
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';
  var ZEROS = Object.freeze([
    6.0209489046975966549,
    10.2437703041665545521,
    12.9880980123124225075,
    16.3426071045872221950,
    18.2919931961235348385
  ]);
  var FLIP = 1 + Math.sqrt(6);
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function diskPoint(sigma, height) {
    if (!Number.isFinite(sigma) || !Number.isFinite(height)) throw new RangeError('The complex coordinate must be finite.');
    var den = (sigma + 1) * (sigma + 1) + height * height;
    if (den === 0) throw new RangeError('The coordinate map has a pole at s = −1.');
    var re = ((sigma - 2) * (sigma + 1) + height * height) / den;
    var im = 3 * height / den;
    return { re: re, im: im, magnitude: Math.hypot(re, im) };
  }

  function inverseDisk(re, im) {
    if (!Number.isFinite(re) || !Number.isFinite(im)) throw new RangeError('The disk coordinate must be finite.');
    var den = (1 - re) * (1 - re) + im * im;
    if (den === 0) throw new RangeError('The inverse map has a pole at w = 1.');
    return { re: ((2 + re) * (1 - re) - im * im) / den, im: 3 * im / den };
  }

  function logistic(x, r) { return r * x * (1 - x); }

  function orbit(mode, r, seed, delta, count) {
    if (!['mirror', 'merge', 'split'].includes(mode)) throw new RangeError('Unknown strand rule.');
    if (!Number.isFinite(r) || r < 0 || r > 4 || !Number.isFinite(seed) || seed < 0 || seed > 1) throw new RangeError('The logistic map uses 0 ≤ r ≤ 4 and 0 ≤ x₀ ≤ 1.');
    if (!Number.isFinite(delta) || (mode === 'split' && (r + delta < 0 || r + delta > 4))) throw new RangeError('The companion parameter must lie between 0 and 4.');
    if (!Number.isInteger(count) || count < 1 || count > 2048) throw new RangeError('Use a finite step count between 1 and 2048.');
    var x = seed;
    var y = 1 - seed;
    var values = [{ n: 0, x: x, y: y }];
    for (var n = 1; n <= count; n++) {
      x = logistic(x, r);
      y = mode === 'mirror' ? 1 - logistic(1 - y, r) : logistic(y, r + (mode === 'split' ? delta : 0));
      values.push({ n: n, x: x, y: y });
    }
    return values;
  }

  function decimal(value, digits) {
    return (Math.abs(value) < 0.5 * Math.pow(10, -digits) ? 0 : value).toFixed(digits);
  }
  function complex(re, im, digits) { return decimal(re, digits) + (im < 0 ? ' − ' : ' + ') + decimal(Math.abs(im), digits) + 'i'; }
  function scientific(value) { return value === 0 ? '0' : value.toExponential(2); }
  function svgElement(doc, tag, attrs) {
    var node = doc.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, String(attrs[key])); });
    return node;
  }
  function linePath(points) { return points.map(function (point, i) { return (i ? 'L' : 'M') + decimal(point[0], 3) + ' ' + decimal(point[1], 3); }).join(''); }
  function diskLocation(point) { return [330 + 165 * point.re, 236 - 165 * point.im]; }
  function diskRoute(sigma, height) {
    var points = [];
    for (var j = 0; j <= 80; j++) {
      var fraction = j / 80;
      points.push(diskLocation(diskPoint(2 + (sigma - 2) * fraction, height * fraction)));
    }
    return linePath(points);
  }
  function orbitGeometry(values) {
    var scaleX = function (n) { return 52 + 796 * n / (values.length - 1); };
    var scaleY = function (value) { return 288 - 256 * value; };
    var parent = values.map(function (v) { return [scaleX(v.n), scaleY(v.x)]; });
    var companion = values.map(function (v) { return [scaleX(v.n), scaleY(v.y)]; });
    return { parent: parent, companion: companion, parentPath: linePath(parent), companionPath: linePath(companion), areaPath: linePath(parent.concat(companion.slice().reverse())) + 'Z' };
  }

  function init(doc) {
    var root = doc.querySelector('[data-page="cabinet"]');
    if (!root || root.dataset.ccReady === 'true') return false;
    var get = function (id) { return root.querySelector('#' + id); };
    if (!get('cc-sigma') || !get('cc-r')) return false;
    var state = { mode: 'mirror' };
    var sigma = get('cc-sigma');
    var height = get('cc-height');
    var zeroButtons = Array.from(root.querySelectorAll('[data-cc-zero]'));
    var modeButtons = Array.from(root.querySelectorAll('[data-cc-mode]'));

    function readout(container, heading, lines) {
      var strong = doc.createElement('strong');
      strong.textContent = heading;
      var children = [strong];
      lines.forEach(function (text) { var span = doc.createElement('span'); span.textContent = text; children.push(span); });
      container.replaceChildren.apply(container, children);
    }

    function renderDisk() {
      var real = Number(sigma.value);
      var t = Number(height.value);
      var mapped = diskPoint(real, t);
      var pos = diskLocation(mapped);
      get('cc-sigma-value').textContent = decimal(real, 2);
      get('cc-height-value').textContent = decimal(t, 6);
      var region = Math.abs(real - 0.5) < 1e-12 ? 'On the critical rim' : real > 0.5 ? 'Inside the critical disk' : 'Outside the critical disk';
      if (real === 2 && t === 0) region = 'At the Catalan centre';
      readout(get('cc-disk-readout'), region, [
        's = ' + complex(real, t, 6),
        'w ≈ ' + complex(mapped.re, mapped.im, 6),
        '|w| ≈ ' + decimal(mapped.magnitude, 6)
      ]);
      var zeroGroup = get('cc-disk-zeros');
      var dots = [];
      var conjugates = get('cc-conjugates').checked;
      ZEROS.forEach(function (zero, index) {
        [1, -1].forEach(function (sign) {
          if (sign < 0 && !conjugates) return;
          var location = diskLocation(diskPoint(0.5, sign * zero));
          var dot = svgElement(doc, 'circle', { cx: location[0], cy: location[1], r: 4, fill: sign > 0 ? '#75e6d6' : '#b8a3ee' });
          var title = svgElement(doc, 'title');
          title.textContent = 'Beta zero ' + (index + 1) + ', height ' + decimal(sign * zero, 9) + ' (numerical approximation)';
          dot.append(title);
          dots.push(dot);
        });
        zeroButtons[index].setAttribute('aria-pressed', String(Math.abs(real - 0.5) < 1e-12 && Math.abs(t - zero) < 1e-10));
      });
      zeroGroup.replaceChildren.apply(zeroGroup, dots);
      var route = svgElement(doc, 'path', { d: diskRoute(real, t), fill: 'none', stroke: 'url(#cc-radius-stroke)', 'stroke-width': 1.6, 'stroke-dasharray': '4 5' });
      var routeTitle = svgElement(doc, 'title');
      routeTitle.textContent = 'Image of the straight segment from s = 2 to the selected s';
      route.append(routeTitle);
      get('cc-disk-path').replaceChildren(route);
      get('cc-disk-point').replaceChildren(
        svgElement(doc, 'circle', { cx: pos[0], cy: pos[1], r: 11, fill: '#b1ffe4', 'fill-opacity': 0.13, stroke: '#d7fff4', 'stroke-width': 1.5 }),
        svgElement(doc, 'circle', { cx: pos[0], cy: pos[1], r: 3, fill: '#fff' })
      );
      get('cc-disk-svg-desc').textContent = region + '. The selected s is ' + complex(real, t, 6) + ' and its image w is ' + complex(mapped.re, mapped.im, 6) + '. Five numerical positive beta zeros are shown' + (conjugates ? ' with their conjugate reflections.' : '.') + ' The dashed route is the image of a straight segment from s = 2.';
    }

    function setDisk(real, t) { sigma.value = String(real); height.value = String(t); renderDisk(); }
    sigma.addEventListener('input', renderDisk);
    height.addEventListener('input', renderDisk);
    get('cc-conjugates').addEventListener('change', renderDisk);
    get('cc-centre').addEventListener('click', function () { setDisk(2, 0); });
    get('cc-critical').addEventListener('click', function () { setDisk(0.5, Number(height.value)); });
    get('cc-first-zero').addEventListener('click', function () { setDisk(0.5, ZEROS[0]); });
    zeroButtons.forEach(function (button, index) { button.addEventListener('click', function () { setDisk(0.5, ZEROS[index]); }); });

    function renderOrbit() {
      var r = Number(get('cc-r').value);
      var seed = Number(get('cc-seed').value);
      var delta = Number(get('cc-delta').value);
      var values = orbit(state.mode, r, seed, delta, 48);
      var geometry = orbitGeometry(values);
      get('cc-r-value').textContent = decimal(r, 4);
      get('cc-seed-value').textContent = decimal(seed, 2);
      get('cc-delta-value').textContent = decimal(delta, 4);
      get('cc-delta-control').hidden = state.mode !== 'split';
      modeButtons.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.ccMode === state.mode)); });
      var mirror = state.mode === 'mirror';
      var merged = state.mode === 'merge';
      get('cc-mode-caption').textContent = mirror ? 'EXACT MIRROR RULE' : merged ? 'SAME LOGISTIC RULE' : 'TWO NEARBY PARAMETERS';
      var rule = get('cc-orbit-rule');
      rule.replaceChildren(doc.createTextNode('fᵣ(x) = rx(1 − x)'), doc.createElement('br'), doc.createTextNode(mirror ? 'xₙ₊₁ = fᵣ(xₙ) · yₙ₊₁ = 1 − fᵣ(1 − yₙ)' : merged ? 'xₙ₊₁ = fᵣ(xₙ) · yₙ₊₁ = fᵣ(yₙ)' : 'xₙ₊₁ = fᵣ(xₙ) · yₙ₊₁ = fᵣ₊Δᵣ(yₙ)'));
      var children = [svgElement(doc, 'path', { d: geometry.areaPath, fill: 'url(#cc-strand-wash)', stroke: 'none' })];
      values.forEach(function (v, index) {
        var a = geometry.parent[index];
        var b = geometry.companion[index];
        children.push(svgElement(doc, 'path', { d: linePath([a, b]), stroke: index % 4 === 0 ? '#6d8ea9' : '#36516c', 'stroke-width': index % 4 === 0 ? 1.1 : 0.75, 'stroke-opacity': 0.7, fill: 'none' }));
      });
      children.push(svgElement(doc, 'path', { d: geometry.parentPath, fill: 'none', stroke: '#74e7d1', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }));
      children.push(svgElement(doc, 'path', { d: geometry.companionPath, fill: 'none', stroke: '#b6a0ef', 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-dasharray': merged ? '4 6' : 'none' }));
      values.forEach(function (v, index) {
        if (index % 2 !== 0) return;
        [geometry.parent[index], geometry.companion[index]].forEach(function (point, branch) {
          children.push(svgElement(doc, 'circle', { cx: point[0], cy: point[1], r: index % 12 === 0 ? 3.2 : 1.7, fill: branch === 0 ? '#c3fff0' : '#ddceff' }));
        });
      });
      get('cc-orbit-data').replaceChildren.apply(get('cc-orbit-data'), children);
      var firstGap = Math.abs(values[1].x - values[1].y);
      var mirrorError = Math.max.apply(null, values.map(function (v) { return Math.abs(v.x + v.y - 1); }));
      var mergeError = Math.max.apply(null, values.slice(1).map(function (v) { return Math.abs(v.x - v.y); }));
      var heading;
      var lines;
      if (mirror) {
        heading = 'Conjugating by x → 1 − x preserves the mirror in exact arithmetic.';
        lines = ['Max floating-point mirror error: ' + scientific(mirrorError), '48 independent updates · both seeds remain in [0, 1].'];
      } else if (merged) {
        heading = 'Complementary seeds have the same first image in exact arithmetic.';
        lines = ['First computed gap: ' + scientific(firstGap), 'Max gap after step 1: ' + scientific(mergeError) + ' · 48 updates.'];
      } else {
        var companionR = r + delta;
        var crossing = (r < FLIP && companionR > FLIP) || (r > FLIP && companionR < FLIP);
        heading = crossing ? 'The two parameters straddle the second period-doubling threshold.' : 'A parameter change opens the two strands.';
        lines = ['First gap: ' + scientific(firstGap) + ' · exact formula |Δr|x₀(1 − x₀)', 'Companion r + Δr = ' + decimal(companionR, 4), 'Threshold 1 + √6 ≈ 3.449489743 · displayed iterates include the transient.'];
      }
      readout(get('cc-orbit-readout'), heading, lines);
      get('cc-orbit-svg-desc').textContent = heading + ' Parent parameter ' + decimal(r, 4) + ', initial seed ' + decimal(seed, 2) + '. The chart plots all 48 updates, with a rung between the two values at each step. Numerical values are available in the table below.';
      var metricHeader = root.querySelector('.cc-orbit-table thead th:last-child');
      metricHeader.textContent = mirror ? '|xₙ + yₙ − 1|' : '|xₙ − yₙ|';
      var table = get('cc-orbit-table-body');
      var rows = values.map(function (v) {
        var row = doc.createElement('tr');
        var label = doc.createElement('th');
        label.setAttribute('scope', 'row');
        label.textContent = String(v.n);
        row.append(label);
        [v.x, v.y, mirror ? Math.abs(v.x + v.y - 1) : Math.abs(v.x - v.y)].forEach(function (value) { var cell = doc.createElement('td'); cell.textContent = decimal(value, 6); row.append(cell); });
        return row;
      });
      table.replaceChildren.apply(table, rows);
    }

    modeButtons.forEach(function (button) { button.addEventListener('click', function () { state.mode = button.dataset.ccMode; renderOrbit(); }); });
    ['cc-r', 'cc-seed', 'cc-delta'].forEach(function (id) { get(id).addEventListener('input', renderOrbit); });
    get('cc-split-preset').addEventListener('click', function () {
      state.mode = 'split'; get('cc-r').value = '3.445'; get('cc-seed').value = '0.37'; get('cc-delta').value = '0.0073'; renderOrbit();
    });
    get('cc-reset-mirror').addEventListener('click', function () {
      state.mode = 'mirror'; get('cc-r').value = '3.445'; get('cc-seed').value = '0.37'; get('cc-delta').value = '0.0073'; renderOrbit();
    });
    renderDisk();
    renderOrbit();
    root.querySelectorAll('button:disabled,input:disabled').forEach(function (control) { control.disabled = false; });
    root.dataset.ccReady = 'true';
    return true;
  }

  return Object.freeze({ zeros: ZEROS, flip: FLIP, diskPoint: diskPoint, inverseDisk: inverseDisk, logistic: logistic, orbit: orbit, diskRoute: diskRoute, orbitGeometry: orbitGeometry, init: init });
});
