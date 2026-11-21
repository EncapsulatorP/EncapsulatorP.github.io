# Recovery notes and provenance

**Edition: 21 November 2026.** This atlas is a selected recovery of research
conversations and source files spanning November 2025 to November 2026. The
conversation records available during curation were retrieved excerpts and
summaries, rather than a complete export of every original thread. Public
repository files were inspected separately. A recovered statement, an
independently checked derivation, and a newly executed computation are identified
as different kinds of evidence.

The public entries summarize the mathematical content. They do not publish
private chat transcripts or unrelated personal information. Repository visibility
was checked during curation; private implementations were not copied into this
public edition. Earlier contributor credits remain attached to their sources.

“New to this edition” marks an addition to the atlas. It is not a claim of
priority over the mathematical literature. Written proofs in this edition have
not been advertised as Lean certificates.

## What was checked

- The public source files linked from the entries were inspected for definitions,
  assumptions and usable results.
- The real alternating-tower argument was independently checked and supplied as
  a complete written proof, because the public solver's referenced proof note
  was not present on the checked branch.
- Standard-library exact arithmetic and 70-digit decimal calculations are in
  [reproduce.py](reproduce.py).
- Recovered finite theta and totient towers, logistic response, Omega layer order,
  the Collatz-27 trajectory, the Egyptian-factor example and the even-zeta
  reduction were recomputed in [reproduce_experiments.py](reproduce_experiments.py).
  Its actual output is [experiment-results.json](experiment-results.json).
- Historical aggregate performance numbers and the Kesten-regime report were not
  described as freshly rerun results.

<a id="omega-stability"></a>
## Omega Stability: a connected source chain

The user supplied the **Omega Stability** cover on 21 November 2026 and described
it as condensing about five or six connected conversations, including one shared
and branched into this conversation history. The image is preserved unchanged
in [the original cover](../assets/omega-stability-thread-cover.png).

Recovered anchors include the February 2026 tower/continued-fraction and
iterated-log discussions; the May 12 digit-factor construction for 299792458;
the May 16 threefold logarithmic inverse and tower remainder; the June 5
alternating-tower boundary comparison; and the November 20–21 prime-layer
composition and wave work. These are connected research anchors, not a claim
that every branch or the complete five/six-thread transcript has been recovered.

