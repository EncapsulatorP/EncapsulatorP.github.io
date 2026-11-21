/* Paper-map content: subject links first, source links second.
 * Evidence and credits: atlas/paper-map-sources.md
 */
window.PIRATE_MAP_DATA = {
  "trail": [
    {
      "id": "shuffle-signal",
      "date": "Nov 2025",
      "kind": "treasure",
      "name": "Shuffle the signal",
      "question": "If you move every tile to a new place, can you still get the old picture back?",
      "clue": "Yes, when every place is used exactly once: the inverse permutation undoes the move. For the normalized Fourier construction, distinct row indices modulo N preserve the basis; a repeated index creates a duplicate row.",
      "href": "#atlas?entry=tower-hadamard",
      "repository": "https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/atlas/recovered-bridges.md#tower-hadamard",
      "repositoryLabel": "Read the Fourier derivation",
      "evidenceLabel": "Exact permutation criterion",
      "topic": "Fourier bases"
    },
    {
      "id": "forty-eight-lanes",
      "date": "Dec 2025",
      "kind": "treasure",
      "name": "The forty-eight lanes",
      "question": "Cross out multiples of 2, 3, 5 and 7 on a wheel marked 0 to 209. How many lanes stay open?",
      "clue": "Exactly 48. Every prime above 7 lands in one of these coprime remainder classes. So does 121, which is 11². The wheel supplies a complete candidate filter when all 48 lanes are retained.",
      "href": "#atlas?entry=wheel-210",
      "repository": "https://github.com/EncapsulatorP/Periodic-Table-of-Primes-210/blob/main/README.md",
      "repositoryLabel": "Open the PTP-210 source",
      "evidenceLabel": "Exact count; candidate filter",
      "topic": "Prime sieves"
    },
    {
      "id": "impossible-coastline",
      "date": "Feb 2026",
      "kind": "wildcard",
      "name": "The impossible coastline",
      "question": "Can two maps take the same steps at every integer and still draw different worlds between the integers?",
      "clue": "A sine term that vanishes at every integer leaves the displayed Collatz steps unchanged, while off-integer orbits can move. Which geometric features survive across a specified family of extensions remains an open question.",
      "href": "#buried-complex-collatz",
      "repository": "https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/atlas/mathematical-notes.md#collatz-integer-spine",
      "repositoryLabel": "Read the integer-spine argument",
      "evidenceLabel": "Exact integer agreement; open geometry",
      "topic": "Complex Collatz maps"
    },
    {
      "id": "missing-term",
      "date": "Apr 2026",
      "kind": "trap",
      "name": "The missing term",
      "question": "One orbit drops out of a sum. Does that single missing term have to blow a hole in the function?",
      "clue": "At one fixed positive integer n, changing a weight adds or removes a constant times n⁻ˢ. That function is entire, so the single change cannot introduce a singularity. The whole coefficient sequence controls the harder analytic question.",
      "href": "#buried-collatz-riemann-reversal",
      "repository": "https://github.com/EncapsulatorP/EncapsulatorP.github.io",
      "repositoryLabel": "Atlas source repository",
      "evidenceLabel": "Failed inference: one missing term",
      "topic": "Weighted Dirichlet series"
    },
    {
      "id": "repeating-current",
      "date": "May 2026",
      "kind": "treasure",
      "name": "The repeating current",
      "question": "A current is stuck in the loop 1 → 4 → 2 → 1. What average do its reciprocal readings leave behind?",
      "clue": "The reciprocal readings repeat as 1, ¼ and ½, with mean 7/12. Normalizing the discounted orbit sum by 1 − q gives the same limit as q approaches 1 from below. This covers the stated cycle and orbits that eventually join it.",
      "href": "#atlas?entry=abel-orbit-signature",
      "repository": "https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/atlas/recovered-bridges.md#abel-orbit-signature",
      "repositoryLabel": "Read the Abel-limit derivation",
      "evidenceLabel": "Exact limit for the stated cycle",
      "topic": "Collatz orbit averages"
    },
    {
      "id": "brun-crossing",
      "date": "Jun 2026",
      "kind": "trap",
      "name": "Brun’s glittering crossing",
      "question": "A tower matches a famous constant after you turn a knob. What would you try before calling it a discovery?",
      "clue": "Freeze the base-selection rule before looking at the target, then compare other preselected targets. Every positive excess below the tower’s sharp maximum can be reached at two bases, so tuning a crossing alone establishes no twin-prime connection.",
      "href": "#buried-brun-crossing",
      "repository": "https://github.com/EncapsulatorP/Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers/blob/main/notes/boundary_residue_notes.md",
      "repositoryLabel": "Open the boundary-residue note",
      "evidenceLabel": "Failed inference: a tuned match",
      "topic": "Towers and constants"
    },
    {
      "id": "impostor-prime",
      "date": "Jun 2026",
      "kind": "trap",
      "name": "The impostor prime",
      "question": "Every prime passes the Perrin test. Can a square walk straight through it too?",
      "clue": "Yes. For P₀ = 3, P₁ = 0, P₂ = 2 and Pₙ = Pₙ₋₂ + Pₙ₋₃, the divisibility test accepts 271441 = 521². The rule is necessary for primes; this exact composite counterexample breaks the converse.",
      "href": "#buried-perrin-pseudoprime",
      "repository": "https://github.com/EncapsulatorP/EncapsulatorP.github.io",
      "repositoryLabel": "Atlas source repository",
      "evidenceLabel": "Exact composite counterexample",
      "topic": "Primality tests"
    },
    {
      "id": "xo2-cave",
      "date": "Nov 2026",
      "kind": "wildcard",
      "name": "XO₂, the two-sheet cave",
      "question": "At the same input, square root gives you two doors. What happens if you feed each door into the zeta kernel?",
      "clue": "At z = ¼, the two sheets send the zeta input to 7/4 or 3/4. With the source’s three-term kernel, the recorded outputs are about 0.140269 and 2.817643. These finite evaluations open a question about the surrounding landscape.",
      "href": "#buried-xo2",
      "repository": "https://github.com/EncapsulatorP/zeta_branching/blob/main/scripts/zeta_branching.py",
      "repositoryLabel": "Read the XO₂ kernel",
      "evidenceLabel": "Two recorded finite evaluations",
      "topic": "Zeta branches"
    },
    {
      "id": "second-beat",
      "date": "Nov 2026",
      "kind": "treasure",
      "name": "The hidden second beat",
      "question": "Reverse two different prime layers with the same fixed point and composition slope. Where can you hear the order?",
      "clue": "At Ω the two compositions share a fixed point and slope, while their difference starts at second order. A small sinusoidal drive gives a mean and a second harmonic at leading order. Swapping the layers flips the difference’s sign.",
      "href": "#buried-omega-order",
      "repository": "https://github.com/EncapsulatorP/c3._2z/blob/main/README.md",
      "repositoryLabel": "Open Prime Forms and Ω waves",
      "evidenceLabel": "Exact local expansion",
      "topic": "Prime-layer response"
    }
  ],
  "shapes": [
    {
      "key": "origami",
      "name": "Origami chart",
      "description": "An illustrative folded sheet whose creases organize the trail.",
      "sourceLabel": "Atlas fold drawing",
      "sourceUrl": "https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/assets/paper-map-engine.js"
    },
    {
      "key": "sphere",
      "name": "Riemann sphere",
      "description": "A paper globe inspired by the complex plane with one point at infinity.",
      "sourceLabel": "Stereographic projection · Jason Murphy",
      "sourceUrl": "https://pages.uoregon.edu/jamu/Math5351-lecture-notes.pdf"
    },
    {
      "key": "portal",
      "name": "Rupert-inspired portal",
      "description": "An oblique opening through a faceted paper body, inspired by the cube-passage question.",
      "sourceLabel": "O. Bottema · A Problem of Pieter Nieuwland",
      "sourceUrl": "https://cms.math.ca/wp-content/uploads/crux-pdfs/Crux_v4n04_Apr.pdf"
    },
    {
      "key": "tensegrity",
      "name": "Tensegrity prism",
      "description": "A triangular prism drawn with tension cables and compression struts.",
      "sourceLabel": "Tensegrity mathematics · Cornell",
      "sourceUrl": "https://pi.math.cornell.edu/~back/amsci_tenseg_scan.pdf"
    },
    {
      "key": "terrace",
      "name": "Terraced paper",
      "description": "A stepped paper landscape arranging the same nine landmarks into a reading path.",
      "sourceLabel": "Atlas navigation drawing",
      "sourceUrl": "https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/assets/paper-map-engine.js"
    }
  ],
  "credits": [
    {
      "name": "Zolton",
      "role": "Research and visual direction",
      "note": "The research collection and the paper-polyhedron pirate-map direction belong to Zolton."
    },
    {
      "name": "Neon (Gemini)",
      "role": "Supplied prototype signature",
      "note": "This is the signature recorded on the uploaded prototype. It is preserved as supplied, without treating it as authenticated model identity."
    },
    {
      "name": "ChatGPT",
      "role": "Current map implementation and editing",
      "note": "This credit covers the current implementation. Historical contributions keep the names and model versions documented in their own sources."
    }
  ]
};

