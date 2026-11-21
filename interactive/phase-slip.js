/* Gemini contribution · source interactive_visual_im_57e7fdb3e8fe183e.html
 * Atlas adaptation: see sources.json and the evidence boundary on this page. */

/**
 * Objective: Compare explicit storage rules on a circle 
 * and a lifted helix.
 */

// 1. Setup App (UI + State)
const { state, ui } = WH.createApp({
    title: "Phase Slip & Lifted Helix",
    params: {
        mode: { value: 'Helix', options: ['Wheel', 'Helix'], label: "Display rule" },
        mu: { value: 0.5, min: 0.1, max: 2.0, label: "Accumulation rate μ" },
        isRunning: { value: true, label: "Running" },
        reset: { type: 'button', label: 'Reset', onClick: (s) => resetSimulation(s) }
    }
});

// 2. Initialize Internal State
state.theta = 0;
state.totalResidue = 0;
state.trailPoints = [];
state.burstParticles = [];
state.omega = 1.0;
state.lastLoopTime = 0;
state.resetSerial = 0;

function resetSimulation(s) {
    s.theta = 0;
    s.totalResidue = 0;
    s.trailPoints = [];
    s.burstParticles = [];
    s.lastLoopTime = 0;
    s.resetSerial = (s.resetSerial || 0) + 1;
}

// Subscribe to mode changes to auto-reset
state._subscribe((key) => {
    if (key === 'mode') resetSimulation(state);
});

// 3. Initialize 3D Engine
WH.initThree('viz', (scene, camera, renderer, controls) => {
    
    // Configure Camera
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // Setup Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Grid / Reference Plane
    const grid = new THREE.GridHelper(10, 10, WH.getColor('--outline'), WH.getColor('--surface-container-highest'));
    grid.position.y = -0.01;
    scene.add(grid);

    // The Main Particle (Actor)
    const actorGeo = new THREE.SphereGeometry(0.15, 32, 32);
    const actorMat = new THREE.MeshStandardMaterial({ color: WH.getColor('--primary') });
    const actor = new THREE.Mesh(actorGeo, actorMat);
    scene.add(actor);

    // Helix/Trail Geometry
    const trailMaterial = new THREE.LineBasicMaterial({ 
        color: WH.getColor('--chart-1'), 
        linewidth: 3 
    });
    let trailLine = new THREE.Line(new THREE.BufferGeometry(), trailMaterial);
    scene.add(trailLine);

    // Wheel Reference Circle (Static)
    const circleGeo = new THREE.TorusGeometry(2, 0.02, 16, 100);
    const circleMat = new THREE.MeshStandardMaterial({ 
        color: WH.getColor('--surface-container-high'),
        transparent: true,
        opacity: 0.3
    });
    const wheelRef = new THREE.Mesh(circleGeo, circleMat);
    wheelRef.rotation.x = Math.PI / 2;
    scene.add(wheelRef);

    // Particle Burst Group
    const burstGroup = new THREE.Group();
    scene.add(burstGroup);
    let lastReset = -1;

    return ({ time, dt, state }) => {
        dt = state.isRunning ? dt : 0;
        if (lastReset !== state.resetSerial) {
            burstGroup.children.slice().forEach(p => { burstGroup.remove(p); p.material.dispose(); });
            lastReset = state.resetSerial;
        }

        const radius = 2.0;

        // 1. Logic Update
        state.theta += state.omega * dt;

        if (state.mode === 'Wheel') {
            // WHEEL MODE: 2D Path
            actor.position.x = radius * Math.cos(state.theta);
            actor.position.y = 0;
            actor.position.z = radius * Math.sin(state.theta);
            
            // Loop Snap & Burst
            if (state.theta >= Math.PI * 2) {
                state.theta %= Math.PI * 2;
                // Trigger Visual Burst
                createBurst(burstGroup, actor.position.clone());
                // Residue is "sacrificed" (resets)
                state.totalResidue = state.mu * state.theta / state.omega;
            } else {
                // Temporary residue that will be lost
                state.totalResidue += state.mu * dt;
            }

            // Hide/Reset Helix visuals
            trailLine.visible = false;
            wheelRef.visible = true;

        } else {
            // HELIX MODE: 3D Path
            state.totalResidue += state.mu * dt;
            
            actor.position.x = radius * Math.cos(state.theta);
            actor.position.y = state.totalResidue; // Z-axis equivalent in Three.js coordinates
            actor.position.z = radius * Math.sin(state.theta);

            // Paused camera movement must not consume the finite trail history.
            if (dt > 0 || state.trailPoints.length === 0) {
                state.trailPoints.push(new THREE.Vector3(actor.position.x, actor.position.y, actor.position.z));
                if (state.trailPoints.length > 1000) state.trailPoints.shift();
                trailLine.geometry.dispose();
                trailLine.geometry = new THREE.BufferGeometry().setFromPoints(state.trailPoints);
            }
            
            trailLine.visible = true;
            wheelRef.visible = false;
        }

        // 2. Particle Burst Physics (Simulated manually for simplicity)
        for (let i = burstGroup.children.length - 1; i >= 0; i--) {
            const p = burstGroup.children[i];
            p.position.add(p.userData.velocity.clone().multiplyScalar(dt));
            p.userData.life -= dt;
            p.material.opacity = p.userData.life;
            if (p.userData.life <= 0) {
                burstGroup.remove(p);
                p.material.dispose();
            }
        }

        // 3. UI Update (HUD)
        ui.setHUD([
            { label: "Display rule", value: state.mode },
            { label: "Stored residue", value: state.totalResidue.toFixed(3) },
            { label: "Phase", value: `${(((state.theta % (Math.PI * 2)) / (Math.PI * 2)) * 360).toFixed(0)}°` }
        ]);

        // Dynamic status text for pedagogical impact
        if (state.mode === 'Wheel') {
            ui.setStatus("Circle: the chosen rule resets stored residue after each complete turn.");
        } else {
            ui.setStatus("Lifted helix: height records accumulated residue at the same rate μ.");
        }

        // Camera follow (optional, keeps helix in view)
        const nextTargetY = THREE.MathUtils.lerp(controls.target.y, state.mode === 'Helix' ? actor.position.y : 0, 0.05);
        camera.position.y += nextTargetY - controls.target.y;
        controls.target.y = nextTargetY;
    };
});

/**
 * Helper to create an outward explosion of particles
 */
const burstGeometry = new THREE.SphereGeometry(0.05, 8, 8);
function createBurst(group, position) {
    const count = 20;
    const geo = burstGeometry;
    for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({ 
            color: WH.getColor('--chart-4'), 
            transparent: true 
        });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(position);
        
        // Random velocity outward
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        p.userData.velocity = new THREE.Vector3(
            Math.cos(angle) * speed,
            (Math.random() - 0.5) * speed,
            Math.sin(angle) * speed
        );
        p.userData.life = 1.0; // Seconds
        
        group.add(p);
    }
}
