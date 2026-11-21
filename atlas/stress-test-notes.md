# Stress-test rails: claims, boundaries, and finite checks

**Edition: 21 November 2026.** The compact rails on the six featured cards
separate a written argument from a finite implementation check. The proposed
next-order tower rail came from the supplied Gemini audit; its derivation is
given below. Inclusion does not assert novelty. **Lean formalization is pending.**

Run the companion from the repository root:

```sh
python3 atlas/verify_stress_tests.py
```

It uses the standard library and `mpmath`, prints deterministic JSON, and exits
nonzero if a check fails. Modular coefficients are exact integer calculations;
the other checks use 80-decimal arithmetic. Those calculations are not
outward-rounded interval certificates or proofs of an infinite statement.

## Claim boundaries

| Featured card | Claim and domain | What the finite check measures |
| --- | --- | --- |
| Ramanujan modulo 23 | Equality of formal power series in $\mathbb F_{23}[[q]]$. | Coefficients through $q^{256}$, computed by two product constructions. |
| Rudin–Shapiro on the circle | The specified recurrence, with $P_0=Q_0=1$ and $\lvert z\rvert=1$. | Normalized energy at depths 0–10 and 37 angles. |
| Zeta's 48 remainder lanes | Absolute convergence and regrouping for $\Re s>1$. | Grouped and ungrouped products over the **same finite prime list** through 2,000. |
| Critical tower | $x_{n+1}=\exp(x_n/e)$ with fixed real $x_0<e$; specimen $x_0=1$. | Stable gap recurrence and corrected residual at four horizons through 100,000. |
| Smooth $Z(n)$ baseline | $Z(n)=1+\exp(\pi\zeta(n-1)/n)$ for real $n>2$, expanded as $n\to\infty$. | The next polynomial coefficient at $n=16,32,64,128$. |
| Catalan quarter-turn kernel | Kernel for $t>0$; termwise Mellin argument for $\Re s>1$. | Damped character sums and the integral at $s=2$, with an explicit truncation-tail bound. |

<a id="ramanujan-modulo-23"></a>
## 1. Ramanujan modulo 23: formal coefficients

Write $\Delta(q)=q\prod_{m\ge1}(1-q^m)^{24}$. In characteristic 23,

$$
(1-q^m)^{23}=1-q^{23m},
\qquad
\Delta(q)=q\prod_{m\ge1}(1-q^m)(1-q^{23m}).
$$

Every coefficient involves only finitely many factors, so the formal product
argument is well-defined. The script builds the left side using binomial
coefficients and the right side using linear factors, truncating both exactly.

**Boundary.** This is a coefficient congruence, not an equality of the original
integer coefficients. The discriminant $-23$ of $x^3-x-1$ is a separate fact;
sharing the number 23 does not establish another correspondence.

