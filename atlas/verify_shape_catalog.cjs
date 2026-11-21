'use strict';
// Content/navigation contracts and independent geometric invariants.
// These checks do not certify nonintersecting nets, Ricci flow, physical
// realizability, source priority, or the research claims attached to the map.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(read('assets/pirate-map-data.js'), sandbox, { timeout: 1000 });
const data = JSON.parse(JSON.stringify(sandbox.window.PIRATE_MAP_DATA));
const lab = require('../assets/paper-shape-lab.js');
const html = read('index.html');
const controller = read('assets/paper-atlas.js');
const catalog = JSON.parse(read('atlas/catalog.json'));
const near = (a, b, epsilon = 1e-8, label = '') => assert.ok(Math.abs(a - b) <= epsilon, `${label}: ${a} != ${b}`);
const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
const vector = (a, label) => assert.ok(Array.isArray(a) && a.length === 3 && a.every(Number.isFinite), `${label}: finite 3-vector`);
const unique = (values, label) => assert.equal(new Set(values).size, values.length, `${label}: unique`);

const pairs = {
  origami: 'voyage-chart', sphere: 'voyage-globe', portal: 'voyage-portal',
  tensegrity: 'voyage-rigging', terrace: 'voyage-islands',
  noperthedron: 'voyage-noperthedron', neck: 'voyage-neck', klein: 'voyage-klein'
};
const expectedKeys = Object.entries(pairs).flat();
assert.equal(data.shapes.length, 16);
unique(data.shapes.map(s => s.key), 'Shape keys');
assert.deepEqual(data.shapes.map(s => s.key).sort(), expectedKeys.sort());
for (const family of ['studio', 'voyage']) assert.equal(data.shapes.filter(s => s.family === family).length, 8);
const byKey = Object.fromEntries(data.shapes.map(s => [s.key, s]));
for (const body of Object.keys(pairs)) {
  const picks = data.mapMinimumPicks[body];
  assert.ok(Array.isArray(picks) && picks.length >= 3, `${body}: at least three discoveries`);
  unique(picks, `${body}: distinct minimum picks`);
  const stops = picks.map(id => data.trail.find(stop => stop.id === id));
  assert.ok(stops.every(Boolean), `${body}: all guaranteed discoveries resolve`);
  for (const kind of ['treasure', 'trap', 'wildcard']) assert.ok(stops.some(stop => stop.kind === kind), `${body}: always carries a ${kind}`);
}
console.log('Map coverage: all 16 forms retain at least one treasure, trap and wildcard.');
const openingBodies = new Set(['origami', ...lab.keys]);
assert.deepEqual([...openingBodies].sort(), ['klein', 'neck', 'noperthedron', 'origami', 'portal', 'sphere']);
assert.equal(data.shapes.filter(s => s.unfoldable).length, 12);
const sources = {
  origami: 'https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/assets/paper-map-engine.js',
  sphere: 'https://pages.uoregon.edu/jamu/Math5351-lecture-notes.pdf',
  portal: 'https://cms.math.ca/wp-content/uploads/crux-pdfs/Crux_v4n04_Apr.pdf',
  noperthedron: 'https://arxiv.org/abs/2508.18475', neck: 'https://arxiv.org/abs/math/0303109',
  klein: 'https://legacy-www.math.harvard.edu/~ctm/papers/home/text/class/harvard/131/course/course.pdf'
};
for (const [body, voyage] of Object.entries(pairs)) {
  const a = byKey[body], b = byKey[voyage];
  assert.equal(a.family, 'studio'); assert.equal(b.family, 'voyage');
  for (const s of [a, b]) {
    for (const field of ['name', 'description', 'sourceLabel', 'sourceUrl', 'lesson', 'boundary']) {
      assert.ok(typeof s[field] === 'string' && s[field].trim().length > 0, `${s.key}.${field}`);
    }
    assert.equal(new URL(s.sourceUrl).protocol, 'https:');
    assert.equal(Boolean(s.unfoldable), openingBodies.has(body), `${s.key}: opening support`);
    if (s.unfoldable) {
      assert.equal(s.phases.length, 3, `${s.key}: named opening stages`);
      assert.ok(s.phases.every(p => typeof p === 'string' && p.trim()));
      assert.ok(s.unfoldLabel.trim());
      assert.equal(s.sourceUrl, sources[body], `${s.key}: reviewed primary/implementation source`);
    }
  }
  // A scenic voyage must not silently make a stronger claim about its body.
  assert.equal(a.lesson, b.lesson); assert.equal(a.boundary, b.boundary);
}
for (const key of ['tensegrity', 'voyage-rigging']) assert.equal(Boolean(byKey[key].unfoldable), false);

