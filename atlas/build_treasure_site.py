#!/usr/bin/env python3
"""Render the static proof-review board and searchable standalone-note library."""
import html
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
SITE = BASE.parent
esc = html.escape

# Visible HTML notation keeps nested powers and subscripts selectable.
# The complete TeX statements remain in the public board data and notes.
FORMULAS = {
    "critical-point": "f<sub>r</sub>(½) = r/4 &nbsp; · &nbsp; f′<sub>r</sub>(½) = 0",
    "finite-time-index": "λ<sub>a,N</sub> = (1/N) ∑<sub>j=0</sub><sup>N−1</sup> log|T′<sub>a</sub>(y<sub>j</sub><sup>a</sup>)|",
    "palindrome-parity": "P = q<sup>⌈n/2⌉</sup>/q<sup>n</sup> = q<sup>−⌊n/2⌋</sup>",
    "dyadic-exponent": "f(x) = ∑<sub>n≥0</sub> x<sup>2<sup>n</sup></sup>, &nbsp; |x| &lt; 1",
    "pi-proposition": "π, Z(p<sub>1</sub>), …, Z(p<sub>k</sub>)",
    "complex-input": "α<sub>0</sub> = iπ",
    "bernoulli-coefficient": "c<sub>2m+1</sub> = (−1)<sup>m+1</sup>2<sup>2m−1</sup>B<sub>2m</sub> / (2m+1)!",
    "continuum-symbol": "|ℝ<sup>5</sup>| = |ℝ<sup>6</sup>| = |ℂ<sup>3</sup>| = |ℝ| = 2<sup>ℵ<sub>0</sub></sup>",
    "prime-section": "G(N) = [z<sup>N</sup>]P<sub>N</sub>(z)<sup>2</sup> &nbsp; · &nbsp; U = (G+D)/2",
    "logistic-cycle": "x<sub>±</sub> = [r+1 ± √((r−3)(r+1))] / (2r)",
    "logistic-quarter-turn": "C<sub>*</sub><sup>2</sup> = −I &nbsp; · &nbsp; C<sub>*</sub><sup>4</sup> = I",
    "logistic-return-derivative": "(f<sup>∘4</sup> − id)′(p<sub>±</sub>) = 0",
    "cycle-lyapunov": "λ<sub>cycle</sub> = ½ log|d<sub>+</sub>d<sub>−</sub>| = 0",
    "fractional-exponential-averages": "Δλ<sub>N</sub> = μ<sub>mul,N</sub> log 6 − μ<sub>add,N</sub> log 3 + log(log 6 / log 3) − log 2",
    "dimension-cardinality": "dim<sub>ℝ</sub>(ℝ<sup>3</sup> × ℝ<sup>2</sup>) = 5 &nbsp; · &nbsp; dim<sub>ℝ</sub>(ℝ<sup>3</sup> ⊗<sub>ℝ</sub> ℝ<sup>2</sup>) = 6",
    "cubic-and-odd-step": "z<sup>3</sup> − 1 = (z−1)(z<sup>2</sup>+z+1)",
    "zeta-reduction": "Z(p) = 1 + exp(c<sub>p</sub>π<sup>p</sup>), &nbsp; c<sub>p</sub> ∈ ℚ<sub>&gt;0</sub>",
    "schanuel-independence": "π, Z(p<sub>1</sub>), …, Z(p<sub>k</sub>) &nbsp; algebraically independent over ℚ",
    "dyadic-remainder": "2<sup>−k</sup> − 4<sup>−k</sup>/6 ≤ R<sub>k</sub> ≤ 2<sup>−k</sup>",
    "palindrome-counting": "P = q<sup>−⌊n/2⌋</sup> &nbsp; · &nbsp; q = 4, n = 40 ⇒ P = 2<sup>−40</sup>",
    "tower-convergence": "|F′<sub>L</sub>(v)| ≤ q = 4e<sup>1/e−2</sup> &lt; 1",
    "tower-envelope": "v<sub>max</sub> = exp(W<sub>0</sub>(1/e)) &nbsp; · &nbsp; c<sub>peak</sub> = exp(1/v<sub>max</sub>)",
    "prime-polynomial-counts": "G = [z<sup>N</sup>]P<sub>N</sub><sup>2</sup> &nbsp; · &nbsp; T = [z<sup>2</sup>]P<sub>X+2</sub>(z)P<sub>X</sub>(z<sup>−1</sup>)",
    "surviving-cubic": "H(p<sub>±</sub>+h) − (p<sub>±</sub>+h) = −K<sub>±</sub>h<sup>3</sup> + O(h<sup>4</sup>)",
    "cubic-attraction-rate": "n h<sub>n</sub><sup>2</sup> → 1/(2K<sub>±</sub>)",
    "asymptotic-ratio": "R<sub>k</sub> / (ζ(k)−1) → 1",
    "defined-geometric-model": "Φ(θ,h) = (θ+ω mod 2π, g(h))",
}


def math_line(key):
    return f'<div class="math-expression">{FORMULAS[key]}</div>'


def replace_block(text, name, content):
    start, end = f"<!-- {name}_START -->", f"<!-- {name}_END -->"
    if text.count(start) != 1 or text.count(end) != 1:
        raise ValueError(f"Expected one complete {name} block")
    before, body = text.split(start, 1)
    _, after = body.split(end, 1)
    return before + start + "\n" + content + "\n      " + end + after