[Existing coefficient argument](../paper-atlas-preview.html#buried-ramanujan-23)
and its [Wilton source](https://gaetan.chenevier.perso.math.cnrs.fr/GT/wilton.pdf).

<a id="rudinshapiro-circle-energy"></a>
## 2. Rudin–Shapiro: the circle condition matters

For

$$
P_{j+1}=P_j+z^{2^j}Q_j,\qquad
Q_{j+1}=P_j-z^{2^j}Q_j,
$$

the identity $\lvert a+b\rvert^2+\lvert a-b\rvert^2=
2(\lvert a\rvert^2+\lvert b\rvert^2)$ gives

$$
\lvert P_j(z)\rvert^2+\lvert Q_j(z)\rvert^2=2^{j+1}
\quad\text{when }\lvert z\rvert=1.
$$

The script reports the largest normalized error over its finite angle/depth
grid. **Boundary:** the multiplier has modulus one only on the circle. The
energy identity does not say that every root of either polynomial lies there.

[Existing recurrence and proof](../paper-atlas-preview.html#buried-shapiro-rings);
[Balister et al., *Flat Littlewood Polynomials*, §3](https://annals.math.princeton.edu/wp-content/uploads/annals-v192-n3-p06-s.pdf).

<a id="the-210-wheel-product"></a>
## 3. The 210-wheel: exact grouping, finite approximation

There are $\varphi(210)=(2-1)(3-1)(5-1)(7-1)=48$ coprime remainder classes.
Every prime greater than 7 belongs to exactly one. Hence, for $\Re s>1$,

$$
\prod_{\gcd(r,210)=1}\;
\prod_{p\equiv r\pmod{210}}(1-p^{-s})^{-1}
=\zeta(s)\prod_{p\mid210}(1-p^{-s}).
$$

Absolute convergence justifies the infinite regrouping. The script checks a
finite analogue at three complex/real values of $s$: it uses the same prime
cutoff on both sides, including the four small-prime factors where required.

**Boundary.** Equality of two grouped partial products is not an error bound
against the full zeta function. The wheel is also only a candidate filter:
$121=11^2$ survives it.

[Existing wheel argument](../paper-atlas-preview.html#buried-euler-wheel);
[NIST DLMF 25.15.2, Euler products](https://dlmf.nist.gov/25.15.E2).

<a id="critical-tower-next-order-term"></a>
## 4. Critical tower: the logarithmic correction

For fixed real $x_0<e$, convexity gives $x<\exp(x/e)<e$ whenever $x<e$.
Thus the iterates increase to the unique fixed point $e$. Put

$$
y_n=\frac{e-x_n}{e}>0,\qquad z_n=\frac1{y_n}.
$$

Then $y_n\to0$ and

$$
y_{n+1}=1-e^{-y_n},\qquad
z_{n+1}-z_n
=\frac12+\frac{1}{12z_n}+O(z_n^{-3}).
$$

The increment tends to $1/2$, so $z_n\sim n/2$. Its $O(1/z_n)$ correction
then sums to $O(\log n)$, giving $z_n=n/2+O(\log n)$. Define

$$
w_n=z_n-\frac n2-\frac{\log n}{6},\qquad n\ge1.
$$

Using $1/(12z_n)=1/(6n)+O(\log n/n^2)$ and
$\log(1+1/n)=1/n+O(n^{-2})$ yields

$$
w_{n+1}-w_n=O(\log n/n^2).
$$

These increments are absolutely summable. Consequently, for a constant
$C=C(x_0)$,

$$
z_n=\frac n2+\frac{\log n}{6}+C
+O\!\left(\frac{\log n}{n}\right).
$$

Expanding $e/z_n$ now gives the more informative form

$$
e-x_n=\frac{2e}{n}
-\frac{2e\log n}{3n^2}
-\frac{4eC}{n^2}
+O\!\left(\frac{\log^2 n}{n^3}\right).
$$

In particular, the rail's shorter form
$e-x_n=2e/n-2e\log n/(3n^2)+O(n^{-2})$ is valid. The remaining
$n^{-2}$ constant depends on the seed.

The corrected reciprocal residual is

$$
u_n=(e-x_n)^{-1}-\frac{n}{2e}-\frac{\log n}{6e}
=\frac{C}{e}+O(\log n/n).
$$

**It approaches a constant, not necessarily zero.** For $x_0=1$, the finite
check gives approximately $0.5172198833$, $0.5150108691$, $0.5147439338$,
and $0.5147129500$ at $n=100,1000,10000,100000$ respectively.

The script uses `y = -mp.expm1(-y)` and `gap = mp.e * y` to avoid cancellation
in $1-e^{-y}$ or $e-x_n$. The browser equivalent is `Math.expm1`.

**Boundary.** At $x_0=e$ the gap is zero, and at $x_0>e$ the iterates diverge.
Finite residual behavior checks the code and specimen; the argument above
establishes the asymptotic. It is not a machine-checked proof.

[Existing leading-order argument](../paper-atlas-preview.html#buried-critical-tower).

<a id="the-smooth-zn-baseline"></a>
## 5. Smooth $Z(n)$: one more term is still a baseline

For real $n>2$, the decreasing-integrand bound gives

$$
0<\zeta(n-1)-1
\le 2^{1-n}+\frac{2^{2-n}}{n-2}.
$$

It follows that

$$
Z(n)=2+\frac\pi n+\frac{\pi^2}{2n^2}
+\frac{\pi^3}{6n^3}
+O(n^{-4})+O(2^{-n}/n).
$$

The script checks that
$n^3[Z(n)-2-\pi/n-\pi^2/(2n^2)]$ approaches $\pi^3/6$ over its stated
finite grid. A stable expression isolating the zeta-specific part is

$$
Z(n)-1-e^{\pi/n}
=e^{\pi/n}\operatorname{expm1}
\!\left(\frac{\pi[\zeta(n-1)-1]}n\right).
$$

**Boundary.** The expansion applies to the smooth real-input function; it does
not discriminate primes. Removing two polynomial terms leaves higher smooth
terms, which can dominate the exponentially small zeta contribution. Large
double-precision inputs can also erase small residuals by rounding.

[Existing baseline argument](../paper-atlas-preview.html#buried-zp-asymptotic).

<a id="catalans-kernel"></a>
## 6. Quarter-turn kernel and Catalan's constant

For $t>0$, summing the alternating geometric series gives

$$
\sum_{n\ge1}\chi_4(n)e^{-nt}
=\sum_{k\ge0}(-1)^k e^{-(2k+1)t}
=\frac{e^{-t}}{1+e^{-2t}}=\frac1{2\cosh t}.
$$

For $\Re s>1$, absolute convergence justifies termwise integration, yielding

$$
\frac1{\Gamma(s)}\int_0^\infty
\frac{t^{s-1}}{2\cosh t}\,dt=\beta(s).
$$

At $s=2$, $\Gamma(2)=1$ and this is Catalan's constant $G$. A truncation at
$T>0$ has the elementary tail bound

$$
0< G-\int_0^T\frac{t}{2\cosh t}\,dt
\le\int_T^\infty te^{-t}\,dt=(T+1)e^{-T}.
$$

The script checks four damped sums against their finite geometric remainder
bound and compares quadrature through $T=24$ with `mp.catalan`. The tail bound
is mathematical; the quadrature is not an interval-certified integral.

**Boundary.** These formulas concern the specified character, kernel, and
integration domain. The bubble/tube transport model is a separate exploratory
interpretation. No physical conclusion follows from the Mellin identity alone.

[Existing kernel story](../paper-atlas-preview.html#buried-bubble-tube);
[NIST DLMF 25.15.1, Dirichlet character series](https://dlmf.nist.gov/25.15.E1).
