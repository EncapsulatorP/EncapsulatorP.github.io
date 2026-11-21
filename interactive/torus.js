/* Gemini contribution · source interactive_visual_im_2a608082e24c9bed.html
 * Original recurrence and dt*0.05 mesh rotation; Atlas adds retained-path viewing.
 * Colors identify successive passes through the same prescribed animation.
 */
'use strict';

const TORUS_R = 10;
const TORUS_r = 3.5;
const TRAIL_LIMIT = 4;
const TRAIL_CAPACITY = 768;
const TRAIL_INTERVAL = 1 / 30;
const CURRENT_TRAIL_RADIUS = 0.2;
const RETAINED_TRAIL_RADIUS = 0.155;
const PASS_COLORS = ['#9eead7', '#ffd172', '#ff91ab', '#b6b1ff'];
const VIEW_OVERLAY = 'Superimposed passes';
const VIEW_CURRENT = 'Current pass';
const VIEW_ORIGINAL = 'Original view';
let resetView = () => {};

function torusPoint(u, v) {
    const rad = TORUS_R + TORUS_r * Math.cos(v);
    return { x: rad * Math.cos(u), y: TORUS_r * Math.sin(v), z: rad * Math.sin(u) };
}

// Keep this ordered finite-step recurrence identical to the supplied script.
// The displayed crossing is computed BEFORE the prescribed reset, as in the source.
function advanceTorus(s, dt) {
    dt = s.isPlaying ? dt : 0;
    s.residueMass += s.growth * dt;
    s.temporalVelocity += s.gravity * s.residueMass * dt;
    s.v += s.temporalVelocity * dt;
    s.u += s.speed * dt;
    const position = torusPoint(s.u, s.v);
    let jump = null;
    if (s.v >= Math.PI) {
        s.kt++;
        s.residueMass = 0;
        s.temporalVelocity = 0;
        s.v = -Math.PI / 2;
        s.flashAmount = 1;
        jump = { from: position, to: torusPoint(s.u, s.v), k: s.kt };
    }
    const flash = Math.max(0, s.flashAmount);
    if (s.flashAmount > 0) s.flashAmount -= dt * 2;
    return { position, jump, flash, dt };
}

function resetSimulation(s) {
    s.kt = 0;
    s.residueMass = 0;
    s.temporalVelocity = 0;
    s.v = 0;
    s.u = 0;
    s.flashAmount = 0;
    s.pauseAtReset = false;
    resetView();
}

const { state, ui } = WH.createApp({
    title: 'Bitemporal torus · superimposed passes',
    params: {
        gravity: { value: 1.5, min: 0.1, max: 5, label: 'Coupling G (arbitrary units)' },
        growth: { value: 0.8, min: 0.1, max: 3, label: 'Accumulation rate' },
        speed: { value: 1.2, min: 0.1, max: 4, label: 'Orbit speed' },
        trailView: { value: VIEW_OVERLAY, options: [VIEW_OVERLAY, VIEW_CURRENT, VIEW_ORIGINAL], label: 'Compare the overlap' },
        isPlaying: { value: true, label: 'Play/Pause' },
        reset: { type: 'button', label: 'Reset system', onClick: resetSimulation }
    }
});
state.kt = 0;
state.residueMass = 0;
state.temporalVelocity = 0;
state.v = 0;
state.u = 0;
state.flashAmount = 0;
state.pauseAtReset = false;

const host = document.getElementById('viz');
host.classList.add('torus-stage');
const catchButton = document.createElement('button');
catchButton.type = 'button';
catchButton.className = 'ix-button torus-catch';
catchButton.textContent = 'Catch next reset';
catchButton.setAttribute('aria-pressed', 'false');
catchButton.setAttribute('aria-describedby', 'torus-reading');
document.querySelector('#widget .ix-controls').append(catchButton);

const readout = document.createElement('div');
readout.className = 'torus-readout';
const passLabel = document.createElement('strong');
const viewLabel = document.createElement('span');
readout.append(passLabel, viewLabel);
const eventNote = document.createElement('p');
eventNote.className = 'torus-event';
eventNote.setAttribute('role', 'status');
eventNote.setAttribute('aria-live', 'polite');
eventNote.hidden = true;

function makePass(k, start) { return { k, points: [start], color: PASS_COLORS[k % PASS_COLORS.length] }; }
let passes = [makePass(0, torusPoint(0, 0))];
let sampleElapsed = 0;
let meshAngle = 0;
let lastJump = null;
let frame = { position: torusPoint(0, 0), jump: null, flash: 0, dt: 0 };
let view = null;
let heldReset = false;

