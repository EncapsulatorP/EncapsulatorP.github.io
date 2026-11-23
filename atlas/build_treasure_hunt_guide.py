#!/usr/bin/env python3
"""Build the six-page visual navigation guide for the Pirate Chest.

Run from the repository root: python3 atlas/build_treasure_hunt_guide.py
Dependencies: atlas/logistic-pdf-requirements.txt.

The focused notes contain the complete proofs. This guide is an accessible
visual route to those notes, with exact results and exploratory links labeled.
It imports the established font/math helpers without modifying their renderer.
"""

from __future__ import annotations

import math
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph

from build_logistic_vanishing_pdf import register_fonts, parse_math, paint_math


BASE = Path(__file__).resolve().parent
SITE = "https://encapsulatorp.github.io"
DEST = SITE + "/treasure-hunt/"
PDF_DIR = SITE + "/atlas/proofs/"
W, H = A4
M = 34
CW = W - 2 * M
ORANGE = colors.HexColor("#FF5A00")
DARK_ORANGE = colors.HexColor("#A93600")
INK = colors.HexColor("#2C211B")
MUTED = colors.HexColor("#6E5549")
PALE = colors.HexColor("#FFF2E8")
RULE = colors.HexColor("#FFD4B5")
TEAL = colors.HexColor("#0E7163")
TEAL_PALE = colors.HexColor("#EAF7F2")
AMBER = colors.HexColor("#8A4D00")
AMBER_PALE = colors.HexColor("#FFF3D0")
PURPLE = colors.HexColor("#6747A5")
PURPLE_PALE = colors.HexColor("#F4EEFF")


def text(c, x, top, value, size=13, font="Sans", color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, H - top - size, value)


def para(c, x, top, width, value, size=13, leading=None, color=INK,
         font="Sans", max_height=None):
    style = ParagraphStyle("copy", fontName=font, fontSize=size,
                           leading=leading or size * 1.4,
                           textColor=color, spaceAfter=0)
    p = Paragraph(value, style)
    _, height = p.wrap(width, H)
    if max_height is not None and height > max_height:
        raise ValueError(f"Text overflow ({height:.1f}>{max_height}): {value}")
    p.drawOn(c, x, H - top - height)
    return height


def rounded(c, x, top, width, height, fill=colors.white, stroke=RULE,
            radius=16, line_width=1):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(line_width)
    c.roundRect(x, H - top - height, width, height, radius,
                fill=1, stroke=1)


def link(c, x, top, width, height, url):
    c.linkURL(url, (x, H - top - height, x + width, H - top),
              relative=0, thickness=0)


def button(c, x, top, width, label, url, fill=ORANGE, color=INK,
           size=11, height=37):
    rounded(c, x, top, width, height, fill, fill, 9)
    c.setFillColor(color)
    c.setFont("SansBold", size)
    c.drawCentredString(x + width / 2, H - top - height / 2 - size * .35,
                       label)
    link(c, x, top, width, height, url)


def badge(c, x, top, label, color=TEAL, fill=TEAL_PALE, width=None):
    width = width or c.stringWidth(label, "SansBold", 8) + 18
    rounded(c, x, top, width, 20, fill, fill, 7)
    text(c, x + 9, top + 4, label, 8, "SansBold", color)


def equation(c, x, top, latex, size=20, color=INK, center=False):
    parsed = parse_math(latex, size)
    c.setFillColor(color)
    c.setStrokeColor(color)
    if center:
        x -= float(parsed.width) / 2
    paint_math(c, parsed, x, H - top - float(parsed.height) + float(parsed.depth))


def header(c, page, label, title, subtitle=None):
    c.setFillColor(ORANGE)
    c.rect(0, H - 8, W, 8, stroke=0, fill=1)
    text(c, M, 28, f"{page:02d} / {label.upper()}", 9, "SansBold", DARK_ORANGE)
    top = 61
    for line in title.split("\n"):
        text(c, M, top, line, 33, "SansBold", INK)
        top += 39
    if subtitle:
        para(c, M, top + 12, CW, subtitle, 13.5, color=MUTED, max_height=65)


