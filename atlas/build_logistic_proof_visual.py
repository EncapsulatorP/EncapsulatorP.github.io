#!/usr/bin/env python3
"""Draw the exact logistic proof picture and a matching animated PNG.

Run from the repository root: python3 atlas/build_logistic_proof_visual.py
Requirements: Pillow, numpy and matplotlib (see logistic-visual-requirements.txt).

The orbit has two points. The four-step compass is the separately defined paired
derivative matrix after rescaling its axes, not four points of the scalar orbit.
Animation tweening joins the exact discrete states for illustration only.
"""
from __future__ import annotations

import argparse
import io
import math
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageColor, ImageDraw, ImageFilter, ImageFont
from matplotlib.font_manager import FontProperties, findfont
from matplotlib.mathtext import math_to_image

BASE = Path(__file__).resolve().parent
W, H = 2000, 1800
ORANGE = "#FF5A00"
DARK = "#2C211B"
BURNT = "#A93600"
MUTED = "#6E5549"
PALE = "#FFF2E8"
RULE = "#FFD4B5"
GOLD = "#FFB000"
R = 1 + math.sqrt(6)
DISC = math.sqrt((R - 3) * (R + 1))
XM = (R + 1 - DISC) / (2 * R)
XP = (R + 1 + DISC) / (2 * R)


@lru_cache(maxsize=32)
def font(size: int, bold: bool = False):
    path = findfont(FontProperties(family="DejaVu Sans", weight="bold" if bold else "normal"))
    return ImageFont.truetype(path, size)


def centered(draw, xy, text, size=42, fill=DARK, bold=False):
    draw.text(xy, text, font=font(size, bold), fill=fill, anchor="mm")


def label(draw, xy, text, size=42, fill=DARK, bold=False, spacing=12):
    draw.multiline_text(xy, text, font=font(size, bold), fill=fill, spacing=spacing)


@lru_cache(maxsize=64)
def formula(source: str, pixels: int = 52, color: str = DARK):
    stream = io.BytesIO()
    math_to_image("$" + source + "$", stream,
                  prop=FontProperties(family="DejaVu Serif", size=pixels/2),
                  dpi=144, format="png", color=color)
    # MathText renders on white; recover antialias alpha without white patches.
    source_image=Image.open(stream).convert("RGB")
    rgb=ImageColor.getrgb(color)
    channel=min(range(3),key=lambda i:rgb[i])
    pixels=np.asarray(source_image,dtype=float)
    alpha=np.clip((255-pixels[:,:,channel])/(255-rgb[channel])*255,0,255).astype("uint8")
    result=Image.new("RGBA",source_image.size,rgb+(0,))
    result.putalpha(Image.fromarray(alpha))
    return result


def math_at(image, center, source, pixels=52, color=DARK):
    im = formula(source, pixels, color)
    image.alpha_composite(im, (round(center[0]-im.width/2), round(center[1]-im.height/2)))


def glint(draw, xy, radius, fill=ORANGE):
    x, y = xy; s=radius*.24
    draw.polygon([(x,y-radius),(x+s,y-s),(x+radius,y),(x+s,y+s),
                  (x,y+radius),(x-s,y+s),(x-radius,y),(x-s,y-s)],fill=fill)


def glow(image, xy, radius, color=(255,150,0), strength=110):
    span=round(radius*3)
    mask=Image.new("L",(span*2,span*2),0)
    d=ImageDraw.Draw(mask)
    d.ellipse((span-radius,span-radius,span+radius,span+radius),fill=strength)
    layer=Image.new("RGBA",mask.size,color+(0,))
    layer.putalpha(mask.filter(ImageFilter.GaussianBlur(radius*.55)))
    image.alpha_composite(layer,(round(xy[0]-span),round(xy[1]-span)))


