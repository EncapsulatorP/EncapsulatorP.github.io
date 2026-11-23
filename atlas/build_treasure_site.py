#!/usr/bin/env python3
"""Render the static, searchable proof shelf from the checked PDF manifest."""
import html
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
SITE = BASE.parent


def main():
    manifest = json.loads((BASE / 'proof-library.json').read_text())
    cards = []
    aliases = {'palindrome-counting': 'DNA alphabet biophysics strings forty 40',
               'dyadic-remainder': 'Mahler lacunary series',
               'logistic-collapse-vanishing': 'branes collapse transverse Hopf projection cubic stability'}
    for note in manifest['notes']:
        esc = html.escape
        search = ' '.join((note['title'], note['summary'], note['nextStep'],
                           aliases.get(note['slug'], ''))).lower()
        cards.append(f'''      <article class="proof-card" data-status="{esc(note['status'])}" data-kind="{esc(note['kind'])}" data-search="{esc(search, quote=True)}">
        <span class="status {esc(note['status'])}">{esc(note['statusLabel'])}</span>
        <h3>{esc(note['title'])}</h3>
        <p>{esc(note['summary'])}</p>
        <p class="note-next"><strong>Next treasure</strong>{esc(note['nextStep'])}</p>
        <div class="proof-links"><a href="../{esc(note['pdf'])}">Read the PDF ↗</a><a href="../{esc(note['markdown'])}">Text source</a><span>{note['pageCount']} pages</span></div>
      </article>''')
    page = SITE / 'treasure-hunt' / 'index.html'
    text = page.read_text()
    start, end = '<!-- PROOF_LIBRARY_START -->', '<!-- PROOF_LIBRARY_END -->'
    before, body = text.split(start, 1)
    _, after = body.split(end, 1)
    page.write_text(before + start + '\n' + '\n'.join(cards) + '\n      ' + end + after)
    print(f'Rendered {len(cards)} reading-note cards from proof-library.json')


if __name__ == '__main__':
    main()
