#!/usr/bin/env python3
"""Build the A/B/C review board and the stable treasure-guide aliases.

Run from the repository root: python3 atlas/build_treasure_hunt_guide.py
Dependencies: atlas/proof-library-requirements.txt.

The public proof-board-data.json supplies the reviewed claims and audit record.
This document provides hypotheses, conclusions and routes to the complete proof
notes. The shared renderer supplies vector math, semantic LaTeX copy text, and
orange-yellow-green accents. The board and legacy guide PDFs are byte-identical.
"""

from __future__ import annotations

import json
import re
import shutil
import tempfile
from contextlib import contextmanager
from pathlib import Path
from xml.sax.saxutils import escape

from pypdf import PdfReader

import build_logistic_vanishing_pdf as renderer


BASE = Path(__file__).resolve().parent
SITE = "https://encapsulatorp.github.io"
PDF_DIR = SITE + "/atlas/proofs/"
REPO = "https://github.com/EncapsulatorP/EncapsulatorP.github.io"
AUDIT_NOTES = {
    "critical-point": "logistic-quarter-turn",
    "finite-time-index": "fractional-exponential-maps",
    "palindrome-parity": "palindrome-counting",
    "dyadic-exponent": "dyadic-remainder",
    "pi-proposition": "schanuel-zeta-family",
    "complex-input": "schanuel-zeta-family",
    "bernoulli-coefficient": "schanuel-zeta-family",
    "continuum-symbol": "dimensions-and-fragments",
    "prime-section": "prime-polynomial-counts",
}


def paragraph(text: str, *, small: bool = False) -> dict:
    return {"type": "p", "text": text, **({"small": True} if small else {})}


def heading(text: str) -> dict:
    return {"type": "h", "text": text}


def proof_link(slug: str, text: str = "Read the complete proof note") -> dict:
    return {"type": "link", "text": text, "url": PDF_DIR + slug + ".pdf"}


def inline_proof_link(slug: str) -> str:
    return f'<link href="{PDF_DIR}{slug}.pdf" color="{renderer.LINK_HEX}"><u>Full note</u></link>'


def normalize_math(latex: str) -> str:
    # MathText requires explicit groups for these TeX single-token commands.
    latex = re.sub(r"\\mathbb\s+([A-Za-z])", r"\\mathbb{\1}", latex)
    latex = re.sub(r"\\sqrt\s*([0-9])", r"\\sqrt{\1}", latex)
    return latex


def equations(latex: str) -> list[dict]:
    """Keep complete formulas together; split only at written quad separators."""
    latex = normalize_math(latex)
    width = float(renderer.parse_math(latex).width)
    if width <= 675:
        return [{"type": "eq", "latex": latex}]
    pieces = re.split(r",?\\q(?:quad|uad)\s*", latex)
    if len(pieces) == 1:
        raise ValueError(f"Split an overlong board equation explicitly: {latex}")
    blocks = []
    for piece in pieces:
        if piece.strip():
            blocks.extend(equations(piece.strip()))
    return blocks


def page(key: str, title: str, kicker: str, blocks: list[dict]) -> dict:
    return {"id": key, "title": title, "kicker": kicker, "blocks": blocks}


def audit_blocks(rows: list[dict], start: int) -> list[dict]:
    blocks = []
    for number, row in enumerate(rows, start):
        blocks.append(heading(f"A{number}. {row['title']}"))
        blocks.append(paragraph(
            f"<b>{escape(row['status_label'])}.</b> Earlier edition p. {row['old_page']}; "
            f"illustrated edition p. {row['illustrated_page']}.", small=True))
        blocks.extend(equations(row["formula"]))
        blocks.append(paragraph(escape(row["finding"]), small=True))
        blocks.append(proof_link(AUDIT_NOTES[row["id"]], "Check the formula in its focused note"))
    return blocks


