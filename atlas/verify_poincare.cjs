#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { DEFAULTS, RAW, CAPPED, mapStep, buildRun, playback, mapSegments } = require('../interactive/poincare.js');

const jump = { ...DEFAULTS, lambda: 1, vTh: 2, vShift: 1, x0: 2 };
const raw = buildRun(jump);
assert.deepEqual(raw.orbit.map(point => point.x), [2, 7, 22, 67, 202]);
assert.equal(raw.escapeAt, 4);
assert.equal(raw.segments.length, 8);
assert.deepEqual(raw.segments.map(segment => [segment.from.x, segment.from.y, segment.to.x, segment.to.y]), [
  [2, 0, 2, 7], [2, 7, 7, 7], [7, 7, 7, 22], [7, 22, 22, 22],
  [22, 22, 22, 67], [22, 67, 67, 67], [67, 67, 67, 202], [67, 202, 202, 202]
]);
assert.deepEqual(raw.transitions.map(step => step.branch), ['Odd', 'Odd', 'Odd', 'Odd']);

let controller = { position: 0, playing: false };
controller = playback(raw, controller, 'step');
assert.deepEqual(controller, { position: 1, playing: false });
assert.equal(raw.segments[controller.position - 1].phase, 'vertical');
controller = playback(raw, controller, 'step');
assert.deepEqual(controller, { position: 2, playing: false });
assert.equal(raw.segments[controller.position - 1].phase, 'horizontal');
controller = playback(raw, controller, 'play');
assert.deepEqual(controller, { position: 2, playing: true });
for (let leg = 3; leg <= 8; leg++) {
  controller = playback(raw, controller, 'tick');
  assert.equal(controller.position, leg);
  assert.equal(controller.playing, leg < 8);
}
assert.deepEqual(playback(raw, controller, 'step'), { position: 8, playing: false });
assert.deepEqual(playback(raw, controller, 'tick'), { position: 8, playing: false });
controller = playback(raw, controller, 'play');
assert.deepEqual(controller, { position: 0, playing: true }, 'Play at the end replays from the start');
controller = playback(raw, controller, 'pause');
assert.deepEqual(playback(raw, controller, 'tick'), controller, 'Pause does not advance');
assert.deepEqual(playback(raw, { position: 3, playing: true }, 'reset'), { position: 0, playing: false });
assert.deepEqual(playback(raw, { position: 0, playing: true }, 'show-all'), { position: 8, playing: false });

const capped = buildRun({ ...jump, iterations: 10 }, CAPPED);
assert.deepEqual(capped.orbit.map(point => point.x), [2, 7, 22, 67, 100, 50, 100, 50, 100, 50, 100]);
assert.equal(capped.escapeAt, null);
assert.equal(capped.cappedSteps, 4);
assert.equal(capped.transitions[3].rawNext, 202);
assert.equal(capped.transitions[3].to, 100);
assert.equal(capped.transitions[5].rawNext, 151);

assert.equal(mapStep(2 - 1e-9, jump).branch, 'Even');
assert.deepEqual(mapStep(2, jump), { value: 7, band: 1, branch: 'Odd' });
assert.equal(mapStep(4 - 1e-9, jump).branch, 'Odd');
assert.deepEqual(mapStep(4, jump), { value: 2, band: 2, branch: 'Even' });
const bands = mapSegments(jump, 6);
assert.deepEqual(bands.map(segment => segment.points), [
  [{ x: 0, y: 0 }, { x: 2, y: 1 }],
  [{ x: 2, y: 7 }, { x: 4, y: 13 }],
  [{ x: 4, y: 2 }, { x: 6, y: 3 }]
]);
assert.ok(bands.every(segment => segment.openEnd), 'Each complete threshold band has an open right endpoint');
assert.notEqual(bands[0].points.at(-1).y, bands[1].points[0].y, 'Threshold jumps are separate paths');

// Execute the supplied topic script to independently compare its original capped replay.
const originalState = { ...DEFAULTS, _subscribe() {} };
const context = vm.createContext({ WH: {
  createApp: () => ({ state: originalState, ui: { splitViz() {}, setHUD() {} } }),
  initPlot: () => () => {}, addBadge() {}
} });
const originalPath = path.resolve(__dirname, '../interactive/sources/gemini-poincare-original.js.txt');
vm.runInContext(fs.readFileSync(originalPath, 'utf8'), context, { filename: originalPath });
let comparisons = 0;
for (const lambda of [0.1, 0.85, 1, 1.5]) for (const vTh of [0.5, 2, 5]) for (const vShift of [0, 1, 5]) {
  for (const x0 of [0.1, 1.5, 2, 10]) for (const iterations of [10, 50, 200]) {
    const params = { lambda, vTh, vShift, x0, iterations };
    const restored = buildRun(params, CAPPED);
    Object.assign(originalState, params);
    vm.runInContext('updateCalculations()', context);
    assert.deepEqual(restored.orbit.map(point => point.x), Array.from(originalState.orbit, point => point.x));
    const originalCobweb = Array.from(originalState.cobweb, point => [point.x, point.y]);
    const restoredCobweb = [[x0, 0], ...restored.segments.map(segment => [segment.to.x, segment.to.y])];
    assert.deepEqual(restoredCobweb, originalCobweb);
    // Independently iterate the raw branch rule and stop immediately after the cutoff.
    const expected = [x0]; let current = x0;
    for (let n = 0; n < iterations; n++) {
      const q = Math.floor(lambda * current / vTh);
      current = q % 2 ? 3 * lambda * current + vShift : lambda * current / 2;
      expected.push(current);
      if (current > 100) break;
    }
    const observed = buildRun(params, RAW);
    assert.equal(observed.orbit.length, expected.length);
    observed.orbit.forEach((point, index) => assert.ok(Math.abs(point.x - expected[index]) <= Math.max(1, point.x) * 1e-12));
    observed.segments.forEach((segment, index) => {
      assert.equal(segment.phase, index % 2 === 0 ? 'vertical' : 'horizontal');
      assert.equal(segment.n, Math.floor(index / 2) + 1);
      if (segment.phase === 'vertical') assert.equal(segment.from.x, segment.to.x);
      else assert.equal(segment.from.y, segment.to.y);
      if (index > 0) assert.deepEqual(segment.from, observed.segments[index - 1].to);
    });
    comparisons++;
  }
}
for (const invalid of [{ lambda: 0 }, { vTh: 0 }, { vShift: -1 }, { x0: 11 }, { iterations: 9 }, { iterations: 201 }, { iterations: 10.5 }, { lambda: NaN }]) {
  assert.throws(() => buildRun({ ...DEFAULTS, ...invalid }), RangeError);
}
assert.throws(() => buildRun(DEFAULTS, 'unknown'), RangeError);
console.log(`Verified raw 2→7→22→67→202 cutoff fixture; exact cobweb leg order; step, pause, reset, end-stop and replay behavior.`);
console.log(`Original capped orbit and cobweb match in ${comparisons} parameter-grid cases; independent raw recurrence, threshold endpoints and input limits passed.`);