function visiblePasses() {
    if (state.trailView === VIEW_ORIGINAL) return [];
    return state.trailView === VIEW_CURRENT ? passes.slice(-1) : passes;
}
function describeView() {
    const shown = visiblePasses();
    ui.setLegend([
        ...shown.map((pass, index) => ({
            label: `Pass ${pass.k}${index === shown.length - 1 ? ' · current' : ' · retained'}`,
            color: pass.color
        })),
        { label: 'Rotating reference mesh', color: '#91b0a7' },
        ...(state.trailView === VIEW_ORIGINAL ? [] : [{ label: 'Dashed gold · prescribed reset jump', color: '#ffd172' }])
    ]);
    passLabel.textContent = `PASS ${state.kt} · ${heldReset ? 'RESET HELD' : state.isPlaying ? 'LIVE' : 'PAUSED'}`;
    viewLabel.textContent = state.trailView === VIEW_OVERLAY
        ? `${passes.length} of ${TRAIL_LIMIT} retained passes · one torus`
        : state.trailView === VIEW_CURRENT ? 'Current pass isolated · same state' : 'Original mesh + particle · same state';
    ui.setStatus(state.trailView === VIEW_ORIGINAL
        ? 'The supplied view: a particle, a rotating wireframe and reset colors. Switch to Superimposed passes to inspect its recent paths.'
        : 'Thick traces retain successive passes at their actual coordinates. The dashed connector marks a prescribed jump, not motion integrated between its endpoints.');
}
function setCatchButton() {
    catchButton.setAttribute('aria-pressed', String(state.pauseAtReset));
    catchButton.textContent = state.pauseAtReset ? 'Cancel reset catch' : 'Catch next reset';
}
catchButton.addEventListener('click', () => {
    state.pauseAtReset = !state.pauseAtReset;
    if (state.pauseAtReset) {
        heldReset = false;
        state.isPlaying = true;
        eventNote.hidden = false;
        eventNote.textContent = 'Catching the next reset… the animation will pause with both endpoints marked.';
    } else {
        eventNote.hidden = !lastJump;
        if (lastJump) eventNote.textContent = `Reset ${lastJump.k}: inner-rim crossing → v = −π/2.`;
    }
    setCatchButton();
    describeView();
});
state._subscribe('trailView', () => { describeView(); WH.requestDraw(); });
state._subscribe('isPlaying', value => {
    if (value) {
        heldReset = false;
        if (lastJump && !state.pauseAtReset) eventNote.textContent = `Reset ${lastJump.k}: inner-rim crossing → v = −π/2. Both endpoints are marked.`;
    }
    describeView();
});
resetView = () => {
    passes = [makePass(0, torusPoint(0, 0))];
    sampleElapsed = 0;
    lastJump = null;
    heldReset = false;
    frame = { position: torusPoint(0, 0), jump: null, flash: 0, dt: 0 };
    eventNote.hidden = true;
    setCatchButton();
    describeView();
    WH.requestDraw();
};

function appendSample(pass, point) {
    const previous = pass.points[pass.points.length - 1];
    if (Math.hypot(point.x - previous.x, point.y - previous.y, point.z - previous.z) < 1e-8) return;
    // At most about 425 samples per pass at the slowest allowed rates.
    // The fixed capacity remains a hard bound even if future controls change.
    if (pass.points.length < TRAIL_CAPACITY + 1) pass.points.push(point);
}
function renderFrame({ dt }) {
    frame = advanceTorus(state, dt);
    meshAngle += frame.dt * 0.05; // Original local-z mesh rotation, unchanged.
    sampleElapsed += frame.dt;
    if (frame.dt > 0 && (sampleElapsed >= TRAIL_INTERVAL || frame.jump)) {
        appendSample(passes[passes.length - 1], frame.position);
        sampleElapsed %= TRAIL_INTERVAL;
    }
    if (frame.jump) {
        lastJump = frame.jump;
        passes.push(makePass(state.kt, frame.jump.to));
        if (passes.length > TRAIL_LIMIT) passes.shift();
        sampleElapsed = 0;
        eventNote.hidden = false;
        eventNote.textContent = `Reset ${state.kt}: inner-rim crossing → v = −π/2. Both endpoints are marked.`;
        if (state.pauseAtReset) {
            heldReset = true;
            state.isPlaying = false;
            state.pauseAtReset = false;
            setCatchButton();
            eventNote.textContent = `Reset ${state.kt} held: inspect the bright crossing ring, bottom ring and dashed jump. Play animation to continue.`;
        }
        describeView();
    }
    if (view) view.draw(frame);
    ui.setHUD([
        { label: 'Reset count K', value: state.kt },
        { label: 'Accumulated m', value: state.residueMass.toFixed(2) + ' a.u.' },
        { label: 'Angular speed', value: state.temporalVelocity.toFixed(2) + ' rad / time unit' }
    ]);
}

