#!/usr/bin/env python3
"""Build the treasure note and its Markdown mirror from one JSON source.

Matplotlib lays out math and ReportLab draws sharp vector glyph outlines. Each
display equation also carries its complete LaTeX source as one invisible text
run and PDF ActualText, preserving nested powers, primes and summation limits
when copied or extracted. No TeX installation is required.

Install: python -m pip install -r atlas/logistic-pdf-requirements.txt
Build:   python atlas/build_logistic_vanishing_pdf.py
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import sys
from functools import lru_cache
from pathlib import Path
from xml.sax.saxutils import escape, quoteattr

import matplotlib

matplotlib.use("Agg")
matplotlib.rcParams.update({"mathtext.fontset": "dejavuserif", "mathtext.default": "it"})
from matplotlib.font_manager import FontProperties, findfont
from matplotlib.mathtext import MathTextParser
from fontTools.pens.reportLabPen import ReportLabPen
from fontTools.ttLib import TTFont as OutlineFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.pdfgen.pathobject import PDFPathObject
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, PageBreak, PageTemplate, Paragraph,
    Spacer, Table, TableStyle,
)


BASE = Path(__file__).resolve().parent
PAPER = colors.white
ORANGE = colors.HexColor("#F36B21")
YELLOW = colors.HexColor("#F6C945")
GREEN = colors.HexColor("#77B443")
HEADING = colors.HexColor("#27312B")
LINK_HEX = "#8C3A0B"
INK = colors.HexColor("#202520")
MUTED = colors.HexColor("#62685F")
RULE = colors.HexColor("#DDE3DA")
PALE_ORANGE = colors.HexColor("#FFF8EE")
TABLE_HEAD = colors.HexColor("#F1F4EC")
# Evidence states are written explicitly; color is a secondary reading aid.
STATUS = {
    "exact": ("#245C38", "#F4F8F1"),
    "conditional": ("#7B510E", "#FFF9E9"),
    "open": ("#515A52", "#F5F6F3"),
}
MATH = MathTextParser("path")


def braced_fractions(source: str) -> str:
    """Expand TeX's single-token fraction arguments into MathText's syntax."""
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
        arg_start = start + match.end()
        numerator, next_pos = argument(arg_start)
        denominator, end = argument(next_pos)
        parts += [source[start:first], r"\frac", numerator, denominator]
        start = end
    return "".join(parts) + source[start:]


def register_fonts() -> None:
    for family, prefix in (("DejaVu Serif", "Body"), ("DejaVu Sans", "Sans")):
        for suffix, weight, style in (
            ("", "normal", "normal"), ("Bold", "bold", "normal"),
            ("Italic", "normal", "italic"), ("BoldItalic", "bold", "italic"),
        ):
            path = findfont(FontProperties(family=family, weight=weight, style=style),
                            fallback_to_default=False)
            pdfmetrics.registerFont(TTFont(prefix + suffix, path))
        pdfmetrics.registerFontFamily(prefix, normal=prefix, bold=prefix + "Bold",
                                     italic=prefix + "Italic", boldItalic=prefix + "BoldItalic")
    pdfmetrics.registerFont(TTFont("Mono", findfont(FontProperties(family="DejaVu Sans Mono"))))


@lru_cache(maxsize=64)
def glyph_font(path: str) -> str:
    name = "Math_" + hashlib.sha256(path.encode()).hexdigest()[:12]
    pdfmetrics.registerFont(TTFont(name, path))
    return name


@lru_cache(maxsize=1024)
def parse_math(latex: str, size: float = 14.0):
    source = latex.strip()
    if source.startswith("$$") and source.endswith("$$"):
        source = source[2:-2].strip()
    elif source.startswith("$") and source.endswith("$"):
        source = source[1:-1].strip()
    # MathText does not implement this visual wrapper; Equation draws its box.
    if source.startswith(r"\boxed{") and source.endswith("}"):
        source = source[len(r"\boxed{"):-1]
    source = re.sub(r"\\le(?![A-Za-z])", r"\\leq", source)
    source = re.sub(r"\\ge(?![A-Za-z])", r"\\geq", source)
    source = braced_fractions(source)
    if not source:
        return None
    try:
        return MATH.parse("$" + source + "$", dpi=72,
                          prop=FontProperties(family="DejaVu Serif", size=size))
    except ValueError as exc:
        raise ValueError(f"Unsupported equation {latex!r}: {exc}") from exc


class _CanvasGlyphPen(ReportLabPen):
    """Adapt fontTools' quadratic-to-cubic pen to a PDF canvas path."""

    def _closePath(self):
        self.path.close()


