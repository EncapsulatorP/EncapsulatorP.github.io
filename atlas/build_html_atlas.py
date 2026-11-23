#!/usr/bin/env python3
"""Publish the complete source catalogue as semantic HTML and individual readers.

The catalogue is authoritative. Evidence labels, formulas, source trails and
credits are carried through verbatim. Animation is a progressive enhancement;
the initial document always contains the complete, selectable English text.
Run build_zyntalic.py after generating readers to attach deterministic language
records. No network access or document export is needed to build the HTML.
"""
from __future__ import annotations

import html
import json
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
ATLAS = ROOT / "atlas"
LABELS = {
    "exact": "Exact identity / written proof",
    "finite": "Finite-depth observation",
    "reported": "Reported computation",
    "conjectural": "Conjectural direction",
    "exploratory": "Exploratory construction",
    "tooling": "Research tooling",
}
KINDS = {
    "exact": "treasure", "finite": "observation", "reported": "reported",
    "conjectural": "open-question", "exploratory": "exploration", "tooling": "tool",
}
READ_EVIDENCE = (
    "Exact entries contain an identity or a written argument under stated assumptions. "
    "Finite-depth observations concern the displayed construction and cutoff. Reported "
    "computations retain their original provenance and are not described as reruns. "
    "Exploratory constructions and conjectural directions include the next concrete question. "
    "Classical identities are credited as mathematical background; no priority claim follows from inclusion."
)
REVEAL_PREPAINT = '''<style>html.ar-reveal-pending #reader-content,html.ar-reveal-pending [data-reader-reveal]{visibility:hidden!important}</style>
<script>(function(){try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('ar-reveal-pending');window.setTimeout(function(){document.documentElement.classList.remove('ar-reveal-pending');},8000);}}catch(e){document.documentElement.classList.remove('ar-reveal-pending');}}());</script>'''


def esc(value):
    return html.escape(str(value), quote=True)


def script_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def html_link(url):
    """Change only this site's former delivery routes; preserve scholarly URLs."""
    parsed = urlsplit(url)
    if parsed.hostname in ("encapsulatorp.github.io", None) and parsed.path.endswith(".pdf"):
        url = url.replace(".pdf", ".html")
        if "logistic-collapse-vanishing.html#page=6" in url:
            url = url.replace("#page=6", "#coefficient-decay")
    return url


def shell(title, description, content, config, depth=1, canonical="README.html", source=None, extra=""):
    prefix = "../" * depth
    config = {**config, "logoSrc": f"{prefix}assets/logo-encapsulatorp-512.png"}
    source_script = f'<script type="application/json" id="catalog-source">{script_json(source)}</script>' if source is not None else ""
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{esc(description)}">
<meta name="theme-color" content="#ffffff">
<title>{esc(title)} · EncapsulatorP</title>
{REVEAL_PREPAINT}
<link rel="canonical" href="https://encapsulatorp.github.io/atlas/{esc(canonical)}">
<link rel="icon" href="{prefix}assets/favicon-32.png">
<link rel="stylesheet" href="{prefix}assets/atlas-reader.css">
<link rel="stylesheet" href="{prefix}assets/atlas-reveal.css">
<script src="{prefix}assets/atlas-gif.js" defer></script>
<script src="{prefix}assets/pq-wordmark.js?v=blue-violet-1" defer></script>
<script src="{prefix}assets/atlas-reveal.js" defer></script>
<script src="{prefix}assets/atlas-reader-init.js" defer></script>
</head>
<body data-reader-status="{esc(config.get('status', 'collection'))}">
<a class="reader-skip" data-reader-chrome href="#reader-content">Skip to the document</a>
<header class="reader-header">
  <a class="reader-brand" data-reader-chrome href="{prefix}#interactive?topic=goldbach-involution"><img src="{esc(config['logoSrc'])}" alt="EncapsulatorP" width="64" height="64"><span>ENCAPSULATORP<small>THE PIRATE CHEST · READING ROOM</small></span></a>
  <nav data-reader-chrome aria-label="Reading navigation"><a href="{prefix}#interactive?topic=goldbach-involution">Main menu</a><a href="{prefix}atlas/README.html#contents">Atlas contents</a><a href="{prefix}treasure-hunt/">Proof board</a></nav>