# Presentation summaries preserve the hypotheses and conclusions from the public
# board. Full arguments and primary references remain in the linked proof notes.
CORE_PRESENTATION = {
    "logistic-cycle": {
        "domain": "Real r > 3; also r ≤ 4 for the conventional invariant interval [0,1].",
        "equations": [r"f_r^{\circ2}(x)-x=-x(rx-r+1)[r^2x^2-r(r+1)x+r+1].",
                      r"x_\pm=\frac{r+1\pm\sqrt{(r-3)(r+1)}}{2r}.",
                      r"d_\pm=-1\mp\sqrt{(r-3)(r+1)},\qquad d_+d_-=4+2r-r^2."],
        "qualification": "Polynomial algebra also proves that fᵣ exchanges these two distinct nontrivial points.",
    },
    "logistic-quarter-turn": {
        "domain": "At r* = 1 + √6, define C = [[0,d₋],[d₊,0]], a = √2 − 1 and S = diag(√a,1/√a).",
        "latex": r"C_*^2=-I,\qquad C_*^4=I,\qquad \det C_*=1.",
        "matrix": {"type": "matrix", "label": r"S^{-1}C_*S=", "cells": [["0", "1"], ["-1", "0"]], "tail": "."},
        "qualification": "This explicitly defined linear matrix has rank 2. The conjugacy is a coordinate rescaling; C is not Euclidean orthogonal in the original coordinates.",
    },
    "logistic-return-derivative": {
        "domain": "At either cycle point p± for r* = 1 + √6.",
        "qualification": "These identities concern the stated cycle points. At the separate critical point 1/2, fᵣ′(1/2) = 0 while fᵣ(1/2) = r/4.",
    },
    "cycle-lyapunov": {
        "domain": "The exact r* two-cycle; exponent per original logistic update.",
        "qualification": "A zero exponent leaves nonlinear stability undecided. The later cubic attraction argument is presented separately on page 9.",
    },
    "fractional-exponential-averages": {
        "domain": "Tadd(y) = frac(2·3ʸ), Tmul(y) = frac(6ʸ), y ∈ [0,1), N ≥ 1; use the stated branch derivatives.",
        "qualification": "The means μadd,N and μmul,N belong to separate orbit segments. Ordinary derivatives fail at jumps; the note specifies endpoint conventions. Infinite-time formulas require convergent means.",
    },
    "dimension-cardinality": {
        "domain": "Use the indicated real or complex scalar field; cardinality concerns the underlying set.",
        "latex": r"\dim_{\mathbb R}(\mathbb R^3\times\mathbb R^2)=5,\quad\dim_{\mathbb R}(\mathbb R^3\otimes_{\mathbb R}\mathbb R^2)=6.\qquad\dim_{\mathbb R}\mathbb C^3=6,\quad\dim_{\mathbb C}\mathbb C^3=3,\quad|\mathbb R^5|=|\mathbb R^6|=|\mathbb C^3|=2^{\aleph_0}.",
        "qualification": "Products, tensor products, changes of scalar field and cardinality answer different mathematical questions.",
    },
    "cubic-and-odd-step": {
        "domain": "Complex z; odd positive integer n for the iteration conventions.",
        "qualification": "3n + 1 and (3n + 1)/2 are distinct odd-step conventions. The latter divides once; the full odd-to-odd step removes all factors of two. T₀–T₃ still need definitions and a connecting map.",
    },
    "zeta-reduction": {
        "domain": "Odd integers p ≥ 3; primality is not required.",
        "latex": r"Z(p)=1+\exp\!\left(\frac{\pi\zeta(p-1)}p\right)=1+e^{c_p\pi^p}.\quad c_p=\frac{2^{p-2}|B_{p-1}|}{p!}\in\mathbb Q_{>0}.",
        "qualification": "Euler’s even-zeta evaluation supplies the coefficient. The signed Bernoulli expression in A7 gives the same lowercase c. At p = 2, ζ(1) has a pole.",
    },
    "schanuel-independence": {
        "domain": "Assume full complex Schanuel; p₁,…,pₖ are pairwise distinct odd integers ≥ 3.",
        "claim": "Then π, Z(p₁), …, Z(pₖ) are algebraically independent over Q. Apply the assumption to iπ and the real inputs cₚⱼπᵖⱼ.",
        "qualification": "E is generated over Q by these inputs and their exponentials. The imaginary part isolates iπ in a rational linear relation. Transcendence of π handles the distinct real powers; adjoining i is algebraic.",
    },
    "dyadic-remainder": {
        "domain": "f(x) = Σₙ≥₀ x^(2^n), |x| < 1; xₖ = exp(−2^(−k)), integer k ≥ 0.",
        "claim": "The functional equation f(x) = x + f(x²) gives f(xₖ) = k + C + Rₖ.",
        "equations": [r"f(x)=\sum_{n=0}^{\infty}x^{2^n},\qquad f(x)=x+f(x^2),\qquad x_k=e^{-2^{-k}}.",
                      r"C=f(e^{-1})+\sum_{j=1}^{\infty}(e^{-2^{-j}}-1),\quad R_k=\sum_{j=k+1}^{\infty}(1-e^{-2^{-j}}),\quad2^{-k}-\frac{4^{-k}}6\le R_k\le2^{-k}."],
        "qualification": "Absolute convergence, an index shift and t − t²/2 ≤ 1 − exp(−t) ≤ t prove the stated bound. C belongs to the specified dyadic path.",
    },
    "palindrome-counting": {
        "domain": "Independent uniform symbols; integer alphabet size q ≥ 2 and length n ≥ 1.",
        "qualification": "This counts ordinary reversal for odd and even n. With a fixed-point-free complement pairing, reverse-complement palindromes instead require even n and have probability q^(−n/2).",
    },
    "tower-convergence": {
        "domain": "Real c > 1, L = log c, v₀ ≥ 1; u = c^(−v), v = cᵘ.",
        "claim": "F_L(v) = exp(L exp(−Lv)) maps [1,∞) into I = [1, exp(1/e)]. Its uniform contraction proves a unique solution and convergence from every stated initial value.",
        "equations": [r"F_L(v)=e^{Le^{-Lv}},\qquad I=[1,e^{1/e}].",
                      r"q=4e^{1/e-2}<1,\qquad |F'_L(v)|\le q\quad(v\ge1).",
                      r"|x-v_*|\le\frac{|F_L(x)-x|}{1-q}\qquad(x\in I)."],
        "qualification": "Banach’s theorem applies to this defined alternating-sign iteration. The residual-to-error estimate uses exact arithmetic.",
    },
    "tower-envelope": {
        "domain": "The same alternating system, with c > 1 and t = v log c.",
        "claim": "The maximum upper phase is attained at cpeak = exp(1/vmax). Heights 1 < v < vmax have exactly two finite bases; vmax has one; v > vmax and v = 1 have none.",
        "qualification": "Strict increase of v log v and the two branches of t exp(−t) give the classification. cpeak is the maximizing base.",
    },
    "prime-polynomial-counts": {
        "domain": "P_X(z) = Σprime p≤X zᵖ, integer X ≥ 2; integer N ≥ 4; finite coefficient extraction.",
        "qualification": "G counts ordered pairs; D(N) is 1 exactly when N/2 is an integer prime; U counts unordered pairs. T counts prime pairs p,p+2 with p ≤ X. The full section is present in both inspected editions.",
    },
}


