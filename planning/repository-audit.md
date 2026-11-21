# EncapsulatorP repository links and decision-target audit

Audit date: **21 November 2026**. Scope: **32 organization repositories:20 public,12 private**. All default branches are `main`; source commits were fetched individually and are recorded in `repo-evidence.json`. This is a read-only review of repository metadata, README files, recursive trees and selected implementation files. It does not assert that test suites currently pass or that reported numerical results have been independently rerun.

The user authorized public disclosure of the research roadmap, including private repository names and links. Source access remains governed by GitHub permissions. This report excludes credentials and unrelated personal details.

## Main finding

The portfolio has real implementations and substantial reusable mathematics, but most inter-repository connections are **shared objects or proposed reuse**, not installed dependencies. The strongest existing bridge is the bounded arithmetic capsule in Goldbach. Validatron is the intended shared proof-development product; current ingestion/triage/registry code and optional Lean replay are real, while broader retrieval, semantic repair and proposer integrations are still development targets. A searchable typed graph will recover context without overstating integration.

`interlinks.json` contains **36 research edges**, **2 verified navigation links**, and **1 implemented but unresolved optional import**. Every one of the32 repositories has at least one edge. Search keywords preserve familiar handles such as Rupert/Noperthedron, SSI, 3223, χ4, Catalan, Schanuel, Ω, phase slips, chainladders and obstruction.

## Claims that change planning

