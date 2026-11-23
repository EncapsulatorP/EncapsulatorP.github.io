#!/usr/bin/env python3
"""Draw an exact logistic proof chart and a matching discrete-state APNG.

Run from the repository root: python3 atlas/build_logistic_proof_visual.py
Requirements: Pillow, numpy and matplotlib (see logistic-visual-requirements.txt).

The scalar orbit has two points. The four-state diagram is the separately
defined paired derivative matrix in rescaled coordinates. Animation shows only
its exact discrete states. The return-displacement curve is evaluated by four
compositions of the scalar map; it is not an illustrative fitted curve.
"""
from __future__ import annotations

import argparse
import io
import math
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageColor, ImageDraw, ImageFont
from matplotlib.font_manager import FontProperties, findfont
from matplotlib.mathtext import math_to_image

BASE = Path(__file__).resolve().parent
W, H = 2000, 1800
ORANGE = "#F36B21"
YELLOW = "#F6C945"
GREEN = "#77B443"
DARK_GREEN = "#245C38"
INK = "#202520"
MUTED = "#62685F"
RULE = "#DDE3DA"
PALE = "#F4F7F0"
PHASE_COLORS = (ORANGE, YELLOW, GREEN, DARK_GREEN)
R = 1 + math.sqrt(6)
DISC = math.sqrt((R - 3) * (R + 1))
XM = (R + 1 - DISC) / (2 * R)
XP = (R + 1 + DISC) / (2 * R)


@lru_cache(maxsize=32)
def font(size: int, bold: bool = False):
    path = findfont(FontProperties(family="DejaVu Sans", weight="bold" if bold else "normal"))
    return ImageFont.truetype(path, size)


def centered(draw, xy, text, size=42, fill=INK, bold=False):
    draw.text(xy, text, font=font(size, bold), fill=fill, anchor="mm")


def label(draw, xy, text, size=42, fill=INK, bold=False, spacing=12):
    draw.multiline_text(xy, text, font=font(size, bold), fill=fill, spacing=spacing)


@lru_cache(maxsize=64)
def formula(source: str, size: int = 52, color: str = INK):
    stream = io.BytesIO()
    math_to_image("$" + source + "$", stream,
                  prop=FontProperties(family="DejaVu Serif", size=size / 2),
                  dpi=144, format="png", color=color)
    # Preserve antialiasing when compositing a formula over a pale panel.
    source_image = Image.open(stream).convert("RGB")
    rgb = ImageColor.getrgb(color)
    channel = min(range(3), key=lambda i: rgb[i])
    pixels = np.asarray(source_image, dtype=float)
    alpha = np.clip((255 - pixels[:, :, channel]) / (255 - rgb[channel]) * 255,
                    0, 255).astype("uint8")
    result = Image.new("RGBA", source_image.size, rgb + (0,))
    result.putalpha(Image.fromarray(alpha))
    return result


def math_at(image, center, source, size=52, color=INK):
    im = formula(source, size, color)
    image.alpha_composite(im, (round(center[0] - im.width / 2), round(center[1] - im.height / 2)))


def arrow(draw, start, end, fill=INK, width=10, head=28):
    draw.line([start, end], fill=fill, width=width)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    base = (end[0] - head * math.cos(angle), end[1] - head * math.sin(angle))
    side = head * .52
    draw.polygon([end, (base[0] + side * math.sin(angle), base[1] - side * math.cos(angle)),
                  (base[0] - side * math.sin(angle), base[1] + side * math.cos(angle))], fill=fill)


def curve_points(start, control, end, count=100):
    return [((1-t)**2*start[0] + 2*(1-t)*t*control[0] + t*t*end[0],
             (1-t)**2*start[1] + 2*(1-t)*t*control[1] + t*t*end[1])
            for t in np.linspace(0, 1, count)]


def panel(image, box, number, title, subtitle, color, title_size=47):
    d = ImageDraw.Draw(image)
    x0, y0, x1, y1 = box
    d.rounded_rectangle(box, radius=22, fill="white", outline=RULE, width=3)
    d.rounded_rectangle((x0+24, y0+26, x0+94, y0+96), radius=12, fill=color)
    centered(d, (x0+59, y0+61), str(number), 42, INK, True)
    label(d, (x0+120, y0+30), title, title_size, INK, True)
    label(d, (x0+38, y0+118), subtitle, 37, MUTED)


