# Two constructions of six

A focused reading note from the Pirate Chest

**Zolton / EncapsulatorP · with ChatGPT / 23 November 2026**

<a id="fractional-exponential-maps-orientation"></a>

## Two constructions of six

*NOTE 06 · EXACT FORMULAS; LIMITING MEANS OPEN*

The additive and multiplicative constructions of six define different fractional exponential maps. Their smooth-branch derivatives give exact finite-time Lyapunov averages in terms of separate orbit means.

$$
T_{\mathrm{add}}(y)=\operatorname{frac}(2\,3^y),\qquad T_{\mathrm{mul}}(y)=\operatorname{frac}(6^y)
$$

> **Exact formulas; limiting means open (exact).** Both maps are uniformly expanding on their smooth branches. The limiting comparison needs the relevant orbit means to exist; no common invariant measure, ergodicity or logistic conjugacy is assumed.

State how cuts and endpoints are handled before differentiating an orbit. The finite-time formulas are exact; an infinite-time exponent is a further limit statement.

### One concrete next step

Define the orbit or invariant measure of interest and establish the limiting means before evaluating a zero-difference target. Keep the two maps’ means separate.

### Sources and related reading

The following pages give the complete derivation from the stated definitions. The historical collection records the original fragments and argument.

[Historical collection source · original edition](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/logistic-vanishing-terms.md#six-maps)

[Return to the Treasure Chest](https://encapsulatorp.github.io/#buried-logistic-vanishing)

<a id="six-maps"></a>

## Two constructions of six

*01 · FRACTIONAL EXPONENTIAL MAPS*

$$
6=3+3=3\times2,
$$

$$
3^y+3^y=2\,3^y,\qquad 3^y2^y=6^y.
$$

Here 3^y, 2^y and 6^y mean the indicated bases raised to y. Define two maps on y ∈ [0, 1):

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

*02 · EXACT FINITE-TIME IDENTITIES*

Take a separate orbit for each map, with the branch convention just stated. For a ∈ {add, mul} and integer N ≥ 1, use exactly N samples: j = 0, 1, …, N−1. Define

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
