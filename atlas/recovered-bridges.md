# Recovered constructions — independently checked proof notes

21 November 2026. Proof notes for constructions recovered from the EncapsulatorP research conversations. Each section states its definitions, domain and exact conclusion. These derivations make no claim of literature novelty or proof-assistant certification. Symbolic algebra for the logistic and composition-order formulas was checked with SymPy; selected numerical values were recomputed with mpmath at 70 decimal digits.

<a id="euler-product-resolvent"></a>

## 1. Prime-support Euler products and the Liouville quotient

Let A be any set of primes and S_A the positive integers all of whose prime factors lie outside A (include 1). For Re(s)>1, define

```text
Z_A(s) = product_(p not in A) (1−p^(−s))^(−1),
L_A(s) = product_(p not in A) (1+p^(−s))^(−1).
```

All products converge absolutely and locally uniformly in this half-plane, since sum_p p^(−Re(s)) converges. They are nonzero there. For each prime, the elementary identity

```text
1/(1+x) = (1−x)/(1−x²)
```

gives, first for finite products and then by absolute convergence,

```text
L_A(s) = Z_A(2s)/Z_A(s),    Re(s)>1.
```

Expanding the absolutely convergent geometric factors also gives the support interpretation:

```text
Z_A(s) = sum_(n in S_A) n^(−s),
L_A(s) = sum_(n in S_A) lambda(n)n^(−s),
lambda(n) = (−1)^(total number of prime factors of n, with multiplicity).
```

For finite A this specializes to

```text
Z_A(s) = zeta(s) product_(p in A)(1−p^(−s)),
L_A(s) = zeta(2s)/zeta(s) product_(p in A)(1+p^(−s)).
```

**Conditions:** the same prime support must be used in both numerator and denominator. This is an exact identity of absolutely convergent products; an arbitrary infinite A does not automatically supply analytic continuation or a functional equation. The label L_A here is notation for this product, not a claim that it is a classical Dirichlet L-function.

<a id="logistic-quarter-turn"></a>

## 2. Logistic two-cycle: a finite-order linearization

Let f_r(x)=r x(1−x). Factoring the second iterate yields

```text
f_r²(x)−x
 = −x (r x−r+1) [r²x²−r(r+1)x+r+1].
```

For r>3, the two distinct roots of the quadratic are

```text
x± = [r+1 ± sqrt((r−3)(r+1))]/(2r),
f_r(x+) = x−,    f_r(x−) = x+.
```

In the conventional logistic parameter range 0<=r<=4, this supplies the real nontrivial two-cycle for r>3. At r=3 it merges with a fixed point. Write d±=f'_r(x±). Direct differentiation gives

```text
d± = −1 ∓ sqrt((r−3)(r+1)),
mu = d+ d− = 4+2r−r².
```

For the explicitly defined paired derivative matrix

```text
C = [[0, d−], [d+, 0]],
```

matrix multiplication gives C²=mu*I. At r*=1+sqrt(6), the discriminant is 2, so

```text
C = [[0, sqrt(2)−1], [−sqrt(2)−1, 0]],
C² = −I,    C⁴ = I.
```

The same multiplier calculation in the original one-dimensional map gives

```text
(f_r²)'(x±) = −1,
(f_r⁴)'(x±) = 1,
(f_r⁴−id)'(x±) = 0.      [at r=r*]
```

**Critical distinction:** these are derivative statements at two cycle points. The global polynomial f_r⁴ has degree 16 for r≠0, so it is not the identity map. C is similar to a real quarter-turn matrix, but is not orthogonal in the usual Euclidean metric: its off-diagonal magnitudes differ. Thus “finite-order linearization at the two-cycle” is accurate; “the logistic map becomes a fourth root of identity” is not.

Numerical reference: r*=3.4494897427831780982; x+=0.84993777955478376364, x−=0.43996016900185185599.

<a id="beta-disk"></a>

## 3. Beta in a disk, and one Gauss-operator evaluation

Define the real primitive character modulo 4 by chi4(n)=0 for even n, +1 for n≡1 mod4, and −1 for n≡3 mod4. The Dirichlet beta function is beta(s)=L(s,chi4). It is entire by continuation; its defining series is absolutely convergent for Re(s)>1.

