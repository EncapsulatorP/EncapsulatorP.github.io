# Where things live — EncapsulatorP content map

Checked on 11 Nov 2026 against shallow clones of the public repositories.
"Checked" says what was actually run, not that a mathematical claim is established.

| You call it | Repository | Start here | Checked |
|---|---|---|---|
| Grassmannian / ranked prime tower on Recamán | [recaman](https://github.com/EncapsulatorP/recaman) | `scripts/recaman_grassmannian_tower.py`, `scripts/build_obstruction_tower_space.py`, `apps/space/`, `wiki/Findings.md` | Runs (`--steps 20000`, 0.6 s). Branch signal +0.037 over shuffled null, which the script itself labels "weak or no branch separation". Window rank equals the null. |
| Recamán embeddings (delay, spatiotemporal, arc-lift) | [recaman](https://github.com/EncapsulatorP/recaman) | `scripts/recaman_phase_space_3d.py`, `outputs/recaman_phase_arc_readme.png`, `outputs/mobius_*phase*.png`, `apps/comparison/` | Test suite: 66 passed, 1 skipped, 1 failed (`outputs/deep_obstruction_frequency_results.json` is stale). |
| Spectral Newton–Collatz (zeros of the Collatz lift) | [collatz_lift](https://github.com/EncapsulatorP/collatz_lift) | `scripts/core/collatz.py` (G, H, F̂, Newton refinement), `scripts/analysis/zero_scan.py`, `scripts/core/sector.py`, `results.md` | Located and read. No test suite in the repository. |
| Collatz stopping times in 3D ("orbifolds") | [collatz_rupert_delay_embedding](https://github.com/EncapsulatorP/collatz_rupert_delay_embedding) for the 3D phase portrait; [collatz_quasi_particle_by_forced_tetration](https://github.com/EncapsulatorP/collatz_quasi_particle_by_forced_tetration) `scripts/parity_gates.py`, `docs/collatz_lifting.md` | `docs/assets/collatz_n27_funnel.html`, `scripts/generate_figures.py` | The word "orbifold" appears in no public repository. On the site it is only the six-sector lens of Collatz Metamorphoses. |
| Rupert × Collatz 3D model plan | [collatz_rupert_delay_embedding](https://github.com/EncapsulatorP/collatz_rupert_delay_embedding) | `nextsteps.md` (4-week plan), `src/collatz_polytope.py`, `scripts/generate_polytope.py`, `scripts/rupert_proxy.py`, `docs/CLAIMS_AND_NONCLAIMS.md`, `docs/assets/n27_polytope.png` | All six scripts start only with the repo root on the path (`PYTHONPATH=. python scripts/x.py`). README cites `generate_n27_plotly.py`, which is not in the repository. |
| XO₂ geometron (two-sheet ζ(z^½ + 1.25) atom) | [zeta_branching](https://github.com/EncapsulatorP/zeta_branching) | `scripts/zeta_branching.py` (`xo2_kernel`, `xo2_recursion`), `scripts/branched_mp4_zeta.py`, `proposal_version2.md`, `models/` | Kernel evaluates. Formula in code: f(z) = Σₙ₌₁ᴺ (λ/(1+eʷ))ⁿ with w = ζ((z−a)^α + b), defaults a=0, b=1.25, α=½, N=3. |
| Sign-flipping towers, Brun crossing | [Some_playful_boundary_paths_…](https://github.com/EncapsulatorP/Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers), [prime-tower-diagnostics](https://github.com/EncapsulatorP/prime-tower-diagnostics) | `scripts/`, `Lemma.md` | Structure only. |
| Twin-prime Möbius lemmas | this repository | `lemmas/LEMMAS.md`, `lemmas/verify_lemmas.py` | Script passes to 200,000. |

Not reachable in this check: `c3._2z` and the private repositories (Validatron,
mertens_counterexample, Catalan_ruelle_mayer, Diophantus).

## The Rupert × Collatz 3D model plan (from `nextsteps.md`)

1. Delay-embedded point clouds for orbits up to 10⁷; exact convex-hull vertices.
2. A scaling law for the hulls under the accelerated Collatz map.
3. A candidate invariant ("Rupert winding number"), checked computationally.
4. A short conjecture paper stating invariant and scaling law.

Status: plan. Steps 2 and 3 are stated as goals; nothing in the repository proves them.
