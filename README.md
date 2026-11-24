<div align="center">

<img src="assets/logo-encapsulatorp-512.png" alt="EncapsulatorP logo" width="100">

# EncapsulatorP

**Computational mathematics · experimental number theory · recursive worlds**

Questions worth keeping. Constructions worth exploring. Arguments worth finishing.

**[Open the research atlas →](https://encapsulatorp.github.io/#atlas)**

[![The Pirate Chest quest: the P symbol, then five stops](assets/quest-header.svg)](https://encapsulatorp.github.io/treasure-hunt/quest/)

<a href="https://suno.com/s/aWDqYgQ2SZQSAFUz"><img src="assets/quest-song.svg" alt="Play Convolution Kiss, the quest song, on Suno" width="430"></a>

**P is the quest symbol.** *p* and *q* are the primes, **P** is what can be solved fast, and **?** is everything still unknown.

**Pick a treasure:** [① The two-factor gate](https://encapsulatorp.github.io/evidence/) · [② Goldbach observatory](https://encapsulatorp.github.io/interactive/goldbach.html) · [③ Disappointment Island](https://encapsulatorp.github.io/evidence/) · [④ The flat tangent](https://encapsulatorp.github.io/treasure-hunt/quest/) · ⑤ The defect you can count

<sub>Quest header and song button: Claude · Fable 5.2, 24 November 2026 · research direction Zolton / EncapsulatorP · zebracorn cut from Zolton's Grok video · Nevanlinna example and “Convolution Kiss”: DeepSeek contributions.</sub>

[![Omega Stability — a connected research thread](assets/omega-stability-thread-cover.png)](https://encapsulatorp.github.io/#atlas?entry=omega-stability)

</div>

The atlas brings research conversations into a permanent, searchable collection.
Its visual entrance leads to working mathematical exhibits, exact structures,
finite experiments and questions with a concrete next step. Open a thread for
its definitions, argument, source trail and related ideas.

## The living treasure rooms

Goldbach and the Pirate Chest now sit beside Atlas Spark in the navigation.
The other rooms have fresh entrances and working views of the mathematics:

- [Goldbach's observatory](https://encapsulatorp.github.io/#goldbach): choose an even sum, inspect every unordered prime pair, and switch between centre arcs and the exact product curve.
- [The Curious Cabinet](https://encapsulatorp.github.io/#cabinet): two selected views, Catalan's critical disk and C3.2Z's mirror/merge/split dynamics.
- [Hibernating Lemmas](https://encapsulatorp.github.io/#lemmas): factor the neighbours of a square and see the exact twin-prime criterion at work.
- [Collatz](https://encapsulatorp.github.io/#collatz): trace an integer flight before entering the complex Metamorphoses.
- [The Pirate Chest](https://encapsulatorp.github.io/#pirate-chest): move around the Rudin–Shapiro energy circle, then open its written argument.
- [Subject map and repositories](https://encapsulatorp.github.io/#archive): browse mathematics by subject, with a separate shelf explaining the scope of physics explorations.

Atlas Spark's content and its own CSS/JavaScript are preserved. The collection
now has 46 entries; the two Cabinet views deepen existing threads. See the
[edition notes and checks](atlas/living-rooms.md) and
[Cabinet formulas and provenance](atlas/cabinet-notes.md).

## Start with the strongest threads

| Thread | What is available |
|---|---|
| [Omega Stability](https://encapsulatorp.github.io/#atlas?entry=omega-stability) | The connected tower/logarithm/prime-layer thread and the original supplied cover |
| [The order of prime layers](https://encapsulatorp.github.io/#atlas?entry=prime-layer-waves) | An exact local expansion, signed second-harmonic response and recomputed scaling |
| [Alternating tower envelope](https://encapsulatorp.github.io/#atlas?entry=tower-envelope) | Written convergence and sharp-envelope proofs, including two bases for each interior upper remainder |
| [Logistic quarter-turn](https://encapsulatorp.github.io/#atlas?entry=logistic-quarter-turn) | A finite-order linearization at the two-cycle, with its nonlinear scope stated |
| [Catalan’s beta disk](https://encapsulatorp.github.io/#atlas?entry=beta-catalan-disk) | Exact coordinates and operator evaluation, with the zero-location question kept explicit |
| [Abel orbit signature](https://encapsulatorp.github.io/#atlas?entry=abel-orbit-signature) | A proved asymptotic characterization of the standard Collatz orbit outcomes |

**21 November 2026 edition:** 45 entries in five families. Twenty-eight entries
contain exact identities or written arguments; the remainder are finite
observations, reported computations, exploratory constructions, conjectural
directions and research tooling. These are evidence labels, not claims that all
entries are new discoveries. “New to this edition” means new to the atlas.

The selected recovery spans November 2025 to November 2026. It is not a complete
export of every conversation. The [provenance notes](atlas/recovery-notes.md)
record where a source was recovered and where a definition or table remains missing.

## Explore

- [Interactive atlas](https://encapsulatorp.github.io/#atlas): search, family/evidence filters, related threads and three working exhibits.
- [Complete HTML reading edition](atlas/README.html): every entry, equation and source link. [Markdown source](atlas/README.md).
- [The Pirate Chest · Orbital Treasures](https://encapsulatorp.github.io/#pirate-chest): Brun crossings, dagger towers and research treasures, connected to the atlas.
- [Hibernating Lemmas](https://encapsulatorp.github.io/#lemmas): small exact prime-pair identities and their proofs. The [Goldbach roadmap](lemmas/ROADMAP.md) records the next steps.
- [Goldbach](https://encapsulatorp.github.io/#goldbach), [Collatz](https://encapsulatorp.github.io/#collatz), and [towers](https://encapsulatorp.github.io/#towers): the existing visual exhibits.
- [Validatron](https://encapsulatorp.github.io/#validatron): the mathematical retrieval and proof-development programme.

## Valid proofs & surviving arguments

The [proof review board](https://encapsulatorp.github.io/treasure-hunt/) presents three connected records: **A**, nine reported PDF passages checked against the source and printed editions; **B**, fourteen statements with their hypotheses; and **C**, ten groups of surviving arguments. The inspected source and printed notation already contain the correct formulas. The confirmed text-extraction losses are recorded separately from mathematical correctness.

[Read the review in HTML](atlas/treasure-hunt-guide.html), [open the readable mathematical source](atlas/proof-review-board.md), or [choose a standalone proof](https://encapsulatorp.github.io/treasure-hunt/#proof-library). The public [board data](atlas/proof-board-data.json) identifies the reviewed starting commit, earlier PDF checksums, statement domains and evidence status. The [earlier complete collection](atlas/logistic-vanishing-terms.html) remains linked for comparison.

The logistic cubic, local attraction rate, dyadic/zeta ratio and explicitly defined transverse-attraction model appear in a separate **later additions** section. Exact two-cycle, quarter-turn, seed-folding, local-return and transport diagrams remain interactive. Solid lines denote proved implications; dotted lines denote assumptions; dashed lines denote open connections. The supplied Hopf and sphere-eversion references remain secondary and retain their [source and license credits](atlas/assets/treasure-hunt/media-sources.json).

To regenerate the notes, A/B/C review and static website, then check mathematical text recovery:

```sh
python3 atlas/build_proof_library.py
python3 atlas/build_treasure_hunt_guide.py
python3 atlas/build_treasure_site.py
python3 atlas/verify_html_semantics.py
```

The searchable HTML collection uses [proof-library.json](atlas/proof-library.json); the static board uses [proof-board-data.json](atlas/proof-board-data.json). The [Pirates Plan](https://encapsulatorp.github.io/#pirates-plan) and [repository graph](https://encapsulatorp.github.io/#repo-interlinks) hold the organisation-wide planning threads.

## Written arguments and reproduction

The [mathematical companion](atlas/mathematical-notes.md) and
[recovered bridges](atlas/recovered-bridges.md) state assumptions and proofs.
Written arguments, finite arithmetic checks and proof-assistant certificates are
distinct. Lean formalization is still pending for the highlighted targets.

```sh
python3 atlas/reproduce.py
python3 atlas/reproduce_experiments.py  # requires mpmath; recorded run used 1.3.0
python3 lemmas/verify_lemmas.py
python3 lemmas/verify_roadmap.py
node atlas/verify_rooms.cjs
```

The first command uses only the standard library. Integer checks are exact;
70-digit decimal/mpmath runs are numerical checks with residuals, not interval
certificates. The finite experiment output is preserved in
[experiment-results.json](atlas/experiment-results.json).

## Maintain the collection

Edit [atlas/catalog.json](atlas/catalog.json), then rebuild the complete reading edition:

```sh
python3 atlas/build_reading_site.py
```

This validates IDs, evidence labels, source URLs and related threads. It rebuilds
all 46 complete HTML entries, the full `atlas/README.html`, the Markdown source,
and the existing browser catalogue. The original evidence labels are preserved:
28 exact entries; finite, reported, conjectural, exploratory and tooling entries
keep their own stated scope.

The reading edition uses white pages and an azure / sapphire / cyan / indigo /
violet spectrum. Each page begins with its full reading content concealed, then
reveals the original English and mathematics in a downward cascade. Reviewed
prose uses authentic deterministic Zyntalic; equations, artwork and other source
blocks use temporary visual masks that restore their exact originals. Evidence
labels retain their stated scope throughout. Reduced motion and **Plain reading**
provide immediate English. Rejected claims have separate muted pages; their true
corrections survive.

Rebuild the complete collection, focused notes and authentic language data:

```sh
python3 -m pip install -r atlas/html-requirements.txt
python3 atlas/build_proof_html.py
python3 atlas/build_treasure_site.py
python3 atlas/build_zyntalic.py
python3 atlas/verify_html_semantics.py
node atlas/verify_reader.cjs
```

`build_zyntalic.py` reuses checked-in translations. For changed prose, install the [bundled MIT-licensed engine](atlas/vendor/README.md) and pass
`--translate` with Zyntalic 0.4.0 installed, or `--runner` with the translator
skill's supplied runner. The compressed cache retains the exact English, complete engine
records, context tails, sidecars, warnings and engine version. Visible context
tails are omitted from the animation; no invented replacement language is used.

**Export GIF** encodes the complete current document locally, paginates every
block, and uses the same full-content cascade as the reader. The original
EncapsulatorP logo appears on every GIF page and frame. The complete atlas and
each individual entry have their own export. The GIF is a visual recording;
selectable mathematics, navigation and source links remain in HTML. No account
or upload is needed to export. No first-party PDF documents are built or served.

The [complete logistic note](atlas/logistic-vanishing-terms.html) and its
[structured source](atlas/logistic-vanishing-terms.json) preserve every section,
including the opening, reading map and sources. Mathematical equations are
rendered as local vector images with exact LaTeX and accessible labels. Tables
and matrices retain their full HTML structure. The old PDF-named build commands
are compatibility entrypoints that now generate HTML only; historical audits
and external scholarly source citations keep their provenance.

The note includes an [illustrated proof](atlas/assets/logistic-proof.png) with a
matching [animated PNG](atlas/assets/logistic-proof.apng). To regenerate those
mathematical illustrations, run `python3 atlas/build_logistic_proof_visual.py`
with [the visual dependencies](atlas/logistic-visual-requirements.txt).

The browser loads local assets without a data-fetch dependency. Existing
analytics and visual exhibits remain part of the showcase.

<a id="buried-chat-stories--four-threads-reopened"></a>

<a id="the-pirate-chest--astral-secrets"></a>

## The Pirate Chest · Orbital Treasures

Recovered threads and checked notes.

- [The Ω series](https://encapsulatorp.github.io/#buried-omega-feedback) follows the Omega fixed point from a feedback loop to two prime layers whose order leaves a measurable second harmonic in the model.
- [The Collatz–Riemann hint that turned around](https://encapsulatorp.github.io/#buried-collatz-riemann-reversal) traces the failed singularity argument back to something exact. The known 1–4–2 cycle produces a pole in its own orbit series, with Abel limit $7/12$ after normalization.
- [The bubble versals tube](https://encapsulatorp.github.io/#buried-bubble-tube) pairs a model of sideways collapse and axial transport with the quarter-turn kernel behind the Catalan integral.
- [Logistic vanishing terms](https://encapsulatorp.github.io/#buried-logistic-vanishing) links the exact logistic two-cycle calculation, recovered notes on exponential maps, Schanuel and Mahler, and a review of the written proofs. [Read the note and proof review (HTML)](atlas/logistic-vanishing-terms.html).
- [XO₂, the two-sheet geometron](https://encapsulatorp.github.io/#buried-xo2) lets you flip the square-root sheet at the same input and compare what the zeta-based kernel returns.

*Signed, GPT Sol and Zolton*

## Signed atlas edition

### Paper bodies that open

The [workbench](https://encapsulatorp.github.io/#paper-table) has eight paper bodies
in each of two collections. A globe peels, the hollow portal and Noperthedron
release their faces, an illustrative neck separates, and a Klein-bottle immersion
opens its marked seams. Origami releases its creases; both tensegrity maps remain.
The nine subject links lead to the explanations and then their sources.

The [shape source ledger](atlas/shape-lab-sources.md) credits the supplied Claude
reference and the original mathematical sources. The Paper shapes workflow checks
new geometry and interactions. The [generation roadmap](atlas/shape-generation-roadmap.md)
describes how a future optimizer could propose more bodies for review.

EncapsulatorP is an independent project. Zolton leads the research and co-authors the atlas with the language models credited here. The notes record each contribution, with the evidence and sources attached to each result.

### AI co-author · ChatGPT

**GPT-6 Astra Pro · 21 November 2026**

Recovery, mathematical checks, writing and interactive atlas implementation.

*For the questions worth keeping, and the arguments worth finishing.*

Research direction and original explorations: **Zolton aka Inge / EncapsulatorP**.

### Earlier collaborators and recorded signatures

| Recorded name | Contribution and source |
|---|---|
| **Sol.6.1** | The signature on [Collatz Metamorphoses](https://encapsulatorp.github.io/#collatz), also preserved in exported images. |
| **GPT Sol and Zolton** | The signed note for The Pirate Chest above: Ω feedback, Collatz reversal, bubble tube and XO₂. |
| **GPT and Codex** | Prime Forms constructions, calculations, drawings and integration; Codex also signs The Order of Waves and edits The Pirate Chest. See [Prime Forms authorship](https://github.com/EncapsulatorP/c3._2z/blob/main/index.html#L839-L850). |
| **Claude** | Prime Forms’ white page and blue plates, lattice relief, spectral read-back, Omega drawing and assembly. See [Prime Forms authorship](https://github.com/EncapsulatorP/c3._2z/blob/main/index.html#L839-L850). |
| **Gemini (Neon)** | Living SPEC workspace, neon visual study, RG lattice, model checks and experimental lab sections. See [Prime Forms authorship](https://github.com/EncapsulatorP/c3._2z/blob/main/index.html#L839-L850). |
| **Neo** | Prime Forms visual layout and settings/live-check export helper, as credited in [the project README](https://github.com/EncapsulatorP/c3._2z/blob/main/README.md). |

**[Open the signatures and collaborators →](https://encapsulatorp.github.io/#atlas-credits)**

The recorded names remain as written in their sources. Neo and Gemini (Neon)
are retained as separate source credits; earlier model versions are named only
where a source identifies them. If an earlier version contributes again, its own
dated note and signature can join the page. The signature of this edition does
not replace the earlier signatures or alter their attribution.

Each research entry keeps its evidence level and original source trail.
Classical identities retain their literature context; inclusion does not claim priority.