def statement_blocks(rows: list[dict], start: int) -> list[dict]:
    blocks = []
    for number, row in enumerate(rows, start):
        view = CORE_PRESENTATION[row["id"]]
        status = "CONDITIONAL" if row["status"] == "conditional" else "EXACT"
        blocks.append(heading(f"B{number}. {row['title']}"))
        blocks.append(paragraph(f"<b>{status} · Hypotheses.</b> {escape(view['domain'])}", small=True))
        if view.get("claim"):
            blocks.append(paragraph(escape(view["claim"]), small=True))
        for latex in view.get("equations", [view.get("latex", row["latex"])]):
            blocks.extend(equations(latex))
        if view.get("matrix"):
            blocks.append(view["matrix"])
        blocks.append(paragraph(escape(view["qualification"]), small=True))
        blocks.append(proof_link(row["proof_slug"]))
    return blocks


def final_board(groups: list[dict]) -> list[dict]:
    # Keep the exact boundaries visible without duplicating every hypothesis
    # from the numbered B statements on the preceding pages.
    summaries = {
        "logistic-algebra": "Factorization, cycle exchange, multiplier, matrix conjugacy and return-derivative identities hold for their specified objects and points.",
        "cycle-exponent": "The exact r* two-cycle has exponent zero. The later cubic proof supplies its nonlinear attraction argument.",
        "six-maps": "Finite branch averages use exactly N terms. Infinite-time comparisons require limiting means; a common measure or conjugacy is still unproved.",
        "dimensions": "Dimension, cardinality and cubic identities are valid. A proposed connecting map and the labels T₀–T₃ still need definitions.",
        "zeta": "For odd p ≥ 3, the positive rational Bernoulli coefficient and exponential expression are exact; lowercase c is consistent.",
        "schanuel": "Algebraic independence follows under full complex Schanuel for distinct odd exponents. The assumption remains part of the proposition.",
        "dyadic": "For the defined series and dyadic path, the functional equation, exact tail and geometric bounds hold. The exponent is 2^n.",
        "palindromes": "The uniform-string ceiling/floor count covers odd and even lengths. Ordinary reversal and reverse complementation are distinct models.",
        "towers": "The defined alternating iteration has global convergence, a sharp height envelope and the stated complete count of bases.",
        "prime-counts": "Finite polynomial identities count ordered, unordered and translated prime pairs. The full section is present in both inspected editions.",
    }
    rows = []
    for group in groups:
        badge = "CONDITIONAL" if group["status"] == "conditional" else "VALID"
        left = f"<b>{escape(group['title'])}</b><br/>{inline_proof_link(group['proof_slug'])}"
        right = f"<b>{badge}.</b> {escape(summaries[group['id']])}"
        rows.append([left, right])
    return [
        paragraph("This board collects the surviving arguments. The numbered B entries state their hypotheses; the linked notes contain complete proofs and references."),
        {"type": "table", "headers": ["Reviewed argument", "Verdict and boundary"],
         "widths": [.29, .71], "padding": 7, "rows": rows},
    ]


