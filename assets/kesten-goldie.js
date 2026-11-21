/* Kesten–Goldie: visual model, exact lemmas, explanation, and proof route.
 * Mount with <div data-kesten-goldie></div>; multiple instances are supported.
 * Classical sources and the pinned EncapsulatorP experiment are kept distinct.
 * The seeded demonstration is an iid teaching model, not a Collatz trajectory.
 */
(function (global) {
  'use strict';

  const COMMIT = '791f509561d1d4cf77a471e94e808648741858ed';
  const REPO = 'https://github.com/EncapsulatorP/collatz_kesten-goldie';
  const sourceFile = path => REPO + '/blob/' + COMMIT + '/' + path;
  const SIGMA = 0.75;
  const STEPS = 192;
  const SEED = 20261121;
  const SOURCES = Object.freeze([
    { id: 'kesten', name: 'Harry Kesten · 1973', title: 'Random difference equations and renewal theory for products of random matrices', url: 'https://doi.org/10.1007/BF02392040', readUrl: 'https://archive.ymsc.tsinghua.edu.cn/pacm_download/117/6157-11511_2006_Article_BF02392040.pdf', note: 'Original paper, Acta Mathematica 131, 207–248; the iid affine recurrence and perpetuity construction appear at the start.' },
    { id: 'goldie', name: 'Charles M. Goldie · 1991', title: 'Implicit renewal theory and tails of solutions of random equations', url: 'https://doi.org/10.1214/aoap/1177005985', note: 'Original scalar renewal proof, Annals of Applied Probability 1, 126–166. The theorem below is checked against the accessible research papers listed next; the original full text was not accessible during this edition’s check.' },
    { id: 'kevei', name: 'Péter Kevei · 2016', title: 'Implicit renewal theory in the arithmetic case', url: 'https://arxiv.org/abs/1609.07339v1', readUrl: 'https://arxiv.org/pdf/1609.07339v1', note: 'The opening theorem states the nonarithmetic result. Section 2 distinguishes an arithmetic law supported on hℤ from a law on a shifted lattice.' },
    { id: 'alsmeyer', name: 'Gerold Alsmeyer · 2014 preprint', title: 'On the stationary tail index of iterated random Lipschitz functions', url: 'https://arxiv.org/abs/1409.2663v1', readUrl: 'https://www.uni-muenster.de/SFB878/publications/files/phpIyzbmn2357.pdf', note: 'Sections 4.1–4.2 give the implicit-renewal hypotheses, tail constant, and affine specialization.' },
    { id: 'scanner', name: 'EncapsulatorP · recovered scanner', title: 'rboi_kesten_scanner.py', url: sourceFile('rboi_kesten_scanner.py'), note: 'Inspected source: geometric and empirical multiplier moments, exponential additive driver, restart rule, and separate Hill diagnostics. Blob 3bb83fe7a8ad06e4a002e5567e60468883fc777b.' },
    { id: 'saved', name: 'EncapsulatorP · saved output', title: 'scan_results.txt', url: sourceFile('scan_results.txt'), note: 'Original saved values, not rerun by this visual. Blob 2a19f18849231a69f1b72e534dbf65f1bf98794f. README is dated 2 May 2026; results.md labels its run 8 June 2026.' }
  ]);
  const SAVED = Object.freeze([
    { name: '3x+1 · raw', theory: '1.0000', multiplier: '1.0284', tail: '1.2148', count: '270,000' },
    { name: '5x+1 · SSI', theory: '2.7635', multiplier: '2.4342', tail: '2.2193', count: '360,000' },
    { name: '7x+1 · SSI', theory: '0.3429', multiplier: '0.3447', tail: '0.3417', count: '360,000' }
  ]);

  function random(seed) {
    let state = seed >>> 0;
    return function () {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return (state + 0.5) / 4294967296;
    };
  }
  function parameters(kind, kappa) {
    if (kind === 'bounded') return { kind, lower: 0.35, upper: 0.75, mean: 0.55, drift: ((0.75 * Math.log(0.75) - 0.75) - (0.35 * Math.log(0.35) - 0.35)) / 0.4, kappa: null };
    if (kind === 'growth') return { kind, lower: 1.05, upper: 1.15, mean: 1.1, drift: ((1.15 * Math.log(1.15) - 1.15) - (1.05 * Math.log(1.05) - 1.05)) / 0.1, kappa: null };
    const mu = -kappa * SIGMA * SIGMA / 2;
    return { kind: 'bursts', mu, sigma: SIGMA, kappa, mean: Math.exp(mu + SIGMA * SIGMA / 2), drift: mu };
  }
  function moment(p, s) {
    if (p.kind === 'bursts') return Math.exp(p.mu * s + p.sigma * p.sigma * s * s / 2);
    return (Math.pow(p.upper, s + 1) - Math.pow(p.lower, s + 1)) / ((s + 1) * (p.upper - p.lower));
  }
  function geometricMoment(a, s) {
    if (!(a > 0) || !(s > -1)) return NaN;
    return Math.pow(a, s) / (Math.pow(2, s + 1) - 1);
  }
  function pathFor(p, count, seed) {
    const uniform = random(seed === undefined ? SEED : seed);
    const values = [0], multipliers = [];
    for (let n = 0; n < (count === undefined ? STEPS : count); n++) {
      const u = uniform(), v = uniform();
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      const m = p.kind === 'bursts' ? Math.exp(p.mu + p.sigma * z) : p.lower + (p.upper - p.lower) * u;
      multipliers.push(m);
      values.push(m * values[n] + 1);
    }
    return { values, multipliers, seed: seed === undefined ? SEED : seed };
  }
  function fmt(value) {
    if (!Number.isFinite(value)) return '—';
    if (value !== 0 && (Math.abs(value) >= 10000 || Math.abs(value) < 0.001)) return value.toExponential(2);
    return Number(value.toPrecision(4)).toString();
  }

  const api = { sources: SOURCES, savedResults: SAVED, sourceCommit: COMMIT, parameters, moment, geometricMoment, pathFor };
  global.KESTEN_GOLDIE = api;
  if (typeof document === 'undefined') return;

  const NS = 'http://www.w3.org/2000/svg';
  let instance = 0;
  function svgNode(name, attributes, text) {
    const el = document.createElementNS(NS, name);
    Object.entries(attributes || {}).forEach(([key, value]) => el.setAttribute(key, String(value)));
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function style() {
    if (document.getElementById('kg-feature-style')) return;
    const el = document.createElement('style');
    el.id = 'kg-feature-style';
    el.textContent = `
      .kg-feature{--kg-ink:#eaf2fa;--kg-muted:#acc0d3;--kg-line:#365065;--kg-teal:#8de2d4;--kg-amber:#f6c977;--kg-purple:#c4b1f5;color:var(--kg-ink);background:linear-gradient(135deg,#132b37,#172334 62%,#252339);border:1px solid #405867;border-radius:22px;padding:clamp(20px,3vw,38px);margin:28px 0;overflow:hidden;text-align:left}
      .kg-feature *{box-sizing:border-box}.kg-feature [hidden]{display:none!important}.kg-feature h3,.kg-feature h4,.kg-feature h5,.kg-feature p{color:inherit}.kg-feature h3{font-size:clamp(29px,4vw,46px);line-height:1.12;margin:9px 0 15px;letter-spacing:-.035em}.kg-feature h4{font-size:19px;line-height:1.4;margin:0 0 12px}.kg-feature h5{font-size:16px;margin:22px 0 8px}.kg-feature p{font-size:15px;line-height:1.65;margin:0 0 14px}.kg-feature a{color:#b6f2e5;text-decoration:underline;text-underline-offset:3px}.kg-feature a:hover{color:#fff}.kg-eyebrow{font:700 11px/1.4 system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase;color:var(--kg-teal)}
      .kg-intro{max-width:850px}.kg-badges{display:flex;flex-wrap:wrap;gap:7px;margin:18px 0}.kg-badges span{font:600 11px/1.5 system-ui,sans-serif;padding:5px 9px;border:1px solid #567080;border-radius:30px}.kg-badges span:first-child{color:#a4f1d9;border-color:#4d8d80}.kg-controls{display:flex;align-items:end;gap:18px;flex-wrap:wrap;margin:22px 0 18px}.kg-controls label{display:grid;gap:7px;font:600 12px/1.5 system-ui,sans-serif;color:var(--kg-muted)}.kg-controls select,.kg-controls button{font:600 13px/1.3 system-ui,sans-serif;color:var(--kg-ink);background:#233a4b;border:1px solid #648091;border-radius:8px;padding:10px 12px;min-height:42px}.kg-controls button{cursor:pointer;margin-left:auto}.kg-controls input[type=range]{width:180px;accent-color:var(--kg-teal);min-height:26px}.kg-feature :focus-visible{outline:3px solid #ffe09c;outline-offset:4px}.kg-feature output{font-variant-numeric:tabular-nums}
      .kg-visuals{display:grid;grid-template-columns:1.15fr 1fr;gap:20px}.kg-visual{min-width:0;background:#10212d8c;border:1px solid #415665;border-radius:14px;padding:15px}.kg-visual svg{display:block;width:100%;height:auto;touch-action:pan-y;cursor:crosshair}.kg-feature .kg-caption{font-size:12px;line-height:1.6;color:var(--kg-muted);margin:8px 0 0}.kg-feature .kg-inspect{font-size:12px;line-height:1.55;color:#dcf1e9;min-height:38px;margin:8px 0 0;font-variant-numeric:tabular-nums}.kg-step{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:18px 0}.kg-step div{background:#ffffff08;border:1px solid #566274;border-radius:11px;padding:12px}.kg-step small{display:block;color:var(--kg-muted);font:600 10px/1.5 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em}.kg-step strong{display:block;font:600 clamp(16px,2vw,23px)/1.5 system-ui,sans-serif;color:var(--kg-teal);overflow-wrap:anywhere}.kg-step div:nth-child(2) strong{color:var(--kg-amber)}.kg-step div:last-child strong{color:var(--kg-purple)}
      .kg-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 18px}.kg-stats div{border-top:1px solid var(--kg-line);padding-top:12px}.kg-stats dt{font-size:11px;color:var(--kg-muted)}.kg-stats dd{font-size:20px;font-weight:600;margin:4px 0 0;font-variant-numeric:tabular-nums}.kg-feature .kg-model-reading{color:#d5e7e5;font-size:14px;min-height:50px}.kg-levels{margin-top:24px}.kg-levels>details{border-top:1px solid #4b6070;padding:16px 0 4px}.kg-levels>details>summary{cursor:pointer;font-size:17px;font-weight:650;line-height:1.5;min-height:38px;padding:2px 0 10px;color:#ecf5fd}.kg-levels>details>summary::marker{color:var(--kg-teal)}.kg-level-body{padding:8px 0 14px;max-width:1000px}.kg-feature .kg-equation{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:14px;line-height:1.8;white-space:normal;overflow-wrap:anywhere;background:#0b1926b5;padding:13px 16px;border-left:3px solid var(--kg-teal);margin:12px 0 18px}.kg-level-body ul,.kg-level-body ol{padding-left:24px;font-size:14px;line-height:1.7;margin:12px 0 18px}.kg-level-body li{margin:7px 0}.kg-proof-label{font-size:11px;font-weight:700;color:var(--kg-amber);letter-spacing:.06em;text-transform:uppercase}.kg-table-scroll{overflow-x:auto;margin:16px 0}.kg-feature table{width:100%;border-collapse:collapse;min-width:620px;font-size:13px}.kg-feature th,.kg-feature td{padding:10px 12px;border-bottom:1px solid #435767;text-align:left;font-variant-numeric:tabular-nums}.kg-feature th{color:var(--kg-muted);font-weight:600}.kg-feature caption{text-align:left;color:var(--kg-muted);font-size:12px;line-height:1.6;padding:0 0 12px}.kg-source-list li{margin:14px 0}.kg-source-list small{display:block;color:var(--kg-muted);font-size:12px;line-height:1.65;margin-top:3px}.kg-feature .kg-credit{font-size:11px;color:var(--kg-muted);line-height:1.7;margin:20px 0 0}.kg-feature .kg-source-short{font-size:12px;color:var(--kg-muted);margin-top:14px}
      @media(max-width:850px){.kg-visuals{grid-template-columns:1fr}.kg-controls button{margin-left:0}.kg-stats{gap:8px}.kg-stats dd{font-size:17px}}@media(max-width:470px){.kg-feature{padding:18px 14px;border-radius:16px}.kg-step{gap:6px}.kg-step div{padding:9px}.kg-controls{gap:12px}.kg-controls select{max-width:100%}.kg-stats dt{font-size:10px}.kg-stats dd{font-size:15px}}
    `;
    document.head.append(el);
  }

  function detailedContent(id) {
    return `
      <div class="kg-levels">
        <details><summary>01 · Exact lemmas and the established theorem</summary><div class="kg-level-body">
          <h4>Every affine path has an exact expansion.</h4>
          <p>Multiplication passes earlier contributions forward; each new addition starts its own chain of multipliers. This identity works for deterministic sequences as well as random ones.</p>
          <div class="kg-equation">X<sub>n</sub> = (∏<sub>i=1</sub><sup>n</sup> M<sub>i</sub>)X<sub>0</sub> + Σ<sub>j=1</sub><sup>n</sup> Q<sub>j</sub>∏<sub>i=j+1</sub><sup>n</sup> M<sub>i</sub></div>
          <h4>Kesten–Goldie · one positive scalar form</h4>
          <p>Take iid pairs (M<sub>n</sub>, Q<sub>n</sub>), independent of the past, with M &gt; 0 and Q ≥ 0. Assume finite E|log M|, negative E log M, and finite E log<sup>+</sup>Q. Their affine recurrence has a unique stationary law R. For some κ &gt; 0, also require:</p>
          <ul>
            <li>E[M<sup>κ</sup>] = 1, E[M<sup>κ</sup> log<sup>+</sup>M] &lt; ∞, and E[Q<sup>κ</sup>] &lt; ∞.</li>
            <li>The law of log M is nonarithmetic: it is not supported on hℤ for any h &gt; 0.</li>
            <li>No deterministic point is fixed almost surely: P(Mr + Q = r) &lt; 1 for every real r.</li>
          </ul>
          <p>Then the positive stationary tail satisfies the following limit, with a finite, strictly positive constant C:</p>
          <div class="kg-equation">P(R &gt; x) ∼ Cx<sup>−κ</sup> as x → ∞.<br>C = E[(MR + Q)<sup>κ</sup> − (MR)<sup>κ</sup>] / (κ E[M<sup>κ</sup> log M]).</div>
          <p>In the constant formula, R is independent of the fresh pair (M, Q). The result concerns the stationary distribution; it does not say that each evolving path settles to one number. <a href="https://arxiv.org/abs/1609.07339v1" target="_blank" rel="noopener noreferrer">Theorem and arithmetic distinction</a> · <a href="https://arxiv.org/abs/1409.2663v1" target="_blank" rel="noopener noreferrer">Tail constant, §4</a>.</p>
          <h4>The visual’s exact solvable example</h4>
          <p>For independent standard normal Z<sub>n</sub>, set M<sub>n</sub> = exp(μ + σZ<sub>n</sub>) and Q<sub>n</sub> = 1, with μ &lt; 0 and σ &gt; 0. All the stated hypotheses hold.</p>
          <div class="kg-equation">E[M<sup>s</sup>] = exp(μs + ½σ²s²), &nbsp; s ∈ ℝ.<br>κ = −2μ/σ² &gt; 0. &nbsp; E[M] = 1 ⇔ κ = 1.</div>
          <p>The case κ = 1 is still stationary. Its stationary mean is infinite; no extra logarithmic factor follows merely from E[M] = 1.</p>
          <h4>The scanner’s geometric comparison is also exact algebra.</h4>
          <p>Under the specified comparison law P(K = k) = 2<sup>−k</sup>, k ≥ 1, put M = a2<sup>−K</sup>. The scanner sets a = r in its raw version and a = r/2 in its SSI version.</p>
          <div class="kg-equation">E[M<sup>s</sup>] = a<sup>s</sup> / (2<sup>s+1</sup> − 1), &nbsp; s &gt; −1.<br>E log M = log(a/4), &nbsp; E[M] = a/3, &nbsp; M<sub>max</sub> = a/2.</div>
          <p>A unique positive moment root exists precisely when 2 &lt; a &lt; 4. At a = 3 it is κ = 1. A root is an exact property of this multiplier law; applying the tail theorem still requires its other hypotheses. If log₂a is irrational, log M is nonarithmetic in the sense used above.</p>
        </div></details>
        <details><summary>02 · What the model shows, and what the Collatz experiment measures</summary><div class="kg-level-body">
          <h4>A shrinking product can coexist with large bursts.</h4>
          <p>The average of log M controls the long product M₁⋯Mₙ. When it is negative, old contributions are eventually forgotten. Fresh additions keep arriving. A run of multipliers above one can amplify several contributions together, leaving rare large values in an otherwise stable distribution.</p>
          <p>The curve on the right answers a different question: how strongly does multiplication weight an s-th power? It begins at E[M⁰] = 1. Under negative log drift it first falls. If large multipliers can overcome that contraction, it rises back to one at κ. The theorem turns that moment balance into a tail statement under its hypotheses.</p>
          <p>The uniform contraction example uses 0.35 ≤ M ≤ 0.75 and Q = 1, so X₀ = 0 gives Xₙ ≤ 4 for every n. The growth example uses M ≥ 1.05 and Q = 1, so every path diverges. Neither statement needs a fitted curve.</p>
          <h4>The recovered experiment is a hybrid affine process.</h4>
          <p>The scanner obtains K from integer r·m + 1 orbits, restarts the integer state at 1 or a size limit, and drives Δ with independent exponential additions. It keeps Δ when the integer state restarts. Those choices define the experiment; Δ is not the integer orbit or a stopping time.</p>
          <div class="kg-equation">Kₙ = v₂(rmₙ + 1), &nbsp; mₙ₊₁ = (rmₙ + 1)/2<sup>Kₙ</sup><br>Δₙ₊₁ = a2<sup>−Kₙ</sup>Δₙ + Qₙ, &nbsp; Qₙ ∼ Exp(1).</div>
          <p>Three quantities deserve separate columns. The theoretical root uses the chosen geometric law. The empirical moment root solves the same equation using the sampled multipliers. The tail fit is measured from the simulated Δ values.</p>
          <div class="kg-table-scroll"><table><caption>Saved source output · no historical scanner rerun in this visual. The last numeric column fits the largest 5% of positive Δ samples.</caption><thead><tr><th scope="col">Source case</th><th scope="col">Geometric-law κ</th><th scope="col">Sample-moment κ</th><th scope="col">Tail-fit exponent</th><th scope="col">K samples</th></tr></thead><tbody>${SAVED.map(row => `<tr><th scope="row">${row.name}</th><td>${row.theory}</td><td>${row.multiplier}</td><td>${row.tail}</td><td>${row.count}</td></tr>`).join('')}</tbody></table></div>
          <p>The 7x+1 SSI run gives a close three-way comparison. The 5x+1 SSI row retains a visible gap. In the saved 3x+1 raw experiment, shuffling or independently resampling K did not produce the hoped-for large separation over that horizon. These are useful finite results; they do not verify an iid law for deterministic Collatz dynamics.</p>
          <p>“Reported computation” describes the saved application results. The classical theorem and the algebra above have their own exact status. Threshold stability, dependence, restart sensitivity, and the chosen additive driver are the next questions for this particular application.</p>
          <p><a href="${sourceFile('rboi_kesten_scanner.py')}" target="_blank" rel="noopener noreferrer">Inspect the recurrence and sampling code</a> · <a href="${sourceFile('scan_results.txt')}" target="_blank" rel="noopener noreferrer">Read the saved output</a> · <a href="${sourceFile('results.md')}" target="_blank" rel="noopener noreferrer">Recovered interpretation and open questions</a>.</p>
        </div></details>
        <details><summary>03 · Proofs, the renewal argument, and original sources</summary><div class="kg-level-body">
          <h4>Proof of the finite expansion</h4>
          <p>For n = 1 the formula is X₁ = M₁X₀ + Q₁. Multiply the n-step expression by Mₙ₊₁ and add Qₙ₊₁. Each existing product gains the same last factor, and the new term is the empty product times Qₙ₊₁. This proves the identity by induction.</p>
          <h4>Why the stationary series exists</h4>
          <p>Write μ = E log M &lt; 0 and choose 0 &lt; ε &lt; −μ/2. The strong law gives ∏ᵢ₌₁ⁿMᵢ ≤ exp((μ + ε)n) eventually, almost surely. The integrability of log<sup>+</sup>Q implies ΣₙP(log<sup>+</sup>Q &gt; εn) &lt; ∞. Borel–Cantelli therefore gives Qₙ ≤ exp(εn) eventually. The following terms are bounded eventually by a convergent geometric series:</p>
          <div class="kg-equation">R = Q₁ + M₁Q₂ + M₁M₂Q₃ + ⋯.</div>
          <p>Separating its first term gives R =<sub>d</sub> Q + MR′, with R′ an independent copy. This supplies a stationary law. Two recurrences driven by the same fresh pairs have difference (M₁⋯Mₙ)(X₀ − Y₀), which tends to zero. Reversing the order of finitely many iid pairs identifies the forward law with the finite series law, so every fixed starting value converges in distribution to R. The same coupling gives uniqueness among stationary laws. This is convergence of distributions, not pointwise convergence of the forward path.</p>
          <h4>Proofs for the plotted moments and boundaries</h4>
          <p>Completing the square in the standard normal integral gives E exp(tZ) = exp(t²/2). Substituting t = σs yields the displayed lognormal moment. Its logarithm is s(μ + σ²s/2), so its nonzero root is −2μ/σ². At κ = 1, a tail C/x makes E[R] = ∫₀<sup>∞</sup>P(R &gt; x)dx diverge.</p>
          <p>For the geometric model, sum Σₖ≥₁2<sup>−k</sup>a<sup>s</sup>2<sup>−ks</sup>. This geometric series converges for s &gt; −1 and gives the displayed fraction. At s = 0 its derivative is log(a/4). For 2 &lt; a &lt; 4 this derivative is negative, while the moment tends to infinity as s grows. Strict convexity gives exactly one positive crossing. If a ≤ 2 every multiplier is at most one, so the moment stays below one for s &gt; 0. If a ≥ 4, convexity and the nonnegative initial derivative preclude a positive crossing.</p>
          <p>For the uniform contraction path, induction gives Xₙ ≤ Σⱼ₌₀ⁿ⁻¹(3/4)ʲ ≤ 4. For the growth path, Xₙ ≥ Σⱼ₌₀ⁿ⁻¹(1.05)ʲ, which diverges. The value of Q matters: a heavy-tailed additive input can produce a heavy tail even when all multipliers contract.</p>
          <h4>Goldie’s renewal proof route</h4>
          <p class="kg-proof-label">Proof outline · the full renewal theorem is cited below</p>
          <p>Set F(t) = exp(κt)P(R &gt; exp(t)) and tilt the law of Y = log M by the weight M<sup>κ</sup>. The root equation makes this tilted law a probability measure; its mean is E[M<sup>κ</sup> log M] &gt; 0.</p>
          <div class="kg-equation">ψ(t) = exp(κt){P(MR + Q &gt; exp(t)) − P(MR &gt; exp(t))}<br>F(t) = ψ(t) + ∫ F(t − y) ν<sub>κ</sub>(dy).</div>
          <p>Iterating this renewal equation, smoothing its forcing term, and applying the nonarithmetic renewal theorem yields a limit. Removing the smoothing recovers the tail limit. Integrating ψ with the substitution x = exp(t) gives E[(MR + Q)<sup>κ</sup> − (MR)<sup>κ</sup>]/κ; division by the tilted mean gives C. The integrability and nondegeneracy conditions above are what make these steps valid and the final constant positive.</p>
          <p>The original theorem predates this atlas. Kesten’s 1973 work developed the random difference-equation result, with contributions by Grincevičius in the 1970s; Goldie’s 1991 scalar implicit-renewal treatment supplies the proof route used here. Arithmetic cases require their own statement and can retain a logarithmically periodic factor.</p>
          <ol class="kg-source-list">${SOURCES.map(source => `<li id="${id}-source-${source.id}"><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.name} · ${source.title}</a>${source.readUrl ? ` · <a href="${source.readUrl}" target="_blank" rel="noopener noreferrer">Read paper</a>` : ''}<small>${source.note}</small></li>`).join('')}</ol>
          <h4>Reproduce this teaching path</h4>
          <p>The browser uses IEEE-754 doubles, X₀ = 0, Qₙ = 1, 192 steps, seed 20261121, a 32-bit linear congruential generator, and a Box–Muller normal transform. No burn-in or tail fitting is used for the teaching path. Parameters change only when a reader changes a control. The moving marker travels through already computed values.</p>
          <p>The source exposes <code>KESTEN_GOLDIE.parameters(kind, κ)</code>, <code>pathFor(parameters, steps, seed)</code>, and <code>moment(parameters, s)</code> for inspection. The browser’s finite demonstration illustrates the mechanism; the exact formulas and cited theorem supply the infinite-law statements.</p>
        </div></details>
      </div>`;
  }

  function mount(host) {
    if (!host || host.dataset.kgMounted) return null;
    host.dataset.kgMounted = 'true';
    style();
    const id = 'kg-' + (++instance);
    const feature = document.createElement('section');
    feature.className = 'kg-feature';
    feature.setAttribute('aria-labelledby', id + '-title');
    feature.innerHTML = `
      <div class="kg-intro"><span class="kg-eyebrow">Kesten–Goldie / a mechanism you can see</span><h3 id="${id}-title">Small most of the time.<br>Large once in a while.</h3><p>Multiply what is already there. Add something fresh. Repeat. A system can forget its starting point while occasional bursts give its stationary distribution a heavy tail.</p></div>
      <div class="kg-badges"><span>Established theorem</span><span>Exact comparison algebra</span><span>Reported Collatz experiment</span></div>
      <div class="kg-controls"><label for="${id}-model">Explore the mechanism<select id="${id}-model"><option value="bursts">Contraction with occasional bursts</option><option value="bounded">Every multiplier contracts</option><option value="growth">Every multiplier expands</option></select></label><label for="${id}-kappa" class="kg-kappa-control">Tail index κ · <output id="${id}-kappa-value" for="${id}-kappa">1.10</output><input id="${id}-kappa" type="range" min="0.35" max="3" step="0.05" value="1.1"></label><button id="${id}-motion" type="button" aria-pressed="false">Pause gentle motion</button></div>
      <div class="kg-visuals"><figure class="kg-visual" style="margin:0"><h4>Watch one path</h4><svg id="${id}-path" viewBox="0 0 720 270" role="group" tabindex="0" aria-label="Inspect the illustrative affine path" aria-describedby="${id}-path-help"></svg><p class="kg-inspect" id="${id}-step-readout" aria-live="off"></p><figcaption class="kg-caption" id="${id}-path-help">Move over the path to inspect a step. Keyboard: Left and Right arrows; Home and End. Vertical scale: log(1 + X). Seeded iid teaching model; 192 updates, not a Collatz orbit.</figcaption></figure><figure class="kg-visual" style="margin:0"><h4>Find the moment balance</h4><svg id="${id}-moment" viewBox="0 0 720 270" role="group" tabindex="0" aria-label="Inspect the exact moment curve" aria-describedby="${id}-moment-help"></svg><p class="kg-inspect" id="${id}-moment-readout" aria-live="off"></p><figcaption class="kg-caption" id="${id}-moment-help">The horizontal line is E[Mˢ] = 1. Move over the curve, or use Left and Right arrows, to inspect an exponent s. This curve is calculated from the exact law, not fitted to the path.</figcaption></figure></div>
      <div class="kg-step" aria-label="The selected affine update"><div><small>Amount before the update</small><strong id="${id}-before"></strong></div><div><small>Multiply by M</small><strong id="${id}-multiplier"></strong></div><div><small>Add 1 · new amount</small><strong id="${id}-after"></strong></div></div>
      <dl class="kg-stats"><div><dt>Typical product drift · E log M</dt><dd id="${id}-drift"></dd></div><div><dt>Mean multiplier · E[M]</dt><dd id="${id}-mean"></dd></div><div><dt>Positive moment root · κ</dt><dd id="${id}-root"></dd></div></dl>
      <p class="kg-model-reading" id="${id}-reading"></p><p class="kg-source-short">Theorem: <a href="https://doi.org/10.1007/BF02392040" target="_blank" rel="noopener noreferrer">Kesten, 1973</a> · <a href="https://doi.org/10.1214/aoap/1177005985" target="_blank" rel="noopener noreferrer">Goldie, 1991</a>. EncapsulatorP’s Collatz application and its saved measurements are explained below.</p>
      ${detailedContent(id)}
      <p class="kg-credit">Research direction and recovered experiments: Zolton / EncapsulatorP. Visual explanation, elementary derivations and source check: this ChatGPT atlas edition. Classical theorem credit remains with its original authors.</p>`;
    host.append(feature);
    const get = suffix => feature.querySelector('#' + id + '-' + suffix);
    const modelControl = get('model'), kappaControl = get('kappa'), motionButton = get('motion');
    const pathSvg = get('path'), momentSvg = get('moment');
    const preference = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let paused = Boolean(preference && preference.matches), visible = false, frame = 0, lastTime = 0;
    let phase = 0, interacting = false, focusWithinPlot = false, selectedStep = 1, selectedS = 0;
    let p, sample, pathMarker, pathHover, momentMarker, xPath, yPath, xMoment, yMoment, sMax;

    function updateMotionButton() {
      motionButton.textContent = paused ? 'Resume gentle motion' : 'Pause gentle motion';
      motionButton.setAttribute('aria-pressed', String(paused));
    }
    function inspectStep(n) {
      selectedStep = Math.max(1, Math.min(STEPS, Math.round(n)));
      const before = sample.values[selectedStep - 1], m = sample.multipliers[selectedStep - 1], after = sample.values[selectedStep];
      get('before').textContent = fmt(before);
      get('multiplier').textContent = '× ' + fmt(m);
      get('after').textContent = fmt(after);
      get('step-readout').textContent = 'Update ' + selectedStep + ': ' + fmt(before) + ' × ' + fmt(m) + ' + 1 = ' + fmt(after) + (m > 1 ? ' · amplification' : ' · contraction');
      pathHover.setAttribute('cx', xPath(selectedStep)); pathHover.setAttribute('cy', yPath(after));
      pathSvg.setAttribute('aria-label', 'Illustrative affine path. ' + get('step-readout').textContent);
    }
    function inspectMoment(s) {
      selectedS = Math.max(0, Math.min(sMax, s));
      const value = moment(p, selectedS);
      momentMarker.setAttribute('cx', xMoment(selectedS)); momentMarker.setAttribute('cy', yMoment(value));
      get('moment-readout').textContent = 's = ' + selectedS.toFixed(2) + ' · E[Mˢ] = ' + fmt(value) + (Math.abs(value - 1) < 1e-8 ? ' · balance' : value < 1 ? ' · below one' : ' · above one');
      momentSvg.setAttribute('aria-label', 'Exact moment curve. ' + get('moment-readout').textContent);
    }
    function chartFrame(svg, title, desc) {
      svg.replaceChildren(svgNode('title', {}, title), svgNode('desc', {}, desc));
      svg.append(svgNode('path', { d: 'M57 18V225H699', fill: 'none', stroke: '#7892a5', 'stroke-width': 1 }));
    }
    function drawPath() {
      chartFrame(pathSvg, 'Finite affine path: X next equals M times X plus one', '192 seeded updates. The vertical coordinate is log of one plus the amount.');
      const logMax = Math.max(1, ...sample.values.map(Math.log1p)) * 1.1;
      xPath = n => 57 + 642 * n / STEPS;
      yPath = x => 225 - 200 * Math.log1p(x) / logMax;
      for (let tick = 0; tick <= 3; tick++) {
        const logValue = logMax * tick / 3, y = 225 - 200 * tick / 3;
        pathSvg.append(svgNode('line', { x1: 57, x2: 699, y1: y, y2: y, stroke: '#3d5262', 'stroke-dasharray': '2 5' }));
        pathSvg.append(svgNode('text', { x: 49, y: y + 4, fill: '#bbcedb', 'text-anchor': 'end', 'font-size': 12 }, fmt(Math.expm1(logValue))));
      }
      [0, 48, 96, 144, 192].forEach(n => pathSvg.append(svgNode('text', { x: xPath(n), y: 248, fill: '#bbcedb', 'text-anchor': 'middle', 'font-size': 12 }, String(n))));
      const d = sample.values.map((value, n) => (n ? 'L' : 'M') + xPath(n).toFixed(2) + ' ' + yPath(value).toFixed(2)).join(' ');
      pathSvg.append(svgNode('path', { d, fill: 'none', stroke: '#8de2d4', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }));
      pathMarker = svgNode('circle', { r: 5, fill: '#ffe0a0', stroke: '#172a39', 'stroke-width': 2, 'aria-hidden': 'true' });
      pathHover = svgNode('circle', { r: 6, fill: '#152837', stroke: '#c4b1f5', 'stroke-width': 2.5, 'aria-hidden': 'true' });
      pathSvg.append(pathMarker, pathHover);
      placeTravelMarker();
    }
    function drawMoment() {
      chartFrame(momentSvg, 'Exact multiplier moment as a function of exponent s', 'The positive crossing of moment one is the Kesten–Goldie candidate exponent.');
      sMax = p.kind === 'bursts' ? Math.max(2.3, p.kappa + 0.9) : 3;
      const samples = Array.from({ length: 161 }, (_, i) => [sMax * i / 160, moment(p, sMax * i / 160)]);
      const logValues = samples.map(point => Math.log(point[1]));
      const low = Math.min(-0.25, ...logValues) - 0.12, high = Math.max(0.25, ...logValues) + 0.12;
      xMoment = s => 57 + 642 * s / sMax;
      yMoment = value => 225 - 200 * (Math.log(value) - low) / (high - low);
      const oneY = yMoment(1);
      momentSvg.append(svgNode('line', { x1: 57, x2: 699, y1: oneY, y2: oneY, stroke: '#edcf94', 'stroke-width': 1.3, 'stroke-dasharray': '6 5' }));
      momentSvg.append(svgNode('text', { x: 49, y: oneY + 4, fill: '#edcf94', 'text-anchor': 'end', 'font-size': 12 }, '1'));
      for (let tick = 0; tick <= 4; tick++) {
        const s = sMax * tick / 4;
        momentSvg.append(svgNode('text', { x: xMoment(s), y: 248, fill: '#bbcedb', 'text-anchor': 'middle', 'font-size': 12 }, s.toFixed(1)));
      }
      const d = samples.map(([s, value], i) => (i ? 'L' : 'M') + xMoment(s).toFixed(2) + ' ' + yMoment(value).toFixed(2)).join(' ');
      momentSvg.append(svgNode('path', { d, fill: 'none', stroke: '#c4b1f5', 'stroke-width': 2.6 }));
      if (p.kappa !== null) {
        momentSvg.append(svgNode('line', { x1: xMoment(p.kappa), x2: xMoment(p.kappa), y1: oneY, y2: 225, stroke: '#8de2d4', 'stroke-dasharray': '3 5' }));
        momentSvg.append(svgNode('circle', { cx: xMoment(p.kappa), cy: oneY, r: 5, fill: '#8de2d4' }));
        momentSvg.append(svgNode('text', { x: xMoment(p.kappa) + 10, y: oneY - 12, fill: '#b7f5e8', 'font-size': 13 }, 'κ = ' + p.kappa.toFixed(2)));
      }
      momentSvg.append(svgNode('text', { x: 697, y: 267, fill: '#bbcedb', 'text-anchor': 'end', 'font-size': 11 }, 'exponent s · log vertical scale'));
      momentMarker = svgNode('circle', { r: 5, fill: '#ffe0a0', stroke: '#152837', 'stroke-width': 2, 'aria-hidden': 'true' });
      momentSvg.append(momentMarker);
    }
    function placeTravelMarker() {
      if (!pathMarker) return;
      const n = phase % STEPS, i = Math.floor(n), fraction = n - i;
      const y0 = yPath(sample.values[i]), y1 = yPath(sample.values[i + 1]);
      pathMarker.setAttribute('cx', xPath(n));
      pathMarker.setAttribute('cy', y0 + (y1 - y0) * fraction);
    }
    function draw() {
      p = parameters(modelControl.value, Number(kappaControl.value));
      sample = pathFor(p);
      feature.querySelector('.kg-kappa-control').hidden = p.kind !== 'bursts';
      get('kappa-value').value = Number(kappaControl.value).toFixed(2);
      get('drift').textContent = fmt(p.drift);
      get('mean').textContent = fmt(p.mean);
      get('root').textContent = p.kappa === null ? 'No positive root' : p.kappa.toFixed(2);
      get('reading').textContent = p.kind === 'bursts'
        ? 'This iid model uses log M = μ + 0.75Z, with Z standard normal, μ = ' + fmt(p.mu) + ', and Q = 1. Its stationary tail exponent is exactly κ = ' + p.kappa.toFixed(2) + '. ' + (p.kappa > 1 ? 'Its stationary mean is finite.' : 'Its stationary mean is infinite, while the stationary distribution still exists.')
        : p.kind === 'bounded' ? 'Every multiplier lies between 0.35 and 0.75. With an addition of one each step and a zero start, the amount stays at or below four. There is no multiplicative power-tail mechanism in this bounded example.'
          : 'Every multiplier lies between 1.05 and 1.15. Each update expands the existing amount and adds one, so this process grows without bound. This example has no finite stationary distribution on the nonnegative line.';
      phase = 0;
      drawPath(); drawMoment(); inspectStep(selectedStep); inspectMoment(p.kappa === null ? 1 : p.kappa);
    }
    function tick(now) {
      frame = 0;
      if (!visible || paused || document.hidden || interacting || focusWithinPlot) { lastTime = 0; return; }
      if (lastTime) phase = (phase + Math.min(now - lastTime, 100) / 110) % STEPS;
      lastTime = now; placeTravelMarker(); frame = global.requestAnimationFrame(tick);
    }
    function refreshAnimation() {
      if (frame) global.cancelAnimationFrame(frame);
      frame = 0; lastTime = 0;
      if (visible && !paused && !document.hidden && !interacting && !focusWithinPlot) frame = global.requestAnimationFrame(tick);
    }
    function pointerFraction(svg, event) {
      const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
      const matrix = svg.getScreenCTM();
      if (!matrix) return 0;
      const x = point.matrixTransform(matrix.inverse()).x;
      return Math.max(0, Math.min(1, (x - 57) / 642));
    }
    pathSvg.addEventListener('pointermove', event => { interacting = true; inspectStep(pointerFraction(pathSvg, event) * STEPS); refreshAnimation(); });
    momentSvg.addEventListener('pointermove', event => { interacting = true; inspectMoment(pointerFraction(momentSvg, event) * sMax); refreshAnimation(); });
    [pathSvg, momentSvg].forEach(svg => {
      svg.addEventListener('pointerleave', () => { interacting = false; refreshAnimation(); });
      svg.addEventListener('pointercancel', () => { interacting = false; refreshAnimation(); });
      svg.addEventListener('focus', () => { focusWithinPlot = true; refreshAnimation(); });
      svg.addEventListener('blur', () => { focusWithinPlot = false; refreshAnimation(); });
    });
    pathSvg.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      inspectStep(event.key === 'Home' ? 1 : event.key === 'End' ? STEPS : selectedStep + (event.key === 'ArrowLeft' ? -1 : 1));
    });
    momentSvg.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      inspectMoment(event.key === 'Home' ? 0 : event.key === 'End' ? sMax : selectedS + (event.key === 'ArrowLeft' ? -0.05 : 0.05));
    });
    modelControl.addEventListener('change', draw);
    kappaControl.addEventListener('input', draw);
    motionButton.addEventListener('click', () => { paused = !paused; updateMotionButton(); refreshAnimation(); });
    if (preference && preference.addEventListener) preference.addEventListener('change', event => { if (event.matches) paused = true; updateMotionButton(); refreshAnimation(); });
    document.addEventListener('visibilitychange', refreshAnimation);
    draw(); updateMotionButton();
    if ('IntersectionObserver' in global) {
      const observer = new global.IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); refreshAnimation(); }, { threshold: 0.05 });
      observer.observe(pathSvg);
    } else {
      visible = true; refreshAnimation();
    }
    return { host, feature, draw, pause() { paused = true; updateMotionButton(); refreshAnimation(); } };
  }
  function mountAll(scope) { return Array.from((scope || document).querySelectorAll('[data-kesten-goldie]')).map(mount).filter(Boolean); }
  api.mount = mount; api.mountAll = mountAll;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mountAll());
  else mountAll();
})(typeof window !== 'undefined' ? window : globalThis);
