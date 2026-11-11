# Hibernating Lemmas

Exact, elementary statements used on the site (Treasures 001–004).
Notation: μ is the Möbius function; Ω(n) counts prime factors with multiplicity.

Status of every item: written elementary proof; finite sanity check in
`verify_lemmas.py`; Lean formalization pending, no machine-checked proof claimed.

## 001 · twin_primes_moebius

**Statement.** If p and p + 2 are both prime and m = p + 1, then

    (μ(m² − 1), μ(m²)) = (+1, 0).

**Proof.** m² − 1 = p(p + 2) is a product of two distinct primes, so
μ = (−1)² = +1. Since m ≥ 2, m² has a square divisor greater than 1, so μ(m²) = 0. ∎

Specimen: 35 = 5 · 7, 36 = 6².

## 002 · centre_gap_product

**Statement.** For odd primes p ≤ q put m = (p + q)/2 and d = (q − p)/2. Then
m, d are integers, p = m − d, q = m + d and

    pq = m² − d².

Goldbach for 2m is a search over d at fixed centre m. Twin primes are a search
over m at fixed half-gap d = 1.

**Proof.** p, q odd gives integer m, d; expand (m − d)(m + d). ∎

For p ≠ q, μ(pq) = +1; on the diagonal p = q, d = 0 and μ(p²) = 0.

## 003 · square_neighbour_filter (counterexample)

**Statement.** μ(m² − 1) = +1 does **not** imply that m − 1 and m + 1 are prime.

**Witness.** m = 34: m² − 1 = 1155 = 3 · 5 · 7 · 11, μ(1155) = +1, μ(1156) = 0,
while 33 = 3 · 11 and 35 = 5 · 7. This is the smallest witness; the next are
m = 56, 86, 92, 94, 104.

μ = +1 says "squarefree with an even number of prime factors". It cannot tell
two from four or six. Below m = 200,000 there are 2,160 twin centres and 30,215
non-twin centres with μ(m² − 1) = +1.

## 004 · exact_twin_test

**Statement.** For an integer m ≥ 3,

    m − 1 and m + 1 are both prime  ⇔  Ω(m² − 1) = 2.

**Proof.** m² − 1 = (m − 1)(m + 1) with both factors ≥ 2, so
Ω(m² − 1) = Ω(m − 1) + Ω(m + 1) ≥ 2, with equality iff each factor is prime. ∎

Squarefreeness is automatic because m − 1 ≠ m + 1, which recovers 001.

**Remark (away from squares).** For distinct primes p, q:
(μ(pq), μ(pq + 1)) = (+1, 0) ⇔ pq + 1 is not squarefree. The first component
is automatic. Twins give the certificate pq + 1 = (p + 1)², but are not needed:
3 · 13 = 39, 40 = 2³ · 5.

## What these do not show

None of 001–004 gives infinitely many twin primes or a Goldbach pair at every
centre. They are coordinates and local identities.

## Corrections log (11 Nov 2026)

An earlier draft of the "does not characterize twin primes" paragraph used
examples that do not support it. Recorded here so they are not reused:

| Draft claim | Fact | Verdict |
|---|---|---|
| μ(21² − 1) = μ(440) = 0 as a non-example | 440 = 2³ · 5 · 11, μ = 0 | true but irrelevant: m odd always gives 8 ∣ m² − 1 |
| μ(15² − 1) = μ(224) = 0 as a contrast | 224 = 2⁵ · 7, μ = 0 | same value, no contrast |
| m = 12 (143) vs m = 18 (323) as "decisive" | 143 = 11 · 13, 323 = 17 · 19 | both are twin products, neither is a counterexample |
| boxed "μ(pq) = 1, μ(pq + 1) = 0 ⇔ μ(pq + 1) = 0" | correct but circular as typeset | replaced by the remark under 004 |

The correct counterexample is m = 34 (Treasure 003).

## Lean targets (not yet formalized)

1. Distinct primes p, q satisfy μ(pq) = 1.
2. For m ≥ 2, μ(m²) = 0.
3. For m ≥ 3: Ω(m² − 1) = 2 ⇔ (m − 1).Prime ∧ (m + 1).Prime.
4. Corollary: twin primes give the adjacent pattern (+1, 0).

A certificate counts only with source file, toolchain version and a successful build.

## Reproduce

    python3 lemmas/verify_lemmas.py          # default limit 200000