def supplement_blocks(row: dict, number: int) -> list[dict]:
    title = re.sub(r"^Later addition:\s*", "", row["title"], flags=re.I)
    domain, statement = row["domain"], row["statement"]
    if row["id"] == "asymptotic-ratio":
        statement = "The dyadic remainder and the zeta tail have the same leading decay scale. Their ratio tends to one."
    if row["id"] == "defined-geometric-model":
        domain = "Use the displayed cylinder with its product metric and the map Φ below; δ comes from the local attraction proof."
    blocks = [heading(f"S{number}. {title[0].upper() + title[1:]}"),
              paragraph("<b>Hypotheses.</b> " + escape(domain), small=True),
              paragraph(escape(statement))]
    if row["id"] == "asymptotic-ratio":
        blocks.extend(equations(r"R_k\sim2^{-k},\qquad\zeta(k)-1\sim2^{-k},\qquad\frac{R_k}{\zeta(k)-1}\longrightarrow1."))
    elif row.get("latex"):
        blocks.extend(equations(row["latex"]))
    if row["id"] == "defined-geometric-model":
        blocks.extend(equations(r"X=S^1\times(-\delta,\delta),\qquad\Phi(\theta,h)=(\theta+\omega\ \mathrm{mod}\ 2\pi,g(h))."))
        blocks.extend(equations(r"\operatorname{dist}(\Phi^n(\theta,h),S^1\times\{0\})=|g^{\circ n}(h)|\longrightarrow0."))
    blocks.append(paragraph(escape(row["qualification"]), small=True))
    blocks.append(proof_link(row["proof_slug"], "Read the later derivation and its proof"))
    return blocks


