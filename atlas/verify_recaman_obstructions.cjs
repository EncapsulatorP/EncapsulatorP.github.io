/* Independent finite checks and a direct comparison with Gemini's archived code.
 * Run: node atlas/verify_recaman_obstructions.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../interactive/recaman-obstructions.js');
const THREE = require('../interactive/vendor/three-r146.min.js');

// Execute the supplied script itself with only its browser/rendering shell stubbed.
// Geometry, coordinates, recurrence and sampling remain its original code.
const source = fs.readFileSync(path.join(__dirname, '../interactive/sources/gemini-recaman-obstructions-original.js.txt'), 'utf8');
class RendererStub {
  constructor() { this.domElement = {}; }
  setSize() {} setPixelRatio() {} render() {}
}
class ControlsStub { update() {} }
const node = { appendChild() {}, addEventListener() {}, classList: { toggle() {} } };
const sandbox = {
  THREE: { ...THREE, WebGLRenderer: RendererStub }, OrbitControls: ControlsStub,
  document: { getElementById() { return { ...node }; }, documentElement: { getAttribute() {}, setAttribute() {} } },
  window: { innerWidth: 960, innerHeight: 640, devicePixelRatio: 1, addEventListener() {} },
  requestAnimationFrame() {}
};
vm.runInNewContext(source.replace(/^\s*import[^\n]+\n/gm, '') + `
  globalThis.probe = (N, mode) => {
    currentN = N; currentManifold = mode; showHoles = true; rebuild();
    return { data: computeRecaman(N), trajectory: rootGroup.children[0].geometry.attributes.position.array,
      holes: rootGroup.children[1].geometry.attributes.position.array };
  };
`, sandbox);

const first = [0, 1, 3, 6, 2, 7, 13, 20, 12, 21, 11, 22, 10, 23, 9, 24];
assert.deepEqual(Array.from(core.computeRecaman(16).seq), first);
assert.throws(() => core.computeRecaman(8001), RangeError);
assert.throws(() => core.computeRecaman(2.5), RangeError);

const fixtures = [[200, 833, 654, 95], [2500, 10163, 8156, 1242], [8000, 32980, 26819, 3992]];
let checkedCoordinates = 0;
for (const [N, maximum, holeCount, backward] of fixtures) {
  const data = core.computeRecaman(N);
  assert.equal(data.seq.length, N);
  assert.equal(data.maxVal, maximum);
  assert.equal(data.holes.length, holeCount);
  assert.equal(data.smallestHole, 19);
  assert.equal(data.backwardCount, backward);
  assert.equal(data.backwardRatio, backward / (N - 1));
  const seen = new Set([0]);
  let travel = 0, countedBackward = 0;
  for (let i = 1; i < N; i++) {
    const delta = data.seq[i] - data.seq[i - 1];
    assert.equal(Math.abs(delta), i, 'Every transition has the required step length.');
    assert.equal(data.dirs[i], Math.sign(delta));
    const candidate = data.seq[i - 1] - i;
    assert.equal(delta < 0, candidate > 0 && !seen.has(candidate), 'The subtraction branch is chosen exactly when legal.');
    if (delta < 0) countedBackward++;
    travel += Math.abs(delta); seen.add(data.seq[i]);
  }
  assert.equal(travel, N * (N - 1) / 2);
  assert.equal(countedBackward, backward);
  const missing = [];
  for (let value = 1; value < maximum; value++) if (!seen.has(value)) missing.push(value);
  assert.deepEqual(data.holes, missing);
  assert.equal(data.holes.length + seen.size, maximum + 1, 'Visited values and gaps partition 0 through the maximum.');

  for (const mode of ['delay', 'mobius']) {
    const adapted = core.buildSceneData(data, mode), original = sandbox.probe(N, mode);
    assert.deepEqual(Array.from(data.seq), Array.from(original.data.seq));
    assert.deepEqual(Array.from(data.dirs), Array.from(original.data.dirs));
    assert.deepEqual(data.holes, Array.from(original.data.holes));
    assert.equal(adapted.trajectory.length, N - 2);
    assert.equal(adapted.holes.length, Math.ceil(holeCount / Math.max(1, Math.floor(holeCount / 4000))));
    assert.equal(adapted.holes[0].value, 19, 'Source sampling always retains the smallest finite hole.');
    for (const [records, expected] of [[adapted.trajectory, original.trajectory], [adapted.holes, original.holes]]) {
      assert.equal(records.length * 3, expected.length);
      records.forEach((record, i) => record.position.forEach((value, axis) => {
        assert.ok(Number.isFinite(value));
        assert.ok(Math.abs(value - expected[3 * i + axis]) < 1e-6, 'Coordinate agrees with the supplied source’s float buffer.');
        checkedCoordinates++;
      }));
    }
  }
}
assert.throws(() => core.holePoint(core.computeRecaman(200), 0, 'delay'), RangeError);
assert.throws(() => core.trajectoryPoint(core.computeRecaman(200), 198, 'delay'), RangeError);

// A portrait stage must fit the unchanged world coordinates as they rotate.
// Check the actual PerspectiveCamera and the Canvas fallback's matrix formula.
assert.equal(core.responsiveCameraScale(1000, 500), 1, 'Wide stages retain the source camera.');
let framedPoints = 0;
for (const [width, height] of [[330, 500], [330, 390], [360, 390], [300, 340]]) {
  const scale = core.responsiveCameraScale(width, height);
  const camera = new THREE.PerspectiveCamera(48, width / height, .01, 200);
  camera.position.set(2.4, 2, 2.8).multiplyScalar(scale);
  camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  const projection = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  for (const N of [200, 2500, 8000]) for (const mode of ['delay', 'mobius']) {
    const cloud = core.buildSceneData(core.computeRecaman(N), mode);
    for (let turn = 0; turn < 24; turn++) {
      const rotation = new THREE.Matrix4().makeRotationY(turn * Math.PI / 12);
      const combined = projection.clone().multiply(rotation), e = combined.elements;
      for (const point of [...cloud.trajectory, ...cloud.holes]) {
        const [x, y, z] = point.position;
        const webgl = new THREE.Vector3(x, y, z).applyMatrix4(rotation).project(camera);
        assert.ok(Math.abs(webgl.x) < .99 && Math.abs(webgl.y) < .99, 'The full source cloud fits a narrow stage.');
        const w = e[3] * x + e[7] * y + e[11] * z + e[15];
        const canvasX = (e[0] * x + e[4] * y + e[8] * z + e[12]) / w;
        const canvasY = (e[1] * x + e[5] * y + e[9] * z + e[13]) / w;
        assert.ok(Math.abs(canvasX - webgl.x) < 1e-12 && Math.abs(canvasY - webgl.y) < 1e-12);
        framedPoints++;
      }
    }
  }
  // Resizing scales camera-to-target distance, leaving user-relative zoom intact.
  const target = new THREE.Vector3(.2, -.1, .3), zoom = .73;
  const offset = new THREE.Vector3(2.4, 2, 2.8).multiplyScalar(zoom);
  const position = target.clone().add(offset);
  position.sub(target).multiplyScalar(scale).add(target);
  assert.ok(Math.abs(position.distanceTo(target) / (Math.sqrt(17.6) * scale) - zoom) < 1e-12);
  position.sub(target).multiplyScalar(1 / scale).add(target);
  assert.ok(position.distanceTo(target.clone().add(offset)) < 1e-12);
}
console.log('Recamán obstructions: exact prefix and gap fixtures passed for 200, 2,500 and 8,000 terms.');
console.log('Compared ' + checkedCoordinates.toLocaleString('en-GB') + ' finite coordinate components with Gemini’s archived script across both modes.');
console.log('Source hole stride and smallest-hole retention passed; backward denominator is N − 1.');
console.log('Responsive camera: ' + framedPoints.toLocaleString('en-GB') + ' projections fit portrait stages; WebGL/Canvas math and relative zoom agree.');
