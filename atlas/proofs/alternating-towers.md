# Alternating real towers

A focused reading note from the Pirate Chest

**Zolton / EncapsulatorP · with ChatGPT / 23 November 2026**

Source commit: `cc3f20117eaead570db6077377a43a92c0bfc652`

<a id="alternating-towers-orientation"></a>

## Alternating real towers

*NOTE 02 · PROVED CONVERGENCE AND CLASSIFICATION*

For every real base c > 1, the alternating-sign system has one pair of phases. The explicit iteration converges from every upper starting phase at least 1, with a uniform contraction bound.

$$
u=c^{-v},\qquad v=c^u,\qquad c>1
$$

> **Proved convergence and classification (exact).** The same construction has a sharp maximum upper phase and exactly two bases at every interior height. The theorem is about this alternating-sign system; ordinary unrestricted tetration is a different iteration.

The first argument establishes an invariant interval and a contraction. The second extracts the sharp envelope from v log v = t exp(−t) and classifies the two inverse branches.

### One concrete next step

Perform a focused literature search and request external review of this complete small theorem. A numerical match to a target constant needs an additional arithmetic argument.

### Sources and related reading

**[S2] Towers and prime polynomials.** EncapsulatorP, *Exact structures behind the atlas*, edition 21 November 2026, §§1, 2 and 4. The written arguments record their scope, prior solver provenance and numerical limits.

[[S2] Read the pinned mathematical notes](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/29f9232545aa112cd6ffa9fe1f3c0e85d093dedd/atlas/mathematical-notes.md)

[Read the pinned collection source](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/logistic-vanishing-terms.md#tower-convergence)

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

The last inequality follows because L e<sup>−L</sup> reaches its maximum 1/e at L = 1. Every starting point v₀ ≥ 1 enters the closed interval I = [1, e<sup>1/e</sup>] after one step.

**Uniform contraction.** Differentiation and the separate maxima of L²e<sup>−L</sup> and Le<sup>−L</sup> give

$$
|F_L'(v)|=L^2e^{-Lv}\exp(Le^{-Lv})
$$

$$
\le L^2e^{-L}\exp(Le^{-L})\le q:=4e^{1/e-2}<1.
$$

The convenient bound q is not claimed to be optimal. Its strict inequality needs no decimal evidence: 1/e < 1/2 and e<sup>3/2</sup> > 1 + 3/2 + 9/8 + 27/48 > 4. Numerically q ≈ 0.782058136610352468.

**Existence, uniqueness and convergence.** Banach’s contraction theorem on I applies. Every possible fixed point in the stated domain lies in I, so uniqueness holds throughout that domain. Set u = e<sup>−Lv</sup> to recover both phase equations. Every v₀ ≥ 1 converges.

$$
|x-v_*|\le\frac{|F_L(x)-x|}{1-q}\qquad(x\in I).
$$

The error bound follows by inserting F<sub>L</sub>(x), using the contraction inequality and rearranging. Rounded function values alone do not turn it into an interval certificate.

> **Finding of the written-proof review (exact).** This is a valid global convergence proof for the explicitly defined alternating-sign system. It is not a theorem about unrestricted ordinary tetration. No gap was found in the stated argument.

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

For any fixed 1 < v < v<sub>max</sub>, the number a = v log v lies in (0, 1/e). The function t e<sup>−t</sup> increases up to t = 1 and then decreases to zero. Thus

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

> **Finding of the written-proof review (exact).** The sharp bound, attainability and two-base classification are valid deductions. They give an exact description of this construction; matching an arbitrary target constant does not itself establish an arithmetic connection.

Together with convergence, this is the strongest self-contained candidate among the reviewed notes for a standalone mathematical presentation. A literature novelty check is still required before claiming a new result.
