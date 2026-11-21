#!/usr/bin/env node
'use strict';

// Reproducible regression guard for the torus adaptation. Run from any directory:
// node atlas/verify_torus_overlay.cjs
// Only Node built-ins and the vendored Three.js math/scene classes are required.
// This exercises both render adapters without claiming to test browser pixels.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const THREE = require(path.join(root, 'interactive/vendor/three-r146.min.js'));
const supplied = fs.readFileSync(path.join(root, 'interactive/sources/gemini-torus-original.js.txt'), 'utf8');
const adapted = new vm.Script(fs.readFileSync(path.join(root, 'interactive/torus.js'), 'utf8'), { filename: 'torus.js' });
const palette = {
    '--surface': '#163b43', '--primary': '#a9e1cc', '--outline': '#8daea3',
    '--chart-1': '#a9e1cc', '--chart-2': '#89c5df', '--chart-3': '#d6c782',
    '--chart-4': '#dfad8e', '--chart-5': '#c5b4df'
};

function harness(webgl) {
    const strokes = [];
    const context2d = Object.fromEntries([
        'setTransform', 'clearRect', 'fillRect', 'beginPath', 'moveTo',
        'lineTo', 'arc', 'fill', 'setLineDash'
    ].map(name => [name, () => {}]));
    context2d.stroke = function () { strokes.push({ color: this.strokeStyle, width: this.lineWidth }); };
    class Element {
        constructor(tag = 'div') {
            this.tagName = tag.toUpperCase();
            this.children = [];
            this.attributes = {};
            this.handlers = {};
            this.classList = { add() {} };
            this.clientWidth = 880;
            this.clientHeight = 460;
            this.hidden = false;
        }
        append(...nodes) { this.children.push(...nodes); }
        replaceChildren(...nodes) { this.children = nodes; }
        setAttribute(key, value) { this.attributes[key] = value; }
        addEventListener(type, fn) { this.handlers[type] = fn; }
        removeEventListener(type) { delete this.handlers[type]; }
        getContext() { return context2d; }
    }
    const host = new Element();
    const controls = new Element();
    const rendererElement = new Element('canvas');
    const resizeCallbacks = [];
    let callback, config, state, scene, camera, cleanup, initialCamera;
    const WH = {
        createApp(options) {
            config = options;
            const listeners = [];
            const values = Object.fromEntries(Object.entries(options.params)
                .filter(([, param]) => param.type !== 'button')
                .map(([key, param]) => [key, param.value]));
            values._subscribe = (key, fn) => listeners.push({ key, fn });
            state = new Proxy(values, {
                set(target, key, value) {
                    if (Object.is(target[key], value)) return true;
                    target[key] = value;
                    for (const record of listeners) if (record.key === key) record.fn(value);
                    return true;
                }
            });
            return { state, ui: { setHUD() {}, setLegend() {}, setStatus() {} } };
        },
        getColor: token => palette[token] || token,
        addBadge() {},
        requestDraw() {},
        onFrame(fn) { callback = fn; return () => {}; },
        initThree(where, setup) {
            if (!webgl) return;
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45);
            const result = setup(scene, camera, { domElement: rendererElement }, { target: new THREE.Vector3() });
            camera.aspect = host.clientWidth / host.clientHeight;
            camera.updateProjectionMatrix();
            camera.lookAt(0, 0, 0);
            camera.updateMatrixWorld();
            initialCamera = camera.position.clone();
            callback = result.render;
            cleanup = result.stop;
        }
    };
    const context = vm.createContext({
        THREE, WH,
        document: {
            getElementById: () => host,
            createElement: tag => new Element(tag),
            querySelector: () => controls
        },
        ResizeObserver: class {
            constructor(callback) { this.callback = callback; }
            observe() { resizeCallbacks.push(this.callback); }
            disconnect() { const index = resizeCallbacks.indexOf(this.callback); if (index >= 0) resizeCallbacks.splice(index, 1); }
        },
        devicePixelRatio: 1
    });
    adapted.runInContext(context);
    return {
        state, scene, camera, host, controls, config, cleanup,
        frame(dt) { strokes.length = 0; callback({ dt }); },
        resize(width, height) {
            host.clientWidth = width;
            host.clientHeight = height;
            if (camera) { camera.aspect = width / height; camera.updateProjectionMatrix(); }
            resizeCallbacks.forEach(fn => fn());
        },
        resetCamera() {
            rendererElement.handlers.keydown?.({ key: 'R' });
            camera.position.copy(initialCamera);
            callback({ dt: 0 });
        },
        read: expression => vm.runInContext(expression, context),
        visibleTrailCount() {
            if (webgl) return scene.children.filter(object => object.isInstancedMesh && object.visible).length;
            const colors = vm.runInContext('PASS_COLORS', context);
            return strokes.filter(stroke => colors.includes(stroke.color) && stroke.width >= 3.5).length;
        }
    };
}

