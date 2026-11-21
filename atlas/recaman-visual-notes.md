# Recamán · around the gaps

Added 21 November 2026. **Status: exact finite sequence generation; exploratory visualization.**

The interactive exhibit is available at [the standalone route](../recaman/index.html) and can be embedded using `data-recaman-explorer`. It uses local JavaScript and Canvas 2D projection, without a rendering CDN or telemetry dependency.

## Sources and contribution

- **Sequence:** Bernardo Recamán Santos; [OEIS A005132](https://oeis.org/A005132).
- **Supplied visual concept:** Gemini, in the owner-provided `gemini-code-1795274358812.html`, titled *Recamán Obstructions — 3D Phase & Möbius Explorer*. The source proposed a 3D delay-coordinate cloud and a Möbius-inspired view.
- **Integration:** ChatGPT adapted that concept to the shared paper palette, provided a local renderer, corrected the transition denominator, separated scalar gaps from delay coordinates, and added explicit finite-horizon labels and an exact arc view.
- **Research repository:** [EncapsulatorP/recaman](https://github.com/EncapsulatorP/recaman), with the consulted version pinned at [`056452f`](https://github.com/EncapsulatorP/recaman/tree/056452f2be03dad5f7bca0f7024c8357f42d8c6b).

The source's terms “obstruction manifold” and “hole loci” are not adopted as established mathematics. The present display gives those interpretations their appropriate scope.

## Exact finite rule

Start at $a_0=0$. At transition $n\geq1$, let $c=a_{n-1}-n$. Choose $a_n=c$ if $c\geq0$ and $c$ has not occurred in $a_0,\ldots,a_{n-1}$; otherwise choose $a_n=a_{n-1}+n$.

The selector counts **terms including $a_0$**, so $N$ terms have $N-1$ transitions. The backward ratio is the number of legal subtractions divided by $N-1$. Forward steps may repeat an already visited value.

The initial terms are

$$
0,1,3,6,2,7,13,20,12,21,11,22,10,23,9,24.
$$

A gap is a positive integer strictly below the selected prefix's maximum that has not occurred in that prefix. This is an observed finite gap; it is not a proof of permanent non-visitation.

## Coordinates and shape matching

**Delay coordinates:** point $i$ is exactly $(a_i,a_{i+1},a_{i+2})$, affinely normalized by the prefix maximum. Its color records the direction of the first transition in that triple. Large clouds use a disclosed deterministic stride, capped at 3,600 rendered points. The statistics always use every generated term.

**Möbius ribbon:** let $u_i=2\pi i/N$ and $v_i=0.8((a_i\bmod6)/5-1/2)$. The displayed point is

$$
\big((1.15+v_i\cos(u_i/2))\cos u_i,
(1.15+v_i\cos(u_i/2))\sin u_i,
v_i\sin(u_i/2)\big).
$$

This is a chosen mapping onto a standard Möbius-band parameterization. It does not show that the sequence has an intrinsic Möbius geometry or that a topological obstruction determines the unvisited values. Camera rotation changes only the view. This mode preserves the supplied concept while stating its representational status.

**Number-line arcs:** semicircles join consecutive values for the first 80 transitions, alternately above and below the line. Arc endpoints come directly from the sequence. The truncation keeps individual steps readable and is separate from the full-prefix statistics.

**Gap rail:** disjoint integer bins partition $1,\ldots,\max(a)-1$. Coral height is the fraction of unvisited integers in each bin. The rail uses no fake 3D coordinates for missing values and makes no claim that an unvisited scalar is a missing delay triple.

## Saved larger experiment

The repository's [saved mechanism report](https://github.com/EncapsulatorP/recaman/blob/056452f2be03dad5f7bca0f7024c8357f42d8c6b/outputs/hole_mechanism_report.md) reports 10,000,000 transitions. Among its 103 selected catalogue targets, 23 were bypassed addition candidates and 80 were never proposed, with no chosen targets. Those are source-reported finite results. They are not produced by this browser module and are not a statement about all missing integers or an infinite horizon.

## Verification and access

Run `node atlas/verify_recaman.cjs` for independent finite-prefix comparisons, first-term checks, direction counts, gap-bin partition checks, and coordinate validity. The recorded checkpoints for **terms** are:

| Terms | Maximum | Positive gaps below maximum | Smallest gap | Backward transitions |
| --- | --- | --- | --- | --- |
| 200 | 833 | 654 | 19 | 95 / 199 |
| 2,500 | 10,163 | 8,156 | 19 | 1,242 / 2,499 |
| 8,000 | 32,980 | 26,819 | 19 | 3,992 / 7,999 |

The renderer supports pointer orbiting, arrow-key orbiting, zoom buttons and keyboard shortcuts, an explicit pause, a static exact arc view, reduced-motion startup, and suspension when the exhibit is off-screen, its room is inactive, the document is hidden, or a map dialog is open. If a drawing context is unavailable, the sequence definition, numeric statistics, first terms, source links, and scope note remain readable.

These checks establish the stated finite computations and representation rules. They do not prove coverage of all positive integers, permanent gaps, or a geometric obstruction theorem.
