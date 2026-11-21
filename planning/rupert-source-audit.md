# Collatz–Rupert / Noperthedron audit and staged plan

Audit date: 2026-11-21. Read-only inspection of default branch `main`, tree/ref `cf7e78217e05d9568e0382be3577254a1d96f167`.
Repository: https://github.com/EncapsulatorP/collatz_rupert_delay_embedding

## Decision recommendation

Promote this as a high-meaning, bounded geometry-and-validation project. First milestone: an origin-invariant strict-containment witness generator tested against a known Rupert positive control and the exact Noperthedron negative control. Its near-term return is a reusable experiment/certificate interface and recovery of a neglected user-priority thread. A proof connecting Collatz convergence to Rupertness is a separate, high-risk mathematical target.

Retire the existing `nextsteps.md` four-week promise to compute all seeds to 10^7, prove a new scaling law, define a preserved winding invariant, and publish. None of those theorem milestones has supporting implementation or a feasibility gate in the default branch.

## What actually exists

| Component | Default-branch evidence | What it supports |
|---|---|---|
| Exact integer orbit generation | `src/collatz_polytope.py` | Standard unshortened 3n+1 map, N transitions, N+1 terms; positive-step validation |
| Three finite point embeddings | Same file | Raw (a_k,a_{k+1},1−1/(k+1)), normalized, normalized plus parity |
| Floating hull/mesh export | `src/geometry.py`, `scripts/generate_polytope.py` | SciPy/Qhull volume, area, simplices, OBJ |
| Stochastic projection containment | `src/projection.py`, `scripts/rupert_proxy.py` | Finite random orientation and translation experiment, hits/rate only |
| Width-screen proxy | `scripts/convex_hull.py` | A necessary width condition at sampled angles, weaker than containment |
| Batch experiments | `scripts/scan_batch.py` | CSV of n,N,mode,hull statistics, proxy hit rate |
| Figures/demo assets | `docs/assets/collatz_n27_funnel.html`, PNGs | Historical visual outputs; not a certificate or results table |
| Claim boundary note | `docs/CLAIMS_AND_NONCLAIMS.md` | Explicitly denies claimed convergence↔Rupert theorem |

No Noperthedron generator/control, strict positive witness, global exclusion certificate, test suite, or CI workflow appears in the untruncated tree. Requirements are unpinned numpy/scipy/matplotlib/scikit-image. README references absent `generate_n27_plotly.py`, root HTML, and `docs/index.html`; it acknowledges an availability mismatch but retains historical commands. README says MIT/see LICENSE, but LICENSE is absent.

These are default-branch observations, not claims about unpublished chats, other branches, or a local package.

## Priority defects and claim corrections

1. **Translation search is coordinate-origin dependent.** `try_fit_by_translation` samples the translation vector in the outer polygon bbox, instead of the feasible translation region. Executed the fetched function: an inner square [−0.5,0.5]^2 fits outer [−1,1]^2 and returns True; translating BOTH polygons by (10,10) returns False with identical RNG seed and 2,000 trials. The geometry is unchanged. Solve fixed-orientation translation feasibility directly.
2. **No strict-clearance check.** `point_in_convex_polygon` admits boundary points and a 1e−12 exterior tolerance. Executed `polygon_contains_all(outer,outer)`: True. Rupert passage requires strict containment/positive clearance. A hit is currently only a numerical proxy. Save transformations and margin, then verify independently.
3. **A miss is not a negative theorem.** Finite random trials cannot exclude all rotations/translations. `hit_rate=0` must mean “no witness found under this budget.” Width-screen failure excludes only a tested orientation; passing one direction does not prove containment.
4. **Horizon changes the embedding.** Normalized modes use z=k/N, moving old vertices whenever N changes. They are not nested finite prefixes of one infinite embedded point set. Normalizing a_k also removes the raw unboundedness argument. Define the object before claiming stabilization.
5. **README arithmetic errors.** Exact standard recurrence audit gave n=27: 111 transitions, 112 sequence terms, peak 9,232. n=97 has 118 transitions and is the longest within seeds≤100, contradicting the n27-record claim. Multiplicative order ord_24(2) is undefined since gcd(2,24)≠1. The displayed valuation-count formula is false: k=4,j=2 has odd seeds {1,9}, count2, while the stated 2^(j−2) predicts1. For 1≤j<k, the correct count across odd n in 1..2^k is 2^(k−j−1).
6. **True identities do not supply the missing dynamical theorem.** ord_(2^k)(3)=2^(k−2) for k≥3 and ord_27(2)=18 are arithmetic identities. They do not by themselves establish exact Collatz plot cluster sizes, helices, or long stopping-time causes. Reclassify those bridges as hypotheses and test with matched controls.
7. **Operational gaps.** Output directories are not created; default `examples/` is absent. Batch has no degenerate-hull/empty-range handling or per-case independent RNG seed. Large integer→float conversion can overflow/lose exactness. Existing 10^7-seed ambition is unsupported by runtime measurements.