// Run the actual supplied Gemini script as the independent numerical oracle.
let sourceState, sourceFrame, sourceScene;
const sourceContext = vm.createContext({
    THREE,
    WH: {
        createApp(config) {
            sourceState = Object.fromEntries(Object.entries(config.params)
                .filter(([, param]) => param.type !== 'button')
                .map(([key, param]) => [key, param.value]));
            return { state: sourceState, ui: { setHUD() {} } };
        },
        getColor: token => palette[token] || token,
        createScale: tokens => fraction => tokens[Math.min(tokens.length - 1, Math.floor(Math.max(0, fraction) * tokens.length))],
        // Alpha is immaterial to the model. Avoid Three's repeated warnings about
        // the source's RGBA string while leaving all numerical code untouched.
        transparent: token => palette[token],
        addBadge() {},
        initThree(where, setup) {
            sourceScene = new THREE.Scene();
            sourceFrame = setup(sourceScene, new THREE.PerspectiveCamera(), {}, {});
        }
    }
});
vm.runInContext(supplied, sourceContext, { filename: 'gemini-torus-original.js.txt' });
const model = harness(false);
const advance = model.read('advanceTorus');
const target = {
    gravity: 1.5, growth: 0.8, speed: 1.2, isPlaying: true,
    kt: 0, residueMass: 0, temporalVelocity: 0, v: 0, u: 0, flashAmount: 0
};
const keys = ['kt', 'residueMass', 'temporalVelocity', 'v', 'u', 'flashAmount'];
const timeSteps = [1 / 60, 1 / 120, 0.05, 0.01, 0, 1 / 30];
let resets = 0;
for (let index = 0; index < 12000; index++) {
    if (index % 211 === 0) {
        const params = {
            gravity: [0.1, 1.5, 5][Math.floor(index / 211) % 3],
            growth: [0.1, 0.8, 3][Math.floor(index / 422) % 3],
            speed: [0.1, 1.2, 4][Math.floor(index / 633) % 3]
        };
        Object.assign(sourceState, params);
        Object.assign(target, params);
    }
    sourceState.isPlaying = target.isPlaying = index % 337 !== 0;
    const dt = timeSteps[index % timeSteps.length];
    sourceFrame({ time: index / 60, dt, state: sourceState });
    const result = advance(target, dt);
    if (result.jump) resets++;
    for (const key of keys) assert.equal(target[key], sourceState[key], `Frame ${index}: ${key}`);
    if (sourceState.isPlaying) {
        const particle = sourceScene.children.find(object => object.isMesh && object.geometry.type === 'SphereGeometry');
        for (const key of ['x', 'y', 'z']) assert.equal(result.position[key], particle.position[key], `Frame ${index}: displayed ${key}`);
    }
}
assert(resets > 0);
console.log(`PASS: 12,000 mixed-step frames and ${resets} resets exactly match the supplied recurrence and displayed coordinates; min/default/max control changes and paused frames included.`);

