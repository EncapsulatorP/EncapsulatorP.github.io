#!/usr/bin/env python3
"""Historical command retained as an HTML-only compatibility entry point.

The structured source links this filename. Its former PDF generator has been
retired. Use build_proof_html.py for all documents, or this command for the full
17-section collection. Source JSON and Markdown are never overwritten.
"""
import argparse
from pathlib import Path
from html_renderer import render_document

BASE = Path(__file__).resolve().parent

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=BASE / "logistic-vanishing-terms.json")
    parser.add_argument("--html", type=Path, default=BASE / "logistic-vanishing-terms.html")
    args = parser.parse_args()
    if args.html.suffix.lower() != ".html":
        parser.error("This command now writes HTML; --html must name an .html file.")
    result = render_document(args.input.resolve(), args.html.resolve(),
                             status="reference", document_id="logistic-vanishing-terms", kind="collection")
    print(f"{result['path']}: {result['sections']} sections, {result['blocks']} source blocks")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
