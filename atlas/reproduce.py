#!/usr/bin/env python3
"""Reproduce selected atlas quantities with Python's standard library.

Integer checks are exact. Decimal checks use 70-digit arithmetic and are not
outward-rounded interval certificates. See mathematical-notes.md for proofs.
Prints deterministic JSON; raises if any mathematical consistency check fails.
"""

from decimal import Decimal, localcontext
import json
import math


D = Decimal


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def bisect(function, low, high, steps=220):
    """Numerical bisection for a continuous function with opposite end signs."""
    flo = function(low)
    fhi = function(high)
    require(flo * fhi <= 0, "root is not bracketed")
    if flo == 0:
        return low
    if fhi == 0:
        return high
    for _ in range(steps):
        mid = (low + high) / 2
        fmid = function(mid)
        if fmid == 0:
            return mid
        if flo * fmid <= 0:
            high = mid
        else:
            low, flo = mid, fmid
    return (low + high) / 2


def digits(value, places=35):
    return format(value, f".{places}f")


def tower_checks():
    with localcontext() as context:
        context.prec = 70
        one = D(1)
        inv_e = (-one).exp()
        q = D(4) * (inv_e - 2).exp()
        ceiling = inv_e.exp()
        tolerance = D("1e-50")

        # Solve v log(v) = 1/e directly, without a Lambert W implementation.
        vmax = bisect(lambda v: v * v.ln() - inv_e, one, D(2))
        cmax = (one / vmax).exp()

        def solve(base):
            log_base = base.ln()

            def step(v):
                return (log_base * (-log_base * v).exp()).exp()

            value = one
            for iteration in range(1, 2001):
                value = step(value)
                residual = abs(step(value) - value)
                estimate = residual / (one - q)
                if estimate <= tolerance:
                    break
            else:
                raise ArithmeticError("tower iteration budget exhausted")
            independent = bisect(lambda v: step(v) - v, one, ceiling)
            require(abs(value - independent) < D("1e-48"),
                    "iteration and bisection disagree")
            require(value <= vmax + D("1e-48"), "sharp envelope exceeded")
            lower = (-log_base * value).exp()
            require(0 < lower < 1 < value, "phase ranges failed")
            return value, {
                "base": digits(base),
                "upper": digits(value),
                "lower": digits(lower),
                "iterations": iteration,
                "equation_residual": str(residual),
                "exact_arithmetic_error_bound_estimate": str(estimate),
                "independent_bisection_difference": str(abs(value - independent)),
            }

        samples = []
        for base in (D("1.01"), D("1.11"), cmax, D(10), D(1000)):
            _, result = solve(base)
            samples.append(result)

        target = D("1.1")
        a = target * target.ln()
        equation = lambda t: t * (-t).exp() - a
        low_t = bisect(equation, D(0), one)
        high = D(2)
        while equation(high) > 0:
            high *= 2
        high_t = bisect(equation, one, high)
        constructed = []
        for t in (low_t, high_t):
            base = (t / target).exp()
            value, result = solve(base)
            require(abs(value - target) < D("1e-48"),
                    "two-base construction missed its target")
            constructed.append({"t": digits(t), "base": digits(base),
                                "upper": result["upper"]})

        return {
            "evidence": "decimal checks of identities proved in companion",
            "decimal_precision": context.prec,
            "rounding_error_included_in_bound": False,
            "interval_certified": False,
            "uniform_contraction_bound": digits(q),
            "sharp_upper_phase": digits(vmax),
            "maximizing_base": digits(cmax),
            "envelope_equation_residual": str(abs(vmax * vmax.ln() - inv_e)),
            "samples": samples,
            "two_base_target_remainder": "0.1",
            "two_base_construction": constructed,
        }


def prime(n):
    """Trial division, independent of the sieve used for polynomial inputs."""
    if n < 2:
        return False
    return all(n % d for d in range(2, math.isqrt(n) + 1))