def make_board(data: dict) -> dict:
    audit, statements, groups, supplements = (data[k] for k in ("audit", "statements", "groups", "supplements"))
    if (len(audit), len(statements), len(groups), len(supplements)) != (9, 14, 10, 4):
        raise ValueError("The page plan expects 9 audit entries, 14 core statements, 10 groups and 4 supplements")
    audit_scope = data["audit_scope"]
    cover = [
        {"type": "image", "path": "assets/logistic-proof.png", "max_height": 445,
         "alt": "Three exact views of the logistic two-cycle at r = 1 + square root of 6: exchanged orbit points, a rescaled paired quarter-turn matrix, and zero derivative of the fourth-return displacement.",
         "link_url": PDF_DIR + "logistic-quarter-turn.pdf"},
        {"type": "table", "headers": ["A · Audit", "B · Statements", "C · Final board", "S · Later work"],
         "widths": [1, 1, 1, 1], "padding": 6,
         "rows": [["Notation and editions<br/><b>Pages 2–3</b>",
                   "14 claims + hypotheses<br/><b>Pages 4–7</b>",
                   "Valid arguments + limits<br/><b>Page 8</b>",
                   "Cubic, rate and model<br/><b>Pages 9–10</b>"]]},
        paragraph("<b>Edition record.</b> The audit compares the 16-page electric-orange and 17-page illustrated PDFs. The exact earlier review excerpt is unknown. Later results are separated on pages 9–10. Click the figure for the complete logistic proof.", small=True),
    ]
    pages = [page("orientation", data["title"], "A / B / C · Review and navigation", cover)]
    pages.append(page("audit-notation", "A. Notation and edition audit", "01–04 · Read the symbol in context", [
        paragraph("<b>Audit scope.</b> " + escape(audit_scope), small=True),
        *audit_blocks(audit[:4], 1),
    ]))
    pages.append(page("audit-source", "A. Notation and source coverage", "05–09 · Symbols, coefficients and the missing-section report", [
        *audit_blocks(audit[4:], 5),
    ]))
    ranges = [
        (0, 4, "B. Logistic identities", "01–04 · Exact local statements"),
        (4, 8, "B. Maps, dimensions and coefficients", "05–08 · Domains and operations made explicit"),
        (8, 11, "B. Arithmetic, limits and counting", "09–11 · One conditional argument; two exact counts and bounds"),
        (11, 14, "B. Convergence and finite encodings", "12–14 · Complete domains and conclusions"),
    ]
    for a, b, title, kicker in ranges:
        pages.append(page(f"statements-{a+1}-{b}", title, kicker, statement_blocks(statements[a:b], a + 1)))
    pages.append(page("final-board", "C. The final board", "Valid proofs and surviving arguments · Complete notes linked", final_board(groups)))
    pages.append(page("later-cubic", "Later addition: what survives locally", "S1–S2 · Cubic term, attraction and rate", [
        paragraph("These later derivations extend the logistic thread. They are recorded separately from the earlier collection and its notation audit."),
        *supplement_blocks(supplements[0], 1),
        *supplement_blocks(supplements[1], 2),
        heading("The logical step that supplies attraction"),
        *equations(r"g(h)=h-K_\pm h^3+O(h^4),\qquad\frac{g(h)}h=1-K_\pm h^2+O(h^3)."),
        paragraph("Because K± is positive, sufficiently small nonzero h retains its sign and decreases in absolute value. The cubic coefficient gives the attraction and the slow inverse-square-root rate. The paired matrix remains invertible; this is a local statement about the scalar return displacement."),
        proof_link("logistic-quarter-turn", "Return to the earlier derivative and matrix identities"),
    ]))
    pages.append(page("later-connections", "Later connections and next steps", "S3–S4 · A proved comparison and a defined geometric model", [
        *supplement_blocks(supplements[2], 3),
        *supplement_blocks(supplements[3], 4),
        heading("Next logical steps"),
        {"type": "table", "headers": ["Target", "A concrete completion criterion"], "widths": [.25, .75], "padding": 6,
         "rows": [["<b>Finite-scale comparison</b>", "Bound the relative error in the dyadic/zeta ratio at finite k, with explicit constants and a stated range."],
                  ["<b>Geometric connection</b>", "Define a map from the cylinder model to the intended geometric object, then prove one preserved property or find a counterexample."],
                  ["<b>Physical interpretation</b>", "Specify the physical variables and measurable quantity that a brane-collapse interpretation would represent."]]},
        {"type": "link", "text": "Continue in the online board and repository connection map", "url": SITE + "/treasure-hunt/"},
    ]))
    return {
        "title": data["title"], "subtitle": "",
        "author": "EncapsulatorP", "date": data["date"],
        "source_commit": data["audited_source_commit"],
        "source_data": "proof-board-data.json", "audit_versions": data["versions"],
        "review_basis": data["review_basis"], "audit_summary": data["audit_summary"],
        "document_role": "Review and navigation; full proofs are linked separately.",
        "pages": pages,
    }


