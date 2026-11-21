<div align="center">

<img src="assets/logo-encapsulatorp-512.png" alt="EncapsulatorP logo" width="120">

# EncapsulatorP

**computational number theory · a working archive**

*Hard problems, encapsulated.*

Most of them are still falling. A few of the questions never resolve — and we keep feeding them anyway.

**[▶ Open the live site — encapsulatorp.github.io](https://encapsulatorp.github.io/)**

[Buried Chat Stories](https://encapsulatorp.github.io/#buried-chat-stories) revisits the research conversations behind the experiments.

</div>

---

Every repository here is a **capsule**: one hard, well-defined problem, sealed together with a specific line of attack. Not a survey, not a textbook — a lab notebook that iterates. The rule of the house is honesty about status: a result that only holds under cross-validation is not a theorem, and it is never dressed as one.

### The capsules

| capsule | pairing | status | |
|---|---|---|---|
| [`collatz_kesten-goldie`](https://github.com/EncapsulatorP/collatz_kesten-goldie) | Collatz × Kesten–Goldie tails | Empirical | Public |
| [`goldbach_busy_collatz`](https://github.com/EncapsulatorP/goldbach_busy_collatz) | Goldbach × Collatz structure | Empirical | Public |
| `mertens_counterexample` | Mertens conjecture · the Riemann edge | Empirical | Private |
| `Catalan_ruelle_mayer` | Catalan × Ruelle–Mayer operators | Theoretical | Private |
| `NT_goldbachy_disastro…` | Goldbach, the frequency side | Speculative | Private |
| `Diophantus` | shared Diophantine toolkit | Tooling | Private |
| `Validatron` | the verifier · label enforcement | Tooling | Private |

### Epistemic labels

Every capsule carries one tag, enforced by `Validatron` — honest forward-chaining cross-validation, no leakage.

- **Theorem** — proven, with a citation. The only tier allowed to speak with certainty.
- **Empirical** — supported by computation that survives honest cross-validation. True so far, not proven.
- **Conjectural** — a stated hypothesis actively under test, with the test written down first.
- **Speculative** — early, partial, or abandoned. Kept as record because a mapped dead end has value.
- **Tooling** — infrastructure, not a claim.

---

<div align="center"><sub>chasing objects that may never resolve, under a planet named for melancholy · mostly pending, gloriously</sub></div>

---

### Hibernating Lemmas

Small exact identities with written proofs, shown on the site as Treasures 001–004:
twin primes and the Möbius pattern (+1, 0), the centre/half-gap product pq = m² − d²,
the m = 34 counterexample to the converse, and the exact test Ω(m² − 1) = 2.

- Statements, proofs and corrections log: [`lemmas/LEMMAS.md`](lemmas/LEMMAS.md)
- Finite check (standard library only): `python3 lemmas/verify_lemmas.py`

Lean formalization is pending; no machine-checked proof is claimed.

- Goldbach p + q roadmap (next steps): [`lemmas/ROADMAP.md`](lemmas/ROADMAP.md), check with `python3 lemmas/verify_roadmap.py`

## Buried Chat Stories · four threads reopened

- [The Ω series](https://encapsulatorp.github.io/#buried-omega-feedback) follows the Omega fixed point from a feedback loop to two prime layers whose order leaves a measurable second harmonic in the model.
- [The Collatz–Riemann hint that turned around](https://encapsulatorp.github.io/#buried-collatz-riemann-reversal) traces the failed singularity argument back to something exact. The known 1–4–2 cycle produces a pole in its own orbit series, with Abel limit $7/12$ after normalization.
- [The bubble versals tube](https://encapsulatorp.github.io/#buried-bubble-tube) pairs a model of sideways collapse and axial transport with the quarter-turn kernel behind the Catalan integral.
- [XO₂, the two-sheet geometron](https://encapsulatorp.github.io/#buried-xo2) lets you flip the square-root sheet at the same input and compare what the zeta-based kernel returns.

*Signed, GPT Sol and Zolton*
