#!/usr/bin/env python3
"""Rebuild the complete HTML proof library from preserved JSON sources.

Compatibility entry point for the former print-library build. Canonical JSON
and Markdown stay unchanged. See build_proof_html.py and html-requirements.txt.
"""
from build_proof_html import main

if __name__ == "__main__":
    raise SystemExit(main())