The current source in
[c3._2z/omega_stability_tests.py](https://github.com/EncapsulatorP/c3._2z/blob/main/omega_stability_tests.py)
uses the seed `u = 2z`, the depth-three tower, and the threefold logarithmic
inverse minus that seed. The cover's historical shorthand is not substituted
for this explicit definition. The
[checked derivation](recovered-bridges.md#tower-log-chain) distinguishes the
lower-case tower remainder from the Omega constant and the factor-count function.

The Prime Forms layout and specification-export helper are credited to Neo in
the [project README](https://github.com/EncapsulatorP/c3._2z/blob/main/README.md).
The atlas supplies a connected reading route; it does not change those credits.

<a id="prime-boundary-bridge"></a>
## Prime-boundary bridge · 30 May / 3 June 2026

The recovered proposal connects the mod-210 wheel, Goldbach pair fields,
the factorial ratio `(6n)!/((3n)!(n!)^3)`, its prime valuations and controlled
prime/composite scoring. The valuation formulas are exact and are derived in
[the mathematical companion](mathematical-notes.md#factorial-valuations).
The proposed explanatory or predictive bridge remains an experiment.
Historical residual summaries were not promoted to a new performance finding.

<a id="euler-product-resolvent"></a>
## Euler-product resolvent · 8–13 June 2026

The recovered thread defines prime-support products `Z_A(s)` and `L_A(s)`.
The user corrected the construction's name to **Euler-product resolvent** and
preferred **remainder** terminology. This edition supplies the quotient identity,
Liouville-sign interpretation and absolute-convergence domain in
[the checked derivation](recovered-bridges.md#euler-product-resolvent).
No spectral interpretation or analytic continuation is inferred merely from the name.

<a id="egyptian-compression"></a>
## Egyptian compression · 5–8 June 2026

The first-denominator choice `a = nm` and factor gate
`((km−1)b−nm)((km−1)c−nm) = n²m²` were recovered from the unit-fraction
conversations and checked against the public
[remainder-compression implementation](https://github.com/EncapsulatorP/Erdos-Straus-Schinzel/blob/main/remainder_compression_ml.py).
The atlas preserves the restricted search domain and recomputes a concrete
exact example. A proposed comparison with Goldbach is not treated as an implication.

<a id="logistic-quarter-turn"></a>
## Logistic quarter-turn · 20 November 2026

The recovered thread identifies the two-cycle multiplier `4+2r−r²`, the critical
parameter `1+sqrt(6)` and the paired matrix whose square is `−I`.
[The derivation](recovered-bridges.md#logistic-quarter-turn) verifies the
factorization and derivatives, and distinguishes the finite-order linearization
from the nonlinear fourth iterate. Numerical cycle values were recomputed.

<a id="beta-catalan-disk"></a>
## Catalan–beta disk · 20 November 2026

The recovered construction uses `w=(s−2)/(s+1)` to place `beta(2)` at the origin
of a disk. This edition verifies the coordinate identity and the
character-weighted Gauss evaluation in an explicit convergence domain.
The [proof note](recovered-bridges.md#beta-disk) uses the primary
[NIST Dirichlet L-function reference](https://dlmf.nist.gov/25.15)
for the functional equation and zero symmetry.

The old conversation also contained numerical operator observations. Their
complete operator/truncation provenance was not recovered, so this edition
does not display those numbers as certified trace or determinant results.

<a id="prime-sectors"></a>
## Prime sectors and Zetheon · December 2025 / April 2026

The December 10 discussion uses the 48 coprime remainder classes modulo 210.
The April 1 continuation defines prime-sector sums `Z_r`, products `Pi_r` and
weighted combinations. Their common absolute-convergence domain is stated in
the atlas. The small primes excluded by the wheel are handled separately.
Historical selector versions are not silently combined with the current code.

<a id="logistic-probability"></a>
## Logistic distributions and probability towers · November 2025–February 2026

The November 20 discussions concern entropy/complexity measurements on the
logistic map. A December 3 continuation identifies why a mean regressor can
hide one-to-many bifurcation structure and proposes conditional distributions.
The February 16 continuation considers normalized pointwise power transforms.

This edition retains those defined questions and recomputes the finite
`p_i^p_i` example. It does not repeat a historical claim that a complexity curve
must attain its maximum at a particular parameter; that depends on the chosen
statistic, sampling and observable. No unrelated datasets or model training were
used for this atlas update.

<a id="composite-vanishing"></a>
## Composite-vanishing filters · 11 June 2026

The recovered proposal is `R_k(N)=sum_m V_k(m)V_k(N−m)`, where a finite set of
small-prime divisibility filters defines `V_k`. The public entry identifies the
survivor/composite distinction and the needed uniform lower bound as the
research obligation. It does not equate a surviving pair with a prime pair.

<a id="determinant-towers"></a>
## Inverse Collatz determinant towers · March–May 2026

The March 10 draft describes inverse accelerated branches, remainder automata
modulo `2^a3^b`, weighted composition operators and a proposed compatible
determinant family. The May 1 continuation supplies inverse-branch formulas.
The atlas presents this as a proposal, with admissibility, function space,
nuclearity and compatibility still to establish. A complete implementation or
proof was not recovered through the conversation excerpts.

<a id="cm-grammars"></a>
## CM-point grammar · 16 February 2026

The surviving note gives nested grammars involving `q`, a Lambert-W tower fixed
point, `Re((1−E2)/E4)` and a von-Mangoldt Lambert series. It reports sensitivity
to the allowed coefficient range. The target named `rho`, original script and
complete search table were **not recovered**. The old near-fit and claimed digit
count are not presented as a reproduced discovery. The retained entry records
the construction and the specific missing inputs needed to resume it.

<a id="abel-orbit-signature"></a>
## Abel orbit signature · 1 May 2026

The recovered conversation defines a discounted sum of reciprocal iterates and
its normalized Abel limit, with `7/12` for the `1,4,2` cycle. The current
[proof note](recovered-bridges.md#abel-orbit-signature) checks the periodic and
divergent cases and the role of deterministic positive-integer dynamics.
An asymptotic characterization is distinguished from a finite-time decision rule.

<a id="xo-sector-algebra"></a>
## XO sector algebra · 21 May 2026

The recovered finite construction is `C[x]/(x^n−q^n)`, including the degree-ten
organization into five mirror pairs. The atlas publishes its precise polynomial
algebra and the condition `q != 0`. Broader physical and topological vocabulary
from the exploratory thread is not substituted for a proved interpretation.

<a id="tower-hadamard"></a>
## Tower / Hadamard recipes · 13–19 November 2025

The recovered recipes use modular tower indices to permute or phase finite
Fourier/Walsh constructions. This edition isolates a useful exact gate:
integer Fourier-row selectors preserve unitarity exactly when their remainders
are distinct. A claimed application benefit needs a separate comparison after
that arithmetic requirement is checked.

<a id="validatron"></a>
## Validatron · November 2026

The recovered programme asks for open-weight retrieval, one-pass and iterative
proof-candidate mutation, kernel checks and measured return on computation.
This public entry is a statement of that workflow and its first atlas targets.
It does not export a private implementation, launch a compute job, or equate
retrieval/claim-review examples with completed formal proofs.

## How to extend this edition

Add a recovered construction to `catalog.json` with its definition, provenance,
evidence level and next concrete question. Check source visibility and preserve
existing contributor credits. Promote a useful new entry because its mathematical
object and supporting evidence are clear. Update an evidence label only when a
new proof, computation or source record supports that change.