1. **Validatron is a scaffold with useful real components.** Its [README](https://github.com/EncapsulatorP/Validatron/blob/ad7ad831638e5c3d282331335f150afbbd98b64f/README.md) explicitly separates deterministic pipeline work from proving shells. Its [repository configuration](https://github.com/EncapsulatorP/Validatron/blob/ad7ad831638e5c3d282331335f150afbbd98b64f/repoaccess/repos.yaml) is example/local-path configuration, not evidence of org-wide imports. The [implementation plan](https://github.com/EncapsulatorP/Validatron/blob/ad7ad831638e5c3d282331335f150afbbd98b64f/target_planning.md) mandates source fidelity, constructive repair and assumption closure; these are acceptance criteria, not a completed capability list.

2. **The Goldbach bridge is already executable code, with precise limits.** [RESEARCH_BRIDGE.md](https://github.com/EncapsulatorP/goldbach_busy_collatz/blob/5adbd7d32efbec7f98ac51ee90d03cd347b249e1/RESEARCH_BRIDGE.md) and [research_bridge.py](https://github.com/EncapsulatorP/goldbach_busy_collatz/blob/5adbd7d32efbec7f98ac51ee90d03cd347b249e1/scripts/research_bridge.py) connect finite counts, χ4 identities, local constraints and exact small Mertens sums. The Validatron hook only reads readiness. The optional tower import expects `boundary_residues.constructive` and `notes/real_tower_theorem.md`, absent from the current public boundary repo tree. Treat this as an unresolved adapter target.

3. **Collatz lift documentation and code refer to different maps.** The [README](https://github.com/EncapsulatorP/collatz_lift/blob/7134ef3e85474810575209c436be8b6b16e8c5f2/README.md) prints an `exp(2πic)` gate and `H(c)=G(c)Log(c)-ln2`; [core code](https://github.com/EncapsulatorP/collatz_lift/blob/7134ef3e85474810575209c436be8b6b16e8c5f2/scripts/core/collatz.py) implements a sine/cosine gate with accelerated odd branch and `H_hat(u)=G(exp(u))-u-ln2`. The code also clips exponential real parts. Model identity and analyticity assumptions must be resolved before transferring root/argument-principle conclusions.

4. **The six-map Lyapunov story has a source mismatch.** [Lemma.md](https://github.com/EncapsulatorP/prime-tower-diagnostics/blob/23450b6b5ed6024c662cae23d3e0644a3ed8510b/Lemma.md) discusses `frac(2·3^y)` and `frac(6^y)`; [spinor_split_plot.py](https://github.com/EncapsulatorP/prime-tower-diagnostics/blob/23450b6b5ed6024c662cae23d3e0644a3ed8510b/scripts/spinor_split_plot.py) evolves a logistic orbit and sums logs of `2.25+3x` and `3.02+1.9x`. The plot does not implement the stated maps. Keep each construction as its own versioned experiment.

5. **Do not adopt stale acceleration promises as milestones.** The forced-tetration [correction plan](https://github.com/EncapsulatorP/collatz_quasi_particle_by_forced_tetration/blob/e712b2e5d9ca4f1da5c973be9b7a39753b8a127b/correction_plan.md) proposes a different computational operator and promises an unproved asymptotic speedup. Its [current model](https://github.com/EncapsulatorP/collatz_quasi_particle_by_forced_tetration/blob/e712b2e5d9ca4f1da5c973be9b7a39753b8a127b/MODEL.md) instead defines a complex feedback system. A finite, reproducible stability capsule is a meaningful target; a guaranteed conjectural proof is not.

6. **Mertens needs a numerical credibility gate.** [mertens_pipeline.py](https://github.com/EncapsulatorP/mertens_counterexamples/blob/8c03e6468e216091050cc81b0793a9191cbe4b1e/mertens_pipeline.py) casts the basis and target to floats before enumeration; [lattice2matroid.py](https://github.com/EncapsulatorP/mertens_counterexamples/blob/8c03e6468e216091050cc81b0793a9191cbe4b1e/lattice2matroid.py) also uses float target parsing and a modular-rank route with an exact option. Compare small exact fixtures and C++ behavior before large searches or certification claims.

7. **Two formerly missing repositories now exist, but as seeds.** [YPer](https://github.com/EncapsulatorP/YPer/blob/4f8c7b0fecc95f9568ccfa8b52ed968b9fc998b0/README.md) and [Obstruction-Theory](https://github.com/EncapsulatorP/Obstruction-Theory/blob/8d5fc9d48835012748e444fecc20df3a9ef46653/README.md) each contain only a README with a one-sentence remit. [Fixed-Point-Shadow](https://github.com/EncapsulatorP/Fixed-Point-Shadow/blob/26744b515fcb08e9aa9065f56abeb71f352fb65d/README.md) is likewise a README-only research sketch. Give these definitions-first targets; do not describe them as engines.

8. **Some next-step files are behind their trees.** Type2 says `narayana_fit` is absent although [the file exists](https://github.com/EncapsulatorP/ZP_type2_sector_invariants/blob/01c93cdf96efe585d10bb4b8d54b73e741f96101/z_p/type2/narayana_fit.py); ESC says its result directory is empty although [a report exists](https://github.com/EncapsulatorP/Erdos-Straus-Schinzel/blob/43e99b9b4be67462c2ab232e23fde0006ae99131/results_remainder/remainder_report.json); Catalan README entrypoint paths differ from the current `scripts/` layout. Reconcile documentation instead of reopening already-recorded work.

## Ranking interpretation

Scores below are editorial priorities for this portfolio, on a1–5 scale. Meaningfulness measures alignment with the user's questions and mathematical value; importance measures dependency and credibility impact; ROI means expected learning/reuse per focused hour, not financial return or probability of proving an open conjecture. Efforts are estimates for the stated finite deliverable, not for resolving the entire field.

The proposed calendar assumes **12 focused hours/week** and **at most2 active research capsules**. The lower/upper effort sum exceeds what can be guaranteed in12 weeks; the later targets are a conditional queue. Advance a target only when its source/definition gate passes and it earns capacity at a decision review.

| Rank | Target | M | I | Learning ROI | Focused effort | Priority |
|---:|---|---:|---:|---:|---|---|
| 1 | T01: One searchable source and decision register for all32 repositories | 5 | 5 | 5 | 8–16 focused hours | P0 |
| 2 | T02: Repair model contracts before comparing Collatz/fractal results | 5 | 5 | 5 | 12–20 focused hours | P0/P1 |
| 3 | T03: Validatron constructive calibration slice | 5 | 5 | 4 | 16–32 focused hours | P0 |
| 4 | T04: Rupert/Collatz finite geometry capsule | 5 | 4 | 4 | 8–16 focused hours for the initial bounded capsule | P1 |
| 5 | T05: Goldbach exact bridge with held-out inference | 5 | 5 | 5 | 8–16 focused hours | P1 |
| 6 | T06: Recamán finite persistence and rare-slip benchmark | 5 | 4 | 4 | 12–24 focused hours | P1 |
| 7 | T07: Exact tower and conditional Z(p) notebook consolidation | 5 | 4 | 4 | 8–12 focused hours | P1/P2 |
| 8 | T08: Diophantus seeded exact-search comparison | 4 | 4 | 4 | 12–24 focused hours | P2 |
| 9 | T09: Mertens lattice numerical credibility gate | 4 | 4 | 3 | 12–24 focused hours | P2 |
| 10 | T10: One physics/biophysics feasibility capsule | 5 | 3 | 3 | 8–16 focused hours | P3; conditional queue |

## Target cards

### T01 · One searchable source and decision register for all32 repositories

**Repositories:** [EncapsulatorP.github.io](https://github.com/EncapsulatorP/EncapsulatorP.github.io), [.github](https://github.com/EncapsulatorP/.github), [Validatron](https://github.com/EncapsulatorP/Validatron).

**Deliverable:** Canonical32-row inventory, typed edges, immutable source links, queryable concept keywords and a next-decision record for every repository.

**Success:** Every repo is reachable by name, synonym and concept; every displayed edge has a type and source; a returning researcher can recover a thread without relying on memory.

**Useful negative outcome:** Broken/missing source and definition records become explicit recovery targets rather than invented integrations.

**Entry/exit gate:** The website is the canonical public planning destination; profile and Page link to it. User authorized public research inventory; private source repositories remain access-restricted.

### T02 · Repair model contracts before comparing Collatz/fractal results

**Repositories:** [collatz_lift](https://github.com/EncapsulatorP/collatz_lift), [collatz_quasi_particle_by_forced_tetration](https://github.com/EncapsulatorP/collatz_quasi_particle_by_forced_tetration), [prime-tower-diagnostics](https://github.com/EncapsulatorP/prime-tower-diagnostics), [ZP_type2_sector_invariants](https://github.com/EncapsulatorP/ZP_type2_sector_invariants).

**Deliverable:** Map/version manifest with integer restriction, branch choice, update, observable, horizon, normalization, derivative and escape handling for one representative run per model.

**Success:** README, formulas and executed paths agree; standard and accelerated Collatz, logistic cocycles and frac maps are distinct; repeated output has a known meaning.

**Useful negative outcome:** A former comparison proves to use different models; preserve both as separate experiments and state what narrower result survives.

**Entry/exit gate:** No transferred convergence, Lyapunov or physical claim until object identity is checked. Keep the forced-tetration acceleration promise out of the schedule.

### T03 · Validatron constructive calibration slice

**Repositories:** [Validatron](https://github.com/EncapsulatorP/Validatron), [antiverse](https://github.com/EncapsulatorP/antiverse), [goldbach_busy_collatz](https://github.com/EncapsulatorP/goldbach_busy_collatz), [collatz_backoff](https://github.com/EncapsulatorP/collatz_backoff), [Diophantus](https://github.com/EncapsulatorP/Diophantus), [zp-program](https://github.com/EncapsulatorP/zp-program).

**Deliverable:** A small versioned claim set with exact source spans, variants, assumptions, Lean environment and replay records; start with modular bijection, least-element repair, finite identity and conditional-claim examples.

**Success:** Exact, repaired, conditional, finite, unresolved and malformed-source cases stay distinct. At least one exact local theorem replays and one invalid variant has an applicable witness.

**Useful negative outcome:** An unavailable Lean tool, semantic mismatch or missing ground is surfaced as unresolved with a constructive next step; no fabricated proof status.

**Entry/exit gate:** Target_planning is the intended architecture, not evidence the knowledge graph/rankers/repair engine are already built. Broad RAG/agent orchestration follows measured calibration.

### T04 · Rupert/Collatz finite geometry capsule

**Repositories:** [collatz_rupert_delay_embedding](https://github.com/EncapsulatorP/collatz_rupert_delay_embedding), [collatz_kesten-goldie](https://github.com/EncapsulatorP/collatz_kesten-goldie), [prime-tower-diagnostics](https://github.com/EncapsulatorP/prime-tower-diagnostics).

**Deliverable:** Pinned multi-seed trajectory and delay-hull report with raw/log transforms, lag/horizon controls, projection geometry and declared proxy output.

**Success:** The special geometry persists under declared controls or its dependence on coordinate choices is quantified; export a reproducible result that feeds the website.

**Useful negative outcome:** Totient/helix or Rupert intuitions fail as universal claims; retain exact affine-line parity geometry and a clear bounded negative result.

**Entry/exit gate:** Use the dedicated Rupert audit for detailed targets. Proxy failure does not certify non-Rupert; finite stabilization does not settle Collatz.

### T05 · Goldbach exact bridge with held-out inference

**Repositories:** [goldbach_busy_collatz](https://github.com/EncapsulatorP/goldbach_busy_collatz), [Erdos-Straus-Schinzel](https://github.com/EncapsulatorP/Erdos-Straus-Schinzel), [Periodic-Table-of-Primes-210](https://github.com/EncapsulatorP/Periodic-Table-of-Primes-210), [Catalan_ruelle_mayer](https://github.com/EncapsulatorP/Catalan_ruelle_mayer), [NT_goldbachy_disastrous_cake](https://github.com/EncapsulatorP/NT_goldbachy_disastrous_cake).

**Deliverable:** A bounded NTT/CRT/chi4 evidence capsule plus a frozen residual benchmark and explicit feature-availability ledger.

**Success:** Exact conventions agree, held-out comparison survives matched modular/shuffle baselines and any retained improvement uses allowed inputs.

**Useful negative outcome:** A proposed χ4 feature adds no information because it is determined by counts/mod4, or an ESC improvement depends on already-known fibers; record the informative boundary and retain the exact identities.

**Entry/exit gate:** Resolve optional tower checkout before calling it connected. Readiness manifest does not equal Validatron proof execution.

### T06 · Recamán finite persistence and rare-slip benchmark

**Repositories:** [recaman](https://github.com/EncapsulatorP/recaman), [Obstruction-Theory](https://github.com/EncapsulatorP/Obstruction-Theory), [c3._2z](https://github.com/EncapsulatorP/c3._2z).

**Deliverable:** A finite remains-unseen-through-cN target and a phase-slip task, with later-horizon holdouts, simple baselines and calibrated uncertainty.

**Success:** A fixed feature family improves a held-out decision metric beyond magnitude/recency/previous-bit baselines, or compression/provenance gains are reproduced exactly.

**Useful negative outcome:** Tower/wheel geometry adds no predictive separation; retain the benchmark and identify which process state actually explains slips.

**Entry/exit gate:** Catalogued hole, finite nonvisit, blocked step and absolute obstruction are different labels. Existing saved checkpoints do not prove permanent absence.

### T07 · Exact tower and conditional Z(p) notebook consolidation

**Repositories:** [zp-program](https://github.com/EncapsulatorP/zp-program), [c3._2z](https://github.com/EncapsulatorP/c3._2z), [prime_tower_decomposition](https://github.com/EncapsulatorP/prime_tower_decomposition), [Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers](https://github.com/EncapsulatorP/Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers), [YPer](https://github.com/EncapsulatorP/YPer).

**Deliverable:** Short exact identity fixtures for prime-layer order/logarithmic remainder plus precise Schanuel-conditional statements, parameter/precision ledgers and source links to recovered Mahler material.

**Success:** Each exact identity is reproducible, each conditional theorem exposes assumptions, and each numerical search states its bounds.

**Useful negative outcome:** A desired identity depends on tuning or representation; preserve sensitivity/unit controls and a narrower exact statement.

**Entry/exit gate:** No PSLQ nonhit becomes an independence proof. Mahler source recovery belongs to the external recovered physics atlas, not an assumed module in these32 repos.

### T08 · Diophantus seeded exact-search comparison

**Repositories:** [Diophantus](https://github.com/EncapsulatorP/Diophantus), [NT_goldbachy_disastrous_cake](https://github.com/EncapsulatorP/NT_goldbachy_disastrous_cake), [prime_tower_decomposition](https://github.com/EncapsulatorP/prime_tower_decomposition).

**Deliverable:** Known-identity corpus and equal-budget MITM comparison of lexical, tower-order and Gloden/PTE-derived seed buckets.

**Success:** A search strategy improves time/states-to-known-target across untouched instances, with exact solution sets preserved.

**Useful negative outcome:** An ordering helps one fixture but harms others, or AMMI remains uninformative; keep lexical MITM and archive the bounded comparison.

**Entry/exit gate:** Ordering is not admissible pruning. Doubling creates multigrades with larger term counts; no ideal-term identity is scheduled as guaranteed.

### T09 · Mertens lattice numerical credibility gate

**Repositories:** [mertens_counterexamples](https://github.com/EncapsulatorP/mertens_counterexamples), [Gaussian_Unitary_Ensemble](https://github.com/EncapsulatorP/Gaussian_Unitary_Ensemble), [NT_goldbachy_disastrous_cake](https://github.com/EncapsulatorP/NT_goldbachy_disastrous_cake), [goldbach_busy_collatz](https://github.com/EncapsulatorP/goldbach_busy_collatz).

**Deliverable:** Tiny exact CVP/BDD fixtures, Python/C++ agreement report, input-hash/precision manifest and candidate-versus-certified-bound labels.

**Success:** Radius conventions, coordinate transforms and returned candidate norms agree on tractable instances; a precision policy justifies any larger run.

**Useful negative outcome:** Float conversions or modular-rank assumptions disagree with exact fixtures; localize the arithmetic issue before spending on high-dimensional BKZ.

**Entry/exit gate:** Spacing-quality zeta zeros cannot substitute for certified Mertens phase data. A y candidate is not a new counterexample certificate.

### T10 · One physics/biophysics feasibility capsule

**Repositories:** [rolt-phi-kappa3_expand](https://github.com/EncapsulatorP/rolt-phi-kappa3_expand), [Time_reversal_simulations](https://github.com/EncapsulatorP/Time_reversal_simulations), [c3._2z](https://github.com/EncapsulatorP/c3._2z), [Fixed-Point-Shadow](https://github.com/EncapsulatorP/Fixed-Point-Shadow), [YPer](https://github.com/EncapsulatorP/YPer).

**Deliverable:** Choose one concrete stability-versus-depth model, compare matched controls and write a source-grounded extension card for synthetic alphabet/decay questions in the external physics atlas.

**Success:** The chosen observable, units, noise model and baseline are explicit; an interior optimum survives controls or its parameter dependence is measured.

**Useful negative outcome:** An apparent universal optimum is imposed by the chosen profiles, a source function remains missing, or an analogy lacks a model; retain a bounded mechanism question.

**Entry/exit gate:** No universal DNA alphabet ceiling of40, Riemann-hypothesis resolution, recovered brane mechanism or LiDAR integration is established by these org sources. Those remain separate source/model recovery tasks.

## Twelve high-value research links

| Edge | From → to | Type | Why it matters |
|---|---|---|---|
| E07 | [Validatron](https://github.com/EncapsulatorP/Validatron/blob/ad7ad831638e5c3d282331335f150afbbd98b64f/target_planning.md) → [goldbach_busy_collatz](https://github.com/EncapsulatorP/goldbach_busy_collatz/blob/5adbd7d32efbec7f98ac51ee90d03cd347b249e1/RESEARCH_BRIDGE.md) | proposed reuse | Goldbach's Validatron-manifest hook reports readiness only; proposed exact χ4/CRT/count lemmas become semantic/proof fixtures for the actual proof stack. |
| E08 | [Validatron](https://github.com/EncapsulatorP/Validatron/blob/ad7ad831638e5c3d282331335f150afbbd98b64f/target_planning.md) → [antiverse](https://github.com/EncapsulatorP/antiverse/blob/5c3ed702b79fecf5f853022a251de513ca3e0384/docs/threads/proof-relative-anti-theorems.md) | proposed reuse | Antiverse's exact preorder/partial-order example supplies original, failed, repaired and quotient statements for Validatron's assumption/variant lineage. |
| E03 | [goldbach_busy_collatz](https://github.com/EncapsulatorP/goldbach_busy_collatz/blob/5adbd7d32efbec7f98ac51ee90d03cd347b249e1/RESEARCH_BRIDGE.md) → [Catalan_ruelle_mayer](https://github.com/EncapsulatorP/Catalan_ruelle_mayer/blob/1aa0f8d76753cfa34d128d5d29598bb94eaf2131/src/catalan_mg/core.py) | shared mathematical object | The exact χ4-weighted Goldbach identity and Li_s(i)/Dirichlet-beta decomposition are written in the bridge; Catalan generator evaluates the same polylog channels. No common Ruelle–Mayer determinant is established. |
| E05 | [goldbach_busy_collatz](https://github.com/EncapsulatorP/goldbach_busy_collatz/blob/5adbd7d32efbec7f98ac51ee90d03cd347b249e1/RESEARCH_BRIDGE.md) → [Periodic-Table-of-Primes-210](https://github.com/EncapsulatorP/Periodic-Table-of-Primes-210/blob/03ff7288dab0b0e45aa517cc54cf29f1e7578aad/README.md) | shared mathematical object | The Goldbach local CRT kernel and the PTP wheel both use unit residue classes, including mod210. Local compatibility counts do not establish prime existence. |
| E16 | [prime-tower-diagnostics](https://github.com/EncapsulatorP/prime-tower-diagnostics/blob/23450b6b5ed6024c662cae23d3e0644a3ed8510b/README.md) → [collatz_rupert_delay_embedding](https://github.com/EncapsulatorP/collatz_rupert_delay_embedding/blob/cf7e78217e05d9568e0382be3577254a1d96f167/docs/CLAIMS_AND_NONCLAIMS.md) | proposed reuse | Both use delayed geometric views of scalar dynamics. A common lag/normalization/null suite can test how much visible structure comes from coordinate choices. |
| E17 | [collatz_rupert_delay_embedding](https://github.com/EncapsulatorP/collatz_rupert_delay_embedding/blob/cf7e78217e05d9568e0382be3577254a1d96f167/README.md) → [collatz_kesten-goldie](https://github.com/EncapsulatorP/collatz_kesten-goldie/blob/791f509561d1d4cf77a471e94e808648741858ed/README.md) | shared mathematical object | Delay-hull geometry and affine-recursion tail diagnostics can be evaluated on the same pinned integer trajectories after map/gauge conventions are matched. |
| E19 | [collatz_lift](https://github.com/EncapsulatorP/collatz_lift/blob/7134ef3e85474810575209c436be8b6b16e8c5f2/scripts/core/collatz.py) → [collatz_quasi_particle_by_forced_tetration](https://github.com/EncapsulatorP/collatz_quasi_particle_by_forced_tetration/blob/e712b2e5d9ca4f1da5c973be9b7a39753b8a127b/MODEL.md) | shared mathematical object | Lift code uses accelerated odd branch and H_hat=G(exp u)-u-ln2; forced tetration uses standard odd branch in an exponential feedback update. README formulas in lift currently disagree with its code. |
| E13 | [c3._2z](https://github.com/EncapsulatorP/c3._2z/blob/7e8fb577bd3eb8da2e358d691164a9fee5c75f9b/README.md) → [prime_tower_decomposition](https://github.com/EncapsulatorP/prime_tower_decomposition/blob/9209c146480916235c148db03f8797a2a997d19a/README.md) | shared mathematical object | Both study digit prime-power depth and logarithmic propagation/remainders; C3 explicitly varies physical units and prime-layer order, while decomposition studies decimal mirrors. |
| E02 | [goldbach_busy_collatz](https://github.com/EncapsulatorP/goldbach_busy_collatz/blob/5adbd7d32efbec7f98ac51ee90d03cd347b249e1/RESEARCH_BRIDGE.md) → [mertens_counterexamples](https://github.com/EncapsulatorP/mertens_counterexamples/blob/8c03e6468e216091050cc81b0793a9191cbe4b1e/README.md) | proposed reuse | Goldbach capsule has exact finite μ/M(n) checks; Mertens repo has lattice candidate enumeration. Use compatible evidence schemas, while preserving different mathematical claims. |
| E06 | [goldbach_busy_collatz](https://github.com/EncapsulatorP/goldbach_busy_collatz/blob/5adbd7d32efbec7f98ac51ee90d03cd347b249e1/scripts/research_bridge.py) → [Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers](https://github.com/EncapsulatorP/Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers/blob/b07d1d3bac745ed8bb43fe6be0e7279d5c700818/scripts/boundary_residues/repunit_tower.py) | proposed reuse | Goldbach implements an optional import of boundary_residues.constructive, but the current boundary repo main lacks that module and notes/real_tower_theorem.md. Present repunit_tower code is a distinct object. |
| E10 | [Validatron](https://github.com/EncapsulatorP/Validatron/blob/ad7ad831638e5c3d282331335f150afbbd98b64f/target_planning.md) → [zp-program](https://github.com/EncapsulatorP/zp-program/blob/70454700844d882615b9ff93fed17b5707af834d/z_p/proof_sketch.md) | proposed reuse | Z(p)'s exact rational reduction and Schanuel-conditional claims exercise assumption closure and precision-bounded PSLQ evidence handling. |
| E11 | [recaman](https://github.com/EncapsulatorP/recaman/blob/056452f2be03dad5f7bca0f7024c8357f42d8c6b/README.md) → [Obstruction-Theory](https://github.com/EncapsulatorP/Obstruction-Theory/blob/8d5fc9d48835012748e444fecc20df3a9ef46653/README.md) | proposed reuse | Recamán distinguishes missing-value candidates from blocked process steps. That exact distinction is a useful seed for a typed obstruction ledger; the target repo currently contains only a remit. |

## All32 repositories: first finite target

Visibility records current GitHub source access, not a restriction on the authorized public roadmap.

| Repository | Visibility | Current role/state | First finite target | Priority / effort |
|---|---|---|---|---|
| [prime-polarity](https://github.com/EncapsulatorP/prime-polarity/blob/b91862c9b21c5c47ede33a29374be2d152241b9d/README.md) | public | Prime/composite separation benchmark. Working package, CLI, dataset/evaluation scripts, tests and CI files; performance not rerun. | Freeze odd-only and coprime held-out windows, tie-aware AUC, modular and shuffled controls; record runtime and uncertainty. | P2; 4–8 h |
| [zp-program](https://github.com/EncapsulatorP/zp-program/blob/70454700844d882615b9ff93fed17b5707af834d/README.md) | public | Bounded integer-relation exploration and conditional transcendence targets. PSLQ experiments, even-zeta reduction, tests and CI; proof sketch contains claims needing repair, separate from numerical scans. | Port the exact rational reduction and carefully stated Schanuel-conditional finite-family result; retain precision/degree/height limits on every PSLQ outcome. | P1; 4–8 h |
| [Periodic-Table-of-Primes-210](https://github.com/EncapsulatorP/Periodic-Table-of-Primes-210/blob/03ff7288dab0b0e45aa517cc54cf29f1e7578aad/README.md) | public | Mod-210 residue prioritization and segmented prime sieve. Library and CLI implement subset mode and cover-all mode, with tests and CI; no speed advantage established in this audit. | Compare full coverage and residue prioritization against a standard sieve at fixed memory/time, publish coverage plus ordering benefit. | P2; 4–8 h |
| [rolt-phi-kappa3_expand](https://github.com/EncapsulatorP/rolt-phi-kappa3_expand/blob/158e509ed6fa05c7e282f761637d700fc00d36f9/README.md) | public | Recursive depth/coherence trade-offs in illustrative QAOA and Dirac models. Multiple simulation scripts and paper scaffold; outputs directories are placeholders; parameters illustrative and QAOA angles fixed heuristics. | Choose one small matched-variance/noise model; export reproducible sweeps with optimized and fixed-angle baselines, test whether interior optimal depth persists. | P3; 8–16 h |
| [Gaussian_Unitary_Ensemble](https://github.com/EncapsulatorP/Gaussian_Unitary_Ensemble/blob/629a896a65ce6cd2e592cf7473a3d971d2471417/README.md) | public | Zeta/prime spectral-spacing controls. Runnable models, zero scanning, unfolding and saved summary; README explicitly experimental, no RH proof; no test/CI files in inspected tree. | Reproduce a sufficiently populated reference zero window, compare scan resolution/precision and negative controls; reconcile counts with independent critical-line reference. | P3; 8–12 h |
| [collatz_backoff](https://github.com/EncapsulatorP/collatz_backoff/blob/0a8a3b0bbefc68f818b61b79030b26da10bcc3aa/README.md) | public | Collatz-seeded affine-permutation retry scheduling demo. Actual scheduling package, Kubernetes examples, benchmark and tests; affine bijection gives collision-free offsets under stated IDs/slot assumptions, not an end-to-end network throughput result. | Use the modular bijection as a small Validatron theorem fixture and run a bounded retry benchmark against random and deterministic baselines. | P2; 4–8 h |
| [collatz_quasi_particle_by_forced_tetration](https://github.com/EncapsulatorP/collatz_quasi_particle_by_forced_tetration/blob/e712b2e5d9ca4f1da5c973be9b7a39753b8a127b/README.md) | public | Forced complex tetration with cosine Collatz gate. Core package and CLI, configurations, experiments/tests/CI exist; README/MODEL mix finite computational model with unsupported universal/physical language; correction_plan proposes unproved acceleration claims. | Version the precise standard-odd gate, feedback, branch and escape conventions; reproduce one finite survival/echo sweep before interpreting physical analogies. | P1; 8–16 h |
| [collatz_rupert_delay_embedding](https://github.com/EncapsulatorP/collatz_rupert_delay_embedding/blob/cf7e78217e05d9568e0382be3577254a1d96f167/README.md) | public | Collatz delay-hull geometry and Rupert proxy experiments. Python trajectory, hull, projection and scan code plus claim boundaries; finite geometry/proxy program, not a Collatz or Rupert certificate; dedicated deeper audit runs in parallel. | Reproduce a small multi-seed delay-hull capsule with raw/log embeddings, dimension/lag controls and explicit proxy-versus-certificate output. | P1; 8–16 h |
| [ZP_type2_sector_invariants](https://github.com/EncapsulatorP/ZP_type2_sector_invariants/blob/01c93cdf96efe585d10bb4b8d54b73e741f96101/README.md) | private | Parity, chi4, Catalan/Narayana and residue signatures. Real Python modules/tests and published numeric artifacts; README describes companion sweeps from temporary files, not a versioned import; README claim narayana_fit absent is stale relative to tree. | Reconcile test discovery/docs, export one versioned signature contract, rerun matched companion trajectories and compare against simple parity baselines. | P2; 6–12 h |
| [Fixed-Point-Shadow](https://github.com/EncapsulatorP/Fixed-Point-Shadow/blob/26744b515fcb08e9aa9065f56abeb71f352fb65d/README.md) | private | Conceptual framework for tractable regions, boundaries and inverse information loss. README only; conjectures and analogies explicitly marked, no executable or formal implementation. | Select one concrete map/query class, make D(S) precise, and write a worked example plus a counterexample to an overbroad formulation. | P3; 4–8 h |
| [recaman](https://github.com/EncapsulatorP/recaman/blob/056452f2be03dad5f7bca0f7024c8357f42d8c6b/README.md) | public | Recamán value obstructions and process phase slips. Substantial tested research code, three local Gradio apps, provenance/wiki, saved measurements; finite holes and blocked steps explicitly distinct; old Open-Questions provenance gap is partially superseded by README. | Freeze a finite horizon forecasting task and rare phase-slip benchmark; compare geometry features with magnitude, visited-neighbor and previous-bit baselines using later holdouts. | P1; 12–24 h |
| [prime_tower_decomposition](https://github.com/EncapsulatorP/prime_tower_decomposition/blob/9209c146480916235c148db03f8797a2a997d19a/README.md) | private | Decimal prime-factor depths, logarithmic tower echoes and mirror/Newton diagnostics. Working scripts, tests and outputs; finite base-10 classification and exact logarithmic identities coexist with heuristic search diagnostics. | Publish explicit representation/unit/base contracts and one matched non-mirror control; extract a small tested log-remainder/valuation fixture for reuse. | P2; 6–12 h |
| [Time_reversal_simulations](https://github.com/EncapsulatorP/Time_reversal_simulations/blob/64c297d4e64265f646287dc071a6083a8105a726/README.md) | private | Root continuation and comparison of reconstructed secular models. Generator, zero scanner, continuation and saved outputs; original generating function unrecovered; empirical surrogates and physical comparison models explicitly separated. | Version each model and contour contract, reproduce root counts/conjugacy with refinement checks, record what source reconstruction still cannot determine. | P3; 8–16 h |
| [c3._2z](https://github.com/EncapsulatorP/c3._2z/blob/7e8fb577bd3eb8da2e358d691164a9fee5c75f9b/README.md) | public | Tower perturbations, prime-layer order and representation-dependent physics exhibits. Active web laboratory plus analytic Python sweeps and recorded outputs; exact local map identities and finite toy-physics views distinguished in current README. | Turn exact prime-layer order and logarithmic perturbation identities into compact reproducible fixtures; retain unit-change controls and finite Recamán/optical analogy boundaries. | P1; 6–12 h |
| [zeta_branching](https://github.com/EncapsulatorP/zeta_branching/blob/96c28da08d6d0a76cb2e625062f59abbb51eb93f/README.md) | public | Recursive zeta-inspired complex kernels and learned rendering surrogates. Runnable direct kernels, PyTorch surrogates, saved models and visual artifacts; no formal equivalence or physical PDE solver established. | Define one kernel/branch/depth contract and evaluate surrogate error on held-out parameters and depth, including branch-cut and overflow regions. | P3; 8–12 h |
| [goldbach_busy_collatz](https://github.com/EncapsulatorP/goldbach_busy_collatz/blob/5adbd7d32efbec7f98ac51ee90d03cd347b249e1/README.md) | public | Exact finite Goldbach counts and reusable arithmetic evidence capsule. Integer NTT backend, tests/CI and bounded provenance report exist; Collatz is historical and Busy Beaver a separate toy; optional tower adapter needs an explicit compatible checkout. | Freeze exact count/CRT/chi4 fixtures and held-out heuristic residual comparison; resolve optional tower source and expose manifest schema for Validatron without claiming live service. | P1; 8–16 h |
| [Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers](https://github.com/EncapsulatorP/Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers/blob/b07d1d3bac745ed8bb43fe6be0e7279d5c700818/README.md) | public | Boundary-path geometry, inverse repunit towers and Brun/Collatz remainder comparisons. Runnable package, figures and tests; reproduces tunable numerical matches with sensitivity warnings; main lacks constructive.py and notes/real_tower_theorem.md expected by Goldbach optional adapter. | Reconcile exact sign-flip theorem source with present repunit branch, and publish map-specific intervals, multiplier and matched-control report; wire only a verified compatible adapter. | P2; 6–12 h |
| [prime-tower-diagnostics](https://github.com/EncapsulatorP/prime-tower-diagnostics/blob/23450b6b5ed6024c662cae23d3e0644a3ed8510b/README.md) | public | Factorial-coefficient valuations, dependence and tower/Lyapunov diagnostics. Many scripts and saved runs; written six-map lemma and plotting implementation concern different models; no test/CI files in inspected tree. | Separate factorial valuations, intended frac maps and logistic toy cocycles into versioned objects; repair time-horizon/normalization reporting and repeat one controlled comparison. | P1; 8–16 h |
| [collatz_lift](https://github.com/EncapsulatorP/collatz_lift/blob/7134ef3e85474810575209c436be8b6b16e8c5f2/README.md) | public | Complex/log-plane lifted observables and sector/root diagnostics. Core and analysis scripts with saved roots; no tests. README formula differs from code in gate and H; code uses accelerated odd gate and a clipped exponential surrogate. | Reconcile README with exact implemented gate/H, version clipped/unclipped observables, then verify argument-principle counts and derivatives on bounded analytic domains. | P1; 8–16 h |
| [Validatron](https://github.com/EncapsulatorP/Validatron/blob/ad7ad831638e5c3d282331335f150afbbd98b64f/README.md) | private | Constructive source-to-formal-mathematics proof-development stack. Real deterministic ingestion/triage/registry and optional Lean replay; several proposer adapters shells; extensive target_planning spec is not implemented evidence; repoaccess contains local examples, not org imports. | Build calibration claims from exact finite repo fixtures; preserve source/variant/formal/evidence lineage; pin Lean/mathlib replay and semantic-fidelity states before cross-repo proof claims. | P0; 16–32 h |
| [Erdos-Straus-Schinzel](https://github.com/EncapsulatorP/Erdos-Straus-Schinzel/blob/43e99b9b4be67462c2ab232e23fde0006ae99131/README.md) | public | Generalized Egyptian-fraction compression gates and Goldbach channel diagnostics. Two ML/arithmetical scripts and saved result JSON/CSV; restricted first-denominator gate, not full conjecture; next_steps partly stale and includes unverified theory suggestions. | Audit feature availability and solution-fiber leakage, reproduce restricted-gate witnesses exactly, then compare held-out prime-fiber diagnostics against count/modular baselines. | P2; 8–16 h |
| [collatz_kesten-goldie](https://github.com/EncapsulatorP/collatz_kesten-goldie/blob/791f509561d1d4cf77a471e94e808648741858ed/README.md) | public | Affine-recursion regime/tail comparisons for Collatz-like maps. Scanner, representation screener, reports and plots; finite results explicitly unstable in several channels; simple shuffle does not establish a strong dependence separation. | Freeze raw/SSI gauge and additive driver, compare longer block-preserving dependence controls and tail-threshold stability before transferring Kesten assumptions. | P2; 8–16 h |
| [gilbreath](https://github.com/EncapsulatorP/gilbreath/blob/b1f26aceda871723ad8218fc76c4bf8ebe5e881e/README.md) | private | Gilbreath/Pascal modular automata and RPPTD-flavored transforms. Runnable scripts and saved examples, no tests in inspected tree; exact RPPTD transform remains a placeholder according to nextsteps; README entrypoint links include stale local paths. | Identify canonical wrapper, replace one placeholder transform with an explicit definition and run prime-gap versus Cramér/modulus-matched controls. | P3; 6–12 h |
| [antiverse](https://github.com/EncapsulatorP/antiverse/blob/5c3ed702b79fecf5f853022a251de513ca3e0384/README.md) | private | Assumption changes, proof-relative anti-theorems and surviving structures. Recovered manuscript and six source-led notes with exact local examples; no proof-assistant implementation or general generator. | Formalize the partial-order/preorder least-element example with variant lineage; use it to test Validatron distinguishes proof failure, countermodel and repaired theorem. | P2; 4–8 h |
| [Catalan_ruelle_mayer](https://github.com/EncapsulatorP/Catalan_ruelle_mayer/blob/1aa0f8d76753cfa34d128d5d29598bb94eaf2131/README.md) | public | Exploratory Catalan/polylog channels, pressure proxies and reproducible visuals. Canonical Python generators and organized output manifest; PDF narrative and finite-cutoff proxies, not a signed determinant or Selberg-zeta theorem; README entrypoint paths need reconciliation with scripts/ tree. | Promote exact beta/polylog finite identities to a small capsule; label cutoff dependence of pressure plots and write the missing operator/trace obligations. | P2; 6–12 h |
| [Diophantus](https://github.com/EncapsulatorP/Diophantus/blob/3cdd74f11133d6aca24ce1bfa563181b06550ce7/README.md) | private | Exact bounded LPS/T(n,k) searches versus tower ordering heuristics. Extensive exact-search/diagnostic scripts and stored benchmarks; MITM stable core, tower-AMMI currently uninformative; future integrations are proposals, not code dependencies. | Freeze known identity corpus; compare exact MITM with Gloden/PTE seed and tower orderings under equal candidate/time budgets, recording success and null outcomes. | P2; 12–24 h |
| [NT_goldbachy_disastrous_cake](https://github.com/EncapsulatorP/NT_goldbachy_disastrous_cake/blob/b0fd5c981cf3a867c18de65196dbfae494256d62/README.md) | private | Reusable analytic/arithmetic number-theory modules and toy models. Organized Python modules for special/modular/arithmetic functions, zero scanning and Goldbach examples; integrations directory only .gitkeep, no established org integration. | Select exact arithmetic and Hardy-Z helpers; add bounded reference fixtures and export contracts, then propose reuse in Goldbach/GUE without coupling unrelated toy ODEs. | P2; 8–16 h |
| [mertens_counterexamples](https://github.com/EncapsulatorP/mertens_counterexamples/blob/8c03e6468e216091050cc81b0793a9191cbe4b1e/README.md) | private | Lattice-based Mertens counterexample candidate search and matroid views. Python enumeration/matroid pipeline, C/C++ sources and zeta-zero/basis data; no tests/CI in tree; no independently certified new counterexample in this audit. | Validate tiny exact CVP instances and Python/C++ radius/ordering agreement; preserve input precision and candidate-to-certified-bound distinction before larger BKZ runs. | P2; 12–24 h |
| [EncapsulatorP.github.io](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/4550d58bfbac58025de20df47b5844f88fa5c3fa/README.md) | public | Public research atlas, interactive exhibits and organization decision index. Active static site with 45-entry atlas/build/verification scripts and many working rooms; public navigation supports existing research; roadmap needs full32 inventory and typed searchable graph. | Publish the source-linked32-repository roadmap, decision targets and searchable edge graph; preserve exact/finite/conditional/analogy status and review links. | P0; 8–16 h |
| [.github](https://github.com/EncapsulatorP/.github/blob/627457ea62936f3648bd54d9ee435589553f5ddc/profile/README.md) | public | Organization GitHub profile and navigation entry point. Profile README/assets currently link public research atlas and selected repositories; backoff description inaccurate relative to its scheduling implementation. | Link the new planning/decision page and update concise portfolio roles from the canonical inventory, keeping one maintained destination. | P0; 1–2 h |
| [YPer](https://github.com/EncapsulatorP/YPer/blob/4f8c7b0fecc95f9568ccfa8b52ed968b9fc998b0/README.md) | private | Hyperconstructions, morphing, chainladders and quantization seed. README only: title plus one-sentence remit; no definitions, code, benchmark or established integration. | Write one model card with state, layer composition, observable and falsifiable finite target; connect only after choosing a concrete construction. | P3; 2–4 h |
| [Obstruction-Theory](https://github.com/EncapsulatorP/Obstruction-Theory/blob/8d5fc9d48835012748e444fecc20df3a9ef46653/README.md) | private | Crossdomain obstruction theory seed. README only: title and one-sentence remit; no general obstruction engine or formal crossdomain result. | Create a typed obstruction ledger with one exact antiverse case, one finite Recamán case and one bounded Diophantine case; record why their obstruction notions differ. | P2; 3–6 h |

## Suggested review cadence and capacity discipline

- **Weeks1–2:** finish the public registry/searchable graph, reconcile highest-impact model contracts, and choose the first exact Validatron calibration fixtures plus the Rupert capsule.
- **Weeks3–4:** complete the bounded Rupert/Goldbach evidence interfaces and the minimal Validatron replay/fidelity path if the toolchain is available. Record integration gaps instead of hiding them.
- **Weeks5–8:** select at most2 research capsules from Recamán, exact tower/Z(p) consolidation and Diophantus, based on completed gates and available hours. Preserve useful negative findings as first-class results.
- **Weeks9–12:** reconsider the queue. Mertens earns larger compute only after exact small-instance agreement. One physics/biophysics feasibility capsule can proceed if source/model recovery is sufficient. GUE, Time_reversal, zeta branching, Gilbreath, ROLT, YPer and Fixed-Point-Shadow retain concrete queued targets even when not active.

At every two-week review: record the strongest new evidence, actual focused hours, unresolved assumption/source, continue/repair/park decision and the next smallest informative experiment. Reopen parked work when a named trigger changes—new source, corrected definition, independent replication or a reusable capability—not simply because its context was forgotten.

## Deliverables for the root planner

- `repo-evidence.json`: canonical32-repo metadata, source URLs, purposes, current states, finite targets, effort/priority suggestions, concept keywords and edge IDs.
- `interlinks.json`:36 typed research edges;2 verified navigation links; optional adapter A01 separately labeled unresolved.
- `repo-source-cache.json`: temporary audit source cache, including exact README text and tree paths. It is not proposed for publication; some source text contains obsolete machine paths and unrelated historical chatter.

No external repository was changed by this audit. No proof run, full test run, recurring automation, or new compute experiment was started.

