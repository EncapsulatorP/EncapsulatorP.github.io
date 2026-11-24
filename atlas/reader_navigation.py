"""Shared static navigation for the Atlas reading editions."""
from html import escape
from os.path import relpath
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOME = "index.html#home"
ATLAS_CONTENTS = "atlas/README.html#contents"

# Match both primary navigation controls on the homepage.
PRIMARY_ROUTES = (
    ("Home", HOME),
    ("Map", "map/"),
    ("Atlas", "index.html#atlas"),
    ("Treasure Hunt", "treasure-hunt/"),
    ("Evidence", "evidence/"),
)


def relative_url(target: Path, output: Path) -> str:
    return Path(relpath(target, output.parent)).as_posix()


def site_href(route: str, output: Path) -> str:
    path, separator, fragment = route.partition("#")
    href = relative_url(ROOT / path, output)
    if path.endswith("/"):
        href += "/"
    return href + separator + fragment


def primary_navigation(output: Path) -> str:
    links = "".join(f'<a href="{escape(site_href(route, output))}">{label}</a>'
                    for label, route in PRIMARY_ROUTES)
    return f'<nav class="reader-nav" data-reader-chrome aria-label="Primary">{links}</nav>'