@lru_cache(maxsize=64)
def _outline_font(path: str):
    font = OutlineFont(path)
    return font.getGlyphSet(), font.getBestCmap(), font["head"].unitsPerEm


@lru_cache(maxsize=4096)
def _glyph_outline(path: str, number: int):
    glyphs, cmap, units = _outline_font(path)
    if number not in cmap:
        raise ValueError(f"Math font {path!r} has no glyph for U+{number:04X}")
    pen = _CanvasGlyphPen(glyphs, path=PDFPathObject())
    glyphs[cmap[number]].draw(pen)
    return pen.path, units


def _paint_math_outlines(canvas: Canvas, parsed, x: float, baseline: float) -> None:
    """Draw the same font glyphs/positions without fragmented PDF text."""
    if parsed is None:
        return
    for font, size, number, gx, gy in parsed.glyphs:
        path, units = _glyph_outline(font.fname, number)
        canvas.saveState()
        canvas.translate(x + float(gx), baseline + float(gy))
        canvas.scale(float(size) / units, float(size) / units)
        canvas.drawPath(path, stroke=0, fill=1, fillMode=1)
        canvas.restoreState()
    for rx, ry, width, height in parsed.rects:
        canvas.rect(x + float(rx), baseline + float(ry),
                    float(width), float(height), stroke=0, fill=1)


def _semantic_math_text(canvas: Canvas, latex: str, x: float, baseline: float,
                        width: float) -> None:
    """Supply one unambiguous text representation for the visible formula.

    ActualText is respected by Poppler and current MuPDF, but not by pypdf.
    The matching invisible text run therefore provides the same source to all
    three. It is placed over the displayed equation, not off the page. This is
    a copy/extraction aid, not a claim of complete PDF/UA tagging.
    """
    source = " ".join(latex.strip().strip("$").split())
    text = r"\(" + source + r"\)"
    actual = "FEFF" + text.encode("utf-16-be").hex().upper()
    canvas._code.append(f"/Span << /ActualText <{actual}> >> BDC")
    run = canvas.beginText(x, baseline)
    run.setFont("Mono", 10)
    run.setHorizScale(min(100, max(width, 1) / pdfmetrics.stringWidth(text, "Mono", 10) * 100))
    run.setTextRenderMode(3)
    run.textOut(text)
    canvas.drawText(run)
    canvas._code.append("EMC")


def paint_math(canvas: Canvas, parsed, x: float, baseline: float,
               latex: str | None = None) -> None:
    """Draw math; supply latex to preserve its logical text representation.

    The four-argument API remains available to existing canvas illustrations.
    Equation and Matrix use outlines plus complete semantic LaTeX text.
    """
    if parsed is None:
        return
    if latex is not None:
        canvas._code.append("/Artifact BMC")
        _paint_math_outlines(canvas, parsed, x, baseline)
        canvas._code.append("EMC")
        _semantic_math_text(canvas, latex, x, baseline, float(parsed.width))
        return
    for font, size, number, gx, gy in parsed.glyphs:
        canvas.setFont(glyph_font(font.fname), size)
        canvas.drawString(x + float(gx), baseline + float(gy), chr(number))
    for rx, ry, width, height in parsed.rects:
        canvas.rect(x + float(rx), baseline + float(ry),
                    float(width), float(height), stroke=0, fill=1)


class Equation(Flowable):
    """One centered equation, with a readable minimum base size of 10 pt."""

    def __init__(self, latex: str, size: float = 14.0):
        super().__init__()
        self.latex, self.size = latex, size
        self.boxed = latex.strip().strip("$").startswith(r"\boxed{")
        self.parsed = parse_math(latex, size)
        self.spaceBefore, self.spaceAfter = 2, 5

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        natural = float(self.parsed.width) if self.parsed else 0
        self.scale = min(1, (availWidth - (20 if self.boxed else 0)) / max(natural, 1))
        if self.scale * self.size < 10:
            raise ValueError(f"Equation would be smaller than 10 pt; split it: {self.latex}")
        self.height = (float(self.parsed.height) if self.parsed else 0) * self.scale + 8
        return self.width, self.height

    def draw(self):
        if self.parsed is None:
            return
        c = self.canv
        c.saveState()
        if self.boxed:
            c.setFillColor(PALE_ORANGE)
            c.setStrokeColor(ORANGE)
            c.setLineWidth(.5)
            w = float(self.parsed.width) * self.scale + 18
            c.roundRect((self.width - w) / 2, 0, w, self.height, 3, fill=1, stroke=1)
        c.setFillColor(INK)
        c.translate((self.width - float(self.parsed.width) * self.scale) / 2, 4)
        c.scale(self.scale, self.scale)
        paint_math(c, self.parsed, 0, float(self.parsed.depth), self.latex)
        c.restoreState()