Source permalinks use:
https://github.com/EncapsulatorP/collatz_rupert_delay_embedding/blob/cf7e78217e05d9568e0382be3577254a1d96f167/README.md
and corresponding file paths above.

## Mathematical boundary

The repository's valid elementary implication is: if limsup a_k=∞, then the raw infinite embedded point set and its convex hull are unbounded. The conventional Rupert problem concerns compact, full-dimensional bodies. This makes that raw infinite object out of domain, not a new convergence test.

A finite prefix always has a compact convex hull; neither its Rupertness nor a search miss determines later Collatz behavior. A bounded infinite convex hull need not be closed, so “closed convex hull” and compactness assumptions must be specified. Convergence to the usual cycle and hypothetical other bounded cycles are distinct from an unbounded trajectory. No shown result links those cases to Rupertness.

Raw 3D (a_k,a_(k+1),time) also differs from README's three consecutive-value delay coordinates (a_k,a_(k+1),a_(k+2)). Reconcile the definitions and name each embedding before sharing data between repos.

**A cheap exact lemma worth proving first:** standard consecutive triples lie on only three affine lines:

- n≡0 mod4: (n,n/2,n/4).
- n≡2 mod4: (n,n/2,3n/2+1).
- n odd: (n,3n+1,(3n+1)/2).

This follows directly by two applications of the recurrence. The apparent three-dimensional “helix” in the README is therefore not evidence of a new continuous phase-space topology; time-colored/connected sparse samples can look elaborate while satisfying these exact branch constraints. More generally, a fixed finite consecutive delay window is affine in the starting integer on each allowed parity word. An integer trajectory is a countable set; finite plotted points alone do not establish a positive fractal dimension. This is a precise bridge to the organization's dimension/cardinality thread and a useful regression oracle for all three Collatz repos. It does not apply unchanged to their real/complex cosine interpolations or to time-augmented coordinates.

## Noperthedron baseline, verified primary sources

- Steininger–Yurkevich, *A convex polyhedron without Rupert's property*, https://arxiv.org/abs/2508.18475 ; inspected v2 https://arxiv.org/html/2508.18475v2 .
- Authors' implementation https://github.com/Jakob256/Rupert ; inspected main tree `1009a4c451dbdbb1a1705d18461cbabd534a0a6c`, with `src/noperthedron.py`, Sage verification notebooks and solution-tree data.
- Formal proof https://github.com/jcreedcmu/Noperthedron ; current README identifies `Noperthedron/Vertices/Exact.lean`, `Noperthedron/MainTheorem.lean`, `CayleyKernel/Main.lean`; states a kernel-checked proof using the standard three axioms. Not rerun during this audit.

The published 90-vertex negative control comes with global coverage and rigorous local/global bounds; its symmetry reduces the proof domain. It is an ideal validation fixture. Ordinary Collatz hulls lack that symmetry, so the proof's five-parameter reduction cannot simply be transplanted. Positive-control cube witnesses and a difficult positive control (“Rupert but not locally Rupert” from the same paper) prevent tuning the search solely to the negative fixture.

The proper architecture is candidate search → independent witness/checker → claim ledger. Fixed rotations give linear translation/strict-slack constraints. Unknown rotations make the global problem nonconvex; QCQP/MIQCP or SOCP bounds may assist, but an unrestricted exact MILP claim is not justified. Non-Rupert certification requires coverage of the entire admissible pose domain with proven bounds and all assumptions checked.

## Proposed 2 / 4 / 8 week milestones

Calendar is an estimate from the next focused start, not a scheduled promise. Assume one research/engineering owner, 2–3 focused days per week; actual gate results control advancement.

| Stage | Inputs and work | Reviewable output | Acceptance / stop gate |
|---|---|---|---|
| Weeks1–2: trust the instrument | Pin snapshot and conventions; correct the listed math errors; replace translation sampling with fixed-orientation LP; strict margin and witness serialization; import exact Noperthedron geometry with provenance; cube positive control; characterize degeneracy and output handling | `claims.yaml`, `controls/`, versioned witness schema, independent checker, small reproducible example report | Translation/rotation covariance checks; exact Collatz n27/n97 fixtures; equality rejected as strict witness; saved cube witness independently verifies; Noperthedron never called Rupert without a verified witness; search miss remains unknown. Stop large scans if any fails. |
| Weeks3–4: controlled pilot | Measure runtime, then predeclare seed/horizon strata; compare raw/normalized/parity and true-order/shuffled/block-preserving orbit controls; log all seeds/settings; reproduce an upstream negative-control certificate if practical | Small committed result table, runtime profile, bootstrap/uncertainty analysis of search success rates, source/claim map, two runnable cross-repo adapters | Report whether effects survive origin/horizon/budget changes and matched controls. No unexplained false positive on certified negative fixture. If separation vanishes, retain a methods result and stop invariant marketing. |
| Weeks5–8: choose certificate or useful explorer | Only after first gates: try an independently checkable positive-certificate corpus for finite Collatz hulls; prototype bounded parameter-box exclusion on one small target. Separately formalize one exact lemma about embedding, residues, or closure | Reproducible geometry explorer + witness download and uncertainty labels; at most one narrowly scoped theorem/certificate note; go/no-go record for global exclusion work | Global non-Rupert label only after complete domain-cover proof and checker replay. A timeout publishes unresolved boxes, not “non-Rupert.” No convergence/Rupert equivalence claim without an explicit theorem proof. |

