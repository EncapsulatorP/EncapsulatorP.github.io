# Opening the bodies: sources and mathematical scope

**EncapsulatorP · 21 November 2026**

The workbench now treats a body and its opening as a reusable visual model. A mathematical object, a drawing of that object, and the animation between two drawings have different claims. The notes below make those claims explicit without closing the door on visual exploration.

## Source of the recovered interactions

Zolton supplied **EncapsulatorP splash preview: cut a shape open**, an HTML artifact credited in its own footer to Claude for the surgeries, chart and layout. It credits the table photograph to Zolton with Gemini, and the paper-fold and pirate-map vocabulary to Neon (Gemini). The inspected upload contains four procedures: a sphere peeling into a disk, a Noperthedron unfolding along a face tree, an accordion-like sheet opening, and a neck pinching apart before its two lobes flatten.

The present atlas adapts that visual direction into its existing lit 3D renderer. These source credits identify the supplied artifact; they do not authenticate a particular historical model version. The recovered scientific stories in that prototype are not automatically added to the research catalog, and an appealing shape does not change the evidence status of a subject.

## What each opening shows

| Body | Geometric content | Meaning of the opening |
| --- | --- | --- |
| Globe | A faceted sphere with a cartographic grid | A cut-and-stretch illustration taking the surface to a disk. It is not a length-preserving paper net or the stereographic projection formula. |
| Hollow portal | An original hollow paper sculpture | Panels are hinged apart for inspection. The hole alone does not establish a Rupert passage. |
| Noperthedron | A rounded display mesh matching the published construction of Steininger and Yurkevich | Faces rotate about a chosen spanning tree. The visualization does not certify a collision-free unfolding or nonoverlapping planar net. |
| Neck surgery | A two-lobed surface used as a visual analogy | Pinch, separate and cap are illustrated; flattening the resulting lobes is a further artistic transition. No Ricci-flow equation is integrated. |
| Klein bottle | A self-intersecting depiction of a closed nonorientable surface in three dimensions | Cutting its parameter seams reveals a rectangle whose paired-edge instructions recover the abstract surface. The interpolation is not a physical paper-folding mechanism. |
| Origami chart | A folded navigation sheet | Creases open to expose the same destinations; it is not asserted to be a rigid Miura mechanism. |
| Tensegrity | The existing three-strut, nine-cable prism | Its geometry remains an inspectable structure. Navigation motion is not a load test or a prestress proof. |
| Terraces | An original stacked-paper landscape | A navigation composition; height is not a score, energy or degree of mathematical validity. |

The same research destinations remain available from every scene. Scenic landmarks do not acquire new mathematical coordinates merely because their carrier changes shape.

## Noperthedron: the earlier construction and the supplied mesh

Jakob Steininger and Sergey Yurkevich's [*A convex polyhedron without Rupert's property*](https://arxiv.org/abs/2508.18475) was first submitted on **25 August 2025**, with version 2 submitted on **28 January 2026**. Their theorem concerns the specified convex solid and straight passages with positive clearance. The original construction and proof resources are in the [authors' repository](https://github.com/Jakob256/Rupert), including [the vertex generator](https://github.com/Jakob256/Rupert/blob/main/src/noperthedron.py). Their result is not established by the atlas animation.

An independent check of the uploaded data found **90 vertices, 240 edges and 152 faces**: 150 triangles and two 15-sided faces. Each edge belongs to two faces, and the Euler count is 90 − 240 + 152 = 2. The face tree has one root and every child's parent precedes it.

The uploaded coordinates match the paper's vertex set after the display transformation

\[
(x,y,z)\longmapsto 0.92\,(x,z+C_{1,z},y).
\]

Matching the two point sets gives 90 distinct nearest counterparts with maximum Euclidean discrepancy approximately **7.424 × 10⁻⁶ display units**. This is consistent with the upload's five-decimal rounding. It is a numerical identity check of the visual source, not a rerun of the authors' proof. The present geometry recomputes hinge angles from the rounded faces so that the displayed net closes and opens consistently; the underlying vertex approximation remains explicit.

## Neck surgery: the dimension matters

Grisha Perelman's [*Ricci flow with surgery on three-manifolds*](https://arxiv.org/abs/math/0303109), submitted **10 March 2003**, is the primary source for this connection. In [§4.4 of the paper](https://arxiv.org/pdf/math/0303109), surgery takes place on a three-dimensional manifold near a neck with two-sphere cross-sections, followed by controlled capping and continuation of the flow. The paper credits Hamilton's earlier surgery work.

Our visible two-dimensional shell provides an analogy for the change in connectivity. It does not compute the metric, curvature, cutoff scales or cap estimates required by that construction. In particular, a narrow drawn neck is not a computed singularity, and the final two flat charts have no role in Perelman's theorem.

## Klein bottle: a seam is an instruction

The abstract Klein bottle is obtained from a rectangle by identifying one pair of opposite edges in the same direction and the other pair in reverse. One convention on the unit square is

\[
(u,0)\sim(u,1),\qquad(0,v)\sim(1,1-v).
\]

The displayed crossing belongs to its representation in three-dimensional space; it is not an extra glued intersection in the abstract surface. C. McMullen's [*Topology*, Math 131 course notes (2013), §12, page 64](https://legacy-www.math.harvard.edu/~ctm/papers/home/text/class/harvard/131/course/course.pdf), gives this quotient construction and explains why the closed nonorientable surface cannot be embedded in three-space. These are exposition references, not claims of first historical priority.

The bottle's parametric coordinates are adapted from the official three.js [`klein` function](https://github.com/mrdoob/three.js/blob/caddbf4cd84b62d7edf6b9fc937ca709afdfe915/examples/jsm/geometries/ParametricFunctions.js), pinned to commit `caddbf4cd84b62d7edf6b9fc937ca709afdfe915`. This uses the formula only; three.js is not a runtime dependency. Its license notice is retained below and alongside the adapted implementation.

### three.js license notice

The MIT License

Copyright © 2010-2025 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## A foundation for later shape generation

A candidate shape should carry a stable key, a source/credit record, an explicit interpretation, a deterministic geometry builder and bounds for its full opening. Automated checks can reject nonfinite geometry, broken landmarks, invalid hinges, seam mismatches and excessive rendering cost before a candidate enters the gallery.

Those checks support an eventual proposal-and-review pipeline. They do not establish physical realizability, mathematical novelty or reader preference. New families can be generated and compared in previews while their research claims continue to be reviewed separately. No autonomous optimizer or reinforcement-learning result is claimed by this edition.
