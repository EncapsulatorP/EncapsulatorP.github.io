#!/usr/bin/env node
'use strict';

// Independent sieve and representation counts audit every accessible even total.
// The archived source is also executed to check the restored readouts for fidelity.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { analyze, isPrime, MIN_N, MAX_N, DEFAULT_N } = require('../interactive/goldbach-involution.js');

const sieve = Array(MAX_N + 1).fill(true);
sieve[0] = sieve[1] = false;
for (let p = 2; p <= MAX_N; p++) {
  if (sieve[p]) for (let multiple = p * p; multiple <= MAX_N; multiple += p) sieve[multiple] = false;
}
for (let k = 0; k <= MAX_N; k++) assert.equal(isPrime(k), sieve[k], `primality at ${k}`);

let originalHUD;
const sourceState = { n: DEFAULT_N, _subscribe() {} };
const context = vm.createContext({
  WH: {
    createApp: () => ({ state: sourceState, ui: { setEditorial: editorial => { originalHUD = editorial.hud; } } }),
    initPlot() {}
  }
});
const originalPath = path.resolve(__dirname, '../interactive/sources/gemini-goldbach-involution-original.js.txt');
vm.runInContext(fs.readFileSync(originalPath, 'utf8'), context, { filename: originalPath });

let checked = 0, fixedPointCases = 0, minRho = Infinity, maxRho = -Infinity;
for (let N = MIN_N; N <= MAX_N; N += 2) {
  const result = analyze(N);
  const primes = Array.from({ length: N - 1 }, (_, index) => index + 1).filter(k => sieve[k]);
  // Count actual representations by an independent ordered Cartesian search.
  const ordered = [];
  for (const p of primes) for (const q of primes) if (p + q === N) ordered.push([p, q]);
  const unordered = ordered.filter(([p, q]) => p <= q);
  const diagonal = unordered.filter(([p, q]) => p === q).length;
  const M = primes.length, C = ordered.length;
  assert.equal(result.primeCount, M, `M at ${N}`);
  assert.equal(result.orderedPairs, C, `C at ${N}`);
  assert.equal(result.diagonal, diagonal, `diagonal at ${N}`);
  assert.deepEqual(result.pairs.map(orbit => [orbit.k, orbit.nk]), unordered, `pairs at ${N}`);
  assert.equal(result.ePlus, (M + C) / 2, `E+ at ${N}`);
  assert.equal(result.eMinus, (M - C) / 2, `E− at ${N}`);
  assert.equal(result.totalEnergy, M, `normalization at ${N}`);
  assert.equal(result.ePlus - result.eMinus, C, `energy difference at ${N}`);
  assert.equal(C, 2 * unordered.length - diagonal, `ordered/unordered relationship at ${N}`);
  assert.equal(result.rho, (M - C) / (2 * M), `rho at ${N}`);
  assert.ok(result.rho >= 0 && result.rho <= 0.5, `rho range at ${N}`);
  assert.equal(result.rho < 0.5, unordered.length > 0, `finite pair equivalence at ${N}`);

  assert.equal(result.orbits.length, N / 2, `orbit count at ${N}`);
  assert.equal(result.orbits.reduce((sum, orbit) => sum + orbit.weight, 0), N - 1, `coordinate count at ${N}`);
  assert.equal(result.orbits.reduce((sum, orbit) => sum + orbit.ePlus, 0), result.ePlus, `folded E+ at ${N}`);
  assert.equal(result.orbits.reduce((sum, orbit) => sum + orbit.eMinus, 0), result.eMinus, `folded E− at ${N}`);
  assert.equal(result.orbits.at(-1).weight, 1, `fixed point counted once at ${N}`);
  assert.equal(result.orbits.at(-1).minus, 0, `fixed point antisymmetric part at ${N}`);
  assert.equal(result.orbits[0].kPrime, false, `1 is non-prime at ${N}`);
  assert.ok(result.orbits[0].category.includes('non-prime') || result.orbits[0].category.startsWith('Non-prime'), `1 category at ${N}`);
  result.orbits.forEach(orbit => {
    assert.equal(orbit.k + orbit.nk, N);
    assert.equal(orbit.kPrime, sieve[orbit.k]);
    assert.equal(orbit.nkPrime, sieve[orbit.nk]);
    assert.equal(orbit.plus + orbit.minus, Number(sieve[orbit.k]));
    assert.equal(orbit.plus - orbit.minus, Number(sieve[orbit.nk]));
  });

  sourceState.n = N;
  vm.runInContext('runAnalysis()', context);
  assert.deepEqual(Array.from(originalHUD, item => item.value), [result.ePlus.toFixed(2), result.eMinus.toFixed(2), result.rho.toFixed(4)], `original source readouts at ${N}`);
  assert.deepEqual(Array.from(sourceState._chartData, orbit => [orbit.k, orbit.nk, orbit.kPrime, orbit.nkPrime]), result.orbits.map(orbit => [orbit.k, orbit.nk, orbit.kPrime, orbit.nkPrime]), `original plot endpoints at ${N}`);
  fixedPointCases += diagonal; checked++;
  minRho = Math.min(minRho, result.rho); maxRho = Math.max(maxRho, result.rho);
}

for (const invalid of [0, 4, 8, 9, 11, 149, 151, 152, 10.5, NaN, Infinity, '30', null]) {
  assert.throws(() => analyze(invalid), RangeError, `invalid N ${String(invalid)}`);
}
assert.deepEqual([analyze(10).ePlus, analyze(10).eMinus, analyze(10).rho], [3.5, 0.5, 0.125]);
assert.deepEqual([analyze(30).ePlus, analyze(30).eMinus, analyze(30).rho], [8, 2, 0.2]);
const last = analyze(150);
console.log(`Verified ${checked} even totals (${MIN_N}–${MAX_N}); exact energies and readouts match the supplied Gemini source for every total.`);
console.log(`Independent sieve/count checks passed, including ${fixedPointCases} prime central fixed points, full orbit contributions, all endpoints and rejected invalid inputs.`);
console.log(`Observed finite-range rho: ${minRho}…${maxRho}. At N=150: E+=${last.ePlus}, E−=${last.eMinus}, rho=${last.rho}, unordered pairs=${last.pairs.length}.`);
