#!/usr/bin/env python3
"""Historical verifier command; validate complete HTML source preservation.

The PDF extraction check has been retired. The source IDs, mathematical text,
HTML destinations and structured proof blocks are checked by the HTML verifier.
"""
from pathlib import Path
import runpy
import sys

if __name__ == "__main__":
    target = Path(__file__).with_name("verify_html_semantics.py")
    sys.argv[0] = str(target)
    runpy.run_path(str(target), run_name="__main__")