def links(slug):
    slug = esc(slug, quote=True)
    return (f'<a href="../atlas/proofs/{slug}.html">Proof · HTML <span aria-hidden="true">→</span></a>'
            f'<a href="../atlas/proofs/{slug}.md">Readable source</a>')


def render_audit(data):
    rows = []
    for i, row in enumerate(data["audit"], 1):
        kind = "extraction" if row["id"] == "dyadic-exponent" else "review"
        rows.append(f'''<tr id="audit-{esc(row['id'])}">
          <th scope="row"><span class="row-index">A{i:02}</span>{esc(row['title'])}<small>Earlier p. {row['old_page']} · illustrated p. {row['illustrated_page']}</small></th>
          <td data-label="Correct expression">{math_line(row['id'])}</td>
          <td data-label="Inspection finding"><span class="status {kind}">{esc(row['status_label'])}</span><p>{esc(row['finding'])}</p></td>
        </tr>''')
    return "\n".join(rows)


def render_statements(data):
    rows = []
    for i, row in enumerate(data["statements"], 1):
        label = "Conditional deduction" if row["status"] == "conditional" else "Exact statement"
        rows.append(f'''<tr id="statement-{esc(row['id'])}">
          <th scope="row"><span class="row-index">B{i:02}</span>{esc(row['title'])}<span class="status {esc(row['status'])}">{label}</span></th>
          <td data-label="Hypotheses"><p>{esc(row['domain'])}</p></td>
          <td data-label="Statement and argument"><p>{esc(row['statement'])}</p>{math_line(row['id'])}<details class="argument-detail"><summary>Argument and qualification</summary><p>{esc(row['qualification'])}</p><div class="inline-links">{links(row['proof_slug'])}</div></details></td>
        </tr>''')
    return "\n".join(rows)


def render_groups(data):
    cards = []
    for i, row in enumerate(data["groups"], 1):
        label = "Conditional · assumption required" if row["status"] == "conditional" else "Exact · written argument"
        cards.append(f'''<article class="verdict-card" id="board-{esc(row['id'])}">
          <div class="verdict-top"><span class="row-index">C{i:02}</span><span class="status {esc(row['status'])}">{label}</span></div>
          <h3>{esc(row['title'])}</h3><p class="verdict-statement">{esc(row['statement'])}</p>
          <dl><dt>Domain</dt><dd>{esc(row['domain'])}</dd><dt>Scope</dt><dd>{esc(row['qualification'])}</dd></dl>
          <div class="inline-links">{links(row['proof_slug'])}</div>
        </article>''')
    return "\n".join(cards)


def render_supplements(data):
    cards = []
    for i, row in enumerate(data["supplements"], 1):
        model = row["status"] == "definition"
        label = "Defined model · attraction proved" if model else "Later derivation · exact under its hypotheses"
        title = row["title"].removeprefix("Later addition: ")
        title = title[:1].upper() + title[1:]
        cards.append(f'''<article class="supplement-card" id="addition-{esc(row['id'])}">
          <span class="row-index">D{i:02}</span><span class="status {'model' if model else 'addition'}">{label}</span>
          <h3>{esc(title)}</h3><p>{esc(row['statement'])}</p>{math_line(row['id'])}
          <details class="argument-detail"><summary>Hypotheses and provenance</summary><p>{esc(row['domain'])}</p><p>{esc(row['qualification'])}</p><div class="inline-links">{links(row['proof_slug'])}</div></details>
        </article>''')
    return "\n".join(cards)


def render_library(manifest):
    cards = []
    aliases = {"palindrome-counting": "DNA alphabet biophysics strings forty 40",
               "dyadic-remainder": "Mahler lacunary series",
               "logistic-collapse-vanishing": "branes collapse transverse Hopf projection cubic stability rate"}
    for note in manifest["notes"]:
        search = " ".join((note["title"], note["summary"], note["nextStep"],
                           aliases.get(note["slug"], ""))).lower()
        cards.append(f'''<article class="proof-card" data-status="{esc(note['status'])}" data-kind="{esc(note['kind'])}" data-search="{esc(search, quote=True)}">
          <span class="status {esc(note['status'])}">{esc(note['statusLabel'])}</span>
          <h3>{esc(note['title'])}</h3><p>{esc(note['summary'])}</p>
          <p class="note-next"><strong>Next task</strong>{esc(note['nextStep'])}</p>
          <div class="proof-links"><a href="../{esc(note['html'])}">Read & export GIF →</a><a href="../{esc(note['markdown'])}">Readable source</a><span>{note['sectionCount']} sections</span></div>
        </article>''')
    return "\n".join(cards)


def main():
    manifest = json.loads((BASE / "proof-library.json").read_text())
    data = json.loads((BASE / "proof-board-data.json").read_text())
    page = SITE / "treasure-hunt" / "index.html"
    text = page.read_text()
    for name, rendered in [
        ("AUDIT_ROWS", render_audit(data)),
        ("STATEMENT_ROWS", render_statements(data)),
        ("PROOF_BOARD", render_groups(data)),
        ("SUPPLEMENTS", render_supplements(data)),
        ("PROOF_LIBRARY", render_library(manifest)),
    ]:
        text = replace_block(text, name, rendered)
    page.write_text(text)
    print(f"Rendered {len(data['audit'])} audit entries, {len(data['statements'])} statements, "
          f"{len(data['groups'])} verdicts, {len(data['supplements'])} later additions, "
          f"and {len(manifest['notes'])} standalone notes")


if __name__ == "__main__":
    main()
