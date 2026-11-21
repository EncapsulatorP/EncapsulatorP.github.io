# Gemini’s interactive contributions

Zolton supplied twelve HTML exports containing nine distinct widgets. This edition selects six subjects and credits each as **Gemini · [topic]**. Each exhibit preserves the supplied visualization idea and the relevant topic code, with corrections documented beside the controls.

The selection adds a dedicated Interactive room and a portable [standalone hub](../interactive/index.html). It complements the existing Atlas, Goldbach and Recamán material. It does not promote a visual pattern to a theorem.

## Selected exhibits

| Exhibit | Preserved contribution | Evidence class and boundary |
| --- | --- | --- |
| [Goldbach mirror](../interactive/goldbach.html) | The central pole, symmetric radius, prime points, moving arch and pair table. | Exact pair arithmetic with a finite search. The supplied center range gives even totals 20–200. No infinitude or general Goldbach proof is claimed. |
| [The period-three window](../interactive/logistic.html) | The two-panel logistic bifurcation and orbit explorer, its parameters and sample counts. | Finite numerical sampling. Transient cutoffs and the parameter grid can hide narrow windows or slow approach. |
| [Recamán coordinates](../interactive/recaman.html) | The original delay triples, normalized triples, time/value view and separate addition/subtraction point colors. | Exact sequence generation in chosen finite coordinates. The picture does not prove a growth rate or a manifold’s topology. |
| [Threshold branching](../interactive/threshold.html) | The piecewise map, cobweb and time series with editable parameters. | A defined speculative toy inspired by Collatz-style branching. No early-dark-energy model or Poincaré return-map derivation is established. |
| [Bitemporal torus](../interactive/torus.html) | The wireframe torus, accelerating particle, changing event colors and reset counter. | Conceptual animation with chosen update rules and arbitrary units. No physical law, monodromy or Riemann-sheet result is claimed. |
| [Phase slip & lifted helix](../interactive/phase-slip.html) | The circular path, reset burst, rising helix and accumulated trail. | Conceptual comparison of explicit storage rules. The reset and retention are imposed by the update rules, not forced by the topology. |

## Mathematical corrections

### Goldbach mirror

The pair table now enumerates all valid integer radii independently of animation frames. A slow frame cannot skip a pair. Radius zero is included, so a prime center retains its valid equal-prime pair. The legend says “Non-prime,” because the drawn number 1 is not composite. The number line scales to the full chosen range and a discrete step control accompanies the original animation.

### Logistic window

The map remains (x_{n+1}=r x_n(1-x_n)), with (x_0=0.5) and (3.8\le r\le3.9). The background retains 181 parameter values, a 500-step transient cutoff and 60 plotted values per parameter. The selected orbit discards 50 steps and displays iterations 51–150.

