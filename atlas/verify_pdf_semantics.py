#!/usr/bin/env python3
"""Check that PDF extraction preserves each source display equation.

Run after rebuilding the collection, focused notes and review board:
    python atlas/verify_pdf_semantics.py
    python atlas/verify_pdf_semantics.py --all-extractors

The default uses pypdf (proof-library-requirements.txt). The optional comparison
also needs PyMuPDF and the pdftotext executable. This checks formula fidelity and
page counts; visual inspection remains necessary for layout and legibility.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path

from pypdf import PdfReader


BASE = Path(__file__).resolve().parent


def normalized(text: str) -> str:
    return re.sub(r"\s+", "", text)


def formulas(page: dict) -> list[str]:
    result = []
    for block in page.get("blocks", []):
        if block.get("type") == "eq":
            result.append(block["latex"].strip().strip("$"))
        elif block.get("type") == "matrix":
            rows = r" \\ ".join(" & ".join(map(str, row)) for row in block["cells"])
            result.append(block.get("label", "") + r"\begin{pmatrix}" + rows
                          + r"\end{pmatrix}" + block.get("tail", ""))
    return result


def extract(pdf: Path, all_extractors: bool) -> dict[str, list[str]]:
    result = {"pypdf": [page.extract_text() or "" for page in PdfReader(pdf).pages]}
    if all_extractors:
        import fitz

        with fitz.open(pdf) as document:
            result["pymupdf"] = [page.get_text() for page in document]
        command = shutil.which("pdftotext")
        if not command:
            raise RuntimeError("--all-extractors requires pdftotext")
        output = subprocess.run([command, "-enc", "UTF-8", str(pdf), "-"],
                                capture_output=True, check=True, text=True).stdout
        pages = output.split("\f")
        if pages and not pages[-1].strip():
            pages.pop()
        result["poppler"] = pages
    return result


def check(source: Path, all_extractors: bool) -> dict:
    content = json.loads(source.read_text(encoding="utf-8"))
    pdf = source.with_suffix(".pdf")
    pages = content["pages"]
    expected = [formulas(page) for page in pages]
    failures, counts = [], {}
    for name, extracted in extract(pdf, all_extractors).items():
        if len(extracted) != len(pages):
            failures.append({"extractor": name, "error": "page-count mismatch",
                             "expected": len(pages), "actual": len(extracted)})
        found = 0
        for number, expressions in enumerate(expected):
            text = normalized(extracted[number]) if number < len(extracted) else ""
            for expression in expressions:
                if normalized(expression) in text:
                    found += 1
                else:
                    failures.append({"extractor": name, "page": number + 1,
                                     "error": "formula missing or changed", "latex": expression})
        counts[name] = found
    return {"pdf": pdf.relative_to(BASE.parent).as_posix(), "pages": len(pages),
            "display_formulas": sum(map(len, expected)), "recovered_formulas": counts,
            "sha256": hashlib.sha256(pdf.read_bytes()).hexdigest(), "failures": failures}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--all-extractors", action="store_true")
    parser.add_argument("--output", type=Path, help="Optional JSON report")
    parser.add_argument("sources", type=Path, nargs="*")
    args = parser.parse_args()
    sources = args.sources or [BASE / "logistic-vanishing-terms.json",
                              *sorted((BASE / "proofs").glob("*.json"))]
    if not args.sources and (BASE / "proof-review-board.json").exists():
        sources.append(BASE / "proof-review-board.json")
    checks = [check(source.resolve(), args.all_extractors) for source in sources]
    report = {"scope": "Display-formula extraction and planned page counts; layout reviewed separately.",
              "documents": checks, "passed": all(not item["failures"] for item in checks)}
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for item in checks:
        print(f"{item['pdf']}: {item['display_formulas']} formulas; "
              f"{item['recovered_formulas']}; {len(item['failures'])} failures")
        for failure in item["failures"]:
            print(json.dumps(failure, ensure_ascii=False))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