WH.initThree('viz', (scene, camera, renderer, controls) => {
    const bg = new THREE.Color(WH.getColor('--surface'));
    const resetGold = new THREE.Color('#ffd172');
    scene.background = bg;
    const torusGeometry = new THREE.TorusGeometry(TORUS_R, TORUS_r, 24, 80);
    const torusMaterial = new THREE.MeshBasicMaterial({ color: '#91b0a7', wireframe: true, transparent: true, opacity: 0.21, depthWrite: false });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.rotation.x = Math.PI / 2;
    scene.add(torus);

    const ringGeometry = new THREE.TorusGeometry(TORUS_R - TORUS_r, 0.035, 6, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: '#ffd172', transparent: true, opacity: 0.5, depthWrite: false });
    const innerRim = new THREE.Mesh(ringGeometry, ringMaterial);
    innerRim.rotation.x = Math.PI / 2;
    scene.add(innerRim);

    const particleGeometry = new THREE.SphereGeometry(0.29, 18, 12);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: '#fffdf3' });
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    const haloGeometry = new THREE.SphereGeometry(0.56, 18, 12);
    const haloMaterial = new THREE.MeshBasicMaterial({ color: PASS_COLORS[0], transparent: true, opacity: 0.52, depthWrite: false });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    scene.add(particle, halo);

    // Instanced tubes have real width on WebGL; LineBasicMaterial.linewidth is
    // ignored on common mobile implementations. Trails are bounded to four passes.
    const segmentGeometry = new THREE.CylinderGeometry(1, 1, 1, 7, 1, false);
    const meshes = new Map();
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const direction = new THREE.Vector3();
    const currentTipMaterial = new THREE.MeshBasicMaterial({ color: PASS_COLORS[0], transparent: true, opacity: 1, depthWrite: false });
    const currentTip = new THREE.Mesh(segmentGeometry, currentTipMaterial);
    currentTip.visible = false;
    scene.add(currentTip);
    function positionSegment(object, a, b, radius) {
        direction.set(b.x - a.x, b.y - a.y, b.z - a.z);
        const length = direction.length();
        object.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
        object.quaternion.setFromUnitVectors(up, direction.multiplyScalar(1 / (length || 1)));
        object.scale.set(radius, length, radius);
        object.updateMatrix();
    }
    function updateTrails(position) {
        for (const [pass, record] of meshes) {
            if (!passes.includes(pass)) {
                scene.remove(record.mesh);
                record.mesh.dispose();
                record.mesh.material.dispose();
                meshes.delete(pass);
            }
        }
        const shown = visiblePasses();
        for (const pass of passes) {
            let record = meshes.get(pass);
            if (!record) {
                const material = new THREE.MeshBasicMaterial({ color: pass.color, transparent: true, opacity: 0.78, depthWrite: false });
                const mesh = new THREE.InstancedMesh(segmentGeometry, material, TRAIL_CAPACITY);
                mesh.count = 0;
                mesh.frustumCulled = false;
                mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                record = { mesh, count: 0, radius: 0 };
                meshes.set(pass, record);
                scene.add(mesh);
            }
            const current = pass === passes[passes.length - 1];
            const radius = current ? CURRENT_TRAIL_RADIUS : RETAINED_TRAIL_RADIUS;
            const start = record.radius === radius ? record.count : 0;
            for (let i = start; i < pass.points.length - 1; i++) {
                positionSegment(dummy, pass.points[i], pass.points[i + 1], radius);
                record.mesh.setMatrixAt(i, dummy.matrix);
            }
            if (record.count !== pass.points.length - 1 || record.radius !== radius) record.mesh.instanceMatrix.needsUpdate = true;
            record.count = pass.points.length - 1;
            record.radius = radius;
            record.mesh.count = record.count;
            record.mesh.visible = shown.includes(pass);
            record.mesh.material.opacity = current ? 1 : 0.94;
        }
        const current = passes[passes.length - 1];
        currentTip.visible = shown.includes(current) && !frame.jump;
        if (currentTip.visible) {
            positionSegment(currentTip, current.points[current.points.length - 1], position, CURRENT_TRAIL_RADIUS);
            currentTipMaterial.color.set(current.color);
        }
    }

    const jumpGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const jumpMaterial = new THREE.LineDashedMaterial({ color: '#ffd172', dashSize: 0.4, gapSize: 0.23, transparent: true, opacity: 1, depthTest: false, depthWrite: false });
    const jumpLine = new THREE.Line(jumpGeometry, jumpMaterial);
    jumpLine.renderOrder = 5;
    const markerGeometry = new THREE.TorusGeometry(0.7, 0.08, 7, 40);
    const crossingMaterial = new THREE.MeshBasicMaterial({ color: '#ffd172', depthTest: false, depthWrite: false });
    const landingMaterial = new THREE.MeshBasicMaterial({ color: '#fffdf3', depthTest: false, depthWrite: false });
    const crossing = new THREE.Mesh(markerGeometry, crossingMaterial);
    const landing = new THREE.Mesh(markerGeometry, landingMaterial);
    crossing.renderOrder = landing.renderOrder = 6;
    scene.add(jumpLine, crossing, landing);

    camera.position.set(22, 18, 22);
    controls.enableDamping = true;
    const target = controls.target || new THREE.Vector3();
    const initialDistance = camera.position.distanceTo(target);
    let framingFactor = 1;
    let reframeAfterViewReset = false;
    function fitNarrowStage() {
        if (host.clientWidth < 1 || host.clientHeight < 1) return;
        const aspect = host.clientWidth / host.clientHeight;
        const horizontalHalfAngle = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * aspect);
        // Fit the original torus bound plus 8% breathing room horizontally.
        // Apply only the change in framing, preserving the user's relative zoom,
        // orbit direction and target when the phone rotates or the stage resizes.
        const factor = Math.max(1, (TORUS_R + TORUS_r) * 1.08 / (initialDistance * Math.sin(horizontalHalfAngle)));
        camera.position.sub(target).multiplyScalar(factor / framingFactor).add(target);
        framingFactor = factor;
        camera.updateMatrixWorld();
        WH.requestDraw();
    }
    fitNarrowStage();
    const initialFramingFactor = framingFactor;
    const framingObserver = new ResizeObserver(fitNarrowStage);
    framingObserver.observe(host);
    const handleViewReset = event => {
        if (event.key.toLowerCase() === 'r') reframeAfterViewReset = true;
    };
    renderer.domElement?.addEventListener('keydown', handleViewReset);
    WH.addBadge('3d_rotation', 'Drag to orbit · arrows / + / − / R also work');
    view = {
        draw(currentFrame) {
            if (reframeAfterViewReset) {
                // The shared R shortcut restores its initial camera snapshot.
                // Account for any responsive resize since that snapshot.
                camera.position.sub(target).multiplyScalar(framingFactor / initialFramingFactor).add(target);
                camera.updateMatrixWorld();
                reframeAfterViewReset = false;
            }
            torus.rotation.z = meshAngle;
            torusMaterial.opacity = state.trailView === VIEW_ORIGINAL ? 0.21 : 0.05;
            particle.position.copy(currentFrame.position);
            halo.position.copy(currentFrame.position);
            haloMaterial.color.set(PASS_COLORS[state.kt % PASS_COLORS.length]);
            scene.background = bg.clone().lerp(resetGold, currentFrame.flash * 0.07);
            innerRim.visible = state.trailView !== VIEW_ORIGINAL;
            updateTrails(currentFrame.position);
            const showJump = Boolean(lastJump) && state.trailView !== VIEW_ORIGINAL;
            jumpLine.visible = crossing.visible = landing.visible = showJump;
            if (showJump) {
                const positions = jumpGeometry.attributes.position;
                positions.setXYZ(0, lastJump.from.x, lastJump.from.y, lastJump.from.z);
                positions.setXYZ(1, lastJump.to.x, lastJump.to.y, lastJump.to.z);
                positions.needsUpdate = true;
                jumpLine.computeLineDistances();
                jumpGeometry.computeBoundingSphere();
                crossing.position.copy(lastJump.from);
                landing.position.copy(lastJump.to);
                crossing.quaternion.copy(camera.quaternion);
                landing.quaternion.copy(camera.quaternion);
                const scale = 1 + currentFrame.flash * 0.35;
                crossing.scale.setScalar(scale);
                landing.scale.setScalar(scale);
                jumpMaterial.opacity = heldReset ? 1 : 0.66 + currentFrame.flash * 0.34;
            }
        }
    };
    return {
        render: renderFrame,
        stop() {
            framingObserver.disconnect();
            renderer.domElement?.removeEventListener('keydown', handleViewReset);
            for (const record of meshes.values()) { record.mesh.dispose(); record.mesh.material.dispose(); }
            [torusGeometry, ringGeometry, particleGeometry, haloGeometry, segmentGeometry, jumpGeometry, markerGeometry].forEach(geometry => geometry.dispose());
            [torusMaterial, ringMaterial, particleMaterial, haloMaterial, currentTipMaterial, jumpMaterial, crossingMaterial, landingMaterial].forEach(material => material.dispose());
        }
    };
});

