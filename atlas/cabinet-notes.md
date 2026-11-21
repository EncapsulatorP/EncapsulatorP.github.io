# Curious cabinet: mathematical rules and provenance

Edition: 21 November 2026. Two interactive views curated from Zolton's supplied Catalan figure and C3.2Z workspace. The cabinet deepens existing atlas threads; it does not assert two new discoveries.

## 1. Catalan at the centre

For s = σ + it, define w = (s − 2)/(s + 1). The inverse is s = (2 + w)/(1 − w). The poles are s = −1 and w = 1 respectively.

Direct algebra gives

    Re w = ((σ − 2)(σ + 1) + t²) / ((σ + 1)² + t²)
    Im w = 3t / ((σ + 1)² + t²)
    |w|² = ((σ − 2)² + t²) / ((σ + 1)² + t²).

The numerator minus denominator in the last expression is 3 − 6σ. Consequently |w| = 1 precisely on σ = 1/2; the half-plane σ > 1/2 maps inside the disk.

Let β be the Dirichlet beta function, the Dirichlet L-function of the nonprincipal character modulo 4. Then

    β(s) = 4^(−s) [ζ(s, 1/4) − ζ(s, 3/4)]
    F(w) = β((2 + w)/(1 − w))
    F(0) = β(2) = G.

The first identity follows from the Dirichlet L-function / Hurwitz-zeta formula in [DLMF Eq. 25.15.3](https://dlmf.nist.gov/25.15.E3). The remaining two are definitions and substitution. G is Catalan's constant, the convergent sum of (−1)^n/(2n+1)^2 for n ≥ 0.

### Numerical zero data

Five positive zeros were independently numerically reproduced on 21 November 2026 using `mpmath` at 45 decimal digits:

```python
import mpmath as mp
mp.mp.dps = 45
beta = lambda s: mp.dirichlet(s, [0, 1, 0, -1])
for guess in [6.02, 10.24, 12.99, 16.34, 18.29]:
    s = mp.findroot(beta, mp.mpc(0.5, guess))
    print(mp.nstr(s, 42))
```

| Positive imaginary part | Real part returned |
| --- | --- |
| 6.02094890469759665490251152161208586886403 | 0.5 |
| 10.2437703041665545521377574791099590248642 | 0.5 |
| 12.988098012312422507453109789562993764972 | 0.5 |
| 16.3426071045872221949768614834561499393507 | 0.5 |
| 18.2919931961235348385260042775906994281854 | 0.5 |

This is a numerical computation, not a proof of unique zero enclosures or completeness. The browser stores rounded IEEE-754 binary64 values and maps those five sample points to the circle. The zero markers are fixed numerical data; the browser does not solve for further zeros or evaluate β at every slider position. Their being displayed on the circle cannot test the hypothesis that every nontrivial beta zero is on the critical line.

The centre value was also reproduced as β(2) = 0.915965594177219015054603514932384110774149.

The dashed route is the image under w(s) of a straight segment from s = 2 to the chosen s, sampled at 81 parameter values. It is a coordinate path, not an orbit of a dynamical system.

The original supplied figure also contains an L_23 zero comparison and a transfer-operator trace correction truncated at index 4,096. The image alone does not specify enough of that operator and computation to reproduce the second panel. Those curves are therefore not reconstructed in this exhibit. They remain part of the original reported comparison, separate from the exact coordinate identities used here.

### Possible value

The map gives a compact comparative view of numerical zero data and a direct connection between a special value and a boundary geometry. An extension could compare several L-functions under the same map, using pinned inputs and validated error bounds. This is an exploratory use of the coordinates; it does not establish a spectral identification.

## 2. Mirror, merge, split

Write f_r(x) = rx(1 − x), and use x_0 = a, y_0 = 1 − a. The controls keep both logistic parameters in [0,4] and seeds in [0,1].

### Merge

Apply f_r to both sequences. Since f_r(1 − x) = f_r(x), the two sequences agree from step 1 onward in exact arithmetic. Independent floating-point calculations may differ slightly, especially when later dynamics amplify rounding error. The exhibit reports the largest computed gap from steps 1 through 48.

### Mirror

Let C(x) = 1 − x. Apply f_r to x and C ∘ f_r ∘ C to y. If y_n = C(x_n), then

    y_(n+1) = C(f_r(C(y_n))) = C(f_r(x_n)) = C(x_(n+1)).

Both branches are computed independently in the browser; the companion is not forcibly replaced with 1 − x after every step. The displayed error max |x_n + y_n − 1| is therefore an implementation observation. It can grow in sensitive parameter regimes without contradicting the exact conjugacy identity.

### Split

Apply f_r to x and f_(r+Δr) to y. Their first gap obeys

    |x_1 − y_1| = |Δr|a(1 − a).

The period-two logistic orbit changes stability at r_* = 1 + sqrt(6) ≈ 3.449489742783178. The preset r = 3.445, Δr = 0.0073 places its two parameters on opposite sides of r_*. The display includes all 48 steps beginning with the initial seed. It does not discard transients or certify the asymptotic period from those 48 observations.

See [University of Manchester: Applied Dynamical Systems, logistic map](https://personalpages.manchester.ac.uk/staff/yanghong.huang/ads/html/maps-log.html) for the period-two multiplier and its second bifurcation.

### Possible value

These three rules isolate symmetry, conjugacy and parameter sensitivity in one small reproducible example. The numerical error readout can serve as an experimental check of whether an implementation preserves its intended relationship. A future experiment could compare precision levels and measured error growth. No prime detector, physical constant derivation or new stability theorem is claimed.

## Source and implementation credits

- Original research direction and supplied explorations: Zolton aka Inge.
- Supplied workspace: `c3_2z_living_spec_prime_forms.html` (Living SPEC & Prime Forms).
- Supplied figure: `catalan-critical-disk(2).png` (Catalan at the centre).
- Earlier visual and implementation credits remain attached to the [C3.2Z source project](https://github.com/EncapsulatorP/c3._2z).
- Existing threads: [Beta–Catalan disk](../index.html#atlas?entry=beta-catalan-disk) and [logistic quarter-turn](../index.html#atlas?entry=logistic-quarter-turn).
- Curated cabinet implementation and mathematical checks: ChatGPT, GPT-6 Astra Pro, 21 November 2026.

The original workspace also includes physical and physics-inspired captions. This cabinet selects the mathematical coordinate and iteration rules. It does not import the RG, photonic-blockade or spacetime-emergence claims.

## Implementation properties

- No external JavaScript dependencies, random samples, network calls or animation loop.
- SVGs render the actual coordinate transforms and finite iterates. Initial SVG geometry and all 49 initial table rows are also present in the HTML fallback.
- Native controls have explicit labels; selected modes use `aria-pressed`; numerical readouts are live regions. The complete finite orbit is available as a table.
- Scoped CSS and an idempotent initializer avoid changes to Atlas Spark.
- Numerical helpers are exported from `assets/curious-cabinet.js` for checks. The browser uses binary64 arithmetic; the static zero computation above used 45 decimal digits.
