# Prime polynomials count exactly

A focused reading note from the Pirate Chest

**Zolton / EncapsulatorP · with ChatGPT / 23 November 2026**

Source commit: `cc3f20117eaead570db6077377a43a92c0bfc652`

<a id="prime-polynomial-counts-orientation"></a>

## Prime polynomials count exactly

*NOTE 04 · EXACT FINITE COUNTING IDENTITIES*

Finite polynomial products encode ordered Goldbach representations and twin-prime translations. A diagonal correction converts ordered Goldbach counts into unordered counts.

$$
G(N)=[z^N]P_N(z)^2,\qquad U(N)=\frac{G(N)+D(N)}2
$$

> **Exact finite counting identities (exact).** These identities follow from coefficient extraction. They do not establish a positive Goldbach count at every even integer or infinitely many twin primes.

Keep the counting convention explicit: unequal pairs appear twice in the ordered count, while a repeated-prime diagonal appears once. Laurent exponents encode the translation q − p = 2.

### One concrete next step

Identify an additional inequality or structural statement that could control the coefficients. Rewriting the count by itself is not a lower-bound argument.

### Sources and related reading

**[S2] Towers and prime polynomials.** EncapsulatorP, *Exact structures behind the atlas*, edition 21 November 2026, §§1, 2 and 4. The written arguments record their scope, prior solver provenance and numerical limits.

[[S2] Read the pinned mathematical notes](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/29f9232545aa112cd6ffa9fe1f3c0e85d093dedd/atlas/mathematical-notes.md)

[Read the pinned collection source](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/logistic-vanishing-terms.md#prime-polynomials)

[Return to the Treasure Chest](https://encapsulatorp.github.io/#buried-logistic-vanishing)

<a id="prime-polynomials"></a>

## Prime polynomials count exactly

*01 · WRITTEN-PROOF REVIEW: FINITE IDENTITIES*

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
