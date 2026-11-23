#!/usr/bin/env python3
"""Convert complete PDF documents into self-contained, offline HTML readers.

Printed pages are preserved as complete SVG artwork or direct 216-dpi page
images, not reconstructed mathematics or summaries. Original extracted text,
source/blob hashes, page counts and artwork
checksums remain in each reader. No PDF is embedded in the result. Reveal masks
are presentation effects and never certify a source's mathematical claims.

Examples:
  python import_pdf_readers.py --source paper.pdf --output paper.html --assets-root assets
  python import_pdf_readers.py --git-source . COMMIT:paper.pdf --output paper.html --assets-root assets
  python import_pdf_readers.py --verify-reader paper.html --source paper.pdf
  python import_pdf_readers.py --batch-inventory inventory.json --source-root repos --output-root staged --assets-root assets

The shared assets are atlas-reader.css, atlas-reveal.css, atlas-gif.js,
atlas-reveal.js and logo-encapsulatorp-512.png. They are embedded, so downloaded
readers work without a server or access to other repository files.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import html
import json
import math
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import quote, urlsplit

import fitz


VERSION = "1.0.0"
LOGO_SHA256 = "9b28152f5f5f8e59f0b1a6e24e31cc8191ec46097a4ab5bbbb80d7441e194d27"
STATUSES = {"reference", "historical", "exploratory", "conditional", "review", "reported", "finite", "exact"}
LABELS = {"reference": "Source document", "historical": "Historical source",
          "exploratory": "Exploratory document", "conditional": "Conditional source",
          "review": "Review document", "reported": "Reported work", "finite": "Finite observation",
          "exact": "Reviewed exact result"}
BOOT = """(function(){var d=document.documentElement;try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('ar-reveal-pending');window.setTimeout(function(){d.classList.remove('ar-reveal-pending')},8000)}}catch(e){d.classList.remove('ar-reveal-pending')}}());"""
PENDING_CSS = "html.ar-reveal-pending #reader-content,html.ar-reveal-pending [data-reader-reveal]{visibility:hidden!important}"
EXTRA_CSS = """
html{color-scheme:light;background:#fff}body{margin:0;background:#fff;color:#24252b;font-family:system-ui,sans-serif}
.reader-shell{max-width:1240px;margin:auto;padding:24px}.import-header{max-width:900px;margin:auto auto 24px}.import-brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:#304268;letter-spacing:.09em;font-size:12px}.import-brand img{width:56px;height:56px;object-fit:contain}.import-title{font-family:Georgia,serif;font-size:clamp(25px,4vw,40px);font-weight:500;line-height:1.2}.import-scope{line-height:1.6;color:#586071}.import-nav{display:flex;flex-wrap:wrap;gap:12px;font-size:13px}.import-nav a{color:#345d8a}.pdf-page{margin:0 0 32px;break-inside:avoid}.page-heading{font-size:13px;font-weight:500;color:#596577;margin:10px 0}.pdf-page-art{position:relative;margin:0;background:#fff;box-shadow:0 2px 18px #18203a15;overflow:hidden}.pdf-page-art>img{display:block;width:100%;height:auto}.pdf-selection{position:absolute;inset:0;overflow:hidden;user-select:text}.pdf-selection span{position:absolute;color:transparent;white-space:pre;line-height:1;transform-origin:left top;user-select:text;cursor:text}.pdf-selection span::selection{background:#447bca45;color:transparent}.pdf-link{position:absolute;background:transparent;border:0;z-index:2}.pdf-link:focus-visible{outline:3px solid #416ab4;background:#416ab418}.source-text{margin:8px 0 0;padding:10px 0;color:#5f6675;font-size:12px}.source-text pre{white-space:pre-wrap;overflow-wrap:anywhere;font-family:monospace;font-size:12px;line-height:1.5;max-height:30rem;overflow:auto;color:#24252b}.import-provenance{margin:24px 0;padding:15px;border-block:1px solid #dce1e8;color:#5f6675;font-size:12px}.import-provenance pre{white-space:pre-wrap;overflow-wrap:anywhere}.reader-noscript{line-height:1.5}.import-status{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#596577}a{overflow-wrap:anywhere}@media(max-width:640px){.reader-shell{padding:14px}.pdf-page-art{min-width:600px}.pdf-page{overflow-x:auto}.import-brand img{width:40px;height:40px}}@media print{html,body{background:white}.import-header,.import-provenance,.source-text,.page-heading,.pdf-selection,.import-nav{display:none!important}.reader-shell{max-width:none;margin:0;padding:0}.pdf-page{margin:0;break-after:page}.pdf-page-art{box-shadow:none;min-width:0!important}.pdf-page-art img{max-height:98vh;object-fit:contain}}
"""


def sha256(data):
    return hashlib.sha256(data if isinstance(data, bytes) else data.encode("utf-8")).hexdigest()


def git_blob_sha(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def esc(value):
    return html.escape(str(value), quote=True)


def json_script(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def safe_display(text):
    # PDF font encodings can yield NUL/control characters. Preserve the exact
    # original in JSON/base64 download; HTML cannot represent those characters.
    return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "\ufffd", text)


def data_url(mime, data):
    return "data:" + mime + ";base64," + base64.b64encode(data).decode("ascii")


def safe_relative(value):
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError(f"Expected a repository-relative path: {value}")
    return path.as_posix()


def load_assets(directory):
    result = {name: (directory / name).read_text(encoding="utf-8") for name in
              ("atlas-reader.css", "atlas-reveal.css", "atlas-gif.js", "atlas-reveal.js")}
    logo = (directory / "logo-encapsulatorp-512.png").read_bytes()
    if sha256(logo) != LOGO_SHA256:
        raise ValueError("The approved actual EncapsulatorP logo is missing or changed.")
    result["logo"] = logo
    result["hashes"] = {name: sha256(text) for name, text in result.items() if isinstance(text, str)}
    return result


def inspect_svg(svg):
    root = ET.fromstring(svg)
    if root.tag.split("}")[-1] != "svg":
        raise ValueError("Page export is not an SVG document")
    for node in root.iter():
        if node.tag.split("}")[-1] in {"script", "foreignObject", "text"}:
            raise ValueError("Page SVG unexpectedly contains scripts, foreign HTML, or unoutlined text")
        for key, value in node.attrib.items():
            if key.split("}")[-1] == "href" and not value.startswith(("#", "data:")):
                raise ValueError("Page SVG has an external resource and is not self-contained")
    return root


def portable_svg(svg):
    """Repair invalid XML in non-rendering glyph metadata, never the artwork.

    Some PDF font encodings cause MuPDF to emit data-text="&#x001b;".
    XML 1.0 forbids that reference, which otherwise prevents browsers from
    loading an intact path-based page. Glyph paths/hrefs/transforms stay byte
    identical; the raw exporter hash is recorded separately for provenance.
    """
    repairs = 0
    def annotation(match):
        nonlocal repairs
        def character(reference):
            nonlocal repairs
            value = int(reference[1][1:], 16) if reference[1].lower().startswith("x") else int(reference[1])
            valid = value in {9, 10, 13} or 0x20 <= value <= 0xD7FF or 0xE000 <= value <= 0xFFFD or 0x10000 <= value <= 0x10FFFF
            if valid:
                return reference[0]
            repairs += 1
            return "&#xfffd;"
        return 'data-text="' + re.sub(r"&#(x[0-9a-fA-F]+|[0-9]+);", character, match[1]) + '"'
    result = re.sub(r'data-text="([^"]*)"', annotation, svg)
    inspect_svg(result)
    return result, repairs


def page_artwork(page):
    raw_svg = page.get_svg_image(text_as_path=True)
    svg, repairs = portable_svg(raw_svg)
    root = ET.fromstring(svg)
    image_masks = sum(any(child.tag.split("}")[-1] == "image" for child in node.iter())
                      for node in root.iter() if node.tag.split("}")[-1] == "mask")
    embedded_images = sum(node.tag.split("}")[-1] == "image" for node in root.iter())
    meta = {"rawExporterSvgSha256": sha256(raw_svg), "portableSvgSha256": sha256(svg),
            "nonRenderingSvgMetadataRepairs": repairs, "embeddedImageMaskCount": image_masks,
            "embeddedRasterImageCount": embedded_images}
    if embedded_images:
        # Some SVG decoders silently omit bitmap glyphs and figures behind
        # embedded image masks. A direct high-resolution original-page render
        # keeps every printed character and figure, without interpreting them.
        pixels = page.get_pixmap(matrix=fitz.Matrix(3, 3), colorspace=fitz.csRGB, alpha=False)
        artwork = pixels.tobytes("png")
        meta.update({"artworkKind": "png", "rasterDpi": 216,
                     "rasterWidth": pixels.width, "rasterHeight": pixels.height,
                     "originalPageRgbSha256": sha256(pixels.samples),
                     "artworkReason": "Original page rendered directly at 216 dpi because embedded SVG raster images and bitmap glyphs are not portable across native image decoders."})
        mime = "image/png"
    else:
        artwork, mime = svg.encode("utf-8"), "image/svg+xml"
        meta.update({"artworkKind": "svg", "artworkReason": "Complete original page preserved as self-contained vector SVG."})
    meta["artworkSha256"] = sha256(artwork)
    return artwork, mime, meta


def selected_text_layer(page):
    width, height = page.rect.width, page.rect.height
    spans = []
    for x0, y0, x1, y1, word, *_ in page.get_text("words", sort=False):
        rect = fitz.Rect(x0, y0, x1, y1) * page.rotation_matrix
        if not word or rect.width <= 0 or rect.height <= 0:
            continue
        # Relative positioning follows the exact source word boxes. The visual
        # glyphs belong solely to the SVG; this transparent layer enables copy.
        style = (f"left:{rect.x0/width*100:.8f}%;top:{rect.y0/height*100:.8f}%;"
                 f"width:{rect.width/width*100:.8f}%;height:{rect.height/height*100:.8f}%;"
                 f"font-size:{rect.height/height*100:.8f}cqh;")
        spans.append(f'<span style="{style}">{esc(safe_display(word))} </span>')
    return '<div class="pdf-selection" aria-hidden="true" style="container-type:size">' + "".join(spans) + "</div>"


def page_links(page, count):
    overlays, records = [], []
    for link in page.get_links():
        original = link.get("uri") or link.get("file") or ""
        target = None
        if link["kind"] == fitz.LINK_GOTO and 0 <= link.get("page", -1) < count:
            target = "#page-" + str(link["page"] + 1)
        elif link["kind"] == fitz.LINK_URI and urlsplit(original).scheme in {"https", "http", "mailto"}:
            target = original
        record = {"kind": link["kind"], "original": original,
                  "page": link.get("page"), "renderedHref": target}
        records.append(record)
        if target:
            box = link["from"] * page.rotation_matrix
            style = f"left:{box.x0/page.rect.width*100:.8f}%;top:{box.y0/page.rect.height*100:.8f}%;width:{box.width/page.rect.width*100:.8f}%;height:{box.height/page.rect.height*100:.8f}%"
            overlays.append(f'<a class="pdf-link" style="{style}" href="{esc(target)}" aria-label="{esc("Go to page " + str(link["page"] + 1) if link["kind"] == fitz.LINK_GOTO else "Open cited reference: " + original)}"></a>')
    return "".join(overlays), records


def convert(raw, output, assets, *, repository="local", source_path="document.pdf", source_ref=None,
            source_object_type=None, source_commit=None, visibility=None, expected_blob=None, classification=None):
    classification = classification or {}
    status = classification.get("status", "reference")
    if status not in STATUSES or (status == "exact" and not classification.get("reviewedEvidence")):
        raise ValueError("A document needs a supported neutral/source label or an explicitly reviewed exact status; never infer a trap.")
    blob = git_blob_sha(raw)
    if expected_blob and blob != expected_blob:
        raise ValueError(f"Source Git blob does not match the inventory: {source_path}")
    doc = fitz.open(stream=raw, filetype="pdf")
    if doc.needs_pass:
        raise ValueError("Encrypted source requires an authorized decrypted input")
    title = ((classification.get("title") if classification.get("titleComplete") else None)
             or doc.metadata.get("title") or classification.get("title") or Path(source_path).stem.replace("_", " "))
    title = safe_display(title).strip()
    scope = classification.get("scopeNote") or "The complete source is reproduced with its original statements, assumptions, limitations and references. This reading edition adds no mathematical certification."
    manifest = {
        "schemaVersion": 1, "converter": "EncapsulatorP complete-page HTML reader", "converterVersion": VERSION,
        "pymupdfVersion": fitz.version[0], "mupdfVersion": fitz.version[1],
        "repository": repository, "visibility": visibility, "sourcePath": source_path,
        "sourceRef": source_ref, "sourceObjectType": source_object_type, "sourceCommit": source_commit,
        "sourceGitBlobSha": blob, "sourceSha256": sha256(raw), "sourceBytes": len(raw),
        "title": title, "status": status, "statusLabel": LABELS[status], "scopeNote": scope,
        "sourceRole": classification.get("sourceRole", "preserved source document"),
        "sourceClassification": classification,
        "pdfMetadata": doc.metadata, "pageCount": len(doc), "pages": [],
        "rendering": "Every original page is embedded as self-contained vector SVG, or as a direct original-page PNG at 216 dpi when embedded SVG raster images or glyphs would make decoder fidelity unreliable.",
        "textNote": "Raw extracted text is retained exactly in this record and the text download. Invalid HTML control characters use visible replacement characters only in the copy layer; page artwork retains the complete original printed glyphs.",
        "revealNote": "A visual cipher mask unveils the unchanged page. It is not asserted to be an authentic translation of unreviewed source text.",
        "logoSourceSha256": LOGO_SHA256, "runtimeAssets": assets["hashes"],
    }
    pages_html, gif_blocks, all_text = [], [], []
    for index, page in enumerate(doc):
        artwork, artwork_mime, artwork_meta = page_artwork(page)
        text = page.get_text("text", sort=False)
        display = safe_display(text)
        width, height = page.rect.width, page.rect.height
        image_id, page_id = f"page-image-{index+1}", f"page-{index+1}"
        overlays, links = page_links(page, len(doc))
        item = {"index": index, "id": page_id, "width": width, "height": height, "rotation": page.rotation,
                **artwork_meta, "textSha256": sha256(text), "textCharacters": len(text),
                "hasSelectableSourceText": bool(text.strip()),
                "displayTextSha256": sha256(display), "invalidHtmlTextCharacters": sum(a != b for a, b in zip(text, display)),
                "rawText": text, "links": links}
        manifest["pages"].append(item)
        all_text.append(text)
        image = data_url(artwork_mime, artwork)
        pages_html.append(f'''<section class="pdf-page" id="{page_id}" data-source-page-index="{index}" data-source-text-sha256="{item['textSha256']}">
<h2 class="page-heading" data-reader-reveal>Page {index+1} of {len(doc)}</h2>
<figure class="pdf-page-art" data-reader-reveal data-page-artwork-sha256="{item['artworkSha256']}"><img id="{image_id}" src="{image}" width="{width:g}" height="{height:g}" alt="Original page {index+1} of {len(doc)}. All printed text, mathematics and figures are preserved.">{selected_text_layer(page)}{overlays}</figure>
<details class="source-text" data-reader-reveal><summary>{'Selectable text' if text.strip() else 'About this page’s text'} for page {index+1}</summary>{'' if text.strip() else '<p>This original page has no encoded selectable text. Its complete printed content is preserved above.</p>'}<pre data-extracted-page="{index}">{esc(display)}</pre></details></section>''')
        gif_blocks.append({"type": "image", "pageArtwork": True, "text": display,
                           "imageDomId": image_id, "width": width*1.6, "height": height*1.6,
                           "sourcePage": index+1, "sourceTextSha256": item["textSha256"],
                           "sourceImageSha256": item["artworkSha256"], "artworkKind": item["artworkKind"], "status": status,
                           "sourceLabel": f"Original page {index+1} of {len(doc)}"})
    manifest["fullTextSha256"] = sha256("".join(all_text))
    manifest["fullTextCharacters"] = sum(map(len, all_text))
    manifest["pagesWithoutSelectableText"] = [p["index"]+1 for p in manifest["pages"] if not p["hasSelectableSourceText"]]
    config = {"entryId": Path(source_path).stem, "title": title, "status": status, "kind": "source-document",
              "root": "#reader-content", "controls": "#reader-tools", "fullTextReveal": True,
              "passages": [], "gifBlocks": gif_blocks, "gifOptions": {"width": 1200, "height": 1640},
              "logoDomId": "reader-logo", "sourceLabel": "Original complete source · " + LABELS[status],
              "sourceUrl": "", "credit": doc.metadata.get("author") or "Original credits and references retained on every source page",
              "revealMode": "visual-cipher", "translationClaim": False}
    provenance = {k: v for k, v in manifest.items() if k not in {"pages", "runtimeAssets"}}
    logo = data_url("image/png", assets["logo"])
    text_url = data_url("text/plain;charset=utf-8", "".join(all_text).encode("utf-8"))
    text_download = (f'<a download="{esc(Path(source_path).stem)}-source-text.txt" href="{text_url}">Download exact extracted text</a>'
                     if any(text.strip() for text in all_text) else '<span>This original source has no encoded selectable text.</span>')
    hydrate = """(function(){var n=document.getElementById('reader-config');var c=JSON.parse(n.textContent);c.logoSrc=document.getElementById(c.logoDomId).src;c.gifBlocks.forEach(function(b){if(b.imageDomId)b.image=document.getElementById(b.imageDomId).src});n.textContent=JSON.stringify(c).replace(/</g,'\\\\u003c');}());"""
    scripts = "\n".join(assets[name].replace("</script", "<\\/script") for name in ("atlas-gif.js", "atlas-reveal.js"))
    markup = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>{esc(title)} · complete reading edition</title>
<style>{PENDING_CSS}</style><script>{BOOT}</script><style id="reader-styles">{assets['atlas-reader.css']}\n{assets['atlas-reveal.css']}\n{EXTRA_CSS}</style></head>
<body data-reader-status="{esc(status)}"><div class="reader-shell"><header class="import-header">
<div class="import-brand" data-reader-chrome><img id="reader-logo" src="{logo}" width="56" height="56" alt="EncapsulatorP logo"><span>ENCAPSULATORP · READING ROOM</span></div>
<p class="import-status" data-reader-chrome>{esc(LABELS[status])} · {len(doc)} complete pages</p><h1 class="import-title" data-reader-reveal>{esc(title)}</h1><p class="import-scope" data-reader-reveal>{esc(scope)}</p>
<nav class="import-nav" data-reader-chrome><a href="#page-1">First page</a><a href="#source-record">Source record</a>{text_download}</nav><div id="reader-tools" data-reader-chrome></div>
<noscript><p class="reader-noscript">All original pages and selectable source text remain available below. Animation and GIF export require JavaScript.</p></noscript></header>
<main id="reader-content" data-source-sha256="{manifest['sourceSha256']}" data-source-pages="{len(doc)}">{''.join(pages_html)}</main>
<footer class="import-provenance" id="source-record" data-reader-reveal><details><summary>Credits and source record</summary><pre>{esc(json.dumps(provenance,ensure_ascii=False,indent=2))}</pre></details></footer></div>
<script type="application/json" id="pdf-source">{json_script(manifest)}</script><script type="application/json" id="reader-config">{json_script(config)}</script><script>{hydrate}</script><script id="reader-runtime">{scripts}</script></body></html>'''
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(markup, encoding="utf-8")
    result = {key: value for key, value in manifest.items() if key not in {"pdfMetadata", "textNote", "rendering", "revealNote"}}
    result["pages"] = [{key: value for key, value in page.items() if key not in {"rawText", "links"}} for page in manifest["pages"]]
    result["htmlSha256"] = sha256(markup)
    result["htmlBytes"] = len(markup.encode("utf-8"))
    return result


class ReaderParser(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.nodes, self.scripts, self.extracted = [], {}, {}
        self.script = self.extract = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.nodes.append((tag, attrs))
        if tag == "script":
            self.script = attrs.get("id")
            if self.script:
                self.scripts[self.script] = ""
        if tag == "pre" and "data-extracted-page" in attrs:
            self.extract = attrs["data-extracted-page"]
            self.extracted[self.extract] = ""

    def handle_endtag(self, tag):
        if tag == "script":
            self.script = None
        if tag == "pre":
            self.extract = None

    def handle_data(self, value):
        if self.script:
            self.scripts[self.script] += value
        if self.extract is not None:
            self.extracted[self.extract] += value


def decode_data_url(value):
    header, encoded = value.split(",", 1)
    if not header.startswith("data:") or not header.endswith(";base64"):
        raise ValueError("Expected an embedded base64 resource")
    return base64.b64decode(encoded, validate=True)


def verify_reader(path, raw):
    parser = ReaderParser(path.read_text(encoding="utf-8"))
    manifest, config = json.loads(parser.scripts["pdf-source"]), json.loads(parser.scripts["reader-config"])
    doc, errors, checks = fitz.open(stream=raw, filetype="pdf"), [], 0
    def check(condition, label):
        nonlocal checks
        checks += 1
        if not condition:
            errors.append(label)
    check(manifest["sourceSha256"] == sha256(raw), "Original PDF SHA-256 mismatch")
    check(manifest["sourceGitBlobSha"] == git_blob_sha(raw), "Original Git blob mismatch")
    check(manifest["pageCount"] == len(doc) == len(manifest["pages"]), "Page count mismatch")
    sections = [a for tag, a in parser.nodes if tag == "section" and "data-source-page-index" in a]
    check([a["data-source-page-index"] for a in sections] == [str(i) for i in range(len(doc))], "Missing or reordered source pages")
    images = {a.get("id"): a for tag, a in parser.nodes if tag == "img"}
    check(sha256(decode_data_url(images["reader-logo"]["src"])) == LOGO_SHA256, "Actual logo changed")
    check(config.get("logoDomId") == "reader-logo" and config.get("fullTextReveal") is True, "Full-text/logo bootstrap contract missing")
    check(config.get("status") == manifest["status"] and config["status"] not in {"trap", "false", "refuted"}, "Whole source incorrectly marked as false")
    check(config.get("translationClaim") is False and not config["passages"], "Unreviewed text misrepresented as authenticated translation")
    check(len(config["gifBlocks"]) == len(doc), "GIF omits complete source pages")
    combined = []
    for index, page in enumerate(doc):
        record = manifest["pages"][index]
        text = page.get_text("text", sort=False)
        artwork = decode_data_url(images[f"page-image-{index+1}"]["src"])
        fresh_artwork, _, fresh_meta = page_artwork(page)
        block = config["gifBlocks"][index]
        check(record["rawText"] == text, f"Page {index+1}: original extracted text changed")
        check(record["textSha256"] == sha256(text), f"Page {index+1}: text checksum changed")
        check(parser.extracted.get(str(index)) == safe_display(text), f"Page {index+1}: selectable complete text missing")
        check(record["artworkSha256"] == sha256(artwork) == sha256(fresh_artwork), f"Page {index+1}: printed artwork changed")
        check(all(record.get(key) == value for key, value in fresh_meta.items()),
              f"Page {index+1}: raw exporter/portable SVG provenance changed")
        if record["artworkKind"] == "png":
            decoded = fitz.Pixmap(artwork)
            check(sha256(decoded.samples) == record["originalPageRgbSha256"], f"Page {index+1}: decoded PNG pixels differ from the original page")
        check(record["width"] == page.rect.width and record["height"] == page.rect.height, f"Page {index+1}: original page geometry changed")
        check(block.get("imageDomId") == f"page-image-{index+1}" and block.get("sourceImageSha256") == sha256(artwork), f"Page {index+1}: GIF image differs from original")
        check(block.get("text") == safe_display(text) and block.get("sourceTextSha256") == sha256(text), f"Page {index+1}: GIF accessible text incomplete")
        check(block.get("pageArtwork") is True and math.isclose(block["width"]/block["height"], page.rect.width/page.rect.height), f"Page {index+1}: GIF changes aspect ratio")
        combined.append(text)
    check(manifest["fullTextSha256"] == sha256("".join(combined)), "Whole-document source text hash mismatch")
    for tag, attrs in parser.nodes:
        check(tag not in {"iframe", "object", "embed"}, "Reader embeds a PDF or external document")
        if tag in {"script", "link"}:
            check(not attrs.get("src") and not attrs.get("href"), "Offline reader depends on an external script/style")
        if tag == "img":
            check(attrs.get("src", "").startswith("data:"), "Offline reader depends on an external image")
    return {"ok": not errors, "checks": checks, "pages": len(doc), "sourceSha256": manifest["sourceSha256"],
            "fullTextSha256": manifest["fullTextSha256"], "errors": errors}


def source_from_git(directory, specification):
    if ":" not in specification:
        raise ValueError("--git-source expects REF:repository/path.pdf")
    ref, path = specification.split(":", 1)
    safe_relative(path)
    object_sha = subprocess.check_output(["git", "rev-parse", "--verify", "--end-of-options", ref+"^{}"], cwd=directory, text=True).strip()
    object_type = subprocess.check_output(["git", "cat-file", "-t", object_sha], cwd=directory, text=True).strip()
    raw = subprocess.check_output(["git", "show", object_sha+":"+path], cwd=directory)
    return raw, path, object_sha, object_type


def refresh_readers(directory, assets):
    """Update only embedded shared code; leave every source page/text untouched."""
    changed = {}
    style = assets["atlas-reader.css"] + "\n" + assets["atlas-reveal.css"] + "\n" + EXTRA_CSS
    runtime = "\n".join(assets[name].replace("</script", "<\\/script") for name in ("atlas-gif.js", "atlas-reveal.js"))
    for path in sorted(directory.rglob("*.html")):
        source = path.read_text(encoding="utf-8")
        if 'id="pdf-source"' not in source:
            continue
        parsed = ReaderParser(source)
        manifest = json.loads(parsed.scripts["pdf-source"])
        manifest["runtimeAssets"] = assets["hashes"]
        for pattern, replacement in [
            (r'(<style id="reader-styles">).*?(</style>)', style),
            (r'(<script id="reader-runtime">).*?(</script>)', runtime),
            (r'(<script type="application/json" id="pdf-source">).*?(</script>)', json_script(manifest)),
        ]:
            source, count = re.subn(pattern, lambda match: match[1]+replacement+match[2], source, count=1, flags=re.S)
            if count != 1:
                raise ValueError(f"Reader has no unique refresh target: {path}")
        after = ReaderParser(source)
        before_images = [attrs.get("src") for tag, attrs in parsed.nodes if tag == "img"]
        after_images = [attrs.get("src") for tag, attrs in after.nodes if tag == "img"]
        if before_images != after_images or parsed.extracted != after.extracted or parsed.scripts["reader-config"] != after.scripts["reader-config"]:
            raise ValueError(f"Runtime-only refresh altered preserved source content: {path}")
        path.write_text(source, encoding="utf-8")
        changed[path.resolve()] = {"htmlSha256": sha256(source), "htmlBytes": len(source.encode("utf-8")), "runtimeAssets": assets["hashes"]}
    for path in directory.rglob("reading-editions.json"):
        data = json.loads(path.read_text())
        for record in data["documents"]:
            update = changed.get((path.parent/record["outputPath"]).resolve())
            if update:
                record.update(update)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n")
    print(json.dumps({"refreshedReaders": len(changed), "sourceArtworkAndTextUnchanged": True, "runtimeAssets": assets["hashes"]}))
    return 0


def batch(args, assets):
    groups = json.loads(args.batch_inventory.read_text())
    classifications = json.loads(args.classifications.read_text()) if args.classifications else []
    by_source = {(item["repository"].split("/")[-1], item["path"]): item for item in classifications}
    heads = json.loads(args.repository_heads.read_text()) if args.repository_heads else []
    pinned_commits = {item["repository"]["full_name"]: item["branch"]["commit"]["sha"] for item in heads}
    report = {"converterVersion": VERSION, "documents": [], "errors": []}
    for group in groups:
        repository = group["repo"]
        name = repository.split("/")[-1]
        if name.lower() == "encapsulatorp.github.io":
            continue
        repo_source, repo_output = args.source_root/name, args.output_root/name
        source_commit = group.get("commit_sha") or pinned_commits.get(repository)
        records = []
        for item in group["pdfs"]:
            source_path = safe_relative(item["path"])
            relative_output = str(PurePosixPath(source_path).with_suffix(".html"))
            output = repo_output/relative_output
            try:
                raw = (repo_source/source_path).read_bytes()
                if not args.verify_only:
                    result = convert(raw, output, assets, repository=repository, source_path=source_path,
                                     source_ref=source_commit or group.get("tree_sha"),
                                     source_object_type="commit" if source_commit else "tree",
                                     source_commit=source_commit, visibility=group.get("visibility"),
                                     expected_blob=item.get("sha"), classification=by_source.get((name, source_path)))
                else:
                    parsed = ReaderParser(output.read_text())
                    result = json.loads(parsed.scripts["pdf-source"])
                    result.pop("pages", None)
                validation = verify_reader(output, raw)
                result.update({"outputPath": relative_output, "validation": validation})
                if not validation["ok"]:
                    raise ValueError("; ".join(validation["errors"]))
                records.append(result)
                report["documents"].append({"repository": repository, "sourcePath": source_path,
                                            "outputPath": relative_output, "pages": result["pageCount"],
                                            "bytes": output.stat().st_size, "validation": validation})
                print(f"Converted and verified {name}/{source_path}: {result['pageCount']} complete pages", flush=True)
            except Exception as error:
                report["errors"].append({"repository": repository, "sourcePath": source_path, "error": str(error)})
        if records and not args.verify_only:
            repo_output.mkdir(parents=True, exist_ok=True)
            (repo_output/"reading-editions.json").write_text(json.dumps({"schemaVersion": 1, "repository": repository,
                "visibility": group.get("visibility"), "converterVersion": VERSION, "documents": records}, ensure_ascii=False, indent=2)+"\n")
    report["ok"] = not report["errors"]
    report["pageCount"] = sum(doc["pages"] for doc in report["documents"])
    args.output_root.mkdir(parents=True, exist_ok=True)
    (args.output_root/"conversion-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n")
    print(json.dumps({"ok": report["ok"], "documents": len(report["documents"]), "pages": report["pageCount"], "errors": report["errors"]}, ensure_ascii=False))
    return 0 if report["ok"] else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path)
    parser.add_argument("--git-source", nargs=2, metavar=("REPOSITORY", "REF:PATH"))
    parser.add_argument("--output", type=Path)
    parser.add_argument("--verify-reader", type=Path)
    parser.add_argument("--assets-root", type=Path, default=Path(__file__).resolve().parents[1]/"assets")
    parser.add_argument("--repository", default="local")
    parser.add_argument("--source-path")
    parser.add_argument("--source-ref")
    parser.add_argument("--source-object-type", choices=["commit", "tree", "blob"], help="Declare the kind of an externally verified immutable --source-ref")
    parser.add_argument("--status", choices=sorted(STATUSES-{"exact"}), default="reference")
    parser.add_argument("--title")
    parser.add_argument("--batch-inventory", type=Path)
    parser.add_argument("--classifications", type=Path)
    parser.add_argument("--repository-heads", type=Path, help="Optional verified branch metadata with immutable commit IDs")
    parser.add_argument("--source-root", type=Path)
    parser.add_argument("--output-root", type=Path)
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument("--refresh-root", type=Path, help="Refresh embedded runtime/CSS without re-exporting source pages")
    args = parser.parse_args()
    if args.refresh_root:
        return refresh_readers(args.refresh_root, load_assets(args.assets_root))
    if args.batch_inventory:
        if not args.source_root or not args.output_root:
            parser.error("Batch mode needs --source-root and --output-root")
        return batch(args, load_assets(args.assets_root) if not args.verify_only else None)
    if bool(args.source) == bool(args.git_source):
        parser.error("Choose exactly one --source or --git-source")
    if args.git_source:
        raw, source_path, source_ref, object_type = source_from_git(Path(args.git_source[0]), args.git_source[1])
    else:
        raw, source_path, source_ref, object_type = args.source.read_bytes(), args.source_path or args.source.name, args.source_ref, args.source_object_type
    if args.verify_reader:
        report = verify_reader(args.verify_reader, raw)
    else:
        if not args.output:
            parser.error("Conversion needs --output")
        convert(raw, args.output, load_assets(args.assets_root), repository=args.repository,
                source_path=source_path, source_ref=source_ref, source_object_type=object_type,
                source_commit=source_ref if object_type == "commit" else None,
                classification={"status": args.status, **({"title": args.title} if args.title else {})})
        report = verify_reader(args.output, raw)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
