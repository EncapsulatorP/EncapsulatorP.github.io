# Logistic collapse and vanishing terms

A Treasure Chest proof note · 23 November 2026

**Research direction: Zolton / EncapsulatorP. Mathematical reconstruction and new derivation: ChatGPT.**

**Status:** exact elementary identities and a new local derivation; the proposed geometric bridge is an explicitly defined model. “Vanishing branes” remains a working title for an interpretation whose original state space and dynamics have not been recovered.

**Source baseline:** EncapsulatorP website commit cc3f20117eaead570db6077377a43a92c0bfc652; C3.2Z commit 7e8fb577bd3eb8da2e358d691164a9fee5c75f9b.

## Reading the treasure

Two seeds can merge. A displacement can lose its first two terms. A detector can hide a circle. A family of circles can shrink to a point. These statements describe different mathematical operations. This note identifies the object and rule in each case.

The main new result is especially simple to draw. At the logistic period-two boundary, the fourth-return displacement has a flat tangent, but a nonzero cubic term still pulls sufficiently small perturbations toward the cycle.

For the two cycle points \(p_\pm\), the exact leading term is

\[
f^{\circ4}(p_\pm+h)-(p_\pm+h)
=-K_\pm h^3+O(h^4),\qquad
K_\pm=20(1+\sqrt6)^2(2\pm\sqrt2)>0.
\]

This proves weak local attraction. The derivative of \(f^{\circ4}\) is **one**, while the derivative of its displacement from the identity is **zero**. Nothing in this calculation makes a spatial direction disappear.

## 1. The complementary-seed fold

Let

\[
f_r(x)=rx(1-x),\qquad 0<r\le4,\qquad x\in[0,1].
\]

The restriction keeps the conventional logistic interval invariant. The following polynomial identities hold more generally over the reals:

\[
f_r(u)-f_r(v)=r(u-v)(1-u-v),
\qquad
f_r(1-x)=f_r(x).
\]

Thus, for \(r\ne0\), two distinct inputs have the same output precisely when they sum to one. If \(x_0=a\), \(y_0=1-a\), and both sequences use the same map, then

\[
x_1=y_1=ra(1-a),\qquad x_n=y_n\quad(n\ge1).
\]

The last assertion follows by induction. This is the exact “merge” operation already documented in the Curious Cabinet [S1]. Independently rounded implementations may fail to preserve exact equality.

### What actually collapses?

For one complementary pair, its gap becomes zero in one step. This is a two-to-one identification, not a theorem that an interval becomes a point.

To see the distinction algebraically, use mean and half-gap coordinates,

\[
m=\frac{x+y}{2},\qquad d=\frac{x-y}{2}.
\]

The paired update \((x,y)\mapsto(f_r(x),f_r(y))\) becomes

\[
m'=r\bigl(m(1-m)-d^2\bigr),
\qquad
d'=r(1-2m)d.
\]

