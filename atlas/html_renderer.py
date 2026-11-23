#!/usr/bin/env python3
"""Complete static HTML for the atlas's preserved structured proof documents.

The source JSON is retained verbatim in meaning. Display mathematics is rendered
as deterministic SVG at build time; exact LaTeX remains visible in a disclosure
and in data-latex. Browser reading never requires a remote math service.
"""
from __future__ import annotations

import hashlib
import html
import io
import json
import os
import re
from functools import lru_cache
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from PIL import Image

import matplotlib

matplotlib.use("Agg")
matplotlib.rcParams.update({
    "mathtext.fontset": "dejavuserif", "mathtext.default": "it",
    "svg.fonttype": "path", "svg.hashsalt": "encapsulatorp-proof-html-v1",
})
from matplotlib.font_manager import FontProperties
from matplotlib.mathtext import math_to_image


ROOT = Path(__file__).resolve().parents[1]
SITE_HOSTS = {"encapsulatorp.github.io", "www.encapsulatorp.github.io"}
BLOCK_TYPES = {"p", "h", "eq", "callout", "link", "image", "table", "matrix"}
COLLECTION_EXACT_SECTIONS = {
    "logistic-proof-picture", "logistic-cycle", "logistic-vanishing", "six-maps",
    "lyapunov-comparison", "dimensions-fragments", "zeta-family",
    "mahler-remainder", "palindromes", "tower-convergence", "tower-envelope",
    "prime-polynomials",
}
SECTION_STATUS = {"schanuel-proof": "conditional", "review-finding": "review"}

# Hide reading content before first paint; the runtime installs its visual masks
# synchronously before releasing this cloak. Reduced motion and failed scripts
# retain the complete ordinary HTML through the fail-open path.
REVEAL_PREPAINT = '''<style>html.ar-reveal-pending #reader-content,html.ar-reveal-pending [data-reader-reveal]{visibility:hidden!important}</style>
<script>(function(){try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('ar-reveal-pending');window.setTimeout(function(){document.documentElement.classList.remove('ar-reveal-pending');},8000);}}catch(e){document.documentElement.classList.remove('ar-reveal-pending');}}());</script>'''


def esc(value) -> str:
    return html.escape(str(value), quote=True)


def script_json(value) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2).replace("</", "<\\/")


def relative_url(target: Path, output: Path) -> str:
    return Path(os.path.relpath(target, output.parent)).as_posix()


def migrate_url(value: str) -> str:
    """Only migrate this site's delivery URLs, leaving external citations intact."""
    parsed = urlsplit(str(value))
    if parsed.scheme and parsed.scheme not in {"https", "http", "mailto"}:
        raise ValueError(f"Unsupported link scheme: {value}")
    local = not parsed.netloc or parsed.netloc.lower() in SITE_HOSTS
    if local and parsed.path.lower().endswith(".pdf"):
        path = parsed.path[:-4] + ".html"
        fragment = parsed.fragment
        if fragment == "page=6" and path.endswith("/logistic-collapse-vanishing.html"):
            fragment = "coefficient-decay"
        elif re.fullmatch(r"page=\d+", fragment):
            fragment = "page-" + fragment.split("=", 1)[1]
        return urlunsplit((parsed.scheme, parsed.netloc, path, parsed.query, fragment))
    return value