def footer(c, page):
    c.setStrokeColor(RULE)
    c.setLineWidth(.8)
    c.line(M, 42, W - M, 42)
    text(c, M, H - 31, "ENCAPSULATORP  /  A VISUAL TREASURE GUIDE", 7.5,
         "SansBold", MUTED)
    c.setFillColor(DARK_ORANGE)
    c.setFont("SansBold", 9)
    c.drawRightString(W - M, 19, f"{page} / 6")
    link(c, M, H - 35, 300, 19, DEST)


def polygon(c, pts, fill, stroke=None, width=1):
    p = c.beginPath()
    p.moveTo(pts[0][0], H - pts[0][1])
    for x, y in pts[1:]:
        p.lineTo(x, H - y)
    p.close()
    c.setFillColor(fill)
    c.setStrokeColor(stroke or fill)
    c.setLineWidth(width)
    c.drawPath(p, fill=1, stroke=bool(stroke))


def gem(c, cx, cy, scale):
    """Decorative treasure emblem; no mathematical model is implied."""
    for i, col in [(4, "#FFF9F5"), (3, "#FFF4EB"), (2, "#FFECDD")]:
        c.setFillColor(colors.HexColor(col))
        c.circle(cx, H - cy, scale * (1 + i * .17), fill=1, stroke=0)
    pts = [(cx - scale, cy - .25 * scale), (cx - .5 * scale, cy - .8 * scale),
           (cx + .5 * scale, cy - .8 * scale), (cx + scale, cy - .25 * scale),
           (cx, cy + .95 * scale)]
    polygon(c, pts, ORANGE)
    c.setStrokeColor(colors.white)
    c.setLineWidth(1.7)
    for a, b in [(pts[0], pts[3]), (pts[1], pts[4]), (pts[2], pts[4]),
                 (pts[1], (cx - .18 * scale, cy - .25 * scale)),
                 (pts[2], (cx + .18 * scale, cy - .25 * scale))]:
        c.line(a[0], H - a[1], b[0], H - b[1])