</header>
<div class="reader-shell">
<div id="reader-tools" class="reader-tools" data-reader-chrome aria-label="Reading and export controls"></div>
<main id="reader-content">{content}</main>
{extra}
<footer class="reader-footer"><p data-reader-reveal>Research direction: Zolton / EncapsulatorP. Contributor and source credits are retained with each entry.</p><a data-reader-chrome href="{prefix}#interactive?topic=goldbach-involution">Return to the main menu <span aria-hidden="true">↗</span></a></footer>
</div>
{source_script}
<script type="application/json" id="reader-config">{script_json(config)}</script>
<noscript><p class="reader-noscript">The complete English document is available above. Animation and GIF export use JavaScript.</p></noscript>
</body></html>
'''


def entry_markup(entry, index, by_id, *, standalone=False):
    """Return complete HTML, exact prose passages, and lossless GIF text blocks."""
    eid, status = entry["id"], entry["status"]
    passages, blocks = [], []
    exact = status == "exact"
    rel = "" if standalone else "entries/"
    heading = "h1" if standalone else "h2"

    def prose(field, value, *, detail_index=None, tag="p", cls=""):
        pid = f"{eid}-{field}" + (f"-{detail_index}" if detail_index is not None else "")
        marker = f'data-detail-index="{detail_index}"' if detail_index is not None else f'data-catalog-field="{field}"'
        # Origin, source labels and declared next questions are never obscured.
        animate = exact and field in ("title", "summary", "why", "detail")
        attr = f' data-passage-id="{esc(pid)}" data-zyntalic' if animate else ""
        if animate:
            passages.append({"id": pid, "selector": f'[data-passage-id="{pid}"]', "english": value, "status": "exact"})
        blocks.append({"type": "heading" if tag.startswith("h") else "paragraph", "text": value, **({"passageId": pid} if animate else {}), "status": status})
        return f'<{tag} class="{cls}" {marker}{attr}>{esc(value)}</{tag}>'

    blocks.append({"type": "caption", "text": f"{index + 1:02d} / 46 · {LABELS[status]} · {entry['family']}", "status": status})
    parts = [f'<article id="{esc(eid)}" class="reader-document catalog-entry" data-entry-id="{esc(eid)}" data-source-status="{status}" data-reader-kind="{KINDS[status]}">',
             f'<header class="document-heading"><div class="reader-kicker"><span>{index + 1:02d} / 46 · {esc(entry["family"])}</span><span class="reader-evidence" data-evidence="{status}">{esc(LABELS[status])}</span></div>']
    if entry.get("promoted"):
        parts.append(f'<p class="reader-promotion">{esc(entry["promoted"])}</p>')
        blocks.append({"type": "caption", "text": entry["promoted"]})
    parts.append(prose("title", entry["title"], tag=heading))
    parts.append(prose("summary", entry["summary"], cls="reader-lead"))
    parts.append(prose("origin", entry["origin"], cls="reader-origin"))
    parts.append("</header>")
    parts.append(f'<pre class="reader-equation catalog-formula" data-catalog-field="formula">{esc(entry["formula"])}</pre>')
    blocks.extend({"type": "math", "text": line, "status": status} for line in entry["formula"].splitlines() if line.strip())
    if entry.get("keyFormula"):
        parts.append(f'<details class="reader-key-formula"><summary>Key formula</summary><p data-catalog-field="keyFormula">{esc(entry["keyFormula"])}</p></details>')
        blocks.append({"type": "caption", "text": "Key formula"})
        blocks.append({"type": "math", "text": entry["keyFormula"]})
    parts.append('<div class="reader-prose">')
    parts.append('<h3>Why follow it</h3>')
    blocks.append({"type": "heading", "text": "Why follow it"})
    parts.append(prose("why", entry["why"]))
    for n, paragraph in enumerate(entry["detail"]):
        parts.append(prose("detail", paragraph, detail_index=n))
    parts.append('<h3>Next experiment or question</h3>')
    blocks.append({"type": "heading", "text": "Next experiment or question"})
    parts.append(prose("next", entry["next"]))
    parts.append('</div><section class="reader-sources" aria-label="Sources"><h3>Sources</h3><ol>')
    blocks.append({"type": "heading", "text": "Sources"})
    for n, source in enumerate(entry["sources"]):
        parts.append(f'<li><a data-source-index="{n}" href="{esc(html_link(source["url"]))}">{esc(source["label"])}</a></li>')
        blocks.append({"type": "caption", "text": source["label"] + "\n" + html_link(source["url"])})
    parts.append('</ol></section>')
    if entry["connections"]:
        parts.append('<nav class="reader-related" aria-label="Connected entries"><h3>Connected threads</h3><ul>')
        blocks.append({"type": "heading", "text": "Connected threads"})
        for n, related in enumerate(entry["connections"]):
            parts.append(f'<li><a data-connection-index="{n}" data-related-entry="{esc(related)}" href="{rel}{esc(related)}.html">{esc(by_id[related]["title"])} <span aria-hidden="true">↗</span></a></li>')
            blocks.append({"type": "caption", "text": by_id[related]["title"]})
        parts.append('</ul></nav>')
    if not standalone:
        parts.append(f'<p class="reader-entry-action"><a href="entries/{esc(eid)}.html">Read this entry &amp; export its GIF <span aria-hidden="true">↗</span></a><a href="#contents">Contents ↑</a></p>')
    parts.append('</article>')
    for block in blocks:
        block.setdefault("status", status)
    return "\n".join(parts), passages, blocks


def build_catalog_html():
    data = json.loads((ATLAS / "catalog.json").read_text())
    entries = data["entries"]
    by_id = {e["id"]: e for e in entries}
    (ATLAS / "entries").mkdir(exist_ok=True)
    toc = []
    articles, passages, blocks = [], [], []
    intro_blocks = [
        {"type": "heading", "text": "Research atlas.", "passageId": "atlas-reading-title", "status": "exact"},
        {"type": "paragraph", "text": "46 entries. Every equation. Every source trail.", "passageId": "atlas-reading-lead", "status": "exact"},
        {"type": "caption", "text": f"Edition {data['edition']} · 46 entries · 28 exact results"},
        {"type": "paragraph", "text": data["coverage"]},
        {"type": "paragraph", "text": READ_EVIDENCE},
        {"type": "caption", "text": data["attribution"]},
    ]
    for index, entry in enumerate(entries):
        eid = entry["id"]
        toc.append(f'<li data-contents-item data-search="{esc((entry["title"] + " " + entry["family"] + " " + LABELS[entry["status"]]).lower())}"><a href="#{esc(eid)}"><span class="contents-number">{index + 1:02d}</span><span>{esc(entry["title"])}<small>{esc(LABELS[entry["status"]])}</small></span><span aria-hidden="true">↓</span></a></li>')
        article, ps, bs = entry_markup(entry, index, by_id)
        articles.append(article); passages.extend(ps); blocks.extend(bs)
        single, single_ps, single_bs = entry_markup(entry, index, by_id, standalone=True)
        single_bs.append({"type": "caption", "text": data["attribution"], "status": entry["status"]})
        config = {"entryId": eid, "title": entry["title"], "status": entry["status"], "root": "#reader-content", "controls": "#reader-tools", "passages": single_ps, "gifBlocks": single_bs, "menuHref": "../../#interactive?topic=goldbach-involution", "sourceLabel": "Zolton / EncapsulatorP · with ChatGPT", "sourceUrl": f"https://encapsulatorp.github.io/atlas/entries/{eid}.html", "credit": data["attribution"]}
        single += f'<p class="reader-document-end"><a href="../README.html#{esc(eid)}">← Back to the complete atlas</a></p>'
        (ATLAS / "entries" / f"{eid}.html").write_text(shell(entry["title"], entry["summary"], single, config, 2, f"entries/{eid}.html", entry))
    intro = f'''<section class="atlas-introduction">