class InlineHTML(HTMLParser):
    """Convert the small documented source-markup vocabulary to safe HTML."""
    ALLOWED = {"b", "strong", "i", "em", "u", "sub", "sup", "code"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.text = []
        self.stack = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        tag = "sup" if tag == "super" else tag
        if tag == "br":
            self.parts.append("<br>\n")
            self.text.append("\n")
        elif tag in {"link", "a"}:
            href = migrate_url(attrs.get("href", ""))
            self.parts.append(f'<a href="{esc(href)}">')
            self.stack.append((tag, "a"))
        elif tag in self.ALLOWED:
            self.parts.append(f"<{tag}>")
            self.stack.append((tag, tag))
        else:
            raise ValueError(f"Unsupported inline source tag <{tag}>")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag != "br":
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        tag = "sup" if tag == "super" else tag
        if tag == "br":
            return
        if not self.stack or self.stack[-1][0] != tag:
            raise ValueError(f"Unbalanced inline source tag </{tag}>")
        _, emitted = self.stack.pop()
        self.parts.append(f"</{emitted}>")

    def handle_data(self, data):
        self.parts.append(html.escape(data))
        self.text.append(data)


def inline(value: str) -> tuple[str, str]:
    parser = InlineHTML()
    parser.feed(str(value))
    parser.close()
    if parser.stack:
        raise ValueError(f"Unclosed inline markup: {value}")
    return "".join(parser.parts), "".join(parser.text)


def plain(value: str) -> str:
    return inline(value)[1]


class GIFPlain(HTMLParser):
    """Keep exponent/subscript meaning in a canvas text representation."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in {"sup", "super"}:
            self.parts.append("^(")
        elif tag == "sub":
            self.parts.append("_(")
        elif tag == "br":
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in {"sup", "super", "sub"}:
            self.parts.append(")")

    def handle_data(self, value):
        self.parts.append(value)


def gif_plain(value: str) -> str:
    parser = GIFPlain()
    parser.feed(str(value))
    parser.close()
    return "".join(parser.parts)


def braced_fractions(source: str) -> str:
    """Normalize single-token TeX fractions for the installed MathText parser."""
    def argument(start):
        while start < len(source) and source[start].isspace():
            start += 1
        if start == len(source):
            raise ValueError("Missing fraction argument")
        if source[start] == "{":
            depth, end = 1, start + 1
            while end < len(source) and depth:
                if source[end] == "\\":
                    end += 2
                    continue
                depth += (source[end] == "{") - (source[end] == "}")
                end += 1
            if depth:
                raise ValueError("Unbalanced fraction argument")
            return "{" + braced_fractions(source[start + 1:end - 1]) + "}", end
        if source[start] == "\\":
            match = re.match(r"\\(?:[A-Za-z]+|.)", source[start:])
            end = start + len(match[0])
        else:
            end = start + 1
        return "{" + source[start:end] + "}", end

    parts, start = [], 0
    while match := re.search(r"\\(?:dfrac|tfrac|frac)(?![A-Za-z])", source[start:]):
        first = start + match.start()
        numerator, next_pos = argument(start + match.end())
        denominator, end = argument(next_pos)
        parts += [source[start:first], r"\frac", numerator, denominator]
        start = end
    return "".join(parts) + source[start:]


def math_input(latex: str) -> str:
    source = latex.strip()
    if source.startswith("$$") and source.endswith("$$"):
        source = source[2:-2].strip()
    elif source.startswith("$") and source.endswith("$"):
        source = source[1:-1].strip()
    if source.startswith(r"\boxed{") and source.endswith("}"):
        source = source[len(r"\boxed{"):-1]
    source = re.sub(r"\\le(?![A-Za-z])", r"\\leq", source)
    source = re.sub(r"\\ge(?![A-Za-z])", r"\\geq", source)
    return braced_fractions(source)


@lru_cache(maxsize=1024)
def _math_svg(latex: str, size: int) -> str:
    stream = io.BytesIO()
    math_to_image(
        "$" + math_input(latex) + "$", stream,
        prop=FontProperties(family="DejaVu Serif", size=size),
        dpi=72, format="svg", color="#202520",
    )
    source = stream.getvalue().decode("utf-8")
    source = source[source.index("<svg"):]
    source = re.sub(r"<metadata>.*?</metadata>", "", source, flags=re.S)
    return "\n".join(line.rstrip() for line in source.splitlines()).rstrip() + "\n"


def math_svg(latex: str, token: str, size: int = 18) -> str:
    source = _math_svg(latex, size)
    prefix = "math-" + hashlib.sha256(token.encode()).hexdigest()[:14] + "-"
    ids = re.findall(r'\bid="([^"]+)"', source)
    for old in ids:
        source = source.replace(f'id="{old}"', f'id="{prefix}{old}"')
        source = source.replace(f'href="#{old}"', f'href="#{prefix}{old}"')
        source = source.replace(f'url(#{old})', f'url(#{prefix}{old})')
    source = source.replace(
        "<svg ", f'<svg class="reader-math-svg" role="img" aria-label="{esc(latex)}" ', 1
    )
    return source


def svg_dimensions(svg: str) -> tuple[float, float]:
    match = re.search(r'viewBox="([^"]+)"', svg)
    if not match:
        raise ValueError("Math SVG is missing its viewBox")
    _, _, width, height = map(float, match[1].split())
    return width, height


def save_math_asset(svg: str, output: Path) -> dict:
    """Give GIF export the same sharp, self-contained equation as the reader."""
    svg = "\n".join(line.rstrip() for line in svg.splitlines()).rstrip() + "\n"
    directory = ROOT / "atlas/assets/math"
    directory.mkdir(parents=True, exist_ok=True)
    name = hashlib.sha256(svg.encode("utf-8")).hexdigest() + ".svg"
    asset = directory / name
    if not asset.exists() or asset.read_text(encoding="utf-8") != svg:
        asset.write_text(svg, encoding="utf-8")
    width, height = svg_dimensions(svg)
    return {"image": relative_url(asset, output), "width": width, "height": height}


def matrix_asset(block: dict, output: Path) -> dict:
    """Compose a true matrix image without flattening its rows into a string."""
    parts = [[math_svg(cell, f"matrix-cell-{r}-{c}-{cell}") for c, cell in enumerate(row)]
             for r, row in enumerate(block["cells"])]
    dimensions = [[svg_dimensions(cell) for cell in row] for row in parts]
    columns = max(map(len, parts))
    widths = [max(row[c][0] for row in dimensions if c < len(row)) for c in range(columns)]
    row_heights = [max(size[1] for size in row) for row in dimensions]
    label = math_svg(block["label"], "matrix-label-" + block["label"]) if block.get("label") else None
    tail = math_svg(block["tail"], "matrix-tail-" + block["tail"]) if block.get("tail") else None
    label_size = svg_dimensions(label) if label else (0, 0)
    tail_size = svg_dimensions(tail) if tail else (0, 0)
    matrix_height = sum(row_heights) + 12 * (len(parts) - 1) + 12
    matrix_width = sum(widths) + 18 * (columns - 1) + 24
    height = max(matrix_height, label_size[1], tail_size[1]) + 4
    left = label_size[0] + (12 if label else 0)
    total_width = left + matrix_width + (12 + tail_size[0] if tail else 0)
    pieces = []

    def place(svg, x, y):
        # Put paths in translated groups, avoiding nested-viewport differences
        # between SVG image decoders. MathText's viewBox already uses these units.
        content = svg[svg.index(">") + 1:svg.rfind("</svg>")]
        pieces.append(f'<g transform="translate({x:.5f} {y:.5f})">{content}</g>')

    if label:
        place(label, 0, (height - label_size[1]) / 2)
    row_y = (height - matrix_height) / 2 + 6
    for r, row in enumerate(parts):
        x = left + 12
        for c, svg in enumerate(row):
            w, h = dimensions[r][c]
            place(svg, x + (widths[c] - w) / 2, row_y + (row_heights[r] - h) / 2)
            x += widths[c] + 18
        row_y += row_heights[r] + 12
    top = (height - matrix_height) / 2
    right = left + matrix_width
    pieces.append(f'<path d="M {left+7} {top} H {left+2} V {top+matrix_height} H {left+7} '
                  f'M {right-7} {top} H {right-2} V {top+matrix_height} H {right-7}" '
                  'fill="none" stroke="#202520" stroke-width="1.2"/>')
    if tail:
        place(tail, right + 12, (height - tail_size[1]) / 2)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
           f'width="{total_width:.5f}pt" height="{height:.5f}pt" viewBox="0 0 {total_width:.5f} {height:.5f}">'
           + "".join(pieces) + "</svg>")
    return save_math_asset(svg, output)


def source_disclosure(latex: str) -> str:
    return ('<details class="reader-math-source"><summary>Copy exact formula</summary>'
            f'<pre><code>{html.escape(latex)}</code></pre></details>')


def section_status(document: str, status: str, page_id: str) -> str:
    if document == "logistic-vanishing-terms":
        if page_id in COLLECTION_EXACT_SECTIONS:
            return "exact"
        return SECTION_STATUS.get(page_id, "reference")
    return status


def is_credit(page_id: str, block: dict) -> bool:
    if page_id in {"sources", "reading-map", "opening", "numerical-zero-and-sources"}:
        return True
    value = str(block.get("text", ""))
    return (bool(block.get("small")) or "<link" in value or "<a " in value
            or bool(re.search(r"\[S\d+\]|source|reference|provenance|copyright|historical|edition", value, re.I)))


def render_document(source: Path, output: Path, *, status: str | None = None,
                    document_id: str | None = None, kind: str = "proof") -> dict:
    data = json.loads(source.read_text(encoding="utf-8"))
    pages = data["pages"]
    ids = [page["id"] for page in pages]
    if len(ids) != len(set(ids)):
        raise ValueError(f"Duplicate source section IDs: {source}")
    for page in pages:
        for block in page["blocks"]:
            if block["type"] not in BLOCK_TYPES:
                raise ValueError(f"Unsupported source block: {block['type']}")

    document = document_id or output.stem
    status = status or data.get("status", "reference")
    passages, gif_blocks = [], []
    source_rel = source.relative_to(ROOT).as_posix()
    root_url = relative_url(ROOT / "index.html", output)
    return_url = root_url + "#interactive?topic=goldbach-involution"

    def prose(text, passage_id, *, allowed, current_status, tag="p", classes="", attrs="", gif_type="paragraph"):
        content, english = inline(text)
        marker = ""
        gif = {"type": gif_type, "text": gif_plain(text)}
        if allowed and current_status == "exact" and english.strip():
            marker = f' data-zyntalic data-passage-id="{esc(passage_id)}"'
            passages.append({"id": passage_id, "english": english, "status": current_status})
            gif["passageId"] = passage_id
            gif["sourceEnglish"] = english
        gif_blocks.append(gif)
        return f'<{tag} class="{esc(classes)}"{marker}{attrs}>{content}</{tag}>'

    # The document title is outside the animation root and remains a stable
    # reading landmark. Section headings inside the root can still reveal.
    title = prose(data["title"], document + "--title", allowed=False,
                  current_status=status, tag="h1", classes="reader-title", gif_type="heading")
    if data.get("subtitle"):
        gif_blocks.append({"type": "caption", "text": data["subtitle"]})
    byline = " · ".join(str(data[key]) for key in ("author", "date") if data.get(key))
    if byline:
        gif_blocks.append({"type": "caption", "text": byline})
    section_html = []
    total_blocks = 0
    for section_index, page in enumerate(pages):
        page_id = page["id"]
        current = section_status(document, status, page_id)
        if page.get("kicker"):
            gif_blocks.append({"type": "caption", "text": page["kicker"]})
        heading = prose(page["title"], f"{document}--{page_id}--title",
                        allowed=page_id not in {"sources", "reading-map", "opening"},
                        current_status=current, tag="h2", classes="reader-section-title", gif_type="heading")
        blocks = []
        for index, block in enumerate(page["blocks"]):
            total_blocks += 1
            typ = block["type"]
            pid = f"{document}--{page_id}--b{index}"
            attrs = f' data-source-block="{index}" data-source-type="{typ}"'
            if typ in {"p", "h"}:
                blocks.append(prose(block["text"], pid, allowed=not is_credit(page_id, block),
                                    current_status=current, tag="h3" if typ == "h" else "p",
                                    classes="reader-subheading" if typ == "h" else "reader-paragraph" + (" reader-small" if block.get("small") else ""),
                                    attrs=attrs, gif_type="heading" if typ == "h" else "paragraph"))
            elif typ == "callout":
                block_status = block.get("status", current)
                label = block.get("label", "Scope")
                gif_blocks.append({"type": "caption", "text": gif_plain(label)})
                text = prose(block["text"], pid, allowed=not is_credit(page_id, block),
                             current_status=block_status if current == "exact" else current,
                             classes="reader-callout-text")
                blocks.append(f'<aside class="reader-callout" data-status="{esc(block_status)}"{attrs}>'
                              f'<p class="reader-callout-label">{inline(label)[0]}</p>{text}</aside>')
            elif typ == "eq":
                latex = block["latex"]
                gif_blocks.append({"type": "math", "text": latex,
                                   **save_math_asset(_math_svg(latex, 18), output)})
                boxed = " reader-boxed-equation" if latex.strip().startswith(r"\boxed{") else ""
                blocks.append(f'<div class="reader-equation{boxed}" data-latex="{esc(latex)}"{attrs}>'
                              f'<div class="reader-equation-scroll">{math_svg(latex, pid)}</div>'
                              f'{source_disclosure(latex)}</div>')
            elif typ == "matrix":
                latex = block.get("label", "") + r"\begin{pmatrix}" + r" \\ ".join(
                    " & ".join(row) for row in block["cells"]) + r"\end{pmatrix}" + block.get("tail", "")
                gif_blocks.append({"type": "math", "text": latex, **matrix_asset(block, output)})
                label = math_svg(block["label"], pid + "-label") if block.get("label") else ""
                rows = []
                for row_index, row in enumerate(block["cells"]):
                    cells = []
                    for cell_index, cell in enumerate(row):
                        cells.append(f'<td data-latex="{esc(cell)}">{math_svg(cell, pid + f"-{row_index}-{cell_index}")}</td>')
                    rows.append("<tr>" + "".join(cells) + "</tr>")
                tail = math_svg(block["tail"], pid + "-tail") if block.get("tail") else ""
                blocks.append(f'<div class="reader-equation reader-matrix-block" data-latex="{esc(latex)}"{attrs}>'
                              f'<div class="reader-matrix-expression">{label}<table class="reader-matrix" aria-label="Matrix">'
                              f'<tbody>{"".join(rows)}</tbody></table>{tail}</div>{source_disclosure(latex)}</div>')
            elif typ == "table":
                headers = "".join(f'<th scope="col">{inline(cell)[0]}</th>' for cell in block["headers"])
                gif_blocks.append({"type": "caption", "text": " | ".join(gif_plain(cell) for cell in block["headers"])})
                rows = []
                for row in block["rows"]:
                    rows.append("<tr>" + "".join(f"<td>{inline(cell)[0]}</td>" for cell in row) + "</tr>")
                    gif_blocks.append({"type": "paragraph", "text": " | ".join(gif_plain(cell) for cell in row)})
                blocks.append(f'<div class="reader-table-scroll"{attrs}><table class="reader-table">'
                              f'<thead><tr>{headers}</tr></thead><tbody>{"".join(rows)}</tbody></table></div>')
            elif typ == "link":
                label = plain(block["text"])
                href = migrate_url(block["url"])
                gif_blocks.append({"type": "caption", "text": f"{label}: {href}"})
                blocks.append(f'<p class="reader-source-link"{attrs}><a href="{esc(href)}">{inline(block["text"])[0]}</a></p>')
            elif typ == "image":
                image_url = block["path"]
                if not urlsplit(image_url).scheme and not image_url.startswith("/"):
                    image_url = relative_url((source.parent / image_url).resolve(), output)
                image = f'<img src="{esc(image_url)}" alt="{esc(block["alt"])}" loading="lazy">'
                if block.get("link_url"):
                    image = f'<a href="{esc(migrate_url(block["link_url"]))}">{image}</a>'
                image_block = {"type": "caption", "text": block["alt"], "image": image_url, "alt": block["alt"]}
                if not urlsplit(image_url).scheme and not image_url.startswith("/"):
                    with Image.open((output.parent / image_url).resolve()) as picture:
                        image_block.update({"width": picture.width, "height": picture.height})
                gif_blocks.append(image_block)
                blocks.append(f'<figure class="reader-figure"{attrs}>{image}<figcaption>{html.escape(block["alt"])}</figcaption></figure>')
        section_html.append(
            f'<section class="reader-section" id="{esc(page_id)}" data-source-page="{esc(page_id)}" '
            f'data-source-index="{section_index}" data-source-status="{esc(current)}">'
            f'<span id="page-{section_index + 1}" class="reader-page-anchor" aria-hidden="true"></span>'
            f'<p class="reader-kicker">{html.escape(page.get("kicker", ""))}</p>{heading}'
            + "\n".join(blocks) + "</section>"
        )

    toc = "".join(f'<li><a href="#{esc(page["id"])}">{html.escape(page["title"])}</a></li>' for page in pages)
    config = {
        "id": document, "entryId": document, "title": data["title"], "status": status,
        "kind": kind, "root": "#reader-content", "controls": "#reader-tools",
        "sourceLabel": "Complete structured source", "sourceUrl": relative_url(source, output),
        "logoSrc": relative_url(ROOT / "assets/logo-encapsulatorp-512.png", output),
        "returnUrl": return_url, "passages": passages, "gifBlocks": gif_blocks,
    }
    metadata = {key: value for key, value in data.items() if key != "pages"}
    source_md = source.with_suffix(".md")
    md_link = (f' · <a href="{esc(relative_url(source_md, output))}">Markdown source</a>'
               if source_md.exists() else "")
    status_label = data.get("statusLabel") or {
        "reference": "Complete collection · evidence labels preserved",
        "review": "Scope and source review", "exact": "Exact under the stated hypotheses",
        "conditional": "Conditional · assumptions remain part of the statement",
    }.get(status, status)
    css = relative_url(ROOT / "assets/atlas-reader.css", output)
    reveal_css = relative_url(ROOT / "assets/atlas-reveal.css", output)
    gif_js = relative_url(ROOT / "assets/atlas-gif.js", output)
    reveal_js = relative_url(ROOT / "assets/atlas-reveal.js?v=unify-1", output)
    wordmark_js = relative_url(ROOT / "assets/pq-wordmark.js", output)
    collection = relative_url(ROOT / "atlas/README.html", output)
    board = relative_url(ROOT / "treasure-hunt/index.html", output)
    complete_sections = "\n".join(section_html)
    output.write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{esc(data.get('subtitle') or data['title'])}">
<meta name="color-scheme" content="light"><link rel="canonical" href="https://encapsulatorp.github.io/{esc(output.relative_to(ROOT).as_posix())}">
<title>{html.escape(data['title'])} · EncapsulatorP</title>
{REVEAL_PREPAINT}
<link rel="stylesheet" href="{esc(css)}"><link rel="stylesheet" href="{esc(reveal_css)}">
<script src="{esc(wordmark_js)}?v=violet-unify-1" defer></script>
</head><body class="atlas-reader" data-reader-status="{esc(status)}">
<a class="reader-skip" data-reader-chrome href="#reader-content">Skip to the complete text</a>
<div class="reader-shell"><header class="reader-header">
<a class="reader-brand" data-reader-chrome href="{esc(return_url)}"><img src="{esc(config['logoSrc'])}" alt="EncapsulatorP" width="64" height="64"></a>
<nav class="reader-nav" data-reader-chrome aria-label="Reading routes"><a href="{esc(return_url)}">Interactive space</a><a href="{esc(collection)}">Complete atlas</a><a href="{esc(board)}">Proof board</a></nav>
<div data-reader-reveal>
<p class="reader-kicker">ENCAPSULATORP · {html.escape(status_label)}</p>{title}
{('<p class="reader-subtitle">' + html.escape(data['subtitle']) + '</p>') if data.get('subtitle') else ''}
<p class="reader-byline">{html.escape(byline)}</p>
</div>
<div id="reader-tools" class="reader-toolbar reader-tools" data-reader-chrome aria-label="Reading and export controls"></div>
<noscript><p>The complete English text and formulas below are available without JavaScript.</p></noscript>
<details class="reader-contents" data-reader-reveal><summary>Contents · {len(pages)} sections</summary><ol>{toc}</ol></details>
</header>
<main id="reader-content" class="reader-content reader-document" data-source-document="{esc(source_rel)}">
{complete_sections}
</main><footer class="reader-footer"><p data-reader-chrome><a href="{esc(relative_url(source, output))}">Structured source</a>{md_link}</p>
<details class="reader-provenance" data-reader-reveal data-archival-provenance><summary>Credits and source-version record</summary><pre>{html.escape(json.dumps(metadata, ensure_ascii=False, indent=2))}</pre></details>
<p data-reader-chrome><a href="{esc(return_url)}">Return to the interactive space</a></p></footer></div>
<script type="application/json" id="reader-source">{script_json(data)}</script>
<script type="application/json" id="reader-config">{script_json(config)}</script>
<script src="{esc(gif_js)}" defer></script><script src="{esc(reveal_js)}" defer></script>
</body></html>
''', encoding="utf-8")
    return {"path": output.relative_to(ROOT).as_posix(), "source": source_rel,
            "sections": len(pages), "blocks": total_blocks, "passages": len(passages), "status": status}