class Matrix(Flowable):
    """Vector cells and hand-drawn parentheses; no unsupported TeX environment."""

    def __init__(self, label: str, cells: list[list[str]], tail: str = ""):
        super().__init__()
        if not cells or not cells[0] or any(len(row) != len(cells[0]) for row in cells):
            raise ValueError("A matrix must have a nonempty rectangular cells array")
        self.size = 14.0
        self.latex = (label + r"\begin{pmatrix}" +
                      r" \\ ".join(" & ".join(str(value) for value in row) for row in cells) +
                      r"\end{pmatrix}" + tail)
        self.label, self.tail = parse_math(label, self.size), parse_math(tail, self.size)
        self.cells = [[parse_math(str(value), self.size) for value in row] for row in cells]
        if any(cell is None for row in self.cells for cell in row):
            raise ValueError("Matrix cells cannot be empty")
        self.cols = [max(float(row[j].width) for row in self.cells)
                     for j in range(len(self.cells[0]))]
        self.rows = [max(float(cell.height) for cell in row) for row in self.cells]
        self.colgap, self.rowgap, self.pad = 17, 9, 9
        self.matrix_w = sum(self.cols) + self.colgap * (len(self.cols) - 1) + 2 * self.pad + 10
        self.matrix_h = sum(self.rows) + self.rowgap * (len(self.rows) - 1) + 6
        self.label_w = float(self.label.width) + 9 if self.label else 0
        self.tail_w = float(self.tail.width) + 9 if self.tail else 0
        self.natural_w = self.label_w + self.matrix_w + self.tail_w
        self.natural_h = max(self.matrix_h, float(self.label.height) if self.label else 0,
                             float(self.tail.height) if self.tail else 0)
        self.spaceBefore, self.spaceAfter = 4, 8

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        self.scale = min(1, availWidth / self.natural_w)
        if self.scale * self.size < 10:
            raise ValueError("Matrix would be smaller than 10 pt; shorten its label or tail")
        self.height = self.natural_h * self.scale + 12
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(INK)
        c.setStrokeColor(INK)
        c.translate((self.width - self.natural_w * self.scale) / 2, 6)
        c.scale(self.scale, self.scale)
        c._code.append("/Artifact BMC")
        center = self.natural_h / 2
        if self.label:
            _paint_math_outlines(c, self.label, 0, center - float(self.label.height) / 2 + float(self.label.depth))
        mx, my = self.label_w, center - self.matrix_h / 2
        c.setLineWidth(0.8)
        for left in (True, False):
            x = mx if left else mx + self.matrix_w
            sign = 1 if left else -1
            path = c.beginPath()
            path.moveTo(x + sign * 5, my + self.matrix_h)
            path.curveTo(x - sign, my + self.matrix_h * .82,
                         x - sign, my + self.matrix_h * .18, x + sign * 5, my)
            c.drawPath(path)
        top = my + self.matrix_h - 3
        for row, height in zip(self.cells, self.rows):
            x = mx + self.pad + 5
            bottom = top - height
            for cell, width in zip(row, self.cols):
                _paint_math_outlines(c, cell, x + (width - float(cell.width)) / 2,
                           bottom + (height - float(cell.height)) / 2 + float(cell.depth))
                x += width + self.colgap
            top = bottom - self.rowgap
        if self.tail:
            _paint_math_outlines(c, self.tail, mx + self.matrix_w + 9,
                       center - float(self.tail.height) / 2 + float(self.tail.depth))
        c._code.append("EMC")
        _semantic_math_text(c, self.latex, 0, center, self.natural_w)
        c.restoreState()