def top_rule(draw):
    anchors = [np.array(ImageColor.getrgb(color)) for color in (ORANGE, YELLOW, GREEN)]
    for x in range(60, 1940):
        t = (x-60) / 1879 * 2
        i = min(int(t), 1)
        color = tuple(np.rint((1-(t-i))*anchors[i] + (t-i)*anchors[i+1]).astype(int))
        draw.line((x, 40, x, 50), fill=color)


def poster_base():
    image = Image.new("RGBA", (W, H), "white")
    d = ImageDraw.Draw(image)
    top_rule(d)
    label(d, (62, 83), "LOGISTIC MAP  /  EXACT LOCAL STRUCTURE", 35, MUTED, True)
    label(d, (62, 139), "Three views of one cycle", 74, INK, True)
    math_at(image, (1655, 175), r"r_* = 1+\sqrt{6}", 55)

    panel(image, (60, 245, 895, 1070), 1, "Two points exchange", "The scalar orbit: A → B → A", ORANGE)
    panel(image, (925, 245, 1940, 1070), 2, "A rescaled quarter-turn", "The defined paired derivative model", YELLOW, 44)
    d = ImageDraw.Draw(image)
    for start, control, end, color in [
        ((290, 578), (480, 372), (697, 578), ORANGE),
        ((697, 650), (480, 850), (290, 650), GREEN),
    ]:
        points = curve_points(start, control, end)
        d.line(points, fill=color, width=10, joint="curve")
        arrow(d, points[54], points[66], color, 10, 30)
    for xy, name, color in [((290, 612), "A", ORANGE), ((697, 612), "B", GREEN)]:
        d.ellipse((xy[0]-69, xy[1]-69, xy[0]+69, xy[1]+69), fill="white", outline=color, width=7)
        centered(d, xy, name, 64, INK, True)
    math_at(image, (290, 792), r"x_-\approx0.440", 45)
    math_at(image, (697, 792), r"x_+\approx0.850", 45)
    centered(d, (477, 871), "f(A) = B        f(B) = A", 41, INK, True)
    math_at(image, (477, 948), r"f(x)=r_*x(1-x)", 57)
    centered(d, (477, 1020), "Exactly two distinct orbit points", 34, MUTED)

    # In rescaled coordinates the operator J is a clockwise quarter-turn.
    cx, cy, rad = 1433, 662, 180
    d.ellipse((cx-rad, cy-rad, cx+rad, cy+rad), outline=RULE, width=4)
    d.line((cx-rad-15, cy, cx+rad+15, cy), fill=RULE, width=3)
    d.line((cx, cy-rad-15, cx, cy+rad+15), fill=RULE, width=3)
    for k, color in enumerate(PHASE_COLORS):
        angle = k * math.pi / 2
        arc = [(cx+rad*math.cos(a), cy+rad*math.sin(a))
               for a in np.linspace(angle+.14, angle+math.pi/2-.16, 45)]
        d.line(arc, fill=color, width=7, joint="curve")
        arrow(d, arc[-6], arc[-1], color, 7, 23)
        px, py = cx+rad*math.cos(angle), cy+rad*math.sin(angle)
        d.ellipse((px-15, py-15, px+15, py+15), fill="white", outline=INK, width=4)
    centered(d, (cx, cy-rad-51), "3", 46, INK, True)
    centered(d, (cx, cy+rad+49), "1", 46, INK, True)
    centered(d, (cx-rad-52, cy), "2", 46, INK, True)
    centered(d, (cx+rad+76, cy), "0 / 4", 42, INK, True)
    math_at(image, (1433, 948), r"C^2=-I\qquad C^4=I", 58)
    centered(d, (1433, 1020), "States use the rescaled matrix J = S⁻¹CS", 34, MUTED)

    panel(image, (60, 1110, 1940, 1690), 3, "A zero derivative of the displacement",
          "The fourth return minus the starting position", GREEN, 48)
    math_at(image, (452, 1345), r"D(x)=f^{\circ4}(x)-x", 55)
    d = ImageDraw.Draw(image)
    label(d, (110, 1412), "Second return: derivative −1\nFourth return: derivative +1", 38, INK, spacing=20)
    d.rounded_rectangle((104, 1557, 801, 1646), radius=13, fill=PALE)
    math_at(image, (451, 1601), r"D'(x_-)=1-1=0", 56, DARK_GREEN)

    gx0, gx1, gy0, gy1 = 970, 1830, 1329, 1575
    def graph_xy(h, displacement):
        return gx0+(h+.04)/.08*(gx1-gx0), gy1-(displacement+.011)/.022*(gy1-gy0)
    zero = graph_xy(0, 0)
    for value in (-.01, 0, .01):
        y = graph_xy(0, value)[1]
        d.line((gx0, y, gx1, y), fill=RULE, width=2)
        d.text((gx0-18, y), f"{value:+.2f}" if value else "0", font=font(33), fill=MUTED, anchor="rm")
    d.line((zero[0], gy0, zero[0], gy1), fill=RULE, width=2)
    offsets = np.linspace(-.04, .04, 401)
    initial = XM + offsets
    returned = initial.copy()
    for _ in range(4):
        returned = R * returned * (1-returned)
    points = [graph_xy(float(h), float(v)) for h, v in zip(offsets, returned-initial)]
    d.line(points, fill=DARK_GREEN, width=7, joint="curve")
    for x in range(round(zero[0]-175), round(zero[0]+176), 25):
        d.line((x, zero[1], x+14, zero[1]), fill=ORANGE, width=4)
    d.ellipse((zero[0]-10, zero[1]-10, zero[0]+10, zero[1]+10), fill="white", outline=DARK_GREEN, width=4)
    for h, text in [(-.04, "−0.04"), (0, "0"), (.04, "+0.04")]:
        centered(d, (graph_xy(h, 0)[0], gy1+32), text, 32, MUTED)
    centered(d, ((gx0+gx1)/2, 1654), "h = offset from A", 35, MUTED)
    centered(d, (1400, 1297), "D(A + h)", 34, DARK_GREEN, True)
    label(d, (63, 1731), "Orbit, paired matrix and local displacement are distinct objects.", 32, MUTED)
    return image