### Disk change of coordinate

Take

```text
w = (s−2)/(s+1),       s = (2+w)/(1−w),
F(w) = beta((2+w)/(1−w)).
```

Writing s=sigma+it, subtraction gives

```text
|s+1|²−|s−2|² = 6sigma−3.
```

Therefore |w|<1 exactly when Re(s)>1/2. The inverse is holomorphic on the open disk, so F is holomorphic there, and

```text
F(0) = beta(2) = Catalan's constant G
     = 0.915965594177219015054603514932...
```

Optional Taylor data follow directly by the chain rule:

```text
F'(0) = 3 beta'(2),
[w²]F(w) = 3 beta'(2) + (9/2) beta''(2).
```

### What a zero-free disk would mean

Specializing the primitive-character functional equation gives the symmetric completion

```text
Lambda_beta(s) = (4/pi)^((s+1)/2) Gamma((s+1)/2) beta(s),
Lambda_beta(s) = Lambda_beta(1−s).
```

The character is real, so complex conjugation is also a symmetry. Beta's trivial zeros occur at negative odd integers. Hence the statement that **F has no zeros anywhere in the open unit disk** is equivalent, using this reflection, to all nontrivial beta zeros lying on Re(s)=1/2. This is the Riemann hypothesis for beta/L(s,chi4) specifically; it is not proved by the coordinate change and is not equivalent to ordinary zeta RH by this argument. A finite scan in a disk of radius R<1 cannot establish the full statement. Critical-line zeros lie on the unit circle, not in its interior; w=1 corresponds to the point at infinity and is excluded from the inverse chart.

Primary authoritative source checked: NIST DLMF §25.15, particularly equations 25.15.1, 25.15.2, 25.15.5, 25.15.8 and §25.15(ii): https://dlmf.nist.gov/25.15 . The conductor-4 completion and disk equivalence above are explicitly derived here from that general functional equation.

### A character-weighted Gauss operator

For a bounded f on [0,1], x in [0,1], and Re(t)>1/2, define

```text
(L_t f)(x) = sum_(n>=1) chi4(n) (x+n)^(−2t) f(1/(x+n)),
```

using the real logarithm of x+n to define the complex power. Absolute convergence follows from

```text
sum |terms| <= ||f||_infinity sum_(n>=1) n^(−2Re(t)) < infinity.
```

At f=1 and x=0, the identity is immediate:

```text
(L_t 1)(0) = sum_(n>=1) chi4(n)n^(−2t) = beta(2t).
```

In particular (L_1 1)(0)=G. This is one exact operator evaluation. It does not by itself make beta a Fredholm determinant, identify an eigenvalue, prove spectral positivity, or establish zero-freeness. Holomorphic extensions, nuclearity and determinant identities require a specified function space and separate arguments.

<a id="omega-layer-order"></a>

## 4. Omega-centered composition order and the second harmonic

Let Omega=W_0(1)>0, so Omega*exp(Omega)=1. Take positive real p,q and real logarithms a=log p, b=log q. (Primality is not needed for the local identity.) Define

```text
T_p(x)=Omega*p^(Omega−x),
F_pq=T_q o T_p,    F_qp=T_p o T_q,
Delta_pq(x)=(F_pq(x)−F_qp(x))/2.
```

Both maps fix Omega. Set x=Omega+u. Then

```text
T_p(Omega+u) = Omega exp(−a u),
F_pq(Omega+u) = Omega exp[Omega*b*(1−exp(−a u))].
```

Taylor expansion gives

```text
F_pq(Omega+u)
 = Omega + Omega²*a*b*u
   + (Omega²/2)*a²*b*(Omega*b−1)*u² + O(u³).
```

Subtract the expansion with a,b exchanged and halve:

```text
Delta_pq(Omega+u)
 = (Omega²/4)*a*b*(b−a)*u² + O(u³)
 = (Omega²/4)*log(p)*log(q)*log(q/p)*u² + O(u³).
```