class LinkedFigure(Flowable):
    """A sharp still image whose PDF link opens the matching browser animation."""

    def __init__(self, path: Path, link_url: str | None = None, max_height: float = 470):
        super().__init__()
        self.reader = ImageReader(str(path))
        self.image_width, self.image_height = self.reader.getSize()
        self.link_url, self.max_height = link_url, max_height
        self.spaceBefore, self.spaceAfter = 4, 10

    def wrap(self, availWidth, availHeight):
        scale = min(availWidth / self.image_width, self.max_height / self.image_height)
        self.width = availWidth
        self.draw_width = self.image_width * scale
        self.height = self.image_height * scale
        return self.width, self.height

    def draw(self):
        x = (self.width - self.draw_width) / 2
        self.canv.drawImage(self.reader, x, 0, width=self.draw_width,
                            height=self.height, mask="auto")
        if self.link_url:
            self.canv.linkURL(self.link_url, (x, 0, x + self.draw_width, self.height),
                              relative=1, thickness=0)


class Bookmark(Flowable):
    def __init__(self, key: str, title: str):
        super().__init__()
        self.key, self.title = key, title
        self.width = self.height = 0

    def draw(self):
        self.canv.bookmarkPage(self.key)
        self.canv.addOutlineEntry(self.title, self.key, level=0, closed=False)


def styles() -> dict[str, ParagraphStyle]:
    body = ParagraphStyle("Body", fontName="Body", fontSize=10.3, leading=14.3,
                          textColor=INK, spaceAfter=7, allowWidows=0, allowOrphans=0)
    return {
        "p": body,
        "small": ParagraphStyle("Small", parent=body, fontSize=10, leading=14, spaceAfter=7),
        "h": ParagraphStyle("Heading", parent=body, fontName="SansBold", fontSize=12.2,
                            leading=17, textColor=HEADING, spaceBefore=9, spaceAfter=6, keepWithNext=1),
        "title": ParagraphStyle("Title", fontName="SansBold", fontSize=22, leading=28,
                                textColor=INK, spaceAfter=12, keepWithNext=1),
        "kicker": ParagraphStyle("Kicker", fontName="SansBold", fontSize=8.7, leading=12,
                                 textColor=HEADING, spaceAfter=8, keepWithNext=1),
        "subtitle": ParagraphStyle("Subtitle", parent=body, fontSize=11.2, leading=17, spaceAfter=13),
        "meta": ParagraphStyle("Metadata", fontName="Sans", fontSize=9.1, leading=13,
                               textColor=MUTED, spaceAfter=5),
        "cell": ParagraphStyle("Cell", parent=body, fontSize=10, leading=13.5, spaceAfter=0),
        "th": ParagraphStyle("TableHeading", fontName="SansBold", fontSize=10, leading=13,
                             textColor=INK),
        "callout": ParagraphStyle("Callout", parent=body, spaceAfter=0),
    }


def make_table(block: dict, width: float, st: dict) -> Table:
    headers, rows = block["headers"], block["rows"]
    if not headers or any(len(row) != len(headers) for row in rows):
        raise ValueError("Table rows must have the same number of cells as headers")
    weights = block.get("widths", [1] * len(headers))
    if len(weights) != len(headers) or any(float(w) <= 0 for w in weights):
        raise ValueError("Table widths must contain one positive fraction per column")
    padding = float(block.get("padding", 6))
    if padding < 0:
        raise ValueError("Table padding cannot be negative")
    widths = [width * float(w) / sum(weights) for w in weights]
    data = [[Paragraph(str(value), st["th"]) for value in headers]]
    data += [[Paragraph(str(value), st["cell"]) for value in row] for row in rows]
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT",
                  spaceBefore=5, spaceAfter=9, splitByRow=1)
    table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Body"),
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEAD),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [PAPER, colors.HexColor("#FAFBF8")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), padding), ("BOTTOMPADDING", (0, 0), (-1, -1), padding),
        ("LINEBELOW", (0, 0), (-1, 0), .6, ORANGE),
        ("LINEBELOW", (0, 1), (-1, -1), .35, RULE),
    ]))
    return table


def make_callout(block: dict, width: float, st: dict) -> Table:
    status = block.get("status", "open")
    if status not in STATUS:
        raise ValueError(f"Unknown callout status: {status}")
    edge, fill = STATUS[status]
    heading = f'<font face="SansBold" color="{edge}" size="9">{escape(status.upper())} / {escape(block["label"])}</font>'
    content = [Paragraph(heading, st["callout"]), Spacer(1, 4), Paragraph(block["text"], st["callout"])]
    table = Table([[content]], colWidths=[width], spaceBefore=7, spaceAfter=9, splitInRow=0)
    table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Body"),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(fill)),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, colors.HexColor(edge)),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return table


