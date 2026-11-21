#!/usr/bin/env python3
"""Finite checks for six Atlas stress-test rails; these checks are not proofs.

Run from the repository root: python3 atlas/verify_stress_tests.py
Dependencies: Python standard library and the existing mpmath package.
Written arguments and scope: atlas/stress-test-notes.md.
"""

import json
import math
import sys

try:
    import mpmath as mp
except ImportError:
    sys.exit("mpmath is required for the numerical checks; no checks were run.")


PRECISION = 80


class CheckFailure(Exception):
    """A finite arithmetic or numerical check did not meet its stated gate."""


def require(condition, message):
    if not condition:
        raise CheckFailure(message)


def number(value):
    """A deterministic decimal rendering; not an interval enclosure."""
    return mp.nstr(value, 24)


def multiply_sparse(coefficients, terms, modulus):
    """Multiply by sparse (degree, coefficient) terms, truncating exactly."""
    degree = len(coefficients) - 1
    result = [0] * (degree + 1)
    for shift, coefficient in terms:
        for index in range(degree - shift + 1):
            result[index + shift] += coefficient * coefficients[index]
    return [value % modulus for value in result]


def ramanujan():
    cutoff = 256
    # The initial q means only unshifted degrees 0..cutoff-1 are needed.
    lhs = [1] + [0] * (cutoff - 1)
    rhs = lhs[:]
    for n in range(1, cutoff):
        factor = [
            (n * k, (-1) ** k * math.comb(24, k))
            for k in range(min(24, (cutoff - 1) // n) + 1)
        ]
        lhs = multiply_sparse(lhs, factor, 23)
        rhs = multiply_sparse(rhs, [(0, 1), (n, -1)], 23)
        if 23 * n < cutoff:
            rhs = multiply_sparse(rhs, [(0, 1), (23 * n, -1)], 23)
    lhs, rhs = [0] + lhs, [0] + rhs
    require(lhs == rhs, "Ramanujan: a coefficient differs modulo 23.")
    # Independent small integer coefficients of Delta, reduced modulo 23.
    known = [1, -24, 252, -1472, 4830, -6048, -16744, 84480]
    require(lhs[1:9] == [value % 23 for value in known],
            "Ramanujan: initial Delta coefficients or q offset are wrong.")
    return {
        "status": "pass",
        "arithmetic": "exact integers modulo 23",
        "coefficient_degrees": [0, cutoff],
        "first_eight_positive_degree_coefficients": lhs[1:9],
        "scope": "Truncated formal products; the all-coefficient proof is in the notes.",
    }


def rudin_shapiro():
    largest = mp.mpf(0)
    for k in range(37):
        z = mp.exp(2j * mp.pi * k / 37)
        p, q = mp.mpc(1), mp.mpc(1)
        for depth in range(11):
            normalized = (abs(p) ** 2 + abs(q) ** 2) / 2 ** (depth + 1)
            largest = max(largest, abs(normalized - 1))
            p, q = p + z ** (2 ** depth) * q, p - z ** (2 ** depth) * q
    require(largest < mp.mpf("1e-65"),
            "Rudin-Shapiro: normalized unit-circle energy drift is too large.")
    return {
        "status": "pass",
        "angles": 37,
        "depths": [0, 10],
        "largest_normalized_error": number(largest),
        "error_gate": "1e-65",
        "scope": "Finite angle/depth grid on the unit circle; no root-location claim.",
    }


def primes_through(limit):
    sieve = bytearray(b"\1") * (limit + 1)
    sieve[0:2] = b"\0\0"
    for p in range(2, math.isqrt(limit) + 1):
        if sieve[p]:
            for multiple in range(p * p, limit + 1, p):
                sieve[multiple] = 0
    return [n for n in range(2, limit + 1) if sieve[n]]


def wheel():
    cutoff = 2000
    primes = primes_through(cutoff)
    lanes = [r for r in range(210) if math.gcd(r, 210) == 1]
    require(len(lanes) == 48, "Wheel: the complete wheel does not have 48 lanes.")
    require(math.gcd(121, 210) == 1 and 121 not in primes,
            "Wheel: the composite-survivor control failed.")
    large = [p for p in primes if p > 7]
    groups = [[p for p in large if p % 210 == r] for r in lanes]
    require(sorted(p for group in groups for p in group) == large,
            "Wheel: some primes are lost or duplicated by grouping.")
    errors = []
    for s in (mp.mpc(2), mp.mpc(2, 3), mp.mpc("1.25", "0.75")):
        grouped = mp.fprod(
            mp.fprod(1 / (1 - mp.power(p, -s)) for p in group)
            for group in groups
        )
        ungrouped = mp.fprod(1 / (1 - mp.power(p, -s)) for p in primes)
        ungrouped *= mp.fprod(1 - mp.power(p, -s) for p in (2, 3, 5, 7))
        errors.append(abs(grouped - ungrouped) / max(1, abs(ungrouped)))
    largest = max(errors)
    require(largest < mp.mpf("1e-65"),
            "Wheel: grouped and ungrouped same-cutoff products disagree.")
    return {
        "status": "pass",
        "lanes": len(lanes),
        "prime_cutoff": cutoff,
        "primes_above_seven": len(large),
        "s_values": ["2", "2+3i", "1.25+0.75i"],
        "largest_relative_error": number(largest),
        "error_gate": "1e-65",
        "scope": "Same finite prime list on both sides; not a zeta truncation-error bound.",
    }


def critical_tower():
    horizons = (100, 1000, 10000, 100000)
    y = 1 - 1 / mp.e  # x_0 = 1; y_n = (e - x_n)/e.
    samples = []
    for n in range(1, horizons[-1] + 1):
        previous = y
        y = -mp.expm1(-y)
        require(0 < y < previous, "Tower: the positive gap failed to decrease.")
        if n in horizons:
            gap = mp.e * y
            residual = 1 / gap - n / (2 * mp.e) - mp.log(n) / (6 * mp.e)
            samples.append((n, gap, residual, n * gap / (2 * mp.e)))
    leading_errors = [abs(sample[3] - 1) for sample in samples]
    residual_differences = [abs(samples[i + 1][2] - samples[i][2])
                            for i in range(len(samples) - 1)]
    require(all(b < a for a, b in zip(leading_errors, leading_errors[1:])),
            "Tower: leading scaled errors did not shrink at the sampled horizons.")
    require(all(b < a for a, b in zip(residual_differences, residual_differences[1:])),
            "Tower: corrected residual differences did not shrink.")
    require(leading_errors[-1] < mp.mpf("0.0001"),
            "Tower: final leading-order specimen is outside its finite gate.")
    require(mp.mpf("0.51470") < samples[-1][2] < mp.mpf("0.51473"),
            "Tower: final corrected residual disagrees with the x_0=1 specimen.")
    return {
        "status": "pass",
        "seed_x0": 1,
        "recurrence": "y_(n+1) = -expm1(-y_n); gap = e*y_n",
        "samples": [{"n": n, "gap": number(gap), "u_n": number(residual),
                     "n_gap_over_2e": number(scaled)}
                    for n, gap, residual, scaled in samples],
        "scope": "Finite specimens. u_n tends to a seed-dependent constant, not zero.",
    }


def smooth_z():
    target = mp.pi ** 3 / 6
    samples = []
    for n in (16, 32, 64, 128):
        zeta_tail = mp.zeta(n - 1) - 1
        upper = mp.power(2, 1 - n) + mp.power(2, 2 - n) / (n - 2)
        require(0 < zeta_tail <= upper,
                "Z(n): zeta tail is outside the elementary upper bound.")
        value = 1 + mp.exp(mp.pi * (1 + zeta_tail) / n)
        scaled = n ** 3 * (value - 2 - mp.pi / n - mp.pi ** 2 / (2 * n ** 2))
        samples.append((n, scaled, abs(scaled - target)))
    require(all(b[2] < a[2] for a, b in zip(samples, samples[1:])),
            "Z(n): next-coefficient errors did not shrink on the finite grid.")
    require(samples[-1][2] < mp.mpf("0.04"),
            "Z(n): final next-coefficient specimen is outside its finite gate.")
    return {
        "status": "pass",
        "target_coefficient_pi_cubed_over_six": number(target),
        "samples": [{"n": n, "scaled_remainder": number(scaled),
                     "absolute_difference_from_target": number(error)}
                    for n, scaled, error in samples],
        "scope": "Smooth real-input asymptotic; not a primality classifier.",
    }


def catalan_kernel():
    terms = 128
    sums = []
    rounding_allowance = mp.mpf("1e-70")
    for t_text in ("0.1", "0.5", "1", "4"):
        t = mp.mpf(t_text)
        partial = mp.fsum((-1) ** k * mp.exp(-(2 * k + 1) * t)
                          for k in range(terms))
        exact = 1 / (2 * mp.cosh(t))
        remainder_bound = mp.exp(-(2 * terms + 1) * t) / (1 + mp.exp(-2 * t))
        error = abs(partial - exact)
        require(error <= remainder_bound + rounding_allowance,
                "Catalan kernel: damped-sum error exceeds its geometric bound.")
        sums.append({"t": t_text, "absolute_error": number(error),
                     "geometric_remainder_bound": number(remainder_bound)})
    cutoff = mp.mpf(24)
    finite_integral = mp.quad(lambda t: t / (2 * mp.cosh(t)), [0, 1, 4, 16, cutoff])
    omitted_tail = mp.catalan - finite_integral
    tail_bound = (cutoff + 1) * mp.exp(-cutoff)
    require(0 < omitted_tail <= tail_bound + rounding_allowance,
            "Catalan integral: quadrature does not meet the analytic tail comparison.")
    return {
        "status": "pass",
        "alternating_odd_terms": terms,
        "damped_sum_checks": sums,
        "integral_cutoff_T": 24,
        "finite_integral": number(finite_integral),
        "mpmath_catalan_reference": number(mp.catalan),
        "reference_minus_finite_integral": number(omitted_tail),
        "analytic_tail_upper_bound": number(tail_bound),
        "rounding_allowance": number(rounding_allowance),
        "scope": "Analytic tail bound with numerical quadrature; no interval certificate.",
    }


def main():
    try:
        with mp.workdps(PRECISION):
            checks = {
                "ramanujan_mod_23": ramanujan(),
                "rudin_shapiro": rudin_shapiro(),
                "wheel_210": wheel(),
                "critical_tower": critical_tower(),
                "smooth_z": smooth_z(),
                "catalan_kernel": catalan_kernel(),
            }
        print(json.dumps({
            "status": "pass",
            "scope": "Finite arithmetic and numerical checks; written arguments are separate.",
            "precision_decimal_digits": PRECISION,
            "mpmath_version": mp.__version__,
            "checks": checks,
        }, indent=2, sort_keys=True))
    except CheckFailure as error:
        print(json.dumps({"status": "fail", "reason": str(error)}), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
