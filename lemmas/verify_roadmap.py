#!/usr/bin/env python3
"""Finite checks for the Goldbach p+q roadmap identities (see lemmas/ROADMAP.md).

Standard library only.  Run:  python3 lemmas/verify_roadmap.py [LIMIT]
These are sanity checks of exact identities on a finite range, not proofs,
and they say nothing about Goldbach or twin primes beyond that range.
"""
import math
import sys

LIMIT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000

comp = bytearray(LIMIT + 3)
for i in range(2, int((LIMIT + 2) ** 0.5) + 1):
    if not comp[i]:
        for j in range(i * i, LIMIT + 3, i):
            comp[j] = 1
a = [0, 0] + [0 if comp[n] else 1 for n in range(2, LIMIT + 3)]
primes = [n for n in range(2, LIMIT + 3) if a[n]]


def mobius(n):
    r, d = 1, 2
    while d * d <= n:
        if n % d == 0:
            n //= d
            if n % d == 0:
                return 0
            r = -r
        d += 1
    return -r if n > 1 else r


def mangoldt(n):
    for p in primes:
        if p * p > n:
            break
        if n % p == 0:
            while n % p == 0:
                n //= p
            return math.log(p) if n == 1 else 0.0
    return math.log(n) if n > 1 else 0.0


def main():
    # 1. Goldbach: G(N) = sum a(n) a(N-n) = [z^N] P_N(z)^2  (ordered pairs).
    for N in range(4, LIMIT + 1, 2):
        G = sum(a[n] * a[N - n] for n in range(2, N - 1))
        coeff = sum(1 for p in primes if p <= N and N - p >= 2 and a[N - p])
        assert G == coeff
        assert G > 0, N
        unordered = sum(1 for p in primes if p <= N - p and a[N - p])
        assert G == 2 * unordered - (1 if N % 2 == 0 and a[N // 2] else 0)
    print(f"1  G(N) = [z^N] P_N(z)^2 and G(N) > 0 for even 4 <= N <= {LIMIT}")

    # 2. Twins: T(X) = sum a(n) a(n+2) = [z^2] P_{X+2}(z) P_X(1/z).
    T = 0
    for X in range(2, LIMIT + 1):
        T += a[X] * a[X + 2]
        if X % 500 == 0 or X == LIMIT:
            coeff = sum(1 for q in primes if q <= X + 2 and q - 2 >= 2
                        and q - 2 <= X and a[q - 2])
            assert T == coeff
    print(f"2  T(X) = [z^2] P_(X+2)(z) P_X(1/z); T({LIMIT}) = {T}")

    # 3. Inversion: Lambda(n) = sum_{d | n} mu(d) log(n/d).
    for n in range(1, 2001):
        s = sum(mobius(d) * math.log(n // d) for d in range(1, n + 1) if n % d == 0)
        assert abs(s - mangoldt(n)) < 1e-9, n
    print("3  Lambda(n) = sum_{d|n} mu(d) log(n/d) for 1 <= n <= 2000")

    # 4. R(N) = sum Lambda(n) Lambda(N-n) includes prime powers: it is not G(N).
    N = 12
    R = sum(mangoldt(n) * mangoldt(N - n) for n in range(1, N))
    pp = [(n, N - n) for n in range(1, N)
          if mangoldt(n) and mangoldt(N - n) and not (a[n] and a[N - n])]
    assert pp, "expected prime-power terms"
    print(f"4  R(12) = {R:.4f}; prime-power terms present, e.g. {pp[:3]}")
    print("all checks passed")


if __name__ == "__main__":
    main()
