#!/usr/bin/env python3
"""Rebuild the full HTML reading site, authentic reveals and preservation checks."""
from __future__ import annotations
import argparse
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--translate", action="store_true", help="Translate changed prose using the pinned Zyntalic engine.")
    parser.add_argument("--runner", type=Path, help="Optional supplied translator skill runner.")
    args = parser.parse_args()
    for name in ("build_catalog.py", "build_proof_html.py", "build_treasure_site.py"):
        subprocess.run([sys.executable, str(ROOT / "atlas" / name)], cwd=ROOT, check=True)
    language = [sys.executable, str(ROOT / "atlas/build_zyntalic.py")]
    if args.translate:
        language.append("--translate")
    if args.runner:
        language.extend(["--runner", str(args.runner)])
    subprocess.run(language, cwd=ROOT, check=True)
    subprocess.run([sys.executable, str(ROOT / "atlas/verify_html_semantics.py")], cwd=ROOT, check=True)


if __name__ == "__main__":
    main()
