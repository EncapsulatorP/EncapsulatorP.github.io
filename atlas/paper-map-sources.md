# Paper-map trail and sources

This page records the content and attribution behind `assets/pirate-map-data.js`. The map keeps the nine landmarks from the earlier pirate-map trail. Each `href` opens a subject explanation within the atlas; the separately labeled `repository` link opens supporting source material.

The trail dates identify the recovered conversation periods or edition context already recorded in the map. They are not claims about when a mathematical fact was first discovered. The pins are editorial navigation positions: their height, distance and placement do not encode research measurements.

## Reading the three markers

- **Treasure:** the particular exact claim stated on the landmark. The label does not certify every conjecture in the surrounding research program.
- **Trap:** a counterexample or a failed inference, with its scope stated in the clue. A tunable numerical match can be real while the inferred arithmetic connection remains unsupported.
- **Wildcard:** an open exploration. An exact ingredient or a finite evaluation may support the experiment without resolving its larger question.

## The nine landmarks

| Landmark | Subject destination | Scope and source |
| --- | --- | --- |
| Shuffle the signal | `#atlas?entry=tower-hadamard` | The normalized finite Fourier matrix is unitary exactly when its row indices are distinct modulo N. A tower recipe still has to pass this permutation criterion. [Written derivation](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/atlas/recovered-bridges.md#tower-hadamard); catalog entry `tower-hadamard`. |
| The forty-eight lanes | `#atlas?entry=wheel-210` | Exactly 48 remainder classes are coprime to 210. They contain every prime above 7 and also composites such as 121. [PTP-210 source](https://github.com/EncapsulatorP/Periodic-Table-of-Primes-210/blob/main/README.md); catalog entry `wheel-210`. |
| The impossible coastline | `#buried-complex-collatz` | A sine perturbation preserves the displayed map at integers while its off-integer dynamics may change. The geometric robustness question stays open. [Integer-spine argument](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/atlas/mathematical-notes.md#collatz-integer-spine); catalog entry `collatz-integer-spine` and the matching story in `index.html`. The destination is the explanation, replacing the earlier direct jump to `#scape`. |
| The missing term | `#buried-collatz-riemann-reversal` | For one fixed positive integer n, a change of coefficient contributes a constant times exp(−s log n), an entire function of s. It cannot introduce a singularity by itself. The complete argument is in the existing story in `index.html`. The secondary link is labeled **Atlas source repository**; no separate original project repository has been established for this argument. |
| The repeating current | `#atlas?entry=abel-orbit-signature` | For the standard Collatz cycle (1,4,2), the mean of the reciprocal values is 7/12. The normalized Abel limit gives that value for the cycle and any orbit eventually joining it. [Written derivation](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/atlas/recovered-bridges.md#abel-orbit-signature); catalog entry `abel-orbit-signature`. |
| Brun’s glittering crossing | `#buried-brun-crossing` | The crossing is a finite numerical comparison with the historical Brun estimate used in the source. The trap is inferring a twin-prime connection from a value reached by tuning the base. [Boundary-residue note](https://github.com/EncapsulatorP/Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers/blob/main/notes/boundary_residue_notes.md); catalog entry `brun-comparison`. The two-base statement applies to positive upper excesses strictly below the sharp maximum for bases greater than one. |
| The impostor prime | `#buried-perrin-pseudoprime` | For the Perrin initialization (3,0,2), 271441 = 521² passes the divisibility condition satisfied by every prime. This is a counterexample to the converse. The existing story in `index.html` contains the proof for primes and the finite recurrence check. The secondary link is labeled **Atlas source repository**, without suggesting a separately recovered project. |
| XO₂, the two-sheet cave | `#buried-xo2` | The existing story records two finite evaluations at z = 1/4 with w = ζ(1.25 ± √z), r = 1/(1 + exp(w)), and K = r + r² + r³. The approximate outputs 0.140269 and 2.817643 are inherited from that record. [Kernel implementation](https://github.com/EncapsulatorP/zeta_branching/blob/main/scripts/zeta_branching.py); catalog entry `zeta-branching`. The geometry of the surrounding iterated landscape remains experimental. |
| The hidden second beat | `#buried-omega-order` | For distinct primes p and q, the two compositions of T_p(x) = Ω p^(Ω−x) share their fixed point and derivative at Ω. Their half-difference starts with a nonzero quadratic term. A small sine drive produces a mean and second harmonic at this order; reversing the order reverses the difference. [Prime Forms source](https://github.com/EncapsulatorP/c3._2z/blob/main/README.md); catalog entry `prime-layer-waves` and [local derivation](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/atlas/recovered-bridges.md#omega-layer-order). |

The two generic atlas links point to the [actual source repository](https://github.com/EncapsulatorP/EncapsulatorP.github.io). All other secondary URLs are already present in `atlas/catalog.json` or the existing story links. The embedded `assets/research-atlas-data.js` carries the matching catalog entries.

## Paper studio · five forms

### Origami chart — `origami`

An illustrative folded sheet for this navigation. It is not presented as a rigid-folding mechanism, a Miura pattern, or a proved deployable structure. Its source is the [atlas map drawing](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/assets/paper-map-engine.js).

### Riemann sphere — `sphere`

The mathematical inspiration is the extended complex plane, C together with one point at infinity, represented by a sphere through stereographic projection. The existing credit links to Jason Murphy’s [Introduction to Complex Analysis, Section 2.4](https://pages.uoregon.edu/jamu/Math5351-lecture-notes.pdf), which states this construction on page 11.

This is a mathematical exposition source, not a claim to identify the earliest historical publication. The map does not assign the nine subject pins complex coordinates or depict measured zeta data.

### Rupert-inspired portal — `portal`

The opening alludes to the cube-passage problem. The retained source is O. Bottema’s [“A Problem of Pieter Nieuwland,” Crux Mathematicorum 4(4), April 1978, pages 92–95](https://cms.math.ca/wp-content/uploads/crux-pdfs/Crux_v4n04_Apr.pdf). It recounts the problem associated with Prince Rupert, Wallis’s solution, and Nieuwland’s construction.

The paper form is an illustration of a passage. Its appearance is not a certificate that a congruent or larger copy can pass through it, and no passage ratio is assigned to the drawing. Bottema’s discussion also distinguishes the symmetric family in Nieuwland’s argument from a completely general optimality claim.

### Tensegrity prism — `tensegrity`

The drawing distinguishes cables in tension and struts in compression. It reuses the existing atlas’s [Cornell-hosted tensegrity mathematics source](https://pi.math.cornell.edu/~back/amsci_tenseg_scan.pdf). The existing credits also retain the [Buckminster Fuller Institute’s history](https://www.bfi.org/about-fuller/big-ideas/tensegrity/) and the [book preview discussing prism structures and contributors](https://api.pageplace.de/preview/DT0400.9781000956290_A46745383/preview-9781000956290_A46745383.pdf).

Those historical credits recognize Snelson, Fuller and Emmerich in their respective roles; this map data does not add a new priority claim. A navigation drawing by itself does not establish load capacity, prestress stability or a construction specification.

### Terraced paper — `terrace`

An original stepped navigation layout for the same trail. Terrace height does not measure truth, performance, chronology or physical energy. Its source is the [atlas navigation drawing](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/assets/paper-map-engine.js).

## Origami voyages · five scenes

This half of the collection follows Zolton’s supplied paper-polyhedron images and the sailing boat in the supplied Neon prototype. Each scene uses an opened chart, a printed route and two small folded-paper boats built as actual 3D meshes. The moving bodies are scenic interpretations, not experiments or asserted physical models.

| Scene | Engine key | Composition |
| --- | --- | --- |
| The open-chart voyage | `voyage-chart` | A foldable chart with two turning corrugated paper wheels. |
| The globe harbour | `voyage-globe` | A faceted cartographic globe staged over the open chart. |
| The impossible passage | `voyage-portal` | A hollow paper body above the route, without a claimed Rupert passage ratio. |
| Tension and sail | `voyage-rigging` | The three-strut prism as a small rigging sculpture over the chart. |
| Islands from paper | `voyage-islands` | Layered paper landforms; their height encodes no research score. |

All nine stations stay attached to chart material coordinates. The boats follow the printed route, and geometry can occlude stations naturally. Camera movement, folding and route motion are visual controls; they never modify a theorem’s status or a recorded benchmark.

The two collections have equal size: five studio forms and five voyages. New visitors begin at the workbench with the open-chart voyage moving in the live preview. A reader’s collection and last form are stored locally; the Next form button cycles within that collection. Switching collections retains the corresponding body. This is a comparison-ready showcase, not a completed traffic experiment. See [the experiment plan](rendering-experiment.md).

## Edition credits

- **Zolton:** research collection and visual direction, including the paper-polyhedron pirate-map request.
- **Neon (Gemini):** the signature recorded on the uploaded prototype. This is a supplied source credit, not an authenticated identification of the model that produced it.
- **ChatGPT:** current map implementation and editing. This does not retroactively label all historical assistant contributions. Earlier names and model versions belong only where their sources document them.

The supplied prototype informed the visual direction. This data keeps the nine previously published research landmarks and their existing evidence; it does not import additional numerical, physics or lottery claims from that prototype.

## Link validation

Validation checks the data contract and the existing source material:

1. The trail has nine distinct IDs and retains its original four treasure, three trap and two wildcard markers.
2. Each subject URL resolves either to an existing `index.html` ID or to an existing catalog entry handled by the atlas’s `#atlas?entry=` route.
3. Each secondary URL names a repository already represented by the catalog. Direct source URLs are checked against the catalog or existing page links; the two explicitly labeled atlas-source links use that repository’s root.
4. The collection has five studio forms and five voyage scenes. Every form uses the same nine subject destinations. Studio keys are `origami`, `sphere`, `portal`, `tensegrity` and `terrace`; voyage keys are listed below.

These are content and navigation checks. They introduce no new numerical experiment or claim about the renderer’s physical accuracy.



## Workbench and unfolding reference

Zolton supplied the photographic paper-model workbench and shared a Claude artifact on 21 November 2026. The artifact was inspected in its rendered interface: selecting a body launches an illustrative opening, reveals a chart, and offers **Back to the table**. This edition credits Claude for that interaction direction. It implements its own table chooser, live 3D preview and opening animation in the existing renderer. The reference's additional scientific stories, dates and surgery claims were not imported.

The original supplied photograph is preserved as `assets/paper-workbench-reference.png`. The artifact credits that image to Zolton Farkas with Gemini. The three photo hotspots refer to visible bodies; the row of five model choices also keeps tensegrity and terraced landforms immediately available. Hover or keyboard focus previews a form. A click opens its chart and subject explanation. Both five-member collections retain the same nine subject destinations.

The opening animation unfolds the creased paper chart in all five voyage scenes and opens the standalone accordion. The sphere, hollow body and tensegrity remain their own forms; no physical surgery or rigid-folding theorem is asserted for them. Reduced motion skips the opening. Pause and direct manipulation remain available.
