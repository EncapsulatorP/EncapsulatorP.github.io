/* Gemini contribution · source interactive_visual_im_3fd6497132606067.html
 * Atlas adaptation: see sources.json and the evidence boundary on this page. */

/**
 * Defined threshold recurrence: map, cobweb and finite orbit
 * A speculative branching toy; no physical cosmology claim or return-map derivation.
 */

// 1. Setup App (UI + State)
const { state, ui } = WH.createApp({
    title: "Threshold Map · A Defined Toy",
    params: {
        lambda: { value: 0.85, min: 0.1, max: 1.5, step: 0.01, label: "Multiplier λ" },
        vTh: { value: 2.0, min: 0.5, max: 5.0, step: 0.1, label: "Threshold Vth" },
        vShift: { value: 1.0, min: 0.0, max: 5.0, step: 0.1, label: "Additive shift" },
        x0: { value: 1.5, min: 0.1, max: 10.0, step: 0.1, label: "Initial x" },
        iterations: { value: 50, min: 10, max: 200, step: 1, label: "Iterations (N)" }
    }
});

// 2. Initialize Internal State
state.orbit = [];
state.cobweb = [];
state.functionPoints = [];
state.identityLine = [{x: 0, y: 0}, {x: 20, y: 20}];

// 3. Logic: Dynamical System Solver
function updateCalculations() {
    const { lambda, vTh, vShift, x0, iterations } = state;
    
    // Clear previous data
    const orbit = [];
    const cobweb = [];
    const func = [];
    
    // A. Generate Piecewise Function Data (F(x))
    // We sample densely to visualize jumps
    const resolution = 400;
    const maxX = 20;
    for (let i = 0; i <= resolution; i++) {
        const x = (i / resolution) * maxX;
        const v_minus = lambda * x;
        const parity = Math.floor(v_minus / vTh) % 2;
        let y;
        if (parity === 0) {
            y = 0.5 * v_minus;
        } else {
            y = 3.0 * v_minus + vShift;
        }
        func.push({ x, y, parity });
    }

    // B. Iterative Orbit Mapping
    let currentX = x0;
    let escapeAt = null;
    orbit.push({ n: 0, x: currentX });
    
    // Start cobweb at (x0, 0)
    cobweb.push({ x: currentX, y: 0 });

    for (let n = 1; n <= iterations; n++) {
        const v_minus = lambda * currentX;
        const parity = Math.floor(v_minus / vTh) % 2;
        let nextX;
        
        if (parity === 0) {
            nextX = 0.5 * v_minus;
        } else {
            nextX = 3.0 * v_minus + vShift;
        }
        
        // Preserve the recurrence; stop after recording the first escape above 100.
        const observedNextX = nextX; 
        
        // Cobweb segments: (x_n, x_n) -> (x_n, x_n+1) -> (x_n+1, x_n+1)
        cobweb.push({ x: currentX, y: observedNextX });
        cobweb.push({ x: observedNextX, y: observedNextX });

        currentX = observedNextX;
        orbit.push({ n, x: currentX });
        
        // Break early if we explode significantly beyond chart bounds
        if (!Number.isFinite(currentX) || currentX > 100) { escapeAt = n; break; }
    }

    state.orbit = orbit;
    state.cobweb = cobweb;
    state.functionPoints = func;
    
    // Update HUD stats
    const finalVal = orbit[orbit.length - 1].x;
    ui.setHUD([
        { label: "Last observed x", value: finalVal.toPrecision(4) },
        { label: "Finite run", value: escapeAt === null ? (orbit.length - 1) + " steps shown" : "Left x ≤ 100 at n=" + escapeAt },
        { label: "Branch", value: (Math.floor(lambda * finalVal / vTh) % 2 === 0) ? "Even" : "Odd" }
    ]);
}

// 4. Initialize Visualization
ui.splitViz('55%');

// Return Map (Top)
const updateMap = WH.initPlot('vizTop', (w, h) => ({
    title: "Map window & cobweb trace",
    grid: true,
    inset: 10,
    x: { domain: [0, 20], label: "x_n" },
    y: { domain: [0, 20], label: "x_{n+1}" },
    marks: [
        // Identity Line
        Plot.line(state.identityLine, { x: "x", y: "y", stroke: WH.getColor('--outline'), strokeDasharray: "4,4" }),
        
        // Piecewise Function F(x)
        // We use groups (parity) to ensure jumps are visualized as breaks
        Plot.line(state.functionPoints, { 
            x: "x", 
            y: "y", 
            stroke: WH.getColor('--primary'), 
            strokeWidth: 2,
            z: (d) => Math.floor(state.lambda * d.x / state.vTh) 
        }),
        
        // Cobweb Path
        Plot.line(state.cobweb, { 
            x: "x", 
            y: "y", 
            stroke: WH.getColor('--chart-4'), 
            strokeOpacity: 0.6,
            markerStart: "dot"
        }),
        
        // Current Start Point x0
        Plot.dot([ {x: state.x0, y: 0} ], { x: "x", y: "y", fill: WH.getColor('--negative'), r: 4 }),
        Plot.text([ {x: state.x0, y: 0} ], { x: "x", y: "y", text: d => "Start", dy: 15, fill: WH.getColor('--on-surface-default') })
    ]
}));

// Time Series (Bottom)
const updateSeries = WH.initPlot('vizBottom', (w, h) => ({
    title: "Finite orbit",
    grid: true,
    y: { domain: [0, Math.max(5, ...state.orbit.map(d => d.x * 1.08))], label: "State x" },
    x: { label: "Iteration (n)" },
    marks: [
        Plot.lineY(state.orbit, { 
            x: "n", 
            y: "x", 
            stroke: WH.getColor('--chart-2'), 
            marker: "circle" 
        }),
        Plot.areaY(state.orbit, { 
            x: "n", 
            y: "x", 
            fill: WH.getColor('--chart-2'), 
            fillOpacity: 0.1 
        }),
        // Threshold Line (Reference)
        Plot.ruleY([state.vTh / state.lambda], { 
            stroke: WH.getColor('--chart-3'), 
            strokeDasharray: "2,2",
            title: "First Threshold Jump"
        })
    ]
}));

// 5. Reactivity & Subscriptions
state._subscribe((key) => {
    if (!["lambda", "vTh", "vShift", "x0", "iterations"].includes(key)) return;
    updateCalculations();
    updateMap();
    updateSeries();
});

// Manual trigger for first frame
updateCalculations();
updateMap();
updateSeries();

// Add Instructional Badges
WH.addBadge('analytics', 'Defined recurrence');
WH.addBadge('show_chart', 'Time Evolution');