def gem(draw, xy, radius=30, fill=ORANGE):
    x,y=xy
    pts=[(x-radius,y-radius*.2),(x-radius*.5,y-radius*.8),
         (x+radius*.5,y-radius*.8),(x+radius,y-radius*.2),(x,y+radius)]
    draw.polygon(pts,fill=fill)
    draw.line([pts[0],pts[3]],fill="white",width=2)
    draw.line([pts[1],pts[4],pts[2]],fill="white",width=2)


def arrow(draw, start, end, fill=ORANGE, width=12, head=30):
    draw.line([start,end],fill=fill,width=width)
    dx,dy=end[0]-start[0],end[1]-start[1];ang=math.atan2(dy,dx)
    side=head*.54
    p=(end[0]-head*math.cos(ang),end[1]-head*math.sin(ang))
    draw.polygon([end,(p[0]+side*math.sin(ang),p[1]-side*math.cos(ang)),
                  (p[0]-side*math.sin(ang),p[1]+side*math.cos(ang))],fill=fill)


def curve_points(start, control, end, count=100):
    return [((1-t)**2*start[0]+2*(1-t)*t*control[0]+t*t*end[0],
             (1-t)**2*start[1]+2*(1-t)*t*control[1]+t*t*end[1])
            for t in np.linspace(0,1,count)]


def panel(image, box, number, title, subtitle):
    d=ImageDraw.Draw(image)
    x0,y0,x1,y1=box
    d.rounded_rectangle(box,radius=34,fill="white",outline=RULE,width=3)
    d.rounded_rectangle((x0+20,y0+22,x0+92,y0+94),radius=20,fill=ORANGE)
    centered(d,(x0+56,y0+57),str(number),44,DARK,True)
    label(d,(x0+120,y0+24),title,49,ORANGE,True)
    label(d,(x0+40,y0+110),subtitle,40,MUTED)


