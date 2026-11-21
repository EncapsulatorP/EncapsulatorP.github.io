#!/usr/bin/env python3
"""Finite experiments recovered for the 21 November 2026 atlas edition.

Requires mpmath 1.3.0. Run from the repository root:
    python3 atlas/reproduce_experiments.py > atlas/experiment-results.json

The signed towers are finite right-associated objects with explicit inputs.
Numerical observations are not infinite-depth convergence or interval proofs.
"""

from fractions import Fraction
import json
import math

import mpmath as mp


DPS = 70
DISPLAY_DIGITS = 45
BOUNDARY_SOURCE = (
    "https://github.com/EncapsulatorP/"
    "Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers/"
    "blob/main/notes/boundary_residue_notes.md"
)


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def num(value):
    return mp.nstr(value, DISPLAY_DIGITS, strip_zeros=False)


def rational(value):
    return mp.mpf(value.numerator) / value.denominator


def signed_tower(bases, signs):
    """t_N=a_N; t_k=a_k**(s_(k+1)*t_(k+1)), using one-based k."""
    require(len(bases) == len(signs) and len(bases) > 0, "tower input mismatch")
    value = bases[-1]
    for index in range(len(bases) - 2, -1, -1):
        value = mp.power(bases[index], signs[index + 1] * value)
    return value


def recursive_log_tower(bases, signs, index=0):
    """Independent recursive indexing of the same finite expression."""
    if index == len(bases) - 1:
        return bases[index]
    exponent = signs[index + 1] * recursive_log_tower(bases, signs, index + 1)
    return mp.exp(exponent * mp.log(bases[index]))


def sign_record(signs):
    return [{"level": index + 1, "sign": signs[index]}
            for index in range(1, len(signs))]


def theta_signs(depth, rule):
    if rule == "alternating_s2_negative":
        return [(-1) ** (level + 1) for level in range(1, depth + 1)]
    if rule == "alternating_s2_positive":
        return [(-1) ** level for level in range(1, depth + 1)]
    phi = (1 + mp.sqrt(5)) / 2
    beatty = {int(mp.floor(m * phi)) for m in range(1, depth + 1)}
    return [1 if level in beatty else -1 for level in range(1, depth + 1)]


def theta_value(depth, rule):
    bases = [mp.jtheta(3, 0, mp.exp(-mp.pi * n)) for n in range(1, depth + 1)]
    signs = theta_signs(depth, rule)
    return signed_tower(bases, signs), bases, signs


def theta_experiments():
    depth = 10
    series_terms = 12
    comparisons = []
    for n in range(1, depth + 1):
        q = mp.exp(-mp.pi * n)
        partial = 1 + 2 * mp.fsum(q ** (k * k) for k in range(1, series_terms + 1))
        special = mp.jtheta(3, 0, q)
        require(abs(partial - special) < mp.mpf("1e-65"), "theta definitions disagree")
        tail_bound = (2 * q ** ((series_terms + 1) ** 2)
                      / (1 - q ** (2 * series_terms + 3)))
        comparisons.append({"n": n, "a_n": num(special),
                            "finite_series_difference": num(abs(partial - special)),
                            "analytic_series_tail_bound": num(tail_bound)})
    rows = []
    for rule in ("alternating_s2_negative", "alternating_s2_positive", "golden_beatty"):
        value, bases, signs = theta_value(depth, rule)
        recursive = recursive_log_tower(bases, signs)
        require(abs(value - recursive) < mp.mpf("1e-65"), "tower indexing check failed")
        with mp.workdps(100):
            high_precision, _, _ = theta_value(depth, rule)
        difference = abs(value - high_precision)
        require(difference < mp.mpf("1e-65"), "precision stability check failed")
        rows.append({"rule": rule, "exponent_signs": sign_record(signs),
                     "value": num(value), "precision_70_vs_100_difference": num(difference),
                     "recursive_vs_iterative_difference": num(abs(value - recursive))})
    return {
        "status": "recomputed finite-depth observations",
        "source": BOUNDARY_SOURCE,
        "depth": depth,
        "bases": "a_n=theta_3(0, exp(-pi*n)), n=1,...,10",
        "recurrence": "t_N=a_N; t_k=a_k^(s_(k+1)*t_(k+1)), k=N-1,...,1",
        "golden_rule": "s_k=+1 iff k=floor(m*phi) for some integer m>=1; otherwise -1",
        "phi": num((1 + mp.sqrt(5)) / 2),
        "s1_used": False,
        "infinite_depth_claim": False,
        "theta_series_comparison_positive_terms": series_terms,
        "basis_values_and_series_checks": comparisons,
        "results": rows,
    }