@contextmanager
def board_footer():
    original = renderer.page_decoration

    def decoration(canvas, doc):
        draw_string = canvas.drawString

        def board_string(x, y, text, *args, **kwargs):
            if text == "Logistic vanishing terms • EncapsulatorP":
                text = "Valid proofs & surviving arguments • EncapsulatorP"
            return draw_string(x, y, text, *args, **kwargs)

        canvas.drawString = board_string
        try:
            original(canvas, doc)
            if canvas.getPageNumber() == 1:
                width, height = renderer.A4
                renderer.accent_gradient(canvas, 0, height - 154, width, 91)
        finally:
            canvas.drawString = draw_string

    renderer.page_decoration = decoration
    try:
        yield
    finally:
        renderer.page_decoration = original


def expected_math(board: dict) -> list[str]:
    sources = []
    for p in board["pages"]:
        for block in p["blocks"]:
            if block["type"] == "eq":
                latex = block["latex"]
            elif block["type"] == "matrix":
                latex = block.get("label", "") + r"\begin{pmatrix}" + r" \\ ".join(" & ".join(row) for row in block["cells"]) + r"\end{pmatrix}" + block.get("tail", "")
            else:
                continue
            sources.append(r"\(" + " ".join(latex.strip().strip("$").split()) + r"\)")
    return sources


def main() -> None:
    data = json.loads((BASE / "proof-board-data.json").read_text(encoding="utf-8"))
    board = make_board(data)
    with tempfile.TemporaryDirectory(prefix="proof-review-board-") as temp:
        work = Path(temp)
        pdf, markdown = work / "board.pdf", work / "board.md"
        with board_footer():
            renderer.build_pdf(board, pdf, asset_base=BASE)
        reader = PdfReader(pdf)
        if len(reader.pages) != len(board["pages"]):
            raise ValueError(f"Review board overflow: {len(reader.pages)} rendered pages for {len(board['pages'])} planned pages")
        text = "\n".join(p.extract_text() for p in reader.pages)
        missing = [source for source in expected_math(board) if source not in text]
        if missing:
            raise ValueError(f"Math extraction lost {len(missing)} complete formula(s): {missing[0]}")
        renderer.build_markdown(board, markdown)
        (BASE / "proof-review-board.json").write_text(json.dumps(board, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for stem in ("proof-review-board", "treasure-hunt-guide"):
            shutil.copyfile(pdf, BASE / f"{stem}.pdf")
            shutil.copyfile(markdown, BASE / f"{stem}.md")
    print(f"Review board: {len(board['pages'])} pages; {len(expected_math(board))} complete semantic formulas.")
    print(BASE / "proof-review-board.pdf")
    print(BASE / "treasure-hunt-guide.pdf")


if __name__ == "__main__":
    main()
