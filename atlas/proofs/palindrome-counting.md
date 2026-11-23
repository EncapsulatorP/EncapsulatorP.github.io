# Palindrome counting

A focused reading note from the Pirate Chest

**Zolton / EncapsulatorP · with ChatGPT / 23 November 2026**

<a id="palindrome-counting-orientation"></a>

## Palindrome counting

*NOTE 07 · EXACT COUNT UNDER A SAMPLING MODEL*

For independent uniform q-symbol strings of length n, ordinary palindromes have probability q^(−floor(n/2)). The example q = 4, n = 40 has probability exactly 2^(−40).

$$
\mathbb{P}(\mathrm{ordinary\ palindrome})=q^{-\lfloor n/2\rfloor}
$$

> **Exact count under a sampling model (exact).** The probability is tied to the stated sampling model. Forty is the sequence length in the example, not a proved limit on the size of a sustainable biological alphabet.

Count free positions in a reversed string, then distinguish ordinary reversal from reverse complementation. An expected number of independent complete-string draws is not a guarantee for overlapping windows.

### One concrete next step

Before making a biophysical claim, specify a physical alphabet, pairing rule and measurable stability or decay criterion. The finite combinatorics supplies no biochemical feasibility result.

### Sources and related reading

The following pages give the complete derivation from the stated definitions. The historical collection records the original fragments and argument.

[Historical collection source · original edition](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/logistic-vanishing-terms.md#palindromes)

[Return to the Treasure Chest](https://encapsulatorp.github.io/#buried-logistic-vanishing)

<a id="palindromes"></a>

## Forty positions, four symbols

*01 · EXACT COUNTING AND THE BIOPHYSICS BOUNDARY*

Choose symbols independently and uniformly from an alphabet of integer size q ≥ 2. For integer length n ≥ 1, an ordinary palindrome reads identically under reversal. There are ceiling(n/2) free positions, giving q^ceiling(n/2) palindromes among q^n strings.

$$
\mathbb{P}(\mathrm{ordinary\ palindrome})=\frac{q^{\lceil n/2\rceil}}{q^n}=q^{-\lfloor n/2\rfloor}.
$$

For even n, floor(n/2) = n/2, so the probability simplifies to q^(−n/2). With q = 4 and n = 40,

$$
\mathbb{P}=4^{-20}=2^{-40}=\frac1{1\,099\,511\,627\,776}
$$

$$
\mathbb{P}\approx9.094947017729282\times10^{-13}.
$$

The reciprocal gives an expected 1.10 × 10^12 independent **complete-string draws** per first success, including the successful draw. Overlapping windows require a separate dependence model.

| Alphabet size q | Length n | Ordinary-palindrome probability |
| --- | --- | --- |
| 4 | 40 | 4^(−20) = 2^(−40) |
| 6 | 40 | 6^(−20) |
| 8 | 40 | 8^(−20) = 2^(−60) |
| 12 | 40 | 12^(−20) |
| 40 | 40 | 40^(−20) |

> **What the number 40 means (open).** In the displayed example, 40 is the sequence length n and the alphabet size is q = 4. Taking q = 40 defines a different abstract counting experiment. Neither calculation establishes a maximum sustainable DNA alphabet, a chemical stability threshold or an optimal decay rate.

### Reversal and reverse complementation

For reverse-complement palindromes, assume a fixed-point-free complement pairing and the same sampling model. Then q is even. Even lengths have probability q^(−n/2); odd lengths are impossible because the central symbol would have to complement itself.

The suggested synthetic-alphabet and biophysics thread therefore remains a research direction. It needs an explicit physical model, measurable stability criteria and suitable evidence beyond this combinatorial count.
