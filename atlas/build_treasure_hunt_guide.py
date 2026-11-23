#!/usr/bin/env python3
"""Rebuild the complete HTML review board and treasure-guide alias.

The ten-section proof-review-board.json is preserved as the reading source.
The lean interactive board continues to use proof-board-data.json and its own
build_treasure_site.py command. This entry point produces HTML only.
"""
from pathlib import Path
from html_renderer import render_document

BASE = Path(__file__).resolve().parent

def main() -> int:
    source = BASE / "proof-review-board.json"
    for stem in ("proof-review-board", "treasure-hunt-guide"):
        result = render_document(source, BASE / (stem + ".html"),
                                 status="review", document_id=stem, kind="review")
        print(f"{result['path']}: {result['sections']} complete sections")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
