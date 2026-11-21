# Gemini’s interactive contributions

The collection now contains **fourteen supplied HTML exports and eleven distinct source widgets**. Nine sources are presented in ten views, each signed **Gemini · [topic]**. The Poincaré cobweb and compact Threshold view share one original source. Repeated torus and helix exports are consolidated.

The restoration recovers the standalone complex-tetration and Recamán-obstruction explorers, restores the Goldbach involution from the inventory, gives the Poincaré exhibit a clearly named route with visible stepping, and strengthens the torus overlap. Every live view links to its unchanged original topic script. Numerical corrections and scope limits appear beside the controls.

## Exhibits

| Exhibit | Preserved contribution | Evidence boundary |
| --- | --- | --- |
| [Complex tetration & sheet jumps](../interactive/complex-tetration.html) | Principal-branch basin palette, white orbit, blue/red stochastic ensemble, all four parameter ranges, complex seed and critical-base presets. | Finite tolerance and escape tests. The sheet-jump experiment is separately specified; finite survival does not prove convergence. |
| [Recamán · holes & Möbius](../interactive/recaman-obstructions.html) | Exact source delay and twisted Möbius coordinates, blue/green point split and red gap loci in the scene. | Exact finite sequence and gap counts in chosen coordinates, without a manifold or topological obstruction theorem. |
| [Goldbach involution](../interactive/goldbach-involution.html) | Original mirror-orbit plot, N range, projection energies E+, E− and ratio ρ. | Exact finite prime-indicator calculations, without a general Goldbach proof. |
| [Poincaré return map & cobweb](../interactive/poincare.html) | Five original parameter ranges, threshold rule, map/cobweb and orbit panels. | A defined return-map specimen, without a derivation from a physical flow. Original capped replay is labeled as a different recurrence. |
| [Bitemporal torus](../interactive/torus.html) | Rotating wireframe, accelerating particle and exact reset rule, with four retained colored pass trails. | Conceptual animation. The overlay shows successive passes, without a physical superposition, monodromy or Riemann-sheet claim. |
| [Goldbach mirror](../interactive/goldbach.html) | Central pole, symmetric radius, prime points, moving arch and pair table. | Exact pair arithmetic over even totals 20–200, without a general Goldbach proof. |
| [The period-three window](../interactive/logistic.html) | Two-panel logistic bifurcation and orbit explorer, parameters and sample counts. | Finite sampling; transient cutoffs and the parameter grid can hide narrow windows or slow approach. |
| [Recamán coordinates](../interactive/recaman.html) | Delay triples, normalized triples, time/value view and separate addition/subtraction colors. | Exact finite sequence in chosen coordinates, without a growth-rate or topology proof. |
| [Threshold branching](../interactive/threshold.html) | Compact piecewise map, cobweb and time series with editable parameters. | Defined speculative toy. The expanded Poincaré view above makes its iteration more visible. |
| [Phase slip & lifted helix](../interactive/phase-slip.html) | Circular path, reset burst, rising helix and accumulated trail. | Comparison of explicit reset/retention rules, not consequences forced by topology. |

## Complex tetration

Recovered source: <code>gemini-code-1795274340354.html</code>. Original defaults: N = 64 updates, p = 0.08, σ = 0.015, M = 24 and c = 1.32 + 0.38i. The rectangle remains Re c in [−3.2, 3.8], Im c in [−2.6, 2.6]. The real presets remain e^(−e) and e^(1/e).

Every path begins at z₀ = c and iterates

\[
z_{n+1}=\exp\!\left(z_n[\ln|c|+i(\arg c+2\pi k_n)]\right).
\]

The white orbit and background use kₙ = 0. Each ensemble path receives **one fixed Gaussian perturbation of its base**, c + σ(ξ + iη). At each update kₙ is independently 0 with probability 1 − p, or −1 and +1 with probability p/2 each. The sheet index is not cumulative; noise is not injected into every state. Amber dots expose sampled nonzero choices.

The original “Convergent” and “Bounded” labels become finite observations: successive-step difference below 10⁻⁴, or no detected escape in N updates. The original radius cutoff |z|² > 10⁸ and exponential-real-part guard > 25 remain. Escape steps are one-based. The source’s near-zero cutoff |c| < 10⁻¹² is described as numerical exclusion; only zero has an undefined logarithm. Perturbed valid bases remain drawable when the nominal base is zero, and survival excludes invalid attempts from its denominator.

The background shows bases c, while orbit vertices are states z on the same complex scale. This distinction appears beside the image. Resizing preserves the random sample. Progressive rasterization and the shared visibility lifecycle keep the view responsive.