The complementary line \(m=1/2\) maps to the diagonal \(d'=0\), with
\(m'=r(1/4-d^2)\). The image generally remains one-dimensional.

Moreover, at a complementary pair \(x=1/2+d,\ y=1/2-d\), the determinant of the full paired derivative is

\[
f_r'(x)f_r'(y)=-4r^2d^2.
\]

It is nonzero when \(d\ne0\). The full two-dimensional map therefore retains local rank there, even though the chosen half-gap observable is zero on the image of the complementary line.

At the separate critical point \(x=1/2\),

\[
f_r(1/2+h)=r/4-rh^2.
\]

Here the first derivative vanishes, but the quadratic variation survives. A flat tangent alone does not collapse a neighborhood.

## 2. The paired quarter-turn retains both directions

For \(r>3\), define the nontrivial two-cycle

\[
x_\pm=\frac{r+1\pm\sqrt{(r-3)(r+1)}}{2r}.
\]

It follows by factoring

\[
f_r^{\circ2}(x)-x
=-x(rx-r+1)\bigl[r^2x^2-r(r+1)x+r+1\bigr].
\]

The cycle exchanges its two points: \(f_r(x_+)=x_-\) and \(f_r(x_-)=x_+\). Its two derivatives and return multiplier are

\[
d_\pm=-1\mp\sqrt{(r-3)(r+1)},\qquad
\mu=d_+d_-=4+2r-r^2.
\]

At

\[
r_*=1+\sqrt6,\qquad
p_\pm=\frac{r_*+1\pm\sqrt2}{2r_*},
\]

we have \(\mu=-1\). The paired derivative matrix from the recovered note [S2] is

\[
C_*=
\begin{pmatrix}
0&\sqrt2-1\\
-1-\sqrt2&0
\end{pmatrix}.
\]

Direct multiplication gives

\[
C_*^2=-I,\qquad C_*^4=I,\qquad \det C_*=1.
\]

In particular, it has rank two. It neither kills a nonzero vector nor collapses an area in this paired linear model.

Put \(a=\sqrt2-1\) and \(S=\operatorname{diag}(\sqrt a,1/\sqrt a)\). Then

\[
S^{-1}C_*S=
\begin{pmatrix}0&1\\-1&0\end{pmatrix}.
\]

This is a clockwise quarter-turn in the rescaled coordinates. In the original coordinates the preserved positive quadratic form is

\[
Q(v_1,v_2)=v_1^2/a+a v_2^2.
\]

Its unit ellipse has horizontal radius \(\sqrt a\), vertical radius \(1/\sqrt a\), and ratio \(a\). A circle drawn directly in the original coordinates would give the wrong metric.

The scalar map satisfies

\[
(f^{\circ2})'(p_\pm)=-1,\qquad
(f^{\circ4})'(p_\pm)=1,\qquad
(f^{\circ4}-\mathrm{id})'(p_\pm)=0.
\]

Here and below \(f=f_{r_*}\). These are statements at the two specified cycle points. The polynomial \(f^{\circ4}\) has degree sixteen and is not the identity on an interval.

## 3. New in this edition: the surviving cubic

This section derives the first nonzero term requested in the existing Atlas next-step entry. It is a new calculation in this edition, not a recovered historical “brane theorem.” No literature-priority claim is made.

Set \(F=f^{\circ2}\). At either \(p=p_\pm\), \(F(p)=p\) and \(F'(p)=-1\). Because \(F\) is quartic, its local expansion is exact:

\[
F(p_\pm+h)-p_\pm
=-h+a_\pm h^2+b_\pm h^3-r_*^3h^4,
\]

where

\[
a_\pm=-r_*(2\pm3\sqrt2),\qquad
b_\pm=-2r_*^2(1\pm\sqrt2).
\]

### Deriving the coefficients

Since \(f''=-2r_*\) and \(f'''=0\), the chain rule gives

\[
F''(p)=-2r_*\bigl(f'(p)^2+f'(f(p))\bigr),
\qquad
F'''(p)=12r_*^2 f'(p).
\]

At \(p_\pm\), substitute \(f'(p_\pm)=-1\mp\sqrt2\) and
\(f'(f(p_\pm))=-1\pm\sqrt2\). Dividing the second derivative by two and the third by six yields \(a_\pm,b_\pm\). The leading coefficient of \(f\circ f\) is \(-r_*^3\), giving the fourth-order term.

### Composing two returns

For any local map

\[
G(h)=-h+ah^2+bh^3+O(h^4),
\]

direct substitution shows

\[
G(G(h))=h-2(a^2+b)h^3+O(h^4).
\]

The quadratic terms cancel: the quadratic contribution from the outer minus sign is \(-ah^2\), while the squared input contributes \(+ah^2\).

In the logistic case,

\[
a_\pm^2+b_\pm
=10r_*^2(2\pm\sqrt2).
\]

Therefore, with \(H=f^{\circ4}=F\circ F\),

\[
\boxed{H(p_\pm+h)-(p_\pm+h)
=-20r_*^2(2\pm\sqrt2)h^3+O(h^4).}
\]

Writing \(D=H-\mathrm{id}\), the equivalent derivative statement is

\[
D(p_\pm)=D'(p_\pm)=D''(p_\pm)=0,
\qquad
D'''(p_\pm)=-120r_*^2(2\pm\sqrt2)\ne0.
\]

**The displacement vanishes to exactly third order.** In ordinary language, its constant, linear and quadratic terms vanish, and its first surviving term is cubic.

This is a precise meaning of “vanishing response.” For small positive \(h\), the displacement is negative; for small negative \(h\), it is positive. A proof picture should show this cubic crossing and inward arrows.

The exact quartic coefficients and the cubic identity were independently checked by symbolic simplification. The derivation above supplies the argument; symbolic checks are supporting verification.

## 4. Local attraction, with a zero Lyapunov exponent

Fix either phase \(p=p_\pm\) and put \(K=20r_*^2(2\pm\sqrt2)>0\). Define

\[
g(h)=H(p+h)-p=h-Kh^3+O(h^4).
\]

There is a \(\delta>0\) such that, for \(0<|h|<\delta\),

\[
0<1-\frac{3K}{2}h^2
\le \frac{g(h)}h
\le1-\frac K2h^2<1.
\]

Indeed, first make the fourth-order remainder at most
\((K/2)|h|^3\), and then make \(\delta^2<2/(3K)\).

Consequently \(g(h)\) has the same sign as \(h\) and smaller absolute value. Iteration stays in this neighborhood. The absolute values decrease to a limit; if that limit were positive, the displayed strict contraction factor would remain bounded below one, a contradiction. Hence

\[
H^{\circ n}(p+h_0)\longrightarrow p
\quad\text{for all sufficiently small }h_0.
\]

The intervening iterates converge to the appropriate cycle phase by continuity of \(f,f^{\circ2},f^{\circ3}\). Thus the two-cycle of \(f\) is locally attracting at \(r=r_*\), despite its neutral linear multiplier. This does not assert global convergence from every initial seed.

### The rate is algebraic

For nonzero sufficiently small \(h_0\), put \(h_{n+1}=g(h_n)\). The same-sign estimate ensures that no \(h_n\) is zero. Expansion gives

\[
\frac1{h_{n+1}^2}-\frac1{h_n^2}=2K+O(h_n).
\]

Since \(h_n\to0\), summing and dividing by \(n\) yields

\[
\lim_{n\to\infty}n h_n^2=\frac1{2K}.
\]

Thus the error is asymptotic to
\(\operatorname{sgn}(h_0)/\sqrt{2Kn}\), where **one \(n\)-step is four original logistic updates**.

On the exact two-cycle, the Lyapunov exponent per original update is

\[
\lambda=\frac12\log|d_+d_-|=0.
\]

There is no contradiction. A zero linear exponent leaves higher-order terms available to govern attraction. The cubic term gives a power-law decay rather than uniform exponential contraction.

## 5. Recovered geometry: what disappears in C3.2Z?

The C3.2Z “Hopf detector” already distinguishes three outcomes [S3]. Its implementation sets

\[
R=\sqrt{\max(0,\mu)}
\]

and draws the associated attracting state and detector output. It displays this radius analytically; it is not a numerical integration of a differential equation.

For a fully specified comparison model, use the normalized Hopf equation

\[
\dot z=(\mu+i\omega)z-|z|^2z,\qquad \omega\ne0.
\]

Writing \(z=\rho e^{i\theta}\) gives

\[
\dot\rho=\mu\rho-\rho^3,\qquad \dot\theta=\omega.
\]

These equations explain the radius used by the existing display. This explicit model is a clarification of that display, not a physical law derived from the logistic map.

### A. A circle genuinely shrinks in a parameter family

For \(\mu>0\), the attracting periodic orbit has radius \(\sqrt\mu\). As \(\mu\downarrow0\), this family of circles converges to the origin. For \(\mu\le0\), the origin attracts nearby trajectories; at \(\mu=0\) the radial attraction is algebraic.

This is a statement about a defined dynamical system and its attracting sets. The circles do not lose their one-dimensional topology while their radius remains positive. At the limiting parameter, the attracting set is a point.

### B. A detector hides a circle that remains present

At fixed \(\mu>0\), a rotating state can have different observations:

\[
z+\overline z=2R\cos\theta,
\qquad
|z|^2=R^2.
\]

The coherent mirror sum traces a line segment; the power-only observation is constant. Neither observation stops the hidden state from traversing its circle. A detection floor can also hide a small surviving cycle.

The C3.2Z code separately records “attractor dimension,” “visible dimension,” and “visible holes.” This separation should remain visible in the new illustration. A projection is an observation map, not a change in the underlying dynamics.

### C. The bubble/tube is another defined toy

The website's earlier bubble/tube story [S4] uses

\[
(R,L)\longmapsto(0.7R,1.15L),\qquad (R_0,L_0)=(1,1).
\]

After \(n\) updates, \(R_n=0.7^n\to0\) and \(L_n=1.15^n\to\infty\). No finite iterate has zero radius. The source explicitly labels this a transport toy and says that the suggested compound-Collatz branch selector is not implemented by the fixed-factor slider.

Its damped character kernel is an additional exact arithmetic construction; it supplies no missing dynamical equation for a physical tube or brane.

## 6. “Vanishing branes”: a concrete next bridge

No definition of a brane was found in the inspected website notes, current C3.2Z index, archived Prime Forms pages, or research archive. Earlier personal-context recovery was unavailable in this session. The user's phrase therefore remains a working research title rather than the name of an established object in these sources.

To turn it into a theorem, write down:

1. **A state space and object:** the manifold, embedded sheet, bundle or other object being called a brane, including its dimension and metric.
2. **A rule:** a map, flow or observation operator, with all parameters and a specified domain.
3. **A preserved or disappearing quantity:** transverse distance, derivative rank, volume, homology, a response coefficient or detector dimension.
4. **A theorem:** exact finite-time collapse, asymptotic attraction, parameter-limit collapse, or observational identification. These conclusions are different.

### An explicit mathematical candidate

A small model can preserve angular transport while importing the logistic restoring cubic. Let

\[
X=S^1\times(-\delta,\delta),\qquad
\Phi(\theta,h)=\bigl(\theta+\omega\pmod{2\pi},g(h)\bigr),
\]

where \(g(h)=f^{\circ4}(p_++h)-p_+\), and \(\delta\) is chosen as in Section 4.

The circle \(M=S^1\times\{0\}\) is invariant. The proven scalar estimate gives

\[
\operatorname{dist}(\Phi^{\circ n}(\theta,h),M)
=|g^{\circ n}(h)|\longrightarrow0
\]

in the product metric, while the angular coordinate continues its prescribed rotation. For nonzero small \(h\), the transverse distance is asymptotic to \(1/\sqrt{2K_+n}\).

This is a **newly defined skew-product toy**. Its local attraction follows from the proved cubic calculation. It offers a concrete mathematical meaning for “transverse contraction while transport survives.” It is asymptotic attraction, not finite-time annihilation of the whole cylinder.

### The comparison gate with Hopf

At the critical Hopf parameter \(\mu=0\), the radial equation
\(\dot\rho=-K\rho^3\) has the exact time-one map

\[
\rho\longmapsto\frac{\rho}{\sqrt{1+2K\rho^2}}
=\rho-K\rho^3+O(\rho^5).
\]

It therefore shares the same leading restoring cubic and inverse-square-root decay scale with \(g\) after matching \(K\). This is a proved local comparison of leading terms.

A claim that the full logistic model and Hopf model are conjugate needs an explicit map \(\Psi\), a domain, regularity assumptions, and a proof such as
\(\Psi\circ\Phi_{\rm logistic}=\Phi_{\rm Hopf}\circ\Psi\).
No such conjugacy is supplied here. No physical-brane interpretation is inferred from the shared exponent.

For the connection map: use a solid edge for the displayed leading-term comparison, a dashed edge for a proposed full conjugacy, and an explicitly open node for the physical interpretation.

## 7. Asymptotic addendum: small coefficients are not zero

This section checks the coefficient-decay bridge proposed in the supplied Gemini SVG.

For odd integers \(p\ge3\), define

\[
Z(p)=\exp\!\left(\frac{\pi\zeta(p-1)}p\right)+1,
\qquad
c_p=\frac{\zeta(p-1)}{p\pi^{p-1}}.
\]

Euler's even-zeta identity gives

\[
c_p=\frac{2^{p-2}|B_{p-1}|}{p!}\in\mathbb Q_{>0},
\qquad
Z(p)=\exp(c_p\pi^p)+1.
\]

Primality is unnecessary for these identities. If a separate thread restricts \(p\) to odd primes, every displayed asymptotic remains valid along those primes.

### Three valid asymptotics

Since \(\zeta(p-1)\to1\),

\[
c_p\sim\frac1{p\pi^{p-1}}.
\]

But multiplying by \(\pi^p\) gives exactly
\(c_p\pi^p=\pi\zeta(p-1)/p\). Using
\((e^t-1)/t\to1\) as \(t\to0\),

\[
Z(p)-2\sim\frac\pi p.
\]

The coefficient is exponentially small in \(p\); the resulting value's distance from two is of order \(1/p\). They have different scales.

For \(s>1\),

\[
\zeta(s)-1=2^{-s}+\sum_{n\ge3}n^{-s},
\]

and monotonicity of \(x^{-s}\) gives

\[
0<\sum_{n\ge3}n^{-s}
\le3^{-s}\left(1+\frac3{s-1}\right).
\]

Dividing by \(2^{-s}\) proves

\[
\zeta(p-1)-1\sim2^{-(p-1)}.
\]

This third asymptotic is established by the bound; it need not be left as a numerical “test” in the treasure map.

### The dyadic series comparison

For the separately defined Mahler-series remainder,

\[
R_k=\sum_{j=k+1}^\infty\left(1-e^{-2^{-j}}\right),
\]

the elementary inequalities \(t-t^2/2\le1-e^{-t}\le t\), \(t\ge0\), give

\[
2^{-k}-\frac{4^{-k}}6\le R_k\le2^{-k},
\qquad R_k\sim2^{-k}.
\]

The leading constant one is asymptotically sharp. The two estimates also give the following exact asymptotic corollary, for integer indices \(k>1\):

\[
\frac{R_k}{\zeta(k)-1}
=\frac{R_k/2^{-k}}{(\zeta(k)-1)/2^{-k}}
\longrightarrow1.
\]

The proof is the displayed quotient: both its numerator and denominator tend to one by the bounds already established. In particular, \(R_{p-1}/(\zeta(p-1)-1)\to1\) along odd integers \(p\to\infty\), hence also along odd primes. This establishes asymptotic equivalence of the two sequences. A shared dynamical system, functional-equation correspondence or conjugacy remains a separate open claim.

### Correcting the binary64 annotation

The SVG's phrase “float64 0 at p=615” conflates subnormal representation with zero. With binary64 subnormal numbers retained,

\[
c_{615}\approx9.14330169325329\times10^{-309}
\]

is positive and representable as a nonzero subnormal. The least positive normal binary64 number is approximately \(2.2250738585072014\times10^{-308}\); the least positive subnormal is approximately \(4.9406564584124654\times10^{-324}\).

A high-precision reproduction followed by round-to-nearest binary64 conversion gives:

| Odd index | Exact coefficient, approximately | Binary64 conversion |
| --- | --- | --- |
| 613 | \(9.05351940274\times10^{-308}\) | positive normal |
| 615 | \(9.14330169325\times10^{-309}\) | positive subnormal |
| 643 | \(1.05092266253\times10^{-322}\) | positive subnormal |
| 645 | \(1.06150555283\times10^{-323}\) | positive subnormal |
| 647 | \(1.07220532289\times10^{-324}\) | rounds to zero |

The first odd index rounding to zero in this specified conversion is 647. A flush-to-zero mode, premature overflow, or a different evaluation formula can give an earlier zero. Also, 615 is not prime, so it would not even index a family explicitly restricted to primes.

For computation of \(Z(p)-2\), evaluate the direct exponent
\(\pi\zeta(p-1)/p\) and use an accurate exponential-minus-one routine. Avoid multiplying a possibly underflowed \(c_p\) by a possibly overflowed \(\pi^p\). These are numerical representation issues; every exact \(c_p\) above remains positive.

## Sources and provenance

- **[S1] Exact complement fold and three logistic modes.** [Curious Cabinet notes, §2, pinned website source](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/cabinet-notes.md).
- **[S2] Recovered logistic factorization and paired derivative model.** [Recovered bridges, §2, pinned website source](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/recovered-bridges.md#logistic-quarter-turn). [Recovery provenance: 20 November 2026 thread](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/recovery-notes.md#logistic-quarter-turn). The cubic coefficient and local-attraction proof in this edition are derived in Sections 3–4.
- **[S3] Hopf detector, analytic radius, observation modes and chosen tower-to-pump control.** [C3.2Z index at pinned commit](https://github.com/EncapsulatorP/c3._2z/blob/7e8fb577bd3eb8da2e358d691164a9fee5c75f9b/index.html), sections “When does the hole disappear?”, functions dimensionState, renderDimension and paintDimension. [Earlier Prime Forms source](https://github.com/EncapsulatorP/c3._2z/blob/7e8fb577bd3eb8da2e358d691164a9fee5c75f9b/pages/prime-forms.html).
- **[S4] Bubble/tube transport toy and separate damped-character construction.** [Pinned website index](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/index.html), article with id buried-bubble-tube.
- **[S5] Exact coefficient, Z(p), and dyadic remainder definitions.** [Pinned original collection](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/logistic-vanishing-terms.md). Section 7 supplies the asymptotic arguments and the corrected floating-point reproduction.
- **Editorial input.** User-supplied gemini-svg (1).svg, inspected 23 November 2026. Its visual proposals motivated the coefficient-decay comparison. Its p=615 zero annotation and unqualified geometric interpretations are not adopted.

The note establishes the stated local results and defined-model comparisons. Historical completeness, literature novelty, formal-kernel certification, and physical interpretation remain separate questions.

