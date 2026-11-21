(function () {
  'use strict';
  var LIMIT = 2600;
  function makeSieve(limit) {
    var prime = new Uint8Array(limit + 1);
    prime.fill(1, 2);
    for (var p = 2; p * p <= limit; p++) {
      if (prime[p]) for (var k = p * p; k <= limit; k += p) prime[k] = 0;
    }
    return prime;
  }
  var sieve = makeSieve(LIMIT);
  function pairsFor(n) {
    if (!Number.isInteger(n) || n < 4 || n > LIMIT || n % 2) throw new RangeError('Choose an even integer from 4 through 2600.');
    var pairs = [];
    for (var p = 2; p <= n / 2; p++) {
      var q = n - p;
      if (sieve[p] && sieve[q]) pairs.push({ p: p, q: q, m: n / 2, d: (q - p) / 2, product: p * q, mu: p === q ? 0 : 1 });
    }
    return pairs;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { pairsFor: pairsFor, makeSieve: makeSieve, limit: LIMIT };
  if (typeof document === 'undefined') return;

  function initialize() {
    var root = document.getElementById('goldbach-lab');
    if (!root) return;
    var byId = function (id) { return root.querySelector('#' + id); };
    var svg = byId('gb-pair-svg'), slider = byId('gb-even-sum'), number = byId('gb-even-number'), picker = byId('gb-pairs');
    var n = 100, pairs = pairsFor(n), selected = pairs.length - 1, view = 'arcs';
    var format = function (value) { return value.toLocaleString('en-US'); };
    var f = function (value) { return Number(value.toFixed(2)); };
    root.querySelectorAll('[data-gb-enhanced]').forEach(function (el) { el.hidden = false; });

    function text(x, y, content, options) {
      options = options || {};
      return '<text x="' + f(x) + '" y="' + f(y) + '" fill="' + (options.color || '#afc5dd') + '" font-size="' + (options.size || 13) + '" text-anchor="' + (options.anchor || 'middle') + '">' + content + '</text>';
    }
    function draw() {
      var pair = pairs[selected], mobile = root.clientWidth < 680;
      var width = mobile ? 420 : 920, left = mobile ? 43 : 60, right = width - left;
      var W = right - left, centre = width / 2, bottom = 270, m = n / 2;
      svg.setAttribute('viewBox', '0 0 ' + width + ' 350');
      var title = view === 'arcs' ? 'Prime pairs around the centre of ' + n : 'Half-gap and product for prime pairs of ' + n;
      var desc = pairs.length + ' unordered prime pairs. Selected ' + pair.p + ' plus ' + pair.q + ', centre ' + m + ', half-gap ' + pair.d + ', product ' + pair.product + '. All pairs are available in the buttons below.';
      var out = '<title id="gb-svg-title">' + title + '</title><desc id="gb-svg-desc">' + desc + '</desc>';
      if (view === 'arcs') {
        out += '<path d="M' + left + ' 270H' + right + '" fill="none" stroke="#38526e" stroke-width="1.5"/>';
        out += '<path d="M' + centre + ' 54V284" fill="none" stroke="#829b6f" stroke-dasharray="4 6" opacity=".7"/>';
        out += text(centre, 32, 'centre m = ' + format(m), { color: '#c3ef8b', size: 15 });
        var ticks = [0, n / 4, n / 2, 3 * n / 4, n];
        ticks.forEach(function (value) { var x = left + value / n * W; out += '<path d="M' + f(x) + ' 270v6" stroke="#55718e"/>'; out += text(x, 301, String(value), { size: 13 }); });
        pairs.forEach(function (item, i) { if (i !== selected) out += arc(item, i, false); });
        out += arc(pair, selected, true);
        var xp = left + pair.p / n * W, xq = left + pair.q / n * W;
        if (pair.d === 0) {
          out += text(centre, 245, 'p = q = ' + pair.p, { color: '#d8c6ff', size: 16 });
        } else if (xq - xp < 100) {
          out += text(centre, 230, pair.p + ' + ' + pair.q, { color: '#d2f7ad', size: 16 });
        } else {
          out += text(xp, 251, 'p = ' + pair.p, { color: '#d2f7ad', size: 15 });
          out += text(xq, 251, 'q = ' + pair.q, { color: '#d2f7ad', size: 15 });
        }
        out += text(centre, 335, 'p + q = ' + format(n) + '   ·   d = ' + format(pair.d), { color: '#bdd6e5', size: 13 });
        byId('gb-plot-caption').textContent = 'Each arc joins p to q on the number line. The vertical line marks their shared centre.';
      } else {
        var top = 48, H = bottom - top;
        function px(d) { return left + d / m * W; }
        function py(product) { return bottom - product / (m * m) * H; }
        [0, .5, 1].forEach(function (t) {
          var y = py(m * m * t); out += '<path d="M' + left + ' ' + f(y) + 'H' + right + '" stroke="#233b57" stroke-dasharray="3 5"/>';
          out += text(left - 10, y + 4, t === 1 ? 'm²' : t === .5 ? 'm²/2' : '0', { size: 12, anchor: 'end' });
        });
        out += '<path d="M' + left + ' 48V270H' + right + '" fill="none" stroke="#55718e"/>';
        var curve = '';
        for (var j = 0; j <= 120; j++) { var d = m * j / 120; curve += (j ? 'L' : 'M') + f(px(d)) + ' ' + f(py(m * m - d * d)); }
        out += '<path d="' + curve + '" fill="none" stroke="#8ba6c8" stroke-width="1.5" opacity=".65"/>';
        out += text(centre, 27, 'pq = m² − d²', { color: '#c9b8f2', size: 16 });
        [0, .25, .5, .75, 1].forEach(function (t) { out += text(px(m * t), 296, String(m * t), { size: 13 }); });
        pairs.forEach(function (item, i) { if (i !== selected) out += productDot(item, i, false); });
        out += productDot(pair, selected, true);
        var dotX = px(pair.d), dotY = py(pair.product), labelX = Math.max(left + 65, Math.min(right - 65, dotX));
        out += text(labelX, dotY < 85 ? dotY + 29 : dotY - 19, pair.p + ' × ' + pair.q, { color: '#d3f6b5', size: 15 });
        out += text(centre, 334, 'half-gap d →   ·   product pq ↑', { color: '#a5c1d8', size: 13 });
        byId('gb-plot-caption').textContent = 'Horizontal: half-gap d. Vertical: product pq. Every prime pair lies on the same exact parabola.';
        function productDot(item, i, active) {
          return '<circle data-gb-pair="' + i + '" cx="' + f(px(item.d)) + '" cy="' + f(py(item.product)) + '" r="' + (active ? 7 : 4.5) + '" fill="' + (active ? '#c3ef8b' : '#6ed9d7') + '" stroke="' + (active ? '#e3ffc5' : '#0d263c') + '" stroke-width="' + (active ? 2 : 1) + '" opacity="' + (active ? 1 : .75) + '"><title>' + item.p + ' + ' + item.q + '; d = ' + item.d + '; pq = ' + item.product + '</title></circle>';
        }
      }
      svg.innerHTML = out;
      function arc(item, i, active) {
        var a = left + item.p / n * W, b = left + item.q / n * W, rx = (b - a) / 2, ry = item.d / m * 205;
        var color = active ? '#c3ef8b' : '#6ed9d7';
        if (item.d === 0) return '<circle data-gb-pair="' + i + '" cx="' + centre + '" cy="270" r="' + (active ? 8 : 5) + '" fill="#bda8f3" stroke="' + (active ? '#dfffb8' : '#0a1527') + '" stroke-width="2"><title>' + item.p + ' + ' + item.q + ': diagonal pair</title></circle>';
        return '<g data-gb-pair="' + i + '" opacity="' + (active ? 1 : Math.max(.22, Math.min(.6, 5 / pairs.length))) + '"><title>' + item.p + ' + ' + item.q + '; half-gap ' + item.d + '</title><path d="M' + f(a) + ' 270A' + f(rx) + ' ' + f(ry) + ' 0 0 1 ' + f(b) + ' 270" fill="none" stroke="' + color + '" stroke-width="' + (active ? 3.5 : 1.5) + '"/><circle cx="' + f(a) + '" cy="270" r="' + (active ? 5 : 2.4) + '" fill="' + color + '"/><circle cx="' + f(b) + '" cy="270" r="' + (active ? 5 : 2.4) + '" fill="' + color + '"/></g>';
      }
    }
    function update(rebuild) {
      var item = pairs[selected];
      slider.value = n; number.value = n; byId('gb-even-output').value = format(n);
      byId('gb-pair-count').textContent = pairs.length;
      byId('gb-selected-sum').textContent = item.p + ' + ' + item.q + ' = ' + format(n);
      byId('gb-selected-kind').textContent = item.d === 0 ? 'Diagonal pair · the same prime twice · d = 0' : item.d === 1 ? 'Twin primes · one step either side of the centre · d = 1' : 'Distinct primes · half-gap d = ' + format(item.d);
      byId('gb-selected-identity').textContent = item.p + ' × ' + item.q + ' = ' + format(item.m) + '² − ' + format(item.d) + '² = ' + format(item.product);
      byId('gb-selected-mobius').textContent = 'μ(' + format(item.product) + ') = ' + (item.mu ? '+1 · two distinct prime factors' : '0 · a square of a prime');
      byId('gb-picker-hint').textContent = 'Every pair below adds to ' + format(n) + '.';
      if (rebuild) picker.innerHTML = pairs.map(function (pair, i) { var suffix = pair.d === 0 ? 'diagonal' : pair.d === 1 ? 'twins' : ''; return '<button type="button" data-gb-pair="' + i + '" aria-pressed="' + (i === selected) + '" aria-label="Select ' + pair.p + ' plus ' + pair.q + (suffix ? ', ' + suffix : '') + '">' + pair.p + ' + ' + pair.q + (suffix ? '<small>' + suffix + '</small>' : '') + '</button>'; }).join('');
      else picker.querySelectorAll('button').forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === selected)); });
      root.querySelectorAll('[data-gb-n]').forEach(function (button) { button.setAttribute('aria-pressed', String(Number(button.dataset.gbN) === n)); });
      root.querySelectorAll('[data-gb-view]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.gbView === view)); });
      byId('gb-live').textContent = n + ' has ' + pairs.length + ' unordered prime ' + (pairs.length === 1 ? 'pair' : 'pairs') + '. Selected ' + item.p + ' + ' + item.q + ', half-gap ' + item.d + ', product ' + item.product + ', Möbius value ' + item.mu + '.';
      draw();
    }
    function selectN(value) {
      var next = Number(value);
      if (!Number.isFinite(next)) next = n;
      next = Math.max(4, Math.min(LIMIT, Math.round(next / 2) * 2));
      n = next; pairs = pairsFor(n); selected = pairs.length - 1; update(true);
    }
    slider.addEventListener('input', function () { selectN(slider.value); });
    number.addEventListener('change', function () { selectN(number.value); });
    number.addEventListener('keydown', function (event) { if (event.key === 'Enter') { event.preventDefault(); selectN(number.value); } });
    root.addEventListener('click', function (event) {
      var target = event.target.closest('[data-gb-n], [data-gb-pair], [data-gb-view]');
      if (!target || !root.contains(target)) return;
      if (target.hasAttribute('data-gb-n')) selectN(target.dataset.gbN);
      else if (target.hasAttribute('data-gb-view')) { view = target.dataset.gbView; update(false); }
      else { selected = Number(target.dataset.gbPair); update(false); }
    });
    var resizeTimer;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(draw, 80); });
    update(true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