def accent_gradient(canvas: Canvas, x: float, y: float,
                    width: float, height: float) -> None:
    """A real vector orange-yellow-green gradient, confined to its rectangle."""
    canvas.saveState()
    clip = canvas.beginPath()
    clip.rect(x, y, width, height)
    canvas.clipPath(clip, stroke=0)
    canvas.linearGradient(x, y, x + width, y, [ORANGE, YELLOW, GREEN],
                          positions=[0, .48, 1], extend=False)
    canvas.restoreState()


def page_decoration(canvas: Canvas, doc: BaseDocTemplate) -> None:
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    # Color stays in restrained page accents; the reading surface is white.
    accent_gradient(canvas, 0, height - 5, width, 5)
    canvas.setFillColor(MUTED)
    canvas.setFont("SansBold", 8)
    canvas.drawString(doc.leftMargin, height - 37, "ENCAPSULATORP  /  MATHEMATICAL NOTES")
    accent_gradient(canvas, width - doc.rightMargin - 72, height - 35, 72, 2)
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(.5)
    canvas.line(doc.leftMargin, 40, width - doc.rightMargin, 40)
    canvas.setFillColor(MUTED)
    canvas.setFont("Sans", 8)
    canvas.drawString(doc.leftMargin, 25, "Logistic vanishing terms • EncapsulatorP")
    canvas.setFillColor(HEADING)
    canvas.setFont("SansBold", 8.5)
    canvas.drawRightString(width - doc.rightMargin, 25, f"{canvas.getPageNumber():02d}")
    canvas.restoreState()


def build_pdf(data: dict, output: Path, asset_base: Path = BASE) -> None:
    register_fonts()
    st = styles()
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(output), pagesize=A4, leftMargin=52, rightMargin=52,
                          topMargin=61, bottomMargin=53, title=data["title"],
                          author=data.get("author", "EncapsulatorP"),
                          subject=data.get("subtitle", "Mathematical treasure note"),
                          pageCompression=1, allowSplitting=1)
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height,
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates(PageTemplate(id="treasure", frames=frame, onPage=page_decoration))
    story, seen = [], set()
    for number, page in enumerate(data["pages"]):
        key = page["id"]
        if not key or key in seen:
            raise ValueError(f"Page bookmark id must be nonempty and unique: {key!r}")
        seen.add(key)
        if number:
            story.append(PageBreak())
        story.append(Bookmark(key, page["title"]))
        if not number:
            story.append(Spacer(1, 17))
        if page.get("kicker"):
            story.append(Paragraph(escape(page["kicker"].upper()), st["kicker"]))
        story.append(Paragraph(escape(page["title"]), st["title"]))
        if not number:
            if data.get("subtitle"):
                story.append(Paragraph(escape(data["subtitle"]), st["subtitle"]))
            meta = "  /  ".join(str(data[k]) for k in ("author", "date") if data.get(k))
            if meta:
                story.append(Paragraph(escape(meta), st["meta"]))
            if data.get("source_commit"):
                story.append(Paragraph('Source commit: <font face="Mono">' + escape(data["source_commit"]) + '</font>', st["meta"]))
            story.append(Spacer(1, 12))
        for index, block in enumerate(page.get("blocks", [])):
            kind = block["type"]
            try:
                if kind == "p":
                    story.append(Paragraph(block["text"], st["small" if block.get("small") else "p"]))
                elif kind == "h":
                    story.append(Paragraph(escape(block["text"]), st["h"]))
                elif kind == "eq":
                    story.append(Equation(block["latex"]))
                elif kind == "matrix":
                    story.append(Matrix(block.get("label", ""), block["cells"], block.get("tail", "")))
                elif kind == "image":
                    story.append(LinkedFigure(asset_base / block["path"],
                                              block.get("link_url"), block.get("max_height", 470)))
                elif kind == "table":
                    story.append(make_table(block, doc.width, st))
                elif kind == "callout":
                    story.append(make_callout(block, doc.width, st))
                elif kind == "link":
                    link = f'<link href={quoteattr(block["url"])} color="{LINK_HEX}"><u>{escape(block["text"])}</u></link>'
                    story.append(Paragraph(link, st["small"]))
                else:
                    raise ValueError(f"Unknown block type: {kind}")
            except Exception as exc:
                raise ValueError(f"Page {key!r}, block {index + 1}: {exc}") from exc
    doc.build(story, canvasmaker=lambda *a, **kw: Canvas(*a, **(kw | {"invariant": 1, "initialFontName": "Sans"})))


