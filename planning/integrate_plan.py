#!/usr/bin/env python3
"""Add Pirates Plan to a freshly fetched index. Local file changes only."""
import argparse
import hashlib
import json
import re
from pathlib import Path

START = "<!-- PIRATES PLAN:START -->"
END = "<!-- PIRATES PLAN:END -->"
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
    fragment = (root / "planning/room.html").read_text(encoding="utf-8").strip()
    if not fragment.startswith(START) or not fragment.endswith(END):
        raise ValueError("planning/room.html must be bounded by the Pirates Plan markers.")
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
    if 'data-tab="pirates-plan"' not in text:
        if nav == "primary":
            anchor = '<a href="#pirate-chest" data-tab="buried-chat-stories">† Pirate Chest</a>'
            if text.count(anchor) != 1:
                raise ValueError("Expected the current Pirate Chest primary link exactly once.")
            text = text.replace(anchor, anchor + link, 1)
        else:
            anchor = '<div class="tr-nav-menu">'
            if text.count(anchor) != 1:
                raise ValueError("Expected exactly one More paths menu.")
            text = text.replace(anchor, anchor + link, 1)
        actions.append("Added the Pirates Plan navigation link: " + nav)
    if '<option value="#pirates-plan">' not in text:
        anchor = '<option value="#pirate-chest">† Pirate Chest</option>'
        if text.count(anchor) != 1:
            raise ValueError("Expected the current Pirate Chest mobile option exactly once.")
        text = text.replace(anchor, anchor + '<option value="#pirates-plan">Pirates Plan</option>', 1)
        actions.append("Added the mobile room selector option")
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
    if 'href="assets/pirates-plan.css' not in text:
        if text.count("</head>") != 1:
            raise ValueError("Expected one closing head element.")
        text = text.replace("</head>", '<link rel="stylesheet" href="assets/pirates-plan.css?v=plan-20261121-r1">\n</head>', 1)
        actions.append("Added scoped stylesheet")
    scripts = []
    for asset in ("pirates-plan-data.js", "pirates-plan.js"):
        if 'src="assets/' + asset not in text:
            scripts.append('<script src="assets/' + asset + '?v=plan-20261121-r1"></script>')
    if scripts:
        if text.count("</body>") != 1:
            raise ValueError("Expected one closing body element.")
        text = text.replace("</body>", "\n".join(scripts) + "\n</body>", 1)
        actions.append("Added local data and enhancement scripts")
    if index.read_text(encoding="utf-8") != original:
        raise ValueError("The local index changed during integration. Re-run against the fresh file.")
    index.write_text(text, encoding="utf-8")
    return {"file": str(index), "before_sha256": before, "after_sha256": hashlib.sha256(text.encode()).hexdigest(),
            "changed": original != text, "actions": actions, "remote_changes": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--nav", choices=("primary", "more"), default="primary",
                        help="Primary tab follows Pirate Chest; more inserts the tab at the top of More paths.")
    parser.add_argument("--expected-sha256", help="Optional hash of the freshly fetched local index.")
    args = parser.parse_args()
    print(json.dumps(integrate(args.root.resolve(), args.nav, args.expected_sha256), indent=2))