def image_fit(c, path, x, top, width, height):
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = min(width / iw, height / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(image, x + (width - dw) / 2, H - top - (height + dh) / 2,
                dw, dh, mask="auto")


def page_cover(c):
    c.setFillColor(ORANGE)
    c.rect(0, H - 11, W, 11, stroke=0, fill=1)
    text(c, M, 34, "ENCAPSULATORP  /  PIRATE CHEST", 9, "SansBold", DARK_ORANGE)
    text(c, M, 82, "Next treasures", 39, "SansBold", INK)
    text(c, M, 130, "hunt", 62, "SansBold", ORANGE)
    para(c, M, 220, 324, "A small proof is a treasure.<br/>Follow the steps. Ask what survives.",
         17, 25, color=MUTED)
    gem(c, 457, 278, 57)
    text(c, M, 329, "YOUR ROUTE", 9, "SansBold", DARK_ORANGE)
    routes = [
        ("02", "Follow the logistic arrows", "Two orbit points. A four-turn linear model."),
        ("03", "Find the vanishing terms", "The cubic tells us what happens next."),
        ("04", "Choose a proof island", "Open one short note with all its assumptions."),
        ("05", "Explore nearby geometry", "Fibers, spheres and clearly marked questions."),
        ("06", "Choose the next useful target", "A concrete deliverable for each new bridge."),
    ]
    for i, (num, title, detail) in enumerate(routes):
        top = 355 + i * 61
        rounded(c, M, top, CW, 51, colors.white, RULE, 11)
        text(c, M + 14, top + 10, num, 19, "SansBold", ORANGE)
        text(c, M + 58, top + 8, title, 13, "SansBold", INK)
        text(c, M + 58, top + 28, detail, 10, "Sans", MUTED)
        c.linkRect("", "page" + num, (M, H - top - 51, W - M, H - top), thickness=0)
    text(c, M, 682, "READ THE CONNECTIONS", 9, "SansBold", DARK_ORANGE)
    badge(c, M, 705, "EXACT", TEAL, TEAL_PALE, 77)
    badge(c, M + 88, 705, "CONDITIONAL", AMBER, AMBER_PALE, 116)
    badge(c, M + 215, 705, "EXPLORATORY", PURPLE, PURPLE_PALE, 123)
    c.setStrokeColor(PURPLE)
    c.setDash(5, 4)
    c.setLineWidth(2)
    c.line(M + 354, H - 715, W - M, H - 715)
    c.setDash()
    para(c, M, 741, CW, "Solid result: read the proof. Conditional result: keep the assumption. "
         "Dashed route: a target still to test.", 10.5, 15, color=MUTED, max_height=32)
    footer(c, 1)
    c.showPage()


def page_logistic(c):
    c.bookmarkPage("page02")
    header(c, 2, "Follow the arrows", "Two places. Four turns.",
           "First follow the orbit. Then follow a small push in the paired derivative model.")
    image_fit(c, BASE / "assets/logistic-proof.png", M - 5, 155, CW + 10, 501)
    rounded(c, M, 677, CW, 51, TEAL_PALE, TEAL_PALE, 12)
    para(c, M + 15, 689, CW - 30,
         "The exact statement concerns the cycle and its derivatives. The full nonlinear fourth iterate has degree 16.",
         12, 17, color=TEAL, max_height=36)
    button(c, M, 747, 253, "OPEN THE QUARTER-TURN PROOF", PDF_DIR + "logistic-quarter-turn.pdf", size=10)
    button(c, M + 266, 747, CW - 266, "SEE THE WEB ANIMATION", DEST, PALE, DARK_ORANGE, 10)
    footer(c, 2)
    c.showPage()


def page_vanishing(c):
    c.bookmarkPage("page03")
    header(c, 3, "Vanishing and collapse", "The flat tangent\nhides a cubic.")
    para(c, M, 156, CW,
         "At either cycle point p, start a small distance h away. After four logistic steps, the displacement has this form:",
         14, 20, color=MUTED, max_height=45)
    equation(c, W / 2, 219, r"f^{\circ 4}(p+h)-(p+h)=-K h^3+O(h^4),\quad K>0", 20, center=True)
    vals = [("CONSTANT", "0", "no offset"), ("LINEAR", "0", "flat tangent"),
            ("QUADRATIC", "0", "still vanishes"), ("CUBIC", "−K h³", "restores locally")]
    gap = 10
    width = (CW - 3 * gap) / 4
    for i, (label, val, detail) in enumerate(vals):
        x, top = M + i * (width + gap), 275
        active = i == 3
        rounded(c, x, top, width, 107, ORANGE if active else PALE,
                ORANGE if active else RULE, 13)
        color = INK if active else DARK_ORANGE
        text(c, x + 11, top + 13, label, 8, "SansBold", color)
        text(c, x + 11, top + 34, val, 26 if not active else 21, "SansBold", color)
        text(c, x + 11, top + 82, detail, 8.7, "Sans", color)
    rounded(c, M, 408, CW, 193, colors.white, RULE, 15)
    text(c, M + 16, 424, "CHECK THE GEOMETRY TOO", 9, "SansBold", DARK_ORANGE)
    # Exact image of a unit circle under C=[[0,sqrt(2)-1],[-sqrt(2)-1,0]].
    # Both drawings use the same scale; determinant 1 preserves their area.
    cy, unit = 520, 24
    c.setStrokeColor(TEAL)
    c.setLineWidth(2.5)
    c.circle(M + 67, H - cy, unit, stroke=1, fill=0)
    pts = []
    for i in range(181):
        t = 2 * math.pi * i / 180
        pts.append((M + 164 + unit * (math.sqrt(2) - 1) * math.sin(t),
                    cy - unit * (-math.sqrt(2) - 1) * math.cos(t)))
    p = c.beginPath()
    p.moveTo(pts[0][0], H - pts[0][1])
    for x, y in pts[1:]:
        p.lineTo(x, H - y)
    c.drawPath(p, fill=0, stroke=1)
    text(c, M + 103, cy - 10, "C →", 13, "SansBold", ORANGE)
    text(c, M + 36, 573, "Same area", 10, "SansBold", TEAL)
    para(c, M + 228, 463, CW - 246,
         "The paired matrix has<br/><b>det C = 1</b> and <b>rank C = 2</b>.<br/>It preserves area and loses no direction.",
         13, 20, max_height=84)
    rounded(c, M, 622, CW, 94, PURPLE_PALE, PURPLE_PALE, 14)
    text(c, M + 15, 635, "VANISHING BRANES / A TOY AND AN OPEN LINK", 9, "SansBold", PURPLE)
    para(c, M + 15, 657, CW - 30,
         "The note defines a toy: angular motion survives while a small transverse distance tends to zero. Its physical brane interpretation remains open.",
         12, 17, color=PURPLE, max_height=52)
    button(c, M, 741, CW, "OPEN THE LOCAL CUBIC LEMMA", PDF_DIR + "logistic-collapse-vanishing.pdf", size=11)
    footer(c, 3)
    c.showPage()


ISLANDS = [
    ("Alternating towers", "A full convergence theorem.", "EXACT", "alternating-towers"),
    ("Logistic quarter-turn", "A finite-order derivative model.", "EXACT LOCAL", "logistic-quarter-turn"),
    ("Vanishing terms", "The restoring cubic survives.", "EXACT LOCAL", "logistic-collapse-vanishing"),
    ("Dyadic remainder", "A tail bounded by 2⁻ᵏ.", "EXACT PATH", "dyadic-remainder"),
    ("Prime polynomials", "Coefficients count finite pairs.", "EXACT FINITE", "prime-polynomial-counts"),
    ("Palindrome counts", "Count under a stated model.", "EXACT MODEL", "palindrome-counting"),
    ("Two maps of six", "Exact formulas; limits open.", "FORMULAS", "fractional-exponential-maps"),
    ("Dimensions", "Known foundations; fragments open.", "FOUNDATIONS", "dimensions-and-fragments"),
    ("The Z(p) family", "Assume complex Schanuel.", "CONDITIONAL", "schanuel-zeta-family"),
]


def page_islands(c):
    c.bookmarkPage("page04")
    header(c, 4, "Choose an island", "One question. One note.",
           "Tap a card to open its full argument, assumptions and next step.")
    width = (CW - 22) / 3
    for i, (title, description, status, slug) in enumerate(ISLANDS):
        x = M + (i % 3) * (width + 11)
        top = 178 + (i // 3) * 163
        conditional = status == "CONDITIONAL"
        color, fill = (AMBER, AMBER_PALE) if conditional else (TEAL, TEAL_PALE)
        rounded(c, x, top, width, 151, colors.white, RULE, 14)
        badge(c, x + 11, top + 12, status, color, fill)
        para(c, x + 11, top + 45, width - 22, escape(title),
             15, 19, font="SansBold", max_height=42)
        para(c, x + 11, top + 91, width - 22, escape(description),
             10.5, 14, color=MUTED, max_height=42)
        text(c, x + width - 31, top + 123, "↗", 16, "SansBold", ORANGE)
        link(c, x, top, width, 151, PDF_DIR + slug + ".pdf")
    rounded(c, M, 687, CW, 49, AMBER_PALE, AMBER_PALE, 12)
    para(c, M + 13, 698, CW - 26,
         "A conditional conclusion keeps its assumption. The Schanuel card does not turn the conjecture into a theorem.",
         11.5, 16, color=AMBER, max_height=34)
    button(c, M, 751, CW, "READ THE PROOF REVIEW AND SCOPE", PDF_DIR + "proof-review.pdf", PALE, DARK_ORANGE, 10.5, 31)
    footer(c, 4)
    c.showPage()


def page_geometry(c):
    c.bookmarkPage("page05")
    header(c, 5, "Explore neighboring geometry", "Beautiful shapes.\nPrecise questions.")
    para(c, M, 154, CW, "These are established geometry constructions. Any new logistic bridge needs its own definition and proof.",
         13, 19, color=MUTED, max_height=42)
    card_w = (CW - 16) / 2
    x1, x2 = M, M + card_w + 16
    for x in (x1, x2):
        rounded(c, x, 215, card_w, 383, colors.white, RULE, 15)
    image_fit(c, BASE / "assets/treasure-hunt/hopf-fibration.png", x1 + 9, 224, card_w - 18, 211)
    image_fit(c, BASE / "assets/treasure-hunt/sphere-eversion-poster.jpg", x2 + 9, 224, card_w - 18, 211)
    text(c, x1 + 13, 450, "CIRCLES AS FIBERS", 11, "SansBold", DARK_ORANGE)
    para(c, x1 + 13, 474, card_w - 26,
         "A point on the small sphere picks a circle in the three-sphere. The large shape is a projection.",
         11.5, 16, max_height=67)
    text(c, x2 + 13, 450, "A SPHERE TURNS INSIDE OUT", 9.5, "SansBold", DARK_ORANGE)
    para(c, x2 + 13, 474, card_w - 26,
         "Self-intersections are allowed. Tears, creases and pinch points are not. The surface stays an immersion.",
         11.5, 16, max_height=67)
    para(c, x1 + 13, 550, card_w - 26,
         '<link href="https://commons.wikimedia.org/wiki/File:Hopf_Fibration.png" color="#A93600">Niles Johnson</link> · '
         '<link href="https://creativecommons.org/licenses/by/4.0/" color="#A93600">CC BY 4.0</link><br/>'
         'Supplied resized image; no further changes.', 8.2, 12, color=MUTED, max_height=40)
    para(c, x2 + 13, 550, card_w - 26,
         '<link href="https://commons.wikimedia.org/wiki/File:Thurston_Sphere_Eversion.webm" color="#A93600">© 2022 Carsten Steger</link> · '
         '<link href="https://creativecommons.org/licenses/by-sa/4.0/" color="#A93600">CC BY-SA 4.0</link><br/>'
         'Frame at 15 s, resized; same license.', 8.2, 12, color=MUTED, max_height=40)
    c.setStrokeColor(PURPLE)
    c.setDash(5, 4)
    c.setLineWidth(1.5)
    for x in (x1 + card_w / 2, x2 + card_w / 2):
        c.line(x, H - 604, x, H - 624)
    c.setDash()
    rounded(c, M, 628, CW, 110, PURPLE_PALE, PURPLE_PALE, 15)
    text(c, M + 15, 641, "PROPOSED BRIDGE / A CONCRETE TARGET", 9, "SansBold", PURPLE)
    para(c, M + 15, 665, CW - 30,
         "Write down a map from a stated logistic object. Define its domain and output. Then prove one preserved quantity, or exhibit a counterexample.",
         13, 19, color=PURPLE, max_height=61)
    button(c, M, 751, CW, "OPEN THE GEOMETRY AND ANIMATIONS", DEST, ORANGE, INK, 10.5, 31)
    footer(c, 5)
    c.showPage()


def page_targets(c):
    c.bookmarkPage("page06")
    header(c, 6, "Next useful targets", "Choose the next\nuseful step.")
    rows = [
        ("01", "NOW", "Polish one small theorem",
         "Deliverable: one statement, full proof, reproducible checks and focused questions for external review.",
         "Start with alternating towers ↗", PDF_DIR + "alternating-towers.pdf"),
        ("02", "NEXT", "Make the brane link precise",
         "Deliverable: define the intended object and connect it to the explicit toy by a stated map or invariant.",
         "Obstruction-Theory repository ↗", "https://github.com/EncapsulatorP/Obstruction-Theory"),
        ("03", "THEN", "Recover one Collatz bridge",
         "Deliverable: one falsifiable claim connecting the delay embedding to a specified diagnostic. Record its scope.",
         "Collatz-Rupert repository ↗", "https://github.com/EncapsulatorP/collatz_rupert_delay_embedding"),
    ]
    for i, (num, when, title, desc, anchor, url) in enumerate(rows):
        top = 175 + i * 148
        rounded(c, M, top, CW, 133, colors.white, RULE, 15)
        text(c, M + 14, top + 12, num, 23, "SansBold", ORANGE)
        text(c, M + 59, top + 13, when, 8.5, "SansBold", DARK_ORANGE)
        text(c, M + 59, top + 31, title, 17, "SansBold", INK)
        para(c, M + 59, top + 60, CW - 76, escape(desc), 11.8, 17,
             color=MUTED, max_height=36)
        text(c, M + 59, top + 106, anchor, 10, "SansBold", DARK_ORANGE)
        link(c, M + 59, top + 102, CW - 76, 23, url)
    para(c, M, 638, CW,
         "Order by clarity and reuse: secure a small result, define one bridge, then widen the search. The full plan keeps the larger schedule and repository graph.",
         12, 18, color=MUTED, max_height=56)
    button(c, M, 710, (CW - 12) / 2, "OPEN PIRATES PLAN", SITE + "/#pirates-plan", size=10.5)
    button(c, M + (CW + 12) / 2, 710, (CW - 12) / 2, "EXPLORE REPOSITORY LINKS", SITE + "/#repo-interlinks", PALE, DARK_ORANGE, 9.5)
    button(c, M, 756, CW, "RETURN TO THE TREASURE HUNT", DEST, PALE, DARK_ORANGE, 10, 28)
    footer(c, 6)
    c.showPage()


MARKDOWN = """# Next treasures hunt

A visual guide to the EncapsulatorP Pirate Chest. Edition: 23 November 2026.

**Start:** [Treasure hunt](https://encapsulatorp.github.io/treasure-hunt/).
**Plan:** [Pirates Plan](https://encapsulatorp.github.io/#pirates-plan).
**Graph:** [Repository connections](https://encapsulatorp.github.io/#repo-interlinks).

## 1. Read the route

A small proof is a treasure. Follow the steps. Ask what survives.

- Exact: a result with explicit assumptions and a written argument.
- Conditional: the conclusion depends on a stated assumption.
- Exploratory: a proposed route with a concrete target still to test.

The guide is navigation; the individual notes contain the complete statements and proofs. The status labels make no claim of research novelty or formal proof-assistant certification.

## 2. Follow the logistic arrows

For f(x) = r*x*(1-x), at r = 1 + sqrt(6), the nontrivial two-cycle exchanges x-minus and x-plus. The paired derivative matrix satisfies C^2 = -I and C^4 = I. The compass picture uses rescaled coordinates for that linear model. The nonlinear fourth iterate is a degree-16 polynomial.

[Open the quarter-turn proof](https://encapsulatorp.github.io/atlas/proofs/logistic-quarter-turn.pdf).

![Static logistic proof diagram](assets/logistic-proof.png)

## 3. Follow what vanishes

At either two-cycle point p, the fourth-return displacement has the local expansion

```text
f^4(p+h) - (p+h) = -K*h^3 + O(h^4), K > 0.
```

The constant, linear and quadratic displacement terms vanish; a restoring cubic remains. The derivative of f^4 itself equals 1 at p. The paired matrix C has determinant 1 and rank 2, so it preserves area and loses no direction.

The note also defines a small mathematical model: let g(h) = f^4(p-plus+h) - p-plus and apply Phi(theta,h) = (theta+omega modulo 2*pi, g(h)). The circle h=0 is invariant; a sufficiently small transverse distance tends to zero while angular motion survives. This is a local, asymptotic result.

**Vanishing-brane target:** define the intended object and connect it to the explicit toy by a stated map or invariant. A physical brane interpretation has not been supplied.

[Open the exact local lemma and scope](https://encapsulatorp.github.io/atlas/proofs/logistic-collapse-vanishing.pdf).

## 4. Choose one proof island

| Note | Scope |
|---|---|
| [Alternating towers](https://encapsulatorp.github.io/atlas/proofs/alternating-towers.pdf) | Proved convergence and classification for the defined alternating-sign system. |
| [Logistic quarter-turn](https://encapsulatorp.github.io/atlas/proofs/logistic-quarter-turn.pdf) | Exact local derivative result. |
| [Logistic collapse and vanishing terms](https://encapsulatorp.github.io/atlas/proofs/logistic-collapse-vanishing.pdf) | Exact local cubic lemma; geometric or physical model still open. |
| [Dyadic remainder](https://encapsulatorp.github.io/atlas/proofs/dyadic-remainder.pdf) | Proved bound along the specified path. |
| [Prime polynomials](https://encapsulatorp.github.io/atlas/proofs/prime-polynomial-counts.pdf) | Exact finite counting identities. |
| [Palindrome counting](https://encapsulatorp.github.io/atlas/proofs/palindrome-counting.pdf) | Exact count under a stated sampling model. |
| [Two constructions of six](https://encapsulatorp.github.io/atlas/proofs/fractional-exponential-maps.pdf) | Exact formulas; limiting orbit means require more work. |
| [Dimensions and fragments](https://encapsulatorp.github.io/atlas/proofs/dimensions-and-fragments.pdf) | Known foundations; incomplete fragments remain unresolved. |
| [The Z(p) family](https://encapsulatorp.github.io/atlas/proofs/schanuel-zeta-family.pdf) | Conditional on complex Schanuel. |
| [Proof review](https://encapsulatorp.github.io/atlas/proofs/proof-review.pdf) | Correctness, scope and novelty are separate questions. |

## 5. Explore neighboring geometry

### Hopf fibration

Each colored point on the small sphere corresponds to a circle fiber in the three-sphere. The large shape projects those fibers into a three-dimensional ball. This description follows [Niles Johnson's creator explanation](https://nilesjohnson.net/hopf.html).

![Hopf fibration reference](assets/treasure-hunt/hopf-fibration.png)

Image: [Niles Johnson, Hopf Fibration](https://commons.wikimedia.org/wiki/File:Hopf_Fibration.png), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). User-supplied resized copy, preserved without further changes.

### Sphere eversion

A sphere turns inside out through smooth immersed surfaces. Self-intersections are allowed; tears, creases and pinch points are not. See [the creator's explanation and full video](https://commons.wikimedia.org/wiki/File:Thurston_Sphere_Eversion.webm).

![Sphere-eversion frame](assets/treasure-hunt/sphere-eversion-poster.jpg)

Frame: copyright 2022 Carsten Steger, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Extracted at 15 seconds and resized; the derivative keeps the same license.

**Proposed bridge target:** write down a map from a stated logistic object; define its domain and output; prove one preserved quantity or exhibit a counterexample. These illustrations establish no logistic or physical-brane equivalence.

## 6. Choose the next useful step

1. **Now: polish one small theorem.** Deliver one statement, a full proof, reproducible checks and focused questions for external review. Start with the [alternating-tower note](https://encapsulatorp.github.io/atlas/proofs/alternating-towers.pdf).
2. **Next: make the brane link precise.** Define the intended object and connect it to the explicit toy by a stated map or invariant. Follow the [Obstruction-Theory repository](https://github.com/EncapsulatorP/Obstruction-Theory).
3. **Then: recover one Collatz bridge.** Deliver one falsifiable claim linking the delay embedding to a specified diagnostic, with its scope recorded. Follow the [Collatz-Rupert repository](https://github.com/EncapsulatorP/collatz_rupert_delay_embedding).

Order by clarity and reuse. The [full Pirates Plan](https://encapsulatorp.github.io/#pirates-plan) carries the larger schedule, and the [repository graph](https://encapsulatorp.github.io/#repo-interlinks) records the connections.

## Rebuild and media records

Run `python3 atlas/build_treasure_hunt_guide.py`. The guide uses the existing DejaVu font families and mathematical text renderer. The logistic figure remains unchanged; precise equations and the determinant illustration are drawn from their definitions. Source media credits and hashes are in `atlas/assets/treasure-hunt/media-sources.json`.

This PDF contains static figures. The website supplies animation and interaction.
"""


def main():
    register_fonts()
    out = BASE / "treasure-hunt-guide.pdf"
    c = Canvas(str(out), pagesize=A4, pageCompression=1, invariant=1)
    c.setTitle("Next treasures hunt - A visual Pirate Chest guide")
    c.setAuthor("EncapsulatorP")
    c.setSubject("Exact proof islands, conditional statements and exploratory bridges")
    for page in (page_cover, page_logistic, page_vanishing, page_islands,
                 page_geometry, page_targets):
        page(c)
    c.save()
    (BASE / "treasure-hunt-guide.md").write_text(MARKDOWN, encoding="utf-8")
    print(out)


if __name__ == "__main__":
    main()