def inline_markdown(text: str) -> str:
    text = re.sub(r'<(?:a|link)\b[^>]*href=[\"\']([^\"\']+)[\"\'][^>]*>(.*?)</(?:a|link)>',
                  lambda match: f"[{match[2]}]({html.unescape(match[1])})", text, flags=re.I | re.S)
    text = re.sub(r"</?(?:font|span)\b[^>]*>", "", text, flags=re.I)
    text = re.sub(r"</?(?:b|strong)>", "**", text, flags=re.I)
    text = re.sub(r"</?(?:i|em)>", "*", text, flags=re.I)
    text = re.sub(r"</?u>", "", text, flags=re.I)
    text = re.sub(r"<(\/?)super>", r"<\1sup>", text, flags=re.I)
    text = re.sub(r"<br\s*/?>", "<br>", text, flags=re.I)
    return html.unescape(text)


def build_markdown(data: dict, output: Path) -> None:
    lines = ["# " + data["title"], "", data.get("subtitle", ""), ""]
    lines += ["**" + " / ".join(str(data[k]) for k in ("author", "date") if data.get(k)) + "**", ""]
    if data.get("source_commit"):
        lines += ["Source commit: `" + data["source_commit"] + "`", ""]
    for page in data["pages"]:
        lines += [f'<a id="{html.escape(page["id"], quote=True)}"></a>', "", "## " + page["title"], ""]
        if page.get("kicker"):
            lines += ["*" + page["kicker"] + "*", ""]
        for block in page.get("blocks", []):
            kind = block["type"]
            if kind == "p":
                lines += [inline_markdown(block["text"]), ""]
            elif kind == "h":
                lines += ["### " + block["text"], ""]
            elif kind == "eq":
                lines += ["$$", block["latex"].strip().strip("$"), "$$", ""]
            elif kind == "matrix":
                cells = r" \\ ".join(" & ".join(row) for row in block["cells"])
                latex = block.get("label", "") + r"\begin{pmatrix}" + cells + r"\end{pmatrix}" + block.get("tail", "")
                lines += ["$$", latex, "$$", ""]
            elif kind == "image":
                alt = block.get("alt", "Mathematical illustration").replace("[", r"\[").replace("]", r"\]")
                figure = f'![{alt}]({block["path"]})'
                if block.get("link_url"):
                    figure = f'[{figure}]({block["link_url"]})'
                lines += [figure, ""]
            elif kind == "callout":
                text = inline_markdown(block["text"]).replace("\n", "\n> ")
                lines += [f'> **{block["label"]} ({block.get("status", "open")}).** {text}', ""]
            elif kind == "link":
                lines += [f'[{block["text"]}]({block["url"]})', ""]
            elif kind == "table":
                def row(values):
                    return "| " + " | ".join(inline_markdown(str(v)).replace("|", r"\|").replace("\n", "<br>") for v in values) + " |"
                lines += [row(block["headers"]), row(["---"] * len(block["headers"]))]
                lines += [row(values) for values in block["rows"]] + [""]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=BASE / "logistic-vanishing-terms.json", help="JSON content source")
    parser.add_argument("--pdf", type=Path, default=BASE / "logistic-vanishing-terms.pdf", help="Output PDF path")
    parser.add_argument("--markdown", type=Path, default=BASE / "logistic-vanishing-terms.md", help="Output Markdown mirror path")
    args = parser.parse_args()
    try:
        data = json.loads(args.input.read_text(encoding="utf-8"))
        if not data.get("title") or not data.get("pages"):
            raise ValueError("Input requires a title and a nonempty pages array")
        build_pdf(data, args.pdf, asset_base=args.input.resolve().parent)
        build_markdown(data, args.markdown)
    except (OSError, ValueError, KeyError) as exc:
        parser.exit(2, f"Build failed: {exc}\n")
    print(f"PDF: {args.pdf}\nMarkdown: {args.markdown}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
