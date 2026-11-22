# Logistic vanishing terms

A Treasure Chest note · recovered mathematics and written-proof review

**Zolton / EncapsulatorP · editorial reconstruction and checks with ChatGPT / 22 November 2026**

Source commit: `29f9232545aa112cd6ffa9fe1f3c0e85d093dedd`

<a id="opening"></a>

## Logistic vanishing terms

*ENCAPSULATORP · THE PIRATE CHEST*

A recovered notebook of local cancellation, exponential dynamics, dyadic limits and conditional transcendence, followed by the complete substance of the written-proof review.

$$
r_* = 1+\sqrt{6},\qquad C_*^2=-I,\qquad C_*^4=I
$$

$$
\left(f_{r_*}^{\circ 4}-\mathrm{id}\right)'(x_\pm)=0
$$

> **The exact centre of this note (exact).** At the logistic two-cycle, the fourth-iterate displacement has zero first derivative and the cycle Lyapunov exponent is zero. These are precise local statements, with their derivations inside.

The surrounding threads retain their own definitions and assumptions. The note includes the two constructions of six, real and complex dimensions, the Schanuel-dependent Z(p) family, a Mahler-type series with an exact geometric remainder, ordinary-palindrome counting, alternating towers and prime-polynomial identities.

**Edition 1.0 · 22 November 2026**<br>Research direction and supplied material: **Zolton / EncapsulatorP**.<br>Editorial reconstruction, calculations and implementation: ChatGPT.

This is an edited mathematical reading copy of the submitted fragments and prior review. Superscripts and radicals lost during pasting have been restored where the equations determine them. Unassigned notation is retained explicitly.

