# Alternating real towers

A focused reading note from the Pirate Chest

**Zolton / EncapsulatorP · with ChatGPT / 23 November 2026**

<a id="alternating-towers-orientation"></a>

## Alternating real towers

*NOTE 02 · PROVED CONVERGENCE AND CLASSIFICATION*

For every real base c > 1, the alternating-sign system has one pair of phases. The explicit iteration converges from every upper starting phase at least 1, with a uniform contraction bound.

$$
u=c^{-v},\qquad v=c^u,\qquad c>1
$$

> **Proved convergence and classification (exact).** The defined alternating-sign system has a sharp maximum upper phase and exactly two finite bases at every height strictly between 1 and that maximum.

The first argument establishes an invariant interval and a contraction. The second extracts the sharp envelope from v log v = t exp(−t) and classifies the two inverse branches.

### One concrete next step

Compare the convergence and inverse classification with the literature. If a particular arithmetic constant is used as a target height, state the additional arithmetic question separately.

### Sources and related reading

**[S2] Towers and prime polynomials.** EncapsulatorP, *Exact structures behind the atlas*, edition 21 November 2026, §§1, 2 and 4. The written arguments record their scope, prior solver provenance and numerical limits.

[[S2] Read the pinned mathematical notes](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/29f9232545aa112cd6ffa9fe1f3c0e85d093dedd/atlas/mathematical-notes.md)

[Historical collection source · original edition](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/logistic-vanishing-terms.md#tower-convergence)

[Return to the Treasure Chest](https://encapsulatorp.github.io/#buried-logistic-vanishing)

<a id="tower-convergence"></a>

## Alternating real towers converge

*01 · WRITTEN-PROOF REVIEW: GLOBAL RESULT*

Fix a real c > 1 and L = log c. The following alternating-sign system has exactly one solution with 0 < u < 1 < v [S2]:

$$
u=c^{-v},\qquad v=c^u.
$$

Eliminate u and define

$$
F_L(v)=\exp(Le^{-Lv}),\qquad v_{j+1}=F_L(v_j).
$$

**Invariant interval.** For v ≥ 1,

$$
1<F_L(v)\le\exp(Le^{-L})\le e^{1/e}.
$$

The function L exp(−L) has maximum 1/e at L = 1. Every v₀ ≥ 1 therefore enters I = [1, exp(1/e)] after one step.

**Uniform contraction.** Differentiate and use the separate maxima of L² exp(−L) and L exp(−L):

$$
|F_L'(v)|=L^2e^{-Lv}\exp(Le^{-Lv})
$$

$$
\le L^2e^{-L}\exp(Le^{-L})\le q:=4e^{1/e-2}<1.
$$

This convenient bound is uniform in L and v. To prove q < 1 without decimals, use 1/e < 1/2 and exp(3/2) > 1 + 3/2 + 9/8 + 27/48 > 4. Numerically q ≈ 0.782058136610352468.

**Existence, uniqueness and convergence.** Apply Banach’s contraction theorem on I. Every possible fixed point in the stated domain lies in I, so it is unique throughout that domain. Set u = exp(−Lv) to recover both phase equations. Every v₀ ≥ 1 converges.

$$
|x-v_*|\le\frac{|F_L(x)-x|}{1-q}\qquad(x\in I).
$$

The error bound follows by inserting F<sub>L</sub>(x), using the contraction inequality and rearranging. Rounded function values alone do not turn it into an interval certificate.

> **Conclusion (exact).** For every c > 1, the defined alternating-sign system has a unique solution with 0 < u < 1 < v. Its stated iteration converges from every v₀ ≥ 1 with a uniform contraction bound.

<a id="tower-envelope"></a>

## A sharp height and exactly two bases

*02 · WRITTEN-PROOF REVIEW: EXACT CLASSIFICATION*

At the fixed point of the alternating system, put t = Lv > 0. Taking logarithms of the fixed-point equation and multiplying by v yields

$$
v\log v=t e^{-t}\le1/e.
$$

Because v log v is strictly increasing on v ≥ 1, this bounds the upper phase sharply. With W₀ the principal real Lambert W function,

$$
v_{\max}=\exp(W_0(1/e))\approx1.321099762015617456962.
$$

Equality is attained by t = 1 and L = 1/v<sub>max</sub>. The base attaining the maximum height is

$$
c_{\mathrm{peak}}=\exp(1/v_{\max})\approx2.131753981723805825514.
$$

The earlier review called this c<sub>max</sub>. The label c<sub>peak</sub> avoids suggesting that there is a largest allowable base: the theorem permits every c > 1.

### Why there are exactly two bases

For 1 < v < v_max, set a = v log v ∈ (0, 1/e). The function t exp(−t) increases to t = 1 and then decreases to zero. Thus

$$
t e^{-t}=a
$$

has exactly two positive solutions t<sub>−</sub> < 1 < t<sub>+</sub>. Each gives a distinct base

$$
c_-=e^{t_-/v},\qquad c_+=e^{t_+/v}.
$$

| Upper phase | Number of finite real bases c > 1 |
| --- | --- |
| 1 < v < vₘₐₓ | Exactly two |
| v = vₘₐₓ | Exactly one |
| v > vₘₐₓ | None |
| v = 1 | None; only a limiting height |

> **Conclusion (exact).** The sharp upper-phase bound is attained. Each interior height corresponds to exactly two finite bases, the maximum to one, and all other listed heights to none.

The convergence theorem and the inverse classification form one complete argument: first construct the unique phase pair for each base, then determine exactly which bases realize a chosen height.