def mobius(n):
    count = 0
    value = n
    for p in range(2, math.isqrt(n) + 1):
        if value % p == 0:
            value //= p
            count += 1
            if value % p == 0:
                return 0
    if value > 1:
        count += 1
    return (-1) ** count


def totient(n):
    return sum(math.gcd(k, n) == 1 for k in range(1, n + 1))


def arithmetic_tower(numbers, normalized):
    phi_values = [totient(n) for n in numbers]
    fractions = [Fraction(1) + Fraction(p, n) if normalized else Fraction(p)
                 for n, p in zip(numbers, phi_values)]
    bases = [rational(value) for value in fractions]
    signs = [mobius(n) for n in numbers]
    require(all(sign in (-1, 1) for sign in signs), "input list is not squarefree")
    return signed_tower(bases, signs), bases, signs, phi_values, fractions


def totient_experiments():
    rows = []
    cases = [([3, 5, 6, 7, 10, 11, 13, 14, 15, 17], False),
             ([2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19], True)]
    for numbers, normalized in cases:
        value, bases, signs, phi_values, fractions = arithmetic_tower(numbers, normalized)
        recursive = recursive_log_tower(bases, signs)
        require(abs(value - recursive) < mp.mpf("1e-65"), "arithmetic tower indexing failed")
        with mp.workdps(100):
            high_precision, *_ = arithmetic_tower(numbers, normalized)
        require(abs(value - high_precision) < mp.mpf("1e-65"), "arithmetic tower precision failed")
        rows.append({"normalized": normalized, "depth": len(numbers),
                     "input_n": numbers, "totient_values": phi_values,
                     "exact_bases": [str(value) for value in fractions],
                     "mobius_values_at_all_levels": signs,
                     "exponent_signs": sign_record(signs), "value": num(value),
                     "precision_70_vs_100_difference": num(abs(value - high_precision)),
                     "recursive_vs_iterative_difference": num(abs(value - recursive))})
    return {"status": "recomputed finite-depth observations", "source": BOUNDARY_SOURCE,
            "recurrence": "t_N=a_N; t_k=a_k^(mu(n_(k+1))*t_(k+1))",
            "s1_used": False, "infinite_depth_claim": False, "results": rows}


def logistic_experiment():
    r = 1 + mp.sqrt(6)
    radical = mp.sqrt((r - 3) * (r + 1))
    lower = (r + 1 - radical) / (2 * r)
    upper = (r + 1 + radical) / (2 * r)
    step = lambda x: r * x * (1 - x)
    derivative_product = r * (1 - 2 * lower) * r * (1 - 2 * upper)
    formula = -r * r + 2 * r + 4
    require(max(abs(step(lower) - upper), abs(step(upper) - lower)) < mp.mpf("1e-65"),
            "logistic two-cycle equations failed")
    require(abs(derivative_product - formula) < mp.mpf("1e-65")
            and abs(formula + 1) < mp.mpf("1e-65"), "two-cycle multiplier identity failed")
    return {"status": "numerical check of an exact two-cycle identity",
            "map": "f_r(x)=r*x*(1-x)", "r_star_exact": "1+sqrt(6)", "r_star": num(r),
            "cycle_formula": "x_+/-=(r+1 +/- sqrt((r-3)*(r+1)))/(2*r)",
            "cycle": [num(lower), num(upper)],
            "derivative_product": num(derivative_product),
            "multiplier_polynomial": "-r^2+2*r+4", "multiplier_at_r_star_exact": -1,
            "cycle_equation_residual_max": num(max(abs(step(lower) - upper), abs(step(upper) - lower))),
            "interpretation": "period-two multiplier reaches -1 at its period-doubling boundary"}


