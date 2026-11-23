#!/usr/bin/env python3
"""Historical command retained as an HTML-only atlas build entry point.

The former print renderer has been retired. This command rebuilds README.html
and the separate false-claim lesson from the canonical sources. It never writes
or reads a PDF. Prefer python3 atlas/build_catalog.py for a complete data refresh.
"""
from build_html_atlas import build_catalog_html, build_traps

if __name__ == "__main__":
    build_catalog_html()
    build_traps()
