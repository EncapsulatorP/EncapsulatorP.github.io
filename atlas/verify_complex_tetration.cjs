/* Mathematical/source fidelity gates, without the browser UI.
 * Run: node atlas/verify_complex_tetration.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const model = require('../interactive/complex-tetration.js');
const source = fs.readFileSync(path.join(__dirname, '../interactive/sources/gemini-complex-tetration-original.js.txt'), 'utf8');

function sourceFunction(name) {
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, 'Original function is present: ' + name);
  let depth = 0, opened = false;
  for (let i = source.indexOf('{', start); i < source.length; i++) {
    if (source[i] === '{') { depth++; opened = true; }
    if (source[i] === '}' && --depth === 0 && opened) return source.slice(start, i + 1);
  }
  throw new Error('Original function boundary not found: ' + name);
}
function rng(seed = 123456) {
  let value = seed;
  return () => { value = (1664525 * value + 1013904223) >>> 0; return value / 4294967296; };
}
function near(actual, expected, tolerance = 1e-12) { assert.ok(Math.abs(actual - expected) <= tolerance, actual + ' differs from ' + expected); }
const math = Object.create(Math);
math.random = rng();
const reference = { Math: math, Number, Uint8ClampedArray, VIEW: model.VIEW, ESCAPE_R2: 1e8 };
vm.createContext(reference);
vm.runInContext(sourceFunction('tetrationStep') + '\n' + sourceFunction('randn'), reference);

// Extract the source's actual principal loop, removing drawing statements only.
const drawing = sourceFunction('drawOrbits');
const stripDrawing = text => text.split('\n').filter(line => !/^\s*ctx\./.test(line) && !line.includes('complexToScreen(')).join('\n');
let principalCode = stripDrawing(drawing.slice(drawing.indexOf('// 2. Deterministic'), drawing.indexOf('// Seed marker')));
principalCode = principalCode.replace("principalState = 'Convergent';", "principalState = 'Convergent'; toleranceAt = n + 1;");
vm.runInContext(`function originalPrincipal(base, count) {
  const cr0=base.re, ci0=base.im, lr0=Math.log(Math.max(Math.hypot(cr0,ci0),1e-12)), li0=Math.atan2(ci0,cr0), maxIter=count;
  let toleranceAt=null;
  ${principalCode}
  return {state:principalState,re:zr,im:zi,toleranceAt};
}`, reference);

// Preserve the original ensemble loop and record its computations before drawing.
let ensembleCode = stripDrawing(drawing.slice(drawing.indexOf('// 1. Stochastic'), drawing.indexOf('// 2. Deterministic')));
ensembleCode = ensembleCode
  .replace('let escapedAt = -1;', 'let escapedAt = -1; const record={points:[{re:cr,im:ci,k:0}],choices:[]}; records.push(record);')
  .replace('const next = tetrationStep(zr, zi, lr, liBase + 2 * Math.PI * k);', 'record.choices.push(k); const next = tetrationStep(zr, zi, lr, liBase + 2 * Math.PI * k);')
  .replace('zr = nr; zi = ni;', 'zr = nr; zi = ni; record.points.push({re:zr,im:zi,k});')
  .replace('if (escapedAt === -1) {', 'record.escapedAt=escapedAt; if (escapedAt === -1) {');
vm.runInContext(`function originalEnsemble(base,count,size,noise,probability) {
  const cr0=base.re,ci0=base.im,maxIter=count,ensembleSize=size,sigma=noise,pBranch=probability,records=[];
  ${ensembleCode}
  return records;
}`, reference);

// The field uses its original raster function with a small image-data sink.
let fieldCode = sourceFunction('renderBasinField');
fieldCode = fieldCode.replace('if (converged) {', "samples.push({state:converged?'tolerance':escaped===-1?'survived':'escaped',re:zr,im:zi,escapedIndex:escaped}); if (converged) {");
reference.canvas = { width: 128, height: 80 };
reference.fieldCanvas = {};
reference.fieldCtx = {
  createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4) }; },
  putImageData(image) { this.image = image; }
};
vm.runInContext(fieldCode, reference);

// Independent identities and explicit finite guard behavior.
near(model.tetrationStep(2, 0, Math.log(2), 0)[0], 4);
near(model.tetrationStep(4, 0, Math.log(2), 0)[0], 16);
const one = model.orbit({ re: 1, im: 0 }, 64);
assert.equal(one.state, 'tolerance'); assert.equal(one.toleranceAt, 1);
assert.deepEqual(one.points.at(-1), { re: 1, im: 0, k: 0 });
assert.equal(model.tetrationStep(1, 0, 26, 0), null);
assert.ok(Number.isFinite(model.tetrationStep(1, 0, 25, 0)[0]), 'The u=25 guard is not machine overflow.');
assert.equal(model.tetrationStep(Infinity, 0, 1, 0), null);
for (const values of [[1.32, .38, .3, .2], [-3.2, 2.6, -1.4, -2.9], [.1, -.4, -20, 2 * Math.PI], [1, 1, 30, 0]]) {
  const original = reference.tetrationStep(...values), adapted = model.tetrationStep(...values);
  assert.deepEqual(adapted, original && Array.from(original));
}

const seeds = [{ re: 1.32, im: .38 }, { re: Math.exp(-Math.E), im: 0 }, { re: Math.exp(1 / Math.E), im: 0 }, { re: 2, im: 0 }];
for (const base of seeds) for (const N of [16, 64, 160]) {
  const original = reference.originalPrincipal(base, N), adapted = model.orbit(base, N);
  const state = original.state === 'Bounded' ? 'survived' : original.state === 'Convergent' ? 'tolerance' : 'escaped';
  assert.equal(adapted.state, state);
  assert.equal(adapted.toleranceAt, original.toleranceAt);
  near(adapted.points.at(-1).re, original.re); near(adapted.points.at(-1).im, original.im);
  if (state === 'escaped') assert.equal(adapted.escapedAt, Number(original.state.split('@')[1]) + 1);
}
const defaultOrbit = model.orbit(seeds[0], 64);
assert.equal(defaultOrbit.toleranceAt, 13);
near(defaultOrbit.points.at(-1).re, 1.070690393783173);
near(defaultOrbit.points.at(-1).im, .5504944853321798);
assert.equal(model.orbit(seeds[1], 160).state, 'survived');
assert.equal(model.orbit(seeds[2], 160).state, 'survived', 'The critical upper base has not met the tolerance by 160 updates.');

let fieldSamples = 0;
for (const N of [16, 64, 160]) {
  reference.maxIter = N; reference.samples = [];
  reference.renderBasinField();
  const { width: w, height: h } = reference.fieldCanvas;
  assert.equal(reference.samples.length, w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const re = model.VIEW.reMin + x / w * (model.VIEW.reMax - model.VIEW.reMin);
    const im = model.VIEW.imMax - y / h * (model.VIEW.imMax - model.VIEW.imMin);
    const sample = model.fieldSample(re, im, N), original = reference.samples[y * w + x];
    assert.equal(sample.state, original.state); assert.equal(sample.escapedIndex, original.escapedIndex);
    near(sample.re, original.re); near(sample.im, original.im);
    const color = Uint8ClampedArray.from(model.fieldColor(sample, N));
    for (let channel = 0; channel < 3; channel++) assert.equal(color[channel], reference.fieldCtx.image.data[(y * w + x) * 4 + channel]);
    fieldSamples++;
  }
}

let ensemblePoints = 0;
for (const [N, sigma, probability] of [[64, .015, .08], [64, 0, 0], [160, .08, .4]]) {
  math.random = rng();
  const original = reference.originalEnsemble(seeds[0], N, 24, sigma, probability);
  const adapted = model.ensemble(seeds[0], N, 24, sigma, probability, rng());
  assert.equal(adapted.length, original.length);
  adapted.forEach((orbit, i) => {
    const expected = original[i];
    assert.equal(orbit.escapedAt, expected.escapedAt === -1 ? null : expected.escapedAt + 1);
    assert.equal(orbit.jumps, expected.choices.filter(k => k !== 0).length);
    assert.equal(orbit.points.length, expected.points.length);
    orbit.points.forEach((point, j) => {
      assert.equal(point.re, expected.points[j].re); assert.equal(point.im, expected.points[j].im);
      assert.equal(point.k, expected.points[j].k); ensemblePoints++;
    });
  });
}

// One Gaussian perturbation per base: exactly four normal-generator uniforms,
// then one branch uniform per update at p=0. Its logarithm stays fixed throughout.
let randomCalls = 0;
const normalDraws = [Math.exp(-.5), .5, Math.exp(-2), .5];
const fixedNoise = model.ensemble(seeds[0], 16, 1, .015, 0, () => normalDraws[randomCalls++] ?? .9)[0];
near(fixedNoise.points[0].re, 1.305); near(fixedNoise.points[0].im, .35);
assert.equal(randomCalls, 20);
const log = model.logarithm(fixedNoise.points[0]);
for (let i = 1; i < fixedNoise.points.length; i++) {
  const previous = fixedNoise.points[i - 1], expected = model.tetrationStep(previous.re, previous.im, ...log);
  near(fixedNoise.points[i].re, expected[0]); near(fixedNoise.points[i].im, expected[1]);
}
const choiceDraws = [.1, .8, .9, .1, .2, .9, .1, .9];
const choices = model.orbit({ re: 1, im: 0 }, 5, { pBranch: .4, stopOnTolerance: false, random: () => choiceDraws.shift() });
assert.deepEqual(choices.points.slice(1).map(point => point.k), [1, 0, -1, 0, 1]);
assert.equal(choices.jumps, 3);
assert.deepEqual(choices.points[2], { re: 1, im: 0, k: 0 }, 'A zero sheet choice resets k; it does not carry the previous sheet.');

assert.equal(model.orbit({ re: 0, im: 0 }, 64).state, 'undefined');
assert.equal(model.fieldSample(0, 0, 64).state, 'undefined');
assert.equal(model.logarithm({ re: 1e-13, im: 0 }), null);
assert.ok(model.logarithm({ re: 1e-12, im: 0 }));
const perturbedZero = model.ensemble({ re: 0, im: 0 }, 64, 24, .015, .08, rng());
assert.equal(perturbedZero.length, 24);
assert.ok(perturbedZero.every(orbit => orbit.state !== 'undefined'));
const exactZero = model.ensemble({ re: 0, im: 0 }, 64, 24, 0, .08, rng());
assert.equal(exactZero.length, 24);
assert.ok(exactZero.every(orbit => orbit.state === 'undefined'));
for (const re of [-3.2, 3.8]) for (const im of [-2.6, 2.6]) {
  const paths = model.ensemble({ re, im }, 160, 60, .08, .4, rng());
  assert.equal(paths.length, 60);
  paths.forEach(orbit => {
    assert.ok(['survived', 'escaped'].includes(orbit.state));
    assert.ok(orbit.points.length <= 161);
    orbit.points.forEach(point => assert.ok(Number.isFinite(point.re) && Number.isFinite(point.im)));
    if (orbit.escapedAt !== null) assert.ok(orbit.escapedAt >= 1 && orbit.escapedAt <= 160);
  });
}
console.log('Complex tetration: original step/principal checks and ' + fieldSamples.toLocaleString('en-GB') + ' original field states/RGB samples passed.');
console.log('Matched 72 seeded source ensemble orbits and ' + ensemblePoints.toLocaleString('en-GB') + ' points, sheet choices and escape updates.');
console.log('Gaussian base noise, noncumulative sheets, critical bases, zero/cutoff handling and all extreme-control checks passed.');
