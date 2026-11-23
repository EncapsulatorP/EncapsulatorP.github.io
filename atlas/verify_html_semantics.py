#!/usr/bin/env python3
"""Independently verify the complete HTML migration against its frozen sources.

Run after build_html_atlas.py and build_proof_html.py:
    python3 atlas/verify_html_semantics.py
    python3 atlas/verify_html_semantics.py --output /tmp/html-semantics.json

The baseline comes from the reviewed preservation inventory at the commit below.
Its compact hashes are committed here; this gate has no external work-directory,
network, browser, PDF, renderer, or third-party dependency. It does not re-prove
the mathematical results. It checks that evidence labels and the full reviewed
source content survived, including valid counterexamples and conditional claims.
Only this site's delivery URLs may move from PDF to HTML. A newly added false
claim must live in traps.json and retain a separately readable exact correction.
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit, urlunsplit


# BASELINE_DATA is generated once from the reviewed preservation inventory.
# Updating a renderer must never update these hashes to make a failing gate pass.
BASELINE_DATA = {'commit': 'd308bcaee3cb9a2d8f6537d239630658ed1fff59',
 'catalog_metadata': '6f4334b6cecdb8641b598a7977b6ec872d5f757839bcf3b439604637b9ec530f',
 'status_counts': {'exact': 28, 'finite': 4, 'reported': 1, 'conjectural': 2, 'exploratory': 9, 'tooling': 2},
 'entries': {'omega-stability': {'original': '2ff2411babe2d868263c332ab05132076218350af07030bbc80cb1c209e2d5d7',
                                 'delivery_normalized': '2ff2411babe2d868263c332ab05132076218350af07030bbc80cb1c209e2d5d7'},
             'prime-layer-waves': {'original': '6714b8f8c914418670a899bbd7db175d6e54db10844b4de81b8310fd8b882c86',
                                   'delivery_normalized': '6714b8f8c914418670a899bbd7db175d6e54db10844b4de81b8310fd8b882c86'},
             'tower-envelope': {'original': 'b6ea97e161b5ad0ee05422f694c55cf7c1d2d86b9435410deab057068f84a4e2',
                                'delivery_normalized': 'b6ea97e161b5ad0ee05422f694c55cf7c1d2d86b9435410deab057068f84a4e2'},
             'alternating-tower-convergence': {'original': '83f60edc9ae263f11c294f38b60c59bfaa6ae20017056cf44d80d1b1a6714105',
                                               'delivery_normalized': '83f60edc9ae263f11c294f38b60c59bfaa6ae20017056cf44d80d1b1a6714105'},
             'logistic-quarter-turn': {'original': '4bde074dbdb3df2a6a4bf8700668cd1ab62a7ebde19cd0f0b7d6536cd17ace08',
                                       'delivery_normalized': '4bde074dbdb3df2a6a4bf8700668cd1ab62a7ebde19cd0f0b7d6536cd17ace08'},
             'beta-catalan-disk': {'original': 'a8d600464df08897ce80aeedfaec7d853609d5071426ec5a4142f84bce8fc98a',
                                   'delivery_normalized': 'a8d600464df08897ce80aeedfaec7d853609d5071426ec5a4142f84bce8fc98a'},
             'abel-orbit-signature': {'original': '47ffff0298e234a35f85a1cb1822978ab815a329a8c857834279599fa1466875',
                                      'delivery_normalized': '47ffff0298e234a35f85a1cb1822978ab815a329a8c857834279599fa1466875'},
             'critical-tower': {'original': '3c0d43a88a789471c1a6b716753d072c52f07da91bb35029777df5e1d8e575db',
                                'delivery_normalized': '3c0d43a88a789471c1a6b716753d072c52f07da91bb35029777df5e1d8e575db'},
             'phase-sophomore-dream': {'original': '0544e13a6cb3ab8fea54bb974b532d7295d2026a72f5e8716236cb812ac97d5c',
                                       'delivery_normalized': '0544e13a6cb3ab8fea54bb974b532d7295d2026a72f5e8716236cb812ac97d5c'},
             'xo-sector-algebra': {'original': 'ec38d80511fd11a798221be7657bb9cf18c71996bc27b52a8d4ae83d96ab5eeb',
                                   'delivery_normalized': 'ec38d80511fd11a798221be7657bb9cf18c71996bc27b52a8d4ae83d96ab5eeb'},
             'tower-hadamard': {'original': '9e8e521e570b121ee82104341a3f2d23b696cb7650cf239110eb500e4e17600e',
                                'delivery_normalized': '9e8e521e570b121ee82104341a3f2d23b696cb7650cf239110eb500e4e17600e'},
             'prime-pair-coordinates': {'original': '2633abe4034ad3bba41e85c38a91b0254fb6e834a73de0138becc0830c761059',
                                        'delivery_normalized': '2633abe4034ad3bba41e85c38a91b0254fb6e834a73de0138becc0830c761059'},
             'twin-mobius': {'original': 'd98dcf542d418309c7cf6ebfee31db95e6475e09544b8b9b4bba94b252ce6a16',
                             'delivery_normalized': 'd98dcf542d418309c7cf6ebfee31db95e6475e09544b8b9b4bba94b252ce6a16'},
             'prime-polynomial': {'original': 'fd69bb1656414399e060ff126a76e202f17dde37dac2700cb1e5232f893d9298',
                                  'delivery_normalized': 'fd69bb1656414399e060ff126a76e202f17dde37dac2700cb1e5232f893d9298'},
             'wheel-210': {'original': '1944dafffa81c2e153f023e27fac54ea23d1ed1699f42152502c206b86018115',
                           'delivery_normalized': '1944dafffa81c2e153f023e27fac54ea23d1ed1699f42152502c206b86018115'},
             'factorial-valuations': {'original': 'aad0e56880f3dae54aa2563c59cd54cc621576a44e5969a132ee999024f93b0f',
                                      'delivery_normalized': 'aad0e56880f3dae54aa2563c59cd54cc621576a44e5969a132ee999024f93b0f'},
             'euler-resolvent': {'original': '91e6bedf55f07d997206ca52e27d135e69109eda6853d47193a82b52c8efef96',
                                 'delivery_normalized': '91e6bedf55f07d997206ca52e27d135e69109eda6853d47193a82b52c8efef96'},
             'egyptian-factor-gate': {'original': 'a6f2d814e5e7e205332ca80a631e0169c8e908fd15027aaffaa8144998647d47',
                                      'delivery_normalized': 'a6f2d814e5e7e205332ca80a631e0169c8e908fd15027aaffaa8144998647d47'},
             'collatz-integer-spine': {'original': '39922438cf01a949782be2f79a989b28651c770751e724a1ede7663ade7df02b',
                                       'delivery_normalized': '39922438cf01a949782be2f79a989b28651c770751e724a1ede7663ade7df02b'},
             'paired-cancellation': {'original': '5a2baefd40088ae3318e3421a6ef790326f3b71a0124a4d8aed3e24a2b0b3aa5',
                                     'delivery_normalized': '5a2baefd40088ae3318e3421a6ef790326f3b71a0124a4d8aed3e24a2b0b3aa5'},
             'logarithmic-transport': {'original': '24ecd211b4deb95623753ade4ad1963dc564e941973da85cd4278cac6b6ecc59',
                                       'delivery_normalized': '24ecd211b4deb95623753ade4ad1963dc564e941973da85cd4278cac6b6ecc59'},
             'delay-geometry': {'original': '8af935bf6cf70a3646b46b74335b16af9cad8975993c42211ae10523448885fd',
                                'delivery_normalized': '8af935bf6cf70a3646b46b74335b16af9cad8975993c42211ae10523448885fd'},
             'exponential-closure': {'original': '6822dc6d4d6ac284966b2aa9047d1fca857656206a655b324678a25fcf4eed96',
                                     'delivery_normalized': '6822dc6d4d6ac284966b2aa9047d1fca857656206a655b324678a25fcf4eed96'},
             'zp-even-zeta': {'original': '048f4d7df2a61503b9c342c663bfbd3328f25366b571f82583e5af2ba366aa45',
                              'delivery_normalized': '048f4d7df2a61503b9c342c663bfbd3328f25366b571f82583e5af2ba366aa45'},
             'rolt-depth': {'original': '1e5924b7620ad4d171071105712773d68cb32060346b191fa5ec624c2c2c4857',
                            'delivery_normalized': '1e5924b7620ad4d171071105712773d68cb32060346b191fa5ec624c2c2c4857'},
             'slot-permutations': {'original': '23dc54c1c6d235f50e5879f95adc46c189b485d1c7045a1d1b42567cfb050bb4',
                                   'delivery_normalized': '23dc54c1c6d235f50e5879f95adc46c189b485d1c7045a1d1b42567cfb050bb4'},
             'goldbach-power-two-spine': {'original': 'b15c6fa82b6f315ed7be8e3bc1fa421f44aab904bd4f22eb9a726b80798158dc',
                                          'delivery_normalized': 'b15c6fa82b6f315ed7be8e3bc1fa421f44aab904bd4f22eb9a726b80798158dc'},
             'binary-repunit-flight': {'original': '5ddbf24f0b27509e434836d953d765d210f5cbdb39189dc7adccd4af2d526352',
                                       'delivery_normalized': '5ddbf24f0b27509e434836d953d765d210f5cbdb39189dc7adccd4af2d526352'},
             'brun-comparison': {'original': 'a369f3b9d65ba48897a8b9099d23b1d8397ee712d4e81655dd1a51e4298a63da',
                                 'delivery_normalized': 'a369f3b9d65ba48897a8b9099d23b1d8397ee712d4e81655dd1a51e4298a63da'},
             'theta-towers': {'original': '70537b0b29332871230b3f582bc544885503bd2dead4f41ea87c63f8ae2d2638',
                              'delivery_normalized': '70537b0b29332871230b3f582bc544885503bd2dead4f41ea87c63f8ae2d2638'},
             'totient-mobius-towers': {'original': '9f05f180574e9466f05e733e262acd572fc7b5f199ce3977772c40f9573a7605',
                                       'delivery_normalized': '9f05f180574e9466f05e733e262acd572fc7b5f199ce3977772c40f9573a7605'},
             'kesten-regimes': {'original': '58fd5b6f1cbc82c0f2cd867711e1d523b7d42448d004faccbe7ea26e293fbb28',
                                'delivery_normalized': '58fd5b6f1cbc82c0f2cd867711e1d523b7d42448d004faccbe7ea26e293fbb28'},
             'composite-vanishing': {'original': 'd16352198e327e56b65c1917dfdf4805f6a09148a269b91d1cc152e42bf323db',
                                     'delivery_normalized': 'd16352198e327e56b65c1917dfdf4805f6a09148a269b91d1cc152e42bf323db'},
             'determinant-towers': {'original': 'c732b025ee68bb487b76a210f0e75fbec0bb21f22e49014e184e1b1b54d61f8f',
                                    'delivery_normalized': 'c732b025ee68bb487b76a210f0e75fbec0bb21f22e49014e184e1b1b54d61f8f'},
             'padic-drift': {'original': '4040a13fd359bd30b3584de03b19bf992643c7cb1bd09f6e79390b3e801c5a8c',
                             'delivery_normalized': '4040a13fd359bd30b3584de03b19bf992643c7cb1bd09f6e79390b3e801c5a8c'},
             'fermat-paths': {'original': '72d2db3ac47382c95b6020a8a47808495cd041e45fcba2b50e3da8be1d9bbbed',
                              'delivery_normalized': '72d2db3ac47382c95b6020a8a47808495cd041e45fcba2b50e3da8be1d9bbbed'},
             'forced-collatzscape': {'original': 'fb510bbb8b6f15fff087351c76164e5a97e96ece00c9479b9da02518d9b8293d',
                                     'delivery_normalized': 'fb510bbb8b6f15fff087351c76164e5a97e96ece00c9479b9da02518d9b8293d'},
             'prime-sectors': {'original': 'ba3324abce9662b89f103e33035df2e54d249e3479fcd577fa13ff299d69c5dc',
                               'delivery_normalized': 'ba3324abce9662b89f103e33035df2e54d249e3479fcd577fa13ff299d69c5dc'},
             'zeta-branching': {'original': '4ad4189e23270bb77cb2b8c0ffd15c8b131a67650c9be3073abe490ecec39170',
                                'delivery_normalized': '4ad4189e23270bb77cb2b8c0ffd15c8b131a67650c9be3073abe490ecec39170'},
             'spectral-comparison': {'original': '9fb1a4dceb5dd22e11bf375819444108100fac87801c4630b9fd579f7a424d4c',
                                     'delivery_normalized': '9fb1a4dceb5dd22e11bf375819444108100fac87801c4630b9fd579f7a424d4c'},
             'logistic-distributions': {'original': 'c94e5d6c77ffde9be00bacf041f2c4f416e68c55a6debbfab560a77d1eb5091d',
                                        'delivery_normalized': 'c94e5d6c77ffde9be00bacf041f2c4f416e68c55a6debbfab560a77d1eb5091d'},
             'cm-grammars': {'original': 'a00d214183db4dd45af709cad5b5fbab70f8a53a511721ce65d62b6ad2ae6a33',
                             'delivery_normalized': 'a00d214183db4dd45af709cad5b5fbab70f8a53a511721ce65d62b6ad2ae6a33'},
             'representation-study': {'original': '675ed587f97e8dee973acb0d8f60595dc8d69bf431e5a6070a8506658909c900',
                                      'delivery_normalized': '675ed587f97e8dee973acb0d8f60595dc8d69bf431e5a6070a8506658909c900'},
             'prime-polarity': {'original': '449fa4876193df8204769507deaddd40e4201bf45709d8816ae4398b2df8bdd1',
                                'delivery_normalized': '449fa4876193df8204769507deaddd40e4201bf45709d8816ae4398b2df8bdd1'},
             'validatron': {'original': '856ade06bef6d03699e60129b3f0444a70fe702da6210b4726bcd70b0979ec4c',
                            'delivery_normalized': '856ade06bef6d03699e60129b3f0444a70fe702da6210b4726bcd70b0979ec4c'},
             'recaman-finite-gaps': {'original': '75807afdf1045c407fb5e58fbed11e74f8406ac29ec797e954134ab6fa90c4e6',
                                     'delivery_normalized': '75807afdf1045c407fb5e58fbed11e74f8406ac29ec797e954134ab6fa90c4e6'}},
 'structured_sources': {'atlas/logistic-vanishing-terms.json': 'f770b2544dcb7fd0e7dc5a17887ca381d5a0cafcc4b0cbdfdf5f18a2162a6198',
                        'atlas/logistic-collapse-vanishing.json': 'cf51009ae78690f3cc364540e689cef1af0ebcf70dfb5d7ba70e0b58d32da07d',
                        'atlas/proof-review-board.json': '62edbaa555407f559c8299e0b99e098f3ad47f59d60fee9020399f8ea35a8561',
                        'atlas/proofs/logistic-quarter-turn.json': '681fcbba06dcaa8a538772615c23b60025f17e26c34e5036ff21b46dd3c1886b',
                        'atlas/proofs/alternating-towers.json': '4135d15a343667a22dc69f8c0f5edf6e384c9ca56afc47960d34dc97730ea22f',
                        'atlas/proofs/dyadic-remainder.json': '762ae5c11881ce3b53b2ab004f72f794c07fde28c114bf85b4e3c2e4e3b72b63',
                        'atlas/proofs/prime-polynomial-counts.json': 'fb8e0a53af0a6ed0fb81c55a70a7944794da03b73469844f9d24c545b111b5d4',
                        'atlas/proofs/schanuel-zeta-family.json': 'bd9e5d1bd862a14cf4f3d821b6c41e35d174795a36cf5263a67f03e94f06c784',
                        'atlas/proofs/fractional-exponential-maps.json': '18eef52f0c78fdf8f4ebfce5c663df54b4ba07f2b1387087d7d5844db33df016',
                        'atlas/proofs/palindrome-counting.json': '1c4be3eb275cb89aaa2ccbbf399b8b7b07c6b2ecfd4bf1477588988fcaf87467',
                        'atlas/proofs/dimensions-and-fragments.json': '720b8c03ce2a3e711ee17e84319f05b6544e138415be70672ec434996238980e',
                        'atlas/proofs/proof-review.json': '28f09070ba225999316289acb8328765f7e9615a80953ee0f24f2af7a0be3db8',
                        'atlas/proofs/logistic-collapse-vanishing.json': 'cf51009ae78690f3cc364540e689cef1af0ebcf70dfb5d7ba70e0b58d32da07d'},
 'structured_outputs': {'atlas/logistic-vanishing-terms.html': 'atlas/logistic-vanishing-terms.json',
                        'atlas/logistic-collapse-vanishing.html': 'atlas/logistic-collapse-vanishing.json',
                        'atlas/proof-review-board.html': 'atlas/proof-review-board.json',
                        'atlas/treasure-hunt-guide.html': 'atlas/proof-review-board.json',
                        'atlas/proofs/logistic-quarter-turn.html': 'atlas/proofs/logistic-quarter-turn.json',
                        'atlas/proofs/alternating-towers.html': 'atlas/proofs/alternating-towers.json',
                        'atlas/proofs/dyadic-remainder.html': 'atlas/proofs/dyadic-remainder.json',
                        'atlas/proofs/prime-polynomial-counts.html': 'atlas/proofs/prime-polynomial-counts.json',
                        'atlas/proofs/schanuel-zeta-family.html': 'atlas/proofs/schanuel-zeta-family.json',
                        'atlas/proofs/fractional-exponential-maps.html': 'atlas/proofs/fractional-exponential-maps.json',
                        'atlas/proofs/palindrome-counting.html': 'atlas/proofs/palindrome-counting.json',
                        'atlas/proofs/dimensions-and-fragments.html': 'atlas/proofs/dimensions-and-fragments.json',
                        'atlas/proofs/proof-review.html': 'atlas/proofs/proof-review.json',
                        'atlas/proofs/logistic-collapse-vanishing.html': 'atlas/proofs/logistic-collapse-vanishing.json'},
 'proof_notes': {'logistic-quarter-turn': '11a637f00143356a0b2ec2bdb6923859111c59341c18a3a714d3e3c1f2c3335c',
                 'alternating-towers': '3c991a207f83f6a7296e8919a57e942525bf3076acca49b48ebbc66e88d6f2aa',
                 'dyadic-remainder': '05e407078380a92a6b6d2a213eace71789d7d9a9908a9ce631d4056a62909f3f',
                 'prime-polynomial-counts': '2a2fa3c152466f0e4497d4a75d34e38835d17579ea058d03c12cbfd68b4c0f2b',
                 'schanuel-zeta-family': '374c7ece9330670ea045606358df5b812103f80cfa7d915995b05120aa7f0900',
                 'fractional-exponential-maps': 'e63c1ed3fc2d4febfc26c4f60972d39268b442a9d522a41698b256bd14cea76e',
                 'palindrome-counting': '3a93ad8525fff62c4880cac97673997e8c74e4a75408f1f8fef7f9dee9c62057',
                 'dimensions-and-fragments': 'abc652be1d447d2f3d3ed899a72a0046a8ef1fab0c2c4510694aec0234749951',
                 'proof-review': 'a34330826458e166eb46f1dc7f5d17ed514dd082143d0326321d271e23c14722',
                 'logistic-collapse-vanishing': '25ad873cba21287c1001800e3b23cf806937d13c7019a95ddc5d1eb986fc52a3'}}
KINDS = {
    "exact": "treasure", "finite": "observation", "reported": "reported",
    "conjectural": "open-question", "exploratory": "exploration", "tooling": "tool",
}
EXPECTED_COUNTS = {"entries": 46, "exact": 28, "detail": 146, "sources": 96, "connections": 144}
SITE_HOSTS = {"encapsulatorp.github.io", "www.encapsulatorp.github.io"}
TRANSLATION_IDENTITY = {
    "engine": "core", "version": "0.4.0", "mirror_rate": 0.8,
    "wheel_sha256": "4389e91e55a97a977df4efc796a6e38706e3c15a323fb9d98dd2a58ef2696f0a",
}
CONTEXT_TAIL = re.compile(r"\s*⟦ctx:[^⟧]*⟧")
APPROVED_LOGO = "assets/logo-encapsulatorp-512.png"
APPROVED_LOGO_SHA256 = "9b28152f5f5f8e59f0b1a6e24e31cc8191ec46097a4ab5bbbb80d7441e194d27"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


def digest(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode()).hexdigest()


def delivery_url(url):
    """Normalize only local delivery routes, never external scholarly citations."""
    parsed = urlsplit(url)
    if parsed.hostname not in SITE_HOSTS and (parsed.hostname or parsed.scheme):
        return url
    path, fragment = parsed.path, parsed.fragment
    if path.endswith(".pdf"):
        path = path[:-4] + ".html"
    if path.endswith(".html") and re.fullmatch(r"page=\d+", fragment):
        fragment = "page-" + fragment.split("=", 1)[1]
    if path.endswith("/logistic-collapse-vanishing.html") and fragment == "page-6":
        fragment = "coefficient-decay"
    return urlunsplit((parsed.scheme, parsed.netloc, path, parsed.query, fragment))


def normalized_entry(entry):
    clone = json.loads(json.dumps(entry))
    for source in clone.get("sources", []):
        source["url"] = delivery_url(source["url"])
    return clone


def normalized_note(note):
    return {key: value for key, value in note.items()
            if key not in {"pdf", "html", "pageCount", "sectionCount"}}


@dataclass
class Node:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def find(self, *, tag=None, attr=None, value=None):
        return [node for node in self.walk()
                if (tag is None or node.tag == tag)
                and (attr is None or attr in node.attrs)
                and (value is None or node.attrs.get(attr) == value)]

    def text(self, *, scripts=False):
        if not scripts and self.tag in {"script", "style", "svg"}:
            return ""
        if self.tag == "br":
            return "\n"
        return "".join(child.text(scripts=scripts) if isinstance(child, Node) else child
                       for child in self.children)


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = Node("document")
        self.stack = [self.root]
        self.feed(text)
        self.close()

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs))
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def norm(value):
    return " ".join(str(value).split())


def plain(value):
    return Document(str(value)).root.text()


def canvas_text(value):
    """Readable text must preserve superscript and subscript meaning on canvas."""
    def read(node):
        if isinstance(node, str):
            return node
        if node.tag == "br":
            return "\n"
        inside = "".join(read(child) for child in node.children)
        if node.tag in {"sup", "super"}:
            return "^(" + inside + ")"
        if node.tag == "sub":
            return "_(" + inside + ")"
        return inside
    return read(Document(str(value)).root)


def matrix_latex(block):
    return (block.get("label", "") + r"\begin{pmatrix}" + r" \\ ".join(
        " & ".join(row) for row in block["cells"]) + r"\end{pmatrix}" + block.get("tail", ""))


def svg_signature(node):
    """Compare the actual equation artwork, ignoring only accessibility/ID prefixes."""
    attrs = {key: re.sub(r"math-[a-f0-9]{14}-", "", value or "") for key, value in node.attrs.items()
             if key not in {"class", "role", "aria-label"}}
    return [node.tag, attrs, [svg_signature(child) for child in node.children if isinstance(child, Node)]]


class Verifier:
    def __init__(self, root):
        self.root = root.resolve()
        self.errors = []
        self.checks = 0
        self.documents = {}
        self.verified_html = set()
        self.counts = {}
        self.configs = {}

    def check(self, condition, message):
        self.checks += 1
        if not condition:
            self.errors.append(message)
        return bool(condition)

    def read_json(self, relative):
        path = self.root / relative
        try:
            content = gzip.decompress(path.read_bytes()) if path.suffix == ".gz" else path.read_text(encoding="utf-8")
            return json.loads(content)
        except (OSError, ValueError, EOFError) as error:
            self.check(False, f"{relative}: cannot read JSON: {error}")
            return None

    def document(self, relative, *, verify=False):
        relative = Path(relative).as_posix()
        if relative not in self.documents:
            try:
                self.documents[relative] = Document((self.root / relative).read_text(encoding="utf-8")).root
            except OSError as error:
                self.check(False, f"{relative}: missing HTML: {error}")
                return None
        if verify:
            self.verified_html.add(relative)
        return self.documents[relative]

    def embedded(self, doc, identifier, context):
        nodes = doc.find(tag="script", attr="id", value=identifier)
        if not self.check(len(nodes) == 1, f"{context}: expected one script#{identifier}"):
            return None
        try:
            return json.loads(nodes[0].text(scripts=True))
        except ValueError as error:
            self.check(False, f"{context}: invalid script#{identifier}: {error}")
            return None

    def text_equal(self, node, value, context, *, markup=False):
        expected = plain(value) if markup else value
        self.check(norm(node.text()) == norm(expected), f"{context}: visible text changed or missing")

    def text_contains(self, node, value, context, *, markup=False):
        expected = plain(value) if markup else value
        self.check(norm(expected) in norm(node.text()), f"{context}: visible text changed or missing")

    def no_false_route(self, node, context):
        for element in node.walk():
            for attr in ("data-reader-kind", "data-source-status", "data-reader-status"):
                if element.attrs.get(attr) in {"trap", "false", "refuted"}:
                    self.check(False, f"{context}: original source incorrectly routed as {element.attrs[attr]}")

    def sources(self):
        catalog = self.read_json("atlas/catalog.json")
        if not catalog:
            return None
        entries = catalog.get("entries", [])
        expected = BASELINE_DATA["entries"]
        self.check([entry.get("id") for entry in entries] == list(expected),
                   "catalog.json: original 46 records changed order, disappeared, or gained replacements")
        self.check(digest({k: v for k, v in catalog.items() if k != "entries"}) == BASELINE_DATA["catalog_metadata"],
                   "catalog.json: edition, coverage, attribution, or other metadata changed")
        for entry in entries:
            eid = entry.get("id")
            baseline = expected.get(eid)
            if not self.check(baseline is not None, f"catalog.json: unknown entry {eid}"):
                continue
            self.check(digest(entry) == baseline["original"] or digest(normalized_entry(entry)) == baseline["delivery_normalized"],
                       f"catalog.json / {eid}: source record changed beyond permitted local PDF→HTML source URLs")
        counts = {"entries": len(entries), "exact": sum(e.get("status") == "exact" for e in entries)}
        counts.update({key: sum(len(e.get(key, [])) for e in entries) for key in ("detail", "sources", "connections")})
        self.counts["catalog"] = counts
        self.check(counts == EXPECTED_COUNTS, f"catalog.json: incorrect preservation totals: {counts}")
        self.check(dict(Counter(e.get("status") for e in entries)) == BASELINE_DATA["status_counts"],
                   "catalog.json: evidence distribution changed")
        for relative, expected_hash in BASELINE_DATA["structured_sources"].items():
            path = self.root / relative
            self.check(path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == expected_hash,
                       f"{relative}: preserved structured source bytes changed")
        library = self.read_json("atlas/proof-library.json")
        if library:
            notes = library.get("notes", [])
            self.check([n.get("slug") for n in notes] == list(BASELINE_DATA["proof_notes"]),
                       "proof-library.json: note identity or order changed")
            for note in notes:
                self.check(digest(normalized_note(note)) == BASELINE_DATA["proof_notes"].get(note.get("slug")),
                           f"proof-library.json / {note.get('slug')}: evidence, scope, sources, or provenance changed")
        return catalog

    def href_equal(self, actual, expected, context):
        self.check(actual == delivery_url(expected), f"{context}: href changed or still uses a local PDF route: {actual!r}")

    def catalogue_article(self, article, entry, relative):
        eid = entry["id"]
        context = f"{relative} / {eid}"
        self.check(article.attrs.get("id") == eid, f"{context}: missing entry anchor")
        self.check(article.attrs.get("data-source-status") == entry["status"], f"{context}: changed source status")
        self.check(article.attrs.get("data-reader-kind") == KINDS[entry["status"]], f"{context}: incorrect reader route")
        self.no_false_route(article, context)
        for field_name in ("title", "summary", "formula", "why", "origin", "next", "keyFormula"):
            if field_name not in entry:
                continue
            nodes = article.find(attr="data-catalog-field", value=field_name)
            if self.check(len(nodes) == 1, f"{context}: missing or repeated {field_name}"):
                self.text_equal(nodes[0], entry[field_name], f"{context} / {field_name}")
        for field_name in ("family", "promoted"):
            if field_name in entry:
                self.text_contains(article, entry[field_name], f"{context} / {field_name}")
        for key, marker in (("detail", "data-detail-index"), ("sources", "data-source-index"), ("connections", "data-connection-index")):
            nodes = article.find(attr=marker)
            self.check([n.attrs[marker] for n in nodes] == [str(i) for i in range(len(entry[key]))],
                       f"{context}: {key} missing, repeated, or reordered")
            for index, (node, value) in enumerate(zip(nodes, entry[key])):
                label = f"{context} / {key}[{index}]"
                if key == "detail":
                    self.text_equal(node, value, label)
                elif key == "sources":
                    self.text_equal(node, value["label"], label)
                    self.href_equal(node.attrs.get("href"), value["url"], label)
                else:
                    self.check(node.attrs.get("data-related-entry") == value, f"{label}: connection identity changed")
                    target, fragment = self.local_target(relative, node.attrs.get("href", ""))
                    self.check(target == f"atlas/entries/{value}.html" or
                               (target == "atlas/README.html" and fragment == value),
                               f"{label}: connection target changed")

    def catalog_html(self, catalog):
        entries = catalog["entries"]
        outputs = [("atlas/README.html", entries, catalog)]
        outputs.extend((f"atlas/entries/{entry['id']}.html", [entry], entry) for entry in entries)
        for relative, expected_entries, expected_source in outputs:
            doc = self.document(relative, verify=True)
            if doc is None:
                continue
            source = self.embedded(doc, "catalog-source", relative)
            if isinstance(source, dict) and set(source) == {"entries"} and len(expected_entries) == 1:
                source = source["entries"][0] if len(source["entries"]) == 1 else source
            self.check(source == expected_source, f"{relative}: embedded catalogue differs from its canonical source")
            articles = doc.find(tag="article", attr="data-entry-id")
            self.check([a.attrs["data-entry-id"] for a in articles] == [e["id"] for e in expected_entries],
                       f"{relative}: missing, repeated, or reordered complete entries")
            for article, entry in zip(articles, expected_entries):
                self.catalogue_article(article, entry, relative)
            self.no_false_route(doc, relative)
            config = self.embedded(doc, "reader-config", relative)
            if isinstance(config, dict):
                self.check(config.get("status") != "false", f"{relative}: original entry configured as a false claim")
                self.check(all(p.get("status") != "false" for p in config.get("passages", [])),
                           f"{relative}: original prose configured to dissolve as a false claim")
                self.passages(doc, config, relative)
                self.catalog_gif(config, expected_entries, catalog, relative)

    def passages(self, doc, config, relative):
        self.configs[relative] = config
        passages = config.get("passages", [])
        ids = [p.get("id") for p in passages]
        self.check(len(ids) == len(set(ids)), f"{relative}: repeated animation passage IDs")
        marked = doc.find(attr="data-passage-id")
        self.check(set(ids) == {node.attrs["data-passage-id"] for node in marked},
                   f"{relative}: animation passage mapping incomplete")
        for passage in passages:
            nodes = doc.find(attr="data-passage-id", value=passage.get("id"))
            if self.check(len(nodes) == 1, f"{relative} / {passage.get('id')}: passage missing or repeated"):
                self.text_equal(nodes[0], passage.get("english", ""), f"{relative} / {passage.get('id')}")

    def gif_text_coverage(self, config, values, relative):
        actual = Counter(norm(block.get("text", "")) for block in config.get("gifBlocks", []))
        required = Counter(norm(value) for value in values if str(value).strip())
        for value, count in required.items():
            self.check(actual[value] >= count, f"{relative}: GIF omits or changes source text ({value[:100]!r})")

    def catalog_gif(self, config, entries, catalog, relative):
        values = []
        by_id = {entry["id"]: entry for entry in catalog["entries"]}
        if relative == "atlas/README.html":
            values.extend([catalog["coverage"], catalog["attribution"]])
        for entry in entries:
            values.extend(entry[key] for key in ("title", "summary", "origin", "why", "next", "keyFormula", "promoted") if entry.get(key))
            # The canvas emits one original formula line per block so distinct
            # equations cannot run together when a long catalogue is paginated.
            values.extend(line for line in entry["formula"].splitlines() if line.strip())
            values.extend(entry["detail"])
            values.extend(source["label"] + "\n" + delivery_url(source["url"]) for source in entry["sources"])
            values.extend(by_id[eid]["title"] for eid in entry["connections"])
        self.gif_text_coverage(config, values, relative)

    def source_block(self, node, block, context):
        typ = block["type"]
        if typ in {"p", "h", "link"}:
            self.text_equal(node, block["text"], context, markup=True)
        elif typ == "callout":
            self.text_contains(node, block["text"], context, markup=True)
            self.text_contains(node, block.get("label", "Scope"), context + " / label", markup=True)
            if "status" in block:
                self.check(node.attrs.get("data-status") == block["status"], f"{context}: callout evidence label changed")
        elif typ in {"eq", "matrix"}:
            if typ == "eq":
                latex = block["latex"]
            else:
                latex = matrix_latex(block)
                cells = node.find(tag="td", attr="data-latex")
                self.check([cell.attrs["data-latex"] for cell in cells] == [cell for row in block["cells"] for cell in row],
                           f"{context}: matrix cells changed or missing")
            self.check(node.attrs.get("data-latex") == latex, f"{context}: exact LaTeX changed or missing")
            self.check(bool(node.find(tag="svg")), f"{context}: missing rendered mathematics")
            self.text_contains(node, latex, f"{context} / copyable exact formula")
        elif typ == "table":
            headers = [norm(n.text()) for n in node.find(tag="th")]
            cells = [norm(n.text()) for n in node.find(tag="td")]
            self.check(headers == [norm(plain(v)) for v in block["headers"]], f"{context}: table headers changed")
            self.check(cells == [norm(plain(v)) for row in block["rows"] for v in row], f"{context}: table cells changed")
            self.check(len(node.find(tag="tr")) == 1 + len(block["rows"]), f"{context}: table row structure changed")
        elif typ == "image":
            images = node.find(tag="img")
            if self.check(len(images) == 1, f"{context}: image missing or repeated"):
                self.check(images[0].attrs.get("alt") == block["alt"], f"{context}: image description changed")
            self.text_contains(node, block["alt"], context + " / visible image description")
        else:
            self.check(False, f"{context}: unverified source block type {typ}")
        expected_links = []
        if typ == "link":
            expected_links.append(block["url"])
        if typ == "image" and block.get("link_url"):
            expected_links.append(block["link_url"])
        for key in ("text", "label"):
            if key in block:
                inline_doc = Document(str(block[key])).root
                expected_links.extend(n.attrs["href"] for n in inline_doc.walk() if "href" in n.attrs)
        if expected_links:
            actual_links = [n.attrs["href"] for n in node.find(tag="a", attr="href")]
            self.check(actual_links == [delivery_url(url) for url in expected_links], f"{context}: source links changed or missing")

    def structured_html(self):
        totals = Counter()
        section_count = 0
        for relative, source_relative in BASELINE_DATA["structured_outputs"].items():
            source = self.read_json(source_relative)
            doc = self.document(relative, verify=True)
            if not source or doc is None:
                continue
            self.check(self.embedded(doc, "reader-source", relative) == source, f"{relative}: embedded structured source differs")
            mains = doc.find(tag="main", attr="data-source-document", value=source_relative)
            if not self.check(len(mains) == 1, f"{relative}: missing source-document provenance marker"):
                continue
            main = mains[0]
            self.no_false_route(main, relative)
            sections = main.find(tag="section", attr="data-source-page")
            pages = source["pages"]
            section_count += len(pages)
            self.check([n.attrs["data-source-page"] for n in sections] == [p["id"] for p in pages],
                       f"{relative}: source sections missing, repeated, or reordered")
            for index, (section, page) in enumerate(zip(sections, pages)):
                context = f"{relative} / {page['id']}"
                self.check(section.attrs.get("id") == page["id"] and section.attrs.get("data-source-index") == str(index),
                           f"{context}: section anchor or index changed")
                self.check(len(section.find(attr="id", value=f"page-{index + 1}")) == 1, f"{context}: missing legacy-page alias")
                self.text_contains(section, page["title"], context + " / title", markup=True)
                if page.get("kicker"):
                    self.text_contains(section, page["kicker"], context + " / kicker")
                blocks = section.find(attr="data-source-block")
                self.check([n.attrs["data-source-block"] for n in blocks] == [str(i) for i in range(len(page["blocks"]))],
                           f"{context}: source blocks missing, repeated, or reordered")
                for block_index, (node, block) in enumerate(zip(blocks, page["blocks"])):
                    label = f"{context} / block {block_index} ({block['type']})"
                    self.check(node.attrs.get("data-source-type") == block["type"], f"{label}: block type changed")
                    self.source_block(node, block, label)
                    totals[block["type"]] += 1
            config = self.embedded(doc, "reader-config", relative)
            if isinstance(config, dict):
                self.check(config.get("status") not in {"false", "refuted", "trap"}, f"{relative}: whole source configured as a trap")
                self.passages(doc, config, relative)
                self.structured_gif(doc, config, source, relative)
        self.counts["structured_outputs"] = len(BASELINE_DATA["structured_outputs"])
        self.counts["rendered_source_sections"] = section_count
        self.counts["rendered_source_blocks"] = dict(totals)

    def structured_gif(self, doc, config, source, relative):
        values = [canvas_text(source["title"])]
        if source.get("subtitle"):
            values.append(source["subtitle"])
        byline = " · ".join(str(source[key]) for key in ("author", "date") if source.get(key))
        if byline:
            values.append(byline)
        math_blocks = []
        figure_blocks = []
        for page in source["pages"]:
            values.append(canvas_text(page["title"]))
            if page.get("kicker"):
                values.append(page["kicker"])
            for index, block in enumerate(page["blocks"]):
                typ = block["type"]
                if typ in {"p", "h", "callout"}:
                    values.append(canvas_text(block["text"]))
                    if typ == "callout":
                        values.append(canvas_text(block.get("label", "Scope")))
                elif typ in {"eq", "matrix"}:
                    latex = block["latex"] if typ == "eq" else matrix_latex(block)
                    values.append(latex)
                    math_blocks.append((page["id"], index, latex, typ))
                elif typ == "table":
                    values.extend(" | ".join(canvas_text(cell) for cell in row)
                                  for row in [block["headers"], *block["rows"]])
                elif typ == "link":
                    values.append(plain(block["text"]) + ": " + delivery_url(block["url"]))
                elif typ == "image":
                    values.append(block["alt"])
                    figure_blocks.append((page["id"], index, block["alt"]))
        self.gif_text_coverage(config, values, relative)
        candidates = config.get("gifBlocks", [])
        for page_id, index, latex, typ in math_blocks:
            matching = [block for block in candidates if block.get("type") == "math" and block.get("text") == latex]
            context = f"{relative} / {page_id} / GIF block {index}"
            if not self.check(bool(matching), f"{context}: exact formula missing from GIF"):
                continue
            section = doc.find(attr="data-source-page", value=page_id)[0]
            source_node = section.find(attr="data-source-block", value=str(index))[0]
            image_node = self.gif_image(matching[0], relative, context)
            if image_node and typ == "eq":
                in_html = source_node.find(tag="svg")
                self.check(bool(in_html) and svg_signature(image_node) == svg_signature(in_html[0]),
                           f"{context}: GIF equation artwork differs from the complete HTML equation")
            elif image_node and typ == "matrix":
                html_shapes = Counter(n.attrs.get("d") for n in source_node.find(tag="path"))
                gif_shapes = Counter(n.attrs.get("d") for n in image_node.find(tag="path"))
                self.check(not (html_shapes - gif_shapes), f"{context}: GIF matrix drops cell, label, or tail artwork")
        for page_id, index, alt in figure_blocks:
            matching = [block for block in candidates if block.get("alt") == alt and block.get("image")]
            context = f"{relative} / {page_id} / GIF image {index}"
            if not self.check(bool(matching), f"{context}: source figure omitted from GIF"):
                continue
            section = doc.find(attr="data-source-page", value=page_id)[0]
            source_node = section.find(attr="data-source-block", value=str(index))[0]
            expected_image = source_node.find(tag="img")[0].attrs["src"]
            self.check(matching[0]["image"] == expected_image, f"{context}: GIF uses a different source figure")
            self.gif_image(matching[0], relative, context)

    def gif_image(self, block, relative, context):
        image = block.get("image", "")
        if not self.check(bool(image), f"{context}: rendered GIF mathematics/image missing"):
            return None
        self.check(all(isinstance(block.get(key), (int, float)) and block[key] > 0 for key in ("width", "height")),
                   f"{context}: GIF image dimensions missing or invalid")
        target, _ = self.local_target(relative, image)
        if target is None:
            self.check(False, f"{context}: GIF image is not available offline")
            return None
        path = self.root / target
        if not self.check(path.is_file(), f"{context}: missing GIF image asset {image}"):
            return None
        if path.suffix == ".svg":
            self.check(path.stem == hashlib.sha256(path.read_bytes()).hexdigest(), f"{context}: equation SVG content hash mismatch")
            nodes = Document(path.read_text()).root.find(tag="svg")
            if self.check(len(nodes) == 1, f"{context}: invalid or nested-viewport equation SVG"):
                return nodes[0]
        return None

    def traps(self, *, html):
        data = self.read_json("atlas/traps.json")
        if not data:
            return
        entries = data.get("entries", [])
        ids = [e.get("id") for e in entries]
        self.check(2 <= len(entries) <= 3 and len(ids) == len(set(ids)), "traps.json: expected 2–3 distinct false extensions")
        self.check(not (set(ids) & set(BASELINE_DATA["entries"])), "traps.json: original atlas entry incorrectly reclassified as a trap")
        for entry in entries:
            eid = entry.get("id")
            context = f"traps.json / {eid}"
            self.check(entry.get("kind") == "trap" and entry.get("status") == "refuted" and entry.get("correctionStatus") == "exact",
                       f"{context}: false claim and exact correction are not separately classified")
            for key in ("title", "claim", "correction", "proof", "formulas", "formulaText", "preservedFacts", "relatedEntries", "sources", "provenance"):
                self.check(bool(entry.get(key)), f"{context}: incomplete {key}")
            self.check(set(entry.get("relatedEntries", [])) <= set(BASELINE_DATA["entries"]), f"{context}: unknown related atlas entry")
            for source in entry.get("sources", []):
                self.check(bool(source.get("label")) and (self.root / source.get("path", "")).is_file(), f"{context}: missing cited source")
            if not html:
                continue
            relative = f"atlas/traps/{eid}.html"
            doc = self.document(relative, verify=True)
            if doc is None:
                continue
            articles = doc.find(tag="article", attr="data-trap-id", value=eid)
            if not self.check(len(articles) == 1, f"{relative}: false-claim scope marker missing"):
                continue
            article = articles[0]
            self.check(article.attrs.get("data-source-status") == "refuted" and article.attrs.get("data-reader-kind") == "trap",
                       f"{relative}: incorrect trap scope metadata")
            corrections = article.find(attr="data-trap-correction")
            if self.check(len(corrections) == 1, f"{relative}: independently readable correction missing"):
                correction = corrections[0]
                for key in ("correction", "proof", "preservedFacts", "formulaText"):
                    values = entry[key] if isinstance(entry[key], list) else [entry[key]]
                    for value in values:
                        self.text_contains(correction, value, f"{relative} / {key}")
                self.check(not correction.find(attr="data-passage-id"), f"{relative}: correction is included in dissolving claim animation")
            self.text_contains(article, entry["claim"], f"{relative} / original false claim")
            config = self.embedded(doc, "reader-config", relative)
            if isinstance(config, dict):
                self.check(config.get("status") == "false", f"{relative}: false claim has wrong animation status")
                self.passages(doc, config, relative)
                self.check(len(config.get("passages", [])) == 1 and config["passages"][0].get("english") == entry["claim"],
                           f"{relative}: animation scope must include only the false claim")
                correction_blocks = [block for block in config.get("gifBlocks", []) if block.get("role") == "correction"]
                self.check(bool(correction_blocks) and all(block.get("status") == "exact" and not block.get("passageId")
                                                           for block in correction_blocks),
                           f"{relative}: GIF correction must remain exact and outside the dissolving claim animation")
                self.gif_text_coverage(config, [entry["title"], entry["claim"], entry["correction"],
                                               *entry["proof"], *entry["preservedFacts"], *entry["formulaText"],
                                               *(source["label"] + "\n" + delivery_url(source.get("href", source["path"]))
                                                 for source in entry["sources"])], relative)
        self.counts["separate_false_claims"] = len(entries)

    def translations(self):
        cache_path = "atlas/zyntalic-passages.json.gz" if (self.root / "atlas/zyntalic-passages.json.gz").is_file() else "atlas/zyntalic-passages.json"
        cache = self.read_json(cache_path)
        if not cache:
            return
        metadata = cache.get("metadata", {})
        self.check(all(metadata.get(key) == value for key, value in TRANSLATION_IDENTITY.items()),
                   f"{cache_path}: pinned engine identity or wheel provenance changed")
        records = cache.get("records", {})
        used = set()
        total = 0
        for relative, config in self.configs.items():
            translation = config.get("translation", {})
            self.check(all(translation.get(key) == value for key, value in TRANSLATION_IDENTITY.items()),
                       f"{relative}: authentic translation provenance not attached")
            target, _ = self.local_target(relative, config.get("translationRecord", ""))
            self.check(target == cache_path, f"{relative}: wrong translation provenance link")
            passages = config.get("passages", [])
            gif_passages = [block for block in config.get("gifBlocks", []) if block.get("passageId")]
            self.check({block["passageId"] for block in gif_passages} == {p.get("id") for p in passages},
                       f"{relative}: eligible passage omitted from the GIF animation")
            by_id = {p.get("id"): p for p in passages}
            for block in gif_passages:
                passage = by_id.get(block["passageId"])
                self.check(passage is not None and block.get("sourceEnglish", block.get("text")) == passage.get("english"),
                           f"{relative} / {block['passageId']}: GIF translation source differs from preserved English")
            for passage in passages:
                total += 1
                context = f"{relative} / {passage.get('id')}"
                english = passage.get("english", "")
                key = hashlib.sha256(english.encode()).hexdigest()
                self.check(bool(english.strip()), f"{context}: empty English passage")
                self.check(isinstance(passage.get("zyntalic"), str) and bool(passage["zyntalic"].strip()),
                           f"{context}: exact eligible or trap passage has no Zyntalic translation")
                self.check(passage.get("sourceSha256") == key, f"{context}: attached English source hash mismatch")
                record = records.get(key)
                if not self.check(isinstance(record, dict), f"{context}: missing authentic translation record"):
                    continue
                self.check(record.get("english") == english and record.get("source_sha256") == key,
                           f"{context}: cached translation belongs to different English")
                self.check(passage.get("zyntalic") == record.get("zyntalic"), f"{context}: attached translation differs from engine record")
                if key in used:
                    continue
                used.add(key)
                full = record.get("full_target", "")
                rows = record.get("rows", [])
                self.check(isinstance(full, str) and bool(full.strip()), f"{context}: missing full engine target")
                self.check(CONTEXT_TAIL.sub("", full).strip() == record.get("zyntalic"),
                           f"{context}: display translation changed beyond documented context-tail omission")
                self.check(CONTEXT_TAIL.findall(full) == record.get("context_tails"), f"{context}: context-tail provenance lost")
                self.check(bool(rows) and all(isinstance(row, dict) and row.get("engine") == "core"
                                             and isinstance(row.get("sidecar"), dict) for row in rows)
                           and record.get("actual_engines") == ["core"], f"{context}: real core engine rows/sidecars missing")
                self.check("\n".join(row.get("target", "") for row in rows) == full, f"{context}: stored engine targets changed")
                self.check(norm(" ".join(row.get("source", "") for row in rows)) == norm(english),
                           f"{context}: engine input rows do not cover the complete English passage")
        self.counts["translated_passages"] = total
        self.counts["unique_active_translations"] = len(used)

    def live_pdf_routes(self):
        """Read href attributes only; embedded JSON/archival prose is not a link."""
        count = 0
        for path in sorted(self.root.rglob("*.html")):
            relative = path.relative_to(self.root)
            if any(part in {".git", "node_modules", ".venv", "venv"} for part in relative.parts):
                continue
            doc = self.document(relative.as_posix())
            if doc is None:
                continue
            count += 1
            for node in doc.find(attr="href"):
                href = node.attrs["href"] or ""
                parsed = urlsplit(href)
                if parsed.hostname in SITE_HOSTS or not parsed.netloc:
                    self.check(not unquote(parsed.path).lower().endswith(".pdf"),
                               f"{relative}: live first-party PDF href remains: {href}")
        self.counts["live_html_pdf_route_scan"] = count

    def legacy_pdf_routes(self):
        """Old citations must land on their exact surviving section, not an index.

        The frozen main branch contained 14 PDF paths. The canonical top-level
        logistic-collapse route is an additional historical alias. Neither this
        delivery check nor its aliases alter the mathematical content baseline.
        """
        relative = "404.html"
        doc = self.document(relative)
        if doc is None:
            return
        marked = doc.find(tag="script", attr="id", value="legacy-pdf-routes")
        routes = None
        try:
            if marked:
                routes = json.loads(marked[0].text(scripts=True))
            else:
                scripts = "\n".join(node.text(scripts=True) for node in doc.find(tag="script"))
                declaration = re.search(r"\b(?:var|let|const)\s+routes\s*=\s*(\{)", scripts)
                if declaration:
                    routes, _ = json.JSONDecoder().raw_decode(scripts[declaration.start(1):])
        except ValueError as error:
            self.check(False, f"404.html: invalid legacy PDF route data: {error}")
            return
        if not self.check(isinstance(routes, dict), "404.html: missing explicit legacy PDF route whitelist"):
            return
        expected = {
            "/atlas/README.pdf": {
                "to": "/atlas/README.html",
                "pages": {**{str(i): "contents" for i in range(1, 5)},
                          **{str(i + 5): eid for i, eid in enumerate(BASELINE_DATA["entries"])}}
            }
        }
        for output, source_path in BASELINE_DATA["structured_outputs"].items():
            source = self.read_json(source_path)
            if source:
                expected["/" + str(Path(output).with_suffix(".pdf"))] = {
                    "to": "/" + output,
                    "pages": {str(i + 1): page["id"] for i, page in enumerate(source["pages"])}
                }
        for old_path, required in expected.items():
            route = routes.get(old_path)
            if not self.check(isinstance(route, dict), f"404.html: missing legacy PDF route {old_path}"):
                continue
            self.check(route.get("to") == required["to"], f"404.html: legacy PDF route changed destination: {old_path}")
            self.check(route.get("pages") == required["pages"], f"404.html: legacy PDF page-to-section mapping changed: {old_path}")
            destination = self.document(required["to"].lstrip("/"))
            if destination:
                ids = {node.attrs["id"] for node in destination.find(attr="id")}
                self.check(set(required["pages"].values()) <= ids,
                           f"404.html: {old_path} points to missing section anchors")
        self.counts["baseline_legacy_pdf_routes"] = 14
        self.counts["additional_canonical_pdf_aliases"] = 1
        self.counts["legacy_pdf_page_destinations"] = sum(len(route["pages"]) for route in expected.values())

    def full_reveal_contract(self):
        """Check boot/provenance inputs; runtime tests verify timing and pixels."""
        logo = self.root / APPROVED_LOGO
        self.check(logo.is_file() and hashlib.sha256(logo.read_bytes()).hexdigest() == APPROVED_LOGO_SHA256,
                   "The approved EncapsulatorP logo was changed or removed")
        for relative, config in self.configs.items():
            target, _ = self.local_target(relative, config.get("logoSrc", ""))
            self.check(target == APPROVED_LOGO, f"{relative}: GIF export lacks the approved actual logo")
            doc = self.documents[relative]
            heads = doc.find(tag="head")
            if not self.check(len(heads) == 1, f"{relative}: missing head for pre-paint masking"):
                continue
            boot = "\n".join(node.text(scripts=True) for node in heads[0].find(tag="script") if not node.attrs.get("src"))
            styles = "\n".join(node.text(scripts=True) for node in heads[0].find(tag="style"))
            self.check("ar-reveal-pending" in boot and "ar-reveal-pending" in styles,
                       f"{relative}: full-text reveal has no head-time pending cloak; English can flash before boot")
            self.check("prefers-reduced-motion" in boot and "setTimeout" in boot,
                       f"{relative}: pre-paint cloak lacks reduced-motion handling or fail-open recovery")
        self.counts["readers_with_full_reveal_contract"] = len(self.configs)

    def local_target(self, relative, href):
        parsed = urlsplit(href)
        if parsed.hostname and parsed.hostname not in SITE_HOSTS:
            return None, None
        if parsed.scheme and parsed.scheme not in {"http", "https"}:
            return None, None
        path = unquote(parsed.path)
        if not path:
            target = self.root / relative
        elif path.startswith("/"):
            target = self.root / path.lstrip("/")
        else:
            target = self.root / Path(relative).parent / path
        target = target.resolve()
        if target.is_dir():
            target = target / "index.html"
        try:
            return target.relative_to(self.root).as_posix(), unquote(parsed.fragment)
        except ValueError:
            return None, None

    def links(self):
        total = 0
        for relative in sorted(self.verified_html):
            doc = self.documents[relative]
            ids = [n.attrs["id"] for n in doc.find(attr="id")]
            duplicate_ids = [value for value, count in Counter(ids).items() if count > 1]
            self.check(not duplicate_ids, f"{relative}: duplicate HTML IDs: {duplicate_ids[:5]}")
            for node in doc.walk():
                attr = "href" if node.tag in {"a", "link"} else "src" if node.tag in {"img", "script"} else None
                if not attr or not node.attrs.get(attr):
                    continue
                href = node.attrs[attr]
                target, fragment = self.local_target(relative, href)
                if target is None:
                    continue
                total += 1
                path = self.root / target
                if not self.check(path.is_file(), f"{relative}: broken local {attr} {href!r}"):
                    continue
                if node.tag == "a" and target.endswith(".pdf"):
                    self.check(False, f"{relative}: reading link still targets a local PDF: {href}")
                if fragment and target.endswith(".html"):
                    linked_doc = self.document(target)
                    if linked_doc:
                        fragment_base = fragment.split("?", 1)[0]
                        anchors = {n.attrs["id"] for n in linked_doc.find(attr="id")}
                        app_routes = {n.attrs["data-page"] for n in linked_doc.find(attr="data-page")}
                        self.check(fragment in anchors or fragment_base in anchors or fragment_base in app_routes,
                                   f"{relative}: broken fragment {href!r}")
        self.counts["local_links_and_assets"] = total

    def run(self, *, sources_only=False):
        catalog = self.sources()
        self.traps(html=not sources_only)
        if not sources_only and catalog:
            self.catalog_html(catalog)
            self.structured_html()
            self.translations()
            self.live_pdf_routes()
            self.legacy_pdf_routes()
            self.full_reveal_contract()
            self.links()
        return {
            "ok": not self.errors, "baseline_commit": BASELINE_DATA["commit"],
            "scope": "source preservation" if sources_only else "source and complete rendered HTML preservation",
            "checks": self.checks, "counts": self.counts,
            "verified_html_documents": len(self.verified_html), "errors": self.errors,
            "qualification": "Preserves reviewed labels and source meaning; does not independently certify or re-prove every mathematical statement.",
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1], help="Repository root (default: this checkout)")
    parser.add_argument("--sources-only", action="store_true", help="Check frozen sources and trap scope before rendering")
    parser.add_argument("--output", type=Path, help="Write the full machine-readable JSON report")
    args = parser.parse_args()
    report = Verifier(args.root).run(sources_only=args.sources_only)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"HTML semantic preservation: {'PASS' if report['ok'] else 'FAIL'} ({report['checks']} checks)")
    print(json.dumps(report["counts"], ensure_ascii=False, sort_keys=True))
    for error in report["errors"][:30]:
        print(f"  - {error}", file=sys.stderr)
    if len(report["errors"]) > 30:
        print(f"  ... {len(report['errors']) - 30} more; use --output for the full report", file=sys.stderr)
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