<p class="reader-kicker">THE COMPLETE READING EDITION · {esc(data['edition'])}</p>
<h1 class="atlas-title" data-zyntalic data-passage-id="atlas-reading-title">Research atlas.</h1>
<p class="reader-lead" data-zyntalic data-passage-id="atlas-reading-lead">46 entries. Every equation. Every source trail.</p>
<p>{esc(data['coverage'])}</p>
<div class="atlas-stats" aria-label="Atlas evidence counts"><span><b>28</b> exact results</span><span><b>5</b> research families</span><span><b>46</b> connected entries</span></div>
<details class="reader-evidence-guide"><summary>Evidence and credits</summary><p>{esc(READ_EVIDENCE)}</p><p>{esc(data['attribution'])}</p></details>
</section>
<section id="contents" class="atlas-contents" aria-labelledby="contents-title">
<div class="contents-heading"><h2 id="contents-title">Choose a thread</h2><label class="contents-search" hidden>Find an entry<input id="contents-filter" type="search" placeholder="Title, subject or evidence" autocomplete="off"></label></div>
<ol class="contents-list">{''.join(toc)}</ol><p id="contents-empty" hidden>No matching entries. Clear the search to see all 46.</p>
</section>'''
    passages = [{"id": "atlas-reading-title", "english": "Research atlas.", "status": "exact"}, {"id": "atlas-reading-lead", "english": "46 entries. Every equation. Every source trail.", "status": "exact"}] + passages
    config = {"entryId": "research-atlas", "title": "Research atlas · complete reading edition", "status": "collection", "root": "#reader-content", "controls": "#reader-tools", "passages": passages, "gifBlocks": intro_blocks + blocks, "menuHref": "../#interactive?topic=goldbach-involution", "sourceLabel": "Zolton / EncapsulatorP · with ChatGPT", "sourceUrl": "https://encapsulatorp.github.io/atlas/README.html", "credit": data["attribution"]}
    (ATLAS / "README.html").write_text(shell("Research atlas", "The complete EncapsulatorP research atlas: all 46 entries, equations, evidence labels and sources, with Zyntalic reading and animated GIF export.", intro + "\n".join(articles), config, source=data))
    (ATLAS / "index.html").write_text('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=README.html"><link rel="canonical" href="https://encapsulatorp.github.io/atlas/README.html"><title>Research atlas · EncapsulatorP</title></head><body><p><a href="README.html">Open the complete research atlas</a></p><script>location.replace('README.html'+location.search+location.hash);</script></body></html>''')
    print(f"HTML atlas: {len(entries)} complete entries, {sum(e['status']=='exact' for e in entries)} exact, {len(passages)} reveal passages")


