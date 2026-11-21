/* Gemini contribution · source interactive_visual_im_40a9d6898acfe388.html
 * Atlas adaptation: see sources.json and the evidence boundary on this page. */

/**
 * RECAMÁN COORDINATE EXPLORER
 * 3D Phase-Space Visualization of the Recamán Sequence (A005132)
 * Features: Delay Embedding, Normalized Spacing, and Spatiotemporal Mapping.
 */

// 1. Setup App (UI + State)
const { state, ui } = WH.createApp({
    title: "Recamán Coordinates",
    params: {
        steps: { value: 2000, min: 500, max: 5000, step: 100, label: "Steps (N)" },
        mode: { 
            value: 'Delay Embedding', 
            options: ['Delay Embedding', 'Normalized Delay', 'Spatiotemporal'],
            label: "Coordinates"
        }
    }
});

// Initialize State
state.sequenceData = [];
state.maxVal = 0;

/**
 * CORE LOGIC: Recamán Sequence Generator
 * a[n] = a[n-1] - n if > 0 and not visited, else a[n-1] + n
 */
function calculateSequence(n) {
    const seq = [{ val: 0, op: 'Start', n: 0 }];
    const visited = new Set([0]);
    let max = 0;

    for (let i = 1; i <= n; i++) {
        const prev = seq[i - 1].val;
        let next = prev - i;
        let op = 'Down';

        if (next <= 0 || visited.has(next)) {
            next = prev + i;
            op = 'Up';
        }

        seq.push({ val: next, op, n: i });
        visited.add(next);
        if (next > max) max = next;
    }
    state.maxVal = max;
    state.sequenceData = seq;
    
    // Update HUD with stats and Legend
    ui.setHUD([
        { label: "Max Value", value: max.toLocaleString() },
        { label: "Subtract branch", value: "●", color: '--chart-2' },
        { label: "Add branch", value: "●", color: '--chart-4' }
    ]);
}

// 2. Initialize Engine (Three.js)
WH.initThree('viz', (scene, camera, renderer, controls) => {
    // Scene Setup
    camera.position.set(100, 100, 100);
    controls.enableDamping = true;
    WH.addBadge('3d_rotation', 'Orbit');
    WH.addBadge('zoom_in', 'Zoom');

    // Visual Objects
    const upGeometry = new THREE.SphereGeometry(0.6, 8, 8);
    const downGeometry = new THREE.SphereGeometry(0.6, 8, 8);
    const upMaterial = new THREE.MeshBasicMaterial({ color: WH.getColor('--chart-4') });
    const downMaterial = new THREE.MeshBasicMaterial({ color: WH.getColor('--chart-2') });
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: WH.getColor('--outline'), 
        transparent: true, 
        opacity: 0.3 
    });

    let upPoints = new THREE.InstancedMesh(upGeometry, upMaterial, 5001);
    let downPoints = new THREE.InstancedMesh(downGeometry, downMaterial, 5001);
    upPoints.frustumCulled = downPoints.frustumCulled = false;
    let trajectoryLine = new THREE.Line(new THREE.BufferGeometry(), lineMaterial);

    scene.add(upPoints);
    scene.add(downPoints);
    scene.add(trajectoryLine);

    // Helpers
    const grid = new THREE.GridHelper(200, 20, WH.getColor('--outline-variant'), WH.getColor('--surface-container-highest'));
    grid.position.y = -50;
    scene.add(grid);

    /**
     * Map sequence data to 3D space based on mode
     */
    const updateGeometry = () => {
        // Clear previous
        let upCount = 0, downCount = 0;
        const transform = new THREE.Matrix4();
        
        const data = state.sequenceData;
        const mode = state.mode;
        const N = state.steps;
        const linePoints = [];

        // Scaling Factor to keep visualization in bounds [-50, 50]
        const scaleVal = 100 / state.maxVal;
        const scaleN = 100 / N;
        const normalizedMax = Math.max(...data.slice(1).map(d => d.val / d.n));
        const normalizedScale = 100 / normalizedMax;

        // Loop from 2 to avoid undefined delays (a[n-1], a[n-2])
        for (let i = mode === 'Normalized Delay' ? 3 : 2; i < data.length; i++) {
            let x, y, z;
            const d = data[i];
            const d1 = data[i-1];
            const d2 = data[i-2];

            if (mode === 'Delay Embedding') {
                // (a_n, a_{n-1}, a_{n-2})
                x = d.val * scaleVal - 50;
                y = d1.val * scaleVal - 50;
                z = d2.val * scaleVal - 50;
            } else if (mode === 'Normalized Delay') {
                // (a_n/n, a_{n-1}/(n-1), a_{n-2}/(n-2))
                // Scale this finite normalized sample to the same display box.
                const factor = normalizedScale;
                x = (d.val / d.n) * factor - 50;
                y = (d1.val / d1.n) * factor - 50;
                z = (d2.val / d2.n) * factor - 50;
            } else {
                // Spatiotemporal: (n, a_n, a_{n-1})
                x = d.n * scaleN - 50;
                y = d.val * scaleVal - 50;
                z = d1.val * scaleVal - 50;
            }

            const pos = new THREE.Vector3(x, y, z);
            linePoints.push(pos);

            transform.makeTranslation(x, y, z);
            if (d.op === 'Up') upPoints.setMatrixAt(upCount++, transform);
            else downPoints.setMatrixAt(downCount++, transform);
        }

        upPoints.count = upCount; downPoints.count = downCount;
        upPoints.instanceMatrix.needsUpdate = true; downPoints.instanceMatrix.needsUpdate = true;

        // Update Line
        trajectoryLine.geometry.dispose();
        trajectoryLine.geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    };

    // React to state changes
    state._subscribe((key) => {
        if (key === 'steps') {
            calculateSequence(state.steps);
            updateGeometry();
        }
        if (key === 'mode') {
            updateGeometry();
        }
    });

    // Initial Run
    calculateSequence(state.steps);
    updateGeometry();

    return {
        render: ({ time, dt }) => {
            // Subtle rotation if user isn't interacting
            if (!controls.active) {
                // scene.rotation.y += dt * 0.05;
            }
        },
        stop: () => {
            upGeometry.dispose();
            downGeometry.dispose();
            upMaterial.dispose();
            downMaterial.dispose();
            lineMaterial.dispose();
            trajectoryLine.geometry.dispose();
            grid.dispose();
        }
    };
});