**Sign:** with the order convention above, p,q>1 and q>p produce a positive coefficient. Reversing the composition-label convention reverses the sign. If p=q or either base is 1, the half-difference vanishes identically. This is an analytic local expansion with p,q fixed, not a uniform assertion over unbounded primes or large u. In fact the same quadratic formula holds around any positive common center replacing Omega; Omega's special equation is not used by the cancellation itself.

For u=epsilon*cos(theta), writing A for the coefficient,

```text
Delta_pq = (A*epsilon²/2) [1+cos(2theta)] + O(epsilon³).
```

Thus the leading response contains a DC offset and a second harmonic; after subtracting the mean, its leading term is second harmonic. Cubic terms can introduce first and third harmonics. A pure cosine input does not give an exactly pure second harmonic at finite amplitude.

Numerical reference: Omega=0.567143290409783872999968662210. For (p,q)=(2,3), A=0.0248284156194423133790026941973. Independent high-precision ratios Delta/u² at u=10^-3,10^-5,10^-7 approach this value. SymPy independently confirmed the quadratic coefficient and logistic factorization/multiplier identities.

<a id="abel-orbit-signature"></a>

## 5. Reciprocal orbits and their normalized Abel signature

For a positive-integer sequence a_k, define, for real 0<=lambda<1,

```text
H_lambda = sum_(k>=0) lambda^k/a_k,
A_lambda = (1−lambda) H_lambda.
```

The series converges absolutely because 0<1/a_k<=1. Its normalization gives 0<A_lambda<=1. Suppose the sequence is periodic after time K, with period m and cycle values c_0,...,c_(m−1). The finite prefix contributes a term tending to zero as lambda approaches 1 from below. The remaining contribution is

```text
(1−lambda) lambda^K
  * [sum_(j=0..m−1) lambda^j/c_j] / (1−lambda^m).
```

Since (1−lambda)/(1−lambda^m) tends to 1/m,

```text
lim_(lambda up to 1) A_lambda = (1/m) sum_(j=0..m−1) 1/c_j.
```

For the standard Collatz map (even n -> n/2, odd n -> 3n+1), the cycle 1,4,2 therefore has signature

```text
(1 + 1/4 + 1/2)/3 = 7/12.
```

Any other positive Collatz cycle excludes both 1 and 2, since either state forces the standard cycle. All its entries are therefore at least 3, and its reciprocal cycle mean is at most 1/3.

If a_k tends to infinity, its signature tends to zero: given eta>0, choose K with 1/a_k<eta for all k>=K. The normalized finite prefix tends to zero, and the normalized tail is at most eta*lambda^K<=eta.

**Which form of unboundedness is enough?** For an arbitrary positive-integer sequence, unbounded limsup alone does not imply this zero limit. Deterministic integer orbits have additional structure. For any map T from the positive integers to themselves, a repeated state forces an eventually periodic tail. If the orbit never repeats, it is injective, so it visits every finite set only finitely many times and tends to infinity. Thus every such orbit is either eventually periodic or injective and tending to infinity, and its normalized reciprocal Abel limit exists in both cases.

For the standard Collatz orbit starting at n, define A(n) as this limit. We obtain the exact classification

```text
A(n) = 7/12        iff the orbit reaches 1;
A(n) <= 1/3       if it enters any other positive cycle;
A(n) = 0          if the orbit never repeats a state.
```

The first equivalence follows because neither alternative can have value 7/12. The assertion that A(n)=7/12 for every positive n is therefore an exact reformulation of convergence to the standard cycle. This does not evaluate A(n) effectively from a finite prefix or establish that its value is universally 7/12. Finite values of lambda do not settle the limiting classification or provide a universal error bound without information about the orbit's future.

<a id="xo-sector-algebra"></a>

## 6. The finite sector algebra of x^n−q^n

Let n>=1 be an integer and q a nonzero complex number. Write zeta_n=exp(2*pi*i/n). The polynomial factors as

```text
x^n−q^n = product_(j=0..n−1) (x−q*zeta_n^j).
```

These roots are distinct: at a root alpha, the derivative n*alpha^(n−1) is nonzero. Evaluation at the roots defines a complex-algebra isomorphism

