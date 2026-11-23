"""Build sitemap.xml and assets/site-titles.json (real page titles + home rooms for /map/).

Run from the repository root:  python3 assets/build_sitemap.py
Redirect stubs, QA pages, previews and 404 are left out of both maps.
"""
from __future__ import annotations

import datetime as dt
import html
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://encapsulatorp.github.io/"
TODAY = dt.date.today().isoformat()

EXCLUDE_PREFIX = ("qa/", ".git/", "node_modules/")
EXCLUDE_FILES = {"404.html", "paper-atlas-preview.html", "reading-room-preview.html"}

# Rooms that live on the home page as hash routes.
HOME_ROOMS = [
    ("Research atlas", "#atlas", "The orbital entrance to all 46 entries"),
    ("Goldbach observatory", "#goldbach", "Every unordered prime pair for an even sum"),
    ("Collatz", "#collatz", "Integer flights and the complex Metamorphoses"),
    ("Towers", "#towers", "Sign-flipping power towers, two phase limits"),
    ("Curious Cabinet", "#cabinet", "Catalan's critical disk and C3.2Z dynamics"),
    ("Hibernating Lemmas", "#lemmas", "The exact twin-prime criterion at work"),
    ("Pirate Chest", "#pirate-chest", "Rudin–Shapiro energy circle and its argument"),
    ("Paper workbench", "#paper-table", "Paper models of the shapes"),
    ("Validatron", "#validatron", "Research tooling and checks"),
    ("Pirates Plan", "#pirates-plan", "Next treasures and the roadmap"),
    ("Subject map & repositories", "#archive", "Mathematics by subject, with repository links"),
    ("Map credits", "#map-credits", "Who drew which part of the map"),
    ("Co-authors", "#atlas-credits", "Signatures and collaborators"),
]

GROUPS = [
    ("Main routes", lambda r: r.count("/") <= 1 and not r.startswith("atlas/")),
    ("Interactive exhibits", lambda r: r.startswith("interactive/")),
    ("Atlas · written proofs", lambda r: r.startswith("atlas/proofs/")),
    ("Atlas · entries", lambda r: r.startswith("atlas/entries/")),
    ("Atlas · traps (claims that fail)", lambda r: r.startswith("atlas/traps/")),
    ("Atlas · reading copies & boards", lambda r: r.startswith("atlas/")),
    ("Treasure hunt", lambda r: r.startswith("treasure-hunt/")),
    ("Other pages", lambda r: True),
]


def is_redirect(text: str) -> bool:
    return 'http-equiv="refresh"' in text or bool(re.search(r"<body>\s*<p>\s*<a[^>]*>[^<]*</a>\s*</p>\s*<script>location\.replace", text))


def title_of(text: str, fallback: str) -> str:
    m = re.search(r"<title>(.*?)</title>", text, re.S | re.I)
    t = html.unescape(m.group(1)).strip() if m else fallback
    return re.sub(r"\s*[·|–-]\s*EncapsulatorP\s*$", "", t) or fallback


def url_of(rel: str) -> str:
    return rel[: -len("index.html")] if rel.endswith("index.html") else rel


def collect():
    pages = []
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT).as_posix()
        if rel in EXCLUDE_FILES or rel.startswith(EXCLUDE_PREFIX) or "/vendor/" in rel:
            continue
        text = p.read_text(errors="ignore")
        if is_redirect(text) or 'name="robots" content="noindex"' in text:
            continue
        pages.append((url_of(rel), title_of(text, rel)))
    return pages


def build():
    pages = collect()
    grouped: dict[str, list] = {g: [] for g, _ in GROUPS}
    for url, title in pages:
        for name, test in GROUPS:
            if test(url):
                grouped[name].append((url, title))
                break

    import json
    data = {
        "titles": {"/" + u: t for u, t in pages},
        "rooms": [{"title": t, "path": "/" + h, "note": d} for t, h, d in HOME_ROOMS],
        "groups": {name: ["/" + u for u, _ in items] for name, items in grouped.items() if items},
    }
    data["titles"]["/"] = "Home"
    (ROOT / "assets" / "site-titles.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    total = len(pages) + len(HOME_ROOMS)

    prio = lambda u: "1.0" if u == "" else "0.9" if u.count("/") == 1 and u.endswith("/") else "0.6" if u.startswith(("interactive/", "atlas/proofs/")) else "0.5"
    urls = [("", "1.0")] + [(u, prio(u)) for u, _ in pages if u != ""]
    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    xml += [f"  <url><loc>{BASE}{u}</loc><lastmod>{TODAY}</lastmod><priority>{p}</priority></url>" for u, p in urls]
    xml.append("</urlset>\n")
    (ROOT / "sitemap.xml").write_text("\n".join(xml))
    print(f"titles: {len(pages)} pages + {len(HOME_ROOMS)} rooms, sitemap.xml: {len(urls)} urls")


if __name__ == "__main__":
    build()
