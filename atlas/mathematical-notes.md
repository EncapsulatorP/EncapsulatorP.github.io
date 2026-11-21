# Exact structures behind the atlas

**Edition: 21 November 2026.** These notes give the assumptions and elementary
arguments behind selected atlas entries. The alternating-tower proof is written
out and independently checked for this edition. An earlier
[public solver](https://github.com/EncapsulatorP/Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers/blob/74e148d91404991744b052065831fc4262cb6cc4/scripts/boundary_residues/constructive.py)
already implemented its contraction bound, but its linked proof note was absent
from the default branch when checked on this date.

The statements below are mathematical identities or consequences of the stated
definitions. Their inclusion records what our research uses; it does not assert
priority or literature novelty. Written arguments and finite numerical checks
are distinguished throughout. Lean formalization remains a separate step.

Run the companion with Python 3.11 or later, using only its standard library:

```sh
python3 atlas/reproduce.py
```

It prints deterministic JSON. Integer checks are exact. Decimal calculations use
70-digit arithmetic and report residuals; they are numerical checks, not
outward-rounded interval certificates.

<a id="alternating-real-towers"></a>
## 1. Alternating real towers: a unique pair of phases

**Exact result.** Fix a real base \(c>1\), and let \(L=\log c\). The system

\[
u=c^{-v},\qquad v=c^u
\]

has exactly one solution with \(0<u<1<v\). In particular, the upper phase is the
unique fixed point of

\[
F_L(v)=\exp\!\bigl(L\exp(-Lv)\bigr).
\]

Every iteration \(v_{j+1}=F_L(v_j)\) beginning at \(v_0\geq1\) converges to this
fixed point. The bound below is uniform over all real bases \(c>1\).

### Invariant interval

For \(v\geq1\),

\[
1<F_L(v)\leq\exp(Le^{-L})\leq\exp(1/e),
\]

because \(Le^{-L}\) has its maximum \(1/e\) at \(L=1\).
Thus every such starting point enters the closed interval
\(I=[1,\exp(1/e)]\) after one step, and \(F_L\) maps \(I\) into itself.

### Contraction

Differentiation gives

\[
|F_L'(v)|=L^2e^{-Lv}\exp(Le^{-Lv})
\leq L^2e^{-L}\exp(Le^{-L})
\leq 4\exp(1/e-2)=q<1.
\]

Here the separate maxima \(L^2e^{-L}\leq4/e^2\) and
\(Le^{-L}\leq1/e\) provide a convenient bound; no claim that this bound is
optimal is needed. To see \(q<1\) without decimal estimates, use
\(1/e<1/2\) and
\(e^{3/2}>1+3/2+9/8+27/48>4\).

The contraction theorem on \(I\) gives existence, uniqueness and convergence.
Every possible fixed point with \(v>1\) lies in \(I\), so uniqueness also holds
on the full stated domain. Setting \(u=e^{-Lv}\) gives \(0<u<1\) and recovers
both phase equations.

For an approximate upper phase \(x\in I\), the exact-arithmetic error obeys

\[
|x-v_*|\leq\frac{|F_L(x)-x|}{1-q}.
\]

This is a mathematical error bound. Substituting rounded function evaluations
does not automatically turn it into a certified numerical interval.

**Recomputed specimen.** At \(c=1.11\),

\[
u\approx0.89177745064481416237,
\qquad v\approx1.09753406961538895124.
\]

The signs are imposed by the two alternating exponent levels. These phases
belong to the stated alternating system, rather than an unforced ordinary
tetration iteration.

<a id="sharp-tower-envelope"></a>
## 2. A sharp envelope and the two-base construction

**Exact result.** Across every real base \(c>1\), the upper phase satisfies

\[
v\leq v_{\max}=\exp(W_0(1/e)),
\]

where \(W_0\) is the real principal Lambert W function. Equality occurs at

\[
c_{\max}=\exp(1/v_{\max}).
\]

### Proof

At a fixed point, put \(t=Lv>0\). Multiplying
\(\log v=Le^{-Lv}\) by \(v\) gives

\[
v\log v=te^{-t}\leq1/e.
\]

The function \(v\mapsto v\log v\) is strictly increasing for \(v\geq1\),
so its unique solution at \(1/e\) is the sharp upper bound. Writing
\(w=\log v\) gives \(we^w=1/e\), hence \(v_{\max}=e^{W_0(1/e)}\).
The bound is attained by taking \(t=1\), so \(L=1/v_{\max}\); substituting
these values verifies the fixed-point equation.

Numerically,

\[
v_{\max}\approx1.32109976201561745696,
\qquad c_{\max}\approx2.13175398172380582551.
\]

### The two bases

Choose any remainder \(r\) with \(0<r<v_{\max}-1\), and set \(v=1+r\).
Then \(a=v\log v\) lies strictly between 0 and \(1/e\). The function
\(t\mapsto te^{-t}\) increases from 0 to \(1/e\) on \((0,1]\) and decreases
back to 0 on \([1,\infty)\). Consequently,

\[
te^{-t}=v\log v
\]

has exactly two positive solutions, \(t_-<1<t_+\). Each supplies a distinct
base

\[
c_-=e^{t_-/v},\qquad c_+=e^{t_+/v}
\]

with the same upper remainder \(v-1=r\). At the envelope there is one base;
above the envelope there are none. The limiting remainder 0 is not attained
at a finite base \(c>1\).

This construction is useful when interpreting matches to target constants:
matching an interior remainder gives a well-defined inverse problem with two
answers. A proposed connection to prime pairs would need additional arithmetic
structure beyond the match itself.

<a id="prime-pair-coordinates"></a>
## 3. Prime pairs in centre and half-gap coordinates

**Exact identity.** For odd primes \(p\leq q\), define

\[
m=(p+q)/2,\qquad d=(q-p)/2.
\]

Then \(m,d\) are integers, \(p=m-d\), \(q=m+d\), and

\[
pq=m^2-d^2.
\]

The proof is the expansion \((m-d)(m+d)=m^2-d^2\). Goldbach fixes the centre
\(m\) and searches over \(d\); twin primes fix \(d=1\) and search over \(m\).
The diagonal \(d=0\) is a valid repeated-prime Goldbach representation.
The pair \(2+2\) is handled separately from the odd-prime coordinates.

For twins, \(m^2-1=(m-1)(m+1)\) is a product of two distinct primes, so
\(\mu(m^2-1)=+1\) while \(\mu(m^2)=0\). For integer \(m\geq3\), an exact
two-way test is

\[
\Omega(m^2-1)=2\quad\Longleftrightarrow\quad m-1,m+1\text{ are both prime},
\]

where \(\Omega\) counts prime factors with multiplicity. Both factors are at
least 2, and their \(\Omega\) values add, so a sum of 2 forces each to be prime.

The full written arguments, including the distinction between this test and
the one-way Möbius pattern, are in the existing
[Hibernating Lemmas](../lemmas/LEMMAS.md).

<a id="prime-polynomial-counts"></a>
## 4. One prime polynomial: reflection and translation

Let \(P_X(z)=\sum_{p\leq X,\ p\text{ prime}}z^p\), for integer \(X\geq2\).
These are finite formal polynomials, so coefficient extraction does not need
an analytic convergence argument.

**Goldbach reflection.** For integer \(N\geq4\),

\[
G(N)=[z^N]P_N(z)^2
=\#\{(p,q):p,q\text{ prime},\ p+q=N\}.
\]

This counts **ordered** pairs: an unequal pair contributes both \((p,q)\) and
\((q,p)\). If \(U(N)\) counts unordered pairs, and \(D(N)=1\) when \(N/2\)
is an integer prime (0 otherwise), then

\[
U(N)=\frac{G(N)+D(N)}{2}.
\]

Indeed \(G(N)=2U(N)-D(N)\), because only the diagonal is counted once.

**Twin-prime translation.** In the finite Laurent polynomial ring,

\[
T(X)=[z^2]P_{X+2}(z)P_X(z^{-1})
=\#\{p\leq X:p,p+2\text{ prime}\}.
\]

Multiplication gives terms \(z^{q-p}\); the coefficient of \(z^2\) selects
exactly \(q=p+2\). These are exact counting identities. They organize the
arithmetic questions; positivity at every even centre and unbounded growth of
the twin count remain additional statements to establish.

Related programme notes: [Goldbach roadmap](../lemmas/ROADMAP.md).

<a id="wheel-210"></a>
## 5. Forty-eight admissible remainders modulo 210

Since \(210=2\cdot3\cdot5\cdot7\), the Chinese remainder theorem gives

\[
\varphi(210)=(2-1)(3-1)(5-1)(7-1)=48.
\]

Every prime \(p>7\) has a remainder \(r\) with \(\gcd(r,210)=1\), and each
integer in one of those 48 classes avoids divisibility by 2, 3, 5 and 7.
This is a wheel of candidates; for example 121 is in an admissible class but
is composite. The four wheel primes themselves are exceptional.

Selecting \(k\) distinct admissible remainders retains exactly \(k/48\) of
the wheel's classes. That is a statement about classes. It does not prescribe
the fraction of primes retained in a finite interval, where counts fluctuate.

Source programme:
[Periodic Table of Primes 210](https://github.com/EncapsulatorP/Periodic-Table-of-Primes-210).

<a id="factorial-valuations"></a>
## 6. A factorial ratio as a p-adic height

For integer \(n\geq0\), consider

\[
A_n=\frac{(6n)!}{(3n)!(n!)^3}.
\]

It is an integer because it is the multinomial coefficient for groups of
sizes \(3n,n,n,n\). For every prime \(p\), Legendre's count of multiples of
\(p,p^2,\ldots\) in a factorial yields

\[
v_p(A_n)=\sum_{j\geq1}\left(
\left\lfloor\frac{6n}{p^j}\right\rfloor
-\left\lfloor\frac{3n}{p^j}\right\rfloor
-3\left\lfloor\frac{n}{p^j}\right\rfloor\right).
\]

The sum is finite. Equivalently, writing \(s_p(n)\) for the sum of the base-p
digits of \(n\),

\[
v_p(A_n)=\frac{s_p(3n)+3s_p(n)-s_p(6n)}{p-1}.
\]

To derive the second form, write \(n=\sum_i a_i p^i\). Summing the successive
integer quotients gives
\(\sum_{j\geq1}\lfloor n/p^j\rfloor=(n-s_p(n))/(p-1)\), then substitute
in the factorial ratio; the linear terms cancel.

This gives an exact integer height that can accompany a prime-pair experiment.
Whether it adds predictive information after controlling for elementary
divisibility and baseline prime-pair counts is an experimental question.

<a id="collatz-integer-spine"></a>
## 7. An entire extension with an exact integer spine

Define the entire function

\[
C(z)=\frac{2+7z-(2+5z)\cos(\pi z)}4.
\]

For every nonnegative integer \(n\), \(\cos(\pi n)=(-1)^n\). If \(n\) is
even, substitution gives \(C(n)=n/2\); if \(n\) is odd, it gives
\(C(n)=3n+1\). Thus this particular extension agrees exactly with the
unaccelerated Collatz step on nonnegative integers.

For any entire function \(H\), the perturbed function

\[
\widetilde C(z)=C(z)+\sin(\pi z)H(z)
\]

has exactly the same integer values. The elementary choice
\(H(z)=a/4\) produces the first mutation in the showcase; a term proportional
to \(\sin(2\pi z)\) also vanishes at integers.

This freedom explains the purpose of the complex visual studies: a common
integer orbit can sit inside many different complex dynamical systems.
Properties of one selected complex extension need their own assumptions and
arguments. A finite escape image records that extension, iteration budget,
threshold and starting region; it does not by itself settle the integer
convergence question.

## Reproduction scope

The companion checks the tower equation with two independent numerical
procedures, constructs both bases for one target remainder, compares prime
polynomial coefficients with direct primality enumeration, checks the full
48-class wheel, and compares factorial valuations from exact integer division,
floor sums and digit sums. The formulas' written proofs apply to the domains
stated above; the finite checks are a reproducibility aid rather than a
replacement for those arguments.
