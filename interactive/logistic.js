/* Gemini contribution · source interactive_visual_im_33995aba88b532ea.html
 * Atlas adaptation: see sources.json and the evidence boundary on this page. */

/**
 * Logistic Map Bifurcation Explorer
 * Focusing on the Period-three sample window (r: 3.8 to 3.9)
 */

const PRESETS = {
    'r = 3.8100': 3.81,
    'Near onset · 3.8281': 3.8281,
    'Period-three sample': 3.83,
    'Period-six sample': 3.845
};

const resetSim = () => {
    state.r = 3.8281;
    state.preset = 'Near onset · 3.8281';
};

const { state, ui } = WH.createApp({
    title: "Logistic Map Bifurcation Explorer",
    params: {
        r: { value: 3.8281, min: 3.8000, max: 3.9000, step: 0.0001, label: "r parameter" },
        preset: { value: "Near onset · 3.8281", options: ["r = 3.8100", "Near onset · 3.8281", "Period-three sample", "Period-six sample"], label: "Presets" },
        reset: { type: 'button', label: 'Reset', onClick: resetSim }
    },
    editorial: {
        hud: [
            { label: "Current r", value: "3.8281" },
            { label: "Evidence class", value: "Finite sample" }
        ]
    }
});

const { vizTop, vizBottom } = ui.splitViz('60%');

// Internal Data Generation
const generateBifurcation = () => {
    const data = [];
    const steps = 180; // High resolution r-axis
    for (let i = 0; i <= steps; i++) {
        const r = 3.8 + (0.1 * i / steps);
        let x = 0.5;
        // Settle transients
        for (let j = 0; j < 500; j++) {
            x = r * x * (1 - x);
        }
        // Collect points to show attractor density
        for (let j = 0; j < 60; j++) {
            x = r * x * (1 - x);
            data.push({ r, x });
        }
    }
    return data;
};

state.bifurcationData = generateBifurcation();
state.currentOrbit = [];

const updateOrbit = () => {
    const r = state.r;
    let x = 0.5;
    const orbit = [];
    
    // First 50 iterations (transients)
    for (let i = 0; i < 50; i++) {
        x = r * x * (1 - x);
    }
    
    // Next 100 iterations (recorded)
    for (let i = 0; i < 100; i++) {
        x = r * x * (1 - x);
        orbit.push({ n: i + 51, x: x });
    }
    
    state.currentOrbit = orbit;

    // A sampled orbit is not a certified stability classification.
    ui.setEditorial({ hud: [
        {label: 'Current r', value: r.toFixed(4)},
        {label: 'Orbit sample', value: '100 points · burn-in 50'},
        {label: 'Parameter grid', value: '181 r values'}
    ] });
};

// Reactivity
state._subscribe('r', updateOrbit);

state._subscribe('preset', (val) => {
    if (PRESETS[val]) {
        state.r = PRESETS[val];
    }
});

// Sync initial state
updateOrbit();

// Top Visualization: The Bifurcation Diagram
WH.initPlot(vizTop, ({ width, state }) => {
    const data = [...state.bifurcationData];
    const currentR = state.r;

    return {
        width,
        grid: true,
        x: { 
            label: "Control Parameter (r)", 
            domain: [3.8, 3.9],
            ticks: 5
        },
        y: { 
            label: "State x", 
            domain: [0, 1] 
        },
        marks: [
            // Background density
            Plot.dot(data, {
                x: "r",
                y: "x",
                r: 0.5,
                fill: WH.getColor('--on-surface-default'),
                fillOpacity: 0.3
            }),
            // Vertical Indicator Line
            Plot.ruleX([currentR], {
                stroke: WH.getColor('--primary'),
                strokeWidth: 2
            }),
            // Current Attractor Points (Highlight)
            Plot.dot(state.currentOrbit, {
                x: () => currentR,
                y: "x",
                r: 2,
                fill: WH.getColor('--primary')
            })
        ]
    };
});

// Bottom Visualization: The Orbit Time-Series
WH.initPlot(vizBottom, ({ width, state }) => {
    const orbit = [...state.currentOrbit];

    return {
        width,
        grid: true,
        x: { label: "Iteration n (after burn-in)" },
        y: { label: "Value (x)", domain: [0, 1] },
        marks: [
            Plot.lineY(orbit, {
                x: "n",
                y: "x",
                stroke: WH.getColor('--primary'),
                strokeWidth: 1.5,
                curve: "linear"
            }),
            Plot.dot(orbit, {
                x: "n",
                y: "x",
                fill: WH.getColor('--primary'),
                r: 2,
                tip: true
            })
        ]
    };
});