def sieve(limit):
    flags = bytearray(b"\x01") * (limit + 1)
    flags[0:2] = b"\x00\x00"
    for p in range(2, math.isqrt(limit) + 1):
        if flags[p]:
            flags[p * p:limit + 1:p] = b"\x00" * ((limit - p * p) // p + 1)
    return [n for n in range(2, limit + 1) if flags[n]]


def polynomial_checks():
    limit = 300
    primes = sieve(limit + 2)
    coefficients = [0] * (2 * limit + 1)
    for p in primes:
        if p > limit:
            continue
        for q in primes:
            if q <= limit:
                coefficients[p + q] += 1
    sample_rows = []
    for total in range(4, limit + 1, 2):
        pairs = [(p, total - p) for p in range(2, total // 2 + 1)
                 if prime(p) and prime(total - p)]
        diagonal = int(prime(total // 2))
        require(coefficients[total] == 2 * len(pairs) - diagonal,
                f"ordered/unordered count failed at {total}")
        for p, q in pairs:
            if p > 2:
                m, d = (p + q) // 2, (q - p) // 2
                require(p * q == m * m - d * d, "centre-gap identity failed")
        if total in (4, 10, 28, 100, 300):
            sample_rows.append({"N": total, "ordered": coefficients[total],
                               "unordered": len(pairs), "diagonal": diagonal})

    twin_rows = []
    for bound in (10, 30, 100, 300):
        coefficient = sum(q - p == 2 for p in primes if p <= bound
                          for q in primes if q <= bound + 2)
        direct = sum(prime(p) and prime(p + 2) for p in range(2, bound + 1))
        require(coefficient == direct, "twin coefficient identity failed")
        twin_rows.append({"X": bound, "coefficient": coefficient,
                          "direct_count": direct})
    return {"evidence": "exact finite integer checks",
            "Goldbach_even_range_inclusive": [4, limit],
            "Goldbach_samples": sample_rows, "twin_samples": twin_rows}


def wheel_checks():
    remainders = [r for r in range(210) if math.gcd(r, 210) == 1]
    require(len(remainders) == 48, "wrong wheel size")
    primes = sieve(10000)
    require(all(p % 210 in remainders for p in primes if p > 7),
            "prime missing from wheel")
    require(121 in remainders and not prime(121), "candidate witness failed")
    return {"evidence": "exact finite integer checks",
            "modulus": 210, "admissible_count": len(remainders),
            "admissible_remainders": remainders, "prime_check_limit": 10000,
            "wheel_prime_exceptions": [2, 3, 5, 7],
            "admissible_composite_example": 121}


def digit_sum(n, base):
    result = 0
    while n:
        n, digit = divmod(n, base)
        result += digit
    return result


def factorial_valuation(n, p):
    result = 0
    while n:
        n //= p
        result += n
    return result


def valuation(n, p):
    result = 0
    while n % p == 0:
        n //= p
        result += 1
    return result


def factorial_checks():
    count = 0
    specimens = []
    for n in range(31):
        numerator = math.factorial(6 * n)
        denominator = math.factorial(3 * n) * math.factorial(n) ** 3
        ratio, remainder = divmod(numerator, denominator)
        require(remainder == 0, "factorial ratio is not an integer")
        values = {}
        for p in sieve(max(2, 6 * n)):
            direct = valuation(ratio, p)
            floors = (factorial_valuation(6 * n, p)
                      - factorial_valuation(3 * n, p)
                      - 3 * factorial_valuation(n, p))
            digits_numerator = (digit_sum(3 * n, p) + 3 * digit_sum(n, p)
                                - digit_sum(6 * n, p))
            digits_value, digits_remainder = divmod(digits_numerator, p - 1)
            require(digits_remainder == 0 and direct == floors == digits_value,
                    f"valuation mismatch n={n}, p={p}")
            count += 1
            if p in (2, 3, 5, 7):
                values[str(p)] = direct
        if n in (1, 2, 5, 10, 30):
            specimens.append({"n": n, "A_n": str(ratio), "valuations": values})
    return {"evidence": "exact finite integer checks",
            "n_range_inclusive": [0, 30], "prime_valuation_comparisons": count,
            "methods": ["integer division", "Legendre floor sum", "base-p digit sum"],
            "samples": specimens}


def main():
    output = {"edition": "2026-11-21", "status": "all checks passed",
              "proof_source": "atlas/mathematical-notes.md",
              "alternating_towers": tower_checks(),
              "prime_pair_counts": polynomial_checks(),
              "wheel_210": wheel_checks(),
              "factorial_valuations": factorial_checks()}
    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
