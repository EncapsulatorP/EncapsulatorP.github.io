'use strict';
const assert = require('node:assert/strict');
const { computeRecaman, delayPoint, ribbonPoint, ribbonCoordinate, gapBins } = require('../assets/recaman-explorer.js');

// Independent reference uses a boolean membership array and a plain array path.
function reference(terms) {
  const sequence = [0], seen = [true];
  let backwards = 0;
  for (let n = 1; n < terms; n++) {
    const below = sequence[n - 1] - n;
    const accepted = below >= 0 && seen[below] !== true;
    const next = accepted ? below : sequence[n - 1] + n;
    sequence.push(next); seen[next] = true;
    if (accepted) backwards++;
  }
  return { sequence, backwards, seen };
}

assert.deepEqual(Array.from(computeRecaman(16).sequence), [0,1,3,6,2,7,13,20,12,21,11,22,10,23,9,24]);
const checkpoints = [[200,833,654,19,95], [2500,10163,8156,19,1242], [8000,32980,26819,19,3992]];
let checkedTerms = 0, checkedTriples = 0;
for (const [terms, maximum, gapCount, smallest, backwards] of checkpoints) {
  const result = computeRecaman(terms), expected = reference(terms);
  assert.deepEqual(Array.from(result.sequence), expected.sequence);
  assert.equal(result.maximum, maximum);
  assert.equal(result.gaps.length, gapCount);
  assert.equal(result.smallestGap, smallest);
  assert.equal(result.backward, backwards);
  assert.equal(result.backward, expected.backwards);
  assert.equal(result.backwardRatio, backwards / (terms - 1));
  assert.equal(result.backward + result.boundary + result.collision, terms - 1);
  const visited = new Set([0]);
  for (let n = 1; n < terms; n++) {
    assert.equal(Math.abs(result.sequence[n] - result.sequence[n - 1]), n);
    if (result.directions[n] < 0) assert.equal(visited.has(result.sequence[n]), false);
    else assert.equal(result.sequence[n - 1] - n < 0 || visited.has(result.sequence[n - 1] - n), true);
    visited.add(result.sequence[n]);
  }
  const gapSet = new Set(result.gaps);
  for (let k = 1; k < maximum; k++) assert.equal(gapSet.has(k), !expected.seen[k]);
  for (let i = 0; i < terms - 2; i++) {
    const point = delayPoint(result, i);
    point.forEach((value, axis) => assert.ok(Math.abs((value + 1.1) * maximum / 2.2 - expected.sequence[i + axis]) < 1e-9));
    assert.ok(ribbonPoint(result, i).every(Number.isFinite));
    checkedTriples++;
  }
  for (const count of [1, 71, 400, maximum + 20]) {
    const bins = gapBins(result, count);
    assert.equal(bins[0].first, 1);
    assert.equal(bins[bins.length - 1].last, maximum - 1);
    bins.forEach((bin, i) => { if (i) assert.equal(bin.first, bins[i - 1].last + 1); assert.ok(bin.missing <= bin.total); });
    assert.equal(bins.reduce((sum, bin) => sum + bin.total, 0), maximum - 1);
    assert.equal(bins.reduce((sum, bin) => sum + bin.missing, 0), gapCount);
  }
  checkedTerms += terms;
}

// Möbius seam pairs opposite transverse coordinates, not equal coordinates.
for (const v of [-0.4,-0.1,0,0.2,0.4]) {
  const begin = ribbonCoordinate(0, v), end = ribbonCoordinate(2 * Math.PI, -v);
  begin.forEach((value, i) => assert.ok(Math.abs(value - end[i]) < 1e-12));
}
assert.equal(computeRecaman(2).smallestGap, null);
assert.deepEqual(gapBins(computeRecaman(2), 3), []);
for (const invalid of [0,1,-1,2.5,8001,Infinity,NaN]) assert.throws(() => computeRecaman(invalid), RangeError);
assert.throws(() => delayPoint(computeRecaman(200), 198), RangeError);
assert.throws(() => ribbonPoint(computeRecaman(200), 200), RangeError);
console.log(`Recamán: ${checkedTerms.toLocaleString('en-GB')} independently compared terms; ${checkedTriples.toLocaleString('en-GB')} coordinate triples; gap partitions, exact checkpoints, direction counts, and Möbius seam pass.`);