The mathematical convergence problem is described by I. N. Baker and P. J. Rippon in [*Convergence of infinite exponentials* (1983)](https://doi.org/10.5186/aasfm.1983.0805). Random sheet choices here are Gemini’s chosen experiment.

## Recamán obstruction explorer

Recovered source: <code>gemini-code-1795274358812.html</code>. The coordinate-only view remains available but no longer substitutes for this distinct explorer. **The original red-hole loci are restored inside both scenes**, with exact source coordinate formulas, modulo-6 offsets and sampling stride.

Red holes are sampled scalar values absent from the finite prefix. Their positions follow illustrative mappings; they are not observed delay triples. The Möbius trajectory wraps by sequence index, while the holes wrap by value divided by the prefix maximum. These distinct mappings are disclosed.

The 2,500-term prefix has maximum 10,163, 8,156 finite holes, smallest hole 19 and 1,242 backward transitions among 2,499 transitions. The source’s “Steps” control becomes “Terms,” and the backward ratio divides by N − 1. The original camera, holes toggle, theme and orbit controls remain. Keyboard controls and a projected Canvas renderer preserve the same coordinates when WebGL is unavailable.

The sequence is named for **Bernardo Recamán Santos**; Gemini is credited for the visualization. The recurrence follows [OEIS A005132](https://oeis.org/A005132).

## Goldbach involution

Recovered from <code>interactive_visual_im_9df25cf48edc7ed6.html</code>, previously an alternate. For the prime indicator P on 1 through N − 1, the original definitions are

\[
E_\pm=\sum_{k=1}^{N-1}\left(\frac{P(k)\pm P(N-k)}2\right)^2,
\qquad \rho=\frac{E_-}{E_++E_-}.
\]

No extra normalization is introduced. With M = π(N − 1) and C = ΣP(k)P(N − k), E± = (M ± C)/2. The folded-orbit table makes multiplicity explicit: off-center orbits have two coordinates, while the midpoint is fixed. If G counts unordered prime pairs and D indicates a prime midpoint, C = 2G − D.

All even totals from 10 through 150 remain selectable. At the original N = 30 the readouts are **8.00, 2.00 and 0.2000**. “Non-prime” replaces “composite” because the displayed vector includes 1. Orbit inspection, the contribution table and exact pair list are additions that leave the energies unchanged.

## Poincaré cobweb and threshold recurrence

The source named its exhibit “Poincaré Map: Threshold Chaos.” The first adaptation folded it into Threshold branching. The dedicated route now restores that visible identity and both plots, with one-leg stepping: vertical to F(x), horizontal to y = x. The latest leg is gold, the revealed trace coral and the map mint.

The exact rule is

\[
F(x)=\begin{cases}
\lambda x/2,&\lfloor\lambda x/V_{\rm th}\rfloor\text{ even},\\
3\lambda x+V_{\rm shift},&\lfloor\lambda x/V_{\rm th}\rfloor\text{ odd}.
\end{cases}
\]

All five original defaults and ranges remain. **Raw recurrence** is the default: record the first value above 100, then stop, or complete N updates. This is a display cutoff, not a divergence or boundedness proof.

**Original capped replay** reproduces the original feedback min(F(x),100). Its original “stop above 100” condition could never trigger. At λ = 1, Vth = 2, shift = 1 and x₀ = 2, the raw orbit is **2 → 7 → 22 → 67 → 202**; capped replay instead gives **2 → 7 → 22 → 67 → 100 → 50 → 100…**. The comparison is labeled as a different recurrence.

“Orbit focus” fits the finite run; “Original 0–20” keeps the supplied window. Separate threshold intervals avoid false connections across jumps. The Poincaré name is retained with an explicit defined-toy boundary; no continuous physical-flow derivation or cosmological result is claimed.

## Torus: make the superposition visible

The torus retains R = 10 and r = 3.5. At v = π, the particle reaches the inner rim, R − r = 6.5 from the symmetry axis, not the hole center.

The chosen rules are m′ = g, w′ = Gm, v′ = w and u′ = s. The original **ordered finite-step update**, event test and pre-reset displayed position are preserved. At the event the counter increments, m and w reset, and v is assigned −π/2. Units are arbitrary.

The original local-z wireframe rotation at 0.05 radians per time unit is restored. Under the source’s Euler rotation it spins the lattice around the same torus surface without changing the recurrence.

Four recent passes remain visible as **thick teal, gold, pink and violet trails**. “Current pass” and “Original view” compare the same running state. **Catch next reset** pauses at the next unchanged event with bright endpoint rings and a dashed connector. The connector represents a prescribed jump, not integrated travel between its endpoints.

The original upload contained one particle and one rotating reference mesh. Retained pass trails are an Atlas visibility addition; the source’s single-path view remains available. WebGL and projected Canvas use the same update function. The bounded trail history is disposed as old passes are replaced.

## Earlier corrections retained

- **Goldbach mirror:** enumerate all integer radii independently of animation frames; include radius zero; label 1 non-prime; fit the number line and provide discrete stepping.
- **Logistic window:** retain 181 parameter values in 3.8–3.9, 500 transient iterations and 60 plotted values per parameter. The selected orbit shows iterations 51–150. Remove hard-coded period/chaos verdicts. The onset r = 1 + √8 is discussed by Cheng Zhang in [*Period Three Begins* (2010)](https://doi.org/10.4169/002557010x521859).
- **Recamán coordinates:** N steps contain N + 1 terms; normalized delay starts at n = 3 to exclude division by zero. Scale from observed finite ratios rather than assuming roughly 2n growth. The control says Coordinates rather than Topology; instancing reduces draw calls.
- **Phase slip:** both modes accumulate at q′ = μ. The circle explicitly resets after a turn; the helix retains height. The supplied mixed per-turn/per-time rates are corrected. The drawn helix is not called a constructed Riemann surface. At most 1,000 positions are retained, camera motion while paused preserves the trace, and the camera follows height.

## Source ledger

The [machine-readable inventory](../interactive/sources.json) records supplied filenames, full-file SHA-256 hashes, duplicate grouping, selections, corrections and original script paths. Original scripts are inspectable text archives, not loaded by live pages.

The three torus files are identical; the two phase-slip files are identical. Goldbach involution is now selected. The coordinate-only twisted Recamán export remains an alternate; the red-hole explorer has its own separately supplied source.

The threshold-burst/Poisson widget remains withheld. Its “High fit” label came from an event-count heuristic, not a goodness-of-fit test; its default can produce no bursts, and resets alter the process. It needs a specified statistical model and valid diagnostic before becoming an evidence-bearing exhibit.

## Runtime, integration and access

The remote widget scaffolds, unused libraries and Gemini message bridge are not executed. Local controls, Canvas rendering and vendored Three.js r146/OrbitControls provide the necessary behavior. The [MIT license](../interactive/vendor/THREE-LICENSE.txt) is included. Exhibit CSP sets connect-src to none; there are no remote fonts, analytics or data calls in the exhibits.

The hub mounts at <code>[data-interactive-space]</code>, loads one selected iframe and removes it when the topic changes. Source-and-origin-checked visibility messages suspend work when the room is hidden, a dialog covers it, the document is hidden or the frame is far offscreen. Embedded pages start inactive until the parent handshake. Back/forward cache restoration retains resources and renegotiates visibility.

Reduced motion starts continuous animations paused. The Poincaré trace starts paused for everyone. Keyboard and pointer controls remain available. The topic chooser supports arrows, Home and End; controls stay in document flow on narrow screens. 3D fallback notes and numerical content remain accessible.

Main deep links use <code>#interactive?topic=</code> followed by complex-tetration, recaman-obstructions, goldbach-involution, poincare, torus, goldbach, logistic, recaman, threshold or phase-slip. The [standalone hub](../interactive/index.html) accepts the same values in <code>?topic=</code>. Every topic also has a standalone HTML route.

## Reproducible verification

| Command | Main gate |
| --- | --- |
| node atlas/verify_goldbach_involution.cjs | All 71 even totals against the original, plus independent sieve/pair and midpoint-count checks. |
| node atlas/verify_recaman_obstructions.cjs | Prefix/gap fixtures at 200, 2,500 and 8,000 terms; 119,376 coordinate components against the original. |
| node atlas/verify_poincare.cjs | Raw escape fixture, cobweb leg order, step/pause/replay; 432 original capped parameter cases. |
| node atlas/verify_complex_tetration.cjs | 7,680 field/RGB samples, 72 seeded original ensemble paths, independent sheet/noise and endpoint checks. |
| node atlas/verify_torus_overlay.cjs | 12,000 source-equivalent frames/90 resets; retained-trail, pause/catch and renderer integration checks. |

These are source-fidelity and implementation checks, not proofs of conjectures. The renderer harnesses exercise geometry and drawing calls; browser pixels and responsive interaction are reviewed separately under <code>qa/</code>.