def omega_experiment():
    omega = mp.lambertw(1)
    p, q = 5, 7

    def layer(prime, x):
        return omega * mp.power(prime, omega - x)

    def difference(u, first=p, second=q):
        x = omega + u
        forward = layer(second, layer(first, x))
        reverse = layer(first, layer(second, x))
        return (forward - reverse) / 2

    coefficient = omega ** 2 * mp.log(p) * mp.log(q) * mp.log(mp.mpf(q) / p) / 4
    derivative_coefficient = mp.diff(difference, 0, 2) / 2
    require(abs(derivative_coefficient - coefficient) < mp.mpf("1e-65"),
            "quadratic coefficient disagrees with differentiation")
    require(abs(mp.diff(difference, 0)) < mp.mpf("1e-65"), "linear term did not cancel")
    rows = []
    for amplitude in (mp.mpf("0.0001"), mp.mpf("0.00005"), mp.mpf("0.000025")):
        value = difference(amplitude)
        reverse_value = difference(amplitude, q, p)
        require(value > 0 and reverse_value == -value, "layer order sign reversal failed")
        ratio = value / difference(amplitude / 2)
        rows.append({"u": num(amplitude), "half_difference": num(value),
                     "reversed_half_difference": num(reverse_value),
                     "quadratic_prediction": num(coefficient * amplitude ** 2),
                     "prediction_ratio": num(value / (coefficient * amplitude ** 2)),
                     "D_u_over_D_half_u": num(ratio),
                     "distance_from_scaling_4": num(abs(ratio - 4))})
    require(all(mp.mpf(rows[i + 1]["distance_from_scaling_4"])
                < mp.mpf(rows[i]["distance_from_scaling_4"]) for i in range(len(rows) - 1)),
            "quadratic scaling did not improve on amplitude halving")
    return {"status": "finite-amplitude check of the local analytic expansion",
            "omega": num(omega), "omega_definition": "Omega*exp(Omega)=1",
            "layer": "T_p(x)=Omega*p^(Omega-x)", "primes": [p, q],
            "order_convention": "p -> q means T_q(T_p(x))",
            "half_difference": "D(u)=(T_q(T_p(Omega+u))-T_p(T_q(Omega+u)))/2",
            "quadratic_coefficient_formula": "Omega^2*log(p)*log(q)*log(q/p)/4",
            "quadratic_coefficient": num(coefficient),
            "coefficient_vs_second_derivative_difference": num(abs(derivative_coefficient - coefficient)),
            "shared_first_derivative": num(omega ** 2 * mp.log(p) * mp.log(q)),
            "samples": rows,
            "scope": "local u->0 expansion; no assertion of global orbit stability or physical waves"}


