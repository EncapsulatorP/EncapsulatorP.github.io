#!/usr/bin/env python3
"""Render the complete Atlas README as a linked, bookmarked reading PDF.

Requires Python 3, ReportLab, Pandoc and the DejaVu fonts. On Ubuntu:
  sudo apt-get install pandoc fonts-dejavu-core
  python3 -m pip install -r atlas/pdf-requirements.txt
  python3 atlas/build_catalog.py
  python3 atlas/build_pdf.py

The Markdown remains the content source. This renderer does not change claims,
run mathematical experiments, or replace the site's interactive exhibits.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urljoin

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, HRFlowable, KeepTogether,
    PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle, XPreformatted,
)
from reportlab.platypus.tableofcontents import TableOfContents

BASE_URL = "https://encapsulatorp.github.io/atlas/README.md"
INK = colors.HexColor("#193C3E")
TEAL = colors.HexColor("#286963")
MUTED = colors.HexColor("#566B69")
PAPER = colors.HexColor("#F6F4ED")
LINE = colors.HexColor("#CED8CF")
GOLD = colors.HexColor("#AB793D")
WIDTH, HEIGHT = A4
MARGIN = 48
FRAME_WIDTH = WIDTH - 2 * MARGIN


def normalize(text):
    return re.sub("[\u2010-\u2014]", "-", text)


def plain(nodes):
    parts = []
    for node in nodes:
        t, c = node["t"], node.get("c")
        if t == "Str":
            parts.append(c)
        elif t in ("Space", "SoftBreak", "LineBreak"):
            parts.append(" ")
        elif t in ("Strong", "Emph", "Strikeout"):
            parts.append(plain(c))
        elif t == "Code":
            parts.append(c[1])
        elif t == "Link":
            parts.append(plain(c[1]))
        elif t == "RawInline":
            pass
        else:
            raise ValueError(f"Unsupported inline node: {t}")
    return normalize("".join(parts))


def inline(nodes):
    parts = []
    for node in nodes:
        t, c = node["t"], node.get("c")
        if t == "Str":
            parts.append(html.escape(normalize(c)))
        elif t in ("Space", "SoftBreak"):
            parts.append(" ")
        elif t == "LineBreak":
            parts.append("<br/>")
        elif t == "Strong":
            parts.append("<b>" + inline(c) + "</b>")
        elif t == "Emph":
            parts.append("<i>" + inline(c) + "</i>")
        elif t == "Code":
            parts.append('<font name="AtlasMono">' + html.escape(normalize(c[1])) + "</font>")
        elif t == "Link":
            url = c[2][0]
            url = url if url.startswith("#") else urljoin(BASE_URL, url)
            parts.append('<link href="' + html.escape(url, quote=True)
                         + '" color="#286963">' + inline(c[1]) + "</link>")
        elif t == "RawInline":
            if not re.fullmatch(r'</?a(?: id="[^"]+")?>', c[1]):
                raise ValueError(f"Unexpected raw inline: {c[1]}")
        else:
            raise ValueError(f"Unsupported inline node: {t}")
    return "".join(parts)


def register_fonts(font_dir):
    files = {
        "AtlasSans": "DejaVuSans.ttf", "AtlasSans-Bold": "DejaVuSans-Bold.ttf",
        "AtlasSans-Italic": "DejaVuSans-Oblique.ttf", "AtlasSans-BoldItalic": "DejaVuSans-BoldOblique.ttf",
        "AtlasSerif": "DejaVuSerif.ttf", "AtlasSerif-Bold": "DejaVuSerif-Bold.ttf",
        "AtlasMono": "DejaVuSansMono.ttf",
    }
    for name, filename in files.items():
        path = font_dir / filename
        if not path.is_file():
            raise FileNotFoundError(f"Missing {path}; provide --font-dir with the DejaVu TTF fonts.")
        pdfmetrics.registerFont(TTFont(name, str(path)))
    pdfmetrics.registerFontFamily("AtlasSans", normal="AtlasSans", bold="AtlasSans-Bold",
                                  italic="AtlasSans-Italic", boldItalic="AtlasSans-BoldItalic")
    pdfmetrics.registerFontFamily("AtlasSerif", normal="AtlasSerif", bold="AtlasSerif-Bold",
                                  italic="AtlasSerif", boldItalic="AtlasSerif-Bold")
    pdfmetrics.registerFontFamily("AtlasMono", normal="AtlasMono", bold="AtlasMono",
                                  italic="AtlasMono", boldItalic="AtlasMono")


def styles():
    body = ParagraphStyle("Body", fontName="AtlasSans", fontSize=10.2, leading=14.9,
                          textColor=INK, spaceAfter=8, allowWidows=0, allowOrphans=0)
    return {
        "body": body,
        "title": ParagraphStyle("Title", parent=body, fontName="AtlasSerif", fontSize=24,
                                leading=28.5, spaceBefore=7, spaceAfter=14, keepWithNext=True),
        "kicker": ParagraphStyle("Kicker", parent=body, fontName="AtlasSans-Bold", fontSize=8,
                                 leading=11, textColor=TEAL, spaceAfter=4, keepWithNext=True),
        "origin": ParagraphStyle("Origin", parent=body, fontSize=8.5, leading=12,
                                 textColor=MUTED, spaceAfter=12, keepWithNext=True),
        "label": ParagraphStyle("Label", parent=body, fontSize=8.4, leading=12.3,
                                backColor=colors.HexColor("#EAF0E7"), borderPadding=7,
                                spaceBefore=2, spaceAfter=12, keepWithNext=True),
        "source": ParagraphStyle("Source", parent=body, fontSize=8.4, leading=11.7,
                                 spaceAfter=3, leftIndent=10, firstLineIndent=-10),
        "related": ParagraphStyle("Related", parent=body, fontSize=8.1, leading=11.5,
                                  spaceBefore=7, spaceAfter=0, textColor=MUTED),
        "question": ParagraphStyle("Question", parent=body, fontSize=9.5, leading=13.8,
                                   backColor=colors.HexColor("#F5EFE2"), borderPadding=9,
                                   spaceBefore=12, spaceAfter=14),
        "sources_heading": ParagraphStyle("SourcesHeading", parent=body, fontSize=8.3,
                                          leading=11, spaceBefore=4, spaceAfter=4, keepWithNext=True),
        "code": ParagraphStyle("Code", parent=body, fontName="AtlasMono", fontSize=8.8,
                               leading=13.5, backColor=colors.HexColor("#EFF3ED"),
                               borderPadding=11, spaceBefore=14, spaceAfter=17),
        "small": ParagraphStyle("Small", parent=body, fontSize=8.5, leading=12.4, textColor=MUTED),
    }


class Cover(Flowable):
    def __init__(self, intro, credit, edition, count, style):
        super().__init__()
        self.width, self.height = FRAME_WIDTH, HEIGHT - 110
        self.intro, self.credit, self.edition, self.count, self.style = intro, credit, edition, count, style

    def paragraph(self, text, style, x, top, width):
        p = Paragraph(text, style)
        _, h = p.wrap(width, self.height)
        p.drawOn(self.canv, x, top - h)
        return top - h

    def draw(self):
        c, h = self.canv, self.height
        c.setFillColor(TEAL)
        c.setFont("AtlasSans-Bold", 9)
        c.drawString(0, h - 25, "ENCAPSULATORP / READING EDITION")
        c.setStrokeColor(LINE)
        c.line(0, h - 43, self.width, h - 43)
        c.setFillColor(INK)
        c.setFont("AtlasSerif", 53)
        c.drawString(-2, h - 130, "Research")
        c.setFont("AtlasSerif", 67)
        c.drawString(-3, h - 209, "atlas")
        c.setFont("AtlasSans", 10)
        c.setFillColor(MUTED)
        c.drawString(0, h - 239, f"{self.count} entries / equations / evidence / connected threads")
        c.setFillColor(TEAL)
        c.setFont("AtlasSans-Bold", 9.5)
        c.drawString(0, h - 267, self.edition)
        top = self.paragraph(self.intro, self.style["body"], 0, h - 310, self.width - 18)
        top = self.paragraph('<link href="https://encapsulatorp.github.io/#atlas" color="#286963">'
                             'Open the interactive atlas</link>', self.style["body"], 0, top - 16, self.width)
        c.setStrokeColor(LINE)
        c.line(0, 148, self.width, 148)
        self.paragraph(self.credit, self.style["small"], 0, 130, self.width)
        self.paragraph('<link href="' + BASE_URL + '" color="#286963">Original Markdown reading copy</link>',
                       self.style["small"], 0, 38, self.width)


class AtlasDocument(BaseDocTemplate):
    def __init__(self, path, edition, **kwargs):
        super().__init__(str(path), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                         topMargin=60, bottomMargin=50, title="EncapsulatorP - Research atlas",
                         author="Zolton / EncapsulatorP; ChatGPT", subject="Complete research atlas reading edition",
                         creator="EncapsulatorP atlas/build_pdf.py", **kwargs)
        self.edition = edition
        self.entry_pages = {}
        frame = Frame(MARGIN, 50, FRAME_WIDTH, HEIGHT - 110, leftPadding=0, rightPadding=0,
                      topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="Atlas", frames=frame, onPage=self.chrome))

    def chrome(self, c, doc):
        c.saveState()
        c.setFillColor(PAPER if doc.page == 1 else colors.white)
        c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
        if doc.page != 1:
            c.setFillColor(MUTED)
            c.setFont("AtlasSans", 7.5)
            c.drawString(MARGIN, HEIGHT - 32, "ENCAPSULATORP / RESEARCH ATLAS")
            c.drawRightString(WIDTH - MARGIN, HEIGHT - 32, self.edition)
            c.setStrokeColor(LINE)
            c.line(MARGIN, HEIGHT - 42, WIDTH - MARGIN, HEIGHT - 42)
            c.line(MARGIN, 37, WIDTH - MARGIN, 37)
            c.drawString(MARGIN, 23, "Reading edition - source links remain live")
            c.setFillColor(TEAL)
            c.drawRightString(WIDTH - MARGIN - 37, 23, "Contents")
            c.linkRect("Contents", "contents", (WIDTH - MARGIN - 79, 20, WIDTH - MARGIN - 35, 33), relative=0, thickness=0)
            c.setFillColor(INK)
            c.drawRightString(WIDTH - MARGIN, 23, str(doc.page))
        c.restoreState()

    def afterFlowable(self, flowable):
        key = getattr(flowable, "atlas_key", None)
        if key:
            title = flowable.getPlainText()
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, level=0)
            if getattr(flowable, "atlas_entry", False):
                self.entry_pages[key] = self.page
                self.notify("TOCEntry", (0, html.escape(title), self.page, key))


def heading(text, key, style, entry=False):
    result = Paragraph(html.escape(text), style["title"])
    result.atlas_key, result.atlas_entry = key, entry
    return result


def parse_source(source):
    result = subprocess.run(["pandoc", "-f", "gfm", "-t", "json"], input=source,
                            capture_output=True, text=True, check=True)
    blocks = json.loads(result.stdout)["blocks"]
    preface, entries, appendix = [], [], []
    current = preface
    for block in blocks:
        if block["t"] == "Para":
            raw = "".join(x["c"][1] for x in block["c"] if x["t"] == "RawInline")
            anchor = re.fullmatch(r'<a id="([^"]+)"></a>', raw)
            if anchor:
                entry = {"id": anchor[1], "blocks": []}
                entries.append(entry)
                current = entry["blocks"]
                continue
        if block["t"] == "Header" and plain(block["c"][2]) == "Navigate":
            current = []
            continue
        if block["t"] == "HorizontalRule":
            current = appendix
            continue
        current.append(block)
    assert entries, "No anchored atlas entries found."
    ids = [x["id"] for x in entries]
    assert len(ids) == len(set(ids)), "Duplicate entry anchors."
    for entry in entries:
        assert entry["blocks"][0]["t"] == "Header"
        entry["title"] = plain(entry["blocks"][0]["c"][2])
    return preface, entries, appendix


def render_blocks(blocks, style):
    story = []
    for block in blocks:
        t, c = block["t"], block.get("c")
        if t in ("Para", "Plain"):
            text = plain(c)
            if not text:
                continue
            kind = "body"
            if text.startswith("Origin:"):
                kind = "origin"
            elif text.startswith("Next experiment or question."):
                kind = "question"
            elif text.startswith("Related:"):
                kind = "related"
            elif text == "Sources":
                kind = "sources_heading"
            elif len(c) == 1 and c[0]["t"] == "Strong" and " · " in text:
                kind = "label"
            story.append(Paragraph(inline(c), style[kind]))
        elif t == "CodeBlock":
            code = html.escape(normalize(c[1])).replace("ℓ", '<font name="AtlasSans">ℓ</font>')
            story.append(XPreformatted(code, style["code"]))
        elif t == "BulletList":
            items = []
            for item in c:
                for sub in item:
                    if sub["t"] not in ("Plain", "Para"):
                        raise ValueError("Unexpected nested source list.")
                    items.append(Paragraph("• " + inline(sub["c"]), style["source"]))
            story.extend(items)
        elif t == "Header":
            story.append(Paragraph(html.escape(plain(c[2])), style["title"]))
        else:
            raise ValueError(f"Unsupported block: {t}")
    return story


def build(input_path, output_path, font_dir):
    register_fonts(font_dir)
    style = styles()
    source = input_path.read_text(encoding="utf-8")
    preface, entries, appendix = parse_source(source)
    expected_preface = ["Header", "Para", "Para", "Para", "Para", "Header", "Para", "Para"]
    if [block["t"] for block in preface] != expected_preface or plain(preface[5]["c"][2]) != "Read the evidence":
        raise ValueError("The Markdown introduction changed structure. Update the preface mapping before rendering.")
    edition = plain(preface[1]["c"]).removeprefix("Edition: ").removesuffix(".")
    story = [Cover(inline(preface[3]["c"]), inline(preface[4]["c"]), edition, len(entries), style), PageBreak()]
    story.extend([heading("Read the evidence", "read-the-evidence", style),
                  Paragraph(inline(preface[6]["c"]), style["body"]), Spacer(1, 18)])
    counts = plain(preface[7]["c"]).split(" | ")
    rows = []
    for count in counts:
        label, value = count.rsplit(": ", 1)
        rows.append([Paragraph(html.escape(label), style["body"]),
                     Paragraph("<b>" + value + "</b>", style["body"])])
    table = Table(rows, colWidths=[FRAME_WIDTH - 60, 60], hAlign="LEFT")
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFF3ED")),
                               ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 12),
                               ("TOPPADDING", (0, 0), (-1, -1), 12), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                               ("LINEBELOW", (0, 0), (-1, -2), .5, colors.white)]))
    story.extend([table, Spacer(1, 25), Paragraph("<b>Reading the atlas</b>", style["body"]),
                  Paragraph("Use the clickable contents and PDF bookmarks to move between entries. "
                            "Related links connect entries inside this document; source links open the cited material online.", style["body"]),
                  Paragraph("Each entry retains its evidence label, origin, equations, next question and credits from the Markdown reading copy.", style["body"]),
                  PageBreak(), heading("Navigate", "contents", style)])
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle("Contents", fontName="AtlasSans", fontSize=9.1,
                                     leading=13, spaceBefore=2, textColor=INK,
                                     leftIndent=0, firstLineIndent=0, rightIndent=24)]
    toc.dotsMinLevel = 0
    story.extend([Paragraph("Select an entry title or page number to open it.", style["small"]), Spacer(1, 10), toc])
    for number, entry in enumerate(entries, 1):
        entry_style = style
        word_count = sum(len(plain(b["c"]).split()) for b in entry["blocks"] if b["t"] == "Para")
        if word_count > 400:
            entry_style = dict(style)
            for name, size, leading, after in [("body", 9.5, 12.5, 3), ("title", 20.5, 24.5, 10),
                                                ("question", 9.1, 12.2, 12), ("source", 8.1, 10.3, 2),
                                                ("code", 8.5, 12.2, 17)]:
                entry_style[name] = ParagraphStyle("Compact-" + name, parent=style[name],
                                                   fontSize=size, leading=leading, spaceAfter=after)
        story.extend([PageBreak(), Paragraph(f"ENTRY {number:02d} / {len(entries):02d}", style["kicker"]),
                      heading(entry["title"], entry["id"], entry_style, entry=True)])
        story.extend(render_blocks(entry["blocks"][1:], entry_style))
    story.extend([PageBreak(), heading("Reproduce and maintain", "reproduce-and-maintain", style)])
    assert appendix[0]["t"] == "Header"
    story.extend(render_blocks(appendix[1:], style))
    story.extend([Spacer(1, 18), Paragraph("<b>Rebuild this reading edition</b>", style["body"]),
                  Paragraph("After refreshing the catalogue, run <font name=\"AtlasMono\">python3 atlas/build_pdf.py</font>. "
                            "The renderer reads the generated Markdown and preserves its entry order, source links and evidence labels.", style["body"]),
                  Paragraph('<link href="' + BASE_URL + '" color="#286963">Original Markdown reading copy</link> · '
                            '<link href="https://encapsulatorp.github.io/#atlas" color="#286963">Interactive atlas</link>', style["body"])])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = AtlasDocument(output_path, edition)
    doc.multiBuild(story)
    return {"output": str(output_path), "bytes": output_path.stat().st_size, "entries": len(entries),
            "pages": doc.page, "entry_pages": doc.entry_pages}


if __name__ == "__main__":
    root = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=root / "README.md")
    parser.add_argument("--output", type=Path, default=root / "README.pdf")
    parser.add_argument("--font-dir", type=Path, default=Path("/usr/share/fonts/truetype/dejavu"))
    args = parser.parse_args()
    print(json.dumps(build(args.input.resolve(), args.output.resolve(), args.font_dir), ensure_ascii=False, indent=2))
