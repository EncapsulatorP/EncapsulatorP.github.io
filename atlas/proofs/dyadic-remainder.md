# A dyadic vanishing remainder

A focused reading note from the Pirate Chest

**Zolton / EncapsulatorP · with ChatGPT / 23 November 2026**

<a id="dyadic-remainder-orientation"></a>

## A dyadic vanishing remainder

*NOTE 03 · PROVED PATHWISE BOUND*

The lacunary series f(x) = Σ x^(2^n), where 2^n means 2 raised to n, obeys f(x) = x + f(x²). Along the specified dyadic path toward 1, subtracting k and a convergent constant leaves an explicit tail.

$$
0\le f(e^{-2^{-k}})-k-C\le2^{-k}
$$

> **Proved pathwise bound (exact).** The proof concerns x_k = exp(−2^(−k)). Its additive constant belongs to that path; the arithmetic classification of f(exp(−1)) is a separate question.

An index shift and elementary exponential bounds give the dyadic argument. A later companion proof establishes R_k/(ζ(k) − 1) → 1 as integer k → ∞; it is an asymptotic comparison of two separately defined sequences.

### One concrete next step

Quantify the finite-k relative error beyond the proved leading-ratio limit, or define a structural map and the property it preserves. A shared dynamical system or conjugacy remains open.

### Sources and related reading

The following pages give the complete derivation from the stated definitions. The historical collection records the original fragments and argument.

[Historical collection source · original edition](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/logistic-vanishing-terms.md#mahler-remainder)

[Established dyadic/zeta ratio · companion proof, page 6](https://encapsulatorp.github.io/atlas/proofs/logistic-collapse-vanishing.html#coefficient-decay)

[Return to the Treasure Chest](https://encapsulatorp.github.io/#buried-logistic-vanishing)

<a id="mahler-remainder"></a>

## A dyadic path with a vanishing remainder

*01 · LACUNARY SERIES; ELEMENTARY PROOF*

Define the lacunary series using the exponent 2^n, meaning 2 raised to n:

$$
f(x)=\sum_{n=0}^{\infty}x^{2^n},\qquad |x|<1,\qquad f(x)=x+f(x^2).
$$

For every integer n ≥ 0, 2^n ≥ n + 1. When |x| < 1, comparison with the geometric series Σ |x|^(n+1) proves absolute convergence. An index shift then proves the functional equation.

$$
x_k=e^{-2^{-k}},\quad k=0,1,2,\ldots,\qquad x_k^2=x_{k-1}\quad(k\ge1).
$$

Repeated substitution in the functional equation gives

$$
f(x_k)=f(e^{-1})+\sum_{j=1}^{k}e^{-2^{-j}}.
$$

Define the finite constant

$$
C=f(e^{-1})+\sum_{j=1}^{\infty}(e^{-2^{-j}}-1).
$$

The second series converges absolutely because 0 ≤ 1 − exp(−t) ≤ t for t ≥ 0. Subtraction gives the exact tail

$$
R_k:=f(x_k)-k-C=\sum_{j=k+1}^{\infty}(1-e^{-2^{-j}}).
$$

$$
0\le R_k\le\sum_{j=k+1}^{\infty}2^{-j}=2^{-k}.
$$

The inequality t − t²/2 ≤ 1 − exp(−t) gives the sharper lower bound:

$$
2^{-k}-\frac{4^{-k}}6\le R_k\le2^{-k}.
$$

Numerically, f(exp(−1)) ≈ 0.52186593845987908905 and C ≈ −0.33274738243289922501. These decimals illustrate the exact identities; the inequalities above supply the proof.

> **Scope of the limit (exact).** Along x_k = exp(−2^(−k)), the remainder bound gives f(x_k) = k + C + O(2^(−k)). The constant C belongs to this specified path. The arithmetic classification of f(exp(−1)) remains a separate question.

The input exp(−1) is transcendental. A Mahler-value theorem requiring algebraic input therefore needs different hypotheses before it can apply here.
