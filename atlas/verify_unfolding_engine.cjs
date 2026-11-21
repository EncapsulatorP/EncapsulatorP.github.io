'use strict';
// Geometry and lifecycle checks. The deliberately inert GL below cannot verify
// shader compilation, appearance, interaction hit targets or browser rendering.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
let now = 0, serial = 0;
const constants = new Map();
const gl = new Proxy({}, { get(_target, key) {
  if (/^[A-Z0-9_]+$/.test(key)) { if (!constants.has(key)) constants.set(key, constants.size + 1); return constants.get(key); }
  if (key === 'getShaderParameter' || key === 'getProgramParameter') return () => true;
  if (key === 'getExtension') return () => ({});
  if (key === 'getShaderPrecisionFormat') return () => ({ precision: 23 });
  if (key === 'getAttribLocation') return () => 0;
  if (key === 'getParameter') return kind => kind === gl.MAX_VERTEX_ATTRIBS ? 8 : 4096;
  if (key === 'checkFramebufferStatus') return () => gl.FRAMEBUFFER_COMPLETE;
  if (String(key).startsWith('create') || key === 'getUniformLocation') return () => ({});
  return () => {};
} });
const events = new Map();
const eventTarget = prefix => ({ addEventListener(name, listener) { events.set(prefix + name, listener); }, removeEventListener(name) { events.delete(prefix + name); } });
const document = { ...eventTarget('doc:'), hidden: false };
const window = { ...eventTarget('window:'), devicePixelRatio: 1, matchMedia: () => ({ matches: false }) };
const context = vm.createContext({ window, document, console, Float32Array, Map, Set,
  performance: { now: () => now }, requestAnimationFrame: () => ++serial, cancelAnimationFrame() {},
  ResizeObserver: class { observe() {} disconnect() {} },
  IntersectionObserver: class { constructor(callback) { this.callback = callback; } observe() {} disconnect() {} }
});
for (const file of ['assets/paper-shape-lab.js', 'assets/paper-map-engine.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
const canvas = { ...eventTarget('canvas:'), style: {}, width: 1000, height: 600, getContext: () => gl,
  getAttribute: () => null, setAttribute() {}, removeAttribute() {}, setPointerCapture() {},
  getBoundingClientRect: () => ({ width: 1000, height: 600, left: 0, top: 0 }) };
let lastInfo;
const Engine = window.PaperMapEngine;
const engine = new Engine(canvas, { onProject(_points, info) { lastInfo = info; } });
const shapes = ['origami', 'sphere', 'portal', 'tensegrity', 'terrace', 'noperthedron', 'neck', 'klein',
  'voyage-chart', 'voyage-globe', 'voyage-portal', 'voyage-rigging', 'voyage-islands', 'voyage-noperthedron', 'voyage-neck', 'voyage-klein'];
const transform = (m, p) => [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14], m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15]];
const tick = (seconds, frames = Math.ceil(seconds * 60)) => { const step = seconds * 1000 / frames; for (let i = 0; i < frames; i++) { now += step; engine._frame(now); } };
let cases = 0, maximumNdc = 0, totalTriangles = 0;
engine.setMotion(false);
for (const shape of shapes) {
  engine.setShape(shape);
  const unfoldable = engine._isUnfoldable();
  let initialPoints, lastPoints;
  for (const progress of unfoldable ? [0, .1, .25, .4, .5, .65, .8, .9, 1] : [0]) {
    if (unfoldable) engine.setUnfold(progress);
    assert.equal(engine._mesh.landmarks.length, 9, shape + ': nine material landmarks');
    assert.ok(engine._mesh.vertices.every(Number.isFinite), shape + ': finite GPU data');
    assert.ok(engine._mesh.lines.every(Number.isFinite), shape + ': finite line data');
    const vertices = engine._mesh.vertices;
    for (let i = 0; i < vertices.length; i += 14) {
      const length = Math.hypot(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
      assert.ok(Math.abs(length - 1) < 1e-7, shape + ': unit surface normal');
    }
    for (const mark of engine._mesh.landmarks) {
      assert.ok(mark.position.every(Number.isFinite) && mark.normal.every(Number.isFinite), shape + ': finite pin');
      assert.ok(Math.abs(Math.hypot(...mark.normal) - 1) < 1e-7, shape + ': unit pin normal');
    }
    const points = engine._mesh.triangles.flat();
    if (!initialPoints) initialPoints = points;
    lastPoints = points;
    totalTriangles += engine._mesh.triangles.length;
    for (const aspect of [.90, 1.60, 2.90]) for (const yaw of [-1.4, .44, 2.2]) for (const pitch of [.15, .60, 1.25]) {
      engine._yaw = yaw; engine._pitch = pitch;
      const matrix = engine._camera(aspect).matrix;
      for (const point of points) {
        const p = transform(matrix, point), extent = Math.max(Math.abs(p[0] / p[3]), Math.abs(p[1] / p[3]));
        assert.ok(p[3] > 0 && p[2] / p[3] > -1 && p[2] / p[3] < 1, shape + ': depth clipping');
        assert.ok(extent < .999, `${shape} at ${progress} / ${aspect} / ${yaw} / ${pitch}: vertex clipped at ${extent}`);
        maximumNdc = Math.max(maximumNdc, extent);
      }
      cases++;
    }
  }
  if (unfoldable) assert.notEqual(JSON.stringify(initialPoints), JSON.stringify(lastPoints), shape + ': body really changes between endpoints');
}
console.log(`Unfolding geometry: ${shapes.length} scenes, ${cases} view/progress cases, 9 pins each; maximum viewport extent ${maximumNdc.toFixed(4)}.`);
console.log(`Checked ${totalTriangles.toLocaleString('en')} triangle instances for finite data and unit normals. This is not a rendered screenshot test.`);

// The chart and curved surfaces retain fixed swept envelopes. Rigid-face studio
// solids follow their growing nets so their closed forms remain large enough to
// read. Their continuous progress-aware framing is checked separately below.
for (const shape of shapes.filter(key => key !== 'tensegrity' && key !== 'terrace' && key !== 'portal' && key !== 'noperthedron' && key !== 'voyage-rigging' && key !== 'voyage-islands')) {
  engine.setShape(shape); engine._yaw = .44; engine._pitch = .60;
  let first;
  for (const progress of [0, .21, .53, .84, 1]) {
    engine.setUnfold(progress);
    const matrix = Array.from(engine._camera(1.6).matrix);
    if (!first) first = matrix;
    else matrix.forEach((value, i) => assert.ok(Math.abs(value - first[i]) < 1e-6, shape + ': camera moved with body progress'));
  }
}

let maxFramingStep = 0;
for (const shape of ['portal', 'noperthedron']) {
  engine.setShape(shape); engine._yaw = .44; engine._pitch = .60;
  let previousDistance;
  for (let step = 0; step <= 100; step++) {
    engine.setUnfold(step / 100); engine._camera(600 / 510);
    if (previousDistance) {
      const change = Math.abs(engine._distance - previousDistance) / previousDistance;
      maxFramingStep = Math.max(maxFramingStep, change);
      assert.ok(change < .08, shape + ': abrupt camera fit between adjacent 1% opening states');
    }
    previousDistance = engine._distance;
  }
  engine.setUnfold(0);
  const matrix = engine._camera(600 / 510).matrix;
  const projected = engine._mesh.triangles.flat().map(p => transform(matrix, p));
  const ys = projected.map(p => p[1] / p[3]);
  const height = (Math.max(...ys) - Math.min(...ys)) * 510 / 2;
  assert.ok(height > 260, shape + ': closed body should remain visually substantial in a 600×510 studio stage');
}
console.log(`Rigid-face studio framing: closed bodies exceed 260px in a 600×510 view; largest camera-distance change per 1% opening is ${(100 * maxFramingStep).toFixed(2)}%.`);

engine.setShape('sphere'); engine.setUnfold(0); engine.setMotion(true); engine.playUnfold(1);
tick(1.5); assert.ok(engine._unfoldProgress > 0 && engine._unfoldProgress < 1);
engine.setMotion(false); const paused = engine._unfoldProgress; tick(.5); assert.equal(engine._unfoldProgress, paused, 'Pause freezes the transformation');
engine.setMotion(true); tick(.6); assert.ok(engine._unfoldProgress > paused, 'Resume continues from the displayed frame');
const reversedAt = engine._unfoldProgress; engine.playUnfold(-1); assert.equal(engine._unfoldProgress, reversedAt, 'Reverse does not jump'); tick(.6); assert.ok(engine._unfoldProgress < reversedAt, 'Reverse moves towards the closed body');
engine.setUnfold(.42); assert.equal(engine._unfoldProgress, .42); assert.equal(engine._unfoldAnimation, null); assert.equal(engine._unfoldPreview, false);
engine.playOpening(); tick(.8); engine.setActive(false); const inactive = engine._unfoldProgress; tick(.5); assert.equal(engine._unfoldProgress, inactive, 'Closed atlas does not advance'); engine.setActive(true);
document.hidden = true; events.get('doc:visibilitychange')(); tick(.5); assert.equal(engine._unfoldProgress, inactive, 'Hidden tab does not advance'); document.hidden = false; events.get('doc:visibilitychange')();
engine._visible = false; tick(.5); assert.equal(engine._unfoldProgress, inactive, 'Offscreen canvas does not advance'); engine._visible = true;
events.get('canvas:webglcontextlost')({ preventDefault() {} }); const lost = engine._unfoldProgress; tick(.5); assert.equal(engine._unfoldProgress, lost, 'Lost graphics context does not advance'); assert.equal(lastInfo.status, 'context-lost');
events.get('canvas:webglcontextrestored')(); assert.equal(engine._lost, false); assert.equal(engine._mesh.landmarks.length, 9, 'Context restoration reconstructs the same landmark model');
engine.setUnfoldPreview(true); tick(2.1); assert.ok(engine._unfoldProgress > 0 && engine._unfoldProgress < 1, 'Preview opens without a Play gate');
engine.setUnfoldPreview(false); const stoppedPreview = engine._unfoldProgress; tick(.4); assert.equal(engine._unfoldProgress, stoppedPreview);
engine.setUnfold(1); engine.playUnfold(1); assert.equal(engine._unfoldProgress, 0, 'Open again replays from the closed state');
engine.setUnfold(0); engine.playUnfold(-1); assert.equal(engine._unfoldProgress, 1, 'Refold again replays from the open state');
engine._reduced = true; engine._motion = false; engine._motionOverride = false;
engine.setUnfold(0); assert.equal(engine.playOpening(), false); assert.equal(engine._unfoldProgress, 1, 'Reduced motion opens instantly'); engine.setUnfoldPreview(true); tick(.5); assert.equal(engine._unfoldProgress, 1, 'Reduced motion does not auto-cycle');
engine.setMotion(true); tick(2); assert.ok(engine._unfoldProgress < 1, 'Explicit Play enables preview despite reduced-motion preference');
engine._draw(); assert.equal(lastInfo.unfoldable, true); assert.equal(typeof lastInfo.unfoldProgress, 'number');
const beforeInvalid = engine._unfoldProgress; engine.setUnfold(NaN); assert.equal(engine._unfoldProgress, beforeInvalid);
engine.setShape('tensegrity'); assert.equal(engine.setUnfold(.5), false); assert.equal(engine.playUnfold(1), false, 'No invented tensegrity surgery');
engine.destroy(); assert.equal(engine._destroyed, true); assert.equal(engine._frameId, 0);
console.log('Lifecycle: pause/resume, reversal, endpoint replay, reduced motion, explicit override, inactive/hidden/offscreen/context-loss guards and destruction pass.');