**Suggested decision targets:** RUP-01 claims and definitions; RUP-02 fix translation and strict witness; RUP-03 Noperthedron/cube controls; RUP-04 reproducible pilot; RUP-05 shared trajectory and metadata adapter; RUP-06 certificate feasibility decision; RUP-07 narrow exact lemma. Rank RUP-01/02/03 first. Big compute and conjecture paper remain conditional.

**Meaningful win by week2:** bring the user's neglected non-Rupert idea back as a runnable, trustworthy controlled experiment. **Week4 win:** discover which visual signal is robust. **Week8 win:** ship reusable witnesses and one honest conclusion, including a negative result if that is what survives.

## Cross-repository links worth landing in the organization

All links below are proposed interfaces or shared methods, not implemented imports. No cross-repo dependency is present in the Rupert source inspected.

| Peer | Evidence anchor inspected | Exact connection and deliverable | Boundary |
|---|---|---|---|
| `collatz_quasi_particle_by_forced_tetration` | `MODEL.md`: cosine-Collatz gate, paired phase kick, complex exponential update | Common Collatz-map convention and trajectory adapter; feed finite scalar/complex feature trajectories into separately named embedding recipes | Integer orbit, cosine interpolation and paired forced tetration are different systems; do not transfer convergence results |
| `prime-tower-diagnostics` | README, scripts listed for tower maps and Newton/Collatz cocycles | Shared delayed-coordinate data contract, derivative/Lyapunov diagnostics, burn-in and horizon controls; compare geometric features with finite-time growth | Finite stochastic Rupert hit rates, Lyapunov exponents and fractal dimensions are distinct observables; no identity asserted |
| `collatz_kesten-goldie` | README: affine recurrence, K-law and shuffled/i.i.d. controls | Reuse true-order versus shuffled and block-preserving null-model discipline, orbit ID and gauge metadata | Its stochastic/affine tail model is not a theorem for deterministic Collatz or for convex hull passage |
| `recaman` | README: finite missing-value catalogue vs process bit, provenance, chronological holdouts | Transfer evidence taxonomy: finite non-observation vs universal obstruction; independent checker and reproducibility report layout | No claimed shared arithmetic mechanism |
| `Jakob256/Rupert`, `jcreedcmu/Noperthedron` | Primary paper/implementation/proof | Exact certified negative fixture and verifier; strongest immediate technical reuse edge | Upstream proof assumptions and licenses must be preserved; nonsymmetric Collatz hulls require own generalization |

Peer evidence URLs:
- https://github.com/EncapsulatorP/collatz_quasi_particle_by_forced_tetration/blob/main/MODEL.md (file SHA 36896add28ce796241f2869b668ec60d798df964)
- https://github.com/EncapsulatorP/prime-tower-diagnostics/blob/main/README.md (file SHA c54b48527338ac7823c139cb0d67f7b3d7078d5c)
- https://github.com/EncapsulatorP/collatz_kesten-goldie/blob/main/README.md (file SHA a449de54f4b0d43b8cd7eef08543d7ff3b0888af)
- https://github.com/EncapsulatorP/recaman/blob/main/README.md (file SHA 00ebc6a20dd2166461905507910460fa48fde703)

Minimum edge fields: source repo, destination repo, shared object, relation type, evidence URL/SHA, proposed adapter, validation gate, owner, status, next review. This avoids spending hours reconstructing “related somehow” from memory.

## Audit scope and tool evidence

Fetched the full untruncated tree, README, claims note, nextsteps, requirements, all three src files, and the four main experiment scripts. Inspected current primary Noperthedron paper and upstream source tree. Executed only small deterministic arithmetic and projection-defect reproductions in scratch, not full scans or an upstream formal proof. No remote files, issues, branches or organization settings changed.

Web source refs for root to open before using GenUI citations:
- `turn938545909view0`: arXiv v2 paper
- `turn938545909view1`: current Lean repository
- `turn326166477view0`: paper source-code/global coverage discussion
- `turn326166477view1`: 90 vertices and symmetry
- `turn326166477view2`: rigorous rational verification