// The same model runs without WebGL. This is an isometric projection, not a
// replacement recurrence, and shares the runtime's pause/visibility lifecycle.
if (!view) {
    host.replaceChildren();
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Isometric torus projection with retained colored passes, current particle and prescribed reset endpoints. The controls update the same simulation as the 3D view.');
    host.append(canvas);
    const context = canvas.getContext('2d');
    let width = 1, height = 1;
    const yaw = Math.PI / 4, pitch = 0.5;
    function projected(point) {
        const scale = Math.min(width / 33, height / 25);
        return {
            x: width / 2 + (Math.cos(yaw) * point.x - Math.sin(yaw) * point.z) * scale,
            y: height / 2 + ((Math.sin(yaw) * point.x + Math.cos(yaw) * point.z) * Math.sin(pitch) - point.y * Math.cos(pitch)) * scale
        };
    }
    function strokePath(points, color, lineWidth, alpha = 1) {
        if (!points.length) return;
        context.beginPath();
        points.forEach((point, index) => { const p = projected(point); index ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y); });
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.globalAlpha = alpha;
        context.stroke();
        context.globalAlpha = 1;
    }
    function circle(point, radius, color, fill = false) {
        const p = projected(point);
        context.beginPath();
        context.arc(p.x, p.y, radius, 0, Math.PI * 2);
        if (fill) { context.fillStyle = color; context.fill(); }
        else { context.strokeStyle = color; context.lineWidth = 2.5; context.stroke(); }
    }
    view = {
        draw(currentFrame) {
            if (!context) return;
            context.clearRect(0, 0, width, height);
            context.fillStyle = WH.getColor('--surface');
            context.fillRect(0, 0, width, height);
            context.lineJoin = context.lineCap = 'round';
            for (let i = 0; i < 24; i++) {
                const points = [];
                for (let j = 0; j <= 64; j++) points.push(torusPoint(i * Math.PI / 12 + meshAngle, j * Math.PI / 32));
                strokePath(points, '#91b0a7', 0.7, 0.28);
            }
            for (let i = 0; i < 8; i++) {
                const points = [];
                for (let j = 0; j <= 100; j++) points.push(torusPoint(j * Math.PI / 50, i * Math.PI / 4));
                strokePath(points, '#91b0a7', 0.7, 0.28);
            }
            if (state.trailView !== VIEW_ORIGINAL) {
                const rim = [];
                for (let j = 0; j <= 100; j++) rim.push(torusPoint(j * Math.PI / 50, Math.PI));
                strokePath(rim, '#ffd172', 1.2, 0.5);
            }
            for (const pass of visiblePasses()) {
                const current = pass === passes[passes.length - 1];
                const points = current && !currentFrame.jump ? [...pass.points, currentFrame.position] : pass.points;
                strokePath(points, WH.getColor('--surface'), current ? 8 : 6, 0.9);
                strokePath(points, pass.color, current ? 5.5 : 3.5, current ? 1 : 0.85);
            }
            if (lastJump && state.trailView !== VIEW_ORIGINAL) {
                context.setLineDash([6, 5]);
                strokePath([lastJump.from, lastJump.to], '#ffd172', 2.5);
                context.setLineDash([]);
                const radius = 9 + currentFrame.flash * 4;
                circle(lastJump.from, radius, '#ffd172');
                circle(lastJump.to, radius, '#fffdf3');
            }
            circle(currentFrame.position, 10, PASS_COLORS[state.kt % PASS_COLORS.length], true);
            circle(currentFrame.position, 4.5, '#fffdf3', true);
        }
    };
    const resize = () => {
        width = Math.max(240, host.clientWidth);
        height = host.clientHeight || 460;
        const ratio = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
        WH.requestDraw();
    };
    new ResizeObserver(resize).observe(host);
    resize();
    WH.onFrame(renderFrame);
    WH.addBadge('view_in_ar', '2D isometric view · same simulation · WebGL unavailable');
}
host.append(readout, eventNote);
describeView();
WH.requestDraw();
