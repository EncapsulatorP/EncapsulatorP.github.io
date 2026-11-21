/* Visual-first reading rooms. Progressive enhancement; no external requests.
 * Camera motion changes the projection only. Exact arithmetic and illustrative
 * geometry are identified separately; the original instruments stay intact.
 */
(function () {
  'use strict';

  function integer(value, low, high) {
    if (!Number.isSafeInteger(value) || value < low || value > high) throw new RangeError('Integer outside the displayed domain.');
    return value;
  }
  function factors(n) {
    integer(n, 1, 100000000);
    var out = [];
    for (var p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p; }
    if (n > 1) out.push(n);
    return out;
  }
  function neighbour(m) {
    integer(m, 3, 200);
    var a = factors(m - 1), b = factors(m + 1), all = factors(m * m - 1);
    return { m: m, left: a, right: b, factors: all, product: m * m - 1, omega: all.length,
      mu: new Set(all).size < all.length ? 0 : (all.length % 2 ? -1 : 1), twin: a.length === 1 && b.length === 1 };
  }
  function centreGap(m, d) {
    integer(m, 3, 40); integer(d, 0, m - 1);
    return { m: m, d: d, p: m - d, q: m + d, area: m * m - d * d };
  }
  function isPrime(n) {
    if (!Number.isSafeInteger(n) || n < 2) return false;
    for (var p = 2; p * p <= n; p++) if (n % p === 0) return false;
    return true;
  }
  function primePairs(n) {
    integer(n, 4, 2600); if (n % 2) throw new RangeError('The displayed sum is even.');
    var out = [];
    for (var p = 2; p <= n / 2; p++) if (isPrime(p) && isPrime(n - p)) out.push([p, n - p]);
    return out;
  }
  function collatz(seed) {
    integer(seed, 1, 1000000);
    var path = [seed], n = seed;
    while (n !== 1 && path.length <= 1500) {
      var next = n % 2 ? 3 * n + 1 : n / 2;
      if (!Number.isSafeInteger(next)) return { path: path, complete: false };
      path.push(next); n = next;
    }
    return { path: path, complete: n === 1 };
  }
  function shapiro(j, theta) {
    integer(j, 0, 7);
    var p = [1, 0], q = [1, 0];
    for (var k = 0; k < j; k++) {
      var t = Math.pow(2, k) * theta, c = Math.cos(t), s = Math.sin(t);
      var re = c * q[0] - s * q[1], im = s * q[0] + c * q[1];
      q = [p[0] - re, p[1] - im]; p = [p[0] + re, p[1] + im];
    }
    return { p: p[0] * p[0] + p[1] * p[1], q: q[0] * q[0] + q[1] * q[1], total: Math.pow(2, j + 1) };
  }
  function towerDepths(c, count) {
    if (!(c > 1 && c <= 2.4)) throw new RangeError('Base outside the illustrated range.');
    integer(count, 1, 60);
    var out = [[1, 1]], u = 1, v = 1;
    for (var k = 0; k < count; k++) { var a = Math.pow(c, -v), b = Math.pow(c, u); u = a; v = b; out.push([u, v]); }
    return out;
  }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function project(p, yaw, pitch) {
    var x = p[0] * Math.cos(yaw) + p[2] * Math.sin(yaw);
    var z = -p[0] * Math.sin(yaw) + p[2] * Math.cos(yaw);
    var y = p[1] * Math.cos(pitch) - z * Math.sin(pitch);
    z = p[1] * Math.sin(pitch) + z * Math.cos(pitch);
    var scale = 91 * 4 / (4 - z);
    return [172 + x * scale, 112 - y * scale, z];
  }
  function plotPoints(d) {
    var values = (d || '').match(/[-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?/gi) || [], out = [];
    for (var i = 0; i + 1 < values.length; i += 2) out.push([Number(values[i]), Number(values[i + 1])]);
    return out;
  }
  var api = { factors: factors, neighbour: neighbour, centreGap: centreGap, isPrime: isPrime, primePairs: primePairs,
    collatz: collatz, shapiro: shapiro, towerDepths: towerDepths, project: project, plotPoints: plotPoints };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  var NS = 'http://www.w3.org/2000/svg', doc = document, motionItems = [], raf = null, lastTime = 0;
  var reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function make(tag, cls, text) { var node = doc.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; }
  function svgNode(tag, attrs, text) {
    var node = doc.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function add(parent, tag, attrs, text) { var n = svgNode(tag, attrs, text); parent.appendChild(n); return n; }
  function page(name) { return doc.querySelector('.page[data-page="' + name + '"]'); }
  function put(id, text) { var n = doc.getElementById(id); if (n) n.textContent = text; }
  function value(id, fallback) { var n = doc.getElementById(id), v = n ? Number(n.value) : NaN; return Number.isFinite(v) ? v : fallback; }
  function dispatchInput(control) { control.dispatchEvent(new Event('input', { bubbles: true })); }
  function after(node, next) { if (node && node.parentNode) node.parentNode.insertBefore(next, node.nextSibling); }
  function jump(target) {
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
  }
  function visible(item) {
    var room = item.node.closest('.page');
    if (doc.hidden || doc.querySelector('dialog[open]') || (room && !room.classList.contains('on'))) return false;
    var r = item.node.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
  }
  function wake() { if (raf === null && !doc.hidden) { lastTime = 0; raf = window.requestAnimationFrame(tick); } }
  function tick(time) {
    raf = null; var dt = lastTime ? Math.min((time - lastTime) / 1000, 0.06) : 0; lastTime = time;
    var active = false;
    motionItems.forEach(function (item) { if (!item.paused && !item.interacting && visible(item)) { item.frame(dt); active = true; } });
    if (active) raf = window.requestAnimationFrame(tick);
  }
  function motionButton(item, label) {
    var button = make('button', 'vf-motion-toggle'); button.type = 'button';
    function refresh() { button.textContent = item.paused ? 'Play motion' : 'Pause'; button.setAttribute('aria-pressed', String(item.paused)); button.setAttribute('aria-label', (item.paused ? 'Play ' : 'Pause ') + label); }
    button.addEventListener('click', function () { item.paused = !item.paused; refresh(); wake(); });
    item.refreshButton = refresh; refresh(); return button;
  }
  function registerMotion(item) {
    item.paused = reduced.matches; item.interacting = false; motionItems.push(item);
    if (typeof IntersectionObserver !== 'undefined') {
      var observer = new IntersectionObserver(function () { wake(); }); observer.observe(item.node);
    }
  }

  function readingRoute(key, data) {
    var section = make('section', 'vf-reading-route'); section.id = 'vf-reading-' + key;
    section.setAttribute('aria-labelledby', section.id + '-title');
    section.appendChild(make('p', 'vf-eyebrow', 'A route from the picture to the argument'));
    var heading = make('h3', '', data.title || 'See the structure. Follow the proof.'); heading.id = section.id + '-title'; section.appendChild(heading);
    var grid = make('div', 'vf-reading-grid');
    [['01', 'Exact statement', data.statement], ['02', 'Assumptions', data.assumptions], ['03', 'Why the picture helps', data.explanation]].forEach(function (part) {
      var card = make('div', 'vf-reading-step'); card.appendChild(make('span', 'vf-step-number', part[0])); card.appendChild(make('h4', '', part[1]));
      (Array.isArray(part[2]) ? part[2] : [part[2]]).forEach(function (p) { card.appendChild(make('p', '', p)); }); grid.appendChild(card);
    });
    section.appendChild(grid);
    var proof = make('details', 'vf-proof'); proof.open = true; proof.appendChild(make('summary', '', '04 / Read the proof'));
    data.proof.forEach(function (p) { proof.appendChild(make('p', '', p)); });
    if (data.limit) proof.appendChild(make('p', 'vf-scope', data.limit));
    var links = make('div', 'vf-proof-links');
    (data.links || []).forEach(function (source) { var a = make('a', '', source[0] + ' ↗'); a.href = source[1]; links.appendChild(a); });
    if (links.childNodes.length) proof.appendChild(links); section.appendChild(proof); return section;
  }
  var proofs = {
    pairs: {
      title: 'A centre, a gap, an exact product.',
      statement: ['m = (p + q)/2, d = (q − p)/2.', 'p = m − d, q = m + d, pq = m² − d².'],
      assumptions: 'The identity holds for real p and q. For a pair of odd primes with p ≤ q, m and d are nonnegative integers and m > d. A repeated prime is the diagonal d = 0.',
      explanation: 'Moving along a fixed sum keeps the centre still. A larger gap subtracts a larger square from the product. Prime dots pick out an arithmetic subset of this same geometric curve.',
      proof: ['Substituting the definitions gives m − d = p and m + d = q. Multiplication then gives (m − d)(m + d) = m² − d².', 'For distinct primes p and q the product has two distinct prime factors, so μ(pq) = +1. On the diagonal p = q, p² has a square factor and μ(p²) = 0.'],
      limit: 'The finite prime-pair plot enumerates its stated input range. This identity does not supply a prime pair for every even integer.',
      links: [['Detailed lemma and proof', '#lemmas'], ['Explore the prime-pair model', '#goldbach-lab']]
    },
    lemmas: {
      title: 'Why counting to two detects the twins.',
      statement: 'For every integer m ≥ 3, Ω(m² − 1) = 2 if and only if m − 1 and m + 1 are prime. Here Ω counts prime factors with multiplicity.',
      assumptions: 'Both neighbours must be positive integers at least 2. This is why the lower bound m ≥ 3 belongs in the statement.',
      explanation: 'The product splits into two nontrivial factors. Each neighbour contributes at least one prime factor; a total of two leaves exactly one for each.',
      proof: ['Factor m² − 1 = (m − 1)(m + 1). Additivity gives Ω(m² − 1) = Ω(m − 1) + Ω(m + 1). Each summand is an integer at least 1, so their sum is 2 exactly when each equals 1.', 'A positive integer at least 2 has Ω = 1 exactly when it is prime. This proves both directions.'],
      limit: 'The equivalence recognizes a twin-prime centre. It does not establish that infinitely many such centres exist.',
      links: [['All written lemmas', '#lemmas']]
    },
    collatz: {
      title: 'Two affine rails, one deterministic orbit.',
      statement: 'For the standard Collatz rule T(n), every delay point (n, T(n)) lies on y = x/2 when n is even, or y = 3x + 1 when n is odd.',
      assumptions: 'n is a positive integer. The full plot uses standard Collatz updates, not the shortcut that combines an odd step with its following division by 2.',
      explanation: 'The plotted flight is the sequence of actual integer values. Its vertical display is log₂(n), which makes large excursions readable. The header uses consecutive triples of those logarithms; its rotation changes only the camera.',
      proof: ['If n is even, the definition gives T(n) = n/2, so (n, T(n)) is on the first line. If n is odd, T(n) = 3n + 1, so it is on the second line. Parity exhausts the positive integers.', 'Once a deterministic orbit revisits a value, its later values repeat. The computed seed 27 reaches 1 in 111 updates, with peak 9,232; its displayed finite path can be checked one update at a time.'],
      limit: 'These rails and finite orbit checks do not prove convergence for every starting integer. The input range, step cap and integer-precision guard remain stated in the original instrument.',
      links: [['Two-rail delay view', '#embed'], ['Complex extension and its assumptions', '#scape']]
    },
    towers: {
      title: 'The two phases have a shared logarithmic balance.',
      statement: 'If c > 1 and u = c^(−v), v = c^u, then 0 < u < 1 < v and −u ln u = v ln v.',
      assumptions: 'This statement is conditional on a positive pair satisfying the two phase equations. The imposed signs are part of the model. A finite numerical iteration is an approximation to such a pair.',
      explanation: 'The negative exponent puts one phase below 1, while the positive exponent puts the other above it. Taking logarithms relates their distances from 1 through a single exact balance.',
      proof: ['Taking natural logarithms gives ln u = −v ln c and ln v = u ln c. Multiplying by u and v respectively gives u ln u = −uv ln c and v ln v = uv ln c; their sum is zero.', 'Also, −u ln u ≤ 1/e for 0 < u < 1: its derivative is −ln u − 1 and its maximum is at u = 1/e. Therefore every such phase pair satisfies v ln v ≤ 1/e.'],
      limit: 'The plotted numerical branches and any crossing with a chosen constant need their own convergence or residual checks. The logarithmic identity does not turn a tuned crossing into a number-theoretic identity.',
      links: [['Tower envelope and source trail', '#atlas?entry=tower-envelope'], ['Recovered tower constructions', 'atlas/recovered-bridges.md#tower-log-chain']]
    },
    disk: {
      title: 'A half-plane becomes a disk by an exact change of coordinates.',
      statement: 'For w = (s − 2)/(s + 1), the half-plane Re(s) > 1/2 maps to |w| < 1. The boundary maps to the unit circle, with w = 1 approached at infinity.',
      assumptions: 's is complex and s ≠ −1. The inverse is s = (2 + w)/(1 − w), with w ≠ 1. Numerical beta zeros in the instrument are samples, separate from the mapping identity.',
      explanation: 'The circle is a coordinate picture of the critical line. At its centre w = 0, s = 2, so β(s(w)) takes the value β(2), Catalan’s constant.',
      proof: ['Write s = σ + it. Then |s + 1|² − |s − 2|² = (σ + 1)² − (σ − 2)² = 6σ − 3. Dividing by the positive |s + 1|² shows |w| < 1 exactly when σ > 1/2.', 'Solving w(s + 1) = s − 2 gives the inverse. Substitution at w = 0 gives s = 2. No zero-location theorem is needed for these coordinate facts.'],
      limit: 'Mapping known numerical points to the rim does not prove that every nontrivial beta zero lies there.',
      links: [['Beta disk derivation', 'atlas/recovered-bridges.md#beta-disk']]
    },
    mirror: {
      title: 'A mirror rule and a same-map rule have different consequences.',
      statement: 'For fᵣ(x) = rx(1 − x), fᵣ(1 − x) = fᵣ(x). Complementary seeds under this same map therefore share their first image.',
      assumptions: 'The exact identity is algebraic. To keep both orbits in [0, 1], use x₀ in [0, 1] and parameters in [0, 4]. The instrument states which update rule is selected.',
      explanation: 'Under the same logistic map, complementary inputs merge. Under the conjugate companion gᵣ(y) = 1 − fᵣ(1 − y), the complement relation persists instead. A parameter perturbation is a third, distinct experiment.',
      proof: ['Expand fᵣ(1 − x) = r(1 − x)x = fᵣ(x). If both strands use fᵣ, x₁ = y₁ and determinism makes all later values equal in exact arithmetic.', 'If y₀ = 1 − x₀ and the companion uses gᵣ, then yₙ₊₁ = 1 − fᵣ(1 − yₙ) = 1 − fᵣ(xₙ) = 1 − xₙ₊₁. Induction preserves the mirror. Floating-point residuals are displayed separately.'],
      limit: 'A visually similar pair of curves is not enough to identify which update rule generated them.',
      links: [['Quarter-turn derivative calculation', 'atlas/recovered-bridges.md#logistic-quarter-turn']]
    },
    wheel: {
      title: 'Why the wheel leaves exactly 48 lanes.',
      statement: 'There are φ(210) = 48 remainder classes r modulo 210 with gcd(r, 210) = 1. Every prime greater than 7 belongs to one of them.',
      assumptions: '210 = 2 × 3 × 5 × 7. The exact count 48 uses all four filters. Switching off a filter changes the set displayed by the instrument.',
      explanation: 'Each filter removes a divisibility obstruction. The remaining lanes are candidates for large primes, and also contain many composites.',
      proof: ['The Chinese remainder theorem identifies a remainder modulo 210 with one remainder modulo each of 2, 3, 5 and 7. Coprimality means choosing a nonzero remainder in each component: (2 − 1)(3 − 1)(5 − 1)(7 − 1) = 48 choices.', 'A prime above 7 is divisible by none of these four primes, so it survives. The converse fails: for example 121 = 11² survives all four filters.'],
      limit: 'The wheel supplies a finite arithmetic organization. Survival alone does not certify primality.',
      links: [['Wheel arithmetic and source trail', '#atlas?entry=wheel-210']]
    },
    shapiro: {
      title: 'An energy identity survives every recursion step.',
      statement: 'P₀ = Q₀ = 1; Pⱼ₊₁ = Pⱼ + z^(2ʲ)Qⱼ; Qⱼ₊₁ = Pⱼ − z^(2ʲ)Qⱼ. For |z| = 1, |Pⱼ|² + |Qⱼ|² = 2^(j + 1).',
      assumptions: 'z lies on the unit circle and j is a nonnegative integer. The chart samples angles numerically; the identity concerns every angle.',
      explanation: 'The two additions carry opposite cross terms. Their squared magnitudes therefore trade energy while their sum follows a simple doubling rule.',
      proof: ['For complex a and b, expansion gives |a + b|² + |a − b|² = 2(|a|² + |b|²). Set a = Pⱼ and b = z^(2ʲ)Qⱼ. Because |z| = 1, |b|² = |Qⱼ|².', 'Thus the total doubles at each step. It starts at |1|² + |1|² = 2, so after j steps it equals 2^(j + 1).'],
      limit: 'The animated header lifts the two normalized energy shares above the same angle circle. Camera movement adds no mathematical dimension to the identity.',
      links: [['Rudin–Shapiro notebook thread and sources', '#buried-shapiro-rings']]
    }
  };

  function control(label, id, min, max, initial) {
    var wrap = make('label', 'vf-control'), title = make('span', '', label), output = make('output', '', String(initial)); output.id = id + '-value';
    title.appendChild(output); var input = make('input'); input.type = 'range'; input.id = id; input.min = min; input.max = max; input.step = '1'; input.value = initial;
    wrap.htmlFor = id; wrap.append(title, input); return wrap;
  }
  function addPreset(parent, text, action) { var b = make('button', 'vf-button', text); b.type = 'button'; b.addEventListener('click', action); parent.appendChild(b); return b; }
  function instrument(id, title, caption) {
    var box = make('section', 'vf-instrument wrap'); box.id = id; box.setAttribute('aria-labelledby', id + '-title');
    box.appendChild(make('p', 'vf-eyebrow', 'Start with a construction'));
    var h = make('h3', '', title); h.id = id + '-title'; box.appendChild(h);
    var svg = svgNode('svg', { viewBox: '0 0 720 330', class: 'vf-main-svg', role: 'img', 'aria-label': caption }); box.appendChild(svg);
    var cap = make('p', 'vf-caption', caption); box.appendChild(cap); return { box: box, svg: svg };
  }
  function initHome() {
    var room = page('home'), hero = room && room.querySelector('header.hero'); if (!hero) return;
    var model = instrument('vf-home-model', 'One missing square. The same area in a new shape.', 'The square of side m loses a square of side d. The remaining area equals a rectangle with sides m − d and m + d.');
    var controls = make('div', 'vf-controls'); controls.append(control('Centre m', 'vf-home-m', 3, 30, 12), control('Half-gap d', 'vf-home-d', 0, 11, 1)); model.box.appendChild(controls);
    var presets = make('div', 'vf-presets');
    [[12, 1, 'Twin neighbours'], [12, 0, 'No gap'], [12, 5, 'Open the gap']].forEach(function (p) { addPreset(presets, p[2], function () { doc.getElementById('vf-home-m').value = p[0]; doc.getElementById('vf-home-d').value = p[1]; dispatchInput(doc.getElementById('vf-home-m')); }); });
    model.box.appendChild(presets); var live = make('p', 'vf-live'); live.id = 'vf-home-result'; live.setAttribute('role', 'status'); model.box.appendChild(live);
    after(hero, model.box); var route = readingRoute('home', proofs.pairs); route.classList.add('wrap'); after(model.box, route);
    var promotion = hero.querySelector('.atlas-home-launch'); if (promotion) { promotion.classList.add('vf-home-promotion'); after(route, promotion); }
    function draw() {
      var m = value('vf-home-m', 12), dInput = doc.getElementById('vf-home-d'); dInput.max = String(m - 1); if (+dInput.value >= m) dInput.value = m - 1;
      var d = Number(dInput.value), v = centreGap(m, d), scale = 230 / (m + d), a = m * scale, cut = d * scale;
      model.svg.replaceChildren(); add(model.svg, 'title', {}, m + ' squared minus ' + d + ' squared equals ' + v.p + ' times ' + v.q + ', or ' + v.area + '.');
      add(model.svg, 'rect', { x: 54, y: 266 - a, width: a, height: a, fill: '#73d7bd', stroke: '#c9f7e4', 'stroke-width': 1.5 });
      if (d > 0) add(model.svg, 'rect', { x: 54 + a - cut, y: 266 - a, width: cut, height: cut, fill: '#26354d', stroke: '#c3a7e5', 'stroke-width': 2, 'stroke-dasharray': '4 3' });
      add(model.svg, 'rect', { x: 406, y: 266 - v.p * scale, width: v.q * scale, height: v.p * scale, fill: '#73d7bd', stroke: '#c9f7e4', 'stroke-width': 1.5 });
      add(model.svg, 'text', { x: 54 + a / 2, y: 292, 'text-anchor': 'middle', fill: '#e2eee6', 'font-size': 16 }, 'm = ' + m);
      add(model.svg, 'text', { x: 521, y: 292, 'text-anchor': 'middle', fill: '#e2eee6', 'font-size': 16 }, 'm + d = ' + v.q);
      add(model.svg, 'text', { x: 397, y: 266 - v.p * scale / 2, 'text-anchor': 'end', fill: '#b8d4ca', 'font-size': 13 }, String(v.p));
      if (d > 0) add(model.svg, 'text', { x: 54 + a - cut / 2, y: 266 - a + cut / 2 + 4, 'text-anchor': 'middle', fill: '#e1cbf6', 'font-size': Math.max(10, Math.min(16, cut / 2)) }, d + '²');
      add(model.svg, 'text', { x: 350, y: 175, 'text-anchor': 'middle', fill: '#d8c69e', 'font-size': 32 }, '=');
      put('vf-home-m-value', m); put('vf-home-d-value', d); live.textContent = m + '² − ' + d + '² = ' + v.p + ' × ' + v.q + ' = ' + v.area + '. Exact integer area.';
    }
    controls.addEventListener('input', draw); draw();
  }
  function initValidatron() {
    var room = page('validatron'), hero = room && room.querySelector('header'); if (!hero) return;
    var model = instrument('vf-validatron-model', 'A candidate implication, with every factor visible.', 'This worked arithmetic example illustrates a proof-development workflow. It does not invoke a proof assistant or run the Validatron programme.');
    var controls = make('div', 'vf-controls'); controls.appendChild(control('Centre m', 'vf-validatron-m', 3, 100, 34));
    var modes = make('div', 'vf-presets'); modes.setAttribute('role', 'group'); modes.setAttribute('aria-label', 'Candidate implication'); var chosen = 'mu';
    var omegaButton = addPreset(modes, 'Count factors: Ω = 2', function () { chosen = 'omega'; draw(); });
    var muButton = addPreset(modes, 'Try the sign: μ = +1', function () { chosen = 'mu'; draw(); });
    model.box.append(controls, modes); var presets = make('div', 'vf-presets');
    [[12, '12 · two prime neighbours'], [34, '34 · four distinct factors']].forEach(function (p) { addPreset(presets, p[1], function () { doc.getElementById('vf-validatron-m').value = p[0]; dispatchInput(doc.getElementById('vf-validatron-m')); }); }); model.box.appendChild(presets);
    var live = make('p', 'vf-live'); live.setAttribute('role', 'status'); model.box.appendChild(live); after(hero, model.box);
    var route = readingRoute('validatron', {
      title: 'A true implication and a useful counterexample.',
      statement: ['Ω(m² − 1) = 2 ⇒ both neighbours are prime, for integers m ≥ 3.', 'The proposed replacement μ(m² − 1) = +1 ⇒ both neighbours are prime is false.'],
      assumptions: 'Ω counts prime factors with multiplicity. μ is zero when a square divides the integer; otherwise its sign is (−1) to the number of distinct prime factors.',
      explanation: 'Ω records how many factors the product needs. μ = +1 records even parity of a squarefree factorization, which can mean two factors, four factors, or more. The example locates exactly what information was lost.',
      proof: ['For the first implication, Ω(m² − 1) = Ω(m − 1) + Ω(m + 1); both terms are at least 1. A sum of 2 forces both to equal 1, so both neighbours are prime.', 'For the second implication, take m = 34. Then 34² − 1 = 33 × 35 = 3 × 5 × 7 × 11. All four factors are distinct, so μ(1155) = +1, but 33 and 35 are composite. A single exact counterexample disproves this universal implication.'],
      limit: 'The sliders check finite examples. The written argument is the general proof; this display does not certify arbitrary submitted claims.',
      links: [['Related exact lemmas', '#lemmas'], ['Validatron research scope', '#atlas?entry=validatron']]
    }); route.classList.add('wrap'); after(model.box, route);
    function draw() {
      var v = neighbour(value('vf-validatron-m', 34)); put('vf-validatron-m-value', v.m); model.svg.replaceChildren();
      add(model.svg, 'title', {}, 'Factorization of ' + v.product + ' with ' + v.omega + ' prime factors.');
      [[200, v.m - 1, v.left], [520, v.m + 1, v.right]].forEach(function (branch) {
        add(model.svg, 'path', { d: 'M360 62 L' + branch[0] + ' 132', fill: 'none', stroke: '#668a93', 'stroke-width': 2 });
        add(model.svg, 'circle', { cx: branch[0], cy: 145, r: 32, fill: '#213f4a', stroke: branch[2].length === 1 ? '#a5dfad' : '#c5a7e6', 'stroke-width': 2 });
        add(model.svg, 'text', { x: branch[0], y: 151, 'text-anchor': 'middle', fill: '#edf7ec', 'font-size': 22 }, String(branch[1]));
        branch[2].forEach(function (p, i) { var x = branch[0] + (i - (branch[2].length - 1) / 2) * 40;
          add(model.svg, 'line', { x1: branch[0], y1: 178, x2: x, y2: 218, stroke: '#668a93' });
          add(model.svg, 'circle', { cx: x, cy: 236, r: 17, fill: '#396653', stroke: '#9fe2b5' });
          add(model.svg, 'text', { x: x, y: 241, 'text-anchor': 'middle', fill: '#effdeb', 'font-size': 13 }, String(p));
        });
      });
      add(model.svg, 'text', { x: 360, y: 48, 'text-anchor': 'middle', fill: '#f0dfb9', 'font-size': 22 }, v.m + '² − 1 = ' + v.product);
      add(model.svg, 'text', { x: 360, y: 298, 'text-anchor': 'middle', fill: '#e0eae2', 'font-size': 16 }, 'Ω = ' + v.omega + '     μ = ' + (v.mu > 0 ? '+' : '') + v.mu);
      omegaButton.setAttribute('aria-pressed', String(chosen === 'omega')); muButton.setAttribute('aria-pressed', String(chosen === 'mu'));
      if (chosen === 'omega') live.textContent = v.omega === 2 ? 'The premise Ω = 2 holds here, and both neighbours are prime. The proof below establishes the implication for every m ≥ 3.' : 'The premise Ω = 2 is false at this centre. The general implication makes no primality assertion for this input.';
      else live.textContent = v.mu === 1 && !v.twin ? 'A counterexample: μ = +1, while a composite neighbour is present. Here Ω = ' + v.omega + '. The sign alone cannot imply twin primality.' : v.mu === 1 ? 'The candidate happens to work at this centre. Try m = 34 to see why it fails as a universal statement.' : 'The premise μ = +1 is false here. Try m = 34 to inspect a counterexample with the premise true.';
    }
    controls.addEventListener('input', draw); draw();
  }

  function attachReading() {
    var lab = doc.querySelector('[data-page="atlas"] .at-lab'), hero = doc.querySelector('[data-page="atlas"] .at-hero');
    if (lab && hero) after(hero, lab);
    var placements = [
      ['goldbach', '#goldbach-lab .gb-bench', proofs.pairs], ['lemmas', '#tr-lemma-lab', proofs.lemmas],
      ['collatz', '#tr-collatz-flight .tr-panel', proofs.collatz], ['shapiro', '#shapiro-view', proofs.shapiro],
      ['disk', '#catalan-disk .cc-instrument', proofs.disk], ['mirror', '#mirror-dynamics .cc-instrument', proofs.mirror]
    ];
    placements.forEach(function (p) { var target = doc.querySelector(p[1]); if (target) after(target, readingRoute(p[0], p[2])); });
    [['pairs', proofs.pairs], ['towers', proofs.towers], ['wheel', proofs.wheel]].forEach(function (p) {
      var panel = doc.getElementById('at-panel-' + p[0]); if (panel) { var route = readingRoute('atlas-' + p[0], p[1]); route.classList.add('vf-atlas-route'); panel.appendChild(route); }
    });
    var wrap = doc.querySelector('#tetra > .wrap'), screen = wrap && wrap.querySelector('.screen');
    if (screen) {
      var holder = make('section', 'vf-tower-instrument'); holder.id = 'vf-tower-model'; holder.setAttribute('aria-label', 'Alternating-tower interactive model');
      var equation = wrap.querySelector('.eqline'), ctl = wrap.querySelector('.ttctl'), readings = wrap.querySelector('.readbar'), caption = wrap.querySelector('.cap');
      wrap.insertBefore(holder, equation || screen); [screen, ctl, readings, caption].forEach(function (n) { if (n) holder.appendChild(n); }); after(holder, readingRoute('towers', proofs.towers));
    }
  }

  var TEAL = '#8ee7cd', LILAC = '#cbb1f1', GOLD = '#ead49c', MUTED = '#658992';
  function path(points, color, width, fill) { return { kind: 'path', points: points, color: color || TEAL, width: width || 1.5, fill: fill || 'none' }; }
  function dot(point, color, label, radius) { return { kind: 'dot', point: point, color: color || TEAL, label: label || '', radius: radius || 3 }; }
  function circlePoints(radius, z, count) { var pts = []; for (var i = 0; i <= (count || 96); i++) { var t = i * 2 * Math.PI / (count || 96); pts.push([radius * Math.cos(t), radius * Math.sin(t), z || 0]); } return pts; }
  function squareGeometry(m, d) {
    var x = 1 - 2 * d / m, y = 1 - 2 * d / m;
    var shapes = [path([[-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0], [-1, -1, 0]], TEAL, 1.7, '#234f4c')];
    for (var i = 1; i < Math.min(m, 16); i++) { var f = -1 + 2 * i / Math.min(m, 16); shapes.push(path([[f, -1, 0], [f, 1, 0]], '#376a65', 0.6)); shapes.push(path([[-1, f, 0], [1, f, 0]], '#376a65', 0.6)); }
    if (d) shapes.push(path([[x, y, 0.01], [1, y, 0.01], [1, 1, 0.01], [x, 1, 0.01], [x, y, 0.01]], LILAC, 2, '#30334d'));
    return { shapes: shapes, caption: m + '² − ' + d + '² = ' + (m - d) + ' × ' + (m + d), explanation: 'A square with its corner removed. Rotation changes the view only.' };
  }
  function headerGeometry(kind) {
    var shapes = [], caption, explanation;
    if (kind === 'home' || kind === 'lemmas') return squareGeometry(kind === 'home' ? value('vf-home-m', 12) : value('tr-lemma-m', 12), kind === 'home' ? value('vf-home-d', 1) : 1);
    if (kind === 'goldbach') {
      var n = value('gb-even-sum', 100); if (n % 2 || n < 4 || n > 2600) n = 100;
      var pts = []; function pqp(p) { return [2 * p / n - 0.5, 2 * (n - p) / n - 1.5, 4 * p * (n - p) / (n * n) - 0.5]; }
      for (var a = 0; a <= 60; a++) pts.push(pqp(1 + (n / 2 - 1) * a / 60));
      shapes.push(path(pts, MUTED, 1)); primePairs(n).forEach(function (p) { shapes.push(dot(pqp(p[0]), TEAL, '', 4)); });
      caption = 'p + q = ' + n + ' · height = pq'; explanation = 'The curve samples pairs with this sum, up to symmetry. Dots mark all enumerated prime pairs; coordinates are scaled to fit.';
    } else if (kind === 'collatz') {
      var source = doc.getElementById('tr-collatz-values'), first = source && source.textContent.match(/^\s*(\d+)/), seed = first ? Number(first[1]) : 27;
      var result = collatz(seed), orbit = result.path, peak = Math.max.apply(null, orbit), scale = Math.max(1, Math.log2(peak)), line = [];
      for (var k = 0; k + 2 < orbit.length; k++) line.push([2 * Math.log2(orbit[k]) / scale - 1, 2 * Math.log2(orbit[k + 1]) / scale - 1, 2 * Math.log2(orbit[k + 2]) / scale - 1]);
      if (line.length) { shapes.push(path(line, TEAL, 1.35)); shapes.push(dot(line[0], GOLD, 'start', 4)); shapes.push(dot(line[line.length - 1], LILAC, 'last triple', 3)); }
      else shapes.push(dot([0, 0, 0], GOLD, 'reached 1', 5));
      caption = 'n₀ = ' + seed + ' · ' + (orbit.length - 1) + ' computed updates'; explanation = 'Delay coordinates (log₂ nₖ, log₂ nₖ₊₁, log₂ nₖ₊₂), with one common scale. Fixed orbit; moving camera.';
    } else if (kind === 'towers') {
      var c = value('tt-base', 1.11), branches = towerDepths(c, 26), low = [], high = [];
      branches.forEach(function (p, i) { var x = -1 + 2 * i / 26; low.push([x, 2 * (p[0] - 1), -0.34]); high.push([x, 2 * (p[1] - 1), 0.34]); });
      shapes.push(path(low, LILAC, 2), path(high, TEAL, 2));
      for (var j = 0; j < low.length; j += 2) shapes.push(path([low[j], high[j]], MUTED, 0.7));
      caption = 'c = ' + c.toFixed(4) + ' · 26 finite depths'; explanation = 'u₀ = v₀ = 1; uₙ₊₁ = c^(−vₙ), vₙ₊₁ = c^uₙ. Depth is horizontal; the two tracks are separated for legibility.';
    } else if (kind === 'cabinet') {
      shapes.push(path(circlePoints(1, 0), GOLD, 1.2));
      [0.5, 1, 2].forEach(function (sigma, index) { var curve = []; for (var i = 0; i <= 160; i++) { var t = -24 + 48 * i / 160, den = (sigma + 1) * (sigma + 1) + t * t; curve.push([((sigma - 2) * (sigma + 1) + t * t) / den, 3 * t / den, 0]); } shapes.push(path(curve, [GOLD, LILAC, TEAL][index], 1.4)); });
      shapes.push(dot([0, 0, 0], TEAL, 's = 2', 4)); caption = 'w = (s − 2)/(s + 1)'; explanation = 'Images of vertical lines Re(s) = 1/2, 1, 2. Gold marks the unit-circle boundary; the projection rotates this fixed coordinate picture.';
    } else if (kind === 'atlas') {
      shapes.push(path(circlePoints(1, 0), MUTED, 1));
      for (var r = 0; r < 210; r++) { var t = r * 2 * Math.PI / 210, survives = gcd(r, 210) === 1; shapes.push(dot([Math.cos(t), Math.sin(t), 0], survives ? TEAL : '#405d65', '', survives ? 2.6 : 1.2)); if (survives) shapes.push(path([[0.82 * Math.cos(t), 0.82 * Math.sin(t), 0], [Math.cos(t), Math.sin(t), 0]], TEAL, 0.7)); }
      caption = 'mod 210 · 48 coprime remainder classes'; explanation = 'All 210 positions are present. Teal survives divisibility by 2, 3, 5 and 7. A surviving remainder need not represent a prime.';
    } else if (kind === 'buried-chat-stories') {
      var depth = value('tr-shapiro-depth', 4), pLine = [], qLine = [];
      for (var a = 0; a <= 192; a++) { var theta = a * 2 * Math.PI / 192, energy = shapiro(depth, theta); pLine.push([Math.cos(theta), Math.sin(theta), energy.p / energy.total - 0.5]); qLine.push([Math.cos(theta), Math.sin(theta), energy.q / energy.total - 0.5]); }
      shapes.push(path(circlePoints(1, 0), MUTED, 0.7), path(pLine, TEAL, 1.5), path(qLine, LILAC, 1.5));
      caption = 'Rudin–Shapiro · j = ' + depth; explanation = 'Height shows each normalized energy share minus 1/2. The two shares add to 1; angle samples are connected by line segments.';
    } else if (kind === 'validatron') {
      var v = neighbour(value('vf-validatron-m', 34)); shapes.push(dot([0, 0.7, 0], GOLD, String(v.product), 5));
      v.factors.forEach(function (f, i) { var p = [v.factors.length === 1 ? 0 : -0.9 + i * 1.8 / (v.factors.length - 1), -0.55, 0]; shapes.push(path([[0, 0.7, 0], p], MUTED, 1.2), dot(p, TEAL, String(f), 4)); });
      caption = v.product + ' = ' + v.factors.join(' × '); explanation = 'A factor tree for m = ' + v.m + '. Ω = ' + v.omega + '; μ = ' + (v.mu > 0 ? '+' : '') + v.mu + '. This is a worked example, not a general proof engine.';
    } else {
      var vertices = [[0.7, 0.7, 0.7], [0.7, -0.7, -0.7], [-0.7, 0.7, -0.7], [-0.7, -0.7, 0.7]];
      var names = kind === 'roadmap' ? ['Identity', 'Premises', 'Bound', 'Proof'] : kind === 'map-credits' ? ['Paper', 'Geometry', 'Sources', 'People'] : ['Primes', 'Dynamics', 'Towers', 'Complex'];
      vertices.forEach(function (p, i) { vertices.forEach(function (q, j) { if (j > i) shapes.push(path([p, q], MUTED, 1.2)); }); shapes.push(dot(p, i % 2 ? LILAC : TEAL, names[i], 4)); });
      if (kind === 'roadmap') { caption = 'A route through the next argument'; explanation = 'A regular tetrahedron serves as a navigation glyph: identity, premises, bound, proof. The labels organize the reading; its edges assert no implication.'; }
      else if (kind === 'map-credits') { caption = 'The sources behind the map'; explanation = 'A regular tetrahedron serves as a navigation glyph for paper, geometry, sources and people. The historical credits and construction limits are recorded below.'; }
      else { caption = 'Four routes through the subject map'; explanation = 'A regular tetrahedron serves as a navigation glyph. Its four vertices name subjects; it makes no claim that the subjects share a physical model.'; }
    }
    return { shapes: shapes, caption: caption, explanation: explanation };
  }

  function compactHeader(kind, host, existingGrid, stopSelector, targetSelector) {
    if (!host) return;
    var grid, copy;
    if (existingGrid) {
      grid = host; copy = grid.firstElementChild; if (!copy) return;
      var old = grid.querySelector('.tr-orbit-emblem'); if (old) old.setAttribute('hidden', '');
      var note = grid.querySelector('.at-hero-note'); if (note) { note.classList.add('vf-meta-strip'); copy.appendChild(note); }
      var doors = grid.querySelector('.cc-doors'); if (doors) copy.appendChild(doors);
    } else {
      grid = make('div', 'vf-header-grid'); copy = make('div', 'vf-header-copy');
      var stop = stopSelector ? host.querySelector(stopSelector) : null, nodes = [];
      for (var child = host.firstChild; child && child !== stop; child = child.nextSibling) nodes.push(child);
      host.insertBefore(grid, nodes[0] || stop); nodes.forEach(function (n) { copy.appendChild(n); }); grid.appendChild(copy);
    }
    grid.classList.add('vf-header-grid'); copy.classList.add('vf-header-copy');
    var figure = make('figure', 'vf-header-model'); figure.dataset.vfSubject = kind;
    var stage = make('div', 'vf-motion-stage'); stage.tabIndex = 0; stage.setAttribute('role', 'group'); stage.setAttribute('aria-label', kind + ' model view. Arrow keys rotate; Home resets the view.');
    var svg = svgNode('svg', { viewBox: '0 0 344 224', role: 'img', 'aria-labelledby': 'vf-header-' + kind + '-title' });
    var title = svgNode('title', { id: 'vf-header-' + kind + '-title' }); svg.appendChild(title); var drawing = svgNode('g'); svg.appendChild(drawing); stage.appendChild(svg);
    var caption = make('figcaption'), strong = make('strong'), noteText = make('span', 'vf-header-note'); caption.append(strong, noteText);
    var foot = make('div', 'vf-header-actions'), state = { node: stage, yaw: -0.42, pitch: 0.36, shapes: [] };
    state.frame = function (dt) { state.yaw += dt * 0.13; render(); }; registerMotion(state);
    foot.appendChild(motionButton(state, kind + ' camera motion'));
    var exploreText = kind === 'archive' ? 'Choose a subject ↓' : kind === 'roadmap' ? 'Read the next steps ↓' : kind === 'map-credits' ? 'Read source credits ↓' : 'Explore the model ↓';
    var explore = make('button', 'vf-explore', exploreText); explore.type = 'button'; explore.addEventListener('click', function () { jump(doc.querySelector(targetSelector)); }); foot.appendChild(explore);
    var hint = make('span', 'vf-motion-hint', 'Move across · drag · arrow keys'); hint.id = 'vf-header-' + kind + '-hint'; stage.setAttribute('aria-describedby', hint.id);
    figure.append(stage, caption, foot, hint); grid.appendChild(figure);
    function rebuild() {
      var model = headerGeometry(kind); strong.textContent = model.caption; noteText.textContent = model.explanation; title.textContent = model.caption + '. ' + model.explanation;
      drawing.replaceChildren(); state.shapes = model.shapes.map(function (shape) {
        var node = shape.kind === 'path' ? svgNode('path', { fill: shape.fill, stroke: shape.color, 'stroke-width': shape.width, 'stroke-linejoin': 'round' }) : svgNode('circle', { r: shape.radius, fill: shape.color }); drawing.appendChild(node);
        var label; if (shape.label) { label = svgNode('text', { fill: '#f0ecd9', 'font-size': 10, 'text-anchor': 'middle' }, shape.label); drawing.appendChild(label); }
        return { shape: shape, node: node, label: label };
      }); render();
    }
    function render() {
      state.shapes.forEach(function (item) {
        if (item.shape.kind === 'path') {
          item.node.setAttribute('d', item.shape.points.map(function (p, i) { var v = project(p, state.yaw, state.pitch); return (i ? 'L' : 'M') + v[0].toFixed(2) + ' ' + v[1].toFixed(2); }).join(' '));
        } else {
          var p = project(item.shape.point, state.yaw, state.pitch); item.node.setAttribute('cx', p[0]); item.node.setAttribute('cy', p[1]);
          if (item.label) { item.label.setAttribute('x', p[0]); item.label.setAttribute('y', p[1] - 9); }
        }
      });
    }
    function point(event) { var rect = stage.getBoundingClientRect(); if (!rect.width || !rect.height) return; state.yaw = ((event.clientX - rect.left) / rect.width - 0.5) * 2.1; state.pitch = 0.45 + (0.5 - (event.clientY - rect.top) / rect.height) * 1.1; render(); }
    stage.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') state.interacting = true; });
    stage.addEventListener('pointermove', point);
    stage.addEventListener('pointerdown', function (e) { state.interacting = true; point(e); if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId); });
    function release(e) { if (e.type === 'pointerleave' || e.pointerType === 'touch' || e.type === 'pointercancel') state.interacting = false; wake(); }
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(function (event) { stage.addEventListener(event, release); });
    stage.addEventListener('focus', function () { state.interacting = true; }); stage.addEventListener('blur', function () { state.interacting = false; wake(); });
    stage.addEventListener('keydown', function (e) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].indexOf(e.key) < 0) return;
      e.preventDefault(); if (e.key === 'ArrowLeft') state.yaw -= 0.12; if (e.key === 'ArrowRight') state.yaw += 0.12; if (e.key === 'ArrowUp') state.pitch += 0.12; if (e.key === 'ArrowDown') state.pitch -= 0.12; if (e.key === 'Home') { state.yaw = -0.42; state.pitch = 0.36; } render();
    });
    var room = page(kind);
    if (room) {
      room.addEventListener('input', function (e) { if (e.target.matches('input[type="range"],input[type="number"]') && !figure.contains(e.target)) rebuild(); });
      room.addEventListener('submit', function () { rebuild(); });
      room.addEventListener('click', function (e) { if (e.target.closest('[data-tr-seed],[data-tr-centre],[data-b],[data-gb-n],.vf-presets button')) rebuild(); });
    }
    rebuild();
  }

  function directRange(svg, input, coordinate, instructions) {
    if (!svg || !input) return;
    svg.tabIndex = 0; svg.classList.add('vf-direct-plot'); svg.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight Home End');
    var oldDescription = svg.getAttribute('aria-label') || 'Interactive plot'; svg.setAttribute('aria-label', oldDescription + '. ' + instructions + ' Arrow keys also change the selection.');
    function set(n) { var min = Number(input.min), max = Number(input.max), step = Number(input.step) || 1; var bounded = Math.max(min, Math.min(max, min + Math.round((n - min) / step) * step)); if (+input.value !== bounded) { input.value = String(bounded); dispatchInput(input); } }
    svg.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch' || e.buttons) set(coordinate(e, svg, input)); });
    svg.addEventListener('pointerdown', function (e) { set(coordinate(e, svg, input)); if (svg.setPointerCapture) svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('keydown', function (e) { var current = Number(input.value), step = Number(input.step) || 1; if (e.key === 'ArrowLeft') set(current - step); else if (e.key === 'ArrowRight') set(current + step); else if (e.key === 'Home') set(Number(input.min)); else if (e.key === 'End') set(Number(input.max)); else return; e.preventDefault(); });
  }
  function viewPoint(event, svg) {
    /* Respect SVG preserveAspectRatio letterboxing instead of stretching coordinates. */
    var rect = svg.getBoundingClientRect(), box = svg.viewBox.baseVal, scale = Math.min(rect.width / box.width, rect.height / box.height);
    return [(event.clientX - rect.left - (rect.width - box.width * scale) / 2) / scale + box.x,
      (event.clientY - rect.top - (rect.height - box.height * scale) / 2) / scale + box.y];
  }
  function enhanceDirectPlots() {
    var svg = doc.getElementById('tr-collatz-plot'), input = doc.getElementById('tr-collatz-step');
    if (svg && input) {
      directRange(svg, input, function (e, plot, control) { return (viewPoint(e, plot)[0] - 48) / 624 * Number(control.max); }, 'Move across or drag to select a computed update.');
      var info = make('div', 'vf-plot-instructions'); info.appendChild(make('span', '', 'Move across or drag to select an update. The light traces the drawn path; the numbers change only when you select.'));
      var state = { node: svg, travel: 0, pathText: '', points: [], marker: null }; registerMotion(state); info.appendChild(motionButton(state, 'Collatz path light')); after(svg, info);
      state.frame = function (dt) {
        var orbit = svg.querySelector('path[stroke="#73ddd3"]'); if (!orbit) return;
        var d = orbit.getAttribute('d'); if (d !== state.pathText) { state.pathText = d; state.points = plotPoints(d); state.travel = 0; }
        if (state.points.length < 2) return;
        if (!state.marker || state.marker.parentNode !== svg) { state.marker = add(svg, 'circle', { class: 'vf-flight-marker', r: 5.5, fill: '#f1df9f', stroke: '#12313e', 'stroke-width': 1.5, 'aria-hidden': 'true', 'pointer-events': 'none' }); }
        state.travel = (state.travel + dt * 8) % (state.points.length - 1);
        var i = Math.floor(state.travel), a = state.points[i], b = state.points[i + 1], t = state.travel - i;
        state.marker.setAttribute('cx', a[0] + (b[0] - a[0]) * t); state.marker.setAttribute('cy', a[1] + (b[1] - a[1]) * t);
      };
      ['pointerenter', 'focus'].forEach(function (event) { svg.addEventListener(event, function () { state.interacting = true; if (state.marker) state.marker.remove(); }); });
      ['pointerleave', 'blur', 'pointercancel'].forEach(function (event) { svg.addEventListener(event, function () { state.interacting = false; wake(); }); });
      svg.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch') { state.interacting = false; wake(); } });
    }
    directRange(doc.getElementById('tr-shapiro-plot'), doc.getElementById('tr-shapiro-angle'), function (e, plot) { var p = viewPoint(e, plot), angle = Math.atan2(180 - p[1], p[0] - 215) * 180 / Math.PI; return (angle + 360) % 360; }, 'Move around the circle to choose an angle.');
  }

  function init() {
    if (!doc.querySelector('.page[data-page="atlas"]') || doc.documentElement.dataset.vfReady) return;
    doc.documentElement.dataset.vfReady = 'true';
    initHome(); initValidatron(); attachReading();
    compactHeader('home', doc.querySelector('[data-page="home"] .hero > .wrap'), false, null, '#vf-home-model');
    compactHeader('goldbach', doc.querySelector('#goldbach-lab .gb-intro'), false, null, '#goldbach-lab .gb-bench');
    compactHeader('lemmas', doc.querySelector('#lemmas > .wrap'), false, '#tr-lemma-lab', '#tr-lemma-lab');
    compactHeader('collatz', doc.querySelector('[data-page="collatz"] .tr-hero-grid'), true, null, '#tr-collatz-flight');
    compactHeader('towers', doc.querySelector('#tetra > .wrap'), false, '#vf-tower-model', '#vf-tower-model');
    compactHeader('validatron', doc.querySelector('[data-page="validatron"] .tr-hero-grid'), true, null, '#vf-validatron-model');
    compactHeader('cabinet', doc.querySelector('.cc-hero-grid'), true, null, '#catalan-disk');
    compactHeader('atlas', doc.querySelector('.at-hero-grid'), true, null, '[data-page="atlas"] .at-lab');
    compactHeader('buried-chat-stories', doc.querySelector('.pirate-chest-head'), false, null, '#shapiro-view');
    compactHeader('archive', doc.querySelector('[data-page="archive"] .tr-hero-grid'), true, null, '#archive .tr-library-map');
    compactHeader('roadmap', doc.querySelector('[data-page="roadmap"] .tr-hero-grid'), true, null, '#roadmap .rm-steps');
    compactHeader('map-credits', doc.querySelector('#map-credits > .wrap'), false, '.pm-source-list', '#map-credits .pm-source-list');
    enhanceDirectPlots();
    ['hashchange', 'resize', 'scroll'].forEach(function (event) { window.addEventListener(event, wake, { passive: true }); });
    doc.addEventListener('visibilitychange', function () { if (doc.hidden && raf !== null) { window.cancelAnimationFrame(raf); raf = null; } else wake(); });
    doc.addEventListener('close', wake, true);
    if (reduced.addEventListener) reduced.addEventListener('change', function (event) { if (event.matches) motionItems.forEach(function (item) { item.paused = true; if (item.refreshButton) item.refreshButton(); }); wake(); });
    wake();
    if (location.hash && location.hash !== '#paper-atlas') requestAnimationFrame(function () { window.dispatchEvent(new HashChangeEvent('hashchange')); });
  }
  api.init = init;
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
