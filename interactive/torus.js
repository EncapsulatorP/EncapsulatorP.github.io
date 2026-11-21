/* Gemini contribution · source interactive_visual_im_2a608082e24c9bed.html
 * Atlas adaptation: see sources.json and the evidence boundary on this page. */

/**
 * Bitemporal torus: prescribed reset animation
 * Focus: A chosen accumulation rule, torus coordinates and an explicit reset counter.
 */

// 1. Setup App (UI + State)
const { state, ui } = WH.createApp({
    title: "Bitemporal Torus · Reset Toy",
    params: {
        gravity: { value: 1.5, min: 0.1, max: 5.0, label: "Coupling G (arbitrary units)" },
        growth: { value: 0.8, min: 0.1, max: 3.0, label: "Accumulation rate" },
        speed: { value: 1.2, min: 0.1, max: 4.0, label: "Orbit speed" },
        isPlaying: { value: true, label: "Play/Pause" },
        reset: { type: 'button', label: 'Reset System', onClick: (s) => resetSimulation(s) }
    }
});

// 2. Initialize Internal State
state.kt = 0;              // Reset counter
state.residueMass = 0;     // Accumulated residue
state.temporalVelocity = 0; // Poloidal angular speed
state.v = 0;               // Poloidal angle (0 to PI)
state.u = 0;               // Toroidal angle (0 to 2PI)
state.flashAmount = 0;     // For screen flash event
state.particleColor = WH.getColor('--primary');

// Color scale for sheet changes
const sheetColors = WH.createScale(['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5']);

/**
 * Reset logic for the simulation state
 */
function resetSimulation(s) {
    s.kt = 0;
    s.residueMass = 0;
    s.temporalVelocity = 0;
    s.v = 0;
    s.u = 0;
    s.flashAmount = 0;
}

// 3. Initialize 3D Engine
WH.initThree('viz', (scene, camera, renderer, controls) => {
    // Scene Setup
    const bgColor = new THREE.Color(WH.getColor('--surface'));
    scene.background = bgColor;
    
    // Torus Geometry (Major Radius 10, Minor Radius 3.5)
    const R = 10;
    const r = 3.5;
    const torusGeo = new THREE.TorusGeometry(R, r, 24, 80);
    const torusMat = new THREE.MeshBasicMaterial({ 
        color: WH.getColor('--outline'), 
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 2; // Lay flat
    scene.add(torus);

    // Particle
    const partGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const partMat = new THREE.MeshStandardMaterial({ 
        color: WH.getColor('--primary'),
        emissive: WH.getColor('--primary'),
        emissiveIntensity: 1,
        roughness: 0.1,
        metalness: 0.8
    });
    const particle = new THREE.Mesh(partGeo, partMat);
    scene.add(particle);

    // Light attached to particle
    const partLight = new THREE.PointLight(WH.getColor('--primary'), 100, 20);
    scene.add(partLight);

    // Global Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    camera.position.set(20, 15, 20);
    controls.enableDamping = true;

    // Interaction Hint
    WH.addBadge('3d_rotation', 'Orbit View');

    return ({ time, dt, state }) => {
        dt = state.isPlaying ? dt : 0;
        if (state.kt === 0) {
            partMat.color.set(WH.getColor('--primary'));
            partMat.emissive.set(WH.getColor('--primary'));
            partLight.color.set(WH.getColor('--primary'));
        }

        // --- Chosen update rules ---
        // 1. Mass accumulation
        state.residueMass += state.growth * dt;

        // 2. Chosen acceleration toward the inner rim v = π
        // Velocity increases with mass and gravity constant
        const gravityEffect = state.gravity * state.residueMass;
        state.temporalVelocity += gravityEffect * dt;
        
        // 3. Update angles
        state.v += state.temporalVelocity * dt; // Inward spiral
        state.u += state.speed * dt;           // Orbital spiral

        // 4. Calculate 3D Position
        // Standard torus parametric equations
        // x = (R + r*cos(v)) * cos(u)
        // y = r * sin(v)
        // z = (R + r*cos(v)) * sin(u)
        const rad = R + r * Math.cos(state.v);
        particle.position.x = rad * Math.cos(state.u);
        particle.position.y = r * Math.sin(state.v);
        particle.position.z = rad * Math.sin(state.u);

        // Update light position
        partLight.position.copy(particle.position);

        // --- Prescribed Reset Trigger ---
        // The inner rim is at v = π, at distance R − r from the axis
        if (state.v >= Math.PI) {
            // Trigger Event
            state.kt++;
            state.residueMass = 0;
            state.temporalVelocity = 0;
            state.v = -Math.PI / 2; // Chosen reset to the bottom of the tube
            state.flashAmount = 1.0; // Trigger flash visual
            
            // Update visual properties
            const colorToken = sheetColors((state.kt % 10) / 10);
            const nextColor = WH.getColor(colorToken);
            partMat.color.set(nextColor);
            partMat.emissive.set(nextColor);
            partLight.color.set(nextColor);
        }

        // --- Visual Polish ---
        // Decay flash
        if (state.flashAmount > 0) {
            scene.background = bgColor.clone().lerp(new THREE.Color(WH.getColor('--primary')), Math.max(0, state.flashAmount) * 0.12);
            state.flashAmount -= dt * 2;
        } else {
            scene.background = bgColor;
        }

        // HUD Update
        ui.setHUD([
            { label: "Reset count K", value: state.kt },
            { label: "Accumulated m", value: state.residueMass.toFixed(2) + " a.u." },
            { label: "Angular speed", value: state.temporalVelocity.toFixed(2) + " rad / time unit" }
        ]);

        // Dynamic rotation of the whole system slightly
        // Keep the wireframe aligned with the particle’s torus coordinates.
    };
});
