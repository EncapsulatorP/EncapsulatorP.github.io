/* Gemini contribution · source interactive_visual_im_2424efeacfe55a9b.html
 * Atlas adaptation: see sources.json and the evidence boundary on this page. */

/**
 * Goldbach Mirror Scan Visualization
 * Logic: Scans a radius 'r' from a center pole 'n'.
 * If (n-r) and (n+r) are both prime, they form a Goldbach pair (2n).
 */

const isPrime = (num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
};

// Initial state and UI setup
const { state, ui } = WH.createApp({
    title: "Goldbach Mirror Scan",
    params: {
        center_n: { value: 15, min: 10, max: 100, step: 1, label: "Center (n)" },
        play: { type: 'play', value: false, label: "Animation" },
        next: { type: 'button', label: 'Next radius', onClick: (s) => { s.play = false; s.current_r = Math.min(s.center_n - 1, Math.floor(s.current_r) + 1); } },
        reset: { type: 'button', label: 'Reset', onClick: (s) => {
            s.current_r = 0;
            s.play = false;
        }}
    },
    editorial: {
        hud: [
            { label: "Current Radius (r)", value: "0" },
            { label: "Prime pairs for 2n", value: "0" }
        ]
    }
});

// Initialize internal tracking
state.current_r = 0;
state.mirror_log = [];
function updatePairs() {
    state.mirror_log = Array.from({length: state.center_n}, (_, r) => ({r, p1: state.center_n-r, p2: state.center_n+r, sum: 2*state.center_n})).filter(pair => isPrime(pair.p1) && isPrime(pair.p2));
}
updatePairs();

// Subscribe to center changes to reset the scan
state._subscribe('center_n', () => {
    state.current_r = 0;
    updatePairs();
});

// Update HUD when state changes
state._subscribe('current_r', (r) => {
    ui.setEditorial({
        hud: [
            { label: "Current Radius (r)", value: Math.floor(r).toString() },
            { label: "Prime pairs for 2n", value: state.mirror_log.length.toString() }
        ]
    });
});

// Split view into Canvas (Top) and Table (Bottom)
const { vizTop, vizBottom } = ui.splitViz('65%');

// Initialize the Data Table
WH.initTable(vizBottom, ({ state }) => {
    return {
        data: state.mirror_log,
        columns: [
            { key: 'r', label: 'Radius (r)', width: '20%' },
            { key: 'p1', label: 'n - r (Prime)', width: '25%' },
            { key: 'p2', label: 'n + r (Prime)', width: '25%' },
            { key: 'sum', label: 'Sum (2n)', width: '30%' }
        ]
    };
});

// Initialize Canvas Visualization
WH.initCanvas(vizTop, ({ ctx, cx, cy, state, width, height }) => {
    
    // Configuration
    const spacing = (width - 44) / (2 * state.center_n);
    const nodeRadius = Math.min(7, Math.max(1.5, spacing * 0.38));
    const scrollSpeed = 2.0; // Radius units per second
    
    ui.setLegend([
        { label: 'Prime', color: '--chart-1' },
        { label: 'Non-prime', color: '--surface-container-highest' },
        { label: 'Prime mirror', color: '--positive' }
    ]);

    return ({ dt, frameCount }) => {
        const n = state.center_n;
        const spacing = (width - 44) / (2 * n);
        const nodeRadius = Math.min(7, Math.max(1.5, spacing * 0.38));
        
        // 1. Update Physics / Animation
        if (state.play) {
            state.current_r += dt * scrollSpeed;
            // Bound r within the possible range [0, n-1]
            if (state.current_r >= n - 1) {
                state.current_r = n - 1;
                state.play = false;
            }
        }

        const rInt = Math.floor(state.current_r);
        const p1 = n - rInt;
        const p2 = n + rInt;

        // The complete pair table is computed independently of animation frames.
        ui.setHUD([{label: 'Current radius r', value: rInt}, {label: 'Prime pairs for 2n', value: state.mirror_log.length}]);

        // 3. Drawing
        const screenN = cx;
        const screenY = cy + 20;

        // Draw the number line background
        ctx.strokeStyle = WH.getColor('--stroke-emphasis');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(width, screenY);
        ctx.stroke();

        // Draw numbers/nodes
        // We calculate which numbers to show based on width and spacing
        const range = Math.ceil(cx / spacing) + 2;
        const startNum = Math.max(1, n - range);
        const endNum = n + range;

        for (let i = startNum; i <= endNum; i++) {
            const x = screenN + (i - n) * spacing;
            const isP = isPrime(i);
            const isCurrentMatch = (i === p1 || i === p2) && isPrime(p1) && isPrime(p2);
            
            // Draw Node
            ctx.beginPath();
            ctx.arc(x, screenY, isP ? nodeRadius : nodeRadius * 0.6, 0, Math.PI * 2);
            
            if (isCurrentMatch) {
                ctx.fillStyle = WH.getColor('--positive');
                ctx.shadowBlur = 10;
                ctx.shadowColor = WH.getColor('--positive');
            } else if (isP) {
                ctx.fillStyle = WH.getColor('--chart-1');
                ctx.shadowBlur = 0;
            } else {
                ctx.fillStyle = WH.getColor('--surface-container-highest');
                ctx.shadowBlur = 0;
            }
            ctx.fill();
            ctx.shadowBlur = 0; // Reset

            // Label the numbers
            if (i === n || i % Math.max(5, Math.ceil(24 / spacing)) === 0 || isCurrentMatch) {
                ctx.font = i === n ? 'bold 12px sans-serif' : '10px sans-serif';
                ctx.fillStyle = WH.getColor('--on-surface-default');
                ctx.textAlign = 'center';
                ctx.fillText(i.toString(), x, screenY + 25);
            }
        }

        // Draw the Center Pole
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = WH.getColor('--on-surface-default');
        ctx.beginPath();
        ctx.moveTo(screenN, screenY - 60);
        ctx.lineTo(screenN, screenY + 10);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText('n = ' + n, screenN, screenY - 70);

        // Draw the Scanning Radius r
        const xLeft = screenN - state.current_r * spacing;
        const xRight = screenN + state.current_r * spacing;

        // Connection Arch
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = (isPrime(p1) && isPrime(p2)) ? WH.getColor('--positive') : WH.getColor('--primary');
        ctx.moveTo(xLeft, screenY);
        ctx.bezierCurveTo(xLeft, screenY - 100, xRight, screenY - 100, xRight, screenY);
        ctx.stroke();

        // Draw the scan pointers
        ctx.fillStyle = WH.getColor('--primary');
        ctx.beginPath();
        ctx.moveTo(xLeft, screenY - 5); ctx.lineTo(xLeft - 5, screenY - 15); ctx.lineTo(xLeft + 5, screenY - 15);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(xRight, screenY - 5); ctx.lineTo(xRight - 5, screenY - 15); ctx.lineTo(xRight + 5, screenY - 15);
        ctx.fill();

        // Tag the discovery
        if (isPrime(p1) && isPrime(p2)) {
            ctx.drawTag(`$${p1} + ${p2} = ${2*n}$`, screenN, screenY - 105);
        } else {
            ctx.drawTag(`r = ${rInt}`, screenN, screenY - 50);
        }
    };
});
