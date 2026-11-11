#!/usr/bin/env python3
"""Finite sanity checks for the Hibernating Lemmas (Treasures 001-004).

Standard library only.  Run:  python3 lemmas/verify_lemmas.py [LIMIT]

These checks are NOT proofs.  The proofs are the elementary arguments in
lemmas/LEMMAS.md; this script only confirms that the statements, specimens and
counterexamples printed on the site are arithmetically right up to LIMIT.
"""
import sys

LIMIT = int(sys.argv[1]) if len(sys.argv) > 1 else 200_000


def sieve_spf(n):
    """Smallest prime factor for every integer up to n."""
    spf = list(range(n + 1))
    i = 2
    while i * i <= n:
        if spf[i] == i:
            for j in range(i * i, n + 1, i):
                if spf[j] == j:
                    spf[j] = i
        i += 1
    return spf


SPF = sieve_spf(LIMIT + 2)


def is_prime(n):
    return n >= 2 and SPF[n] == n


def factor(n):
    """Prime factorisation as {prime: exponent}; n may exceed the sieve."""
    out, d = {}, 2
    while n > 1 and d * d <= n:
        while n % d == 0:
            out[d] = out.get(d, 0) + 1
            n //= d
        d += 1
    if n > 1:
        out[n] = out.get(n, 0) + 1
    return out


def factor_product(a, b):
    """Factorisation of a*b for a, b inside the sieve (fast path)."""
    out = {}
    for n in (a, b):
        while n > 1:
            p = SPF[n]
            out[p] = out.get(p, 0) + 1
            n //= p
    return out


def mu_of(f):
    return 0 if any(e > 1 for e in f.values()) else (-1) ** len(f)


def mu(n):
    return mu_of(factor(n))


def main():
    # Treasure 001 - twin primes force the adjacent pattern (+1, 0).
    twins = 0
    for p in range(3, LIMIT):
        if is_prime(p) and is_prime(p + 2):
            twins += 1
            assert p * (p + 2) + 1 == (p + 1) ** 2
            assert mu_of(factor_product(p, p + 2)) == 1
            assert mu_of(factor_product(p + 1, p + 1)) == 0
    print(f"001  twin pairs checked below {LIMIT}: {twins}  -> all give (+1, 0)")

    # Treasure 002 - centre/half-gap identity pq = m^2 - d^2 for odd primes.
    odd_primes = [p for p in range(3, 2000) if is_prime(p)]
    pairs = 0
    for i, p in enumerate(odd_primes):
        for q in odd_primes[i:]:
            m, d = (p + q) // 2, (q - p) // 2
            assert p * q == m * m - d * d and p + q == 2 * m and q - p == 2 * d
            assert mu_of(factor_product(p, q)) == (1 if p != q else 0)
            pairs += 1
    print(f"002  odd prime pairs p <= q < 2000 checked: {pairs}")

    # Treasure 003 - the converse of 001 fails; m = 34 is the first failure.
    failures = []
    for m in range(2, LIMIT):
        if mu_of(factor_product(m - 1, m + 1)) == 1 and not (
            is_prime(m - 1) and is_prime(m + 1)
        ):
            failures.append(m)
    assert failures[0] == 34 and factor(34 * 34 - 1) == {3: 1, 5: 1, 7: 1, 11: 1}
    print(f"003  mu(m^2-1)=+1 without twins: {len(failures)} values of m below "
          f"{LIMIT}; first few {failures[:6]}")

    # Treasure 004 - exact repair: for m >= 3,
    #   (m-1, m+1) twin primes  <=>  Omega(m^2 - 1) = 2.
    for m in range(3, LIMIT):
        omega = sum(factor_product(m - 1, m + 1).values())
        assert (omega == 2) == (is_prime(m - 1) and is_prime(m + 1)), m
    print(f"004  Omega(m^2-1)=2 <=> twin primes: holds for 3 <= m < {LIMIT}")

    # Remark - for distinct primes p, q the pattern at (pq, pq+1) needs only a
    # square divisor of pq + 1; twins are sufficient, not necessary.
    assert (mu(39), mu(40)) == (1, 0)          # 3 * 13, then 2^3 * 5
    assert (mu(33), mu(34)) == (1, 1)          # 3 * 11, then 2 * 17: no pattern
    print("rem  (3,13): mu(39), mu(40) = (+1, 0) without twins; "
          "(3,11): mu(34) = +1, no pattern")

    # Corrections log - the values quoted in the earlier draft.
    assert mu(440) == 0 and mu(224) == 0       # neither is a counterexample
    assert factor(143) == {11: 1, 13: 1} and factor(323) == {17: 1, 19: 1}
    print("log  440 and 224 have mu = 0; 143 and 323 are both twin products "
          "(not counterexamples)")
    print("all checks passed")


if __name__ == "__main__":
    main()