def exact_state(base, state, poster=False):
    image = base.copy()
    d = ImageDraw.Draw(image)
    k = state % 4
    color = PHASE_COLORS[k]
    # No intermediate scalar positions are invented: only A and B are shown.
    point = (290, 612) if k % 2 == 0 else (697, 612)
    d.ellipse((point[0]-83, point[1]-83, point[0]+83, point[1]+83), outline=INK, width=4)
    cx, cy, rad = 1433, 662, 180
    angle = k * math.pi / 2
    end = (cx+(rad-20)*math.cos(angle), cy+(rad-20)*math.sin(angle))
    arrow(d, (cx, cy), end, INK, 11, 31)
    target = (cx+rad*math.cos(angle), cy+rad*math.sin(angle))
    d.ellipse((target[0]-16, target[1]-16, target[0]+16, target[1]+16), fill=color, outline=INK, width=3)
    d.ellipse((cx-8, cy-8, cx+8, cy+8), fill=INK)
    text = "STILL / STATE 0" if poster else f"EXACT STATE {k}  /  NEXT: {(k+1) % 4}"
    d.text((1936, 1750), text, font=font(27, True), fill=MUTED, anchor="rm")
    return image.convert("RGB")


def build(output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    base = poster_base()
    png = output_dir / "logistic-proof.png"
    apng = output_dir / "logistic-proof.apng"
    exact_state(base, 0, poster=True).save(png, optimize=True)
    frames = [exact_state(base, state).resize((1000, 900), Image.Resampling.LANCZOS)
              for state in range(4)]
    frames[0].save(apng, format="PNG", save_all=True, append_images=frames[1:],
                   duration=1800, loop=0, disposal=0, blend=0, optimize=True)
    probe = Image.open(apng)
    assert probe.is_animated and probe.n_frames == 4
    total = 0
    for index in range(probe.n_frames):
        probe.seek(index)
        total += probe.info.get("duration", 0)
    assert total == 7200
    assert Image.open(png).size == (W, H)
    print(f"PNG: {png} ({png.stat().st_size:,} bytes; {W}×{H})")
    print(f"APNG: {apng} ({apng.stat().st_size:,} bytes; 4 exact states; 1000×900)")
    print(f"r*={R:.17g}; x-={XM:.17g}; x+={XP:.17g}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=BASE / "assets")
    args = parser.parse_args()
    build(args.output_dir)