def base_poster(dynamic=False):
    image=Image.new("RGBA",(W,H),"white")
    d=ImageDraw.Draw(image)
    d.rounded_rectangle((60,42,1940,51),radius=4,fill=ORANGE)
    label(d,(62,81),"SMALL PUSHES. A BRIGHT LITTLE TREASURE.",37,BURNT,True)
    label(d,(62,133),"See the logistic proof move",70,ORANGE,True)
    glow(image,(1886,147),36,strength=110)
    d=ImageDraw.Draw(image);gem(d,(1886,147),32);glint(d,(1945,108),15);glint(d,(1832,173),9,GOLD)

    panel(image,(60,240,890,1080),1,"Two places swap","The actual logistic orbit")
    panel(image,(930,240,1940,1080),2,"Four turns bring it home","A compass for small pushes")
    d=ImageDraw.Draw(image)
    # The actual scalar orbit, with arrows separating the two discrete locations.
    for pts in [curve_points((290,585),(470,355),(700,585)),
                curve_points((700,640),(470,865),(290,640))]:
        d.line(pts,fill=RULE,width=14,joint="curve")
        arrow(d,pts[54],pts[64],ORANGE,10,27)
    for xy,name,value in [((290,610),"A",XM),((700,610),"B",XP)]:
        glow(image,xy,76,strength=75)
        d=ImageDraw.Draw(image)
        d.ellipse((xy[0]-77,xy[1]-77,xy[0]+77,xy[1]+77),fill=PALE,outline=ORANGE,width=5)
        centered(d,xy,name,68,BURNT,True)
    math_at(image,(290,746),r"x_-\approx0.440",43)
    math_at(image,(700,746),r"x_+\approx0.850",43)
    d=ImageDraw.Draw(image)
    centered(d,(475,855),"A goes to B. B goes to A.",43,DARK,True)
    math_at(image,(475,940),r"f(x)=r_*x(1-x)",54)
    math_at(image,(475,1014),r"r_*=1+\sqrt{6}",53)

    # Similarity-normalized derivative model: clockwise quarter-turns.
    cx,cy,rad=1435,663,180
    glow(image,(cx,cy),240,strength=28)
    d=ImageDraw.Draw(image)
    for r,cl,width in [(rad+43,"#FFF8F1",26),(rad+20,"#FFE3C6",4),(rad,GOLD,6)]:
        d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=cl,width=width)
    d.line((cx-rad,cy,cx+rad,cy),fill=RULE,width=2)
    d.line((cx,cy-rad,cx,cy+rad),fill=RULE,width=2)
    for k in range(4):
        angle=k*math.pi/2
        px,py=cx+rad*math.cos(angle),cy+rad*math.sin(angle)
        d.ellipse((px-18,py-18,px+18,py+18),fill="white",outline=ORANGE,width=5)
        if k and not dynamic:
            arrow(d,(cx,cy),(px*.95+cx*.05,py*.95+cy*.05),"#FFD4B5",7,23)
        arc=[(cx+rad*math.cos(a),cy+rad*math.sin(a)) for a in np.linspace(angle+.12,angle+math.pi/2-.15,40)]
        d.line(arc,fill=ORANGE,width=6,joint="curve")
        arrow(d,arc[-4],arc[-1],ORANGE,6,20)
    if not dynamic:
        arrow(d,(cx,cy),(cx+rad-17,cy),ORANGE,13,34)
        gem(d,(cx+rad,cy),29)
    centered(d,(cx,cy),"",42)
    d.ellipse((cx-10,cy-10,cx+10,cy+10),fill=BURNT)
    centered(d,(cx,cy-rad-51),"3",49,DARK,True)
    centered(d,(cx,cy+rad+49),"1",49,DARK,True)
    centered(d,(cx-rad-59,cy),"2",49,DARK,True)
    label(d,(cx+rad+45,cy-50),"0 / 4\nHome",42,BURNT,True,spacing=8)
    math_at(image,(1435,967),r"C^2=-I\qquad C^4=I",58)
    centered(ImageDraw.Draw(image),(1435,1038),"Rescaled derivative model",40,MUTED)

    # Exact nonlinear displacement curve, evaluated by four compositions.
    panel(image,(60,1120,1940,1702),3,"Flat at this point","The four-step return minus where we started")
    math_at(image,(453,1357),r"G(x)=f^{\circ4}(x)-x",57)
    d=ImageDraw.Draw(image)
    label(d,(110,1431),"Two steps: slope −1\nFour steps: slope +1",43,DARK,spacing=14)
    d.rounded_rectangle((104,1573,805,1656),radius=18,fill=PALE)
    math_at(image,(455,1613),r"G'(x_-)=1-1=0",58,BURNT)
    gx0,gx1,gy0,gy1=964,1829,1312,1598
    def graph_xy(h,g):return gx0+(h+.04)/.08*(gx1-gx0),gy1-(g+.011)/.022*(gy1-gy0)
    zero=graph_xy(0,0)
    for yy in [-.01,0,.01]:
        liney=graph_xy(0,yy)[1]
        d.line((gx0,liney,gx1,liney),fill="#FFEADA" if yy else RULE,width=2)
        d.text((gx0-18,liney),f"{yy:+.2f}" if yy else "0",font=font(35),fill=MUTED,anchor="rm")
    d.line((zero[0],gy0,zero[0],gy1),fill=RULE,width=2)
    hs=np.linspace(-.04,.04,400)
    ys=XM+hs
    ret=ys.copy()
    for _ in range(4):ret=R*ret*(1-ret)
    points=[graph_xy(float(h),float(g)) for h,g in zip(hs,ret-ys)]
    # Draw a soft halo behind the exact curve, never an approximate drawn curve.
    halo_mask=Image.new("L",image.size,0);hd=ImageDraw.Draw(halo_mask)
    hd.line(points,fill=150,width=20,joint="curve")
    halo=Image.new("RGBA",image.size,(255,145,0,0))
    halo.putalpha(halo_mask.filter(ImageFilter.GaussianBlur(13)))
    image=Image.alpha_composite(image,halo)
    d=ImageDraw.Draw(image);d.line(points,fill=ORANGE,width=8,joint="curve")
    for x in range(round(zero[0]-175),round(zero[0]+176),24):d.line((x,zero[1],x+14,zero[1]),fill=BURNT,width=4)
    d.ellipse((zero[0]-12,zero[1]-12,zero[0]+12,zero[1]+12),fill="white",outline=ORANGE,width=5)
    for h,tx in [(-.04,"−0.04"),(0,"0"),(.04,"+0.04")]:
        x=graph_xy(h,0)[0];centered(d,(x,gy1+35),tx,35,MUTED)
    centered(d,((gx0+gx1)/2,gy1+82),"Offset from A",39,MUTED)
    centered(d,(1000,1755),"Local derivative picture — the full nonlinear map is not the identity.",40,BURNT,True)
    return image,zero


