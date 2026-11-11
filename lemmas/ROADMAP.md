# Goldbach p + q roadmap (next steps)

Shown on the site as "Next steps". Added 11 Nov 2026.

## Shared structure: reflection versus translation

Let a(n) = 1 if n is prime, else 0, and P_X(z) = Σ_{p ≤ X, p prime} z^p.

| Problem | Exact count | Coefficient form | Required conclusion |
|---|---|---|---|
| Goldbach | G(N) = Σ_{n=2}^{N−2} a(n) a(N−n) | [z^N] P_N(z)² | G(N) > 0 for every even N ≥ 4 |
| Twin primes | T(X) = Σ_{n=2}^{X} a(n) a(n+2) | [z²] P_{X+2}(z) P_X(z⁻¹) | T(X) → ∞ |

G(N) counts ordered pairs. In the centre/half-gap coordinates of Treasure 002,
Goldbach fixes m and twins fix d = 1.

## Steps

1. **Lean (exact).** Formalize the two coefficient identities.
2. **Lean (exact).** Formalize Λ(n) = Σ_{d|n} μ(d) log(n/d) and the expansion of
   R(N) = Σ_{n=1}^{N−1} Λ(n) Λ(N−n) into two coupled Möbius sums (d | n, e | N−n).
   R(N) > 0 alone allows prime-power representations; these must be removed.
3. **Research (open).** G(N) = A(N) + E(N) with A(N) > |E(N)| for all sufficiently
   large even N, then finite verification below the threshold. Cancellation in the
   single sum Σ_{n≤x} μ(n) (the Mertens side) does not give the coupled cancellation
   needed here; sieve methods meet the parity obstruction.
4. **Our tools (proposal).** Sign-flipping towers as a model of the signed error, to
   be proved to bound it. Collatz flights for separating approximate balance from
   exact admissibility. Brun and repunits as comparison sequences. Matching a
   limiting constant does not establish pair-count positivity.
5. **Definitions to recover.** "Bernoulli limit" and "trivial inversion theorem" have
   no pinned definition yet and are not used above.

## Related notes

Inverse tower T_c(z) = c^(c^(−z)), L_tower(c) = z₊(c) − 1, compared with the Brun
deficit 2 − B₂. The numerical match is tunable by the base (see the sign-flip
section of the site and `Some_playful_boundary_paths_…/notes/boundary_residue_notes.md`).

## Status

Steps 1–2: exact identities, finite check in `verify_roadmap.py`, Lean pending.
Step 3: open. Nothing here proves Goldbach, twin primes or RH.

    python3 lemmas/verify_roadmap.py