```text
C[x]/(x^n−q^n) -> C^n,
[f] -> (f(q), f(q*zeta_n), ..., f(q*zeta_n^(n−1))).
```

Its kernel is the ideal generated by the displayed product, and interpolation realizes every vector in C^n. Equivalently, the coprime linear factors give the same isomorphism by the Chinese remainder theorem.

For n=10, the root set is exactly

```text
{+q*zeta_5^j, −q*zeta_5^j : j=0,...,4}.
```

Thus there are five opposite pairs, each with sum zero. This is a finite algebraic decomposition into ten one-dimensional factors. Identifying those factors with physical masses, states, or a cohomology theory would require additional definitions and results. At q=0 and n>1, the roots coalesce and the quotient C[x]/(x^n) contains nonzero nilpotents, so the simple-root decomposition no longer applies.

<a id="tower-hadamard"></a>

## 7. Tower selectors and a Fourier permutation test

Fix a positive integer N and **integer** selectors t_0,...,t_(N−1). Define

```text
U_jk = N^(−1/2) exp(2*pi*i*t_j*k/N),
j,k = 0,...,N−1.
```

The inner product of rows j and ell is

```text
(U U*)_(j,ell)
 = (1/N) sum_(k=0..N−1) exp(2*pi*i*(t_j−t_ell)*k/N).
```

If t_j=t_ell modulo N, every summand is 1 and the inner product is 1. Otherwise the ratio is a nontrivial N-th root of unity, and the finite geometric sum is zero. Therefore

```text
U is unitary iff the integer selectors are pairwise distinct modulo N.
```

Equivalently, their remainders form a permutation of 0,...,N−1, making U a row permutation of the normalized discrete Fourier matrix. The unnormalized matrix sqrt(N)*U is then a complex Hadamard matrix.

A tower-generated selector is a way to propose these integers; it can repeat a remainder. Its exact permutation check must precede any claim of orthogonality. A floating-point near-zero inner product is a numerical check, not a replacement for that finite condition. The assumption that the selectors are integers matters: more general real selectors, including a common fractional shift of a Fourier grid, need their own formulation.

<a id="tower-log-chain"></a>

## 8. Triple-log recovery and an additive perturbation remainder

The historical shorthand is made precise here with real z, u=2z and real base c>1. Set

```text
A = c^u,
B = c^A,
X = c^B = c^(c^(c^u)),
omega(c,z,epsilon) = log_c(log_c(log_c(X+epsilon))) − u.
```

The real triple logarithm is defined exactly when X+epsilon>c: its first logarithm must exceed 1 for the next two logarithms to be defined. Since A>0, B>1 and X>c, epsilon=0 and every positive epsilon satisfy this condition. In exact real arithmetic,

```text
omega(c,z,0) = 0.
```

Each logarithm is strictly increasing for c>1. Hence every epsilon>0 gives a strictly positive remainder; a negative epsilon within the real domain gives a negative remainder.

The perturbation can be transported one logarithm at a time. Let

```text
x_0=X,    x_1=B,    x_2=A,    x_3=u,
delta_0=epsilon,
delta_(j+1)=log1p(delta_j/x_j)/log(c),    j=0,1,2.
```

The identity follows by subtracting log_c(x_j) from log_c(x_j+delta_j) at each stage. Under the real-domain condition above, all three ratios have arguments greater than −1, and

```text
delta_3 = omega(c,z,epsilon).
```

For fixed c,z and epsilon tending to zero, the derivative form is

```text
omega(c,z,epsilon)
 = epsilon / [(log c)^3 * X * B * A] + O(epsilon²).
```

`log1p` can help evaluate a small single-layer difference, but the tower, intermediate ratios, and division by log(c) can still cause overflow, underflow, rounding loss, or poor conditioning. The exact sign and recovery identities are mathematical statements; they do not certify a floating-point implementation across arbitrary inputs.

**Notation:** this lowercase omega is a perturbation remainder. It is distinct from the constant Omega=W_0(1) in Section 4 and from the arithmetic function Omega(n) counting prime factors with multiplicity. The Liouville function in Section 1 is (−1)^Omega(n); no equality between these three uses of the symbol is implied.