def animation_frame(base,zero,phase):
    image=base.copy()
    d=ImageDraw.Draw(image)
    cx,cy,rad=1435,663,180
    ang=phase*math.pi/2
    target=(cx+rad*math.cos(ang),cy+rad*math.sin(ang))
    glow(image,target,38,strength=130)
    d=ImageDraw.Draw(image)
    arrow(d,(cx,cy),(cx+(rad-20)*math.cos(ang),cy+(rad-20)*math.sin(ang)),ORANGE,13,34)
    gem(d,target,29)
    d.ellipse((cx-10,cy-10,cx+10,cy+10),fill=BURNT)
    # A small travelling gem follows the graph arrows between the true orbit points.
    part=min(3,int(phase));u=min(1,phase-part)
    if part%2==0:
        start,ctrl,end=(290,585),(470,355),(700,585)
    else:
        start,ctrl,end=(700,640),(470,865),(290,640)
    orb=((1-u)**2*start[0]+2*(1-u)*u*ctrl[0]+u*u*end[0],
         (1-u)**2*start[1]+2*(1-u)*u*ctrl[1]+u*u*end[1])
    glow(image,orb,31,strength=100)
    d=ImageDraw.Draw(image);gem(d,orb,24)
    if phase>=3.75:
        glow(image,zero,30+14*math.sin((phase-3.75)*2*math.pi),strength=110)
        d=ImageDraw.Draw(image);d.ellipse((zero[0]-12,zero[1]-12,zero[0]+12,zero[1]+12),fill="white",outline=ORANGE,width=5)
    return image.convert("RGB").resize((1000,900),Image.Resampling.LANCZOS)


def build(output_dir: Path):
    output_dir.mkdir(parents=True,exist_ok=True)
    poster,zero=base_poster()
    base,_=base_poster(dynamic=True)
    png=output_dir/'logistic-proof.png'
    apng=output_dir/'logistic-proof.apng'
    poster.convert("RGB").save(png,optimize=True)
    frames=[]
    for turn in range(4):
        for i in range(21):
            u=0 if i<7 else 1 if i>=18 else (i-7)/11
            u=u*u*(3-2*u)
            frames.append(animation_frame(base,zero,turn+u))
    frames[0].save(apng,format="PNG",save_all=True,append_images=frames[1:],duration=150,
                   loop=0,disposal=0,blend=0,optimize=True)
    probe=Image.open(apng)
    # Pillow coalesces identical hold frames while retaining their durations.
    assert probe.is_animated and probe.n_frames>=40
    durations=[]
    for index in range(probe.n_frames):
        probe.seek(index);durations.append(probe.info.get('duration',0))
    assert abs(sum(durations)-12600)<1
    assert Image.open(png).size==(W,H)
    print(f"PNG: {png} ({png.stat().st_size:,} bytes; {W}×{H})")
    print(f"APNG: {apng} ({apng.stat().st_size:,} bytes; {probe.n_frames} frames; 1000×900)")
    print(f"r*={R:.17g}; x-={XM:.17g}; x+={XP:.17g}")


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir',type=Path,default=BASE/'assets')
    args=parser.parse_args()
    build(args.output_dir)