def build_traps():
    path = ATLAS / "traps.json"
    if not path.exists():
        return
    source = json.loads(path.read_text())
    (ATLAS / "traps").mkdir(exist_ok=True)
    for entry in source["entries"]:
        eid = entry["id"]
        ps = [{"id": f"{eid}-claim", "selector": f'[data-passage-id="{eid}-claim"]', "english": entry["claim"], "status": "false"}]
        blocks = [{"type": "heading", "text": entry["title"]}, {"type": "caption", "text": "False claim · correction retained"}, {"type": "paragraph", "text": entry["claim"], "passageId": f"{eid}-claim", "role": "claim", "status": "false"}, {"type": "heading", "text": "The correction"}, {"type": "paragraph", "text": entry["correction"], "role": "correction"}]
        proof = ''.join(f'<p>{esc(p)}</p>' for p in entry['proof'])
        blocks.extend({"type": "paragraph", "text": p, "role": "correction"} for p in entry["proof"])
        formulas = entry.get("formulaText", entry.get("formulas", []))
        eqs = ''.join(f'<pre class="reader-equation">{esc(p)}</pre>' for p in formulas)
        blocks.extend({"type": "math", "text": p, "role": "correction"} for p in formulas)
        facts = ''.join(f'<li>{esc(p)}</li>' for p in entry["preservedFacts"])
        blocks.extend({"type": "paragraph", "text": p, "role": "correction"} for p in entry["preservedFacts"])
        sources = ''.join(f'<li><a href="{esc(html_link(s.get("href", s.get("path", ""))))}">{esc(s["label"])}</a></li>' for s in entry["sources"])
        blocks.extend({"type": "caption", "text": s["label"] + "\n" + html_link(s.get("href", s.get("path", ""))), "role": "correction"} for s in entry["sources"])
        for block in blocks[3:]:
            block["role"] = "correction"
            block["status"] = "exact"
        content = f'''<article id="{esc(eid)}" class="reader-document trap-document" data-trap-id="{esc(eid)}" data-reader-kind="trap" data-source-status="refuted"><header class="document-heading"><p class="reader-kicker">REJECTED CLAIM</p><h1>{esc(entry['title'])}</h1><p class="reader-origin">This sentence is false. Its precise correction remains available below.</p></header><section id="trap-claim" aria-label="False claim"><p class="trap-claim" data-passage-id="{eid}-claim">{esc(entry['claim'])}</p></section><p class="reader-entry-action"><a href="../../#interactive?topic=goldbach-involution">Return to the main menu →</a></p><details id="trap-correction" data-trap-correction class="reader-correction"><summary>Read the correction</summary><h2>The correction</h2><p>{esc(entry['correction'])}</p>{proof}{eqs}<h3>What remains true</h3><ul>{facts}</ul><h3>Sources</h3><ul>{sources}</ul></details></article>'''
        config = {"entryId": eid, "title": entry["title"], "status": "false", "root": "#reader-content", "controls": "#reader-tools", "passages": ps, "gifBlocks": blocks, "trapSelector": "#trap-claim", "correctionSelector": "#trap-correction", "menuHref": "../../#interactive?topic=goldbach-involution", "credit": "Zolton / EncapsulatorP · exact corrections retained"}
        (ATLAS / "traps" / f"{eid}.html").write_text(shell(entry["title"], entry["correction"], content, config, 2, f"traps/{eid}.html"))
    print(f"Separate rejected-claim readers: {len(source['entries'])}")


if __name__ == "__main__":
    build_catalog_html()
    build_traps()
