# Palindrome counting and its limits

A focused reading note from the Pirate Chest

**Zolton / EncapsulatorP · with ChatGPT / 23 November 2026**

Source commit: `cc3f20117eaead570db6077377a43a92c0bfc652`

<a id="palindrome-counting-orientation"></a>

## Palindrome counting and its limits

*NOTE 07 · EXACT COUNT UNDER A SAMPLING MODEL*

For independent uniform q-symbol strings of length n, ordinary palindromes have probability q^−floor(n/2). The example q = 4, n = 40 has probability exactly 2⁻⁴⁰.

$$
\mathbb{P}(\mathrm{ordinary\ palindrome})=q^{-\lfloor n/2\rfloor}
$$

> **Exact count under a sampling model (exact).** The probability is tied to the stated sampling model. Forty is the sequence length in the example, not a proved limit on the size of a sustainable biological alphabet.

Count free positions in a reversed string, then distinguish ordinary reversal from reverse complementation. An expected number of independent complete-string draws is not a guarantee for overlapping windows.

### One concrete next step

Before making a biophysical claim, specify a physical alphabet, pairing rule and measurable stability or decay criterion. The finite combinatorics supplies no biochemical feasibility result.

### Sources and related reading

This note preserves the definitions and written derivation from the supplied mathematical fragments, reconstructed in the full collection. Its proof is given on the following page(s); no literature-priority claim is made.

[Read the pinned collection source](https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/cc3f20117eaead570db6077377a43a92c0bfc652/atlas/logistic-vanishing-terms.md#palindromes)

[Return to the Treasure Chest](https://encapsulatorp.github.io/#buried-logistic-vanishing)

<a id="palindromes"></a>

## Forty positions, four symbols

*01 · EXACT COUNTING AND THE BIOPHYSICS BOUNDARY*

Assume each symbol is chosen independently and uniformly from an alphabet of integer size q ≥ 2. An ordinary palindrome reads identically under reversal. For a fixed length n ≥ 1, the first ceiling(n/2) symbols determine the rest.

$$
\mathbb{P}(\mathrm{ordinary\ palindrome})=\frac{q^{\lceil n/2\rceil}}{q^n}=q^{-\lfloor n/2\rfloor}.
$$

The shorthand q<sup>−n/2</sup> is exact for even n. With q = 4 and n = 40,

$$
\mathbb{P}=4^{-20}=2^{-40}=\frac1{1\,099\,511\,627\,776}
$$

$$
\mathbb{P}\approx9.094947017729282\times10^{-13}.
$$

The reciprocal is approximately 1.10 × 10<sup>12</sup> independently sampled **complete strings** per first success in the geometric waiting model, including the successful draw. It is not a deterministic guarantee or an automatic formula for overlapping windows.

| Alphabet size q | Length n | Ordinary-palindrome probability |
| --- | --- | --- |
| 4 | 40 | 4⁻²⁰ = 2⁻⁴⁰ |
| 6 | 40 | 6⁻²⁰ |
| 8 | 40 | 8⁻²⁰ = 2⁻⁶⁰ |
| 12 | 40 | 12⁻²⁰ |
| 40 | 40 | 40⁻²⁰ |

> **What the number 40 means (open).** In the displayed example, 40 is the sequence length n and the alphabet size is q = 4. Taking q = 40 defines a different abstract counting experiment. Neither calculation establishes a maximum sustainable DNA alphabet, a chemical stability threshold or an optimal decay rate.

### Reversal and reverse complementation

A DNA reverse-complement palindrome is a different condition. Under a fixed-point-free complement pairing and the same uniform independent model, an even length has probability q<sup>−n/2</sup>; an odd length is impossible because its central symbol would have to complement itself.

The suggested synthetic-alphabet and biophysics thread therefore remains a research direction. It needs an explicit physical model, measurable stability criteria and suitable evidence beyond this combinatorial count.
