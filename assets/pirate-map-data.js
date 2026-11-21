/* Paper-map content: subject links first, source links second.
 * Evidence and credits: atlas/paper-map-sources.md and atlas/shape-lab-sources.md
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
      "sourceUrl": "https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/assets/paper-map-engine.js",
      "family": "studio",
      "foldable": true,
      "unfoldLabel": "Release the creases",
      "phases": [
        "Folded paper",
        "Creases opening",
        "Open sheet"
      ],
      "lesson": "A folded sheet can become a chart. The same nine landmarks move with its material coordinates, so every stop keeps its identity while the sheet opens.",
      "boundary": "This is an illustrative accordion deformation. No rigid Miura mechanism or paper-engineering specification is claimed.",
      "unfoldable": true
    },
    {
      "key": "sphere",
      "name": "Riemann sphere",
      "description": "A globe peels from the pole and opens into a round chart; slide to explore every stage.",
      "sourceLabel": "Stereographic projection · Jason Murphy",
      "sourceUrl": "https://pages.uoregon.edu/jamu/Math5351-lecture-notes.pdf",
      "family": "studio",
      "foldable": false,
      "unfoldLabel": "Peel the globe",
      "phases": [
        "Globe",
        "Peeling from the pole",
        "Round chart"
      ],
      "lesson": "The Riemann sphere represents the complex plane together with one point at infinity. Here a separate visual transformation opens the globe into a round chart, keeping a continuous trail of landmarks.",
      "boundary": "Peeling stretches the displayed surface. It is an illustrative cut-and-flatten animation, not stereographic projection or an isometric paper unfolding.",
      "unfoldable": true
    },
    {
      "key": "portal",
      "name": "Rupert-inspired portal",
      "description": "A hollow paper body opens its faces, revealing the trail through its changing geometry.",
      "sourceLabel": "O. Bottema · A Problem of Pieter Nieuwland",
      "sourceUrl": "https://cms.math.ca/wp-content/uploads/crux-pdfs/Crux_v4n04_Apr.pdf",
      "family": "studio",
      "foldable": false,
      "unfoldLabel": "Unhinge the portal",
      "phases": [
        "Hollow body",
        "Faces opening",
        "Open face layout"
      ],
      "lesson": "A hollow paper body suggests the cube-passage question: can a copy pass through a suitable opening? Its face layout gives us another way to arrange the research trail.",
      "boundary": "This decorative body is not a passage certificate. The animation does not establish a Rupert property or a maximum passage ratio.",
      "unfoldable": true
    },
    {
      "key": "tensegrity",
      "name": "Tensegrity prism",
      "description": "A triangular prism drawn with tension cables and compression struts.",
      "sourceLabel": "Tensegrity mathematics · Cornell",
      "sourceUrl": "https://pi.math.cornell.edu/~back/amsci_tenseg_scan.pdf",
      "family": "studio",
      "foldable": false,
      "lesson": "Three compression struts and nine tension cables form this ideal tensegrity prism. Its joints satisfy the stated force-density balance; orbit the model to see how the members connect.",
      "boundary": "A balanced geometric drawing is not a load-capacity or prestress-stability certificate."
    },
    {
      "key": "terrace",
      "name": "Terraced paper",
      "description": "A stepped paper landscape arranging the same nine landmarks into a reading path.",
      "sourceLabel": "Atlas navigation drawing",
      "sourceUrl": "https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/assets/paper-map-engine.js",
      "family": "studio",
      "foldable": false,
      "lesson": "Terraces and islands arrange the same nine subject destinations. Their heights are an artistic choice, not an evidence or performance score.",
      "boundary": "This form remains a landscape while the view moves around it."
    },
    {
      "key": "noperthedron",
      "name": "Noperthedron",
      "description": "A many-faceted body releases into a spreading layout of hinged faces.",
      "family": "studio",
      "foldable": false,
      "sourceLabel": "Steininger & Yurkevich · original construction",
      "sourceUrl": "https://arxiv.org/abs/2508.18475",
      "unfoldLabel": "Unfold the Noperthedron",
      "phases": [
        "152 faces",
        "Hinges releasing",
        "Face layout"
      ],
      "lesson": "Steininger and Yurkevich constructed a convex polyhedron without Rupert’s property. The supplied visual mesh has 90 vertices and 152 faces. Its faces open along a spanning tree of shared edges.",
      "boundary": "The display uses rounded coordinates. The theorem belongs to the authors’ exact construction; neither this rendering nor its hinged layout certifies non-passage or a non-overlapping paper net.",
      "unfoldable": true
    },
    {
      "key": "neck",
      "name": "Neck surgery",
      "description": "A narrow neck pinches, separates and opens into two chart-like lobes.",
      "family": "studio",
      "foldable": false,
      "sourceLabel": "Perelman · Ricci flow with surgery on three-manifolds",
      "sourceUrl": "https://arxiv.org/abs/math/0303109",
      "unfoldLabel": "Pinch, cut and open",
      "phases": [
        "Joined lobes",
        "Pinch · separate",
        "Two open charts"
      ],
      "lesson": "A narrow neck shrinks, the lobes separate, and each opens into a chart. This is a visual doorway into the neck-and-cap idea associated with Hamilton–Perelman Ricci-flow surgery.",
      "boundary": "This two-dimensional surface cartoon does not compute Ricci flow. Perelman’s surgery concerns three-manifolds; the animation provides no physical prediction.",
      "unfoldable": true
    },
    {
      "key": "klein",
      "name": "Klein bottle",
      "description": "A one-sided surface, shown as a 3D immersion, opens into a rectangle with paired seams.",
      "family": "studio",
      "foldable": false,
      "sourceLabel": "C. McMullen · topology of surfaces",
      "sourceUrl": "https://legacy-www.math.harvard.edu/~ctm/papers/home/text/class/harvard/131/course/course.pdf",
      "unfoldLabel": "Open the Klein bottle",
      "phases": [
        "Klein immersion",
        "Cutting the seams",
        "Marked sheet"
      ],
      "lesson": "A Klein bottle can be described by a rectangle with opposite edges identified: one pair in the same direction and the other reversed. Follow the marked seams as the displayed bottle opens back into that rectangle.",
      "boundary": "A Klein bottle has no self-intersection as an abstract surface. The crossing is a feature of its immersion in three-dimensional space. The cut-and-open morph changes the displayed seams; it is not a physical bottle turning into a flat sheet.",
      "unfoldable": true
    },
    {
      "key": "voyage-chart",
      "name": "The open-chart voyage",
      "description": "An opened paper chart, turning geometric wheels and two folded boats tracing a route between the discoveries.",
      "family": "voyage",
      "foldable": true,
      "sourceLabel": "Atlas fold drawing",
      "sourceUrl": "https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/assets/paper-map-engine.js",
      "unfoldLabel": "Release the creases",
      "phases": [
        "Folded paper",
        "Creases opening",
        "Open sheet"
      ],
      "lesson": "A folded sheet can become a chart. The same nine landmarks move with its material coordinates, so every stop keeps its identity while the sheet opens.",
      "boundary": "This is an illustrative accordion deformation. No rigid Miura mechanism or paper-engineering specification is claimed.",
      "unfoldable": true
    },
    {
      "key": "voyage-globe",
      "name": "The globe harbour",
      "description": "A globe peels open over the chart while paper boats follow the printed voyage.",
      "family": "voyage",
      "foldable": false,
      "sourceLabel": "Stereographic projection · Jason Murphy",
      "sourceUrl": "https://pages.uoregon.edu/jamu/Math5351-lecture-notes.pdf",
      "unfoldLabel": "Peel the globe",
      "phases": [
        "Globe",
        "Peeling from the pole",
        "Round chart"
      ],
      "lesson": "The Riemann sphere represents the complex plane together with one point at infinity. Here a separate visual transformation opens the globe into a round chart, keeping a continuous trail of landmarks.",
      "boundary": "Peeling stretches the displayed surface. It is an illustrative cut-and-flatten animation, not stereographic projection or an isometric paper unfolding.",
      "unfoldable": true
    },
    {
      "key": "voyage-portal",
      "name": "The impossible passage",
      "description": "A hollow paper portal on a folded sea chart. The boats and passage are an imaginative setting for exploring the research.",
      "family": "voyage",
      "foldable": false,
      "sourceLabel": "O. Bottema · A Problem of Pieter Nieuwland",
      "sourceUrl": "https://cms.math.ca/wp-content/uploads/crux-pdfs/Crux_v4n04_Apr.pdf",
      "unfoldLabel": "Unhinge the portal",
      "phases": [
        "Hollow body",
        "Faces opening",
        "Open face layout"
      ],
      "lesson": "A hollow paper body suggests the cube-passage question: can a copy pass through a suitable opening? Its face layout gives us another way to arrange the research trail.",
      "boundary": "This decorative body is not a passage certificate. The animation does not establish a Rupert property or a maximum passage ratio.",
      "unfoldable": true
    },
    {
      "key": "voyage-rigging",
      "name": "Tension and sail",
      "description": "A miniature rigging structure over the paper sea, with folded boats and a route through the same nine discoveries.",
      "family": "voyage",
      "foldable": false,
      "sourceLabel": "Zolton’s paper-voyage direction · current 3D implementation",
      "sourceUrl": "https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/assets/paper-map-engine.js",
      "lesson": "Three compression struts and nine tension cables form this ideal tensegrity prism. Its joints satisfy the stated force-density balance; orbit the model to see how the members connect.",
      "boundary": "A balanced geometric drawing is not a load-capacity or prestress-stability certificate."
    },
    {
      "key": "voyage-islands",
      "name": "Islands from paper",
      "description": "Layered paper islands rise from an opened chart while little origami boats travel between the landmarks.",
      "family": "voyage",
      "foldable": false,
      "sourceLabel": "Zolton’s paper-voyage direction · current 3D implementation",
      "sourceUrl": "https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/assets/paper-map-engine.js",
      "lesson": "Terraces and islands arrange the same nine subject destinations. Their heights are an artistic choice, not an evidence or performance score.",
      "boundary": "This form remains a landscape while the view moves around it."
    },
    {
      "key": "voyage-noperthedron",
      "name": "A hundred and fifty-two sails",
      "description": "A Noperthedron unfolds its face tree above the chart while paper boats follow the discoveries.",
      "family": "voyage",
      "foldable": false,
      "sourceLabel": "Steininger & Yurkevich · original construction",
      "sourceUrl": "https://arxiv.org/abs/2508.18475",
      "unfoldLabel": "Unfold the Noperthedron",
      "phases": [
        "152 faces",
        "Hinges releasing",
        "Face layout"
      ],
      "lesson": "Steininger and Yurkevich constructed a convex polyhedron without Rupert’s property. The supplied visual mesh has 90 vertices and 152 faces. Its faces open along a spanning tree of shared edges.",
      "boundary": "The display uses rounded coordinates. The theorem belongs to the authors’ exact construction; neither this rendering nor its hinged layout certifies non-passage or a non-overlapping paper net.",
      "unfoldable": true
    },
    {
      "key": "voyage-neck",
      "name": "Two seas from one neck",
      "description": "An illustrative neck surgery opens two lobes above a shared route.",
      "family": "voyage",
      "foldable": false,
      "sourceLabel": "Perelman · Ricci flow with surgery on three-manifolds",
      "sourceUrl": "https://arxiv.org/abs/math/0303109",
      "unfoldLabel": "Pinch, cut and open",
      "phases": [
        "Joined lobes",
        "Pinch · separate",
        "Two open charts"
      ],
      "lesson": "A narrow neck shrinks, the lobes separate, and each opens into a chart. This is a visual doorway into the neck-and-cap idea associated with Hamilton–Perelman Ricci-flow surgery.",
      "boundary": "This two-dimensional surface cartoon does not compute Ricci flow. Perelman’s surgery concerns three-manifolds; the animation provides no physical prediction.",
      "unfoldable": true
    },
    {
      "key": "voyage-klein",
      "name": "The one-sided voyage",
      "description": "A Klein-bottle immersion opens its marked seams above the paper sea.",
      "family": "voyage",
      "foldable": false,
      "sourceLabel": "C. McMullen · topology of surfaces",
      "sourceUrl": "https://legacy-www.math.harvard.edu/~ctm/papers/home/text/class/harvard/131/course/course.pdf",
      "unfoldLabel": "Open the Klein bottle",
      "phases": [
        "Klein immersion",
        "Cutting the seams",
        "Marked sheet"
      ],
      "lesson": "A Klein bottle can be described by a rectangle with opposite edges identified: one pair in the same direction and the other reversed. Follow the marked seams as the displayed bottle opens back into that rectangle.",
      "boundary": "A Klein bottle has no self-intersection as an abstract surface. The crossing is a feature of its immersion in three-dimensional space. The cut-and-open morph changes the displayed seams; it is not a physical bottle turning into a flat sheet.",
      "unfoldable": true
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
      "name": "Claude",
      "role": "Supplied unfolding reference",
      "note": "The uploaded cut-a-shape-open prototype supplied the globe peel, Noperthedron face tree, accordion and neck-surgery reference. The current renderer adapts these ideas and credits their mathematical sources separately."
    },
    {
      "name": "ChatGPT",
      "role": "Current map implementation and editing",
      "note": "This credit covers the current implementation. Historical contributions keep the names and model versions documented in their own sources."
    }
  ]
};
