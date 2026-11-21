# Living treasure rooms

21 November 2026 · EncapsulatorP

This edition extends the visual language of Atlas Spark to the other research rooms. The Atlas section in `index.html`, `assets/research-atlas.css` and `assets/research-atlas.js` are preserved byte for byte. The navigation order changes so Goldbach and the Pirate Chest sit beside Atlas; a labelled selector exposes all rooms on narrow screens.

## Working views

| Room | Interaction | Evidence |
| --- | --- | --- |
| Goldbach | Choose an even sum, select an unordered pair, switch between centre arcs and the product curve | Exact finite integer enumeration through 2,600; `pq = m² − d²` |
| Hibernating Lemmas | Change the centre; inspect the two neighbours and prime-factor count | Exact arithmetic for the displayed range 3–200 |
| Collatz | Choose a seed; move through its finite orbit; read every value | Integer steps with explicit update and precision limits |
| Pirate Chest | Change the Rudin–Shapiro recursion depth and circle angle | Exact energy identity; floating-point samples of its curves |
| Curious Cabinet: Catalan | Move the complex coordinate and select numerical beta zeros | Exact coordinate map; five numerical roots with provenance |
| Curious Cabinet: C3.2Z | Compare mirror, merge and parameter-split rules | Exact identities with 48 independent floating-point updates |

The Cabinet contains two additions. They deepen existing catalogue threads; the catalogue still contains 45 entries. The notes in [cabinet-notes.md](cabinet-notes.md) give formulas, root-computation provenance, finite scope and possible research value.

The original Goldbach rotating landscape, Collatz Metamorphoses, tower phase views, proof texts, source trails and earlier credits remain available. Physics explorations have a separate subject shelf in the repository map. This edition does not move repositories or publish private physics material.

## Verification

Run:

```sh
node atlas/verify_rooms.cjs
python3 lemmas/verify_lemmas.py
python3 lemmas/verify_roadmap.py
```

The new checker independently enumerates prime pairs by trial division and compares all 1,299 exposed even sums (41,501 unordered pairs). It cross-checks Collatz against BigInt arithmetic, checks the twin criterion over the slider range, samples the exact circle-energy identity and verifies coordinate inversion and the first-step logistic identities.

The display uses bounded computations and local assets. The finite Collatz delay cloud is cached and redrawn when its room becomes visible, including reduced-motion preferences. The complex Collatz animation stops on leaving its room. New CSS and event handlers are scoped away from Atlas Spark.

## Maintain

Room markup lives in `index.html`. The additional assets are `treasure-rooms.css/js`, `goldbach-lab.css/js`, and `curious-cabinet.css/js`. The numerical helpers can be required directly by Node without a browser. Avoid introducing duplicate page fragments with relative links; the live markup is the source of truth.