// Read the actual controller's declarative pairing, then compare the relation
// with independently specified published keys and the eight table choices.
const pairDeclaration = controller.match(/const\s+bodyKeys\s*=\s*({[\s\S]*?});/);
assert.ok(pairDeclaration, 'Controller exposes a body-to-family relation');
const controllerPairs = JSON.parse(JSON.stringify(vm.runInNewContext(`(${pairDeclaration[1]})`, {}, { timeout: 1000 })));
assert.deepEqual(Object.keys(controllerPairs).sort(), Object.keys(pairs).sort());
for (const [body, voyage] of Object.entries(pairs)) {
  assert.deepEqual(controllerPairs[body], { studio: body, voyage });
}
const tableBodies = [...html.matchAll(/\bdata-table-form="([^"]+)"/g)].map(m => m[1]);
assert.deepEqual([...new Set(tableBodies)].sort(), Object.keys(pairs).sort());

const expectedTrail = [
  ['shuffle-signal', '#atlas?entry=tower-hadamard', 'treasure'],
  ['forty-eight-lanes', '#atlas?entry=wheel-210', 'treasure'],
  ['impossible-coastline', '#buried-complex-collatz', 'wildcard'],
  ['missing-term', '#buried-collatz-riemann-reversal', 'trap'],
  ['repeating-current', '#atlas?entry=abel-orbit-signature', 'treasure'],
  ['brun-crossing', '#buried-brun-crossing', 'trap'],
  ['impostor-prime', '#buried-perrin-pseudoprime', 'trap'],
  ['xo2-cave', '#buried-xo2', 'wildcard'],
  ['second-beat', '#buried-omega-order', 'treasure']
];
assert.deepEqual(data.trail.map(t => [t.id, t.href, t.kind]), expectedTrail);
unique(data.trail.map(t => t.id), 'Trail IDs');
const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const pageRoutes = new Set([...html.matchAll(/\bdata-page="([^"]+)"/g)].map(m => m[1]));
const entries = Array.isArray(catalog) ? catalog : catalog.entries;
assert.ok(Array.isArray(entries), 'Catalog entries are available');
const entryIds = new Set(entries.map(e => e.id));
for (const stop of data.trail) {
  const url = new URL(stop.href, 'https://encapsulatorp.github.io/');
  const [anchor, query = ''] = url.hash.slice(1).split('?');
  assert.ok(htmlIds.has(anchor) || pageRoutes.has(anchor), `${stop.id}: primary destination exists`);
  if (query) assert.ok(entryIds.has(new URLSearchParams(query).get('entry')), `${stop.id}: catalog entry exists`);
  assert.equal(new URL(stop.repository).hostname, 'github.com');
  assert.ok(stop.clue && stop.evidenceLabel && stop.question);
}

// HTML contracts for native keyboard controls and a readable non-WebGL path.
const tagAttributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s'"=<>`]+)))?/g)].map(m => [m[1], m[2] ?? m[3] ?? m[4] ?? '']));
const tags = [...html.matchAll(/<(?!\/|!)([a-z][\w:-]*)\b[^>]*>/gi)].map(m => ({ name: m[1].toLowerCase(), attr: tagAttributes(m[0]) }));
const element = id => {
  const matches = tags.filter(t => t.attr.id === id);
  assert.equal(matches.length, 1, `Unique control ${id}`);
  return matches[0];
};
const scripts = tags.filter(t => t.name === 'script' && t.attr.src).map(t => t.attr.src.split('?')[0]);
for (const [before, after] of [
  ['assets/pirate-map-data.js', 'assets/paper-atlas.js'],
  ['assets/paper-shape-lab.js', 'assets/paper-map-engine.js'],
  ['assets/paper-map-engine.js', 'assets/paper-atlas.js']
]) assert.ok(scripts.indexOf(before) >= 0 && scripts.indexOf(before) < scripts.indexOf(after), `${before} loads before ${after}`);
assert.equal(element('pirate-map').name, 'dialog');
assert.ok(htmlIds.has(element('pirate-map').attr['aria-labelledby']));
const progress = element('pm-unfold-progress');
assert.equal(progress.name, 'input'); assert.equal(progress.attr.type, 'range');
assert.equal(Number(progress.attr.min), 0); assert.equal(Number(progress.attr.max), 100);
assert.ok(progress.attr['aria-label']); assert.ok(htmlIds.has(progress.attr['aria-describedby']));
for (const id of ['pm-refold', 'pm-open-body', 'pm-motion', 'pm-back-table', 'pm-reset', 'pm-close']) {
  const button = element(id); assert.equal(button.name, 'button'); assert.equal(button.attr.type, 'button');
}
for (const id of ['pm-render-fallback', 'pm-timeline', 'pm-shape-meaning', 'pm-shape-boundary', 'pm-shape-source']) element(id);
assert.equal(element('pm-story-link').name, 'a');
assert.equal(element('pm-repository-link').name, 'a');
assert.ok(element('pm-repository-link').attr.rel.includes('noopener'));
assert.ok(controller.includes("matchMedia('(prefers-reduced-motion: reduce)')"), 'System motion preference is observed');
console.log('Shape catalog: 16 scenes in two equal collections; eight body pairs; 12 openings; nine preserved subject destinations.');

// Numeric checks are independent of the deformation implementation. They use
// Euclidean lengths, face incidence, endpoint planes, and paired boundary data.
const pointKey = p => p.map(x => Math.round(x * 1e8)).join(',');
function topology(faces) {
  const vertexIds = new Map(), edges = new Map(), adjacency = new Map();
  for (const f of faces) {
    const ids = f.points.map(p => { const k = pointKey(p); if (!vertexIds.has(k)) vertexIds.set(k, vertexIds.size); return vertexIds.get(k); });
    for (let i = 0; i < ids.length; i++) {
      const a = ids[i], b = ids[(i + 1) % ids.length];
      const k = [Math.min(a, b), Math.max(a, b)].join(',');
      edges.set(k, (edges.get(k) || 0) + 1);
      if (!adjacency.has(a)) adjacency.set(a, new Set());
      if (!adjacency.has(b)) adjacency.set(b, new Set());
      adjacency.get(a).add(b); adjacency.get(b).add(a);
    }
  }
  let components = 0; const seen = new Set();
  for (const id of vertexIds.values()) {
    if (seen.has(id)) continue;
    components++; const pending = [id]; seen.add(id);
    while (pending.length) for (const n of adjacency.get(pending.pop())) if (!seen.has(n)) { seen.add(n); pending.push(n); }
  }
  return { vertices: vertexIds.size, edges: edges.size, faces: faces.length, euler: vertexIds.size - edges.size + faces.length,
    boundaryEdges: [...edges.values()].filter(n => n === 1).length, maxIncidence: Math.max(...edges.values()), components };
}
function planeSpread(model) {
  const ys = model.faces.flatMap(f => f.points.map(p => p[1]));
  return Math.max(...ys) - Math.min(...ys);
}
const stages = [...new Set([0, .001, .31, .34, .54, .999, 1, ...Array.from({ length: 19 }, (_, i) => (i + 1) / 20)])].sort((a, b) => a - b);
let faceCount = 0, pinCount = 0;
for (const key of lab.keys) {
  assert.equal(lab.supports(key), true);
  const initial = lab.build(key, 0), opened = lab.build(key, 1);
  assert.equal(initial.landmarks.length, data.trail.length);
  assert.equal(opened.landmarks.length, data.trail.length);
  assert.notDeepEqual(initial.faces, opened.faces, `${key}: visible body transformation`);
  for (const t of stages) {
    const model = lab.build(key, t);
    assert.equal(model.meta.id, key); near(model.meta.opening, t);
    assert.ok(model.faces.length >= 12 && model.faces.length <= 1500, `${key}: bounded geometry budget`);
    assert.equal(model.landmarks.length, 9);
    for (const bounds of [model.bounds, model.cameraBounds]) {
      assert.equal(bounds.length, 2); bounds.forEach(p => vector(p, `${key} bounds`));
      for (let i = 0; i < 3; i++) assert.ok(bounds[0][i] <= bounds[1][i]);
    }
    for (const f of model.faces) {
      assert.ok(f.points.length >= 3); faceCount++;
      assert.equal(f.uv.length, f.points.length);
      for (const [j, p] of f.points.entries()) {
        vector(p, `${key}@${t} vertex`);
        assert.ok(f.uv[j].length === 2 && f.uv[j].every(Number.isFinite));
        for (const b of [model.bounds, model.cameraBounds]) for (let i = 0; i < 3; i++) {
          assert.ok(p[i] >= b[0][i] - 1e-8 && p[i] <= b[1][i] + 1e-8, `${key}@${t}: vertex inside declared bounds`);
        }
      }
    }
    for (const p of model.landmarks) {
      pinCount++; vector(p.position, `${key} landmark`); vector(p.normal, `${key} landmark normal`);
      near(Math.hypot(...p.normal), 1, 1e-8, `${key} unit landmark normal`);
    }
  }
  assert.deepEqual(lab.build(key, .37), lab.build(key, .37), `${key}: deterministic geometry`);
  assert.deepEqual(lab.build(key, -1), initial, `${key}: clamp below zero`);
  assert.deepEqual(lab.build(key, 2), opened, `${key}: clamp above one`);
  assert.throws(() => lab.build(key, NaN), TypeError);
}
assert.throws(() => lab.build('unregistered-shape', .5), RangeError);
assert.equal(lab.supports('unregistered-shape'), false);

const sphereClosed = lab.build('sphere', 0), sphereOpen = lab.build('sphere', 1);
const center = sphereClosed.bounds[0].map((v, i) => (v + sphereClosed.bounds[1][i]) / 2);
const radii = sphereClosed.faces.flatMap(f => f.points.map(p => distance(p, center)));
near(Math.max(...radii) - Math.min(...radii), 0, 1e-9, 'Globe vertices lie on a sphere');
near(planeSpread(sphereOpen), 0, 1e-9, 'Opened globe is planar');
assert.equal(topology(sphereClosed.faces).euler, 2); assert.equal(topology(sphereClosed.faces).boundaryEdges, 0);
assert.equal(topology(sphereOpen.faces).euler, 1); assert.ok(topology(sphereOpen.faces).boundaryEdges > 0);
const neckClosed = topology(lab.build('neck', 0).faces), neckOpen = topology(lab.build('neck', 1).faces);
assert.equal(neckClosed.components, 1, 'Initial neck joins its two displayed lobes');
assert.equal(neckOpen.components, 2, 'Opened neck leaves two distinct charts');
assert.equal(neckOpen.euler, 2); near(planeSpread(lab.build('neck', 1)), 0, 1e-9);

for (const key of ['noperthedron', 'portal']) {
  const source = lab.sourceTopology(key), closed = lab.build(key, 0), open = lab.build(key, 1);
  const counts = topology(closed.faces);
  assert.equal(counts.components, 1); assert.equal(counts.boundaryEdges, 0); assert.equal(counts.maxIncidence, 2);
  if (key === 'noperthedron') assert.deepEqual([counts.vertices, counts.edges, counts.faces, counts.euler], [90, 240, 152, 2]);
  else assert.equal(counts.euler, 0, 'Closed portal has the topology of a handle');
  near(planeSpread(open), 0, 1e-8, `${key}: open faces are coplanar`);
  assert.equal(source.faces.filter(f => f.parent < 0).length, 1);
  for (const t of [.2, .5, .8, 1]) {
    const model = lab.build(key, t);
    source.faces.forEach((f, i) => {
      const old = closed.faces[i].points, current = model.faces[i].points;
      for (let j = 0; j < old.length; j++) for (let k = j + 1; k < old.length; k++) {
        near(distance(old[j], old[k]), distance(current[j], current[k]), 1e-8, `${key}: rigid face metric`);
      }
      if (f.parent < 0) return;
      assert.ok(f.parent < i); assert.equal(f.hinge.length, 2);
      for (const vertex of f.hinge) {
        const childIndex = f.vertices.indexOf(vertex), parentIndex = source.faces[f.parent].vertices.indexOf(vertex);
        assert.ok(childIndex >= 0 && parentIndex >= 0, `${key}: hinge is shared`);
        near(distance(current[childIndex], model.faces[f.parent].points[parentIndex]), 0, 1e-8, `${key}: joined hinge`);
      }
    });
  }
}

// Check the Klein immersion's seam identifications using the published UV data,
// not by evaluating the implementation's formula a second time.
function parameterVertices(model) {
  const points = new Map();
  for (const f of model.faces.filter(f => f.points.length === 4)) f.uv.forEach((uv, i) => points.set(uv.map(v => Math.round(v * 1e8)).join(','), f.points[i]));
  return points;
}
const klein0 = parameterVertices(lab.build('klein', 0));
const uvPoint = (points, u, v) => points.get([u, v].map(x => Math.round(x * 1e8)).join(','));
for (let j = 0; j <= 24; j++) near(distance(uvPoint(klein0, 0, j / 24), uvPoint(klein0, 1, 1 - j / 24)), 0, 1e-8, 'Klein reversed seam');
for (let i = 0; i <= 40; i++) near(distance(uvPoint(klein0, i / 40, 0), uvPoint(klein0, i / 40, 1)), 0, 1e-8, 'Klein periodic seam');
const klein1 = lab.build('klein', 1), sheet = klein1.faces.filter(f => f.points.length === 4);
near(planeSpread({ faces: sheet }), 0, 1e-9, 'Cut-open Klein chart is planar');
assert.equal(topology(sheet).euler, 1); assert.ok(topology(sheet).boundaryEdges > 0);
console.log(`Shape geometry: ${lab.keys.length * stages.length} sampled models, ${faceCount.toLocaleString('en-US')} faces and ${pinCount.toLocaleString('en-US')} landmarks remain finite and bounded.`);
console.log('Endpoint checks: sphere to disk; connected neck to two disks; rigid Noperthedron/portal faces and joined hinges; Klein paired seams to a cut-open rectangle.');
console.log('Mathematical attribution and interpretation still require source review; these checks are not theorem or physical-model proofs.');
