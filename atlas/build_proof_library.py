#!/usr/bin/env python3
"""Build focused proof notes from the preserved mathematical collection.

Run from the repository root: python3 atlas/build_proof_library.py
Dependencies: atlas/proof-library-requirements.txt.

The source collection remains canonical for the arguments. Edit those argument
pages there and the orientation/next-step information in NOTE_SPECS below, then
rebuild. The original collection PDF is never overwritten by this command.
The shared PDF renderer is imported, not modified.

The recovered collapse note is authored separately in
atlas/logistic-collapse-vanishing.{json,md}; this command mirrors those sources
into the proof library and renders their PDF without rewriting the originals.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
from contextlib import contextmanager
from pathlib import Path

from pypdf import PdfReader
import build_logistic_vanishing_pdf as renderer


BASE = Path(__file__).resolve().parent
SITE = "https://encapsulatorp.github.io"
REVIEW_COMMIT = "29f9232545aa112cd6ffa9fe1f3c0e85d093dedd"
HISTORICAL_COLLECTION_COMMIT = "cc3f20117eaead570db6077377a43a92c0bfc652"
REPO = "https://github.com/EncapsulatorP/EncapsulatorP.github.io"

SOURCES = {
    "S1": {
        "text": "<b>[S1] Logistic quarter-turn.</b> EncapsulatorP, <i>Recovered constructions</i>, §2. The factorization, paired matrix and fourth-iterate derivative statement are linked to the historical source reviewed here.",
        "url": f"{REPO}/blob/{REVIEW_COMMIT}/atlas/recovered-bridges.md#logistic-quarter-turn",
        "label": "[S1] Read the pinned logistic argument",
    },
    "S2": {
        "text": "<b>[S2] Towers and prime polynomials.</b> EncapsulatorP, <i>Exact structures behind the atlas</i>, edition 21 November 2026, §§1, 2 and 4. The written arguments record their scope, prior solver provenance and numerical limits.",
        "url": f"{REPO}/blob/{REVIEW_COMMIT}/atlas/mathematical-notes.md",
        "label": "[S2] Read the pinned mathematical notes",
    },
    "S3": {
        "text": "<b>[S3] Even-zeta values.</b> NIST Digital Library of Mathematical Functions, §25.6, equation 25.6.2. This classical formula supplies the exact coefficient c<sub>p</sub>.",
        "url": "https://dlmf.nist.gov/25.6.E2",
        "label": "[S3] Euler’s even-zeta evaluation",
    },
    "S4": {
        "text": "<b>[S4] Complex Schanuel conjecture.</b> I. A. Broudy and S. Eterović, <i>Schanuel type conjectures and disjointness</i>, The Ramanujan Journal 62 (2023), 781–795, Conjecture 3.1. This supplies the conjectural assumption; the Z(p) deduction is written here.",
        "url": "https://link.springer.com/article/10.1007/s11139-023-00707-3",
        "label": "[S4] Read the precise Schanuel assumption",
    },
}

NOTE_SPECS = [
    {
        "slug": "logistic-quarter-turn",
        "title": "The logistic quarter-turn",
        "shortTitle": "Logistic quarter-turn",
        "status": "exact", "statusLabel": "Exact local result", "kind": "proof",
        "summary": "A two-cycle has return multiplier −1 at r = 1 + √6. Its paired derivative matrix has fourth power I, and the fourth-return displacement has zero first derivative at the cycle points.",
        "scope": "The result concerns the specified cycle points and the defined paired derivative model. The nonlinear fourth iterate is a degree-16 polynomial, not the identity map.",
        "equation": r"r_*=1+\sqrt{6},\qquad C_*^2=-I,\qquad C_*^4=I",
        "orientation": "Start with the picture, then follow the second-iterate factorization and multiplier calculation. The two-point orbit and the four-turn linear model are explicitly separated.",
        "nextStep": "Read the companion cubic calculation to obtain local attraction and its rate. For a further geometric connection, specify the state space, map and quantity to compare with its defined invariant-circle model.",
        "pages": ["logistic-proof-picture", "logistic-cycle", "logistic-vanishing"],
        "sources": ["S1"], "related": ["logistic-collapse-vanishing", "fractional-exponential-maps", "alternating-towers"],
    },
    {
        "slug": "alternating-towers",
        "title": "Alternating real towers",
        "shortTitle": "Alternating towers",
        "status": "exact", "statusLabel": "Proved convergence and classification", "kind": "proof",
        "summary": "For every real base c > 1, the alternating-sign system has one pair of phases. The explicit iteration converges from every upper starting phase at least 1, with a uniform contraction bound.",
        "scope": "The defined alternating-sign system has a sharp maximum upper phase and exactly two finite bases at every height strictly between 1 and that maximum.",
        "equation": r"u=c^{-v},\qquad v=c^u,\qquad c>1",
        "orientation": "The first argument establishes an invariant interval and a contraction. The second extracts the sharp envelope from v log v = t exp(−t) and classifies the two inverse branches.",
        "nextStep": "Compare the convergence and inverse classification with the literature. If a particular arithmetic constant is used as a target height, state the additional arithmetic question separately.",
        "pages": ["tower-convergence", "tower-envelope"],
        "sources": ["S2"], "related": ["logistic-quarter-turn", "proof-review"],
    },
    {
        "slug": "dyadic-remainder",
        "title": "A dyadic vanishing remainder",
        "shortTitle": "Dyadic remainder",
        "status": "exact", "statusLabel": "Proved pathwise bound", "kind": "proof",
        "summary": "The lacunary series f(x) = Σ x^(2^n), where 2^n means 2 raised to n, obeys f(x) = x + f(x²). Along the specified dyadic path toward 1, subtracting k and a convergent constant leaves an explicit tail.",
        "scope": "The proof concerns x_k = exp(−2^(−k)). Its additive constant belongs to that path; the arithmetic classification of f(exp(−1)) is a separate question.",
        "equation": r"0\le f(e^{-2^{-k}})-k-C\le2^{-k}",
        "orientation": "An index shift and elementary exponential bounds give the dyadic argument. A later companion proof establishes R_k/(ζ(k) − 1) → 1 as integer k → ∞; it is an asymptotic comparison of two separately defined sequences.",
        "nextStep": "Quantify the finite-k relative error beyond the proved leading-ratio limit, or define a structural map and the property it preserves. A shared dynamical system or conjugacy remains open.",
        "pages": ["mahler-remainder"], "sources": [],
        "readingLinks": [{"text": "Established dyadic/zeta ratio · companion proof, page 6", "url": f"{SITE}/atlas/proofs/logistic-collapse-vanishing.pdf#page=6"}],
        "related": ["logistic-collapse-vanishing", "schanuel-zeta-family", "fractional-exponential-maps"],
    },
    {
        "slug": "prime-polynomial-counts",
        "title": "Prime polynomials count exactly",
        "shortTitle": "Prime-polynomial counts",
        "status": "exact", "statusLabel": "Exact finite counting identities", "kind": "proof",
        "summary": "Finite polynomial products encode ordered Goldbach representations and twin-prime translations. A diagonal correction converts ordered Goldbach counts into unordered counts.",
        "scope": "All products and coefficient extractions are finite and formal. The diagonal indicator is one exactly when half the target integer is prime.",
        "equation": r"G(N)=[z^N]P_N(z)^2,\qquad U(N)=\frac{G(N)+D(N)}2",
        "orientation": "Keep the counting convention explicit: unequal pairs appear twice in the ordered count, while a repeated-prime diagonal appears once. Laurent exponents encode the translation q − p = 2.",
        "nextStep": "Specify a coefficient bound or asymptotic estimate to investigate and identify the additional inequality it would require.",
        "pages": ["prime-polynomials"], "sources": ["S2"],
        "related": ["palindrome-counting", "proof-review"],
    },
    {
        "slug": "schanuel-zeta-family",
        "title": "The Z(p) family under Schanuel",
        "shortTitle": "Conditional Z(p) family",
        "status": "conditional", "statusLabel": "Conditional on complex Schanuel", "kind": "conditional-proof",
        "summary": "Euler’s even-zeta formula gives exact rational coefficients cₚ for every odd integer p ≥ 3. Assuming complex Schanuel, π and any finite list of the corresponding Z(p) values are algebraically independent.",
        "scope": "The zeta reduction is unconditional. The independence conclusion in this argument assumes the full complex Schanuel conjecture. Distinct odd exponents and nonzero rational coefficients are part of the hypotheses.",
        "equation": r"Z(p)=e^{c_p\pi^p}+1,\qquad p=3,5,7,\ldots",
        "orientation": "First identify the exact Bernoulli coefficient. Then apply the conjecture to iπ and the selected real π-power exponents; field containment gives the required transcendence-degree bound.",
        "nextStep": "Compare this specific conditional consequence with the literature. State any proposed unconditional result as a separate claim with its own assumptions.",
        "pages": ["zeta-family", "schanuel-proof"], "sources": ["S3", "S4"],
        "related": ["dyadic-remainder", "proof-review"],
    },
    {
        "slug": "fractional-exponential-maps",
        "title": "Two constructions of six",
        "shortTitle": "Fractional exponential maps",
        "status": "exact", "statusLabel": "Exact formulas; limiting means open", "kind": "proof-and-open-question",
        "summary": "The additive and multiplicative constructions of six define different fractional exponential maps. Their smooth-branch derivatives give exact finite-time Lyapunov averages in terms of separate orbit means.",
        "scope": "Both maps are uniformly expanding on their smooth branches. The limiting comparison needs the relevant orbit means to exist; no common invariant measure, ergodicity or logistic conjugacy is assumed.",
        "equation": r"T_{\mathrm{add}}(y)=\operatorname{frac}(2\,3^y),\qquad T_{\mathrm{mul}}(y)=\operatorname{frac}(6^y)",
        "orientation": "State how cuts and endpoints are handled before differentiating an orbit. The finite-time formulas are exact; an infinite-time exponent is a further limit statement.",
        "nextStep": "Define the orbit or invariant measure of interest and establish the limiting means before evaluating a zero-difference target. Keep the two maps’ means separate.",
        "pages": ["six-maps", "lyapunov-comparison"], "sources": [],
        "related": ["logistic-quarter-turn", "dyadic-remainder"],
    },
    {
        "slug": "palindrome-counting",
        "title": "Palindrome counting",
        "shortTitle": "Palindrome counting",
        "status": "exact", "statusLabel": "Exact count under a sampling model", "kind": "proof",
        "summary": "For independent uniform q-symbol strings of length n, ordinary palindromes have probability q^(−floor(n/2)). The example q = 4, n = 40 has probability exactly 2^(−40).",
        "scope": "The probability is tied to the stated sampling model. Forty is the sequence length in the example, not a proved limit on the size of a sustainable biological alphabet.",
        "equation": r"\mathbb{P}(\mathrm{ordinary\ palindrome})=q^{-\lfloor n/2\rfloor}",
        "orientation": "Count free positions in a reversed string, then distinguish ordinary reversal from reverse complementation. An expected number of independent complete-string draws is not a guarantee for overlapping windows.",
        "nextStep": "Before making a biophysical claim, specify a physical alphabet, pairing rule and measurable stability or decay criterion. The finite combinatorics supplies no biochemical feasibility result.",
        "pages": ["palindromes"], "sources": [],
        "related": ["prime-polynomial-counts", "dimensions-and-fragments"],
    },
    {
        "slug": "dimensions-and-fragments",
        "title": "Dimensions and recovered fragments",
        "shortTitle": "Dimensions and fragments",
        "status": "exact", "statusLabel": "Exact foundations; fragments unresolved", "kind": "foundations",
        "summary": "Products, tensor products and changes of scalar field give different dimensions. Equal continuum cardinalities do not identify those dimensions, fractal dimensions or physical degrees of freedom.",
        "scope": "The cubic and Collatz expressions are retained with their standard meanings. T₀–T₃ have no supplied definitions, so they cannot yet support a transition rule or a claimed bridge to the logistic model.",
        "equation": r"\dim_{\mathbb{R}}(\mathbb{R}^3\times\mathbb{R}^2)=5,\qquad \dim_{\mathbb{R}}(\mathbb{R}^3\otimes_{\mathbb{R}}\mathbb{R}^2)=6",
        "orientation": "This is a foundations note and a recovery ledger. Its exact statements explain the operations; its unassigned labels record questions to define rather than results to claim.",
        "nextStep": "Recover explicit definitions of T₀–T₃ and the intended connecting map. State which structure is preserved before comparing dimensions, dynamics or geometric collapse.",
        "pages": ["dimensions-fragments"], "sources": [],
        "related": ["logistic-quarter-turn", "palindrome-counting"],
    },
    {
        "slug": "proof-review",
        "title": "Review of the written proofs",
        "shortTitle": "Written-proof review",
        "status": "review", "statusLabel": "Scope and correctness review", "kind": "review",
        "summary": "The logistic, alternating-tower and finite prime-counting arguments establish the stated identities, bounds and classifications. This note identifies their key proof steps and source versions.",
        "scope": "The conclusions retain their specified domains. The later cubic-attraction result, asymptotic comparison and defined geometric model are recorded as subsequent additions.",
        "orientation": "Follow each statement to its standalone proof. The companion proof board records the full collection, the reported transcription issues and the later additions separately.",
        "nextStep": "Choose one precise extension: a limiting orbit mean, a stronger remainder estimate, a literature comparison for the tower classification, or a fully specified geometric connection.",
        "pages": ["review-finding"], "sources": ["S1", "S2"],
        "readingLinks": [{"text": "Proof board · full statements and direct proof links", "url": f"{SITE}/atlas/proof-review-board.pdf"}],
        "related": ["alternating-towers", "logistic-quarter-turn", "prime-polynomial-counts"],
    },
]


def p(text: str, small: bool = False) -> dict:
    return {"type": "p", "text": text, **({"small": True} if small else {})}


def link(text: str, url: str) -> dict:
    return {"type": "link", "text": text, "url": url}


def opening(spec: dict, number: int) -> dict:
    badge = "conditional" if spec["status"] == "conditional" else "exact"
    blocks = [p(spec["summary"])]
    if spec.get("equation"):
        blocks.append({"type": "eq", "latex": spec["equation"]})
    scope = p(spec["scope"]) if spec["kind"] == "review" else {
        "type": "callout", "label": spec["statusLabel"], "status": badge, "text": spec["scope"]}
    blocks += [
        scope,
        p(spec["orientation"]),
        {"type": "h", "text": "One concrete next step"},
        p(spec["nextStep"]),
        {"type": "h", "text": "Sources and related reading"},
    ]
    for key in spec["sources"]:
        source = SOURCES[key]
        blocks += [p(source["text"], small=True), link(source["label"], source["url"])]
    if not spec["sources"]:
        blocks.append(p("The following pages give the complete derivation from the stated definitions. The historical collection records the original fragments and argument.", small=True))
    blocks.append(link("Historical collection source · original edition", f"{REPO}/blob/{HISTORICAL_COLLECTION_COMMIT}/atlas/logistic-vanishing-terms.md#{spec['pages'][0]}"))
    for reading in spec.get("readingLinks", []):
        blocks.append(link(reading["text"], reading["url"]))
    if spec["kind"] == "review":
        by_slug = {item["slug"]: item for item in NOTE_SPECS}
        for slug in spec["related"]:
            blocks.append(link(by_slug[slug]["shortTitle"] + " · complete note", f"{SITE}/atlas/proofs/{slug}.pdf"))
    else:
        blocks.append(link("Return to the Treasure Chest", f"{SITE}/#buried-logistic-vanishing"))
    return {"id": spec["slug"] + "-orientation", "title": spec["title"],
            "kicker": f"NOTE {number:02d} · {spec['statusLabel'].upper()}", "blocks": blocks}


def make_note(collection: dict, spec: dict, number: int) -> dict:
    by_id = {page["id"]: page for page in collection["pages"]}
    pages = [opening(spec, number)]
    for index, key in enumerate(spec["pages"], 1):
        page = copy.deepcopy(by_id[key])
        page["kicker"] = f"{index:02d} · " + re.sub(r"^\d+\s*·\s*", "", page.get("kicker", "THE ARGUMENT"))
        if key == "review-finding":
            page["blocks"][0]["text"] = (
                f"The original review inspected the site at commit <b>{REVIEW_COMMIT}</b>. "
                "Its substantive findings concern alternating-tower convergence, the sharp envelope and two-base classification, "
                "the logistic quarter-turn, and prime-polynomial counting. The complete arguments are now available in the "
                "separate notes linked on this document’s opening page; their original source references remain pinned."
            )
        pages.append(page)
    return {
        "title": spec["title"], "subtitle": "A focused reading note from the Pirate Chest",
        "date": "23 November 2026", "author": "Zolton / EncapsulatorP · with ChatGPT",
        "historical_source_commit": HISTORICAL_COLLECTION_COMMIT, "reviewed_proof_commit": REVIEW_COMMIT,
        "status": spec["status"], "statusLabel": spec["statusLabel"], "pages": pages,
    }


@contextmanager
def note_footer(title: str):
    """Reuse the renderer while supplying topic-specific page furniture."""
    original = renderer.page_decoration

    def decoration(canvas, doc):
        # Substitute the string before drawing, preserving the common design
        # without leaving a hidden second footer in PDF text extraction.
        draw_string = canvas.drawString

        def topic_string(x, y, text, *args, **kwargs):
            if text == "Logistic vanishing terms • EncapsulatorP":
                text = title + " · EncapsulatorP"
            return draw_string(x, y, text, *args, **kwargs)

        canvas.drawString = topic_string
        try:
            original(canvas, doc)
        finally:
            canvas.drawString = draw_string

    renderer.page_decoration = decoration
    try:
        yield
    finally:
        renderer.page_decoration = original


def build_recovered_note(output_dir: Path) -> dict:
    """Render the separately authored recovery note and preserve its Markdown."""
    slug = "logistic-collapse-vanishing"
    source_json = BASE / f"{slug}.json"
    source_markdown = BASE / f"{slug}.md"
    note = json.loads(source_json.read_text(encoding="utf-8"))
    for page in note["pages"]:
        for block in page["blocks"]:
            if block["type"] == "image" and not block["path"].startswith(("/", "http://", "https://")):
                block["path"] = "../" + block["path"]
    stem = output_dir / slug
    json_path, pdf_path, markdown_path = (stem.with_suffix(suffix) for suffix in (".json", ".pdf", ".md"))
    json_path.write_text(json.dumps(note, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    markdown_path.write_text(source_markdown.read_text(encoding="utf-8"), encoding="utf-8")
    with note_footer("Logistic collapse and vanishing"):
        renderer.build_pdf(note, pdf_path, asset_base=output_dir.resolve())
    count = len(PdfReader(pdf_path).pages)
    if count != len(note["pages"]):
        raise ValueError(f"{slug}: {count} rendered pages for {len(note['pages'])} planned pages; review overflow")
    print(f"{slug}: {count} pages, {pdf_path.stat().st_size:,} bytes")
    return {
        "slug": slug, "title": "Logistic collapse and vanishing terms",
        "status": "exact", "statusLabel": "Proved local attraction; physical interpretation open",
        "kind": "proof-and-open-question",
        "summary": "The restoring logistic cubic proves local attraction with an inverse-square-root error rate. An explicitly defined product model transfers that result to transverse attraction toward an invariant circle, and a separate tail estimate proves the dyadic–zeta ratio limit.",
        "nextStep": "Quantify a finite-index ratio error or state a proposed conjugacy with its domain and regularity. For a physical interpretation, specify the object, evolution and measured quantity.",
        "related": ["logistic-quarter-turn", "dimensions-and-fragments", "dyadic-remainder"],
        "pdf": f"atlas/proofs/{slug}.pdf", "markdown": f"atlas/proofs/{slug}.md",
        "source": f"atlas/proofs/{slug}.json", "pageCount": count,
        "sourcePages": [page["id"] for page in note["pages"]],
        "canonicalMarkdown": f"atlas/{slug}.md", "canonicalSource": f"atlas/{slug}.json",
        "sourceSha256": hashlib.sha256(source_json.read_bytes()).hexdigest(),
        "reviewedProofCommit": None,
        "provenance": "Derivations added on 23 November 2026 after the earlier collected-proof review; historical sources are cited separately from the current source hash.",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=BASE / "logistic-vanishing-terms.json")
    parser.add_argument("--output-dir", type=Path, default=BASE / "proofs")
    args = parser.parse_args()
    source_bytes = args.source.read_bytes()
    collection = json.loads(source_bytes)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    manifest = {
        "title": "Pirate Chest proof library", "edition": "2026-11-23",
        "collectionSource": "atlas/logistic-vanishing-terms.json",
        "collectionSourceSha256": hashlib.sha256(source_bytes).hexdigest(),
        "historicalCollectionSourceCommit": HISTORICAL_COLLECTION_COMMIT,
        "reviewedProofCommit": REVIEW_COMMIT,
        "completeCollection": "atlas/logistic-vanishing-terms.pdf", "notes": [],
    }
    for number, spec in enumerate(NOTE_SPECS, 1):
        note = make_note(collection, spec, number)
        # Each generated JSON/Markdown file is independently usable from its
        # own directory, including the original logistic illustration.
        for page in note["pages"]:
            for block in page["blocks"]:
                if block["type"] == "image":
                    block["path"] = "../" + block["path"]
        stem = args.output_dir / spec["slug"]
        json_path, pdf_path, markdown_path = (stem.with_suffix(suffix) for suffix in (".json", ".pdf", ".md"))
        json_path.write_text(json.dumps(note, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        with note_footer(spec["shortTitle"]):
            renderer.build_pdf(note, pdf_path, asset_base=args.output_dir.resolve())
        renderer.build_markdown(note, markdown_path)
        reader = PdfReader(pdf_path)
        if len(reader.pages) != len(note["pages"]):
            raise ValueError(f"{spec['slug']}: page overflow; review the rendered note before publication")
        entry = {key: spec[key] for key in ("slug", "title", "status", "statusLabel", "kind", "summary", "nextStep", "related")}
        entry.update({"pdf": f"atlas/proofs/{spec['slug']}.pdf", "markdown": f"atlas/proofs/{spec['slug']}.md",
                      "source": f"atlas/proofs/{spec['slug']}.json", "pageCount": len(reader.pages),
                      "sourcePages": spec["pages"]})
        manifest["notes"].append(entry)
        print(f"{spec['slug']}: {len(reader.pages)} pages, {pdf_path.stat().st_size:,} bytes")
    manifest["notes"].append(build_recovered_note(args.output_dir))
    (BASE / "proof-library.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
