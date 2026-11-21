# From shape experiments to a growing collection

## Working foundation

This edition separates pure body geometry in `assets/paper-shape-lab.js` from the
WebGL renderer in `assets/paper-map-engine.js` and the reading interface in
`assets/paper-atlas.js`. A shape accepts an opening parameter from zero to one.
Its faces, landmarks and camera bounds can be inspected without opening a browser.
The same body can appear alone in Paper studio or above a sailing chart in
Origami voyages.

The Paper shapes workflow runs on relevant changes and on manual dispatch. It
checks geometry, lifecycle, framing and the links between the visual collection
and the existing research subjects. The workflow does not generate new shapes,
publish its own commits, call an AI service, or measure visitors.

## A useful next generator

Start with a bounded family: hinged convex polyhedra with a chosen spanning tree,
creased paper sheets, or a parameterized surface with explicitly cut seams. Give
every candidate a reproducible seed, parameter range and source record. Keep the
original candidate alongside the proposed optimization so a result can be replayed.

A candidate record should contain:

- A stable ID, generator version, seed and parameters.
- The closed geometry and the complete opening function.
- Fixed material coordinates for the nine subject landmarks.
- A camera envelope for the entire transformation.
- An explanation of what the animation represents and which properties it claims.
- Sources, licenses and a clear origin for the geometry and text.

The existing module is the rendering boundary for those records. A generator
should supply geometry; it should not edit the evidence status or scientific
content of a research entry.

## Optimize a visible, measurable problem

For a polyhedral face layout, first minimize overlap area, then bound the overall
footprint and total cut length. Preserve face edge lengths and the chosen hinge
adjacencies. For a stylized surface morph, explicitly permit metric distortion;
measure sharp jumps, triangle collapse and landmark collisions instead of
pretending it is a rigid unfolding. Do not compare these two families under one
unexplained score.

Use a small set of fixed camera views and phone/desktop aspect ratios to reject
clipping and unreadable navigation. Render actual images before promoting a
candidate; passing a mesh test alone does not establish that the design looks good.

## Delivery path

1. Generate a finite batch from a recorded seed and bounded parameter ranges.
2. Run the current checks and family-specific constraints.
3. Produce closed, intermediate and open previews, including a small-screen view.
4. Open a draft change containing the candidate, source record and comparison.
5. Review the visual result and its explanation, then add it to both collections.

An eventual visitor experiment can compare routes into the research using the
[existing experiment plan](rendering-experiment.md). Geometry quality and reader
outcomes are different signals. A beautiful candidate can fail navigation; an
attention-grabbing animation is not evidence for the mathematics it introduces.

This is a concrete route toward continuous shape generation, not a report that an
autonomous optimization or reinforcement-learning system is already running.
