# Paper atlas and visual reading rooms · release checks

**Edition:** 21 November 2026. **Integrated preview:** `625c53b737e26ab9af6c5a43ce13d608340916d3`.

## Delivered experience

The shared workbench combines Zolton’s supplied paper-model image with a live 3D preview. Pointer hover or keyboard focus previews a body; choosing it opens the map and its logbook. Back to the table preserves the selected collection and body. Collection switching retains the corresponding body, allowing a direct comparison.

Paper studio contains five forms. Origami voyages contains five scenes with opened charts and two moving folded-paper boats. Both collections use the same nine discoveries, explanations, evidence labels, primary subject destinations and secondary source links. The standalone tensegrity and the tensegrity voyage are both retained and enlarged.

The five voyage charts and the standalone origami have a real creased-paper opening animation. The camera stays fixed during the opening. Other studio forms retain their geometry. The unfolding is an illustrative navigation treatment, not a claim of physical surgery or a rigid-folding theorem.

All twelve research rooms have a compact header model. Mathematical headers retain their stated data while the camera moves. Navigation-only models identify themselves as navigation glyphs. Detailed visual instruments lead into statements, assumptions, explanations and proofs or explicitly scoped proof outlines.

## Observed browser checks

| Check | Result |
| --- | --- |
| Original logo and “Follow the spark.” | Present in the entrance and reading-room navigation. Original logo files are unchanged. |
| Five studio forms and five voyages | All ten scenes rendered in the connected browser. No application warnings or errors appeared in the reviewed map console output. |
| Workbench selection and return | Model selection opens the logbook; Back to the table restores the chooser with the same body. |
| Enlarged tensegrity | Standalone and voyage forms retained; desktop stage minimum is 420 px and narrow-stage minimum is 360 px. |
| Desktop subject route | The prime-layer landmark opens `#buried-omega-order`, with its matching story expanded. |
| Narrow workbench and map | Fixed 390 px responsive frame: no horizontal page or dialog overflow. WebGL chart, controls and model choices remain available. |
| Narrow direct landmark route | Pin 03 opens “The impossible coastline”; its primary link opens `#buried-complex-collatz` in the Pirate Chest. Source link remains separate. |
| Twelve reading rooms | Each room activates correctly and has one compact header model; desktop page widths remain within the viewport. |
| Collatz motion on arrival | Header SVG geometry changed without pressing Play. The computed full-orbit path remained unchanged while its independent highlight moved. |
| Direct Collatz inspection | Pointer selected update 51, `283 × 3 + 1 = 850`; ArrowRight selected update 52, `850 ÷ 2 = 425`. |
| Narrow Collatz and Kesten–Goldie | Both fit the 390 px frame without horizontal page overflow. Kesten–Goldie charts stack in one column. |
| Kesten–Goldie controls | The contracting model can be selected and the burst model restored; the plotted teaching model remains distinct from the recovered experiment. |
| WebGL unavailable | A readable fallback and all subject destinations remain available; unsupported camera controls are disabled. |

The browser viewport override did not reliably apply during the final pass. Narrow checks therefore used the page itself inside the fixed-width frame in `qa/responsive-preview.html`. These are real rendered layout checks, not an assertion about every phone GPU or touch device.

## Geometry, arithmetic and code checks

The renderer’s bounded geometry checks cover finite coordinates, unit normals, nine pins, chart/boat/support clearance, stable opening cameras and clipping across sampled angles, aspect ratios and opening phases. The tightened camera framing was separately checked across 1,260 voyage cases and 45 standalone tensegrity cases. These are numerical geometry checks, not physical load or stability certification.

JavaScript syntax checks and `git diff --check` pass. `node atlas/verify_rooms.cjs` reports:

- 1,299 Goldbach sums and 41,501 prime pairs agree with independent trial division.
- The twin criterion, a BigInt Collatz cross-check and the circle-energy identity pass.
- Cabinet inverse coordinates, boundary, conjugacy and parameter-gap checks pass.

The visual-header checks additionally cover the exact difference-of-squares identity, prime-pair enumeration, neighbour factorization and Rudin–Shapiro energy identity. These finite checks do not resolve the open conjectures discussed on the site.

The catalogue rebuild retains 45 entries, five research families and 28 exact entries. The Kesten–Goldie application remains a reported computation. The classical theorem, exact comparison algebra, seeded teaching path and recovered source measurements have separate labels and explanations.

Pause, reduced-motion handling, opening cancellation on direct manipulation, visibility suspension and context-loss recovery were reviewed in code and focused renderer lifecycle checks. No new external runtime dependency or analytics request was added.

## Scope retained

Public mathematics and private physics remain separate. No private physics notebook content or personal context is introduced by this visual release. Credits distinguish Zolton’s direction, Neon/Gemini’s supplied prototype and image reference, Claude’s table/unfolding interaction reference, and ChatGPT’s current implementation. Historical assistant versions are not inferred from dates.

Five forms plus five voyages is equal catalogue representation. It is not randomized traffic allocation and does not establish a winner. The versioned A/B measurement proposal and later adaptive-selection conditions are recorded in [rendering-experiment.md](rendering-experiment.md). No reinforcement-learning system or measured conversion improvement is claimed for this release.

## Published verification

The main entrance was promoted in [`4a954e809d634eb5708787c9e2f223a3ae6ddb05`](https://github.com/EncapsulatorP/EncapsulatorP.github.io/commit/4a954e809d634eb5708787c9e2f223a3ae6ddb05). Both Proof HTML and GitHub Pages deployment completed successfully. The deployed `index.html` was observed with the workbench, original logo, two five-member collections and the current rendering assets.

The live page also passed a 1024 px frame check with no horizontal overflow. Pause held all nine projected landmark positions steady; Play restored motion. The [published visual record](../qa/evidence/README.md) includes the shared workbench and the larger standalone tensegrity.