def collatz_experiment():
    orbit = [27]
    while orbit[-1] != 1:
        n = orbit[-1]
        orbit.append(n // 2 if n % 2 == 0 else 3 * n + 1)
        require(len(orbit) <= 10000, "finite orbit budget exhausted")
    return {"status": "exact finite integer computation", "seed": 27,
            "map": "n/2 if n even; 3*n+1 if n odd; stop at first 1",
            "updates_to_first_one": len(orbit) - 1, "visited_vertices": len(orbit),
            "peak": max(orbit), "orbit": orbit}


def egyptian_experiment():
    n, k, m = 5, 4, 1
    a = n * m
    A, B = k * m - 1, n * m
    rows = []
    for r in range(1, math.isqrt(B * B) + 1):
        if B * B % r:
            continue
        s = B * B // r
        if (r + B) % A or (s + B) % A:
            continue
        b, c = (r + B) // A, (s + B) // A
        left = Fraction(k, n)
        right = Fraction(1, a) + Fraction(1, b) + Fraction(1, c)
        require(left == right and (A * b - B) * (A * c - B) == B * B,
                "Egyptian factor gate identity failed")
        rows.append({"factor_pair": [r, s], "denominators": [a, b, c],
                     "left_exact": str(left), "right_exact": str(right)})
    require(rows, "selected finite gate has no representation")
    return {"status": "exact rational computation", "n": n, "k": k, "m": m,
            "A": A, "B": B,
            "gate": "(A*b-B)*(A*c-B)=B^2; r,s positive and each congruent to -B modulo A",
            "results": rows, "scope": "this selected first denominator a=n*m"}


def bernoulli(number):
    # Akiyama-Tanigawa exact rational recurrence; even indices unaffected by B1 convention.
    row = []
    for m in range(number + 1):
        row.append(Fraction(1, m + 1))
        for j in range(m, 0, -1):
            row[j - 1] = j * (row[j - 1] - row[j])
    return row[0]


def zeta_experiment():
    rows = []
    for p in (3, 5, 7):
        B = bernoulli(p - 1)
        coefficient = Fraction((-1) ** ((p + 1) // 2) * 2 ** (p - 2),
                               p * math.factorial(p - 1)) * B
        zeta_exponent = mp.pi * mp.zeta(p - 1) / p
        reduced_exponent = rational(coefficient) * mp.pi ** p
        residual = abs(zeta_exponent - reduced_exponent)
        require(residual < mp.mpf("1e-65"), "even-zeta reduction failed")
        rows.append({"p": p, "Bernoulli_exact": str(B), "c_p_exact": str(coefficient),
                     "exponent": num(zeta_exponent), "Z_p": num(mp.exp(zeta_exponent) + 1),
                     "independent_zeta_vs_Bernoulli_residual": num(residual)})
    return {"status": "exact rational coefficients with independent special-function checks",
            "definition": "Z(p)=exp(pi*zeta(p-1)/p)+1=exp(c_p*pi^p)+1",
            "coefficient_formula": "c_p=(-1)^((p+1)/2)*2^(p-2)*B_(p-1)/(p*(p-1)!)",
            "source": "https://github.com/EncapsulatorP/zp-program/blob/main/z_p/zeta_even_reduction.md",
            "results": rows}


def power_weight_experiment():
    inputs = [Fraction(1, 10), Fraction(1, 5), Fraction(7, 10)]
    probabilities = [rational(value) for value in inputs]
    weights = [mp.power(p, p) for p in probabilities]
    total = mp.fsum(weights)
    normalized = [weight / total for weight in weights]
    independent = [mp.exp(p * mp.log(p)) for p in probabilities]
    require(max(abs(a - b) for a, b in zip(weights, independent)) < mp.mpf("1e-65"),
            "power/log weight identity failed")
    require(abs(mp.fsum(normalized) - 1) < mp.mpf("1e-65"), "weights not normalized")
    initial_order = sorted(range(3), key=lambda i: probabilities[i], reverse=True)
    final_order = sorted(range(3), key=lambda i: normalized[i], reverse=True)
    require(initial_order != final_order, "expected example did not reorder")
    return {"status": "finite numerical example with defined normalization",
            "input_exact": [str(value) for value in inputs],
            "transform": "w_i=p_i^p_i; q_i=w_i/sum_j(w_j)",
            "unnormalized_weights": [num(value) for value in weights],
            "normalized_weights": [num(value) for value in normalized],
            "input_order_descending_indices_zero_based": initial_order,
            "output_order_descending_indices_zero_based": final_order,
            "normalization_residual": num(abs(mp.fsum(normalized) - 1)),
            "analytic_explanation": "d(p*log p)/dp=1+log p changes sign at p=1/e"}


def main():
    with mp.workdps(DPS):
        result = {
            "edition": "2026-11-21", "status": "all checks passed",
            "precision_decimal_digits": DPS, "display_significant_digits": DISPLAY_DIGITS,
            "library": {"mpmath": mp.__version__},
            "interval_certified": False,
            "reproduction_command": "python3 atlas/reproduce_experiments.py > atlas/experiment-results.json",
            "theta_towers": theta_experiments(), "totient_mobius_towers": totient_experiments(),
            "logistic_two_cycle": logistic_experiment(), "omega_layer_order": omega_experiment(),
            "collatz_27": collatz_experiment(), "egyptian_fraction_gate": egyptian_experiment(),
            "even_zeta_family": zeta_experiment(), "power_weights": power_weight_experiment(),
        }
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
