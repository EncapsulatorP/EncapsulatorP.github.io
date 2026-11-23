# A dyadic vanishing remainder

A focused reading note from the Pirate Chest

**Zolton / EncapsulatorP · with ChatGPT / 23 November 2026**

Source commit: `cc3f20117eaead570db6077377a43a92c0bfc652`

<a id="dyadic-remainder-orientation"></a>

## A dyadic vanishing remainder

*NOTE 03 · PROVED PATHWISE BOUND*

The lacunary series f(x) = Σ x^(2ⁿ) obeys f(x) = x + f(x²). Along the specified dyadic path toward 1, subtracting k and a convergent constant leaves an explicit geometric tail.

$$
0\le f(e^{-2^{-k}})-k-C\le2^{-k}
$$

> **Proved pathwise bound (exact).** The proof concerns xₖ = exp(−2⁻ᵏ). It does not establish the same additive constant for every boundary approach or the arithmetic nature of f(exp(−1)).

The double exponent 2ⁿ is essential. One index shift, repeated use of the functional equation and the inequality 0 ≤ 1 − exp(−t) ≤ t give the full argument.

### One concrete next step

Compare other explicitly defined approaches to the boundary while keeping path-dependent constants separate. Any link to a zeta remainder must be a new statement with its own bound.

### Sources and related reading

This note preserves the definitions and written derivation from the supplied mathematical fragments, reconstructed in the full collection. Its proof is given on the following page(s); no literature-priority claim is made.

[Read the pinned collection source](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/logistic-vanishing-terms.md#mahler-remainder)

[Return to the Treasure Chest](https://encapsulatorp.github.io/#buried-logistic-vanishing)

<a id="mahler-remainder"></a>

## A dyadic path with a vanishing remainder

*01 · LACUNARY SERIES; ELEMENTARY PROOF*

The functional relation fixes the intended double exponent in the pasted series:

$$
f(x)=\sum_{n=0}^{\infty}x^{2^n},\qquad |x|<1,\qquad f(x)=x+f(x^2).
$$

The exponent is 2<sup>n</sup>, not 2n. Absolute convergence follows, for example, by comparing |x|<sup>2ⁿ</sup> with |x|<sup>n+1</sup>. The functional equation then follows by an index shift.

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

Its second series converges absolutely because 0 ≤ 1 − e<sup>−t</sup> ≤ t for t ≥ 0. Subtracting the two expressions gives the exact tail

$$
R_k:=f(x_k)-k-C=\sum_{j=k+1}^{\infty}(1-e^{-2^{-j}}).
$$

$$
0\le R_k\le\sum_{j=k+1}^{\infty}2^{-j}=2^{-k}.
$$

A slightly sharper estimate follows from t − t²/2 ≤ 1 − e<sup>−t</sup>:

$$
2^{-k}-\frac{4^{-k}}6\le R_k\le2^{-k}.
$$

Numerically, f(e<sup>−1</sup>) ≈ 0.52186593845987908905 and C ≈ −0.33274738243289922501. These decimals illustrate the proved identities; they are not formal interval certificates.

> **Scope of the limit (exact).** The bound proves f(xₖ) = k + C + O(2<sup>−k</sup>) along this specified dyadic approach to 1. It supplies no universal additive constant for every approach, and no algebraicity or transcendence classification of f(e<sup>−1</sup>).

The argument e<sup>−1</sup> is transcendental. A Mahler-value theorem whose hypothesis requires an algebraic input cannot automatically be applied to it.