[Open this treasure on the website](https://encapsulatorp.github.io/#buried-logistic-vanishing)

[Open the logistic quarter-turn Atlas entry](https://encapsulatorp.github.io/#atlas?entry=logistic-quarter-turn)

<a id="reading-map"></a>

## How to read the collection

*01 · EVIDENCE AND NOTATION*

Each result below has a stated domain and a limited conclusion. A correct small theorem, a consequence of an unproved assumption, a finite calculation and a suggested research bridge carry different kinds of evidence.

| Thread | What is established | Status |
| --- | --- | --- |
| Logistic two-cycle | Multiplier −1, a finite-order paired derivative matrix, and local vanishing of a first derivative. | Exact derivation |
| Two constructions of six | Branch derivatives and exact finite-time Lyapunov-average formulas. | Exact; limits need hypotheses |
| Dimension and cardinality | Dimensions 5 and 6 under the specified operations; equal continuum cardinalities. | Exact definitions |
| Z(p) and Schanuel | Rational π-power exponents; algebraic independence if complex Schanuel is assumed. | Exact + conditional |
| Lacunary series | Functional equation and a geometric remainder on a specified dyadic path. | Proved here |
| Palindrome counting | Exact probability for independent uniform symbols. | Proved finite count |
| Alternating towers | Global convergence, sharp height envelope and exactly two bases at interior heights. | Written proof reviewed |
| Prime polynomials | Exact encodings of Goldbach and twin-prime counts. | Written proof reviewed |

### Conventions

All logarithms are natural. A superscript *f*<sup>∘m</sup> denotes composition of a map with itself m times. Scalar powers keep their ordinary meaning. The fractional part is frac(x) = x − floor(x). Dimensions always state the scalar field.

The real-number identity 6 = 3 + 3 = 3 × 2 is a prompt to compare explicit constructions. A connection becomes a theorem only after the objects, map between them and preserved property are specified.

> **Scope of the review (open).** The inspected small written arguments pass the checks recorded here. Literature novelty, independent external peer review and Lean/kernel certification are separate questions. This note supplies no proof of Collatz, Goldbach, Schanuel or a comparable headline conjecture.

<a id="logistic-cycle"></a>

## The logistic two-cycle

*02 · EXACT ALGEBRA*

Let f<sub>r</sub>(x) = rx(1 − x). For r > 3 the following formulas give a nontrivial real two-cycle. The usual invariant-interval logistic setting additionally restricts r ≤ 4; the distinguished parameter used here lies in that range.

$$
f_r(x)=rx(1-x)
$$

Expanding the second iterate and factoring gives the exact polynomial identity

$$
f_r^{\circ 2}(x)-x=-x(rx-r+1)\,Q_r(x),
$$

$$
Q_r(x)=r^2x^2-r(r+1)x+r+1.
$$

The linear factors describe fixed points. The quadratic supplies the two distinct points

$$
x_\pm=\frac{r+1\pm\sqrt{(r-3)(r+1)}}{2r},
$$

$$
f_r(x_+)=x_-,\qquad f_r(x_-)=x_+.
$$

They merge with a fixed point at r = 3. Differentiate the original map at the two-cycle points and put d<sub>±</sub> = f′<sub>r</sub>(x<sub>±</sub>):

$$
d_\pm=-1\mp\sqrt{(r-3)(r+1)},
$$

$$
\mu(r):=d_+d_-=4+2r-r^2.
$$

The chain rule makes μ(r) the derivative of the second iterate at either point. Solving μ(r) = −1 in the positive logistic range gives

$$
r_*=1+\sqrt{6}\approx3.4494897427831780982.
$$

> **Meaning of the multiplier (exact).** The derivative of one complete two-step return is −1 at r*. After two such returns, the derivative is +1. The next page turns this calculation into the precise vanishing statement.

Source: the pinned recovered-bridges note [S1]. The polynomial factorization and critical multiplier were also checked by exact symbolic expansion.

<a id="logistic-vanishing"></a>

## What vanishes, and where

*03 · LOCAL RESPONSE AND A QUARTER-TURN*

Define the paired derivative matrix by the chosen order of the two phases:

$$
C_r=\begin{pmatrix}0 & d_- \\ d_+ & 0\end{pmatrix},\qquad C_r^2=\mu(r)I.
$$

At r* = 1 + √6, the discriminant equals 2. Thus

$$
C_*=\begin{pmatrix}0 & \sqrt{2}-1 \\ -1-\sqrt{2} & 0\end{pmatrix},\qquad C_*^2=-I,\quad C_*^4=I.
$$

Writing a = √2 − 1 and S = diag(√a, 1/√a), direct multiplication gives

$$
S^{-1}C_*S=\begin{pmatrix}0 & 1 \\ -1 & 0\end{pmatrix}=:J.
$$

This is a clockwise quarter-turn after a linear change of coordinates. In the original Euclidean metric C* is not orthogonal: its squared column lengths are (1 + √2)² and (√2 − 1)².

$$
\left(f_{r_*}^{\circ 2}\right)'(x_\pm)=-1,\qquad \left(f_{r_*}^{\circ 4}\right)'(x_\pm)=1,
$$

$$
\boxed{\left(f_{r_*}^{\circ 4}-\mathrm{id}\right)'(x_\pm)=0.}
$$

The exponent per application of the original map along this periodic orbit is

$$
\lambda_{\mathrm{cycle}}=\frac12\log|d_+d_-|=\frac12\log 1=0.
$$

> **Three different statements (exact).** The displacement f<sup>∘4</sup> − id has zero first derivative at the cycle points; the cycle Lyapunov exponent is zero; and the defined matrix has fourth power I. Each statement follows from the multiplier calculation.

The nonlinear fourth iterate has degree 16 for r ≠ 0, so it is not the identity map. Nor does zero cycle exponent itself prove nonlinear stability at the transition. The logistic critical point x = 1/2, where f′<sub>r</sub>(x) = 0, is another distinct use of the word “vanishing”.

The assertions above concern the two specified cycle points; they do not claim those are the only zeros of the derivative of f<sup>∘4</sup> − id.

<a id="six-maps"></a>

## Two constructions of six

*04 · FRACTIONAL EXPONENTIAL MAPS*

$$
6=3+3=3\times2,
$$

$$
3^y+3^y=2\,3^y,\qquad 3^y2^y=6^y.
$$

The pasted exponents are restored as 3<sup>y</sup>, 2<sup>y</sup> and 6<sup>y</sup>. Define two different maps on y ∈ [0, 1):

$$
T_{\mathrm{add}}(y)=\operatorname{frac}(2\,3^y),\qquad T_{\mathrm{mul}}(y)=\operatorname{frac}(6^y).
$$

The floor term is constant on each smooth branch. Consequently

$$
T_{\mathrm{add}}'(y)=2\,3^y\log3,\qquad T_{\mathrm{mul}}'(y)=6^y\log6,
$$

$$
\log|T_{\mathrm{add}}'(y)|=\log2+y\log3+\log(\log3),
$$

$$
\log|T_{\mathrm{mul}}'(y)|=y\log6+\log(\log6).
$$

### The cuts belong in the definition

Ordinary derivatives fail at the interior fractional-part jumps. Their locations are

$$
y=\frac{\log(m/2)}{\log3},\quad m=3,4,5\qquad(T_{\mathrm{add}}),
$$

$$
y=\frac{\log m}{\log6},\quad m=2,3,4,5\qquad(T_{\mathrm{mul}}).
$$

At y = 0 a right branch derivative is available. A classical orbit Lyapunov exponent requires an orbit on differentiable branches; if an orbit hits a cut or an endpoint, a one-sided branch convention must instead be stated.

> **Uniform branch expansion (exact).** On this domain, |T′<sub>add</sub>| ≥ 2 log 3 > 1 and |T′<sub>mul</sub>| ≥ log 6 > 1. Both defined branch Lyapunov averages are strictly positive. They do not reproduce the logistic cycle’s zero exponent.

The scalar equality at the top does not identify the functions or their orbit distributions. It gives two specified constructions whose dynamics can be compared.

<a id="lyapunov-comparison"></a>

## Comparing the Lyapunov averages

*05 · EXACT FINITE-TIME IDENTITIES*

Take separate orbits y<sub>j</sub><sup>add</sup> and y<sub>j</sub><sup>mul</sup>, each with the differentiability convention just stated. For a ∈ {add, mul} and N ≥ 1, define

$$
\mu_{a,N}=\frac1N\sum_{j=0}^{N-1}y_j^a,\qquad \lambda_{a,N}=\frac1N\sum_{j=0}^{N-1}\log|T_a'(y_j^a)|.
$$

Averaging the branch identities gives

$$
\lambda_{\mathrm{add},N}=\log2+\mu_{\mathrm{add},N}\log3+\log(\log3),
$$

$$
\lambda_{\mathrm{mul},N}=\mu_{\mathrm{mul},N}\log6+\log(\log6).
$$

Subtracting, with Δλ<sub>N</sub> = λ<sub>mul,N</sub> − λ<sub>add,N</sub>, yields the submitted formula in finite-time form:

$$
\Delta\lambda_N=\mu_{\mathrm{mul},N}\log6-\mu_{\mathrm{add},N}\log3+\log\!\left(\frac{\log6}{\log3}\right)-\log2.
$$

If both orbit means converge, the same equation holds for their limits μ<sub>add</sub>, μ<sub>mul</sub> and Δλ. The means are attached to different dynamics. Neither a common invariant measure nor the substitution μ = 1/2 has been established here.

### An exact boundary for the proposed bridge

$$
\lambda_{\mathrm{add},N}\ge\log(2\log3)\approx0.7871950082,
$$

$$
\lambda_{\mathrm{mul},N}\ge\log(\log6)\approx0.5831980808.
$$

A zero difference would require the two mean contributions to satisfy

$$
\mu_{\mathrm{mul}}\log6-\mu_{\mathrm{add}}\log3=\log\!\left(\frac{2\log3}{\log6}\right).
$$

> **Open question, with a testable target (open).** Determine the relevant invariant measures or orbit-mean limits before evaluating the limiting difference. These calculations compare derivative products; they establish no conjugacy, shared invariant measure or shared bifurcation structure with the logistic family.

Numerical decimals on this page are illustrations of the exact logarithmic bounds, not interval-certified values.

<a id="dimensions-fragments"></a>

## Dimensions, cardinality and fragments

*06 · RECOVERED DEFINITIONS*

The dimension fragment becomes unambiguous after specifying both the operation and the scalar field.

| Construction | Dimension | Reason |
| --- | --- | --- |
| ℝ³ × ℝ² | 5 over ℝ | A point has three plus two real coordinates. |
| ℝ³ ⊗ℝ ℝ² | 6 over ℝ | The six elementary tensors eᵢ ⊗ fⱼ form a basis. |
| ℂ³ viewed over ℝ | 6 over ℝ | Each complex coordinate gives two real coordinates. |
| ℂ³ viewed over ℂ | 3 over ℂ | Three standard complex basis vectors. |

$$
|\mathbb{R}^5|=|\mathbb{R}^6|=|\mathbb{C}^3|=|\mathbb{R}|=2^{\aleph_0}.
$$

For cardinality, identify the reals with subsets of a countable set. A finite tuple of such subsets is encoded by a subset of finitely many disjoint copies of that set; their union is still countable. Equality of these set sizes does not identify vector-space dimension. Fractal dimension and physical degrees of freedom require their own definitions and structures.

### The cubic and Collatz fragments

$$
z^3-1=(z-1)(z^2+z+1),
$$

$$
3n+1,\qquad \frac{3n+1}{2}.
$$

The first is a standard polynomial factorization. For an odd positive integer n, the other two expressions represent different Collatz conventions: the unaccelerated odd step, and that step followed by one division by two. The full odd-to-odd Syracuse step removes every factor of two.

No map linking these cubic roots, the Collatz branches and the logistic quarter-turn was supplied. Their appearance in the same notebook is retained as a proposed research connection, not an equivalence.

> **Unassigned archival labels (open).** T₀, T₁, T₂ and T₃ were supplied without definitions. They remain placeholders. No transition rule, four-layer tower construction or identity among them is inferred.

A useful next recovery is the definition of each T-label and the intended map from the cubic or Collatz expressions to the other constructions. That would turn a remembered association into a question we can check.

<a id="zeta-family"></a>

## The Z(p) family

*07 · EXACT REDUCTION; CONDITIONAL INDEPENDENCE*

Let p be an odd integer at least 3. Primality is optional. Define

$$
Z(p)=\exp\!\left(\frac{\pi\zeta(p-1)}p\right)+1.
$$

For p = 2m + 1 with m ≥ 1, Euler’s even-zeta evaluation [S3] gives

$$
\zeta(2m)=\frac{(2\pi)^{2m}}{2(2m)!}|B_{2m}|,
$$

$$
Z(p)=e^{c_p\pi^p}+1,\qquad c_p=\frac{2^{p-2}|B_{p-1}|}{p!}\in\mathbb{Q}_{>0}.
$$

Here B<sub>2m</sub> denotes a Bernoulli number. Equivalently

$$
c_{2m+1}=\frac{(-1)^{m+1}2^{2m-1}B_{2m}}{(2m+1)!}.
$$

| p | cₚ | Exponent in Z(p) − 1 |
| --- | --- | --- |
| 3 | 1/18 | π³/18 |
| 5 | 1/450 | π⁵/450 |
| 7 | 1/6615 | π⁷/6615 |

The case p = 2 is excluded because ζ(1) has a pole. For even p ≥ 4, the displayed rational coefficient does not follow from the even-zeta formula.

> **Conditional proposition (conditional).** Assume the full complex Schanuel conjecture. For pairwise distinct odd integers p₁, …, pₖ ≥ 3, the numbers π, Z(p₁), …, Z(pₖ) are algebraically independent over ℚ.

“Algebraically independent” means that no nonzero polynomial with rational coefficients in these k + 1 variables vanishes on the tuple. The next page gives the deduction and keeps the assumption visible.

The exact zeta reduction is unconditional. This argument’s algebraic-independence conclusion, and hence its individual-transcendence conclusion for Z(p), remain conditional on Schanuel. The calculation does not prove the conjecture or change its evidential status.

<a id="schanuel-proof"></a>

## The conditional Schanuel argument

*08 · COMPLETE DEDUCTION AND DOMAIN LIMITS*

Complex Schanuel states that for ℚ-linearly independent complex numbers α₀, …, αₖ, the field generated by these numbers and their exponentials has transcendence degree at least k + 1 over ℚ [S4]. Apply it to

$$
\alpha_0=i\pi,\qquad \alpha_j=c_{p_j}\pi^{p_j}\quad(1\le j\le k).
$$

**Linear independence.** In a rational relation among these numbers, the imaginary part forces the coefficient of iπ to vanish. The rest is a polynomial relation in π with distinct powers and nonzero rational c<sub>pⱼ</sub>. Transcendence of π forces every remaining coefficient to vanish.

**The Schanuel bound.** With E the field generated by these inputs and their exponentials, the conjecture gives

$$
E=\mathbb{Q}(\alpha_0,\ldots,\alpha_k,e^{\alpha_0},\ldots,e^{\alpha_k}),\qquad \operatorname{trdeg}_{\mathbb{Q}}E\ge k+1.
$$

Euler’s identity gives e<sup>α₀</sup> = −1, and e<sup>αⱼ</sup> = Z(pⱼ) − 1. Therefore

$$
E\subseteq K:=\mathbb{Q}(i,\pi,Z(p_1),\ldots,Z(p_k)).
$$

Adjoining i is algebraic, so

$$
\operatorname{trdeg}_{\mathbb{Q}}K=\operatorname{trdeg}_{\mathbb{Q}}\mathbb{Q}(\pi,Z(p_1),\ldots,Z(p_k))\le k+1.
$$

The lower and upper bounds force equality. A field generated by k + 1 numbers has transcendence degree k + 1 exactly when those generators are algebraically independent. This proves the conditional proposition. The field containment above suffices; literal equality of E and K is not needed.

> **Why the complex version matters (conditional).** The selected inputs include iπ. A real-only version of Schanuel is not the assumption used in this proof.

### The Euler counterexample has a domain

$$
q=i,\quad m=1:\qquad e^{q\pi^m}=e^{i\pi}=-1.
$$

This refutes a blanket transcendence claim allowing every nonzero **complex algebraic** coefficient q. It does not refute a claim restricted to rational or real q, since i is neither. Lindemann’s algebraic-input theorem does not directly apply to c<sub>p</sub>π<sup>p</sup>, whose input is transcendental.

This is a direct deduction from the stated conjecture and the even-zeta formula. Novelty of this particular consequence has not been established.

<a id="mahler-remainder"></a>

## A dyadic path with a vanishing remainder

*09 · LACUNARY SERIES; ELEMENTARY PROOF*

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

<a id="palindromes"></a>

## Forty positions, four symbols

*10 · EXACT COUNTING AND THE BIOPHYSICS BOUNDARY*

Assume each symbol is chosen independently and uniformly from an alphabet of integer size q ≥ 2. An ordinary palindrome reads identically under reversal. For a fixed length n ≥ 1, the first ceiling(n/2) symbols determine the rest.

$$
\mathbb{P}(\mathrm{ordinary\ palindrome})=\frac{q^{\lceil n/2\rceil}}{q^n}=q^{-\lfloor n/2\rfloor}.
$$

The shorthand q<sup>−n/2</sup> is exact for even n. With q = 4 and n = 40,

$$
\mathbb{P}=4^{-20}=2^{-40}=\frac1{1\,099\,511\,627\,776}
$$

$$
\mathbb{P}\approx9.094947017729282\times10^{-13}.
$$

The reciprocal is approximately 1.10 × 10<sup>12</sup> independently sampled **complete strings** per first success in the geometric waiting model, including the successful draw. It is not a deterministic guarantee or an automatic formula for overlapping windows.

| Alphabet size q | Length n | Ordinary-palindrome probability |
| --- | --- | --- |
| 4 | 40 | 4⁻²⁰ = 2⁻⁴⁰ |
| 6 | 40 | 6⁻²⁰ |
| 8 | 40 | 8⁻²⁰ = 2⁻⁶⁰ |
| 12 | 40 | 12⁻²⁰ |
| 40 | 40 | 40⁻²⁰ |

> **What the number 40 means (open).** In the displayed example, 40 is the sequence length n and the alphabet size is q = 4. Taking q = 40 defines a different abstract counting experiment. Neither calculation establishes a maximum sustainable DNA alphabet, a chemical stability threshold or an optimal decay rate.

### Reversal and reverse complementation

A DNA reverse-complement palindrome is a different condition. Under a fixed-point-free complement pairing and the same uniform independent model, an even length has probability q<sup>−n/2</sup>; an odd length is impossible because its central symbol would have to complement itself.

The suggested synthetic-alphabet and biophysics thread therefore remains a research direction. It needs an explicit physical model, measurable stability criteria and suitable evidence beyond this combinatorial count.

<a id="tower-convergence"></a>

## Alternating real towers converge

*11 · WRITTEN-PROOF REVIEW: GLOBAL RESULT*

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

*12 · WRITTEN-PROOF REVIEW: EXACT CLASSIFICATION*

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

<a id="prime-polynomials"></a>

## Prime polynomials count exactly

*13 · WRITTEN-PROOF REVIEW: FINITE IDENTITIES*

For integer X ≥ 2, form the finite prime polynomial

$$
P_X(z)=\sum_{p\le X,\ p\ \mathrm{prime}}z^p.
$$

All coefficient extractions here are formal and finite. No analytic convergence assumption is required.

### Goldbach reflection

For integer N ≥ 4, multiplication gives

$$
G(N)=[z^N]P_N(z)^2
$$

$$
=\#\{(p,q):p,q\ \mathrm{prime},\ p+q=N\}.
$$

This counts ordered pairs. Put D(N) = 1 if N/2 is an integer prime, and 0 otherwise. If U(N) counts unordered pairs, then

$$
G(N)=2U(N)-D(N),\qquad U(N)=\frac{G(N)+D(N)}2.
$$

Every unequal pair is counted twice in G; the diagonal is counted once. This proves the correction exactly.

### Twin-prime translation

In the finite Laurent-polynomial ring,

$$
T(X)=[z^2]P_{X+2}(z)P_X(z^{-1})
$$

$$
=\#\{p\le X:p,\ p+2\ \mathrm{prime}\}.
$$

A term has exponent q − p. Selecting the coefficient of z² imposes q = p + 2, which proves the identity.

> **Finding of the written-proof review (exact).** These are correct, elementary generating-function encodings of the counting definitions. They establish neither positivity of G(N) for every even N ≥ 4 nor infinitely many twin primes.

Their usefulness is organizational: one polynomial product expresses reflection and another expresses translation. Any proposed lower bound or asymptotic statement must add a separate argument. The reviewed source states these limits explicitly [S2].

<a id="review-finding"></a>

## Review of the written proofs

*14 · CORRECTNESS, NOVELTY AND RESEARCH VALUE*

The prior review inspected the site at commit **29f9232545aa112cd6ffa9fe1f3c0e85d093dedd**. This edition uses that pinned source snapshot. Its substantive findings are preserved in the four reviewed sections: alternating-tower convergence, the sharp envelope and two-base classification, the logistic quarter-turn, and prime-polynomial counting.

| Question | Finding from the inspected material |
| --- | --- |
| Are the small written statements correct? | They pass the checks recorded in this review, under their stated assumptions. |
| Do rigorous written arguments exist? | Yes. The inspected arguments are more than plots or finite numerical observations. |
| Is literature novelty established? | No. The notes disclaim priority; a dedicated literature check remains necessary. |
| Is there a demonstrated breakthrough on a major open problem? | No. None of these arguments proves Collatz, Goldbach or a comparable headline conjecture. |
| Are these Lean/kernel-certified? | No such certificates are supplied for the statements reviewed here. |
| Is independent external peer review established? | No. Assistant checks within this programme do not constitute independent external peer review. |
| What is the role of numerical reproduction? | Supporting verification, kept distinct from the mathematical proofs. |

“No proof of a headline conjecture” is a statement about scope. It does not justify treating every small written proof as invalid. Correctness, novelty, significance and external validation need separate assessments.

### A concrete next paper

The alternating-tower theorem, sharp envelope and two-base classification form a coherent short note: a clear domain, uniform convergence bound, complete proof and exact inverse classification. The productive next step is a focused novelty search and external review of that note.

For this treasure’s other branches, the immediate work is narrower: define T₀–T₃; identify which orbit means are relevant to the fractional exponential maps; and state a physical model before connecting alphabet counts to stability or decay.

> **Preserved conclusion (exact).** The inspected written proofs are valid within their stated scope and are elementary results of limited demonstrated research significance. Their existence deserves to be recorded accurately, without inflating either novelty or progress on the headline conjectures.

<a id="sources"></a>

## Sources, provenance and continuation

*15 · TRACEABLE READING COPY*

### Pinned programme sources

**[S1] Logistic quarter-turn.** EncapsulatorP, *Recovered constructions — independently checked proof notes*, §2, “Logistic two-cycle: a finite-order linearization”. Pinned source for the factorization, paired matrix and fourth-iterate derivative statement.

[Read the logistic source at the reviewed commit](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/29f9232545aa112cd6ffa9fe1f3c0e85d093dedd/atlas/recovered-bridges.md#logistic-quarter-turn)

**[S2] Written tower and prime-polynomial proofs.** EncapsulatorP, *Exact structures behind the atlas*, edition 21 November 2026, §§1, 2 and 4. The source records prior solver provenance, numerical-reproduction limits and the absence of priority claims.

[Read the mathematical notes at the reviewed commit](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/29f9232545aa112cd6ffa9fe1f3c0e85d093dedd/atlas/mathematical-notes.md)

### External mathematical references

**[S3] Euler’s even-zeta evaluation.** NIST Digital Library of Mathematical Functions, §25.6, equation 25.6.2. This is the classical input to the exact rational coefficient c<sub>p</sub>.

[NIST DLMF · equation 25.6.2](https://dlmf.nist.gov/25.6.E2)

**[S4] Complex Schanuel conjecture.** Isaac A. Broudy and Sebastian Eterović, *Schanuel type conjectures and disjointness*, The Ramanujan Journal 62 (2023), 781–795, Conjecture 3.1. The article supplies the statement of the conjecture; the specific Z(p) deduction is written out in this note.

[Research article · DOI 10.1007/s11139-023-00707-3](https://link.springer.com/article/10.1007/s11139-023-00707-3)

### Editorial record

The user-supplied mathematical fragments and pasted written-proof review were provided for publication in the Pirate Chest. This edition restores lost superscripts, radicals, summation indices and fraction layout; uses c<sub>peak</sub> for the height-maximizing tower base; and explicitly distinguishes n = 40 from q = 40. It retains the unassigned T-labels and does not invent their definitions.

The fractional-map formulas, dyadic-series bound, cardinality explanation and palindrome count are supported by their derivations in this document. External sources [S3] and [S4] supply the specified classical identity and conjectural assumption. The review does not certify novelty or external acceptance.

[Treasure Chest · this note](https://encapsulatorp.github.io/#buried-logistic-vanishing)

[Editable reading source · Markdown](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/atlas/logistic-vanishing-terms.md)

[Structured source and reproducible PDF renderer](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/atlas/build_logistic_vanishing_pdf.py)

Build from the repository root with: **python3 atlas/build_logistic_vanishing_pdf.py**. Dependencies and font setup are documented beside the renderer. The structured source is atlas/logistic-vanishing-terms.json.