for (const webgl of [true, false]) {
    const test = harness(webgl);
    if (webgl) {
        const desktopDistance = test.camera.position.length();
        const direction = test.camera.position.clone().normalize();
        test.resize(330, 360);
        const phoneDistance = test.camera.position.length();
        assert(phoneDistance > desktopDistance, 'Give the phone stage enough horizontal room');
        assert(test.camera.position.clone().normalize().distanceTo(direction) < 1e-12, 'Preserve the camera direction on resize');
        const point = test.read('torusPoint');
        for (let u = 0; u < 128; u++) {
            for (let v = 0; v < 24; v++) {
                const p = point(u * Math.PI / 64, v * Math.PI / 12);
                const projected = new THREE.Vector3(p.x, p.y, p.z).project(test.camera);
                assert(Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1, 'Keep the default phone torus inside the stage');
            }
        }
        test.camera.position.multiplyScalar(0.73); // User zoom, independent of responsive framing.
        test.resize(880, 460);
        assert(Math.abs(test.camera.position.length() / desktopDistance - 0.73) < 1e-12, 'Preserve relative zoom on widening');
        test.resize(330, 360);
        assert(Math.abs(test.camera.position.length() / phoneDistance - 0.73) < 1e-12, 'Preserve relative zoom on narrowing');
        test.resetCamera();
        assert(Math.abs(test.camera.position.length() / phoneDistance - 1) < 1e-12, 'R uses the current responsive framing');
    }
    for (let index = 0; index < 720; index++) test.frame(0.05);
    assert(test.state.kt > 8, 'Exercise repeated history eviction');
    assert.equal(test.read('passes.length'), 4, 'Retain exactly the last four passes');
    assert(test.read('passes.every(pass => pass.points.length <= TRAIL_CAPACITY + 1)'), 'Bound all trail buffers');
    assert.equal(test.visibleTrailCount(), 4, 'Render all four retained passes in the default overlay');
    const referenceMesh = webgl && test.scene.children.find(object => object.material?.wireframe);
    if (referenceMesh) assert.equal(referenceMesh.material.opacity, 0.05, 'De-emphasize the mesh under the colored overlay');
    test.state.trailView = 'Original view';
    test.frame(0);
    assert.equal(test.visibleTrailCount(), 0, 'Hide trails in the source-style comparison');
    if (referenceMesh) assert.equal(referenceMesh.material.opacity, 0.21, 'Keep the original comparison mesh visible');
    test.state.trailView = 'Current pass';
    test.frame(0);
    assert.equal(test.visibleTrailCount(), 1, 'Render just the current pass in isolation');
    test.state.trailView = 'Superimposed passes';
    test.frame(0);
    assert.equal(test.visibleTrailCount(), 4, 'Restore the same retained passes without restarting');

    const catchButton = test.controls.children[0];
    catchButton.handlers.click();
    assert.equal(catchButton.attributes['aria-pressed'], 'true');
    const previousReset = test.state.kt;
    let count = 0;
    while (test.state.isPlaying && count++ < 1000) test.frame(0.05);
    assert.equal(test.state.isPlaying, false, 'Catch must actually pause');
    assert.equal(test.state.kt, previousReset + 1, 'Catch exactly the next reset');
    assert.equal(test.read('heldReset'), true);
    assert.equal(test.state.pauseAtReset, false, 'Catch is one-shot');
    assert.equal(catchButton.attributes['aria-pressed'], 'false');
    const frozen = keys.map(key => test.state[key]);
    for (let index = 0; index < 50; index++) test.frame(0.05);
    assert.deepEqual(keys.map(key => test.state[key]), frozen, 'Paused redraws must leave the model frozen');

    let disposedInstances = 0;
    if (webgl) {
        for (const object of test.scene.children.filter(object => object.isInstancedMesh)) {
            object.addEventListener('dispose', () => disposedInstances++);
            assert([...object.instanceMatrix.array].every(Number.isFinite), 'Instance matrices remain finite');
        }
    }
    test.config.params.reset.onClick(test.state);
    test.frame(0);
    assert(keys.every(key => test.state[key] === 0), 'Reset every numerical state field');
    assert.equal(test.read('passes.length'), 1, 'Reset discards retained passes');
    assert.equal(test.read('lastJump'), null, 'Reset removes the jump overlay');
    if (webgl) {
        assert.equal(test.scene.children.filter(object => object.isInstancedMesh).length, 1, 'No abandoned trail meshes');
        assert.equal(disposedInstances, 4, 'Release all replaced instance buffers');
        test.cleanup();
    }
    console.log(`PASS: ${webgl ? 'Three.js scene' : 'Canvas fallback'}: bounded four-pass history, all comparison modes, catch-next-reset, frozen pause, reset cleanup${webgl ? ', finite matrices, instance disposal, phone framing and relative zoom' : ''}.`);
}
