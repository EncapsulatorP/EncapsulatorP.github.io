#!/usr/bin/env python3
"""Add Pirates Plan to a freshly fetched index. Local file changes only."""
import argparse
import hashlib
import json
import re
from pathlib import Path

START = "<!-- PIRATES PLAN:START -->"
END = "<!-- PIRATES PLAN:END -->"
ASSET_VERSION = "plan-20261121-r3"
ALIASES = (
    "pirates-plan", "plan-timeline", "plan-routes", "repo-interlinks",
    "repo-register", "decision-targets", "plan-bridges",
)


def integrate(root: Path, nav: str, expected_sha256: str | None) -> dict:
    index = root / "index.html"
    original = index.read_text(encoding="utf-8")
    before = hashlib.sha256(original.encode()).hexdigest()
    if expected_sha256 and before != expected_sha256:
        raise ValueError("The local index differs from --expected-sha256. Re-read the fresh source before integrating.")
    room = (root / "planning/room.html").read_text(encoding="utf-8")
    if room.count(START) != 1 or room.count(END) != 1 or room.index(START) > room.index(END):
        raise ValueError("planning/room.html must contain one bounded Pirates Plan fragment.")
    fragment = room[room.index(START):room.index(END) + len(END)]
    fragment = fragment.replace('href="./', 'href="planning/').replace('href="../', 'href="')
    text = original
    actions = []
    if START in text or END in text:
        if text.count(START) != 1 or text.count(END) != 1:
            raise ValueError("Ambiguous Pirates Plan markers; review the index manually.")
        text = text[:text.index(START)] + fragment + text[text.index(END) + len(END):]
        actions.append("Replaced only the marked Pirates Plan room")
    else:
        if text.count("</main>") != 1:
            raise ValueError("Expected exactly one closing main element.")
        text = text.replace("</main>", fragment + "\n</main>", 1)
        actions.append("Added the planning room inside main")
    link = '<a href="#pirates-plan" data-tab="pirates-plan">Pirates Plan</a>'
    if text.count('data-tab="pirates-plan"') != text.count(link) or text.count(link) > 1:
        raise ValueError("Ambiguous Pirates Plan navigation link; review the index manually.")
    before_navigation = text
    shared_shell = 'src="assets/pq-wordmark.js' in text
    if not shared_shell:
        text = text.replace(link, "", 1)
        menus = list(re.finditer(r'<details class="tr-nav-more">[\s\S]*?</details>', text))
        if len(menus) != 1:
            raise ValueError("Expected exactly one More paths menu.")
        menu = menus[0].group(0)
        text = text[:menus[0].start()] + text[menus[0].end():]
        primary = list(re.finditer(r'<div class="tr-nav-primary">([\s\S]*?)</div>', text))
        if len(primary) != 1:
            raise ValueError("Expected exactly one primary navigation group.")
        if nav == "more":
            menu = menu.replace("</div></details>", link + "</div></details>", 1)
        replacement = '<div class="tr-nav-primary">' + primary[0].group(1) + menu
        replacement += (link if nav == "primary" else "") + "</div>"
        text = text[:primary[0].start()] + replacement + text[primary[0].end():]
        option = '<option value="#pirates-plan">Pirates Plan</option>'
        if text.count('<option value="#pirates-plan">') != text.count(option) or text.count(option) > 1:
            raise ValueError("Ambiguous Pirates Plan mobile option; review the index manually.")
        text = text.replace(option, "", 1)
        selectors = list(re.finditer(r'<select class="tr-mobile-nav" id="tr-all-rooms">[\s\S]*?</select>', text))
        if len(selectors) != 1:
            raise ValueError("Expected exactly one mobile room selector.")
        selector = selectors[0]
        text = text[:selector.start()] + selector.group(0).replace("</select>", option + "</select>", 1) + text[selector.end():]
        if text != before_navigation:
            actions.append("Placed Pirates Plan last in navigation and the mobile selector: " + nav)
    router = re.search(r"\bvar alias=\{([^\n]*)\};", text)
    if not router:
        raise ValueError("Cannot find the current hash-router alias map. Review its structure before integrating.")
    additions = []
    aliases_text = router.group(1)
    for alias in ALIASES:
        if not re.search(r"""['"]?""" + re.escape(alias) + r"""['"]?\s*:""", aliases_text):
            additions.append("'" + alias + "':'pirates-plan'")
    if additions:
        replacement = "var alias={" + ",".join(additions) + "," + aliases_text + "};"
        text = text[:router.start()] + replacement + text[router.end():]
        actions.append("Added planning room and subsection aliases")
    if not any(asset in text for asset in ('href="assets/pirates-plan.css', 'href="assets/home.css')):
        if text.count("</head>") != 1:
            raise ValueError("Expected one closing head element.")
        text = text.replace("</head>", '<link rel="stylesheet" href="assets/pirates-plan.css?v=' + ASSET_VERSION + '">\n</head>', 1)
        actions.append("Added scoped stylesheet")
    scripts = []
    for asset in ("pirates-plan-data.js", "pirates-plan.js"):
        if 'src="assets/' + asset not in text:
            scripts.append('<script src="assets/' + asset + '?v=' + ASSET_VERSION + '"></script>')
    if scripts:
        if text.count("</body>") != 1:
            raise ValueError("Expected one closing body element.")
        text = text.replace("</body>", "\n".join(scripts) + "\n</body>", 1)
        actions.append("Added local data and enhancement scripts")
    versioned = re.sub(
        r'((?:src|href)="assets/(?:pirates-plan\.css|pirates-plan(?:-data)?\.js))(?:\?[^\"]*)?(\")',
        lambda match: match.group(1) + '?v=' + ASSET_VERSION + match.group(2), text,
    )
    if versioned != text:
        text = versioned
        actions.append("Refreshed the three planning asset versions")
    if index.read_text(encoding="utf-8") != original:
        raise ValueError("The local index changed during integration. Re-run against the fresh file.")
    index.write_text(text, encoding="utf-8")
    return {"file": str(index), "before_sha256": before, "after_sha256": hashlib.sha256(text.encode()).hexdigest(),
            "changed": original != text, "actions": actions, "remote_changes": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--nav", choices=("primary", "more"), default="primary",
                        help="Primary places the tab last, after More paths; more places it last inside that menu.")
    parser.add_argument("--expected-sha256", help="Optional hash of the freshly fetched local index.")
    args = parser.parse_args()
    print(json.dumps(integrate(args.root.resolve(), args.nav, args.expected_sha256), indent=2))