The supplied automatic “Period-6,” “Full Chaos” and other interval labels were removed. Preset names describe selected examples; the HUD reports the current parameter and finite sample sizes. The onset (r=1+\sqrt8) is discussed in Cheng Zhang’s [*Period Three Begins* (2010)](https://doi.org/10.4169/002557010x521859).

### Recamán coordinates

The sequence is named for Bernardo Recamán Santos; Gemini is credited for this interactive visualization. The recurrence follows [OEIS A005132](https://oeis.org/A005132). An N-step sample contains N + 1 terms, a₀ through a_N. Normalized delay starts at (n=3), preventing the original (a_0/0) coordinate. Its display scale is computed from the selected finite sample instead of assuming approximately linear growth. The control is labeled “Coordinates,” replacing “Topology.” Instanced meshes retain the original point-cloud geometry while reducing draw calls.

### Threshold toy

The rule is explicit:

\[
F(x)=\begin{cases}
\lambda x/2,&\lfloor\lambda x/V_{\rm th}\rfloor\text{ even},\\
3\lambda x+V_{\rm shift},&\lfloor\lambda x/V_{\rm th}\rfloor\text{ odd}.
\end{cases}
\]

The original cap fed `min(F(x), 100)` back into the recurrence, changing the system. The adapted exhibit records the raw next value and stops after its first value above 100 or the selected finite horizon. The HUD reports that observation and avoids a global boundedness/stability verdict. Parameter names no longer suggest an established cosmological interpretation.

### Torus reset toy

The parametric torus is retained with major radius (R=10) and tube radius (r=3.5). At poloidal angle (v=\pi), the particle is on the inner rim, (R-r=6.5) from the symmetry axis. It is not at the hole’s center.

The chosen auxiliary rules are (m'=g), (w'=Gm), (v'=w), and (u'=s). At the prescribed event the counter increments, (m,w) reset, and (v) is assigned (-\pi/2). These are numerical animation rules. The invented physical units and monodromy language were removed. Reset restores the initial event color, and the wireframe stays aligned with the particle coordinates.

### Phase-slip comparison

Both modes now accumulate at the same rate (q'=\mu). The circle mode explicitly resets (q) after a full turn; the helix mode retains it as height. The original comparison mixed an amount per turn with an amount per unit time. The name “Riemann Helix” remains visible in the original source script; the live exhibit uses “lifted helix” because it does not construct a Riemann surface.

The trail retains at most 1,000 sampled positions. Camera interaction while paused leaves the recorded trajectory unchanged. The camera follows increasing height without changing its relative viewing distance.

## Source ledger and alternatives

The [machine-readable inventory](../interactive/sources.json) records every uploaded filename, complete-file SHA-256 hash, duplicate grouping, selection, correction and original topic-script path. The six supplied topic scripts are retained as inspectable `.js.txt` files under `interactive/sources/`; they are not loaded by the live pages.

The three torus files are identical. The two phase-slip files are identical. The alternate Goldbach involution and twisted Recamán coordinate widgets are recorded as alternatives rather than duplicated in this room. The chosen Recamán delay view also links to the existing sequence explorer.

The threshold-burst/Poisson widget is withheld from the live selection. Its “High fit” label came from an event-count heuristic rather than a goodness-of-fit test, its default can produce no bursts, and the reset changes the process being compared. It needs a separately specified statistical model and valid diagnostic before publication as an evidence-bearing exhibit.

## Local runtime and lifecycle

The uploads included two large versions of a shared widget shell, numerous remote libraries, a Gemini message bridge and unused helpers. Those shells are not executed here. A small local adapter provides only the controls, HUD, table, Canvas plot marks and Three.js scene setup needed by the selected topic scripts. Three.js r146 and OrbitControls are vendored locally with the [MIT license](../interactive/vendor/THREE-LICENSE.txt). No external fonts, analytics or remote data calls are made by the exhibit pages; their Content Security Policy sets `connect-src 'none'` and excludes remote scripts.

The hub mounts at `[data-interactive-space]` and loads only its selected iframe. Selecting another topic removes the previous iframe. A source-and-origin-checked message pauses the active exhibit when its room is hidden, a dialog covers it, the document is hidden, or the view is far outside the viewport. Standalone exhibits also suspend offscreen. Iframes begin inactive until the parent confirms visibility.

Reduced-motion preferences start animations paused. Camera controls remain available through pointer and keyboard input. Arrow keys orbit a focused 3D view; plus/minus zoom, and R restores its camera. The topic chooser supports arrows, Home and End. All controls remain in normal document flow on narrow screens.

Back/forward cache transitions pause without disposing the retained renderer. On restoration, embedded pages ask the parent for visibility again. Final teardown disposes the active renderer and controls. Canvas and WebGL failures produce visible fallbacks rather than stopping the surrounding notes and controls.

## Integration

Load `assets/interactive-space.css` before the shared theme and defer `assets/interactive-space.js`. Mount an element with `data-interactive-space` inside the Interactive page. The module replaces its static fallback when it starts.

Main-site deep links use `#interactive?topic=goldbach`, `logistic`, `recaman`, `threshold`, `torus`, or `phase-slip`. The standalone hub accepts the same values as `?topic=…`. The standalone topic pages remain directly addressable.

## Validation scope

The adapted topic scripts were checked independently against direct calculations: every selected Goldbach center; Recamán generation and all three finite coordinate maps; the logistic sample counts and recorded iterations; the threshold rule’s raw first-escape behavior; and paused-helix trail retention. The local runtime also has focused lifecycle checks for initial embedding, origin/source validation, visibility, back/forward cache restoration and rendering fallbacks. These are implementation checks, not proofs of conjectures or conceptual models. Browser layout and interaction review remains a separate publication check.
