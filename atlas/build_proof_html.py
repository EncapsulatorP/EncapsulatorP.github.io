#!/usr/bin/env python3
"""Build all complete HTML proofs from preserved structured JSON sources.

Run: python3 atlas/build_proof_html.py
Install build dependencies: python3 -m pip install -r atlas/html-requirements.txt

Canonical JSON and Markdown are never rewritten by this command. The library
manifest points to HTML and counts source sections, not print pages. No PDF is
read or generated. Translation data is populated by the separate reveal build.
"""
from __future__ import annotations

import json
from pathlib import Path

from html_renderer import render_document

BASE = Path(__file__).resolve().parent
ROOT = BASE.parent


def build() -> list[dict]:
    library_path = BASE / "proof-library.json"
    library = json.loads(library_path.read_text(encoding="utf-8"))
    results = []
    for stem, source_stem, status, kind in [
        ("logistic-vanishing-terms", "logistic-vanishing-terms", "reference", "collection"),
        ("logistic-collapse-vanishing", "logistic-collapse-vanishing", "exact", "proof-and-open-question"),
        ("proof-review-board", "proof-review-board", "review", "review"),
        ("treasure-hunt-guide", "proof-review-board", "review", "review"),
    ]:
        results.append(render_document(BASE / f"{source_stem}.json", BASE / f"{stem}.html",
                                       status=status, document_id=stem, kind=kind))
    for note in library["notes"]:
        source = ROOT / note["source"]
        output = source.with_suffix(".html")
        results.append(render_document(source, output, status=note["status"],
                                       document_id=note["slug"], kind=note["kind"]))
        note.pop("pdf", None)
        note.pop("pageCount", None)
        note["html"] = output.relative_to(ROOT).as_posix()
        note["sectionCount"] = results[-1]["sections"]
    library["completeCollection"] = "atlas/logistic-vanishing-terms.html"
    library_path.write_text(json.dumps(library, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return results


def main() -> int:
    results = build()
    print(json.dumps({"documents": len(results), "outputs": results}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
